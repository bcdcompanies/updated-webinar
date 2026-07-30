function parseScheduledDateTime(value) {
  if (!value || typeof value !== 'string') return null;

  // Handle datetime-local values like "2026-07-09T10:00" as local wall time.
  const localMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (localMatch) {
    const [, y, m, d, h, min, sec = '0'] = localMatch;
    const localDate = new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(h),
      Number(min),
      Number(sec)
    );
    return Number.isNaN(localDate.getTime()) ? null : localDate;
  }

  // Fallback for stored ISO values with timezone information.
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatScheduledDateTime(value, fallback = 'Unscheduled') {
  const parsed = parseScheduledDateTime(value);
  return parsed ? parsed.toLocaleString() : fallback;
}