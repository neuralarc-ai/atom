/**
 * Server-side URL Encoder for Test Links
 * Generates short, unique codes for tests
 */

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: 0,O,1,I

/**
 * Generate a short code from a test ID
 * Example: cm2xhxvmf0000kqhd1bqh4rge -> XK9P2M
 */
export function generateShortCode(testId: string): string {
  // Use hash function to create shorter codes
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
  
  // Return 6-character code
  return code.substring(0, 6);
}

