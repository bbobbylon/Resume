import { Component, inject } from '@angular/core';
import { CommandPaletteService } from '../../services/command-palette';
import { SearchIcon } from '../icons/search';

/**
 * Icon-button trigger for {@link CommandPalette}, sized to match `ThemeToggle` so
 * the two sit together in the nav bar and Dossier's aside header. The palette also
 * opens directly from anywhere via Ctrl+K / Cmd+K; this button exists so that
 * shortcut is discoverable instead of hidden.
 */
@Component({
  selector: 'app-command-palette-trigger',
  imports: [SearchIcon],
  template: `
    <button type="button" class="palette-btn" aria-label="Search (Ctrl+K)" title="Search (Ctrl+K)" (click)="palette.show()">
      <app-search-icon [size]="15" />
      <span class="hint" aria-hidden="true">⌘K</span>
    </button>
  `,
  styles: `
    :host { display: inline-flex; }
    .palette-btn {
      display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 10px;
      border: 1px solid var(--color-divider); border-radius: var(--radius-sm);
      background: transparent; color: var(--color-neutral-400); cursor: pointer; font-size: 12px;
    }
    .palette-btn:hover { color: var(--color-accent); border-color: var(--color-accent); }
    .hint {
      font-size: 11px; padding: 1px 5px; border-radius: 4px; border: 1px solid var(--color-divider);
      color: var(--color-neutral-500); letter-spacing: 0.02em;
    }
    @media (max-width: 480px) { .hint { display: none; } .palette-btn { padding: 0; width: 34px; justify-content: center; } }
  `,
})
export class CommandPaletteTrigger {
  protected readonly palette = inject(CommandPaletteService);
}
