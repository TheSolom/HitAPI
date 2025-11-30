export interface CacheOptions {
    /**
     * The key for the cache entry.
     */
    key?: string;
    /**
     * Time to live for the cache entry in seconds.
     */
    ttl?: number;
    /**
     * Prefix for the cache key.
     */
    prefix?: string;
}
