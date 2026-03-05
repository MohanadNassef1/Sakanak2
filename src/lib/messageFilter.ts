/**
 * Message filtering utility to detect and block contact information
 * Prevents sharing of phone numbers, emails, links, and social media handles
 */

// Egyptian phone number patterns (010, 011, 012, 015, +20, 020)
// These specifically target Egyptian mobile numbers and their obfuscated variants
const PHONE_PATTERNS = [
  // Standard Egyptian mobile: 01012345678, 01112345678, 01212345678, 01512345678
  /\b01[0125]\d{8}\b/g,
  // With separators: 010-1234-5678, 011 1234 5678, 012.1234.5678
  /\b01[0125][-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
  // International format: +201012345678, +20-10-12345678, 00201012345678
  /(?:\+|00)20[-.\s]?1[0125][-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
  // With country code prefix: 020-1012345678
  /\b020[-.\s]?1[0125][-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
  // Obfuscated with commas/special chars: 0,1,0,1,2,3,4,5,6,7,8 or 0-1-0-1-2-3-4-5-6-7-8
  /0\s*[,\-._|/\\]\s*1\s*[,\-._|/\\]\s*[0125]\s*[,\-._|/\\]\s*\d\s*[,\-._|/\\]\s*\d\s*[,\-._|/\\]\s*\d/g,
  // Written out with spaces between each digit starting with 01X
  /\b0\s+1\s+[0125](\s+\d){5,8}\b/g,
  // Arabic/spelled out patterns like "zero one zero"
  /zero\s*one\s*[zero|one|two|five]/gi,
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
  if (!message || message.trim().length === 0) return false;
  
  const normalizedMessage = message.toLowerCase().replace(/\s+/g, ' ');
  
  const allPatterns = [
    ...PHONE_PATTERNS,
    EMAIL_PATTERN,
    ...URL_PATTERNS,
    ...SOCIAL_MEDIA_PATTERNS,
    ...WHATSAPP_PATTERNS,
  ];
  
  for (const pattern of allPatterns) {
    pattern.lastIndex = 0; // Reset BEFORE testing
    if (pattern.test(normalizedMessage)) {
      pattern.lastIndex = 0; // Reset after match too
      return true;
    }
    pattern.lastIndex = 0; // Reset after no match
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
