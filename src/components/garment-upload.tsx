"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GarmentUpload({
  onReady,
}: {
  onReady: (ready: boolean) => void;
}) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    onReady(!!uploadedFile);
  }, [uploadedFile, onReady]);

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
          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
        />
      </div>
    </div>
  );
}
