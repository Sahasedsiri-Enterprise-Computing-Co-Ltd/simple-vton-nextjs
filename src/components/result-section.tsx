"use client";
import NextImage from "next/image";
import { Button } from "./ui/button";
import {
  Download,
  Image as ImageIcon,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { useInputStore } from "@/store/use-input-store";
import { useEffect, useState } from "react";
import { saveAs } from "file-saver";

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

  const [isRembg, setIsRembg] = useState<boolean>(false);

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

  // Helper function to composite a foreground image over a background image.
  async function compositeWithBackground(
    foregroundUrl: string,
    backgroundUrl: string,
    topPadding: number = 100,
    bottomPadding: number = 100
  ): Promise<string> {
    // Load background image
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = backgroundUrl;
    await new Promise<void>((resolve, reject) => {
      bgImg.onload = () => resolve();
      bgImg.onerror = reject;
    });

    // Load foreground image
    const fgImg = new Image();
    fgImg.crossOrigin = "anonymous";
    fgImg.src = foregroundUrl;
    await new Promise<void>((resolve, reject) => {
      fgImg.onload = () => resolve();
      fgImg.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    canvas.width = bgImg.width;
    canvas.height = bgImg.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Draw the background image
    ctx.drawImage(bgImg, 0, 0);

    // Define the safe area based on adjustable top and bottom padding
    const safeAreaY = topPadding;
    const safeAreaHeight = bgImg.height - topPadding - bottomPadding;

    // Scale the foreground to fit within the safe area and the full background width
    const scale = Math.min(
      bgImg.width / fgImg.width,
      safeAreaHeight / fgImg.height
    );
    const fgWidth = fgImg.width * scale;
    const fgHeight = fgImg.height * scale;
    const offsetX = (bgImg.width - fgWidth) / 2;
    const offsetY = safeAreaY + (safeAreaHeight - fgHeight) / 2;

    // Draw the foreground image in the safe area
    ctx.drawImage(fgImg, offsetX, offsetY, fgWidth, fgHeight);

    return canvas.toDataURL("image/png");
  }

  // Updated handleRembg function to composite the removed background result with two local backgrounds
  const handleRembg = async (image: string) => {
    setIsRembg(true);
    try {
      const res = await fetch("/api/removebg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: image }),
      });
      const data = await res.json();
      const removedBgUrl = data.result;

      // Composite with local backgrounds
      const composite1 = await compositeWithBackground(
        removedBgUrl,
        "/bg3.png",
        150,
        150
      );

      // You can now use these composite images as needed.
      // For example, update state to display one or both:
      setResultImages([...resultImages, composite1]);
      // Optionally, store composite2 or display both.
    } catch (error) {
      console.error("Error processing remove background:", error);
    } finally {
      setIsRembg(false);
    }
  };

  // Helper: Convert any image (URL or base64) to a PNG blob via an offscreen canvas
  const convertToPng = (src: string): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      // Enable CORS if needed
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d")?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Conversion failed."));
        }, "image/png");
      };
      img.onerror = (err) => reject(err);
      img.src = src;
    });

  // Usage in your button click handler:
  const downloadImageAsPng = async (src: string) => {
    const random = Math.floor(Math.random() * 1000000);
    try {
      const pngBlob: Blob = await convertToPng(src);
      saveAs(pngBlob, `${random}.png`);
    } catch (error) {
      console.error("Error converting image:", error);
    }
  };

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
              />
              <div className="absolute flex gap-2 top-2 right-2">
                <Button
                  size="sm"
                  onClick={() => downloadImageAsPng(src)}
                  disabled={isModelUploading}
                >
                  {isModelUploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download />
                  )}
                  Download
                </Button>
                <Button
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
                <Button
                  size="sm"
                  onClick={() => handleRembg(src)}
                  disabled={isModelUploading || isRembg}
                >
                  {isModelUploading || isRembg ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ImageIcon />
                  )}
                  Change Background
                </Button>
              </div>
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
