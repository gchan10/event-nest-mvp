export default function FilterBar({ filters, setFilters }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 py-4">
      <select className="border rounded p-2" value={filters.cuisine} onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}>
        <option value="">All Cuisines</option>
        <option value="Italian">Italian</option>
        <option value="Seafood">Seafood</option>
        <option value="Vegan">Vegan</option>
      </select>
      <select className="border rounded p-2" value={filters.vibe} onChange={(e) => setFilters({ ...filters, vibe: e.target.value })}>
        <option value="">All Vibes</option>
        <option value="Romantic">Romantic</option>
        <option value="Casual">Casual</option>
        <option value="Trendy">Trendy</option>
      </select>
      <select className="border rounded p-2" value={filters.price} onChange={(e) => setFilters({ ...filters, price: e.target.value })}>
        <option value="">All Budgets</option>
        <option value="$">$</option>
        <option value="$$">$$</option>
        <option value="$$$">$$$</option>
        <option value="$$$$">$$$$</option>
      </select>
    </div>
  );
}
