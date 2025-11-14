import React, { useState, useCallback } from 'react';
import { CandyInputForm } from './components/CandyInputForm';
import { CandyDisplay } from './components/CandyDisplay';
import { generateCandyConcept } from './services/geminiService';
import type { Candy, CandyRequest } from './types';

const App: React.FC = () => {
  const [generatedCandy, setGeneratedCandy] = useState<Candy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCandy = useCallback(async (request: CandyRequest) => {
    setIsLoading(true);
    setError(null);
    setGeneratedCandy(null);

    try {
      const candy = await generateCandyConcept(request);
      setGeneratedCandy(candy);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#1d1d1d]">
      <main className="container mx-auto p-4 sm:p-6 md:p-8 mt-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <div className="flex justify-center mb-4">
              <img src="https://cdn.shopify.com/s/files/1/1737/2459/files/Bold_Maker__PrimaryLogo_Black_72.jpg?v=1761681874" alt="Bold Maker Logo" className="w-[300px]" />
            </div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Create Your Dream Candy!</h2>
            </div>
            <CandyInputForm onGenerate={handleGenerateCandy} isLoading={isLoading} />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Creation</h2>
            </div>
            <CandyDisplay candy={generatedCandy} isLoading={isLoading} error={error} />
          </div>

        </div>
      </main>
      <footer className="text-center p-6 text-sm text-gray-500 mt-8">
        <p>Made by <a href="https://boldmaker.com/pages/custom-molds">Bold Maker</a>. Designed with fun and flavor.</p>
      </footer>
    </div>
  );
};

export default App;
