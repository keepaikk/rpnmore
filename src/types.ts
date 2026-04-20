export interface Service {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  imageUrl?: string;
  updates?: string;
  additionalInfo?: string;
  icon: string;
  category: string;
  externalLink?: string;
  features?: string[];
  tagline?: string;
  color?: string;
  pricing?: {
    setup?: string;
    monthly?: string;
  };
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  image_url?: string; // Database field
  date: string;
  published_at?: string; // Database field
  updated_at?: string;
  author?: string;
  authorBio?: string;
  author_bio?: string; // Database field
  authorImage?: string;
  author_image?: string; // Database field
  tags: string[];
  readTime?: string;
  read_time?: string; // Database field
  // SEO fields
  metaTitle?: string;
  meta_title?: string; // Database field
  metaDescription?: string;
  meta_description?: string; // Database field
  keywords?: string[];
  // Status
  status?: 'draft' | 'published' | 'archived';
  views?: number;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  price: string;
  cover: string;
  coverWebpSrcset?: string; // WebP responsive srcset for better performance
  gumroadUrl: string;
  category: string;
  author?: string;
}
