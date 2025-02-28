import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import Replicate from "replicate";

fal.config({
  credentials: process.env.FAL_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const maxDuration = 300;

async function uploadBase64Image(
  base64String: string,
  fileName: string,
  mimeType: string
) {
  const base64Data = base64String.split(",")[1] || base64String;

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: mimeType });

  const file = new File([blob], fileName, { type: mimeType });

  const url = await fal.storage.upload(file);

  console.log("Uploaded Image URL:", url);

  return url;
}

export async function POST(req: NextRequest) {
  // Parse the request body as JSON
  const {
    modelType,
    modelUpload,
    templateAttributes,
    customPrompt,
    imageSize,
    garmentUpload,
    garmentType,
    isUpscale,
  } = await req.json();

  let modelUrl = "";
  const garmentUrl = await uploadBase64Image(
    garmentUpload,
    "garment.jpg",
    "image/jpeg"
  );

  if (modelType === "upload") {
    modelUrl = await uploadBase64Image(modelUpload, "model.jpg", "image/jpeg");
  } else {
    const mapImageSize = (size: string) => {
      if (size === "3:4") return "portrait_4_3";
      if (size === "1:1") return "square";
      if (size === "4:3") return "landscape_4_3";
      return "square";
    };

    const mapPromptFromTemplate = (template: Record<string, string>) => {
      return `A full-body realistic photo of a ${template.bodySize} body size, ${template.age}, ${template.nationality}, ${template.gender} ${template.pose} in a ${template.background} background wearing a white t-shirt and a black pants. Facing the camera. High Quality. Photographic. full-length portrait. Fashion model. Magazine.`;
    };

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt:
          modelType === "template"
            ? mapPromptFromTemplate(templateAttributes)
            : `A full-body realistic photo of a ${customPrompt}. Facing the camera. High Quality. Photographic. full-length portrait. Fashion model. Magazine.`,
        image_size: mapImageSize(imageSize),
        enable_safety_checker: false,
      },
    });

    modelUrl = result.data.images[0].url;
  }

  const garmentTypeMap: Record<
    string,
    "upper_body" | "lower_body" | "dresses"
  > = {
    tops: "upper_body",
    bottoms: "lower_body",
    "one-pieces": "dresses",
  };

  const prediction = await replicate.predictions.create({
    version: "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
    input: {
      crop: false,
      seed: 42,
      steps: 30,
      category: garmentTypeMap[garmentType] || "upper_body",
      force_dc: false,
      garm_img: garmentUrl,
      human_img: modelUrl,
      mask_only: false,
      garment_des: "realistic, high quality, hd, 8k",
    },
  });

  const result = await replicate.wait(prediction);

  if (!isUpscale) {
    return NextResponse.json({
      output: [result.output],
    });
  }

  const upscale = async (url: string) => {
    const result = await fal.subscribe("fal-ai/recraft-clarity-upscale", {
      input: {
        image_url: url,
      },
    });

    return result.data.image.url;
  };

  const upscaleResult = await upscale(result.output);

  return NextResponse.json({
    output: [upscaleResult],
  });
}
