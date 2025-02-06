"use client";

import { useState, useEffect } from "react";
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

const attributes = {
  nationality: ["Japanese", "American", "English", "Chinese", "Indian"],
  bodySize: ["Slim", "Average", "Athletic", "Chubby", "Plus-size"],
  pose: ["Standing", "Sitting", "Walking", "Running", "Jumping"],
  background: ["City", "Beach", "Mountains", "Studio", "Office"],
  age: ["Child", "Teenager", "Young Adult", "Middle-aged", "Senior"],
  hairColor: ["Black", "Brown", "Blonde", "Red", "Gray"],
};

const imageSizes = [
  { name: "Portrait", ratio: "3:4" },
  { name: "Square", ratio: "1:1" },
  { name: "Landscape", ratio: "4:3" },
];

export function ModelGenerator({
  onReady,
}: {
  onReady: (ready: boolean) => void;
}) {
  const [modelType, setModelType] = useState("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [templateAttributes, setTemplateAttributes] = useState<
    Record<string, string>
  >({});
  const [customPrompt, setCustomPrompt] = useState("");
  const [imageSize, setImageSize] = useState("");

  useEffect(() => {
    if (modelType === "upload") {
      onReady(!!uploadedFile);
    } else if (modelType === "template") {
      const allAttributesFilled = Object.keys(attributes).every(
        (attr) => !!templateAttributes[attr]
      );
      onReady(allAttributesFilled && !!imageSize);
    } else {
      onReady(!!customPrompt && !!imageSize);
    }
  }, [
    modelType,
    uploadedFile,
    templateAttributes,
    customPrompt,
    imageSize,
    onReady,
  ]);

  const handleAttributeChange = (attribute: string, value: string) => {
    setTemplateAttributes((prev) => ({ ...prev, [attribute]: value }));
  };

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
      <Tabs defaultValue="upload" onValueChange={setModelType}>
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
              onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
            />
          </div>
        </TabsContent>
        <TabsContent value="template">
          <div className="grid grid-cols-2 gap-4 mt-4">
            {Object.entries(attributes).map(([attr, options]) => (
              <div key={attr}>
                <Label htmlFor={attr}>
                  {attr.charAt(0).toUpperCase() + attr.slice(1)}
                </Label>
                <Select
                  onValueChange={(value) => handleAttributeChange(attr, value)}
                >
                  <SelectTrigger id={attr}>
                    <SelectValue placeholder={`Select ${attr}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
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
