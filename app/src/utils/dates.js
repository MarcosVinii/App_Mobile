// "2026-11-08 21:06:23" -> "08/11"
export function formatShortDate(dateText) {
  if (!dateText) return '';

  const [, month, day] = dateText.slice(0, 10).split('-');

  return `${day}/${month}`;
}