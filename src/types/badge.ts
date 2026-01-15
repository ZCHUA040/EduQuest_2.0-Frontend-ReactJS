import type {Image} from "@/types/image";

export interface Badge {
  image: Image;
  id: number;
  name: string;
  description: string;
  type: string;
  condition: string;
}

export interface BadgePayload {
  name: string;
  description: string;
  type: string;
  condition: string;
  image_id: number;
}

export interface BadgeUpdatePayload {
  name?: string;
  description?: string;
  type?: string;
  condition?: string;
  image_id?: number;
}
