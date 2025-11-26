import type { Types } from "mongoose";

export interface UserVideoDto {
  video_id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserVideosPage {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  videos: UserVideoDto[];
}


