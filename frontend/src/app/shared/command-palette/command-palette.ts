import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, PLATFORM_ID, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommandPaletteService } from '../../services/command-palette';
import { ProjectService } from '../../services/project.service';
import { ThemeService } from '../../services/theme';
import { SearchIcon } from '../icons/search';

interface PaletteItem {
  id: string;
  label: string;
  hint: string;
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
  protected readonly palette = inject(CommandPaletteService);
  private readonly router = inject(Router);
  private readonly projects = inject(ProjectService).projects;
  private readonly theme = inject(ThemeService);
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);
  protected readonly listId = 'command-palette-list';

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private lastFocused: HTMLElement | null = null;

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

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.items();
    if (!q) return all;
    return all.filter((i) => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q));
  });

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

  protected onBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.palette.hide();
  }

  protected onInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }

  protected select(index: number): void {
    const item = this.filtered()[index];
    if (!item) return;
    item.run();
    this.palette.hide();
  }

  private move(delta: number): void {
    const len = this.filtered().length;
    if (!len) return;
    this.activeIndex.update((i) => (i + delta + len) % len);
  }
}
