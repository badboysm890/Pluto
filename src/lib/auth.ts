import { supabase } from './supabase';

const AUTH_CACHE_KEY = 'pluto_auth_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface AuthCache {
  user: any;
  timestamp: number;
}

class AuthService {
  private getCache(): AuthCache | null {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (!cached) return null;

    try {
      const parsedCache = JSON.parse(cached) as AuthCache;
      const now = Date.now();
      
      // Check if cache is still valid (within 5 minutes)
      if (now - parsedCache.timestamp <= CACHE_DURATION) {
        return parsedCache;
      }
      
      // Clear expired cache
      this.clearCache();
      return null;
    } catch {
      this.clearCache();
      return null;
    }
  }

  private setCache(user: any) {
    const cache: AuthCache = {
      user,
      timestamp: Date.now(),
    };
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
  }

  private clearCache() {
    localStorage.removeItem(AUTH_CACHE_KEY);
  }

  async getUser() {
    // Check cache first
    const cached = this.getCache();
    if (cached) {
      return { data: { user: cached.user }, error: null };
    }

    // If no valid cache, check with Supabase
    const { data, error } = await supabase.auth.getUser();
    
    // Cache successful response
    if (data.user && !error) {
      this.setCache(data.user);
    }

    return { data, error };
  }

  async signOut() {
    this.clearCache();
    return await supabase.auth.signOut();
  }

  onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        this.clearCache();
      } else if (event === 'SIGNED_IN' && session?.user) {
        this.setCache(session.user);
      }
      callback(event, session);
    });
  }
}

export const authService = new AuthService();