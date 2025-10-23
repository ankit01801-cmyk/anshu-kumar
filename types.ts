/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export enum VeoModel {
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO = 'veo-3.1-generate-preview',
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
}

export enum VideoStyle {
  MODERN = 'Sleek & Modern',
  MINIMALIST = 'Minimalist',
  ENERGETIC = 'Energetic & Fast-Paced',
  INFORMATIONAL = 'Informational',
}

export interface ImageFile {
  file: File;
  base64: string;
}

export interface VideoFile {
  file: File;
  base64: string;
}

export interface GenerateVideoParams {
  productName: string;
  keyFeatures: string;
  targetAudience: string;
  videoStyle: VideoStyle;
  productImages: ImageFile[];
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  // Deprecated fields, kept for potential future use in retries but not used in the form
  prompt?: string;
  mode?: string;
  inputVideoObject?: Video | null;
}
