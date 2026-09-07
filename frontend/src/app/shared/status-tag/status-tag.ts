import { Component, computed, input } from '@angular/core';
import { ProjectStatus } from '../../models/project.model';

/**
 * The Nocturne status chip used beside every project title (handoff → "Status tag
 * component"): Live → `.tag-outline`, WIP → `.tag-neutral`, Archived →
 * `.tag-neutral` at 60% opacity. Pass `featured` to render the accent "Featured"
 * chip instead — the layouts place it *before* the status chip.
 */
@Component({
  selector: 'app-status-tag',
  template: `<span class="tag" [class]="classes()" [class.archived]="status() === 'ARCHIVED'">{{ label() }}</span>`,
  styles: `
    :host { display: inline-flex; }
    .tag { margin: 0; }
    .archived { opacity: 0.6; }
  `,
})
export class StatusTag {
  /** The project's lifecycle state; ignored when {@link featured} is set. */
  readonly status = input<ProjectStatus>('LIVE');
  /** Render the accent "Featured" tag instead of a status. One tag, two jobs, so the markup stays flat. */
  readonly featured = input(false);

  /** The tag's text — "Featured" wins over status, otherwise the status in sentence case. */
  protected readonly label = computed(() => {
    if (this.featured()) return 'Featured';
    const s = this.status();
    return s === 'LIVE' ? 'Live' : s === 'WIP' ? 'WIP' : 'Archived';
  });

  /**
   * Which Nocturne tag style applies: accent for featured, the outline for a live
   * project (the one that should draw the eye), neutral for everything else.
   */
  protected readonly classes = computed(() => {
    if (this.featured()) return 'tag tag-accent';
    return this.status() === 'LIVE' ? 'tag tag-outline' : 'tag tag-neutral';
  });
}
