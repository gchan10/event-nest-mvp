import { useEffect, useState } from 'react';
import { fetchTicketmasterEvents } from './components/fetchTicketmasterEvents';
import { fetchGoogleRestaurants } from './components/fetchGoogleRestaurants';
import FilterBar from './components/FilterBar';
import TimeFilter from './components/TimeFilter';

export default function App() {
  const [filters, setFilters] = useState({ cuisine: '', vibe: '', price: '' });
  const [timeRange, setTimeRange] = useState('Tonight');
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const events = await fetchTicketmasterEvents(timeRange);
        const enriched = [];

        for (const event of events) {
          const nearbyRestaurants = await fetchGoogleRestaurants(event.location, filters.cuisine);
          const restaurant = nearbyRestaurants[0];
          if (restaurant) {
            enriched.push({ event, restaurant });
          }
        }

        setItineraries(enriched);
      } catch (err) {
        console.error("Failed to load data", err);
        setItineraries([]);
      }
    }

    loadData();
  }, [timeRange, filters.cuisine]);

  const itinerary = itineraries[0];

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-600">Plan My Night Out</h1>
      <TimeFilter timeRange={timeRange} setTimeRange={setTimeRange} />
      <FilterBar filters={filters} setFilters={setFilters} />

      {itinerary ? [itinerary.restaurant, itinerary.event].map((venue, idx) => (
        <div key={idx} className="p-4 border shadow rounded space-y-2 bg-white">
          <h2 className="text-lg font-semibold">{venue.name}</h2>
          <p className="text-sm text-gray-500">{venue.location}</p>
          <img src={venue.img} alt={venue.name} className="rounded w-full" />
          <p className="text-sm">⭐ {venue.rating} · {venue.price} · {venue.tags}</p>
          <a href={venue.website} target="_blank" className="text-sm text-blue-600 underline">Website</a>
        </div>
      )) : <p className="text-sm text-gray-500">Loading itineraries...</p>}

      {itinerary && (
        <div className="pt-4">
          <a href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(itinerary.restaurant.location)}&destination=${encodeURIComponent(itinerary.event.location)}`} target="_blank" className="text-sm text-blue-700 underline">
            📍 Directions via Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
