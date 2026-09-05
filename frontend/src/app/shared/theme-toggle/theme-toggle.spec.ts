import { TestBed } from '@angular/core/testing';
import { ThemeToggle } from './theme-toggle';
import { ThemeService, THEME_STORAGE_KEY } from '../../services/theme';

describe('ThemeToggle', () => {
  it('is a labelled button that flips the theme', () => {
    // A saved choice from another spec file must not leak in here (order-dependent
    // otherwise: ThemeService.initial() reads localStorage before the OS preference).
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.theme-btn');
    expect(button.getAttribute('aria-label')).toContain('theme');
    expect(fixture.nativeElement.querySelectorAll('svg').length).toBe(2);

    button.click();
    expect(TestBed.inject(ThemeService).theme()).toBe('light');
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
  });
});
