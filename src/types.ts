export interface Anime {
  id: string;
  title: string;
  synopsis: string;
  imageUrl: string;
  rating: string;
  episodes: number;
  status: string;
  type: string;
  genres: string[];
  year: number;
  duration?: string;
  views?: string;
  downloadLinks: DownloadLink[];
  episodesList: Episode[];
  relatedAnimes?: Anime[];
  isHidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  animeId: string;
  animeTitle: string;
  user: string;
  text: string;
  createdAt: string;
  isApproved: boolean;
}

export interface TaxonomyEntry {
  id: string;
  name: string;
  type: 'genre' | 'category'| 'year';
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
}

export interface Episode {
  number: number;
  title: string;
  thumbnailUrl?: string;
  duration?: string;
  downloadLinks: DownloadLink[];
}

export interface DownloadLink {
  quality: string;
  size: string;
  provider: string;
  url: string;
}

export interface SearchResult {
  animes: Anime[];
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isHidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id?: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
}

export interface AutocompleteResult {
  suggestions: string[];
}
