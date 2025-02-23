import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_API_KEY,
});

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  // Parse the request body as JSON
  const { imageUrl } = await req.json();

  const result = await fal.subscribe("fal-ai/bria/background/remove", {
    input: {
      image_url: imageUrl,
    },
  });

  return NextResponse.json({
    result: result.data.image.url,
  });
}
