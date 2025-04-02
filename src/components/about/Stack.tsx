import React from 'react';
import SkillCard from './SkillCard';
import JourneyCard from './JourneyCard';
import EducationCard from './EducationCard';

const Stack = () => {
  const journeySteps = [
    {
      title: 'Introduction',
      category: 'Introduction',
      date: '01.2020',
      description: 'Started my journey into the tech world.',
    },
    {
      title: 'Education',
      category: 'Education',
      date: '06.2021',
      description: 'Completed my first coding bootcamp.',
    },
    {
      title: 'Development',
      category: 'Development',
      date: '12.2022',
      description: 'Built my first full-stack application.',
    },
  ];

  return (
    <div className="flex flex-col space-y-8">
      <SkillCard />
      <EducationCard />
      <JourneyCard steps={journeySteps} />
    </div>
  );
};

export default Stack;
