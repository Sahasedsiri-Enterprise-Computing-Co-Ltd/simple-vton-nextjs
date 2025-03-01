// page.tsx
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { ModelGenerator } from "@/components/model-generator";
import { GarmentUpload } from "@/components/garment-upload";
import { ResultSection } from "@/components/result-section";
import { useInputStore } from "@/store/use-input-store";
import { Loader2 } from "lucide-react";
import { resizeImage } from "@/lib/image";
import { BrandingUpload } from "@/components/branding-upload";

export default function LandingPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const [isModelUploading, setIsModelUploading] = useState<boolean>(false);

  // Grab input values from the global store
  const {
    modelType,
    modelUpload,
    templateAttributes,
    customPrompt,
    imageSize,
    garmentUpload,
    garmentType,
    setModelUpload,
  } = useInputStore();

  // Derive readiness based on the current input values
  const isModelReady = useMemo(() => {
    if (modelType === "upload") {
      return !!modelUpload;
    } else if (modelType === "template") {
      // Check that each expected attribute is filled (you may adjust this logic as needed)
      const allAttributesFilled =
        Object.keys(templateAttributes).length > 0 &&
        Object.keys(templateAttributes).every(
          (attr) => !!templateAttributes[attr]
        );
      return allAttributesFilled && !!imageSize;
    } else {
      return !!customPrompt && !!imageSize;
    }
  }, [modelType, modelUpload, templateAttributes, customPrompt, imageSize]);

  const isGarmentReady = !!garmentUpload && !!garmentType;

  const handleGenerate = async (
    isUpscale: boolean,
    api: string = "/api/generate"
  ) => {
    // You can now easily access all inputs from the store here
    const inputs = useInputStore.getState();
    console.log("Generating image with inputs:", inputs);

    setIsGenerating(true);
    setGeneratedImages([]);

    const modelBase64 = await resizeImage(modelUpload);
    const garmentBase64 = await resizeImage(garmentUpload);

    fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...inputs,
        modelUpload: modelBase64,
        garmentUpload: garmentBase64,
        isUpscale,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setGeneratedImages(data.output);
        setIsGenerating(false);
      })
      .catch((error) => {
        console.error("Error generating images:", error);
        setIsGenerating(false);
      });
  };

  const handleModelUpload = async (url: string) => {
    try {
      setIsModelUploading(true);

      const img = new Image();
      img.crossOrigin = "anonymous"; // Ensures CORS-compliant fetching
      img.src = url;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsModelUploading(false);
          console.error("Could not get canvas context");
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "model.jpg", { type: "image/jpeg" });
            console.log("Setting model upload:", file);
            setModelUpload(file);
            setIsModelUploading(false);
          }
        }, "image/jpeg");
      };

      img.onerror = (error) => {
        setIsModelUploading(false);
        console.error("Error loading image:", error);
      };
    } catch (error) {
      setIsModelUploading(false);
      console.error("Error processing image:", error);
    }
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
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <ModelGenerator />
              <GarmentUpload />
              <BrandingUpload />
            </div>
            <div className="flex justify-center items-center text-center mb-8 gap-2">
              <Button
                className="w-44"
                size="lg"
                onClick={() => handleGenerate(false, "/api/generate")}
                disabled={!isModelReady || !isGarmentReady || isGenerating}
              >
                {isGenerating && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
              <div>or</div>
              <Button
                className="w-44"
                size="lg"
                onClick={() => handleGenerate(true, "/api/generate")}
                disabled={!isModelReady || !isGarmentReady || isGenerating}
              >
                {isGenerating && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate HD"}
              </Button>
            </div>
            <div className="flex justify-center items-center text-center mb-8 gap-2">
              <Button
                className="w-44"
                size="lg"
                onClick={() => handleGenerate(false, "/api/generate2")}
                disabled={!isModelReady || !isGarmentReady || isGenerating}
              >
                {isGenerating && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate 2"}
              </Button>
              <div>or</div>
              <Button
                className="w-44"
                size="lg"
                onClick={() => handleGenerate(true, "/api/generate2")}
                disabled={!isModelReady || !isGarmentReady || isGenerating}
              >
                {isGenerating && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate 2 HD"}
              </Button>
            </div>
            <div className="flex justify-center items-center text-center mb-8 gap-2">
              <Button
                className="w-44"
                size="lg"
                onClick={() => handleGenerate(false, "/api/generate3")}
                disabled={!isModelReady || !isGarmentReady || isGenerating}
              >
                {isGenerating && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate 3"}
              </Button>
              <div>or</div>
              <Button
                className="w-44"
                size="lg"
                onClick={() => handleGenerate(true, "/api/generate3")}
                disabled={!isModelReady || !isGarmentReady || isGenerating}
              >
                {isGenerating && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate 3 HD"}
              </Button>
            </div>
            <ResultSection
              isGenerating={isGenerating}
              generatedImages={generatedImages}
              setModelUpload={handleModelUpload}
              isModelUploading={isModelUploading}
            />
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 VirtualFit. All rights reserved.</p>
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
