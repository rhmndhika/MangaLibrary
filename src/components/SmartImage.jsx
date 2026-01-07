import React, { useState } from 'react';

const SmartImage = ({ src, alt, className, containerClass = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${containerClass}`}>
      {/* Efek Shimmer/Pulse saat loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
      )}

      <img
        src={hasError ? 'https://placehold.co/256x360?text=No+Cover' : src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy" // Native lazy loading agar hemat bandwidth
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default SmartImage;