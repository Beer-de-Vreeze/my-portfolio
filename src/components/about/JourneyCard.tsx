import React, { useState, useEffect } from 'react';

interface JourneyCardProps {
  steps: {
    title: string;
    category: string;
    date: string;
    description: string;
  }[];
  currentStep?: number;
  onStepClick?: (step: number) => void;
}

const JourneyCard: React.FC<JourneyCardProps> = ({
  steps,
  currentStep = 1,
  onStepClick
}) => {
  const totalSteps = steps.length;
  const [activeStep, setActiveStep] = useState(
    Math.min(Math.max(currentStep, 1), totalSteps)
  );

  const { title, category, date, description } = steps[activeStep - 1];

  const [progressWidth, setProgressWidth] = useState(
    `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
  );

  useEffect(() => {
    setProgressWidth(`${((activeStep - 1) / (totalSteps - 1)) * 100}%`);
  }, [activeStep, totalSteps]);

  const handleStepClick = (step: number) => {
    setActiveStep(step);
    if (onStepClick) {
      onStepClick(step);
    }
  };

  // Map categories to colors
  const categoryColors: { [key: string]: string } = {
    Introduction: "bg-[#1e3a8a] text-blue-400",
    Education: "bg-[#065f46] text-green-400",
    Development: "bg-[#7c2d12] text-orange-400",
    Experience: "bg-[#4b5563] text-gray-400",
    Expertise: "bg-[#6d28d9] text-purple-400"
  };

  // Generate the progress steps
  const renderProgressSteps = () => {
    const steps = [];
    
    // Add the back arrow if not at the first step
    if (activeStep > 1) {
      steps.push(
        <div key="back" className="text-white opacity-80">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    }
    
    // Add the progress line and dots
    steps.push(
      <div key="progress-line" className="flex-1 flex items-center relative">
        <div className="h-1 bg-[#27272a] absolute w-full"></div>
        <div
          className="h-1 bg-white absolute transition-all duration-300"
          style={{ width: progressWidth }}
        ></div>
        {/* Add the smaller black circle with a reduced white border to indicate the current position */}
        <div
          className="w-6 h-6 rounded-full border-2 border-white bg-black absolute z-20 transition-all duration-300"
          style={{ left: progressWidth, transform: 'translateX(-50%)' }}
        ></div>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={`step-${index}`} 
            className={`w-3 h-3 rounded-full absolute z-10 cursor-pointer ${
              index + 1 <= activeStep ? 'bg-white' : 'bg-[#71717a]'
            }`}
            style={{ left: `${(index / (totalSteps - 1)) * 100}%` }}
            onClick={() => handleStepClick(index + 1)}
          ></div>
        ))}
      </div>
    );

    // Add the forward arrow if not at the last step
    if (activeStep < totalSteps) {
      steps.push(
        <div key="forward" className="text-white opacity-80">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 19L16 12L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    }

    return steps;
  };

  return (
    <div className="max-w-2xl mx-auto font-sans">
      <div className="text-4xl font-light mb-6 gradient-text">Journey</div>
      
      <div className="flex items-center gap-2 mb-8">
        {renderProgressSteps()}
      </div>
      
      <div className="border border-[#27272a] rounded-lg p-6 bg-black bg-opacity-50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 items-center">
            <div className="text-white text-2xl font-medium">{title}</div>
            <div
              className={`px-4 py-1 rounded-full text-sm ${
                categoryColors[category] || "bg-[#27272a] text-white"
              }`}
            >
              {category}
            </div>
          </div>
          <div className="text-[#71717a]">{date}</div>
        </div>
        
        <div className="text-white text-opacity-90 leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};

export default JourneyCard;