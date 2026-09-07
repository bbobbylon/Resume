import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, PLATFORM_ID, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommandPaletteService } from '../../services/command-palette';
import { ProjectService } from '../../services/project.service';
import { ThemeService } from '../../services/theme';
import { SearchIcon } from '../icons/search';

/**
 * One row of the palette. Pages, projects and actions are all flattened to this
 * shape so the list, the filter and the keyboard handler never branch on kind.
 */
interface PaletteItem {
  /** Stable key for `@for` tracking, and the basis of each row's DOM id for `aria-activedescendant`. */
  id: string;
  /** The bold left-hand text, and the primary thing the substring filter matches. */
  label: string;
  /** The dimmer right-hand text; also matched by the filter, so "resume" finds a project by its tagline. */
  hint: string;
  /** What Enter or a click does — navigate, or run an action. Closing the palette is the caller's job. */
  run: () => void;
}

/**
 * Global Ctrl+K / Cmd+K overlay: substring search across the app's pages, the
 * project catalogue ({@link ProjectService}) and the theme toggle. Mounted once at
 * the root (`App`) so the shortcut works from any route; `CommandPaletteTrigger`
 * buttons in the nav and Dossier's aside open the same shared
 * {@link CommandPaletteService} state.
 *
 * Keyboard model follows the ARIA combobox/listbox pattern: the search input is
 * the only focusable element in the dialog (`aria-activedescendant` tracks the
 * highlighted option instead of moving real focus), so trapping focus is just
 * swallowing Tab — there is nowhere else inside the dialog to go.
 */
@Component({
  selector: 'app-command-palette',
  imports: [SearchIcon],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.css',
})
export class CommandPalette {
  /** The shared open/closed signal; this component renders off it, the trigger button sets it. */
  protected readonly palette = inject(CommandPaletteService);
  /** Used by the navigation items' `run` callbacks. */
  private readonly router = inject(Router);
  /** The live catalogue, so a newly added project appears in search with no change here. */
  private readonly projects = inject(ProjectService).projects;
  /** Backs the "Toggle theme" action. */
  private readonly theme = inject(ThemeService);
  /** For locking body scroll while open and for tracking/restoring focus. */
  private readonly doc = inject(DOCUMENT);
  /** Guards the DOM effects below; during prerendering the palette is closed and inert. */
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  /** What the visitor has typed; reset to empty every time the palette opens. */
  protected readonly query = signal('');
  /** Index into {@link filtered} of the highlighted row — the keyboard's cursor. */
  protected readonly activeIndex = signal(0);
  /** DOM id of the `listbox`, referenced by the input's `aria-controls`. */
  protected readonly listId = 'command-palette-list';

  /** The search field — the only focusable element inside the dialog, which is what makes the focus trap trivial. */
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  /** Whatever had focus before opening, so closing puts it back where the visitor left it. */
  private lastFocused: HTMLElement | null = null;

  /**
   * Everything searchable, in display order: static pages, then one row per project
   * from the live catalogue, then actions. Rebuilt whenever the catalogue arrives.
   */
  private readonly items = computed<PaletteItem[]>(() => {
    const pages: PaletteItem[] = [
      { id: 'page-home', label: 'Home', hint: 'Landing page', run: () => void this.router.navigate(['/']) },
      { id: 'page-resume', label: 'Resume', hint: 'In-app resume + PDF', run: () => void this.router.navigate(['/resume']) },
    ];
    const projects: PaletteItem[] = (this.projects() ?? []).map((p) => ({
      id: `project-${p.id}`,
      label: p.name,
      hint: p.tagline,
      run: () => void this.router.navigate(['/projects', p.id]),
    }));
    const actions: PaletteItem[] = [
      { id: 'action-theme', label: 'Toggle theme', hint: 'Switch between dark and light', run: () => this.theme.toggle() },
    ];
    return [...pages, ...projects, ...actions];
  });

  /**
   * {@link items} narrowed by a case-insensitive substring of the query against both
   * label and hint. Substring rather than fuzzy matching on purpose: with a list this
   * short, fuzzy matching mostly produces surprising hits.
   */
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.items();
    if (!q) return all;
    return all.filter((i) => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q));
  });

  /**
   * The DOM id of the highlighted row, for `aria-activedescendant`. That is how a
   * screen reader follows the arrow keys while real focus never leaves the input.
   */
  protected readonly activeId = computed(() => {
    const item = this.filtered()[this.activeIndex()];
    return item ? `cp-opt-${item.id}` : null;
  });

  constructor() {
    // A shorter, freshly-filtered list must never leave the highlight past its end.
    effect(() => {
      this.filtered();
      this.activeIndex.set(0);
    });

    effect(() => {
      const isOpen = this.palette.open();
      if (!this.browser) return;
      this.doc.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        this.lastFocused = this.doc.activeElement as HTMLElement;
        this.query.set('');
        this.activeIndex.set(0);
        queueMicrotask(() => this.searchInput()?.nativeElement.focus());
      } else {
        this.lastFocused?.focus();
        this.lastFocused = null;
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  /**
   * The global shortcut and the palette's own key handling, in one document-level
   * listener. Ctrl+K / Cmd+K toggles from anywhere; the rest only applies while open.
   *
   * @param e the keydown; `preventDefault` is called for every key handled here so
   *          the browser's own Ctrl+K (search bar) and Tab do not also fire
   */
  protected onKeydown(e: KeyboardEvent): void {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.palette.toggle();
      return;
    }
    if (!this.palette.open()) return;
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.palette.hide();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.move(-1);
        break;
      case 'Enter':
        e.preventDefault();
        this.select(this.activeIndex());
        break;
      case 'Tab':
        // The search input is the only focusable element in the dialog; swallowing
        // Tab is the whole focus trap.
        e.preventDefault();
        break;
    }
  }

  /**
   * Closes on a click that landed on the backdrop itself, not inside the panel.
   *
   * @param e the click; the target/currentTarget comparison is what distinguishes the two
   */
  protected onBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.palette.hide();
  }

  /**
   * Mirrors the search field into {@link query}.
   *
   * @param e the input event from the search field
   */
  protected onInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }

  /**
   * Runs the item at this index and closes. Ignores an index the current filter no
   * longer has, which is what makes an Enter arriving mid-retype harmless.
   *
   * @param index position in {@link filtered}
   */
  protected select(index: number): void {
    const item = this.filtered()[index];
    if (!item) return;
    item.run();
    this.palette.hide();
  }

  /**
   * Moves the highlight, wrapping at both ends so ArrowUp from the first row lands on
   * the last.
   *
   * @param delta +1 for down, -1 for up
   */
  private move(delta: number): void {
    const len = this.filtered().length;
    if (!len) return;
    this.activeIndex.update((i) => (i + delta + len) % len);
  }
}
