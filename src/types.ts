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
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  author?: string;
  tags: string[];
}

export interface Book {
  id: string;
  title: string;
  description: string;
  price: string;
  cover: string;
  gumroadUrl: string;
  category: string;
  author?: string;
}
