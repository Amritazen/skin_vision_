import { useState, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, ExternalLink, Star, ArrowLeft, ArrowRight,
  Phone, Globe, Loader2, Navigation2, AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface Doctor {
  id: number;
  name: string;
  address: string;
  lat: number;
  lon: number;
  phone?: string;
  website?: string;
  type?: string;
}

interface Coords {
  lat: number;
  lon: number;
  label: string;
}

async function geocodeLocation(query: string): Promise<Coords | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en-US,en" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        label: data[0].display_name.split(",").slice(0, 2).join(", "),
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchNearbyDoctors(lat: number, lon: number): Promise<Doctor[]> {
  const radius = 15000; // 15 km radius
  const query = `
[out:json][timeout:30];
(
  node["healthcare"="doctor"]["healthcare:speciality"~"dermatolog",i](around:${radius},${lat},${lon});
  node["healthcare"="doctor"](around:${radius},${lat},${lon});
  node["amenity"="clinic"](around:${radius},${lat},${lon});
  node["amenity"="hospital"](around:${radius},${lat},${lon});
  node["amenity"="doctors"](around:${radius},${lat},${lon});
  way["amenity"="hospital"](around:${radius},${lat},${lon});
  way["amenity"="clinic"](around:${radius},${lat},${lon});
);
out center body 25;
`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error("Overpass API failed");
  const data = await res.json();

  return data.elements
    .map((el: any) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) return null;
      return {
        id: el.id,
        name: el.tags?.name || el.tags?.["name:en"] || "Medical Facility",
        address: [
          el.tags?.["addr:housenumber"],
          el.tags?.["addr:street"],
          el.tags?.["addr:city"] || el.tags?.["addr:suburb"],
        ]
          .filter(Boolean)
          .join(" ") || "Address not available",
        lat: elLat,
        lon: elLon,
        phone: el.tags?.phone || el.tags?.["contact:phone"],
        website: el.tags?.website || el.tags?.["contact:website"],
        type:
          el.tags?.["healthcare:speciality"] ||
          el.tags?.healthcare ||
          el.tags?.amenity ||
          "clinic",
      };
    })
    .filter(Boolean)
    .slice(0, 20) as Doctor[];
}

function getMapUrl(lat: number, lon: number) {
  const delta = 0.08;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta},${lat - delta},${lon + delta},${lat + delta}&layer=mapnik&marker=${lat},${lon}`;
}

export default function FindDermatologist() {
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logoutMutation } = useAuth();

  const runSearch = useCallback(async (c: Coords) => {
    setLoading(true);
    setError(null);
    setDoctors([]);
    setCoords(c);
    try {
      const results = await fetchNearbyDoctors(c.lat, c.lon);
      if (results.length === 0) {
        setError("No clinics or doctors found in this area. Try a broader location like your city name.");
      }
      setDoctors(results);
    } catch {
      setError("Could not fetch nearby doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    setLoading(true);
    setError(null);
    const c = await geocodeLocation(location.trim());
    if (!c) {
      setError("Location not found. Please enter a valid city, state, or postal code.");
      setLoading(false);
      return;
    }
    await runSearch(c);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c: Coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: "Your Location",
        };
        setLocating(false);
        await runSearch(c);
      },
      (err) => {
        setLocating(false);
        setError(`Could not get your location: ${err.message}. Please type your location instead.`);
      },
      { timeout: 10000 }
    );
  };

  const hasResults = coords !== null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-10 md:pt-16 font-sans">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 pt-4 pb-8">
          <Link href="/analyze">
            <Button variant="ghost" className="mb-4 text-slate-500 hover:text-primary gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Analyze
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              Find a Specialist Near You
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto mb-8">
              Connect with certified dermatologists for professional diagnosis and treatment options.
            </p>

            <form onSubmit={handleSearch} className="max-w-md mx-auto relative mb-3">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                className="pl-12 pr-28 h-14 rounded-full text-base border-slate-200 shadow-sm focus-visible:ring-primary/20"
                placeholder="City, State or Zip Code"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading || locating}
              />
              <Button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 rounded-full px-5"
                disabled={loading || locating || !location.trim()}
              >
                {loading && !locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </form>

            <Button
              variant="outline"
              onClick={handleUseMyLocation}
              disabled={loading || locating}
              className="gap-2 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation2 className="w-4 h-4" />
              )}
              {locating ? "Getting location..." : "Use My Current Location"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Map + Results */}
        {hasResults && (
          <div className="mb-10 space-y-6">
            <p className="text-sm text-slate-500">
              Showing results near: <span className="font-semibold text-slate-700">{coords.label}</span>
            </p>

            {/* OSM Map */}
            <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <iframe
                title="Dermatologists Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={getMapUrl(coords.lat, coords.lon)}
              />
            </div>

            {/* Loading spinner */}
            {loading && (
              <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Searching for nearby doctors...</p>
              </div>
            )}

            {/* Doctor Cards */}
            {!loading && doctors.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  {doctors.length} clinics & hospitals found nearby
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <Star className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">{doc.name}</h3>
                          <p className="text-xs text-slate-500 capitalize mb-2">{doc.type?.replace(/_/g, " ")}</p>
                          <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-2">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{doc.address}</span>
                          </div>
                          {doc.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <a href={`tel:${doc.phone}`} className="hover:text-primary hover:underline">
                                {doc.phone}
                              </a>
                            </div>
                          )}
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${doc.lat},${doc.lon}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline" className="gap-1 h-7 text-xs rounded-full">
                                <Navigation2 className="w-3 h-3" /> Directions
                              </Button>
                            </a>
                            {doc.website && (
                              <a href={doc.website} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs rounded-full text-blue-600">
                                  <Globe className="w-3 h-3" /> Website
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Why see a dermatologist */}
        {!hasResults && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Professional Diagnosis</h3>
              <p className="text-slate-500 text-sm">
                Dermatologists use dermoscopy and biopsy to accurately diagnose skin conditions that AI might miss.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Full Body Screening</h3>
              <p className="text-slate-500 text-sm">
                Doctors can check hard-to-see areas like your scalp and back to ensure total coverage.
              </p>
            </div>
          </div>
        )}

        {/* CTA Banner */}
        <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white text-center mb-10">
          <h3 className="text-2xl font-bold mb-4">Don't wait if you're unsure</h3>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Melanoma is highly treatable when detected early. If you see a changing mole, book an appointment today.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full font-semibold text-blue-700 hover:text-blue-800"
            onClick={() => window.open("https://www.aad.org/public/fad", "_blank")}
          >
            Find a Doctor via AAD <ExternalLink className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="text-center mb-6">
          <Button
            variant="outline"
            className="text-slate-500 border-slate-200 hover:bg-slate-100 px-8"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-slate-100">
          <Link href="/analyze">
            <Button variant="outline" className="rounded-full px-8 py-6 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
              <ArrowLeft className="w-4 h-4" /> Back to Analyze
            </Button>
          </Link>
          <Link href="/self-care">
            <Button className="rounded-full px-8 py-6 gap-2 shadow-lg shadow-primary/10 font-bold">
              Next Step: Daily Tips <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
