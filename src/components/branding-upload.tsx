// branding-upload.tsx
"use client";

import { useEffect, useState } from "react";
import { useInputStore } from "@/store/use-input-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Image from "next/image";

export function BrandingUpload() {
  const { brandingUpload, setBrandingUpload } = useInputStore();
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  // Generate a preview URL when brandingUpload changes
  useEffect(() => {
    if (brandingUpload) {
      const url = URL.createObjectURL(brandingUpload);
      setPreviewURL(url);
      // Cleanup the object URL when the file changes or the component unmounts
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewURL(null);
    }
  }, [brandingUpload]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">
        3. Upload Your Branding (Optional)
      </h3>
      <div className="mt-4">
        <Label htmlFor="branding-upload">Upload your branding image</Label>
        <Input
          id="branding-upload"
          type="file"
          accept="image/*"
          className="mt-1"
          onChange={(e) =>
            setBrandingUpload(
              e.target.files && e.target.files[0] ? e.target.files[0] : null
            )
          }
        />
      </div>

      {/* Show image preview if available */}
      {previewURL && (
        <div className="relative mt-4 w-full h-[300px]">
          <Image
            src={previewURL}
            alt="Brand preview"
            fill
            style={{
              objectFit: "contain",
            }}
          />
          <Button
            className="absolute top-2 right-2"
            size="sm"
            onClick={() => setBrandingUpload(null)}
          >
            <RotateCcw />
            Clear Image
          </Button>
        </div>
      )}
    </div>
  );
}
