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
    Introduction: "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-200 border border-blue-400/30",
    Education: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 border border-emerald-400/30",
    Development: "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-200 border border-orange-400/30",
    Experience: "bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-200 border border-purple-400/30",
    Expertise: "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-200 border border-pink-400/30"
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
            ? "text-blue-300 opacity-80 cursor-pointer hover:opacity-100 hover:text-blue-200" 
            : "text-blue-500/30 opacity-50 cursor-not-allowed"
        }`}
        onClick={() => activeStep > 1 && handleStepClick(activeStep - 1)}
      >        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
    
    // Add the progress line and dots
    steps.push(
      <div key="progress-line" className="flex-1 flex items-center relative">
        <div className="h-1 bg-blue-500/20 absolute w-full rounded-full"></div>
        <div
          className="h-1 bg-gradient-to-r from-blue-400 to-purple-400 absolute transition-all duration-300 rounded-full"
          style={{ width: progressWidth }}
        ></div>
        {/* Add the smaller current position indicator */}
        <div
          className="w-5 h-5 rounded-full border border-blue-400 bg-gradient-to-br from-blue-900 to-purple-900 absolute z-20 shadow-sm transition-all duration-300"
          style={{ left: progressWidth, transform: 'translateX(-50%)' }}
        ></div>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={`step-${index}`} 
            className={`w-2.5 h-2.5 rounded-full absolute z-10 cursor-pointer transition-all duration-200 hover:scale-110 ${
              index + 1 <= activeStep ? 'bg-blue-400 shadow-sm shadow-blue-500/30' : 'bg-blue-500/30 hover:bg-blue-400/60'
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
            ? "text-blue-300 opacity-80 cursor-pointer hover:opacity-100 hover:text-blue-200" 
            : "text-blue-500/30 opacity-50 cursor-not-allowed"
        }`}
        onClick={() => activeStep < totalSteps && handleStepClick(activeStep + 1)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 19L16 12L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );

    return steps;
  };

  return (
    <div 
      className="w-full max-w-none sm:max-w-[800px] focus:outline-none mx-auto"
      tabIndex={0}
      onKeyDown={handleKeyNavigation}
      role="region"
      aria-label="Journey timeline"
    >
      <div className="w-full bg-gradient-to-br from-gray-900/60 to-black/80 border border-blue-500/20 rounded-2xl shadow-xl backdrop-blur-sm p-3 sm:p-4 md:p-6 transition-all duration-300 relative overflow-hidden group">
        {/* Enhanced background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center border-b border-blue-500/20 pb-3 sm:pb-4 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text">Journey</h1>
            <div className="text-xs sm:text-sm text-blue-200/70 bg-blue-500/10 px-2 sm:px-3 py-1 rounded-full border border-blue-400/20">
              {activeStep} of {totalSteps}
            </div>
          </div>

          <div className="flex items-center gap-2.5 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide pb-1 pt-2">
            {renderProgressSteps()}
          </div>

          <div className={`border border-blue-400/20 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 shadow-lg transition-all duration-200 backdrop-blur-sm ${isAnimating ? 'opacity-75' : 'opacity-100'}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-3 sm:gap-4">
              <div className={`transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'} flex-1`}>
                <div className="text-blue-100 text-lg sm:text-xl font-bold leading-tight">{title}</div>
                <div className="text-blue-200/70 text-sm font-medium mt-1">{date}</div>
              </div>
              <div className="flex gap-4 items-start">
                <div
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${categoryColors[category] || "bg-blue-500/20 text-blue-200 border border-blue-400/30"} backdrop-blur-sm`}
                >
                  {category}
                </div>
              </div>
            </div>

            <div className={`text-blue-50/90 text-sm sm:text-base leading-relaxed font-normal transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <p className="mb-4">{description}</p>
              
              {/* Highlights section */}
              {currentStepData.highlights && currentStepData.highlights.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-blue-100 font-semibold mb-3 text-sm sm:text-base">Key Highlights:</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {currentStepData.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-400 mt-2 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="text-blue-50/80 text-sm sm:text-base">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyCard;