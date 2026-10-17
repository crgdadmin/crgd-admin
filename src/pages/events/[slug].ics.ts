import type { APIRoute } from 'astro';
import { getEvents, type EventEntry } from '../../lib/content';
import { isoDate, site, orgName, url, plainText } from '../../lib/site';

/* A calendar file for each event, so visitors can add it to Google, Outlook or Apple calendars. */
export async function getStaticPaths() {
  return (await getEvents()).map((item) => ({ params: { slug: item.id }, props: { item } }));
}

const escape = (value = '') => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
const fold = (line: string) => line.match(/.{1,74}/g)?.join('\r\n ') ?? line;

function stamp(day: Date, time?: string): string {
  const ymd = isoDate(day).replace(/-/g, '');
  if (!time) return `;VALUE=DATE:${ymd}`;
  const [h, m] = time.split(/[:.]/).map(Number);
  // Convert India Standard Time to UTC.
  const utc = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h - 5, m - 30));
  return `:${utc.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`;
}

export const GET: APIRoute = ({ props, site: siteUrl }) => {
  const item = props.item as EventEntry;
  const d = item.data;
  const last = d.endDate ?? d.startDate;
  const allDayEnd = new Date(last.getTime() + 24 * 60 * 60 * 1000);
  const link = new URL(url(`/events/${item.id}`), siteUrl).toString();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${orgName}//Events//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${item.id}@${new URL(link).hostname}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART${stamp(d.startDate, d.startTime)}`,
    `DTEND${d.endTime ? stamp(last, d.endTime) : d.startTime ? stamp(d.startDate, `${Number(d.startTime.split(':')[0]) + 2}:${d.startTime.split(':')[1] ?? '00'}`) : stamp(allDayEnd)}`,
    `SUMMARY:${escape(d.title)}`,
    `DESCRIPTION:${escape(`${d.summary ?? plainText(item.body ?? '').slice(0, 300)}\n\n${link}`)}`,
    `LOCATION:${escape([d.venue, d.city].filter(Boolean).join(', ') || (d.mode === 'Online' ? 'Online' : site.address ?? ''))}`,
    `URL:${link}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return new Response(`${lines.map(fold).join('\r\n')}\r\n`, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
