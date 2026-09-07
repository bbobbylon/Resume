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
  /**
   * Whether the overlay is showing. The whole service is this one signal: the
   * overlay (`CommandPalette`) renders off it and the trigger button
   * (`CommandPaletteTrigger`) sets it, without either importing the other.
   */
  readonly open = signal(false);

  /** Open the palette. */
  show(): void {
    this.open.set(true);
  }

  /** Close the palette. */
  hide(): void {
    this.open.set(false);
  }

  /** Flip it — what the Ctrl+K / Cmd+K handler calls. */
  toggle(): void {
    this.open.update((v) => !v);
  }
}
