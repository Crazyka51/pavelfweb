import prisma from './prisma-client';

// Cache for texts to minimize database queries
const textsCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get editable text from database with fallback to default value
 * 
 * @param component - Component name (e.g., "hero", "about")
 * @param key - Text key (e.g., "title", "description")
 * @param defaultValue - Fallback value if text not found
 * @param lang - Language code (default: "cs")
 * @returns Text value from database or default value
 */
export async function getText(
  component: string,
  key: string,
  defaultValue: string,
  lang: string = 'cs'
): Promise<string> {
  const cacheKey = `${component}:${key}:${lang}`;
  
  // Check cache first
  const cached = textsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  try {
    const text = await prisma.editableText.findUnique({
      where: {
        component_textKey_lang: {
          component,
          textKey: key,
          lang
        }
      }
    });

    const value = text?.value || defaultValue;
    
    // Update cache
    textsCache.set(cacheKey, {
      value,
      timestamp: Date.now()
    });

    return value;
  } catch (error) {
    console.error(`Error fetching text for ${component}.${key}:`, error);
    return defaultValue;
  }
}

/**
 * Get multiple editable texts at once
 * 
 * @param component - Component name
 * @param keys - Array of text keys with their default values
 * @param lang - Language code (default: "cs")
 * @returns Object with text keys and their values
 */
export async function getTexts(
  component: string,
  keys: Array<{ key: string; defaultValue: string }>,
  lang: string = 'cs'
): Promise<Record<string, string>> {
  try {
    const texts = await prisma.editableText.findMany({
      where: {
        component,
        textKey: { in: keys.map(k => k.key) },
        lang
      }
    });

    const result: Record<string, string> = {};
    
    for (const keyConfig of keys) {
      const found = texts.find(t => t.textKey === keyConfig.key);
      result[keyConfig.key] = found?.value || keyConfig.defaultValue;
      
      // Update cache
      const cacheKey = `${component}:${keyConfig.key}:${lang}`;
      textsCache.set(cacheKey, {
        value: result[keyConfig.key],
        timestamp: Date.now()
      });
    }

    return result;
  } catch (error) {
    console.error(`Error fetching texts for ${component}:`, error);
    
    // Return default values on error
    const result: Record<string, string> = {};
    for (const keyConfig of keys) {
      result[keyConfig.key] = keyConfig.defaultValue;
    }
    return result;
  }
}

/**
 * Clear the texts cache (useful when texts are updated)
 */
export function clearTextsCache() {
  textsCache.clear();
}

/**
 * Client-side hook for getting editable texts
 * This fetches from the API endpoint
 */
export async function getTextClient(
  component: string,
  key: string,
  defaultValue: string,
  lang: string = 'cs'
): Promise<string> {
  try {
    const response = await fetch(`/api/texts?component=${component}&lang=${lang}`);
    if (!response.ok) {
      return defaultValue;
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      return defaultValue;
    }

    const text = data.data.find((t: any) => t.textKey === key);
    return text?.value || defaultValue;
  } catch (error) {
    console.error(`Error fetching text for ${component}.${key}:`, error);
    return defaultValue;
  }
}
