"use client";
import Image from "next/image";

interface ResultSectionProps {
  isGenerating: boolean;
  generatedImages: string[];
}

export function ResultSection({
  isGenerating,
  generatedImages,
}: ResultSectionProps) {
  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Results</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isGenerating ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-lg aspect-[3/4] animate-pulse"
            />
          ))
        ) : generatedImages.length > 0 ? (
          // Generated images
          generatedImages.map((src, index) => (
            <div key={index} className="relative aspect-[3/4]">
              <Image
                src={src || "/placeholder.svg"}
                alt={`Generated image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))
        ) : (
          // Placeholder when no images are generated
          <div className="col-span-full text-center text-gray-500">
            No images generated yet. Click "Generate" to start.
          </div>
        )}
      </div>
    </div>
  );
}
