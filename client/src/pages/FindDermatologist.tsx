import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ExternalLink, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function FindDermatologist() {
  const [location, setLocation] = useState("");
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const { logoutMutation } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      setActiveSearch(location.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-10 md:pt-12 font-sans">
      <Navigation />

      {activeSearch ? (
        <div className="bg-white min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveSearch(null)}
              className="mb-4 rounded-full gap-2 border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Button>
            
            <div className="w-full h-[75vh] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative">
              <iframe
                title="Dermatologists Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=dermatologists+near+${encodeURIComponent(activeSearch)}&output=embed`}
              />
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <p>Viewing specialist results for: <span className="font-bold text-slate-600">{activeSearch}</span></p>
              <Link href="/analyze">
                <Button variant="ghost" className="text-blue-600 p-0 h-auto text-xs font-bold hover:bg-transparent hover:underline">
                  Return to AI Scan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white border-b border-slate-100">
            <div className="max-w-5xl mx-auto px-6 pt-4 pb-8">
              <Link href="/analyze">
                <Button variant="ghost" className="mb-4 text-slate-500 hover:text-primary gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Analyze
                </Button>
              </Link>
              
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                  Find a Specialist Near You
                </h1>
                <p className="text-slate-500 max-w-xl mx-auto mb-8">
                  Connect with certified dermatologists for professional diagnosis and treatment options.
                </p>

                <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    className="pl-12 pr-32 h-14 rounded-full text-base border-slate-200 shadow-sm focus-visible:ring-primary/20"
                    placeholder="City, State or Zip Code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 rounded-full px-6"
                  >
                    Search
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Why see a dermatologist?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="mt-12 bg-blue-600 rounded-3xl p-8 md:p-12 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Don't wait if you're unsure</h3>
              <p className="text-blue-100 max-w-2xl mx-auto mb-8">
                Melanoma is highly treatable when detected early. If you see a changing mole, book an appointment today.
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full font-semibold text-blue-700 hover:text-blue-800"
                onClick={() => window.open('https://www.aad.org/public/fad', '_blank')}
              >
                Find a Doctor via AAD <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="mt-12 text-center">
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
            <div className="mt-16 flex justify-between items-center pb-12 pt-8 border-t border-slate-100">
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
        </>
      )}
    </div>
  );
}
