import { parseCsvRecords } from '@/lib/csv';
import { describe, expect, it } from 'vitest';

describe('parseCsvRecords', () => {
  it('parses fields containing commas inside quotes', () => {
    const rows = parseCsvRecords(
      'Date,Notes,Earnings\n2026-03-20,"Montreal, QC",12.50\n'
    );

    expect(rows).toEqual([
      {
        date: '2026-03-20',
        notes: 'Montreal, QC',
        earnings: '12.50',
      },
    ]);
  });

  it('parses escaped quotes and CRLF files', () => {
    const rows = parseCsvRecords(
      'Name,Comment\r\nGridwise,"He said ""go"""\r\n'
    );

    expect(rows).toEqual([
      {
        name: 'Gridwise',
        comment: 'He said "go"',
      },
    ]);
  });
});
