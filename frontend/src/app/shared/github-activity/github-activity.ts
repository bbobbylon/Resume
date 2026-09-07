import { afterNextRender, Component, input, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

/** The one event this widget shows, already reduced to what the template needs. */
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

/**
 * A one-line "what I've been building" strip pulled live from GitHub's public
 * events API (no token, no third-party stats-image service — `environment.
 * githubUsername`), so it never goes stale in the prerendered HTML.
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
    @if (activity(); as a) {
      <a
        class="activity"
        [class.compact]="compact()"
        [href]="a.repoUrl"
        target="_blank"
        rel="noopener"
        [attr.aria-label]="a.text + ' · ' + a.when"
        [attr.title]="compact() ? a.text + ' · ' + a.when : null"
      >
        <span class="dot" aria-hidden="true"></span>
        @if (!compact()) {
          <span>{{ a.text }} · {{ a.when }}</span>
        }
      </a>
    }
  `,
  styles: `
    :host { display: contents; }
    .activity { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; color: var(--color-neutral-400); text-decoration: none; white-space: nowrap; }
    .activity:hover { color: var(--color-accent); }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-success, #4ade80); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success, #4ade80) 25%, transparent); flex: none; }
  `,
})
export class GithubActivity {
  /** Dot only, no label text — for tight spaces like a sidebar. */
  readonly compact = input(false);

  /**
   * The event to show, or `undefined` for "render nothing" — the state on a rate
   * limit, a network error, or an account with no recognised recent activity.
   */
  protected readonly activity = signal<Activity | undefined>(undefined);

  constructor() {
    afterNextRender(() => void this.load());
  }

  /**
   * Fetches the account's public events and keeps the newest recognised one.
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
      const event = events.find((e) => e.type in EVENT_VERBS);
      if (!event) return;
      const repo = event.repo.name.split('/').pop() ?? event.repo.name;
      this.activity.set({
        text: `${EVENT_VERBS[event.type]} ${repo}`,
        repoUrl: `https://github.com/${event.repo.name}`,
        when: relativeTime(event.created_at),
      });
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
