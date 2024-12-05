import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractEntityFromURL(url: string) {
  try {
    const pathParts = url.split('/'); // Extract the path parts
    const entity = pathParts[pathParts.length - 1];
    return entity;
  } catch (error) {
    console.error('Invalid URL:', error);
    return '';
  }
}

export function getCategoryImage(categoryUri: string): string {
  switch (categoryUri) {
    case 'Tempat Agrowisata':
      return '/agrowisata.jpg';
    case 'Tempat Alam':
      return '/alam.jpg';
    case 'Tempat Bahari':
      return '/bahari.jpg';
    case 'Tempat Belanja':
      return '/belanja.jpg';
    case 'Tempat Budaya':
      return '/budaya.webp';
    case 'Cagar Alam':
      return '/cagar.webp';
    case 'Pantai':
      return '/pantai.jpg';
    case 'Pusat Perbelanjaan':
      return '/pusatbelanja.jpg';
    case 'Tempat Rekreasi':
      return '/rekreasi.webp';
    case 'Tempat Religius':
      return '/ibadah.jpeg';
    case 'Taman Hiburan':
      return '/hiburan.jpg';
    case 'Tempat Ibadah':
      return '/religius.webp';
    default:
      return 'https://via.placeholder.com/400x300'; // Default image
  }
}
