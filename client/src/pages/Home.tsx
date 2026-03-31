import { Navigation } from "@/components/Navigation";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck, Brain, Smartphone, Activity, BarChart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-teal-50 opacity-50" />
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Heart className="w-3 h-3" />
              Our Mission
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 leading-tight mb-8">
              Protecting Your Skin with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Intelligence.</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
              SkinVision is a cutting-edge platform designed to empower individuals with AI-powered tools for early melanoma detection and better skin health management.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/analyze">
                <Button size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700">
                  Start Analysis
                </Button>
              </Link>
              <Link href="/self-care">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  Learn Self Care
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Detailed Project Info */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 font-display">What is SkinVision?</h2>
            <div className="space-y-4 text-slate-600">
              <p>
                Melanoma-Detect (SkinVision) is an innovative healthcare application that utilizes the state-of-the-art YOLOv8 (You Only Look Once) deep learning model to provide real-time skin lesion analysis.
              </p>
              <p>
                Our project aims to bridge the gap between clinical dermatology and home-based skin monitoring, providing accessible, high-quality preliminary assessments that encourage users to seek professional medical advice early.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-1">95% Accuracy</h4>
                <p className="text-xs text-slate-500">Trained on clinical datasets.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-1">Real-time</h4>
                <p className="text-xs text-slate-500">Instant results on any device.</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-2xl font-bold mb-6 text-slate-900">Why Use This App?</h3>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <BarChart className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Early Tracking</h4>
                  <p className="text-sm text-slate-500">Monitor changes in skin patterns over time to catch anomalies before they become critical.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                  <Activity className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Risk Assessment</h4>
                  <p className="text-sm text-slate-500">Get an instant confidence score based on millions of analyzed dermatological cases.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Heart className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Dermatologist Referral</h4>
                  <p className="text-sm text-slate-500">Integrated maps to help you find specialized care when your scan suggests a consultation.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 font-display">Key Technology Pillars</h2>
            <p className="text-slate-600">Our platform is built on three core foundations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={ShieldCheck}
              title="Medical Grade AI"
              description="Developed using a proprietary dataset of high-resolution dermoscopy scans."
            />
            <FeatureCard
              icon={Brain}
              title="State-of-the-art YOLO"
              description="Leverages the fastest and most accurate object detection framework available."
            />
            <FeatureCard
              icon={Smartphone}
              title="User-Centric Privacy"
              description="Your scans are processed with end-to-end encryption to ensure total data sovereignty."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
