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
  readonly status = input<ProjectStatus>('LIVE');
  readonly featured = input(false);

  protected readonly label = computed(() => {
    if (this.featured()) return 'Featured';
    const s = this.status();
    return s === 'LIVE' ? 'Live' : s === 'WIP' ? 'WIP' : 'Archived';
  });

  protected readonly classes = computed(() => {
    if (this.featured()) return 'tag tag-accent';
    return this.status() === 'LIVE' ? 'tag tag-outline' : 'tag tag-neutral';
  });
}
