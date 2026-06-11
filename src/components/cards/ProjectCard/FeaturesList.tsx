import React from 'react';
import type { ProjectFeature } from './types';
import CodeBlock from './CodeBlock';

interface FeaturesListProps {
  features: ProjectFeature[];
  collapsedCodeSnippets: { [key: string]: boolean };
  onToggleSnippet: (id: string) => void;
  pressedButton: string | null;
  onCopyCode: (code: string, id: string) => void;
}

const FeaturesList: React.FC<FeaturesListProps> = ({
  features,
  collapsedCodeSnippets,
  onToggleSnippet,
  pressedButton,
  onCopyCode,
}) => {
  return (
    <div className="mb-8">
      <div className="bg-linear-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20 mb-4">
        <h2 className="text-xl font-bold text-white drop-shadow-lg">Features</h2>
      </div>

      <ul className="grid grid-cols-1 gap-6">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex flex-col gap-3 bg-linear-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20"
          >
            <span className="text-blue-200 font-semibold text-sm sm:text-base drop-shadow-lg">
              {feature.title}
            </span>
            <span className="text-gray-100 text-sm sm:text-base leading-relaxed">
              {feature.description}
            </span>

            {feature.codeSnippet && (
              <CodeBlock
                snippetId={`feature-${index}`}
                code={feature.codeSnippet.code}
                language={feature.codeSnippet.language}
                title={feature.codeSnippet.title}
                collapsed={!!collapsedCodeSnippets[`feature-${index}`]}
                onToggle={onToggleSnippet}
                pressedButton={pressedButton}
                onCopy={onCopyCode}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeaturesList;
