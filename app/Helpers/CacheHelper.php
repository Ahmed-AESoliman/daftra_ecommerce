<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CacheHelper
{
    /**
     * Generate cache key with prefix and parameters
     */
    public static function key(string $prefix, array $params = []): string
    {
        $key = $prefix;

        foreach ($params as $paramKey => $paramValue) {
            if (is_array($paramValue)) {
                $paramValue = md5(serialize($paramValue));
            }
            $key .= "_{$paramKey}_{$paramValue}";
        }

        return $key;
    }

    /**
     * Set cache with callback
     */
    public static function set(string $key, callable $callback, int $ttl = 3600): mixed
    {
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Clear cache by pattern
     */
    public static function clear(string $pattern): void
    {
        try {
            $driver = config('cache.default');

            if ($driver === 'redis') {
                $keys = \Illuminate\Support\Facades\Redis::keys($pattern);
                if (!empty($keys)) {
                    Cache::deleteMultiple($keys);
                }
            } elseif ($driver === 'database') {
                // For database cache driver
                $table = config('cache.stores.database.table', 'cache');
                $prefix = config('cache.prefix', 'laravel_cache_');
                
                // Convert pattern to SQL LIKE pattern and add Laravel prefix
                $likePattern = $prefix . str_replace('*', '%', $pattern);
                
                DB::table($table)
                    ->where('key', 'like', $likePattern)
                    ->delete();
            } elseif ($driver === 'file') {
                // For file cache driver
                $cachePath = storage_path('framework/cache/data');
                if (is_dir($cachePath)) {
                    $files = glob($cachePath . '/' . str_replace('*', '*', $pattern));
                    foreach ($files as $file) {
                        if (is_file($file)) {
                            unlink($file);
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            // Silently fail for unsupported drivers
        }
    }

    /**
     * Clear specific item cache (generic)
     */
    public static function clearItem(string $prefix, int $id): void
    {
        self::clear($prefix . 'show*' . $id . '*');
        self::clear($prefix . 'item*' . $id . '*');
        self::clear($prefix . '*' . $id . '*');
    }

    /**
     * Clear listing/index cache (generic)
     */
    public static function clearListing(string $prefix): void
    {
        self::clear($prefix . 'index*');
        self::clear($prefix . 'list*');
    }
}
