import axios from 'axios';

export class ScraperUtils {
  static buildCategoryUrls(baseCategoryUrl: string, categories: readonly string[]): string[] {
    return categories.map((category) => `${baseCategoryUrl}${category}`);
  }

  static buildPagedCategoryUrl(categoryUrl: string, page: number): string {
    return categoryUrl.replace(/\/\d+$/, `/${page}`);
  }

  static buildAbsoluteUrl(baseUrl: string, relativeUrl?: string): string {
    if (!relativeUrl) {
      return '';
    }

    if (
      relativeUrl.startsWith('http://') ||
      relativeUrl.startsWith('https://')
    ) {
      return relativeUrl;
    }

    return `${baseUrl}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
  }

  static extractFirstSrcsetUrl(srcset?: string): string | undefined {
    if (!srcset) {
      return undefined;
    }

    const firstCandidate = srcset
      .split(',')
      .map((entry) => entry.trim().split(/\s+/)[0])
      .find(Boolean);

    return firstCandidate?.trim() || undefined;
  }

  static getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return `${error.message}${error.response ? ` (status ${error.response.status})` : ''}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }

  static isForbiddenAxiosError(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 403;
  }
}
