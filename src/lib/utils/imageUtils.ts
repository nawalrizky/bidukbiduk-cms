/**
 * Utility functions for handling images
 */

/**
 * Returns an optimized image URL that's compatible with Next.js Image component
 * Falls back to a placeholder if the URL is invalid
 * 
 * @param url Original image URL
 * @param fallback Fallback image URL (defaults to placeholder)
 * @returns Safe image URL for Next.js Image
 */
export function getSafeImageUrl(url?: string, fallback: string = '/placeholder-image.jpg'): string {
  if (!url) return fallback;
  
  // Check if URL is relative (starts with /)
  if (url.startsWith('/')) {
    return url;
  }
  
  try {
    // Try to parse the URL to make sure it's valid
    new URL(url);
    return url;
  } catch (error) {
    // If URL parsing fails, return the fallback
    console.warn(`Invalid image URL: ${url}, using fallback`);
    return fallback;
  }
}

/**
 * Creates a proper image loader function for the Next.js Image component
 * 
 * @param src The source URL
 * @param width The requested width
 * @returns Processed image URL
 */
export function imageLoader({ src }: { src: string; width?: number }): string {
  if (src.startsWith('/')) {
    // Local images can be returned as-is
    return src;
  }
  
  try {
    const url = new URL(src);
    
    // If it's from our backend domain, we can return it as-is
    if (url.hostname === 'backend.bidukbiduk.com' || url.hostname === 'localhost') {
      return src;
    }
    
    // For external images, could add additional processing here if needed
    return src;
  } catch (_error) {
    // For invalid URLs, return a placeholder
    return '/placeholder-image.jpg';
  }
}
