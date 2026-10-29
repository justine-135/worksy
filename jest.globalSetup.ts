/**
 * Jest global setup — runs once in the main Jest process before any workers.
 * Sets TZ=UTC so that Date methods using local time (getHours, getMinutes, etc.)
 * behave consistently with UTC-based test fixture timestamps across all
 * environments (CI, Windows with Asia/Singapore, etc.).
 */
export default function globalSetup() {
  process.env.TZ = 'UTC'
}
