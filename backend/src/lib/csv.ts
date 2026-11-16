// Builds a CSV file that Excel (Spanish locale) and LibreOffice open correctly with a double click

// Excel in Spanish expects ";" between columns, because "," is the decimal separator
const SEPARATOR = ';';

// RFC 4180 line ending. Excel accepts "\n" too, but "\r\n" is the standard
const LINE_BREAK = '\r\n';

// Byte Order Mark: an invisible first character that tells Excel the file is UTF-8.
// Without it Excel guesses another encoding and "Categoría" shows up as "CategorÃ­a"
const UTF8_BOM = '﻿';

// A cell starting with one of these is run as a formula by Excel. A description such as
// =HYPERLINK("http://evil.example", "Click") would become a clickable link: CSV (formula) injection.
// \t and \r are included because Excel ignores them at the start and then reads the formula
const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

// Only for text typed by the user: an apostrophe in front makes Excel show the cell as plain text.
// Numbers built by the app (such as "-12,50") must not go through this, or they would stop being numbers
export function escapeFormula(text: string): string {
  return FORMULA_PREFIXES.some((prefix) => text.startsWith(prefix)) ? `'${text}` : text;
}

// A cell that contains the separator, quotes or a line break goes between quotes, and its own quotes
// are doubled: 'Cena "con amigos"; postre' -> "Cena ""con amigos""; postre"
function quoteCell(cell: string): string {
  return /[";\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

// The first row is the header. Every cell must already be a string formatted for display
export function toCsv(rows: string[][]): string {
  return UTF8_BOM + rows.map((row) => row.map(quoteCell).join(SEPARATOR)).join(LINE_BREAK) + LINE_BREAK;
}
