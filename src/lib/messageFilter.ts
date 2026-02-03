/**
 * Message filtering utility to detect and block contact information
 * Prevents sharing of phone numbers, emails, links, and social media handles
 */

// Phone number patterns (international formats)
const PHONE_PATTERNS = [
  /\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // General international
  /\b0\d{10,11}\b/g, // Egyptian format
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // US format
  /\b\d{4}[-.\s]?\d{3}[-.\s]?\d{3}\b/g, // Alternative format
];

// Email pattern
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// URL patterns
const URL_PATTERNS = [
  /https?:\/\/[^\s]+/gi, // HTTP/HTTPS URLs
  /www\.[^\s]+/gi, // www URLs
  /[a-zA-Z0-9-]+\.(com|org|net|io|co|me|app|dev|xyz|info|biz|tv|cc|ly|link|site|online|store|shop|tech|ai|gg)[^\s]*/gi, // Domain-like patterns
];

// Social media patterns
const SOCIAL_MEDIA_PATTERNS = [
  /(?:instagram|ig)[\s:@/]*[@]?[a-zA-Z0-9_.]+/gi,
  /(?:facebook|fb)[\s:@/]*[@]?[a-zA-Z0-9_.]+/gi,
  /(?:twitter|x\.com)[\s:@/]*[@]?[a-zA-Z0-9_]+/gi,
  /(?:tiktok|tt)[\s:@/]*[@]?[a-zA-Z0-9_.]+/gi,
  /(?:snapchat|snap)[\s:@/]*[@]?[a-zA-Z0-9_.]+/gi,
  /(?:telegram|tg)[\s:@/]*[@]?[a-zA-Z0-9_]+/gi,
  /(?:whatsapp|whats\s*app|wa\.me)[\s:@/]*[+\d\s-]+/gi,
  /@[a-zA-Z0-9_]{3,}/g, // Generic @username
];

// WhatsApp specific patterns
const WHATSAPP_PATTERNS = [
  /wa\.me\/\d+/gi,
  /whatsapp\.com\/send\?phone=\d+/gi,
  /whats\s*app[\s:]*\+?\d+/gi,
];

export interface FilterResult {
  isClean: boolean;
  filteredContent: string;
  blockedPatterns: string[];
  warningMessage: string | null;
}

/**
 * Check if a message contains blocked content
 */
export function containsBlockedContent(message: string): boolean {
  const normalizedMessage = message.toLowerCase().replace(/\s+/g, ' ');
  
  // Check phone numbers
  for (const pattern of PHONE_PATTERNS) {
    if (pattern.test(normalizedMessage)) {
      pattern.lastIndex = 0; // Reset regex state
      return true;
    }
  }
  
  // Check emails
  if (EMAIL_PATTERN.test(normalizedMessage)) {
    EMAIL_PATTERN.lastIndex = 0;
    return true;
  }
  
  // Check URLs
  for (const pattern of URL_PATTERNS) {
    if (pattern.test(normalizedMessage)) {
      pattern.lastIndex = 0;
      return true;
    }
  }
  
  // Check social media
  for (const pattern of SOCIAL_MEDIA_PATTERNS) {
    if (pattern.test(normalizedMessage)) {
      pattern.lastIndex = 0;
      return true;
    }
  }
  
  // Check WhatsApp
  for (const pattern of WHATSAPP_PATTERNS) {
    if (pattern.test(normalizedMessage)) {
      pattern.lastIndex = 0;
      return true;
    }
  }
  
  return false;
}

/**
 * Filter message and return result with details
 */
export function filterMessage(message: string): FilterResult {
  const blockedPatterns: string[] = [];
  let filteredContent = message;
  
  // Check and collect all blocked patterns
  const allPatterns = [
    ...PHONE_PATTERNS,
    EMAIL_PATTERN,
    ...URL_PATTERNS,
    ...SOCIAL_MEDIA_PATTERNS,
    ...WHATSAPP_PATTERNS,
  ];
  
  for (const pattern of allPatterns) {
    const matches = message.match(pattern);
    if (matches) {
      blockedPatterns.push(...matches);
      filteredContent = filteredContent.replace(pattern, '[blocked]');
    }
    pattern.lastIndex = 0; // Reset regex state
  }
  
  const isClean = blockedPatterns.length === 0;
  
  return {
    isClean,
    filteredContent: isClean ? message : filteredContent,
    blockedPatterns,
    warningMessage: isClean 
      ? null 
      : 'Your message contains contact information which is not allowed. Please use Sakanak\'s secure booking system.',
  };
}

/**
 * Get user-friendly error message
 */
export function getBlockedContentMessage(): string {
  return 'Sharing contact information (phone numbers, emails, links, or social media) is not allowed to protect both parties. Please complete your booking through Sakanak\'s secure payment system.';
}
