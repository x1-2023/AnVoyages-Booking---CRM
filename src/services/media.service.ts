import { api } from '@/lib/api';

export interface UploadedMedia {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export const mediaService = {
  async uploadHeroImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadedMedia>('/media/hero-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
