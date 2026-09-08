import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });

  it('offers a skip link before anything else on the page', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const skip = fixture.nativeElement.firstElementChild as HTMLAnchorElement;
    expect(skip.textContent?.trim()).toBe('Skip to content');
    expect(skip.getAttribute('href')).toBe('#main');
  });

  it('moves focus to the main landmark instead of only scrolling to it', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const main = document.createElement('main');
    main.id = 'main';
    main.tabIndex = -1;
    document.body.appendChild(main);

    const skip = fixture.nativeElement.querySelector('.skip-link') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    skip.dispatchEvent(event);

    expect(document.activeElement).toBe(main);
    expect(event.defaultPrevented).toBe(true); // no #main left in the URL
    main.remove();
  });

  it('leaves the plain fragment link alone when a route has no main landmark', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const skip = fixture.nativeElement.querySelector('.skip-link') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    skip.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
