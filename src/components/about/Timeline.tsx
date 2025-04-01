export default function Timeline() {
  const experiences = [
    {
      title: "Lead Game Developer",
      company: "Game Studio XYZ",
      period: "2021 - Present",
      description: "Leading development of multiple game projects, managing a team of developers, and implementing core gameplay systems."
    },
    {
      title: "Game Programmer",
      company: "Interactive Media Inc.",
      period: "2018 - 2021",
      description: "Developed game mechanics and systems for mobile and PC games with over 500,000 combined downloads."
    },
    {
      title: "Junior Developer",
      company: "Tech Innovations",
      period: "2016 - 2018",
      description: "Worked on web-based games and interactive experiences using JavaScript and WebGL."
    }
  ];

  const education = [
    {
      degree: "Master's in Game Development",
      institution: "University of Technology",
      period: "2014 - 2016",
      description: "Specialized in game engine architecture and interactive design."
    },
    {
      degree: "Bachelor's in Computer Science",
      institution: "State University",
      period: "2010 - 2014",
      description: "Focused on programming fundamentals, algorithms, and software development."
    }
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold mb-6 text-gray-100">Experience</h2>
      <div className="space-y-8">
        {experiences.map((exp, index) => (
          <div key={index} className="border-l-2 border-gray-700 pl-4 relative">
            <div className="absolute w-3 h-3 bg-gray-600 rounded-full -left-[7px] top-2"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
              <h3 className="text-xl font-medium text-gray-100">{exp.title}</h3>
              <span className="text-sm text-gray-400">{exp.period}</span>
            </div>
            <p className="text-gray-300 mb-1">{exp.company}</p>
            <p className="text-sm text-gray-400">{exp.description}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-6 mt-12 text-gray-100">Education</h2>
      <div className="space-y-8">
        {education.map((edu, index) => (
          <div key={index} className="border-l-2 border-gray-700 pl-4 relative">
            <div className="absolute w-3 h-3 bg-gray-600 rounded-full -left-[7px] top-2"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
              <h3 className="text-xl font-medium text-gray-100">{edu.degree}</h3>
              <span className="text-sm text-gray-400">{edu.period}</span>
            </div>
            <p className="text-gray-300 mb-1">{edu.institution}</p>
            <p className="text-sm text-gray-400">{edu.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
