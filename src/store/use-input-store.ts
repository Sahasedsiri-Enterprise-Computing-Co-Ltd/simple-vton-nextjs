// store/useInputStore.ts
import { create } from "zustand";

export type ModelType = "upload" | "template" | "custom";

export interface InputStore {
  // Model Generator inputs
  modelType: ModelType;
  modelUpload: File | null;
  templateAttributes: Record<string, string>;
  customPrompt: string;
  imageSize: string;
  // Garment Upload inputs
  garmentUpload: File | null;
  garmentType: string;
  // Branding inputs
  brandingUpload: File | null;

  // Setter actions with explicit types
  setModelType: (type: ModelType) => void;
  setModelUpload: (file: File | null) => void;
  setTemplateAttribute: (attribute: string, value: string) => void;
  setCustomPrompt: (prompt: string) => void;
  setImageSize: (size: string) => void;
  setGarmentUpload: (file: File | null) => void;
  setGarmentType: (type: string) => void;
  setBrandingUpload: (file: File | null) => void;
  reset: () => void;
}

export const useInputStore = create<InputStore>((set) => ({
  // Initial state
  modelType: "upload",
  modelUpload: null,
  templateAttributes: {},
  customPrompt: "",
  imageSize: "",
  garmentUpload: null,
  garmentType: "",
  brandingUpload: null,
  // Setter actions
  setModelType: (type: ModelType): void => set({ modelType: type }),
  setModelUpload: (file: File | null): void => set({ modelUpload: file }),
  setTemplateAttribute: (attribute: string, value: string): void =>
    set((state) => ({
      templateAttributes: { ...state.templateAttributes, [attribute]: value },
    })),
  setCustomPrompt: (prompt: string): void => set({ customPrompt: prompt }),
  setImageSize: (size: string): void => set({ imageSize: size }),
  setGarmentUpload: (file: File | null): void => set({ garmentUpload: file }),
  setGarmentType: (type: string): void => set({ garmentType: type }),
  setBrandingUpload: (file: File | null): void => set({ brandingUpload: file }),
  reset: (): void =>
    set({
      modelType: "upload",
      modelUpload: null,
      templateAttributes: {},
      customPrompt: "",
      imageSize: "",
      garmentUpload: null,
      garmentType: "",
      brandingUpload: null,
    }),
}));
