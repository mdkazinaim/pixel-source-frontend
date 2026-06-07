import { baseApi } from '../baseApi';
import { PaginatedScraperResponse, ScrapeRequest } from './Scraper.type';

export const scraperApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    scrapeUrl: builder.mutation<PaginatedScraperResponse, ScrapeRequest>({
      query: (body) => ({
        url: '/scraper/analyze',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useScrapeUrlMutation } = scraperApi;
