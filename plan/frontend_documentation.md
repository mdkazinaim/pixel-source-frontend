# MediaFinder Frontend Documentation (dynamicScrpting-frontend)

## Overview
The `dynamicScrpting-frontend` application is the user-facing web interface for the MediaFinder ecosystem. It provides a rich, responsive, and dynamic user experience for users to input URLs or search keywords, visualize scraped media across different stock sites, manage a download queue, and directly convert and download media assets in various formats.

## What This App Is Doing
1. **Interactive Search & Scraping:** Allows users to input URLs or text queries. If a text query is used, it translates the query into appropriate search URLs for various selected stock media sites (like Unsplash, Freepik, etc.).
2. **Parallel Media Aggregation:** Dispatches multiple concurrent scraping requests to the backend for different sources, aggregating the results in real-time.
3. **Advanced Media Visualization:** Displays extracted media (images and videos) in a highly responsive grid layout with filtering, random shuffling, grouping by quality, and preview modals.
4. **On-the-fly Format Conversion:** Allows users to select output formats (e.g., JPG, PNG, WEBP, SVG) before downloading. It leverages HTML Canvas for local client-side conversion when possible, reducing backend load.
5. **Download Management:** Offers a "Floating Download" manager where users can select multiple items across different pages and download them all at once as a ZIP archive.

## How It's Doing It & How Programs Are Working
The frontend is structured as a modern Next.js application using the App Router:
- **`app/page.tsx` (Main Entry):** The core orchestrator. It manages the main states including the current query, selected categories (images vs. videos), active stock sites, pagination, and the aggregation of parallel backend requests (`executeScrape`). It handles loading states and error toast notifications.
- **Component Architecture:**
  - **`ScraperInput` & `SearchControls`:** Provide the UI for entering queries and filtering which stock sites to scrape.
  - **`MediaGrid.tsx`:** The most complex component. It takes the aggregated arrays of media URLs and renders them. It implements logic to group image variants by their base URL (resolving different qualities from srcset data). It handles format selection, lightbox preview (`createPortal`), and randomizing the grid order.
  - **`ResultsTabs.tsx`:** Manages the tabbed view switching between Images, Videos, and Links.
  - **`FloatingDownload.tsx`:** A persistent UI widget that tracks the `selectedItems` array managed by Redux. It triggers the backend `/scraper/download` endpoint when the user requests a bulk download.
- **State Management:** Uses Redux Toolkit (`store/slice/scraperSlice.ts`) to manage the global state of selected items, allowing selections to persist across different pages or searches. RTK Query (`Scraper.api.ts`) is used for making API calls and managing caching/loading states.

## How It Handles the Process and Media Fetching
1. **Query Processing:** The user submits a query. The app determines if it's a direct URL or a search term. If a search term, it resolves the specific search URLs for each selected stock site from a configuration dictionary (`STOCK_SITES`).
2. **Parallel Fetching:** It maps over the target URLs and calls the `scrapeUrl` mutation concurrently using `Promise.all()`.
3. **Real-time Aggregation:** As each promise resolves, it merges the returned images, videos, links, and H1s into a combined `mergedData` state, updating the UI progressively. Deduplication is performed using Sets.
4. **Proxy Download & Canvas Conversion:** When downloading a single item, it hits the backend `download-single` proxy to bypass CORS. The response is loaded into an `Image` object and drawn onto an HTML `<canvas>`. The canvas is then exported via `.toBlob()` into the user's requested format (e.g., `image/webp` or `image/jpeg`) and saved locally.

## Technologies Used
- **Next.js (v16) / React (v19):** Core UI framework utilizing the App Router.
- **Redux Toolkit & RTK Query:** For robust global state management and data fetching.
- **TailwindCSS (v4):** Utility-first CSS framework for rapid, responsive, and highly customized premium styling (e.g., animations, glassmorphism, gradients).
- **Framer Motion:** For fluid UI animations and micro-interactions.
- **Lucide React:** For clean, scalable SVG icons.

## The Plan & Next Steps
- **Desktop Packaging Integration:** Fully integrating with the Electron wrapper (`electron-desktop/main.js`) to ensure seamless execution as a native application without port conflicts.
- **User Authentication & Credits:** Integrating a user system to track scraping limits and offer premium features.
- **Advanced Filtering:** Adding more granular filters (color, orientation, size) directly in the UI, mapping them to specific stock site query parameters.
- **WebSocket Progress Updates:** Moving away from standard HTTP polling to WebSockets for real-time progress bars as the backend Puppeteer instance navigates and extracts data.
- **Performance Optimization:** Implementing windowing/virtualization for the `MediaGrid` if the number of scraped items becomes extremely large to prevent DOM lag.
