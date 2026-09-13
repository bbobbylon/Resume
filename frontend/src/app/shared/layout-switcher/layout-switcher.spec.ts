import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LayoutSwitcher } from './layout-switcher';

describe('LayoutSwitcher', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutSwitcher],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();
  });

  it('links to all four layouts, in the owner\'s reading order, and marks the current one', async () => {
    const fixture = TestBed.createComponent(LayoutSwitcher);
    fixture.componentRef.setInput('current', 'gallery');
    fixture.detectChanges();
    await fixture.whenStable();

    const links: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a.seg-opt');
    expect(links.length).toBe(4);
    expect([...links].map((l) => l.textContent?.trim())).toEqual(['Dossier', 'Folio', 'Ledger', 'Gallery']);

    const current = fixture.nativeElement.querySelector('a[aria-current="page"]');
    expect(current.textContent?.trim()).toBe('Gallery');
    expect([...links].filter((l) => l !== current).every((l) => !l.getAttribute('aria-current'))).toBe(true);
  });

  it('keeps ?tech= and ?q= on every link — a layout switch changes how, not which', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/?tech=Angular&q=api');
    const fixture = TestBed.createComponent(LayoutSwitcher);
    fixture.componentRef.setInput('current', 'ledger');
    fixture.detectChanges();
    await fixture.whenStable();

    const hrefs = [...fixture.nativeElement.querySelectorAll('a.seg-opt')].map((a: HTMLAnchorElement) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual([
      '/?tech=Angular&q=api&layout=dossier',
      '/?tech=Angular&q=api&layout=folio',
      '/?tech=Angular&q=api&layout=ledger',
      '/?tech=Angular&q=api&layout=gallery',
    ]);
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
