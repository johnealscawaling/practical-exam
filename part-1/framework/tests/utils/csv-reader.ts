import * as fs from 'fs';
import * as path from 'path';

export function readCsvData<T extends Record<string, string>>(fileName: string): T[] {
  const filePath = path.resolve(__dirname, '..', 'data', fileName);
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  const [headerLine, ...dataLines] = content.split('\n');
  const headers = headerLine.split(',');

  return dataLines.map((line) => {
    const values = line.split(',');
    const row = {} as Record<string, string>;
    headers.forEach((header, index) => {
      row[header.trim()] = (values[index] ?? '').trim();
    });
    return row as T;
  });
}

export function getCsvRow<T extends Record<string, string>>(
  fileName: string,
  testCase: string,
): T {
  const rows = readCsvData<T>(fileName);
  const row = rows.find((r) => r['testCase'] === testCase);
  if (!row) {
    throw new Error(`Test case "${testCase}" not found in ${fileName}`);
  }
  return row;
}
