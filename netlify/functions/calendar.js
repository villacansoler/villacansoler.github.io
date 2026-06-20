const ICAL_URL =
  process.env.GOOGLE_CALENDAR_ICAL_URL ||
  "https://calendar.google.com/calendar/ical/povm2urft1jgj4jak8mmbuhfp8%40group.calendar.google.com/public/basic.ics";

const unfoldLines = (ical) => ical.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
const toDateKey = (date) => date.toISOString().slice(0, 10);

const parseDate = (line) => {
  const value = line.slice(line.indexOf(":") + 1).trim();
  const datePart = value.slice(0, 8);

  if (!/^\d{8}$/.test(datePart)) return null;

  return new Date(Date.UTC(
    Number(datePart.slice(0, 4)),
    Number(datePart.slice(4, 6)) - 1,
    Number(datePart.slice(6, 8)),
  ));
};

const parseCalendar = (ical) => {
  const unavailableDates = new Set();
  let event = null;

  for (const line of unfoldLines(ical)) {
    if (line === "BEGIN:VEVENT") {
      event = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (event?.start && event?.end) {
        const cursor = new Date(event.start);

        // iCal DTEND is exclusive: every night from check-in through the
        // day before check-out is shown as one continuous unavailable range.
        while (cursor < event.end) {
          unavailableDates.add(toDateKey(cursor));
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
      }

      event = null;
      continue;
    }

    if (!event) continue;
    if (line.startsWith("DTSTART")) event.start = parseDate(line);
    if (line.startsWith("DTEND")) event.end = parseDate(line);
  }

  const today = toDateKey(new Date());

  return Array.from(unavailableDates)
    .filter((date) => date >= today)
    .sort();
};

exports.handler = async () => {
  try {
    const response = await fetch(ICAL_URL, {
      headers: { "user-agent": "can-soler-calendar/1.0" },
    });

    if (!response.ok) {
      throw new Error(`Google Calendar returned ${response.status}`);
    }

    const ical = await response.text();
    if (!ical.includes("BEGIN:VCALENDAR")) {
      throw new Error("Google Calendar response was not valid iCal data");
    }

    return {
      statusCode: 200,
      headers: {
        "cache-control": "public, max-age=120, s-maxage=300",
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        unavailableDates: parseCalendar(ical),
        updatedAt: new Date().toISOString(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Unable to load calendar",
      }),
    };
  }
};
