import { TestBed } from '@angular/core/testing';
import { GithubActivity } from './github-activity';

describe('GithubActivity', () => {
  afterEach(() => vi.unstubAllGlobals());

  async function render() {
    const fixture = TestBed.createComponent(GithubActivity);
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 0)); // let the fetch promise settle
    await fixture.whenStable();
    return fixture;
  }

  it('renders the most recent recognized event as a link', async () => {
    const events = [
      { type: 'PushEvent', created_at: new Date(Date.now() - 3 * 3_600_000).toISOString(), repo: { name: 'bbobbylon/Resume' } },
    ];
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(events), { status: 200 })));
    const fixture = await render();
    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/users/bbobbylon/events/public',
      expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/vnd.github+json' }) }),
    );
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.activity');
    expect(link.href).toBe('https://github.com/bbobbylon/Resume');
    expect(link.textContent).toContain('Pushed to Resume');
    expect(link.textContent).toContain('3h ago');
  });

  it('skips event types it does not recognize and uses the first recognized one', async () => {
    const events = [
      { type: 'PublicEvent', created_at: new Date().toISOString(), repo: { name: 'bbobbylon/ignored' } },
      { type: 'WatchEvent', created_at: new Date().toISOString(), repo: { name: 'bbobbylon/Resume' } },
    ];
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(events), { status: 200 })));
    const fixture = await render();
    expect(fixture.nativeElement.textContent).toContain('Starred Resume');
  });

  it('renders nothing when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    const fixture = await render();
    expect(fixture.nativeElement.querySelector('a.activity')).toBeNull();
  });

  it('renders nothing when there is no public activity', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })));
    const fixture = await render();
    expect(fixture.nativeElement.querySelector('a.activity')).toBeNull();
  });

  it('renders nothing on a rate-limited (non-OK) response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 403 })));
    const fixture = await render();
    expect(fixture.nativeElement.querySelector('a.activity')).toBeNull();
  });

  it('compact mode shows the dot with no label text', async () => {
    const events = [{ type: 'PushEvent', created_at: new Date().toISOString(), repo: { name: 'bbobbylon/Resume' } }];
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(events), { status: 200 })));
    const fixture = TestBed.createComponent(GithubActivity);
    fixture.componentRef.setInput('compact', true);
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 0));
    await fixture.whenStable();
    const link: HTMLElement = fixture.nativeElement.querySelector('a.activity');
    expect(link.textContent?.trim()).toBe('');
    expect(link.getAttribute('title')).toContain('Pushed to Resume');
  });
});
