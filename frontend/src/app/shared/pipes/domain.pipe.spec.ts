import { DomainPipe } from './domain.pipe';

describe('DomainPipe', () => {
  const pipe = new DomainPipe();

  it('returns the bare hostname by default', () => {
    expect(pipe.transform('https://tesseraapp.dev/')).toBe('tesseraapp.dev');
    expect(pipe.transform('https://www.example.com/a/b')).toBe('example.com');
  });

  it('keeps the path when asked', () => {
    expect(pipe.transform('https://github.com/bbobbylon/Resume/', true)).toBe('github.com/bbobbylon/Resume');
  });

  it('passes through non-URLs and blanks', () => {
    expect(pipe.transform('not a url')).toBe('not a url');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
