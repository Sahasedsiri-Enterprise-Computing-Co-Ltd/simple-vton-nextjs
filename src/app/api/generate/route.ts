import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_API_KEY,
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
      if (size === "4:3") return "portrait_4_3";
      if (size === "1:1") return "square";
      if (size === "3:4") return "landscape_4_3";
      return "square";
    };

    const mapPromptFromTemplate = (template: Record<string, string>) => {
      return `A photo realistic portrait of ${template.bodySize} ${template.age} ${template.nationality} ${template.gender} ${template.pose} in a ${template.background} background wearing a white t-shirt and a black pants.`;
    };

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt:
          modelType === "template"
            ? mapPromptFromTemplate(templateAttributes)
            : `A photo realistic portrait of a ${customPrompt}`,
        image_size: mapImageSize(imageSize),
      },
    });

    modelUrl = result.data.images[0].url;
  }

  const vtonResults = await Promise.all([
    fal.subscribe("fashn/tryon", {
      input: {
        model_image: modelUrl,
        garment_image: garmentUrl,
        category: garmentType,
      },
    }),
    fal.subscribe("fal-ai/kling/v1-5/kolors-virtual-try-on", {
      input: {
        human_image_url: modelUrl,
        garment_image_url: garmentUrl,
      },
    }),
  ]);

  if (!isUpscale) {
    return NextResponse.json({
      output: [
        vtonResults[0].data.images[0].url,
        vtonResults[1].data.image.url,
      ],
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

  const upscaleResults = await Promise.all([
    upscale(vtonResults[0].data.images[0].url),
    upscale(vtonResults[1].data.image.url),
  ]);

  return NextResponse.json({
    output: upscaleResults,
  });
}
