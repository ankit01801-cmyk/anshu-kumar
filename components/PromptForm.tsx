/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AspectRatio,
  GenerateVideoParams,
  ImageFile,
  Resolution,
  VeoModel,
  VideoStyle,
} from '../types';
import {
  ChevronDownIcon,
  PlusIcon,
  RectangleStackIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TvIcon,
  XMarkIcon,
} from './icons';

const aspectRatioDisplayNames: Record<AspectRatio, string> = {
  [AspectRatio.LANDSCAPE]: 'Landscape (16:9)',
  [AspectRatio.PORTRAIT]: 'Portrait (9:16)',
};

const fileToBase64 = <T extends {file: File; base64: string}>(
  file: File,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({file, base64} as T);
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
const fileToImageFile = (file: File): Promise<ImageFile> =>
  fileToBase64<ImageFile>(file);

const CustomSelect: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({label, value, onChange, icon, children, disabled = false}) => (
  <div>
    <label
      className={`text-xs block mb-1.5 font-medium ${
        disabled ? 'text-gray-500' : 'text-gray-400'
      }`}>
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {icon}
      </div>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-[#1f1f1f] border border-gray-600 rounded-lg pl-10 pr-8 py-2.5 appearance-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-700/50 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed">
        {children}
      </select>
      <ChevronDownIcon
        className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
          disabled ? 'text-gray-600' : 'text-gray-400'
        }`}
      />
    </div>
  </div>
);

const ImageUpload: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove?: () => void;
  image?: ImageFile | null;
  label: React.ReactNode;
}> = ({onSelect, onRemove, image, label}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onSelect(imageFile);
// Fix: Add curly braces to the catch block to fix syntax error.
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
    // Reset input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (image) {
    return (
      <div className="relative w-28 h-20 group">
        <img
          src={URL.createObjectURL(image.file)}
          alt="preview"
          className="w-full h-full object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove image">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="w-28 h-20 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors">
      <PlusIcon className="w-6 h-6" />
      <span className="text-xs mt-1 text-center">{label}</span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </button>
  );
};

interface PromptFormProps {
  onGenerate: (params: GenerateVideoParams) => void;
  initialValues?: GenerateVideoParams | null;
}

const PromptForm: React.FC<PromptFormProps> = ({
  onGenerate,
  initialValues,
}) => {
  const [productName, setProductName] = useState(
    initialValues?.productName ?? '',
  );
  const [keyFeatures, setKeyFeatures] = useState(
    initialValues?.keyFeatures ?? '',
  );
  const [targetAudience, setTargetAudience] = useState(
    initialValues?.targetAudience ?? '',
  );
  const [videoStyle, setVideoStyle] = useState<VideoStyle>(
    initialValues?.videoStyle ?? VideoStyle.MODERN,
  );
  const [productImages, setProductImages] = useState<ImageFile[]>(
    initialValues?.productImages ?? [],
  );
  const [model, setModel] = useState<VeoModel>(
    initialValues?.model ?? VeoModel.VEO,
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    initialValues?.aspectRatio ?? AspectRatio.LANDSCAPE,
  );
  const [resolution, setResolution] = useState<Resolution>(
    initialValues?.resolution ?? Resolution.P720,
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setProductName(initialValues.productName ?? '');
      setKeyFeatures(initialValues.keyFeatures ?? '');
      setTargetAudience(initialValues.targetAudience ?? '');
      setVideoStyle(initialValues.videoStyle ?? VideoStyle.MODERN);
      setProductImages(initialValues.productImages ?? []);
      setModel(initialValues.model ?? VeoModel.VEO);
      setAspectRatio(initialValues.aspectRatio ?? AspectRatio.LANDSCAPE);
      setResolution(initialValues.resolution ?? Resolution.P720);
    }
  }, [initialValues]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onGenerate({
        productName,
        keyFeatures,
        targetAudience,
        videoStyle,
        productImages,
        model,
        aspectRatio,
        resolution,
      });
    },
    [
      productName,
      keyFeatures,
      targetAudience,
      videoStyle,
      productImages,
      model,
      aspectRatio,
      resolution,
      onGenerate,
    ],
  );

  const isSubmitDisabled = !productName.trim() || productImages.length === 0;
  let tooltipText = '';
  if (isSubmitDisabled) {
    if (!productName.trim() && productImages.length === 0) {
      tooltipText = 'Please enter a product name and upload at least one image.';
    } else if (!productName.trim()) {
      tooltipText = 'Please enter a product name.';
    } else {
      tooltipText = 'Please upload at least one product image.';
    }
  }

  return (
    <div className="w-full bg-[#1f1f1f] border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="product-name"
            className="text-sm font-medium text-gray-300 block mb-2">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Foldable Aluminum Laptop Stand"
            className="w-full bg-[#2c2c2e] border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="key-features"
            className="text-sm font-medium text-gray-300 block mb-2">
            Key Features & Benefits
          </label>
          <textarea
            id="key-features"
            value={keyFeatures}
            onChange={(e) => setKeyFeatures(e.target.value)}
            placeholder="List 3-5 key points, one per line...&#10;- Portable & Lightweight&#10;- Adjustable Height for Ergonomics&#10;- Sturdy Aluminum Construction"
            className="w-full bg-[#2c2c2e] border border-gray-600 rounded-lg p-3 h-28 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="target-audience"
              className="text-sm font-medium text-gray-300 block mb-2">
              Target Audience
            </label>
            <input
              id="target-audience"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Remote workers, students"
              className="w-full bg-[#2c2c2e] border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="video-style"
              className="text-sm font-medium text-gray-300 block mb-2">
              Video Style
            </label>
            <select
              id="video-style"
              value={videoStyle}
              onChange={(e) => setVideoStyle(e.target.value as VideoStyle)}
              className="w-full bg-[#2c2c2e] border border-gray-600 rounded-lg p-3 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              {Object.values(VideoStyle).map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-2">
            Product Images (up to 6)
          </label>
          <div className="p-4 bg-[#2c2c2e] rounded-xl border border-gray-700 flex flex-wrap items-center justify-center gap-2">
            {productImages.map((img, index) => (
              <ImageUpload
                key={index}
                image={img}
                label=""
                onSelect={() => {}}
                onRemove={() =>
                  setProductImages((imgs) =>
                    imgs.filter((_, i) => i !== index),
                  )
                }
              />
            ))}
            {productImages.length < 6 && (
              <ImageUpload
                label="Add Image"
                onSelect={(img) => setProductImages((imgs) => [...imgs, img])}
              />
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <button
          type="button"
          onClick={() => setIsSettingsOpen((prev) => !prev)}
          className={`w-full flex justify-between items-center p-2 rounded-lg hover:bg-gray-700/50 ${isSettingsOpen ? 'text-white' : 'text-gray-400'}`}>
          <span className="font-medium text-sm">Advanced Settings</span>
          <SlidersHorizontalIcon className="w-5 h-5" />
        </button>
        {isSettingsOpen && (
          <div className="mt-4 p-4 bg-[#2c2c2e] rounded-xl border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomSelect
                label="Model"
                value={model}
                onChange={(e) => setModel(e.target.value as VeoModel)}
                icon={<SparklesIcon className="w-5 h-5 text-gray-400" />}>
                {Object.values(VeoModel).map((modelValue) => (
                  <option key={modelValue} value={modelValue}>
                    {modelValue}
                  </option>
                ))}
              </CustomSelect>
              <CustomSelect
                label="Aspect Ratio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                icon={
                  <RectangleStackIcon className="w-5 h-5 text-gray-400" />
                }>
                {Object.entries(aspectRatioDisplayNames).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </CustomSelect>
              <CustomSelect
                label="Resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value as Resolution)}
                icon={<TvIcon className="w-5 h-5 text-gray-400" />}>
                <option value={Resolution.P720}>720p</option>
                <option value={Resolution.P1080}>1080p</option>
              </CustomSelect>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <div className="relative group w-full">
          <button
            type="submit"
            className="w-full px-6 py-4 bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg transition-colors"
            aria-label="Generate video"
            disabled={isSubmitDisabled}>
            Generate Product Video
          </button>
          {isSubmitDisabled && tooltipText && (
            <div
              role="tooltip"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {tooltipText}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center mt-3 px-4">
          Veo is a paid-only model. You will be charged on your Cloud project. See{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/pricing#veo-3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline">
            pricing details
          </a>
          .
        </p>
      </form>
    </div>
  );
};

export default PromptForm;