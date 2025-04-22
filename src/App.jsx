import { useState } from 'react';
import FilterBar from './components/FilterBar';

const fallbackData = [
  {
    restaurant: {
      name: "Pammy's",
      location: "928 Massachusetts Ave, Cambridge, MA",
      rating: "4.8",
      price: "$$$",
      tags: "Italian · Romantic · Cozy",
      cuisine: "Italian",
      vibe: "Romantic",
      img: "https://media.timeout.com/images/105256081/image.jpg",
      website: "https://www.pammyscambridge.com"
    },
    event: {
      name: "Comedy Show @ The Comedy Studio",
      location: "1 Bow Market Way, Somerville, MA",
      rating: "4.7",
      price: "$20",
      tags: "Live Comedy · Small Venue",
      img: "https://cdn.thecomedystudio.com/comedy-studio-show.jpg",
      website: "https://www.thecomedystudio.com"
    }
  }
];

export default function App() {
  const [filters, setFilters] = useState({ cuisine: '', vibe: '', price: '' });
  const filtered = fallbackData.filter(i => {
    return (!filters.cuisine || i.restaurant.cuisine === filters.cuisine) &&
           (!filters.vibe || i.restaurant.vibe === filters.vibe) &&
           (!filters.price || i.restaurant.price === filters.price);
  });
  const itinerary = filtered[0] || fallbackData[0];

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-600">Plan My Night Out</h1>
      <FilterBar filters={filters} setFilters={setFilters} />

      {[itinerary.restaurant, itinerary.event].map((venue, idx) => (
        <div key={idx} className="p-4 border shadow rounded space-y-2 bg-white">
          <h2 className="text-lg font-semibold">{venue.name}</h2>
          <p className="text-sm text-gray-500">{venue.location}</p>
          <img src={venue.img} alt={venue.name} onError={(e) => e.currentTarget.src='https://via.placeholder.com/400x200?text=No+Image'} className="rounded w-full" />
          <p className="text-sm">⭐ {venue.rating} · {venue.price} · {venue.tags}</p>
          <a href={venue.website} target="_blank" className="text-sm text-blue-600 underline">Website</a>
        </div>
      ))}

      <div className="pt-4">
        <a href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(itinerary.restaurant.location)}&destination=${encodeURIComponent(itinerary.event.location)}`} target="_blank" className="text-sm text-blue-700 underline">
          📍 Directions via Google Maps
        </a>
      </div>
    </div>
  );
}
