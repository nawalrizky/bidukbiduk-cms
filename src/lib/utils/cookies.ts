// Cookie utility functions for authentication
export class CookieManager {
  // Set cookie with optional expiration (in days)
  static setCookie(name: string, value: string, days?: number): void {
    if (typeof document === 'undefined') return;

    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    
    document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
  }

  // Get cookie value
  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Delete cookie
  static deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  }

  // Check if cookies are available
  static areCookiesAvailable(): boolean {
    if (typeof document === 'undefined') return false;
    
    try {
      const testCookie = 'test_cookie';
      this.setCookie(testCookie, 'test', 1);
      const result = this.getCookie(testCookie) === 'test';
      this.deleteCookie(testCookie);
      return result;
    } catch {
      return false;
    }
  }
}
