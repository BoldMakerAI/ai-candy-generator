import React from 'react';
import type { Candy } from '../types';
import { GiftIcon } from './icons/GiftIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface CandyDisplayProps {
  candy: Candy | null;
  isLoading: boolean;
  error: string | null;
}

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="w-full bg-gray-200 rounded-lg aspect-square"></div>
    <div className="h-8 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
  </div>
);

const InitialState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 pt-8">
    <GiftIcon className="w-20 h-20 mb-4 text-gray-400" />
    <h3 className="text-xl font-semibold text-gray-900">Your Candy Creation Awaits!</h3>
    <p className="mt-2 max-w-sm">Fill out the form to generate a unique, downloadable candy concept!</p>
  </div>
);

export const CandyDisplay: React.FC<CandyDisplayProps> = ({ candy, isLoading, error }) => {
  const handleDownload = () => {
    if (!candy) return;

    const img = new Image();
    img.crossOrigin = 'anonymous'; 
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw the original candy image
      ctx.drawImage(img, 0, 0);

      // Add the watermark
      const watermarkText = 'boldmaker.com';
      // Make font size responsive, with a minimum of 48px
      const fontSize = Math.max(48, canvas.width / 12);
      ctx.font = `bold ${fontSize}px Poppins`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Semi-transparent white
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);

      // Convert canvas to PNG and trigger download
      const pngUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = pngUrl;
      const fileName = `${candy.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = candy.imageUrl;
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-700 bg-red-50 p-6 rounded-lg border border-red-200">
        <h3 className="text-xl font-semibold text-red-800">Oops! Something went wrong.</h3>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (!candy) {
    return <InitialState />;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <h3 className="text-xl font-bold text-center text-gray-800 break-words">{candy.name}</h3>
      <div className="w-full aspect-square rounded-xl overflow-hidden shadow-lg border-4 border-gray-100 group relative">
        <img
          src={candy.imageUrl}
          alt={candy.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button
            onClick={handleDownload}
            className="flex items-center justify-center px-5 py-2.5 font-medium text-white bg-gray-700 rounded-lg shadow-sm hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all duration-300"
            aria-label={`Download ${candy.name} as a PNG`}
           >
            <DownloadIcon className="w-5 h-5 mr-2" />
            Download as PNG
          </button>
        </div>
      </div>
    </div>
  );
};