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
});
