import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/user/components/ui/dialog';

/** Square lens on the preview image */
const LENS_SIZE = 160;
/** Enlarged pane — scale = ZOOM_SIZE / LENS_SIZE so lens content fills the pane exactly */
const ZOOM_SIZE = 480;

type GalleryImage = {
  src: string;
  alt: string;
};

type ProductImageGalleryProps = {
  images: GalleryImage[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
};

type ObjectCoverMetrics = {
  containerWidth: number;
  containerHeight: number;
  renderedWidth: number;
  renderedHeight: number;
  offsetX: number;
  offsetY: number;
};

function computeObjectCoverMetrics(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number,
): ObjectCoverMetrics {
  const containerAspect = containerW / containerH;
  const imgAspect = naturalW / naturalH;

  if (imgAspect > containerAspect) {
    const renderedHeight = containerH;
    const renderedWidth = containerH * imgAspect;
    return {
      containerWidth: containerW,
      containerHeight: containerH,
      renderedWidth,
      renderedHeight,
      offsetX: (containerW - renderedWidth) / 2,
      offsetY: 0,
    };
  }

  const renderedWidth = containerW;
  const renderedHeight = containerW / imgAspect;
  return {
    containerWidth: containerW,
    containerHeight: containerH,
    renderedWidth,
    renderedHeight,
    offsetX: 0,
    offsetY: (containerH - renderedHeight) / 2,
  };
}

function clampLensCenter(
  x: number,
  y: number,
  metrics: ObjectCoverMetrics,
  lensSize: number,
) {
  const half = lensSize / 2;
  return {
    x: Math.max(
      metrics.offsetX + half,
      Math.min(metrics.offsetX + metrics.renderedWidth - half, x),
    ),
    y: Math.max(
      metrics.offsetY + half,
      Math.min(metrics.offsetY + metrics.renderedHeight - half, y),
    ),
  };
}

function computeZoomTransform(
  lensX: number,
  lensY: number,
  metrics: ObjectCoverMetrics,
  lensSize: number,
  zoomSize: number,
) {
  const scale = zoomSize / lensSize;
  const relX = lensX - metrics.offsetX;
  const relY = lensY - metrics.offsetY;
  const ratioX = relX / metrics.renderedWidth;
  const ratioY = relY / metrics.renderedHeight;
  const zoomW = metrics.renderedWidth * scale;
  const zoomH = metrics.renderedHeight * scale;

  return {
    width: zoomW,
    height: zoomH,
    translateX: zoomSize / 2 - ratioX * zoomW,
    translateY: zoomSize / 2 - ratioY * zoomH,
  };
}

function GalleryArrow({
  direction,
  onClick,
  className = '',
}: {
  direction: 'prev' | 'next';
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-background hover:scale-105 ${className}`}
      aria-label={direction === 'prev' ? 'Previous image' : 'Next image'}
    >
      <Icon size={20} strokeWidth={1.5} />
    </button>
  );
}

export default function ProductImageGallery({
  images,
  selectedIndex,
  onSelectIndex,
}: ProductImageGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [hovering, setHovering] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [metrics, setMetrics] = useState<ObjectCoverMetrics | null>(null);
  const [canZoom, setCanZoom] = useState(false);

  const active = images[selectedIndex] ?? images[0];

  const refreshMetrics = useCallback(() => {
    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img || !img.naturalWidth) return;

    const rect = container.getBoundingClientRect();
    setMetrics(
      computeObjectCoverMetrics(
        rect.width,
        rect.height,
        img.naturalWidth,
        img.naturalHeight,
      ),
    );
  }, []);

  useEffect(() => {
    setHovering(false);
    setMetrics(null);
  }, [active?.src, selectedIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(refreshMetrics);
    observer.observe(container);
    return () => observer.disconnect();
  }, [refreshMetrics]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    const update = () => setCanZoom(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const updateLens = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !metrics) return;

      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      setLensPos(clampLensCenter(rawX, rawY, metrics, LENS_SIZE));
    },
    [metrics],
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    updateLens(e.clientX, e.clientY);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    refreshMetrics();
    setHovering(true);
    updateLens(e.clientX, e.clientY);
  };

  const goToPrevious = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectIndex((selectedIndex - 1 + images.length) % images.length);
    },
    [images.length, onSelectIndex, selectedIndex],
  );

  const goToNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectIndex((selectedIndex + 1) % images.length);
    },
    [images.length, onSelectIndex, selectedIndex],
  );

  useEffect(() => {
    if (!lightboxOpen || images.length <= 1) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onSelectIndex((selectedIndex - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSelectIndex((selectedIndex + 1) % images.length);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, images.length, onSelectIndex, selectedIndex]);

  if (!active) return null;

  const zoomTransform =
    metrics && hovering && canZoom
      ? computeZoomTransform(lensPos.x, lensPos.y, metrics, LENS_SIZE, ZOOM_SIZE)
      : null;

  const showZoom = Boolean(canZoom && hovering && metrics && zoomTransform);

  return (
    <>
      <div className="relative">
        <div
          ref={containerRef}
          className={`relative aspect-[4/5] overflow-hidden rounded-sm bg-surface group ${
            canZoom ? 'cursor-crosshair lg:cursor-crosshair' : 'cursor-zoom-in'
          }`}
          onMouseEnter={canZoom ? handleMouseEnter : undefined}
          onMouseLeave={canZoom ? () => setHovering(false) : undefined}
          onMouseMove={canZoom ? handleMouseMove : undefined}
          onClick={() => setLightboxOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setLightboxOpen(true);
            }
          }}
          aria-label="View enlarged product image"
        >
          <img
            ref={imageRef}
            src={active.src}
            alt={active.alt}
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
            onLoad={refreshMetrics}
          />

          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-sm bg-background/80 px-2.5 py-1.5 font-body text-[10px] uppercase tracking-[1px] text-muted-foreground backdrop-blur-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn size={12} />
            {canZoom ? 'Hover to zoom · Click to enlarge' : 'Tap to enlarge'}
          </div>

          {showZoom && (
            <div
              className="absolute hidden lg:block border-2 border-background/90 bg-background/10 pointer-events-none shadow-md"
              style={{
                width: LENS_SIZE,
                height: LENS_SIZE,
                left: lensPos.x - LENS_SIZE / 2,
                top: lensPos.y - LENS_SIZE / 2,
              }}
            />
          )}

          {images.length > 1 && (
            <>
              <GalleryArrow
                direction="prev"
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 opacity-90 lg:opacity-0 lg:group-hover:opacity-100"
              />
              <GalleryArrow
                direction="next"
                onClick={goToNext}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 opacity-90 lg:opacity-0 lg:group-hover:opacity-100"
              />
            </>
          )}
        </div>

        {showZoom && zoomTransform && (
          <div
            className="hidden lg:block absolute left-full top-0 z-20 ml-5 overflow-hidden rounded-sm border border-border bg-surface shadow-xl pointer-events-none"
            style={{ width: ZOOM_SIZE, height: ZOOM_SIZE }}
            aria-hidden
          >
            <img
              src={active.src}
              alt=""
              draggable={false}
              className="max-w-none select-none"
              style={{
                width: zoomTransform.width,
                height: zoomTransform.height,
                transform: `translate(${zoomTransform.translateX}px, ${zoomTransform.translateY}px)`,
              }}
            />
          </div>
        )}

        {images.length > 1 && (
          <div className="flex gap-2 flex-wrap mt-4">
            {images.map((image, i) => (
              <button
                key={`${image.src}-${i}`}
                type="button"
                onClick={() => onSelectIndex(i)}
                className={`h-20 w-16 rounded-sm overflow-hidden border-2 transition-colors ${
                  selectedIndex === i ? 'border-accent' : 'border-transparent hover:border-border'
                }`}
                aria-label={`View ${image.alt}`}
                aria-current={selectedIndex === i}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none [&>button:last-child]:hidden">
          <div className="relative">
            <DialogClose className="absolute -top-2 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md hover:bg-background">
              <X size={18} />
              <span className="sr-only">Close</span>
            </DialogClose>
            {images.length > 1 && (
              <>
                <GalleryArrow
                  direction="prev"
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 sm:left-4"
                />
                <GalleryArrow
                  direction="next"
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 sm:right-4"
                />
              </>
            )}
            <img
              src={active.src}
              alt={active.alt}
              className="w-full max-h-[85vh] object-contain rounded-sm bg-background"
            />
            {images.length > 1 && (
              <div className="mt-4 flex justify-center gap-2 flex-wrap">
                {images.map((image, i) => (
                  <button
                    key={`lb-${image.src}-${i}`}
                    type="button"
                    onClick={() => onSelectIndex(i)}
                    className={`h-16 w-14 rounded-sm overflow-hidden border-2 transition-colors ${
                      selectedIndex === i ? 'border-accent' : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
