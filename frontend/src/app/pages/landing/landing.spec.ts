import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Landing } from './landing';

describe('Landing', () => {
  function setup(layout: string | null) {
    const paramMap = convertToParamMap(layout ? { layout } : {});
    TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { queryParamMap: of(paramMap), snapshot: { queryParamMap: paramMap } } },
      ],
    });
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
    return fixture;
  }

  it('defaults to the ledger layout', () => {
    const fixture = setup(null);
    expect(fixture.componentInstance.layout()).toBe('ledger');
    expect(fixture.nativeElement.querySelector('app-ledger')).not.toBeNull();
    const current = fixture.nativeElement.querySelector('app-layout-switcher a[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('Ledger');
  });

  it('honours a ?layout= query param', () => {
    const fixture = setup('gallery');
    expect(fixture.componentInstance.layout()).toBe('gallery');
    expect(fixture.nativeElement.querySelector('app-gallery')).not.toBeNull();
  });

  it('ignores unknown layouts', () => {
    expect(setup('nope').componentInstance.layout()).toBe('ledger');
  });
});
