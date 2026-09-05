import { TestBed } from '@angular/core/testing';
import { StatusTag } from './status-tag';

describe('StatusTag', () => {
  async function render(inputs: { status?: 'LIVE' | 'WIP' | 'ARCHIVED'; featured?: boolean }) {
    await TestBed.configureTestingModule({ imports: [StatusTag] }).compileComponents();
    const fixture = TestBed.createComponent(StatusTag);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
    return fixture.nativeElement.querySelector('span') as HTMLSpanElement;
  }

  it('renders Live as an outline tag', async () => {
    const el = await render({ status: 'LIVE' });
    expect(el.textContent?.trim()).toBe('Live');
    expect(el.classList.contains('tag-outline')).toBe(true);
  });

  it('renders WIP as a neutral tag', async () => {
    const el = await render({ status: 'WIP' });
    expect(el.textContent?.trim()).toBe('WIP');
    expect(el.classList.contains('tag-neutral')).toBe(true);
    expect(el.classList.contains('archived')).toBe(false);
  });

  it('dims Archived', async () => {
    const el = await render({ status: 'ARCHIVED' });
    expect(el.textContent?.trim()).toBe('Archived');
    expect(el.classList.contains('archived')).toBe(true);
  });

  it('renders the accent Featured chip when featured', async () => {
    const el = await render({ status: 'LIVE', featured: true });
    expect(el.textContent?.trim()).toBe('Featured');
    expect(el.classList.contains('tag-accent')).toBe(true);
  });
});
