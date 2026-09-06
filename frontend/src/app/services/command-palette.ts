import { Injectable, signal } from '@angular/core';

/**
 * Open/closed state for the global command palette overlay ({@link CommandPalette}),
 * shared with every trigger button ({@link CommandPaletteTrigger}) that can open
 * it — the nav bar's and Dossier's aside header both mount one. A plain service
 * (rather than component state) so a trigger anywhere in the tree and the Ctrl+K /
 * Cmd+K shortcut both drive the same overlay.
 */
@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  readonly open = signal(false);

  show(): void {
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }

  toggle(): void {
    this.open.update((v) => !v);
  }
}
