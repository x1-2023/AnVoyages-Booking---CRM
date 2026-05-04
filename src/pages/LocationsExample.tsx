import { useCallback, useEffect, useState } from 'react';
import { locationService } from '@/services/location.service';

type ExampleLocation = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { properties?: number; bookings?: number };
};

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Failed to load locations';

export default function LocationsExample() {
  const [locations, setLocations] = useState<ExampleLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await locationService.getAll(true);
      setLocations(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  if (loading) {
    return <div className="p-8"><h1 className="mb-4 text-2xl font-bold">Loading locations...</h1></div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold text-red-500">Error</h1>
        <p>{error}</p>
        <button onClick={loadLocations} className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Locations from Backend API</h1>
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4"><p className="text-green-800">Successfully connected to backend. API: {import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}</p></div>
      {locations.length === 0 ? (
        <p>No locations found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <div key={location.id} className="rounded-lg border p-4 transition-shadow hover:shadow-lg">
              <h2 className="mb-2 text-xl font-semibold">{location.name}</h2>
              <p className="mb-2 text-gray-600">{location.description}</p>
              <div className="text-sm text-gray-500"><p>Slug: {location.slug}</p><p>Properties: {location._count?.properties || 0}</p><p>Bookings: {location._count?.bookings || 0}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
