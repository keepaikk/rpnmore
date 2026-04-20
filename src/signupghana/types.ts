export interface Project {
  id: string;
  image_url: string;
  caption: string;
  tag: 'Signage' | 'LED' | 'Branding' | 'Merchandise';
  created_at: string;
}
