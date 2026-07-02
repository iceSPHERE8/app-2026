// types.ts
export type MediaType =
    | "image"
    | "image-list"
    | "video"
    | "p5"
    | "glsl"
    | "3d"
    | "text";
export type RenderMode = "cover" | "direct";

export interface ShowcaseItem {
    id: string;
    createdAt?: string;
    title?: string;
    description?: string;
    detailLink?: string;
    type: MediaType;
    category?: string;
    content?: string;
    imageList?: string[];
    coverUrl?: string;
    previewVideoUrl?: string;
    aspectRatio: string;
    renderMode?: RenderMode;
    textBgUrl?: string;
    updatedAt?: string;
}

// 声明全局 umami 类型
declare global {
    interface Window {
        umami: {
            track: (eventName: string, eventData?: Record<string, any>) => void;
        };
    }
}