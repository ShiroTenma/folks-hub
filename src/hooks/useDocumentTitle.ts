import { useEffect } from 'react';
import { APP_CONFIG } from '@/lib/constants';

/**
 * Custom hook to update the browser tab title.
 * @param title - The specific page title (e.g., 'Finance')
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const baseTitle = APP_CONFIG.NAME;
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;
  }, [title]);
}
