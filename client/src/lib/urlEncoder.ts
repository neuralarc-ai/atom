/**
 * URL Encoder/Decoder for Test Links
 * Generates short URLs using database-stored short codes
 */

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: 0,O,1,I

/**
 * Encode a test ID to a short code (client-side fallback)
 * Example: cm2xhxvmf0000kqhd1bqh4rge -> XK9P2M
 */
export function encodeTestId(testId: string): string {
  // Use base conversion to create shorter codes
  let hash = 0;
  for (let i = 0; i < testId.length; i++) {
    const char = testId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to positive number
  hash = Math.abs(hash);
  
  // Convert to base-32 using our charset
  let code = '';
  let num = hash;
  
  while (num > 0 || code.length < 6) {
    code = CHARSET[num % CHARSET.length] + code;
    num = Math.floor(num / CHARSET.length);
  }
  
  // Ensure 6 characters
  return code.substring(0, 6);
}

/**
 * Generate a short URL for a test
 * Uses the encoded test ID as the short code
 */
export function generateShortTestUrl(testId: string): string {
  const code = encodeTestId(testId);
  
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/t/${code}`;
  }
  return `/t/${code}`;
}

