export interface City {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string; // State/Region
}

interface OpenMeteoResponse {
    results?: {
        id: number;
        name: string;
        latitude: number;
        longitude: number;
        country?: string;
        admin1?: string;
    }[];
}

export interface CitySearchPage {
    cities: City[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

class CitySearchService {
    private readonly API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
    private cache: Map<string, City[]> = new Map();
    private abortController: AbortController | null = null;

    /**
     * Paginated search for cities (fetches larger batch once, then slices locally)
     * Only triggers network when query not cached.
     */
    async searchCitiesPaged(query: string, page: number = 0, pageSize: number = 10): Promise<CitySearchPage> {
        const trimmed = query.trim();
        if (!trimmed || trimmed.length < 3) {
            return { cities: [], total: 0, page, pageSize, hasMore: false };
        }

        // Reuse cache if available
        let all = this.cache.get(trimmed);

        if (!all) {
            // Abort previous in-flight request
            if (this.abortController) {
                try { this.abortController.abort(); } catch (_) { /* ignore */ }
            }
            this.abortController = new AbortController();
            const signal = this.abortController.signal;

            try {
                // Fetch larger batch (up to 60) then paginate locally
                const url = `${this.API_URL}?name=${encodeURIComponent(trimmed)}&count=60&language=en`; // bigger batch
                const response = await fetch(url, { signal });
                if (!response.ok) {
                    console.warn('CitySearchService: Open-Meteo request failed', response.status);
                    all = [];
                } else {
                    const data: OpenMeteoResponse = await response.json();
                    all = (data.results || []).map(item => ({
                        id: item.id,
                        name: item.name,
                        latitude: item.latitude,
                        longitude: item.longitude,
                        country: item.country,
                        admin1: item.admin1,
                    }));
                }
            } catch (error: any) {
                if (error?.name === 'AbortError') {
                    // If aborted, return empty slice (caller will retry with latest query)
                    return { cities: [], total: 0, page, pageSize, hasMore: false };
                }
                console.warn('CitySearchService: request failed', error);
                all = [];
            }
            this.cache.set(trimmed, all);
        }

        const total = all.length;
        const start = page * pageSize;
        const end = start + pageSize;
        const slice = all.slice(start, end);
        const hasMore = end < total;
        return { cities: slice, total, page, pageSize, hasMore };
    }

    /**
     * Clear cache (e.g., memory management or manual refresh)
     */
    clearCache() {
        this.cache.clear();
    }
}

export default new CitySearchService();
