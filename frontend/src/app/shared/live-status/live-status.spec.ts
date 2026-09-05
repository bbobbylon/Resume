import { TestBed } from '@angular/core/testing';
import { LiveStatus } from './live-status';

describe('LiveStatus', () => {
  async function render(url: string, fetchImpl: typeof fetch) {
    vi.stubGlobal('fetch', vi.fn(fetchImpl));
    const fixture = TestBed.createComponent(LiveStatus);
    fixture.componentRef.setInput('url', url);
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 0)); // let the probe's promise settle
    await fixture.whenStable();
    return fixture;
  }

  afterEach(() => vi.unstubAllGlobals());

  it('shows "Up now" when the host answers (even opaquely)', async () => {
    const fixture = await render('https://tesseraapp.dev', async () => new Response(null, { status: 200 }));
    expect(fetch).toHaveBeenCalledWith('https://tesseraapp.dev', expect.objectContaining({ mode: 'no-cors' }));
    expect(fixture.nativeElement.textContent).toContain('Up now');
    expect(fixture.nativeElement.querySelector('.status').dataset['state']).toBe('up');
  });

  it('shows "Not reachable" when the request fails', async () => {
    const fixture = await render('https://nope.invalid', async () => { throw new TypeError('Failed to fetch'); });
    expect(fixture.nativeElement.textContent).toContain('Not reachable');
  });

  it('checks nothing without a URL', async () => {
    const fixture = await render('', async () => new Response());
    expect(fetch).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Checking');
  });

  it('compact mode shows the dot with no label text', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 200 })));
    const fixture = TestBed.createComponent(LiveStatus);
    fixture.componentRef.setInput('url', 'https://tesseraapp.dev');
    fixture.componentRef.setInput('compact', true);
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 0));
    await fixture.whenStable();
    const status: HTMLElement = fixture.nativeElement.querySelector('.status');
    expect(status.textContent?.trim()).toBe('');
    expect(status.getAttribute('title')).toBe('Up now');
    expect(status.getAttribute('aria-label')).toBe('Live site Up now');
  });

  it('only probes once the dot scrolls into view, when IntersectionObserver exists', async () => {
    const fetchSpy = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);
    let observedCallback: IntersectionObserverCallback | undefined;
    const disconnect = vi.fn();
    class FakeIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observedCallback = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds: number[] = [];
    }
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

    const fixture = TestBed.createComponent(LiveStatus);
    fixture.componentRef.setInput('url', 'https://tesseraapp.dev');
    await fixture.whenStable();
    expect(fetchSpy).not.toHaveBeenCalled();

    observedCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    await new Promise((r) => setTimeout(r, 0));
    await fixture.whenStable();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalled();
  });
});
