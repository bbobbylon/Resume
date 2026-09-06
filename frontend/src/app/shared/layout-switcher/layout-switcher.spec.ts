import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LayoutSwitcher } from './layout-switcher';

describe('LayoutSwitcher', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutSwitcher],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('links to all three layouts and marks the current one', async () => {
    const fixture = TestBed.createComponent(LayoutSwitcher);
    fixture.componentRef.setInput('current', 'gallery');
    fixture.detectChanges();
    await fixture.whenStable();

    const links: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a.seg-opt');
    expect(links.length).toBe(3);
    expect([...links].map((l) => l.textContent?.trim())).toEqual(['Ledger', 'Gallery', 'Dossier']);

    const current = fixture.nativeElement.querySelector('a[aria-current="page"]');
    expect(current.textContent?.trim()).toBe('Gallery');
    expect([...links].filter((l) => l !== current).every((l) => !l.getAttribute('aria-current'))).toBe(true);
  });

  it('sets the layout query param on each link', async () => {
    const fixture = TestBed.createComponent(LayoutSwitcher);
    fixture.componentRef.setInput('current', 'ledger');
    fixture.detectChanges();
    await fixture.whenStable();

    const dossierLink: HTMLAnchorElement = fixture.nativeElement.querySelector('a[href*="dossier"]');
    expect(dossierLink.getAttribute('href')).toBe('/?layout=dossier');
  });
});
