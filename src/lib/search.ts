import MiniSearch from 'minisearch';

/**
 * Normalizes Persian and Arabic text for consistent searching:
 * - Unifies Yeh (ي -> ی) and Kaf (ك -> ک)
 * - Converts half-spaces (zero-width spaces \u200c) to standard spaces
 * - Removes Arabic diacritics (fatha, damma, etc.)
 * - Lowercases and trims
 */
export function normalizePersian(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove Arabic vowels/harakat
    .replace(/\u064A/g, '\u06CC') // Arabic Yeh to Persian Ye
    .replace(/\u0643/g, '\u06A9') // Arabic Kaf to Persian Ke
    .replace(/[\u200C\u200B\u00A0]/g, ' ') // zero-width and non-breaking spaces to space
    .replace(/[«»؛،؟—–]/g, ' ') // Persian punctuation to spaces
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ') // remove other special chars
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Custom tokenizer for Persian words
 */
export function persianTokenizer(text: string): string[] {
  const normalized = normalizePersian(text);
  if (!normalized) return [];
  return normalized.split(/\s+/).filter((token) => token.length > 1);
}

export interface SearchableArticleDoc {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  keywords: string;
  content: string;
  author: string;
}

/**
 * Builds and configures a MiniSearch index instance for articles with Persian support & field boosting
 */
export function createArticlesSearchIndex(docs: SearchableArticleDoc[]) {
  const miniSearch = new MiniSearch<SearchableArticleDoc>({
    fields: ['title', 'keywords', 'summary', 'content', 'category'],
    storeFields: ['id', 'slug', 'title', 'category', 'summary'],
    processTerm: (term) => normalizePersian(term),
    tokenize: (text) => persianTokenizer(text),
    searchOptions: {
      boost: {
        title: 4.0,     // Exact matches in title have highest relevance
        keywords: 3.0,  // Symptoms & tags (e.g. میخک, دیابت, ورم)
        summary: 2.0,   // Summary match
        content: 1.0,   // Matches anywhere in article body
        category: 1.5,
      },
      prefix: true,     // Matches prefixes while typing (e.g. ایمپ -> ایمپلنت)
      fuzzy: 0.2,       // Allows small typo tolerance
      combineWith: 'AND',
    },
  });

  miniSearch.addAll(docs);
  return miniSearch;
}

/**
 * Extracts a contextual snippet around the matched search terms
 */
export function extractSnippet(fullText: string, query: string, maxLength: number = 140): string {
  if (!query || !fullText) return '';

  const cleanQueryWords = persianTokenizer(query);
  if (cleanQueryWords.length === 0) return fullText.slice(0, maxLength) + '...';

  const normalizedText = normalizePersian(fullText);
  let bestMatchIndex = -1;

  for (const word of cleanQueryWords) {
    const idx = normalizedText.indexOf(word);
    if (idx !== -1) {
      bestMatchIndex = idx;
      break;
    }
  }

  if (bestMatchIndex === -1) {
    return fullText.length > maxLength ? fullText.slice(0, maxLength) + '...' : fullText;
  }

  const start = Math.max(0, bestMatchIndex - 45);
  const end = Math.min(fullText.length, bestMatchIndex + maxLength - 45);

  let snippet = fullText.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < fullText.length) snippet = snippet + '...';

  return snippet;
}
