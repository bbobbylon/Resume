import { TestBed } from '@angular/core/testing';
import { CommandPaletteTrigger } from './command-palette-trigger';
import { CommandPaletteService } from '../../services/command-palette';

describe('CommandPaletteTrigger', () => {
  it('is a labelled button that opens the shared command palette', () => {
    const fixture = TestBed.createComponent(CommandPaletteTrigger);
    fixture.detectChanges();
    const palette = TestBed.inject(CommandPaletteService);
    expect(palette.open()).toBe(false);

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.palette-btn');
    expect(button.getAttribute('aria-label')).toContain('Search');
    button.click();
    expect(palette.open()).toBe(true);
  });
});
