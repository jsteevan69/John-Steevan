
import React from 'react';
import { GroundingSource } from '../types';

interface GroundingSourcesProps {
  sources: GroundingSource[];
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sources Grounded:</h4>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center bg-white px-2 py-1 rounded border border-gray-200"
          >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
          </a>
        ))}
      </div>
    </div>
  );
};

export default GroundingSources;
