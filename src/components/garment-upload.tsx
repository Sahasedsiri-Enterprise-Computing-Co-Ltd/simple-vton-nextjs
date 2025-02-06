// garment-upload.tsx
"use client";

import { useEffect, useState } from "react";
import { useInputStore } from "@/store/use-input-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Image from "next/image";

const garmentTypes = [
  { name: "Top", value: "tops" },
  { name: "Bottom", value: "bottoms" },
  { name: "One-Piece", value: "one-pieces" },
];

export function GarmentUpload() {
  const { garmentUpload, setGarmentUpload, garmentType, setGarmentType } =
    useInputStore();
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  // Generate a preview URL when garmentUpload changes
  useEffect(() => {
    if (garmentUpload) {
      const url = URL.createObjectURL(garmentUpload);
      setPreviewURL(url);
      // Cleanup the object URL when the file changes or the component unmounts
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewURL(null);
    }
  }, [garmentUpload]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">2. Upload Your Garment</h3>
      <div className="mt-4">
        <Label htmlFor="garment-upload">Upload your garment image</Label>
        <Input
          id="garment-upload"
          type="file"
          accept="image/*"
          className="mt-1"
          onChange={(e) =>
            setGarmentUpload(
              e.target.files && e.target.files[0] ? e.target.files[0] : null
            )
          }
        />
      </div>

      {/* Show image preview if available */}
      {previewURL && (
        <div className="relative mt-4">
          <Image
            src={previewURL}
            alt="Garment preview"
            className="w-full max-h-60 object-contain rounded"
          />
          <Button
            className="absolute top-2 right-2"
            size="sm"
            onClick={() => setGarmentUpload(null)}
          >
            <RotateCcw />
            Clear Image
          </Button>
        </div>
      )}

      <div className="mt-4">
        <Label className="block mb-2">Garment Type</Label>
        <div className="flex flex-wrap gap-2">
          {garmentTypes.map((type) => (
            <Button
              key={type.value}
              variant={garmentType === type.value ? "default" : "outline"}
              onClick={() => setGarmentType(type.value)}
              className="flex-1"
            >
              {type.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
