import { useState, useCallback, useRef, useEffect } from 'react';
import { validateUrl } from '../utils/excel';

interface UrlLoaderProps {
  onLoad: (url: string) => void;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'xlsGrid:lastUrl';

function getInitialUrl(): string {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export const UrlLoader: React.FC<UrlLoaderProps> = ({ onLoad, isLoading, error }) => {
  const [url, setUrl] = useState(getInitialUrl);
  const [rememberLink, setRememberLink] = useState(true);
  const [hasSavedUrl, setHasSavedUrl] = useState(() => localStorage.getItem(STORAGE_KEY) !== null);
  const autoLoadedRef = useRef(false);

  const handleLoad = useCallback(() => {
    if (!url.trim()) return;

    if (rememberLink) {
      localStorage.setItem(STORAGE_KEY, url);
      setHasSavedUrl(true);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedUrl(false);
    }

    onLoad(url);
  }, [url, rememberLink, onLoad]);

  // Auto-load on mount if a saved URL exists
  useEffect(() => {
    if (!autoLoadedRef.current && url) {
      autoLoadedRef.current = true;
      onLoad(url);
    }
  }, [url, onLoad]);

  const handleClearSaved = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUrl('');
    setHasSavedUrl(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoad();
    }
  };

  const validation = url ? validateUrl(url) : { valid: false };
  const canLoad = url.trim() !== '' && validation.valid;

  return (
    <div className="url-loader">
      <div className="url-input-row">
        <input
          type="text"
          placeholder="Paste SharePoint or Excel file link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="url-input"
        />
        <button
          onClick={handleLoad}
          disabled={isLoading || !canLoad}
          className="btn btn-primary"
        >
          {isLoading ? (
            <span className="btn-loading">
              <span className="spinner" />
              Loading&hellip;
            </span>
          ) : (
            'Load'
          )}
        </button>
      </div>

      <div className="url-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={rememberLink}
            onChange={(e) => setRememberLink(e.target.checked)}
            disabled={isLoading}
          />
          Remember this link
        </label>
        {hasSavedUrl && (
          <button
            onClick={handleClearSaved}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Clear saved link
          </button>
        )}
      </div>

      {validation.warning && !isLoading && (
        <div className="warning-message">{validation.warning}</div>
      )}

      {validation.error && !isLoading && (
        <div className="error-message">{validation.error}</div>
      )}

      {error && (
        <div className="error-banner">
          <p><strong>Error loading file:</strong> {error}</p>
          <button
            onClick={() => url && window.open(url, '_blank')}
            className="btn btn-small"
          >
            Try opening link in new tab
          </button>
          <p className="hint-text">
            Tip: If the link doesn't work directly, try getting a direct download link from SharePoint
            (right-click file &rarr; Share &rarr; Copy link &rarr; ensure it's a direct download URL).
          </p>
        </div>
      )}
    </div>
  );
};
