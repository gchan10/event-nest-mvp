export default function TimeFilter({ timeRange, setTimeRange }) {
  return (
    <div className="flex gap-2 py-4">
      {['Any', 'Tonight', 'Tomorrow', 'Weekend'].map((label) => (
        <button
          key={label}
          onClick={() => setTimeRange(label)}
          className={`px-4 py-1 border rounded-full text-sm ${
            timeRange === label ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
