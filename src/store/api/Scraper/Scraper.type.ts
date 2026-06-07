export interface ScrapedLink {
  text: string;
  href: string;
}

export interface ScrapedData {
  images: string[];
  videos: string[];
  links: ScrapedLink[];
  h1s: string[];
}

export interface ScrapeRequest {
  url: string;
  page?: number;
  limit?: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  totalImages: number;
  totalVideos: number;
  totalLinks: number;
  totalH1s: number;
  totalPagesImages: number;
  totalPagesVideos: number;
  totalPagesLinks: number;
  totalPagesH1s: number;
}

export interface PaginatedScraperResponse {
  data: ScrapedData;
  pagination: PaginationMetadata;
}
