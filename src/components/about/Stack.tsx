import React from 'react';
import SkillCard from './SkillCard';
import JourneyCard from './JourneyCard';
import EducationCard from './EducationCard';

const Stack = () => {
    const journeySteps = [
        {
          title: 'Completed High School at Lek en Linge',
          category: 'Education' as const,
          date: '06.2021',
          description: 'Graduated from Lek en Linge, gaining proficiency in both Dutch and English, with a strong foundation in critical thinking and creativity.',
        },
        {
          title: 'Started Chef Training at ROC Midden Nederland',
          category: 'Education' as const,
          date: '09.2021-06.2023',
          description: 'Pursued a Chef Training program at ROC Midden Nederland, focusing on culinary skills, menu planning, and kitchen management, while also gaining practical experience in professional kitchens.',
        },
        {
          title: 'Gained Practical Experience at Restaurants',
          category: 'Experience' as const,
          date: '09.2022-06.2023',
          description: 'Accumulated hands-on experience in professional kitchens at Camping Ganspoort, Winkel van Sinkel, and Ruby Rose, applying culinary skills and gaining insights into various kitchen operations and restaurant environments.',
        },
        {
          title: 'Started Creative Software Development Program at GLU',
          category: 'Education' as const,
          date: '08.2023',
          description: 'Enrolled in the Creative Software Development – Game Development profile at Grafisch Lyceum Utrecht, focusing on programming languages like C# and mastering tools such as Unity and Git.',
        },
      ];


  return (
    <div className="flex flex-col space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-6 w-full" style={{ minHeight: 'auto', height: 'auto' }}>
      <div className="animate-stackSlideIn w-full">
        <SkillCard />
      </div>
      <div className="animate-stackSlideIn w-full">
        <EducationCard />
      </div>
      <div className="animate-stackSlideIn w-full">
        <JourneyCard steps={journeySteps} />
      </div>
    </div>
  );
};

export default Stack;
