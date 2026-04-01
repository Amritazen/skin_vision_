import { Navigation } from "@/components/Navigation";
import { UVWidget } from "@/components/UVWidget";
import { Sun, Droplets, Calendar, Eye, Clock, ShieldCheck, Sparkles, Wind, CheckCircle2, Mail, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function SelfCare() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [notification, setNotification] = useState<any>(null);
  async function handleSetReminder(e: React.FormEvent) {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      // Request browser notification permission
      if ("Notification" in window) {
        let permission = Notification.permission;
        if (permission === "default") {
          permission = await Notification.requestPermission();
        }
        
        if (permission === "granted") {
          new Notification("🩺 SkinVision Notifications Active!", {
            body: "You will now receive monthly reminders to perform your skin check.",
            icon: "/favicon.ico",
          });
          
          setIsSuccess(true);
          toast({
            title: "✅ Notifications enabled!",
            description: "We'll remind you monthly to perform your skin scan.",
          });
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings to receive reminders.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Not Supported",
          description: "Your browser doesn't support desktop notifications.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Reminder error:", error);
      toast({
        title: "Error",
        description: "Could not set reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-10 md:pt-16">
      <Navigation />

      <div className="max-w-5xl mx-auto px-6 pt-4 pb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Daily Self-Care</h1>
        <p className="text-slate-500 mb-8">Monitor UV levels and maintain healthy skin habits.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main UV Widget */}
          <div className="lg:col-span-1">
            <UVWidget />
            <div className="mt-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
              <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Peak Sun Hours
              </h4>
              <p className="text-xs text-slate-500">
                UV radiation is typically strongest between 10 AM and 4 PM. Seek shade during these times.
              </p>
            </div>

            {/* Innovative Monthly Checks with Animated Form */}
            <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              {/* Decorative background element */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />

              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col h-full justify-between z-10"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-emerald-600 bg-emerald-50/50 backdrop-blur-sm border border-emerald-100 ring-4 ring-emerald-50/20">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">Monthly Checks</h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">
                        Get a monthly "SkinVision" notification to keep your skin health on track.
                      </p>
                    </div>

                    <form onSubmit={handleSetReminder} className="space-y-3">
                      <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Enable Browser Pop-ups
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center text-center py-4 h-full justify-center z-10"
                  >
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-xl shadow-emerald-100 ring-8 ring-emerald-50">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Pop-ups Enabled!</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      You'll receive a notification pop-up every month for your skin check.
                    </p>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] h-7 text-slate-400 hover:text-slate-600"
                      onClick={() => setIsSuccess(false)}
                    >
                      Reset Settings
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tips Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TipCard
              icon={ShieldCheck}
              color="text-orange-500 bg-orange-50"
              title="Moisturizer & Sunscreen Duo"
              description="Apply moisturizer first, then broad-spectrum SPF 30+. The duo keeps skin hydrated and protected from UV rays."
            />
            <TipCard
              icon={Droplets}
              color="text-blue-500 bg-blue-50"
              title="Stay Hydrated"
              description="Hydrated skin is more resilient. Drink at least 8 glasses of water daily."
            />
            <TipCard
              icon={Eye}
              color="text-purple-500 bg-purple-50"
              title="Eye Protection"
              description="UV rays can cause cataracts and eyelid cancers. Always wear 100% UV-blocking sunglasses and wide-brimmed hats when outdoors."
            />
            <TipCard
              icon={Wind}
              color="text-cyan-500 bg-cyan-50"
              title="Winter Skin Care"
              description="Cold air and indoor heat dehydrate skin. Switch to oil-based moisturizers and don't skip SPF—snow reflects up to 80% of UV rays."
            />
            <TipCard
              icon={Sparkles}
              color="text-amber-500 bg-amber-50"
              title="Skin Nutrition"
              description="Antioxidant-rich foods like berries, leafy greens, and fatty fish (Omega-3s) help repair skin cells and improve natural UV resilience."
            />
            <TipCard
              icon={ShieldCheck}
              color="text-rose-500 bg-rose-50"
              title="Know Your ABCDEs"
              description="Monitor moles for Asymmetry, Border irregularity, Color changes, Diameter >6mm, and Evolution over time."
            />

          </div>
        </div>

        {/* Skin Type Recommendations Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Skin Type Recommendations</h2>
            <p className="text-slate-500">Select your skin type to see specialized care tips for sun protection and hydration.</p>
          </div>

          <Tabs defaultValue="normal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
              <TabsTrigger value="sensitive">Sensitive</TabsTrigger>
              <TabsTrigger value="dry">Dry</TabsTrigger>
              <TabsTrigger value="normal">Normal</TabsTrigger>
              <TabsTrigger value="oily">Oily</TabsTrigger>
              <TabsTrigger value="combination">Combination</TabsTrigger>
            </TabsList>

            <TabsContent value="sensitive">
              <SkinTypeCard
                title="Sensitive Skin Care"
                description="Needs gentle, non-irritating protection."
                icon={Sparkles}
                tips={[
                  "Use mineral sunscreens with Zinc Oxide or Titanium Dioxide.",
                  "Avoid fragrance, alcohol, and harsh chemicals.",
                  "Apply a soothing, fragrance-free moisturizer before sunscreen.",
                  "Look for 'hypoallergenic' and 'non-comedogenic' labels."
                ]}
              />
            </TabsContent>

            <TabsContent value="dry">
              <SkinTypeCard
                title="Dry Skin Care"
                description="Focus on maximum hydration and barrier support."
                icon={Droplets}
                tips={[
                  "Use cream-based moisturizers with ceramides or hyaluronic acid.",
                  "Choose hydrating sunscreens with moisturizing ingredients.",
                  "Apply products while skin is slightly damp to lock in moisture.",
                  "Reapply sunscreen frequently as dry skin can flake."
                ]}
              />
            </TabsContent>

            <TabsContent value="normal">
              <SkinTypeCard
                title="Normal Skin Care"
                description="Maintain balance and consistent protection."
                icon={CheckCircle2}
                tips={[
                  "Use lightweight lotions or emulsions for daily hydration.",
                  "Any broad-spectrum SPF 30+ sunscreen works well for you.",
                  "Cleanse daily to remove environmental pollutants.",
                  "Maintain your current healthy routine consistently."
                ]}
              />
            </TabsContent>

            <TabsContent value="oily">
              <SkinTypeCard
                title="Oily Skin Care"
                description="Control shine without clogging pores."
                icon={Droplets}
                tips={[
                  "Use oil-free, non-comedogenic (won't clog pores) products.",
                  "Look for 'matte-finish' or 'gel' sunscreens to control shine.",
                  "Cleanse twice daily with a gentle, foaming cleanser.",
                  "Don't skip moisturizer; dehydration can trigger more oil production."
                ]}
              />
            </TabsContent>

            <TabsContent value="combination">
              <SkinTypeCard
                title="Combination Skin Care"
                description="Manage oily T-zones and dry cheeks."
                icon={Wind}
                tips={[
                  "Use oil-free or gel-based moisturizers on oily areas.",
                  "Choose 'matte-finish' sunscreens to reduce shine.",
                  "Focus hydration on drier areas like cheeks and eyes.",
                  "Consider 'dual-action' products designed for balanced skin."
                ]}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* ABCDE Guide */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-12">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">The ABCDE Rule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-8">
            <ABCDEItem letter="A" title="Asymmetry" desc="One half does not match the other." />
            <ABCDEItem letter="B" title="Border" desc="Edges are irregular, ragged, or blurred." />
            <ABCDEItem letter="C" title="Color" desc="Color is not uniform (shades of tan, brown, black)." />
            <ABCDEItem letter="D" title="Diameter" desc="Larger than a pencil eraser (>6mm)." />
            <ABCDEItem letter="E" title="Evolving" desc="Changing in size, shape, or color." />
          </div>
        </div>

        {/* Fitzpatrick Scale Section */}
        <div className="bg-blue-50 rounded-3xl p-10 shadow-sm border border-blue-100">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-display font-bold mb-4 text-slate-900">Fitzpatrick Skin Phototypes</h2>
            <p className="text-slate-600 mb-10 leading-relaxed font-medium">
              The Fitzpatrick scale is a clinical classification for skin color and its reaction to UV radiation. Knowing your type helps determine your risk level for skin damage and melanoma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FitzpatrickItem 
              type="Type I" 
              color="bg-[#F8E0D0]" 
              desc="Very fair skin, blue/green eyes. Always burns, never tans. Highest risk for skin cancer." 
            />
            <FitzpatrickItem 
              type="Type II" 
              color="bg-[#F1C27D]" 
              desc="Fair skin, blue eyes. Burns easily, tans minimally. High risk for sun damage." 
            />
            <FitzpatrickItem 
              type="Type III" 
              color="bg-[#E0AC69]" 
              desc="Creamy white skin. Sometimes burns, tans uniformly. Moderate risk." 
            />
            <FitzpatrickItem 
              type="Type IV" 
              color="bg-[#8D5524]" 
              desc="Olive or light brown skin. Rarely burns, tans easily. Low to moderate risk." 
            />
            <FitzpatrickItem 
              type="Type V" 
              color="bg-[#663300]" 
              desc="Dark brown skin. Very rarely burns, tans very easily. Lower but present risk." 
            />
            <FitzpatrickItem 
              type="Type VI" 
              color="bg-[#2B1B17]" 
              desc="Deeply pigmented skin. Never burns, tans deeply. Risk exists; check palms/soles." 
            />
          </div>
          
          <div className="mt-10 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-sm">
            <p className="text-sm text-slate-800 italic font-medium">
              <strong>Clinical Note:</strong> Regardless of your skin type, melanoma can occur in any individual. People with darker skin (Types IV-VI) should pay special attention to areas like palms, soles of the feet, and under nails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FitzpatrickItem({ type, color, desc }: { type: string, color: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all shadow-sm group">
      <div className={`w-full h-4 rounded-full mb-4 ${color} ring-4 ring-white shadow-inner`} />
      <h4 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">{type}</h4>
      <p className="text-sm text-slate-600 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function TipCard({ icon: Icon, color, title, description }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function SkinTypeCard({ title, description, icon: Icon, tips }: any) {
  return (
    <Card className="border-slate-100">
      <CardHeader>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tips.map((tip: string, i: number) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600">
              <div className="mt-1 w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              </div>
              {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ABCDEItem({ letter, title, desc }: any) {
  return (
    <div className="text-center sm:text-left">
      <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-3 mx-auto sm:mx-0">
        {letter}
      </div>
      <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );
}
