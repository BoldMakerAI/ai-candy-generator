import React, { useState } from 'react';
import { CandyType } from '../types';
import type { CandyRequest } from '../types';

interface CandyInputFormProps {
  onGenerate: (request: CandyRequest) => void;
  isLoading: boolean;
}

export const CandyInputForm: React.FC<CandyInputFormProps> = ({ onGenerate, isLoading }) => {
  const [keywords, setKeywords] = useState('');
  const [candyType, setCandyType] = useState<CandyType>(CandyType.Gummy);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ keywords, candyType });
  };

  const inputLabelStyle = "block text-sm font-medium text-gray-700 mb-2";
  const inputStyle = "w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff9902] focus:border-[#ff9902] transition-all duration-200 shadow-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="keywords" className={inputLabelStyle}>
          Describe Your Idea!
        </label>
        <input
          id="keywords"
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className={inputStyle}
          placeholder="orange astronaut gummy, small space rocket"
          required
        />
      </div>

      <div>
        <label htmlFor="candyType" className={inputLabelStyle}>
          Candy Type
        </label>
        <select
          id="candyType"
          value={candyType}
          onChange={(e) => setCandyType(e.target.value as CandyType)}
          className={inputStyle}
        >
          {Object.values(CandyType).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 flex items-center justify-center px-6 py-3 font-bold text-white bg-[#ff9902] rounded-lg shadow-md hover:bg-[#e68a02] transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Inventing...
          </>
        ) : (
          'Generate Candy'
        )}
      </button>
    </form>
  );
};