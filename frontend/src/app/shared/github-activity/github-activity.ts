import { afterNextRender, Component, computed, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

/** One event this widget can show, already reduced to what the template needs. */
interface Activity {
  /** The rendered sentence, e.g. "Pushed to Resume". */
  text: string;
  /** Where the label links — the repo the event happened in. */
  repoUrl: string;
  /** Relative age ("7m ago"), computed once at fetch time; it is not kept ticking. */
  when: string;
}

/**
 * The slice of GitHub's public events payload this component reads. Deliberately
 * partial: it names only the three fields used, so an unrelated change to GitHub's
 * response shape cannot break the type.
 */
interface GithubEvent {
  /** Event kind, e.g. `PushEvent`; looked up in {@link EVENT_VERBS}. */
  type: string;
  /** ISO timestamp, turned into a relative age by {@link relativeTime}. */
  created_at: string;
  /** `owner/repo`; the owner half is dropped for display, kept for the link. */
  repo: { name: string };
}

/**
 * Event kinds worth showing, and how each reads in a sentence. This map doubles as
 * the allow-list — an event type absent from here is skipped, so a `GollumEvent` or
 * a `MemberEvent` never renders as unexplained noise on the hero.
 */
const EVENT_VERBS: Record<string, string> = {
  PushEvent: 'Pushed to',
  CreateEvent: 'Created',
  PullRequestEvent: 'Opened a PR in',
  IssuesEvent: 'Opened an issue in',
  WatchEvent: 'Starred',
  ForkEvent: 'Forked',
  ReleaseEvent: 'Published a release in',
};

/** How many recognized events to keep — one badge plus this many more behind the disclosure. */
const HISTORY_LIMIT = 5;

/**
 * A one-line "what I've been building" strip pulled live from GitHub's public
 * events API (no token, no third-party stats-image service — `environment.
 * githubUsername`), so it never goes stale in the prerendered HTML.
 *
 * Shows the most recent recognized event as a direct link, exactly as before; when
 * the account has more recent activity than that, a small "+N more" disclosure next
 * to it expands the rest (up to {@link HISTORY_LIMIT} total) as its own short list,
 * so the hero reads more like a live changelog without growing when there is
 * nothing extra to show. `compact` mode (the dot with no label, for tight spaces)
 * never renders the disclosure — there is no room for a second control there.
 *
 * Browser-only ({@link afterNextRender}, mirroring {@link LiveStatus}): the
 * server-rendered and hydrated markup both start with nothing shown, so they
 * never mismatch. Renders nothing on a rate limit, network error, or no
 * public events in the last 90 days (GitHub's own retention window) — a
 * portfolio's hero shouldn't show a broken widget when the network hiccups.
 */
@Component({
  selector: 'app-github-activity',
  template: `
    @if (primary(); as p) {
      <div class="gh-activity">
        <a
          class="activity"
          [class.compact]="compact()"
          [href]="p.repoUrl"
          target="_blank"
          rel="noopener"
          [attr.aria-label]="p.text + ' · ' + p.when"
          [attr.title]="compact() ? p.text + ' · ' + p.when : null"
        >
          <span class="dot" aria-hidden="true"></span>
          @if (!compact()) {
            <span>{{ p.text }} · {{ p.when }}</span>
          }
        </a>
        @if (!compact() && rest().length) {
          <button
            type="button"
            class="more-toggle"
            [attr.aria-expanded]="expanded()"
            aria-controls="gh-activity-list"
            (click)="expanded.set(!expanded())"
          >{{ expanded() ? 'Less' : '+' + rest().length + ' more' }}</button>
        }
        @if (expanded() && rest().length) {
          <ul class="activity-list elev-sm" id="gh-activity-list">
            @for (a of rest(); track a.repoUrl + a.when) {
              <li><a [href]="a.repoUrl" target="_blank" rel="noopener">{{ a.text }} <span class="when">· {{ a.when }}</span></a></li>
            }
          </ul>
        }
      </div>
    }
  `,
  styles: `
    :host { display: contents; }
    /*
     * flex-wrap + the list's flex-basis: 100% (below) is a deliberate alternative to
     * position: absolute — this widget lands inside a scrolling, position: sticky
     * aside on the Dossier layout, which would clip or misplace an absolutely
     * positioned popover. Wrapping onto a new line keeps the disclosure in normal
     * document flow everywhere it is used, at the cost of pushing later siblings
     * down while it is open — acceptable since this is always the last item in its
     * row (the hero actions row, or the aside's contact block).
     */
    .gh-activity { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; }
    .activity { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; color: var(--color-neutral-400); text-decoration: none; white-space: nowrap; }
    .activity:hover { color: var(--color-accent); }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-success, #4ade80); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success, #4ade80) 25%, transparent); flex: none; }
    .more-toggle {
      font-size: 11px; color: var(--color-neutral-500); background: none; border: none; padding: 2px 4px;
      cursor: pointer; text-decoration: underline; text-underline-offset: 2px;
    }
    .more-toggle:hover { color: var(--color-accent); }
    .activity-list {
      /* min-width: 0 overrides a flex item's default auto min-width, which would
         otherwise be its widest nowrap row's min-content size — without it, a long
         repo name in .activity-list a would force this list (and its ancestors, up
         through the Dossier aside's overflow: auto) wider than the layout, instead
         of eliding as .activity-list a's own text-overflow: ellipsis intends. */
      flex-basis: 100%; min-width: 0; max-width: 320px;
      list-style: none; margin: 2px 0 0; padding: 8px;
      background: var(--color-surface); border: 1px solid var(--color-divider); border-radius: var(--radius-md);
    }
    .activity-list li + li { margin-top: 2px; }
    .activity-list a {
      display: block; padding: 6px 8px; border-radius: var(--radius-sm); font-size: 12.5px;
      color: var(--color-text); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .activity-list a:hover { background: color-mix(in srgb, var(--color-text) 7%, transparent); }
    .activity-list .when { color: var(--color-neutral-500); }
  `,
})
export class GithubActivity {
  /** Dot only, no label text, and no "+N more" disclosure — for tight spaces like a sidebar. */
  readonly compact = input(false);

  /** The host element, so an outside click (not a keyboard escape) can collapse the disclosure. */
  private readonly host = inject(ElementRef<HTMLElement>);

  /**
   * Every recognized event this fetch found, newest first, capped at
   * {@link HISTORY_LIMIT}; empty for "render nothing" — the state on a rate limit, a
   * network error, or an account with no recognised recent activity.
   */
  private readonly activities = signal<Activity[]>([]);

  /** The always-visible badge — the same single event this component showed before the disclosure existed. */
  protected readonly primary = computed<Activity | undefined>(() => this.activities()[0]);

  /** Everything behind the "+N more" disclosure. */
  protected readonly rest = computed<Activity[]>(() => this.activities().slice(1));

  /** Whether {@link rest} is currently shown. Reset to closed on every fresh fetch. */
  protected readonly expanded = signal(false);

  constructor() {
    afterNextRender(() => void this.load());
  }

  /** Closes the disclosure on a click anywhere outside this widget. */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(e: MouseEvent): void {
    if (this.expanded() && !this.host.nativeElement.contains(e.target as Node)) this.expanded.set(false);
  }

  /** Closes the disclosure on Escape, without requiring focus to be inside it (it is not a focus trap). */
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.expanded.set(false);
  }

  /**
   * Fetches the account's public events and keeps the newest {@link HISTORY_LIMIT} recognized ones.
   *
   * Unauthenticated and direct from the browser: the endpoint is public and
   * CORS-enabled, so this needs no token and no third-party stats service. Every
   * failure path is silent by design — a portfolio hero should show nothing rather
   * than a broken widget when GitHub's API hiccups or the rate limit is hit.
   */
  private async load(): Promise<void> {
    try {
      const res = await fetch(`https://api.github.com/users/${environment.githubUsername}/events/public`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!res.ok) return;
      const events: GithubEvent[] = await res.json();
      const activities = events
        .filter((e) => e.type in EVENT_VERBS)
        .slice(0, HISTORY_LIMIT)
        .map((event) => {
          const repo = event.repo.name.split('/').pop() ?? event.repo.name;
          return {
            text: `${EVENT_VERBS[event.type]} ${repo}`,
            repoUrl: `https://github.com/${event.repo.name}`,
            when: relativeTime(event.created_at),
          };
        });
      this.activities.set(activities);
    } catch {
      // Rate-limited or offline: render nothing rather than a broken widget.
    }
  }
}

/**
 * An ISO timestamp as a compact age: "just now", "7m ago", "3h ago", "5d ago",
 * "2mo ago". Rounded rather than truncated, and months are approximated at 30 days —
 * precision past "a while back" is not worth an internationalisation dependency here.
 *
 * @param iso the event's `created_at`
 * @returns the age, ready to render
 */
function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.round(days / 30)}mo ago`;
}
