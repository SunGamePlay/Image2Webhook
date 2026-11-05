import React, { useEffect, useState } from 'react';
import { useGalleryStore } from '../../stores/useGalleryStore';
import { Topbar } from './Topbar';
import { ImageSidebar } from './ImageSidebar';
import { ImageViewerPane } from './ImageViewerPane';
import { FormPane } from '../forms/FormPane';
import { JsonDrawer } from './JsonDrawer';
import { Splitter } from '../../components/layout/Splitter';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

export const ComparisonStudio: React.FC = () => {
  const { fetchItems, splitRatio, setSplitRatio } = useGalleryStore();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white select-none comparison-studio-root">
      <Topbar />

      <div className="flex-1 flex overflow-hidden relative comparison-body-row">
        <ImageSidebar />

        <div className="flex-1 flex overflow-hidden comparison-panes-row">
          {splitRatio > 0 && (
            <div
              style={{ width: splitRatio === 100 ? '100%' : `${splitRatio}%` }}
              className="h-full overflow-hidden flex comparison-image-pane"
            >
              <ImageViewerPane onOpenLightbox={(url) => setLightboxUrl(url)} />
            </div>
          )}

          {splitRatio > 0 && splitRatio < 100 && (
            <Splitter onRatioChange={setSplitRatio} />
          )}

          {splitRatio < 100 && (
            <div
              style={{ width: splitRatio === 0 ? '100%' : `${100 - splitRatio}%` }}
              className="h-full overflow-hidden flex comparison-form-pane"
            >
              <ErrorBoundary>
                <FormPane />
              </ErrorBoundary>
            </div>
          )}
        </div>

        <JsonDrawer />
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-8 cursor-zoom-out backdrop-blur-xs"
        >
          <img src={lightboxUrl} alt="" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
};
