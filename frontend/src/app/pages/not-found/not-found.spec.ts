import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotFound } from './not-found';

describe('NotFound', () => {
  it('explains the miss and links back to the hub', async () => {
    TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toBe('Page not found');
    expect(el.querySelector('.missing code')?.textContent).toBe('/');
    expect(el.querySelector('.actions a.btn-primary')?.getAttribute('href')).toBe('/');
  });
});
