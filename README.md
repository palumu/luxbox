# Luxbox 💎

A premium, minimalist React image gallery and lightbox component, built for luxury e-commerce, portfolios, and high-end web experiences.

Inspired by top-tier native photo apps and modern e-commerce product viewers, Luxbox delivers a fluid, gesture-driven, and highly polished media viewing experience.

## ✨ Features

- **Gesture-Driven:** Smooth drag-to-pan in the lightbox and swipeable thumbnail carousels.
- **Infinite Loop Engine:** Seamless, custom-animated wrap-arounds when navigating past the last image.
- **Auto-Centering Thumbnails:** Active thumbnails smoothly scroll to the center of the viewport.
- **Keyboard Navigation:** Full support for `ArrowKeys` (next/prev), `Escape` (close), and `+ / -` (zoom).
- **Responsive & Touch-Friendly:** Built from the ground up for both desktop mouse and mobile touch interactions.
- **TypeScript Ready:** Fully typed with detailed interfaces for excellent IDE autocomplete.
- **Tailwind Native:** Utilizes Tailwind CSS for lightweight, zero-runtime styling.

## 📦 Installation

Install Luxbox and its peer dependency (`lucide-react` for icons) via your favorite package manager:

```bash
npm install @palumu/luxbox lucide-react
# or
yarn add @palumu/luxbox lucide-react
# or
pnpm add @palumu/luxbox lucide-react
```

## ⚠️ Tailwind CSS Setup (Required)
Luxbox uses Tailwind CSS for styling. To ensure the component is styled correctly in your project, you must add the Luxbox package to your tailwind.config.js content array:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // Add this line to parse Luxbox styles!
    "./node_modules/@palumu/luxbox/dist/**/*.{js,mjs}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 🚀 Quick Start

```tsx
import React from 'react';
import { Luxbox, GalleryImage } from '@palumu/luxbox';

const myImages: GalleryImage[] = [
  { 
    id: 1, 
    url: 'https://picsum.photos/id/21/1600/1600', 
    thumb: 'https://picsum.photos/id/21/200/200', 
    title: 'Classic Shoes' 
  },
  { 
    id: 2, 
    url: 'https://picsum.photos/id/175/1600/1600', 
    thumb: 'https://picsum.photos/id/175/200/200', 
    title: 'Vintage Clock' 
  }
];

export default function App() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <Luxbox 
        images={myImages} 
        title="Premium Collection" 
        subtitle="Click the main image for a full-screen view"
      />
    </div>
  );
}
```

## 📖 API Reference

### `<Luxbox />` Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `images` | `GalleryImage[]` | **Required** | Array of image objects to display in the gallery. |
| `title` | `string` | `"Premium Collection"` | Title text displayed beneath the main product image. |
| `subtitle` | `string` | `"Click the main image..."` | Subtitle text displayed below the title. |

### `GalleryImage` Type

```typescript
export interface GalleryImage {
  id: string | number;
  url: string;
  thumb: string;
  title?: string;
  alt?: string;
}
```

## 📄 License

MIT License
