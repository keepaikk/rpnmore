# Dobuygoods (DBG) Subdomain Plan

## Overview
- **URL:** dbg.rpnmore.com
- **Purpose:** Preorder & Hook system for used items (cars, electronics, etc.)
- **Brand:** DBG (Dobuygoods)

## Features

### 1. Landing Page
- DBG branding
- Featured items (cars, electronics)
- Search/filter functionality
- "Post Your Item" CTA

### 2. Preorder System
- User submits interest before item is available
- Contact info capture
- Notification when item is live
- Deposit/payment intent (optional)

### 3. Hook System (Used Items)
- Sellers post items with photos
- Categories: Cars, Electronics, Phones, Laptops, etc.
- Condition ratings
- Price negotiation
- Contact/WhatsApp integration

### 4. Admin Dashboard
- Manage preorders
- Approve/reject listings
- Analytics

## Tech Stack
- React + Vite (same as main site)
- Firebase for data
- Image upload to storage
- WhatsApp API for notifications

## Pages
1. `/` - Landing/Featured
2. `/browse` - Browse all items
3. `/preorder` - Preorder form
4. `/sell` - Post your item
5. `/item/:id` - Item detail
6. `/admin` - Admin panel

## Data Model

```typescript
interface DBGItem {
  id: string;
  title: string;
  category: 'cars' | 'electronics' | 'phones' | 'laptops' | 'other';
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  seller: {
    name: string;
    phone: string;
    whatsapp: string;
    location: string;
  };
  status: 'available' | 'pending' | 'sold' | 'reserved';
  preorderEnabled: boolean;
  preorderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Preorder {
  id: string;
  itemId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  offeredPrice?: number;
  message: string;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  createdAt: Date;
}
```

## Next Steps
1. Create subdomain routing
2. Build landing page
3. Set up Firebase collections
4. Create item posting form
5. Create preorder system
6. Admin dashboard

Want me to build this?
