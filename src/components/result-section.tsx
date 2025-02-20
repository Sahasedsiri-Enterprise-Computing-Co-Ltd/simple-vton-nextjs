"use client";
import NextImage from "next/image";
import { Button } from "./ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { useInputStore } from "@/store/use-input-store";
import { useEffect, useState } from "react";

interface ResultSectionProps {
  isGenerating: boolean;
  generatedImages: string[];
  setModelUpload: (url: string) => Promise<void>;
  isModelUploading: boolean;
}

export function ResultSection({
  isGenerating,
  generatedImages,
  setModelUpload,
  isModelUploading,
}: ResultSectionProps) {
  const { brandingUpload } = useInputStore();
  const [resultImages, setResultImages] = useState<string[]>(generatedImages);

  // Composites the base image with a watermark and returns a data URL.
  async function compositeImageWithWatermark(
    imageSrc: string,
    watermarkFile: File
  ) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return imageSrc;

    // Load the base image.
    const baseImage = new Image();
    baseImage.crossOrigin = "anonymous";
    baseImage.src = imageSrc;
    await new Promise<void>((resolve, reject) => {
      baseImage.onload = () => resolve();
      baseImage.onerror = reject;
    });

    canvas.width = baseImage.width;
    canvas.height = baseImage.height;
    ctx.drawImage(baseImage, 0, 0);

    // Load the watermark image.
    const watermarkUrl = URL.createObjectURL(watermarkFile);
    const watermarkImage = new Image();
    watermarkImage.src = watermarkUrl;
    await new Promise<void>((resolve, reject) => {
      watermarkImage.onload = () => resolve();
      watermarkImage.onerror = reject;
    });

    // Set watermark size (20% of the base image width) and position (top left with margin).
    const margin = 10;
    const watermarkWidth = baseImage.width * 0.2;
    const watermarkHeight =
      (watermarkImage.height / watermarkImage.width) * watermarkWidth;
    ctx.drawImage(
      watermarkImage,
      margin,
      margin,
      watermarkWidth,
      watermarkHeight
    );

    return canvas.toDataURL("image/png");
  }

  useEffect(() => {
    if (!brandingUpload) {
      setResultImages(generatedImages);
      return;
    }

    (async () => {
      try {
        const watermarkedImages = await Promise.all(
          generatedImages.map((src) =>
            src ? compositeImageWithWatermark(src, brandingUpload) : src
          )
        );

        setResultImages([...watermarkedImages, ...generatedImages]);
      } catch (error) {
        console.error("Error compositing images:", error);
        setResultImages(generatedImages);
      }
    })();
  }, [generatedImages, brandingUpload]);

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isGenerating ? (
          // Loading skeletons
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-lg aspect-[3/4] animate-pulse"
            />
          ))
        ) : resultImages && resultImages.length > 0 ? (
          // Generated images
          resultImages.map((src, index) => (
            <div key={index} className="relative aspect-[3/4]">
              <NextImage
                src={src}
                alt={`Generated image ${index + 1}`}
                fill
                style={{
                  objectFit: "contain",
                }}
                unoptimized
              />
              <Button
                className="absolute top-2 right-2"
                size="sm"
                onClick={() => setModelUpload(src)}
                disabled={isModelUploading}
              >
                {isModelUploading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <PlusCircle />
                )}
                Use Image
              </Button>
            </div>
          ))
        ) : (
          // Placeholder when no images are generated
          <div className="col-span-full text-center text-gray-500">
            No images generated yet. Click {`"Generate"`} to start.
          </div>
        )}
      </div>
    </div>
  );
}
