import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface JourneyStep {
  title: string;
  category: 'Introduction' | 'Education' | 'Development' | 'Experience' | 'Expertise';
  date: string;
  description: string;
  highlights?: string[];
}

interface JourneyCardProps {
  steps: JourneyStep[];
  currentStep?: number;
  onStepClick?: (step: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const JourneyCard: React.FC<JourneyCardProps> = ({
  steps,
  currentStep = 1,
  onStepClick,
  autoPlay = false,
  autoPlayInterval = 5000
}) => {
  const totalSteps = steps.length;
  const [activeStep, setActiveStep] = useState(
    Math.min(Math.max(currentStep, 1), totalSteps)
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStepData = useMemo(() => steps[activeStep - 1], [steps, activeStep]);
  const { title, category, date, description } = currentStepData;

  const [progressWidth, setProgressWidth] = useState(
    `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
  );

  useEffect(() => {
    setProgressWidth(`${((activeStep - 1) / (totalSteps - 1)) * 100}%`);
  }, [activeStep, totalSteps]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || totalSteps <= 1) return;

    const interval = setInterval(() => {
      setActiveStep(prev => prev >= totalSteps ? 1 : prev + 1);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, totalSteps]);

  const handleStepClick = useCallback((step: number) => {
    if (step === activeStep || isAnimating || step < 1 || step > totalSteps) return;
    
    setIsAnimating(true);
    setActiveStep(step);
    onStepClick?.(step);
    
    setTimeout(() => setIsAnimating(false), 200);
  }, [activeStep, isAnimating, onStepClick, totalSteps]);

  const handleKeyNavigation = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && activeStep > 1) {
      handleStepClick(activeStep - 1);
    } else if (event.key === 'ArrowRight' && activeStep < totalSteps) {
      handleStepClick(activeStep + 1);
    }
  }, [activeStep, totalSteps, handleStepClick]);

  // Map categories to colors with enhanced styling
  const categoryColors: Record<JourneyStep['category'], string> = useMemo(() => ({
    Introduction: "bg-[#1e3a8a] text-blue-400",
    Education: "bg-[#065f46] text-green-400",
    Development: "bg-[#7c2d12] text-orange-400",
    Experience: "bg-[#4b5563] text-gray-400",
    Expertise: "bg-[#6d28d9] text-purple-400"
  }), []);

  // Generate the progress steps
  const renderProgressSteps = () => {
    const steps = [];
    
    // Add the back arrow (always visible but disabled on first step)
    steps.push(
      <div 
        key="back" 
        className={`transition-all duration-200 ${
          activeStep > 1 
            ? "text-white opacity-80 cursor-pointer hover:opacity-100" 
            : "text-gray-400 opacity-50 cursor-not-allowed"
        }`}
        onClick={() => activeStep > 1 && handleStepClick(activeStep - 1)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
    
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
          className="w-6 h-6 rounded-full border-2 border-white bg-black absolute z-20 shadow-md transition-all duration-300"
          style={{ left: progressWidth, transform: 'translateX(-50%)' }}
        ></div>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={`step-${index}`} 
            className={`w-3 h-3 rounded-full absolute z-10 cursor-pointer transition-all duration-200 hover:scale-110 ${
              index + 1 <= activeStep ? 'bg-white' : 'bg-[#71717a] hover:bg-[#9ca3af]'
            }`}
            style={{ left: `${(index / (totalSteps - 1)) * 100}%` }}
            onClick={() => handleStepClick(index + 1)}
          ></div>
        ))}
      </div>
    );

    // Add the forward arrow (always visible but disabled on last step)
    steps.push(
      <div 
        key="forward" 
        className={`transition-all duration-200 ${
          activeStep < totalSteps 
            ? "text-white opacity-80 cursor-pointer hover:opacity-100" 
            : "text-gray-400 opacity-50 cursor-not-allowed"
        }`}
        onClick={() => activeStep < totalSteps && handleStepClick(activeStep + 1)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 19L16 12L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );

    return steps;
  };

  return (
    <div 
      className="w-full max-w-[800px] focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyNavigation}
      role="region"
      aria-label="Journey timeline"
    >
      <div className="w-full max-w-[800px] bg-black border border-[#27272a] rounded-lg shadow-lg p-4 transition-all duration-300">
        <div className="flex justify-between items-center border-b border-[#27272a] pb-3 mb-4">
          <h1 className="text-xl font-semibold text-white gradient-text">Journey</h1>
          <div className="text-sm text-gray-400">
            {activeStep} of {totalSteps}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {renderProgressSteps()}
        </div>

        <div className={`border border-[#27272a] rounded-lg p-6 bg-black bg-opacity-50 shadow-lg transition-all duration-200 ${isAnimating ? 'opacity-75' : 'opacity-100'}`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <div className="text-white text-lg font-semibold">{title}</div>
              <div className="text-[#71717a] text-sm">{date}</div>
            </div>
            <div className="flex gap-4 items-center">
              <div
                className={`px-4 py-1 rounded-full text-sm transition-all duration-200 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${categoryColors[category] || "bg-[#27272a] text-white"}`}
              >
                {category}
              </div>
            </div>
          </div>

          <div className={`text-gray-300 text-sm leading-relaxed font-light transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <p className="mb-4">{description}</p>
            
            {/* Highlights section */}
            {currentStepData.highlights && currentStepData.highlights.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white font-medium mb-2">Key Highlights:</h4>
                <ul className="space-y-2">
                  {currentStepData.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyCard;