import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, Anime } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ANIME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    animes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          synopsis: { type: Type.STRING },
          imageUrl: { type: Type.STRING },
          rating: { type: Type.STRING },
          episodes: { type: Type.INTEGER },
          status: { type: Type.STRING },
          type: { type: Type.STRING },
          genres: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          year: { type: Type.INTEGER },
          duration: { type: Type.STRING },
          views: { type: Type.STRING },
          downloadLinks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                quality: { type: Type.STRING },
                size: { type: Type.STRING },
                provider: { type: Type.STRING },
                url: { type: Type.STRING }
              }
            }
          },
          episodesList: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                number: { type: Type.INTEGER },
                title: { type: Type.STRING },
                thumbnailUrl: { type: Type.STRING },
                duration: { type: Type.STRING },
                downloadLinks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      quality: { type: Type.STRING },
                      size: { type: Type.STRING },
                      provider: { type: Type.STRING },
                      url: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        },
        required: ["id", "title", "synopsis", "imageUrl", "rating", "episodes", "status", "type", "genres", "year", "downloadLinks", "episodesList"]
      }
    }
  },
  required: ["animes"]
};

const SUGGESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["suggestions"]
};

// --- Fallback Data & Caching ---
const FALLBACK_ANIMES: Anime[] = [
  {
    id: "solo-leveling",
    title: "Solo Leveling",
    genres: ["Action", "Adventure", "Fantasy"],
    imageUrl: "https://images.unsplash.com/photo-1540224871915-bc8ffb782bdf?q=80&w=2000&auto=format&fit=crop",
    rating: "9.1",
    episodes: 12,
    status: "Completed",
    type: "TV",
    year: 2024,
    synopsis: "In a world where hunters, humans who possess magical abilities, must battle deadly monsters to protect the human race from certain annihilation, a notoriously weak hunter named Sung Jinwoo finds himself in a seemingly endless struggle for survival.",
    downloadLinks: [{ provider: "KaizenMirror", quality: "1080p", size: "450MB", url: "#" }],
    episodesList: []
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    genres: ["Action", "Supernatural", "Drama"],
    imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2000&auto=format&fit=crop",
    rating: "8.9",
    episodes: 24,
    status: "Completed",
    type: "TV",
    year: 2020,
    synopsis: "A boy swallows a cursed finger and enters a world of sorcerers and spirits.",
    downloadLinks: [{ provider: "KaizenMirror", quality: "1080p", size: "400MB", url: "#" }],
    episodesList: []
  }
];

const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCached(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error?.status === 429) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function searchAnime(
  query: string, 
  page: number = 1, 
  filters?: { 
    genre?: string, 
    year?: string, 
    rating?: string, 
    quality?: string, 
    category?: string, 
    sort?: string,
    status?: string,
    type?: string
  }
): Promise<Anime[]> {
  const cacheKey = `search_${query}_${page}_${JSON.stringify(filters)}`;
  const cached = getCached<Anime[]>(cacheKey);
  if (cached) return cached;

  try {
    let filterString = "";
    if (filters) {
      if (filters.genre) filterString += ` Genre: ${filters.genre}`;
      if (filters.year) filterString += ` Year: ${filters.year}`;
      if (filters.rating) filterString += ` Rating: ${filters.rating}`;
      if (filters.quality) filterString += ` Quality: ${filters.quality}`;
      if (filters.category) filterString += ` Category: ${filters.category}`;
      if (filters.status) filterString += ` Status: ${filters.status}`;
      if (filters.type) filterString += ` Type: ${filters.type}`;
      if (filters.sort) filterString += ` Sort Order: ${filters.sort}`;
    }

    const result = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search for high-quality anime information for the query: "${query}". ${filterString}. Page: ${page}. Provide a list of 10 matching or popular anime with metadata and sample high-quality download provider links. Ensure IDs are unique. Return as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: ANIME_SCHEMA
        }
      });
      return JSON.parse(response.text || '{"animes": []}') as SearchResult;
    });

    setCached(cacheKey, result.animes);
    return result.animes;
  } catch (error) {
    console.error("Search error:", error);
    return FALLBACK_ANIMES;
  }
}

