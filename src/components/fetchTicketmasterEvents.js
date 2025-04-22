export async function fetchTicketmasterEvents(timeRange = 'Tonight') {
  const now = new Date();
  const startDateTime = new Date();
  const endDateTime = new Date();

  if (timeRange === 'Tonight') {
    startDateTime.setHours(17, 0, 0);
    endDateTime.setHours(23, 59, 59);
  } else if (timeRange === 'Tomorrow') {
    startDateTime.setDate(now.getDate() + 1);
    startDateTime.setHours(0, 0, 0);
    endDateTime.setDate(now.getDate() + 1);
    endDateTime.setHours(23, 59, 59);
  } else if (timeRange === 'Weekend') {
    const day = now.getDay();
    const daysUntilFriday = (5 - day + 7) % 7;
    startDateTime.setDate(now.getDate() + daysUntilFriday);
    startDateTime.setHours(0, 0, 0);
    endDateTime.setDate(startDateTime.getDate() + 2);
    endDateTime.setHours(23, 59, 59);
  }

  const start = startDateTime.toISOString().split('.')[0] + 'Z';
  const end = endDateTime.toISOString().split('.')[0] + 'Z';

  const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=rHfPkPoyEHZAGVcHz2sUIj2b09HISDOn&city=Boston&startDateTime=${start}&endDateTime=${end}&size=5`);
  const data = await res.json();

  if (!data._embedded) return [];

  return data._embedded.events.map(evt => ({
    name: evt.name,
    location: evt._embedded.venues[0].name,
    img: evt.images[0]?.url || '',
    website: evt.url,
    date: timeRange,
    rating: 'N/A',
    price: evt.priceRanges?.[0]?.min ? `$${evt.priceRanges[0].min}` : 'Varies',
    tags: evt.classifications?.map(c => c.segment.name).join(', ') || 'Live Event'
  }));
}
