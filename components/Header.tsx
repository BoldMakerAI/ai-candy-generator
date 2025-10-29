import React from 'react';
import { CandyIcon } from './icons/CandyIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-8 text-center">
      <div className="inline-flex items-center gap-4">
        <CandyIcon className="w-10 h-10 text-gray-800" />
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
          AI Candy Generator
        </h1>
      </div>
    </header>
  );
};