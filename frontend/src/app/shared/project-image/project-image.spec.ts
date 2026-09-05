import { TestBed } from '@angular/core/testing';
import { ProjectImage } from './project-image';

describe('ProjectImage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProjectImage] }).compileComponents();
  });

  it('shows the initial letter placeholder when there is no screenshot', async () => {
    const fixture = TestBed.createComponent(ProjectImage);
    fixture.componentRef.setInput('name', 'tesseraapp');
    fixture.componentRef.setInput('alt', 'TesseraApp screenshot');
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('.placeholder')?.textContent?.trim()).toBe('T');
  });

  it('renders the image with the lighten blend when a src is given', async () => {
    const fixture = TestBed.createComponent(ProjectImage);
    fixture.componentRef.setInput('src', 'shots/tessera.png');
    fixture.componentRef.setInput('ratio', '21:9');
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('img.lighten')).not.toBeNull();
    expect(el.querySelector('.frame.wide')).not.toBeNull();
  });
});
