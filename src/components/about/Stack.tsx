import React from 'react';
import SkillCard from './SkillCard';
import JourneyCard from './JourneyCard';
import EducationCard from './EducationCard';

const Stack = () => {
    const journeySteps = [
        {
          title: 'Completed High School at Lek en Linge',
          category: 'Education',
          date: '06.2021',
          description: 'Graduated from Lek en Linge, gaining proficiency in both Dutch and English, with a strong foundation in critical thinking and creativity.',
        },
        {
          title: 'Started Chef Training at ROC Midden Nederland',
          category: 'Education',
          date: '09.2021-06.2023',
          description: 'Pursued a Chef Training program at ROC Midden Nederland, focusing on culinary skills, menu planning, and kitchen management, while also gaining practical experience in professional kitchens.',
        },
        {
          title: 'Gained Practical Experience at Restaurants',
          category: 'Experience',
          date: '09.2022-06.2023',
          description: 'Accumulated hands-on experience in professional kitchens at Camping Ganspoort, Winkel van Sinkel, and Ruby Rose, applying culinary skills and gaining insights into various kitchen operations and restaurant environments.',
        },
        {
          title: 'Started Creative Software Development Program at GLU',
          category: 'Education',
          date: '08.2023',
          description: 'Enrolled in the Creative Software Development – Game Development profile at Grafisch Lyceum Utrecht, focusing on programming languages like C# and mastering tools such as Unity and Git.',
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
