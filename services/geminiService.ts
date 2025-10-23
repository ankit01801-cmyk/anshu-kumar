/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  GoogleGenAI,
  Video,
  VideoGenerationReferenceImage,
  VideoGenerationReferenceType,
} from '@google/genai';
import {GenerateVideoParams} from '../types';

const constructPrompt = (params: GenerateVideoParams): string => {
  let prompt = `Create a ${params.videoStyle.toLowerCase()}, 15-second e-commerce product video for the '${params.productName}'.\n\n`;

  if (params.targetAudience) {
    prompt += `The video should be dynamic and engaging, targeting ${params.targetAudience}.\n\n`;
  }

  if (params.keyFeatures) {
    prompt += `Showcase the following key features:\n${params.keyFeatures
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line)
      .join('\n')}\n\n`;
  }

  prompt +=
    'Use smooth transitions, clean graphics, and upbeat, modern background music. The video should feel professional and high-quality.\n\n';
  prompt +=
    "Use the provided images as strong visual references for the product's appearance and functionality.";

  return prompt;
};

// Fix: API key is now handled by process.env.API_KEY, so it's removed from parameters.
export const generateVideo = async (
  params: GenerateVideoParams,
): Promise<{objectUrl: string; blob: Blob; uri: string; video: Video}> => {
  console.log('Starting e-commerce video generation with params:', params);

  // Fix: API key must be obtained from process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const finalPrompt = constructPrompt(params);
  console.log('Constructed Prompt:', finalPrompt);

  const referenceImagesPayload: VideoGenerationReferenceImage[] = [];

  if (params.productImages) {
    for (const img of params.productImages) {
      console.log(`Adding reference image: ${img.file.name}`);
      referenceImagesPayload.push({
        image: {
          imageBytes: img.base64,
          mimeType: img.file.type,
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      });
    }
  }

  const generateVideoPayload: any = {
    model: params.model,
    prompt: finalPrompt,
    config: {
      numberOfVideos: 1,
      resolution: params.resolution,
      aspectRatio: params.aspectRatio,
      referenceImages: referenceImagesPayload,
    },
  };

  console.log('Submitting video generation request...', generateVideoPayload);
  let operation = await ai.models.generateVideos(generateVideoPayload);
  console.log('Video generation operation started:', operation);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log('...Generating...');
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  if (operation?.response) {
    const videos = operation.response.generatedVideos;

    if (!videos || videos.length === 0) {
      throw new Error('No videos were generated.');
    }

    const firstVideo = videos[0];
    if (!firstVideo?.video?.uri) {
      throw new Error('Generated video is missing a URI.');
    }
    const videoObject = firstVideo.video;

    const url = decodeURIComponent(videoObject.uri);
    console.log('Fetching video from:', url);

    // Fix: The API key for fetching the video must also come from process.env.API_KEY.
    const res = await fetch(`${url}&key=${process.env.API_KEY}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch video: ${res.status} ${res.statusText}`);
    }

    const videoBlob = await res.blob();
    const objectUrl = URL.createObjectURL(videoBlob);

    return {objectUrl, blob: videoBlob, uri: url, video: videoObject};
  } else {
    console.error('Operation failed:', operation);
    throw new Error('No videos generated.');
  }
};