import React from 'react';

export type SearchCategory = "images" | "videos" | "icons";

export interface StockSite {
  id: string;
  name: string;
  categories: SearchCategory[];
  getUrl: (term: string, cat: SearchCategory) => string;
  icon: React.ReactNode;
}

export const STOCK_SITES: StockSite[] = [
  {
    id: "unsplash",
    name: "Unsplash",
    categories: ["images"],
    getUrl: (term) => `https://unsplash.com/s/photos/${term}`,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.5 6.75V1.5h9v5.25h-9zm9 3.75h6V22.5h-21V10.5h6v5.25h9V10.5z" />
      </svg>
    ),
  },
  {
    id: "magnific",
    name: "Magnific",
    categories: ["images", "videos", "icons"],
    getUrl: (term, cat) => {
      if (cat === "icons") return `https://www.magnific.com/search?format=search&last_filter=type&last_value=icon&query=${term}&type=icon`;
      if (cat === "videos") return `https://www.magnific.com/search?format=search&last_filter=type&last_value=video&query=${term}&type=video`;
      return `https://www.magnific.com/search?format=search&term=${term}`;
    },
    icon: (
      <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: "pexels",
    name: "Pexels",
    categories: ["images", "videos"],
    getUrl: (term, cat) => {
      if (cat === "videos") return `https://www.pexels.com/video/search/${term}/`;
      return `https://www.pexels.com/search/${term}/`;
    },
    icon: (
      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h18v18H3V3zm14 7c0-2.76-2.24-5-5-5H8v14h3v-5h1c2.76 0 5-2.24 5-5zm-6 0v-2h1c1.1 0 2 .9 2 2s-.9 2-2 2h-1z" />
      </svg>
    ),
  },
  {
    id: "pixabay",
    name: "Pixabay",
    categories: ["images", "videos"],
    getUrl: (term, cat) => {
      if (cat === "videos") return `https://pixabay.com/videos/search/${term}/`;
      return `https://pixabay.com/images/search/${term}/`;
    },
    icon: (
      <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v12M6 12h12" />
      </svg>
    ),
  },
  {
    id: "flaticon",
    name: "Flaticon",
    categories: ["icons"],
    getUrl: (term) => `https://www.flaticon.com/search?word=${term}`,
    icon: (
      <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8m-4-4h8" stroke="black" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "vecteezy",
    name: "Vecteezy",
    categories: ["images", "icons"],
    getUrl: (term, cat) => {
      if (cat === "icons") return `https://www.vecteezy.com/free-vector/${term}`;
      return `https://www.vecteezy.com/free-photos/${term}`;
    },
    icon: (
      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 22h20L12 2zm0 4.8L18.4 18H5.6L12 6.8z" />
      </svg>
    ),
  },
  {
    id: "adobe_stock",
    name: "Adobe Stock",
    categories: ["images", "videos"],
    getUrl: (term, cat) => {
      if (cat === "videos") return `https://stock.adobe.com/search/video?k=${term}`;
      return `https://stock.adobe.com/search?k=${term}`;
    },
    icon: (
      <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.9 2H22v20h-8.1zM2 2h8.1v20H2zM12 8.5L6.5 20h3l1.2-2.7h5.6L17.5 20h3z" />
      </svg>
    ),
  },
  {
    id: "shutterstock",
    name: "Shutterstock",
    categories: ["images", "videos"],
    getUrl: (term, cat) => {
      if (cat === "videos") return `https://www.shutterstock.com/search/video/${term}`;
      return `https://www.shutterstock.com/search/${term}`;
    },
    icon: (
      <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12a4 4 0 118 0" />
      </svg>
    ),
  },
  {
    id: "pinterest",
    name: "Pinterest",
    categories: ["images"],
    getUrl: (term) => `https://pinterest.com/search/pins/?q=${term}`,
    icon: (
      <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.24 2C6.51 2 2 6.51 2 12.24c0 4.38 2.68 8.12 6.52 9.7-1-.87-1.88-2.22-1.94-3.79-.06-1.57.94-6.09.94-6.09s-.31-.63-.31-1.56c0-1.46.85-2.55 1.9-2.55.9 0 1.33.68 1.33 1.49 0 .9-.57 2.25-.87 3.5-.25 1.05.52 1.91 1.56 1.91 1.87 0 3.31-1.97 3.31-4.82 0-2.52-1.81-4.28-4.39-4.28-2.99 0-4.75 2.24-4.75 4.56 0 .9.35 1.87.78 2.4.09.1.1.17.07.28l-.34 1.39c-.05.21-.19.29-.39.2-1.3-.61-2.11-2.54-2.11-4.08 0-3.32 2.42-6.37 6.96-6.37 3.65 0 6.49 2.6 6.49 6.08 0 3.63-2.29 6.55-5.48 6.55-1.07 0-2.08-.56-2.42-1.21l-.66 2.51c-.24.92-.89 2.08-1.33 2.8 1.14.35 2.36.54 3.62.54 5.73 0 10.24-4.51 10.24-10.24C22.48 6.51 17.97 2 12.24 2z" />
      </svg>
    ),
  },
  {
    id: "storyblocks",
    name: "Storyblocks",
    categories: ["images", "videos"],
    getUrl: (term, cat) => {
      if (cat === "videos") return `https://www.storyblocks.com/video/search/${term}`;
      return `https://www.storyblocks.com/images/search/${term}`;
    },
    icon: (
      <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 16V12M12 8h.01" />
      </svg>
    ),
  },
  {
    id: "envato",
    name: "Envato Elements",
    categories: ["images", "videos", "icons"],
    getUrl: (term, cat) => {
      if (cat === "videos") return `https://elements.envato.com/stock-video/${term}`;
      if (cat === "icons") return `https://elements.envato.com/graphic-templates/${term}`;
      return `https://elements.envato.com/photos/${term}`;
    },
    icon: (
      <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "istock",
    name: "iStock",
    categories: ["images", "videos"],
    getUrl: (term, cat) => {
      if (cat === "videos") return `https://www.istockphoto.com/search/2/film?phrase=${term}`;
      return `https://www.istockphoto.com/search/2/image?phrase=${term}`;
    },
    icon: (
      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    id: "getty",
    name: "Getty Images",
    categories: ["images", "videos"],
    getUrl: (term, cat) => {
      if (cat === "videos") return `https://www.gettyimages.com/videos/${term}`;
      return `https://www.gettyimages.com/photos/${term}`;
    },
    icon: (
      <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    id: "depositphotos",
    name: "Depositphotos",
    categories: ["images", "videos"],
    getUrl: (term, cat) => {
      if (cat === "videos") return `https://depositphotos.com/stock-videos/${term}.html`;
      return `https://depositphotos.com/stock-photos/${term}.html`;
    },
    icon: (
      <svg className="w-4 h-4 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
      </svg>
    ),
  }
];
