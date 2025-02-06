// model-generator.tsx
"use client";

import { useEffect, useState } from "react";
import { useInputStore, ModelType } from "@/store/use-input-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import Image from "next/image";

const attributes = {
  nationality: {
    label: "National",
    options: ["Japanese", "American", "English", "Chinese", "Indian"],
  },
  bodySize: {
    label: "Body Size",
    options: ["Slim", "Average", "Athletic", "Chubby", "Plus-size"],
  },
  pose: {
    label: "Pose",
    options: ["Standing", "Sitting", "Walking", "Running", "Jumping"],
  },
  background: {
    label: "Background",
    options: ["City", "Beach", "Mountains", "Studio", "Office"],
  },
  age: {
    label: "Age",
    options: ["Child", "Teenager", "Young Adult", "Middle-aged", "Senior"],
  },
  gender: {
    label: "Gender",
    options: ["Man", "Woman", "Boy", "Girl"],
  },
};

const imageSizes = [
  { name: "Portrait", ratio: "3:4" },
  { name: "Square", ratio: "1:1" },
  { name: "Landscape", ratio: "4:3" },
];

export function ModelGenerator() {
  const {
    setModelType,
    modelUpload,
    setModelUpload,
    setTemplateAttribute,
    customPrompt,
    setCustomPrompt,
    imageSize,
    setImageSize,
  } = useInputStore();

  // State for the preview of the model image upload
  const [modelPreviewURL, setModelPreviewURL] = useState<string | null>(null);

  useEffect(() => {
    if (modelUpload) {
      const url = URL.createObjectURL(modelUpload);
      setModelPreviewURL(url);
      // Cleanup the object URL on change/unmount
      return () => URL.revokeObjectURL(url);
    } else {
      setModelPreviewURL(null);
    }
  }, [modelUpload]);

  const ImageSizeButtons = () => (
    <div className="flex flex-wrap gap-2 mt-4">
      <Label className="w-full">Image Size</Label>
      {imageSizes.map((size) => (
        <Button
          key={size.ratio}
          variant={imageSize === size.ratio ? "default" : "outline"}
          onClick={() => setImageSize(size.ratio)}
          className="flex-1"
        >
          {size.name} ({size.ratio})
        </Button>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">1. Choose Your Model</h3>
      <Tabs
        defaultValue="upload"
        onValueChange={(value) => setModelType(value as ModelType)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
          <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <div className="mt-4">
            <Label htmlFor="model-upload">Upload your model image</Label>
            <Input
              id="model-upload"
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) =>
                setModelUpload(
                  e.target.files && e.target.files[0] ? e.target.files[0] : null
                )
              }
            />
          </div>

          {/* Show image preview for the model upload if available */}
          {modelPreviewURL && (
            <div className="relative mt-4">
              <Image
                src={modelPreviewURL}
                alt="Model preview"
                className="w-full max-h-60 object-contain rounded"
              />
              <Button
                className="absolute top-2 right-2"
                size="sm"
                onClick={() => setModelUpload(null)}
              >
                <RotateCcw />
                Clear Image
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="template">
          <div className="grid grid-cols-2 gap-4 mt-4">
            {Object.entries(attributes).map(([attr, value]) => (
              <div key={attr}>
                <Label htmlFor={attr}>{value.label}</Label>
                <Select
                  onValueChange={(value) => setTemplateAttribute(attr, value)}
                >
                  <SelectTrigger id={attr}>
                    <SelectValue placeholder={`Select ${attr}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {value.options.map((option) => (
                      <SelectItem key={option} value={option.toLowerCase()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <ImageSizeButtons />
        </TabsContent>
        <TabsContent value="custom">
          <div className="mt-4">
            <Label htmlFor="custom-prompt">Custom Prompt</Label>
            <Textarea
              id="custom-prompt"
              placeholder="Describe your model in detail..."
              className="mt-1"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>
          <ImageSizeButtons />
        </TabsContent>
      </Tabs>
    </div>
  );
}
