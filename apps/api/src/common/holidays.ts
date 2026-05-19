/**
 * Jours fériés français — calcul algorithmique (Pâques par algorithme de Gauss).
 */

function easterDate(year: number): Date {
  // Algorithme de Gauss
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86400000);
}

export interface Holiday { date: string; name: string; }

export function frenchHolidays(year: number): Holiday[] {
  const easter = easterDate(year);
  const ascension = addDays(easter, 39);
  const pentecost = addDays(easter, 50);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  return [
    { date: `${year}-01-01`, name: 'Jour de l\'An' },
    { date: fmt(addDays(easter, 1)), name: 'Lundi de Pâques' },
    { date: `${year}-05-01`, name: 'Fête du Travail' },
    { date: `${year}-05-08`, name: 'Victoire 1945' },
    { date: fmt(ascension), name: 'Ascension' },
    { date: fmt(pentecost), name: 'Lundi de Pentecôte' },
    { date: `${year}-07-14`, name: 'Fête nationale' },
    { date: `${year}-08-15`, name: 'Assomption' },
    { date: `${year}-11-01`, name: 'Toussaint' },
    { date: `${year}-11-11`, name: 'Armistice 1918' },
    { date: `${year}-12-25`, name: 'Noël' },
  ];
}

export function isHoliday(date: string | Date, year?: number): boolean {
  const d = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  const y = year || new Date(d).getFullYear();
  return frenchHolidays(y).some(h => h.date === d);
}

/**
 * Nombre de jours ouvrés entre deux dates (exclut samedi, dimanche, jours fériés).
 */
export function businessDaysBetween(start: string | Date, end: string | Date): number {
  const s = new Date(start);
  const e = new Date(end);
  let count = 0;
  for (let d = new Date(s); d <= e; d = addDays(d, 1)) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    if (isHoliday(d, d.getFullYear())) continue;
    count++;
  }
  return count;
}