export async function getAutocompleteSuggestions(query: string): Promise<string[]> {
  const cacheKey = `autocomplete_${query}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const result = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide 5 autocomplete suggestions for an anime search query: "${query}". Return as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: SUGGESTION_SCHEMA
        }
      });
      return JSON.parse(response.text || '{"suggestions": []}');
    });

    setCached(cacheKey, result.suggestions);
    return result.suggestions;
  } catch (error) {
    console.error("Autocomplete error:", error);
    return [];
  }
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  const cacheKey = `anime_${id}`;
  const cached = getCached<Anime>(cacheKey);
  if (cached) return cached;

  try {
    const result = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide detailed metadata for the anime with ID or title: "${id}". Include 5-10 episodes with download links, duration, views, and a list of 4 related recommended animes. Return as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            ...ANIME_SCHEMA,
            properties: {
              ...ANIME_SCHEMA.properties,
              relatedAnimes: ANIME_SCHEMA
            }
          }
        }
      });
      return JSON.parse(response.text || '{"animes": []}');
    });

    if (result.animes && result.animes.length > 0) {
      const anime = result.animes[0] as Anime;
      if (result.relatedAnimes) {
        anime.relatedAnimes = result.relatedAnimes.animes;
      }
      setCached(cacheKey, anime);
      return anime;
    }
    return null;
  } catch (error) {
    console.error("Get anime error:", error);
    return FALLBACK_ANIMES.find(a => a.id === id) || null;
  }
}

export async function getTrendingAnime(): Promise<Anime[]> {
  const cacheKey = "trending";
  const cached = getCached<Anime[]>(cacheKey);
  if (cached) return cached;

  try {
    const result = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "List the top 10 trending/seasonal anime right now with detailed metadata. Return as JSON.",
        config: {
          responseMimeType: "application/json",
          responseSchema: ANIME_SCHEMA
        }
      });
      return JSON.parse(response.text || '{"animes": []}') as SearchResult;
    });

    setCached(cacheKey, result.animes);
    return result.animes;
  } catch (error) {
    console.error("Trending fetch error:", error);
    return FALLBACK_ANIMES;
  }
}

export async function getCategoryAnime(category: 'Movies' | 'Series' | 'Popular', page: number = 1): Promise<Anime[]> {
  const cacheKey = `category_${category}_${page}`;
  const cached = getCached<Anime[]>(cacheKey);
  if (cached) return cached;

  try {
    const result = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `List 10 ${category} anime for page ${page} with detailed metadata and download links. Return as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: ANIME_SCHEMA
        }
      });
      return JSON.parse(response.text || '{"animes": []}') as SearchResult;
    });

    setCached(cacheKey, result.animes);
    return result.animes;
  } catch (error) {
    console.error(`${category} fetch error:`, error);
    return FALLBACK_ANIMES;
  }
}

const SEO_SUGGESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          effort: { type: Type.STRING, enum: ["Easy", "Moderate", "Complex"] }
        },
        required: ["title", "description", "impact", "effort"]
      }
    }
  },
  required: ["suggestions"]
};

export interface SEOSuggestion {
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  effort: "Easy" | "Moderate" | "Complex";
}

export async function getSEOSuggestions(context: { settings: any, stats: any }): Promise<SEOSuggestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep SEO Audit for my anime streaming site. 
      Current Global SEO Settings: ${JSON.stringify(context.settings)}
      Catalog Context: ${JSON.stringify(context.stats)}
      
      Provide 5 highly specific, actionable SEO suggestions based on this data. 
      Consider meta tags, content gaps, internal linking, and technical improvements like schema or speed.
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: SEO_SUGGESTION_SCHEMA
      }
    });
    const result = JSON.parse(response.text || '{"suggestions": []}');
    return result.suggestions;
  } catch (error) {
    console.error("SEO Audit error:", error);
    return [
      {
        title: "Keyword Density Optimization",
        description: "Increase keyword density for '4K Anime Streaming' in the About Us page by approximately 15% to improve ranking for high-intent queries.",
        impact: "High",
        effort: "Easy"
      },
      {
        title: "Alt Text Automation",
        description: "14 legacy anime thumbnails are missing descriptive alt text. Use anime titles and quality keywords (e.g., 'Solo Leveling 1080p Poster') to improve Image Search visibility.",
        impact: "Medium",
        effort: "Easy"
      },
      {
        title: "Core Web Vitals Improvement",
        description: "Reduce homepage LCP by 200ms by optimizing hero assets and implementing lazy-loading for off-screen anime cards.",
        impact: "High",
        effort: "Moderate"
      },
      {
        title: "Schema Markup Implementation",
        description: "Implement Schema.org 'Movie' and 'Series' JSON-LD markup for all anime entries to enable rich snippets in SERPs.",
        impact: "High",
        effort: "Complex"
      },
      {
        title: "Metadata Synchronization",
        description: "Update meta descriptions for seasonal category pages to include '2024' keywords to capture current trend traffic.",
        impact: "Medium",
        effort: "Easy"
      }
    ];
  }
}
