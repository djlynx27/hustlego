function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  const source = text.replace(/^\uFEFF/, '');

  let currentRow: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === '"') {
      if (inQuotes && source[index + 1] === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && source[index + 1] === '\n') {
        index += 1;
      }

      currentRow.push(currentValue);
      if (currentRow.some((value) => value.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  currentRow.push(currentValue);
  if (currentRow.some((value) => value.trim() !== '')) {
    rows.push(currentRow);
  }

  return rows;
}

export function parseCsvRecords(text: string): Record<string, string>[] {
  const rows = parseCsvRows(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index]?.trim() ?? '';
    });
    return record;
  });
}
