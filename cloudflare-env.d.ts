declare global {
  interface CloudflareEnv {
    DB: D1Database;
    CACHE_KV: KVNamespace;
    DEEPSEEK_API_KEY: string;
    NEXT_PUBLIC_SITE_URL: string;
  }
}

export {};
