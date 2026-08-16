// Single source of truth for "what day is it, locally."
//
// Both the readings/saint cache keys AND the ?date= param sent to the
// backend come from here, so the client and server can never disagree
// about which liturgical day is being requested. That disagreement was
// the root of the stale-cache / wrong-saint bug: the cache keyed on local
// date while the server decided the day in US Eastern.
//
// Deliberately NOT toISOString(), which converts to UTC first and rolls
// the date over in the evening for US timezones. We want the device's
// own calendar date.
export function getLocalDateKey() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}
