import React, { useEffect, useRef, useState } from 'react';

// Sample image list (replace with your image URLs)
const images = [
  require('../Assets/IFX_3452.jpg'),
  require('../Assets/IFX_3513.jpg'),
  require('../Assets/IFX_3531.jpg'),
  require('../Assets/IFX_3582.jpg'),
  require('../Assets/IFX_3591.jpg'),
  require('../Assets/IFX_3597.jpg'),
  require('../Assets/IFX_3599.jpg'),
  require('../Assets/IFX_3661.jpg'),
  require('../Assets/IFX_3681.jpg'),
  require('../Assets/IFX_3735.jpg'),
  require('../Assets/IFX_3743.jpg'),
  require('../Assets/IFX_3753.jpg'),
  require('../Assets/IFX_3765.jpg'),
  require('../Assets/IFX_3773.jpg'),
];

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current image index
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640); // Detect if mobile
  const galleryRef = useRef(null);
  
  // Touch event states
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  useEffect(() => {
    // Update the isMobile state based on window size
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to go to the next image
  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Function to go to the previous image
  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) {
      nextImage(); // Swipe left to go to the next image
    } else if (touchEndX - touchStartX > 50) {
      prevImage(); // Swipe right to go to the previous image
    }
  };

  return (
    <div className="container px-4 py-10">
      <h1 className="text-center font-cardo text-xl lg:text-xl font-bold m-2">
        OUR GALLERY
      </h1>

      <div ref={galleryRef}>
        {isMobile ? (
          // Carousel for mobile
          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[currentIndex]}
              alt={`Gallery ${currentIndex + 1}`}
              className="w-full h-full rounded-2xl object-cover transition-opacity duration-700 ease-in"
            />
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white rounded-full p-2"
            >
              &#10094; {/* Left arrow */}
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white rounded-full p-2"
            >
              &#10095; {/* Right arrow */}
            </button>
          </div>
        ) : (
          // Grid layout for larger screens
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((src, index) => (
              <div key={index} className="gallery-item transition-opacity duration-700 ease-in">
                <img
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full rounded-2xl object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
