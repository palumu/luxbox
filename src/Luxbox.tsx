import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize
} from 'lucide-react';

// ============================================================================
// LIBRARY EXPORTS (This is what users would import from your NPM package)
// ============================================================================

export interface GalleryImage {
  id: string | number;
  url: string;
  thumb: string;
  title?: string;
}

export interface LuxboxProps {
  /** Array of images to display in the gallery */
  images: GalleryImage[];
  /** Title displayed below the main product image */
  title?: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
}

type LoopState = 'idle' | 'out' | 'in';

export const Luxbox: React.FC<LuxboxProps> = ({
                                                images,
                                                title = "Premium Collection",
                                                subtitle = "Click the main image for full-screen view"
                                              }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [lightboxDragStartX, setLightboxDragStartX] = useState<number | null>(null);
  const [lightboxDragOffset, setLightboxDragOffset] = useState<number>(0);
  const [isDraggingLightbox, setIsDraggingLightbox] = useState<boolean>(false);

  const [isDraggingThumbnails, setIsDraggingThumbnails] = useState<boolean>(false);
  const [thumbDragStartX, setThumbDragStartX] = useState<number>(0);
  const [thumbScrollLeft, setThumbScrollLeft] = useState<number>(0);

  const [loopState, setLoopState] = useState<LoopState>('idle');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const dragDistanceRef = useRef<number>(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    setZoomLevel(1);
    setLoopState('idle');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    setIsFullscreen(false);
    setLoopState('idle');
    document.body.style.overflow = 'auto';
  }, []);

  const triggerLoopJump = useCallback((newIndex: number) => {
    setLoopState('out');
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setLoopState('in');
      setTimeout(() => {
        setLoopState('idle');
      }, 50);
    }, 400);
  }, []);

  const nextImage = useCallback(() => {
    if (loopState !== 'idle' || images.length === 0) return;
    setZoomLevel(1);
    if (currentIndex === images.length - 1) {
      triggerLoopJump(0);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, loopState, triggerLoopJump, images.length]);

  const prevImage = useCallback(() => {
    if (loopState !== 'idle' || images.length === 0) return;
    setZoomLevel(1);
    if (currentIndex === 0) {
      triggerLoopJump(images.length - 1);
    } else {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, loopState, triggerLoopJump, images.length]);

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === '+' || e.key === '=') handleZoom(0.2);
      if (e.key === '-') handleZoom(-0.2);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox, nextImage, prevImage]);

  const handleLightboxDragStart = (clientX: number) => {
    if (zoomLevel > 1 || loopState !== 'idle') return;
    setLightboxDragStartX(clientX);
    setIsDraggingLightbox(true);
  };

  const handleLightboxDragMove = (clientX: number) => {
    if (!isDraggingLightbox || lightboxDragStartX === null) return;
    let offset = clientX - lightboxDragStartX;

    if ((currentIndex === 0 && offset > 0) || (currentIndex === images.length - 1 && offset < 0)) {
      offset = offset * 0.3;
    }

    setLightboxDragOffset(offset);
  };

  const handleLightboxDragEnd = (e?: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!isDraggingLightbox) return;
    setIsDraggingLightbox(false);

    const isDrag = Math.abs(lightboxDragOffset) > 5;

    if (isDrag) {
      if (lightboxDragOffset > 75) {
        prevImage();
      } else if (lightboxDragOffset < -75) {
        nextImage();
      }
    } else {
      const target = e?.target as HTMLElement;
      if (target?.classList?.contains('lightbox-slide-wrapper')) {
        closeLightbox();
      }
    }

    setLightboxDragOffset(0);
    setLightboxDragStartX(null);
  };

  useEffect(() => {
    if (carouselRef.current && carouselRef.current.children[currentIndex]) {
      const container = carouselRef.current;
      const activeChild = container.children[currentIndex] as HTMLElement;
      const scrollPos = activeChild.offsetLeft - (container.offsetWidth / 2) + (activeChild.offsetWidth / 2);
      container.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  }, [currentIndex]);

  const handleThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    setIsDraggingThumbnails(true);
    setThumbDragStartX(e.pageX - carouselRef.current.offsetLeft);
    setThumbScrollLeft(carouselRef.current.scrollLeft);
    dragDistanceRef.current = 0;
  };

  const handleThumbMouseLeave = () => setIsDraggingThumbnails(false);
  const handleThumbMouseUp = () => setIsDraggingThumbnails(false);

  const handleThumbMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingThumbnails || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - thumbDragStartX) * 1.5;
    carouselRef.current.scrollLeft = thumbScrollLeft - walk;
    dragDistanceRef.current += Math.abs(walk);
  };

  const handleThumbnailClick = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (dragDistanceRef.current > 10) {
      e.preventDefault();
      return;
    }
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return <div className="text-gray-500 text-center p-8">No images provided</div>;
  }

  let trackTransition = isDraggingLightbox ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
  if (loopState === 'in') trackTransition = 'none';

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      <div
        className="relative aspect-square bg-[#F5F5F5] rounded-lg overflow-hidden cursor-zoom-in group"
        onClick={() => openLightbox(currentIndex)}
      >
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].title || 'Product Image'}
          draggable={false}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-[1500ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-black/5">
          <Maximize className="text-gray-600" size={32} />
        </div>
      </div>

      <div className="relative flex items-center px-12">
        <button
          onClick={prevImage}
          className="absolute left-0 p-2 text-gray-400 hover:text-black border border-gray-200 rounded-md transition-all z-10 bg-white shadow-sm"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={carouselRef}
          className="flex justify-start gap-4 w-full overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing py-2 scroll-smooth"
          onMouseDown={handleThumbMouseDown}
          onMouseLeave={handleThumbMouseLeave}
          onMouseUp={handleThumbMouseUp}
          onMouseMove={handleThumbMouseMove}
          style={{ scrollBehavior: isDraggingThumbnails ? 'auto' : 'smooth' }}
        >
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={(e) => handleThumbnailClick(index, e)}
              className={`relative w-24 h-24 flex-shrink-0 bg-[#F5F5F5] rounded-md overflow-hidden border-2 transition-all p-2 select-none ${
                index === currentIndex ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.thumb}
                draggable={false}
                className="w-full h-full object-contain mix-blend-multiply select-none pointer-events-none"
                alt={img.title || `Thumbnail ${index + 1}`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={nextImage}
          className="absolute right-0 p-2 text-gray-400 hover:text-black border border-gray-200 rounded-md transition-all duration-500 z-10 bg-white shadow-sm"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {(title || subtitle) && (
        <div className="text-center mt-4 transition-opacity duration-1000">
          {title && <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-widest">{title}</h2>}
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
      )}

      {isOpen && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center select-none animate-in fade-in duration-1000 ease-in-out"
        >
          <div className="absolute top-0 left-0 right-0 h-24 px-8 md:px-12 flex items-start pt-8 justify-between z-[1010]">
            <div className="text-gray-400 font-medium text-sm tracking-widest">
              {currentIndex + 1} / {images.length}
            </div>

            <div className="flex items-center gap-6">
              <button onClick={toggleFullscreen} className="text-gray-400 hover:text-black transition-colors duration-500">
                {isFullscreen ? <Minimize size={22} strokeWidth={1.5} /> : <Maximize size={22} strokeWidth={1.5} />}
              </button>
              <button onClick={closeLightbox} className="text-gray-400 hover:text-black transition-colors duration-500" title="Close">
                <X size={28} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleLightboxDragStart(e.clientX)}
            onMouseMove={(e) => handleLightboxDragMove(e.clientX)}
            onMouseUp={handleLightboxDragEnd}
            onMouseLeave={handleLightboxDragEnd}
            onTouchStart={(e) => handleLightboxDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleLightboxDragMove(e.touches[0].clientX)}
            onTouchEnd={handleLightboxDragEnd}
          >
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-12 z-[1010] p-4 text-gray-300 hover:text-black transition-colors duration-500 md:block hidden"
            >
              <ChevronLeft size={40} strokeWidth={1} />
            </button>

            <div
              className="flex w-full h-full items-center"
              style={{
                transform: `translateX(calc(-${currentIndex * 100}% + ${lightboxDragOffset}px))`,
                transition: trackTransition
              }}
            >
              {images.map((img, idx) => {
                const isCurrent = idx === currentIndex;
                let imgTransform = isCurrent ? `scale(${zoomLevel})` : 'scale(1)';
                let imgOpacity = 1;
                let imgTransition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.6s ease';

                if (isCurrent) {
                  if (loopState === 'out') {
                    imgTransform = 'scale(0.95)';
                    imgOpacity = 0;
                    imgTransition = 'all 0.4s ease';
                  } else if (loopState === 'in') {
                    imgTransform = 'scale(1.05)';
                    imgOpacity = 0;
                    imgTransition = 'none';
                  }
                }

                return (
                  <div
                    key={`lb-${img.id}`}
                    className="w-full h-full flex-shrink-0 flex items-center justify-center p-4 sm:p-24 relative lightbox-slide-wrapper"
                  >
                    <img
                      src={img.url}
                      alt={img.title || `Gallery Image ${idx + 1}`}
                      draggable={false}
                      style={{ transform: imgTransform, opacity: imgOpacity, transition: imgTransition }}
                      className="max-w-full max-h-full object-contain mix-blend-multiply select-none"
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-12 z-[1010] p-4 text-gray-300 hover:text-black transition-colors duration-500 md:block hidden"
            >
              <ChevronRight size={40} strokeWidth={1} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};


// ============================================================================
// DEMO / CONSUMER APP (How an end-user implements your library)
// ============================================================================

const DEMO_IMAGES: GalleryImage[] = [
  { id: 1, url: 'https://picsum.photos/id/21/1600/1600', thumb: 'https://picsum.photos/id/21/200/200', title: 'Classic Shoes' },
  { id: 2, url: 'https://picsum.photos/id/175/1600/1600', thumb: 'https://picsum.photos/id/175/200/200', title: 'Vintage Clock' },
  { id: 3, url: 'https://picsum.photos/id/250/1600/1600', thumb: 'https://picsum.photos/id/250/200/200', title: 'Retro Camera' },
  { id: 4, url: 'https://picsum.photos/id/326/1600/1600', thumb: 'https://picsum.photos/id/326/200/200', title: 'Silver Teapot' },
];

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-12">
      <div className="max-w-2xl w-full">
        {/* Implementing the exported library component */}
        <Luxbox
          images={DEMO_IMAGES}
          title="Marli Collection"
          subtitle="Explore the latest additions"
        />
      </div>
    </div>
  );
};

export default App;
