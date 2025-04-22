export async function fetchGoogleRestaurants(eventLocation, keyword = '') {
  const proxy = "https://corsproxy.io/?";
  const base = "https://maps.googleapis.com/maps/api/place/textsearch/json";
  const query = `restaurants near ${encodeURIComponent(eventLocation)} ${keyword}`;

  const url = `${proxy}${base}?query=${query}&key=AIzaSyD6Rd6jCt4q-Bdm9ETCuAbJaYgrC5CU86w`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.results) return [];

  return data.results.slice(0, 5).map(place => ({
    name: place.name,
    location: place.formatted_address,
    rating: place.rating || 'N/A',
    price: '$'.repeat(place.price_level || 2),
    img: place.photos
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=AIzaSyD6Rd6jCt4q-Bdm9ETCuAbJaYgrC5CU86w`
      : 'https://via.placeholder.com/400x200?text=No+Image',
    website: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`
  }));
}