"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { ModelGenerator } from "@/components/model-generator";
import { GarmentUpload } from "@/components/garment-upload";
import { ResultSection } from "@/components/result-section";

export default function LandingPage() {
  const [modelReady, setModelReady] = useState(false);
  const [garmentReady, setGarmentReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleModelReady = (ready: boolean) => setModelReady(ready);
  const handleGarmentReady = (ready: boolean) => setGarmentReady(ready);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedImages([]);
    // Simulate generation process
    setTimeout(() => {
      setGeneratedImages([
        "/placeholder.svg?height=400&width=300",
        "/placeholder.svg?height=400&width=300",
        "/placeholder.svg?height=400&width=300",
        "/placeholder.svg?height=400&width=300",
      ]);
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">VirtualFit</span>
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link
                  href="#features"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link href="#cta" className="text-gray-600 hover:text-gray-900">
                  Try Now
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-purple-400 to-pink-500 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Virtual Try-On: The Future of Shopping
            </h1>
            <p className="text-xl mb-8">
              Experience clothes and accessories without leaving your home.
            </p>
            <Button size="lg" asChild>
              <Link href="#cta">Get Started</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                title="Realistic Previews"
                description="See how clothes look on you with our advanced AR technology."
                icon="👕"
              />
              <FeatureCard
                title="Wide Selection"
                description="Try on items from various brands and styles."
                icon="🛍️"
              />
              <FeatureCard
                title="Easy to Use"
                description="Simple interface for a seamless virtual shopping experience."
                icon="📱"
              />
            </div>
          </div>
        </section>

        <section id="cta" className="bg-gray-100 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">
              Ready to Transform Your Shopping Experience?
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <ModelGenerator onReady={handleModelReady} />
              <GarmentUpload onReady={handleGarmentReady} />
            </div>
            <div className="text-center mb-8">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!modelReady || !garmentReady || isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Virtual Try-On"}
              </Button>
            </div>
            <ResultSection
              isGenerating={isGenerating}
              generatedImages={generatedImages}
            />
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 VirtualFit. All rights reserved.</p>
          <div className="mt-4">
            <Link href="#" className="text-gray-400 hover:text-white mx-2">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white mx-2">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
