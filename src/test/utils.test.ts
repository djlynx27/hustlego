import { cn } from '@/lib/utils';
import { describe, expect, it } from 'vitest';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('deduplicates conflicting tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('filters falsy values', () => {
    const condition: boolean = false;
    expect(cn('base', condition && 'conditional', undefined, null, 'end')).toBe('base end');
  });

  it('returns empty string when no classes given', () => {
    expect(cn()).toBe('');
  });
});
