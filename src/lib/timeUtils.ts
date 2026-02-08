export function formatTime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null) return '';
  if (seconds === 0) return '0';

  if (seconds < 60) {
    return seconds.toString();
  }

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function parseTime(input: string): number {
  if (!input) return 0;
  const cleaned = input.trim();

  if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    if (parts.length !== 2) return 0; // Invalid format fallback
    const m = parseInt(parts[0], 10) || 0;
    const s = parseInt(parts[1], 10) || 0;
    return (m * 60) + s;
  }

  return parseInt(cleaned, 10) || 0;
}
