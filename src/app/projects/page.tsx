'use client'
import { useState, useEffect } from "react";
import ProjectCard from "@/components/projectCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Add highlight.js import and style
import 'highlight.js/styles/monokai.css';
// Import custom highlighting styles
import '@/styles/code-highlight.css';


export default function Projects() {
  const [backgroundAttachment, setBackgroundAttachment] = useState("fixed");
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setBackgroundAttachment("scroll");
    }
  }, []);

  // Handle modal state changes from the ProjectCard component
  const handleModalStateChange = (isOpen: boolean) => {
    setIsAnyModalOpen(isOpen);
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-black text-white"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(9,9,9,0.8) 2px, transparent 1px),
          linear-gradient(to bottom, rgba(9,9,9,0.8) 1px, transparent 1px)
        `,
        backgroundSize: "20.5px 21px",
        backgroundAttachment: backgroundAttachment,
      }}
    >
      <div 
        className={`fixed top-0 left-0 w-full z-10 transition-all duration-300 ease-in-out ${
          isAnyModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <Navbar />
      </div>

      <main className="relative z-0 flex flex-col items-center flex-grow p-2 pt-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
          <ProjectCard 
            title="Audio Previewer"
              description="A powerful Unity Editor tool for previewing and managing AudioClips with waveform visualization, real-time playback control, loop toggles, volume adjustment, drag-and-drop, and folder-based organization. Built for sound designers and developers to speed up audio workflows directly in the Unity Editor."
            downloadLink={{
              url: "/assets/downloads/audio-previewer.zip",
              filename: "Audio Previewer",
              fileSize: "2.4 MB"
            }}
            media={[
              { type: 'image', src: "/images/cat.jpg", alt: "Project thumbnail 1" },
              { type: 'image', src: "/images/cat.jpg", alt: "Project thumbnail 2" },
              { type: 'video', src: "/videos/cat.mp4", alt: "Project thumbnail 3" },
              { type: 'image', src: "/images/cat.jpg", alt: "Project thumbnail 4" },
              { type: 'image', src: "/images/cat.jpg", alt: "Project thumbnail 5" },
              { type: 'image', src: "/images/nyan-cat.avif", alt: "Project thumbnail 6"},
            ]}

            techStack={["C#", "Unity", "Blender"]} 
features={[
  {
    title: "Waveform Visualization",
    description: "Visualize audio waveforms in real-time for better understanding of sound dynamics.",
  },
  {
    title: "Real-time Playback Control",
    description: "Play, pause, and scrub through audio clips directly in the Unity Editor.",
  },
  {
    title: "Loop Toggle",
    description: "Easily toggle looping for audio clips to test seamless transitions.",
  },
  {
    title: "Drag-and-Drop Functionality",
    description: "Quickly add audio files to the previewer with simple drag-and-drop.",
  },
  {
    title: "Folder-based Organization",
    description: "Organize your audio files into folders for easy access and management.",
  }
]}
            contributors={[
            { name: "John Doe", role: "Developer" },
            { name: "Jane Doe", role: "Designer" },
            { name: "John Doe", role: "Artist" },
            { name: "Jane Doe", role: "Audio" },
            { name: "John Doe", role: "Other" },
            ]}

            codeSnippet={{
              code: `public class AudioPreviewer : EditorWindow
{
    [MenuItem("Window/Audio Previewer")]
    public static void ShowWindow()
    {
        GetWindow<AudioPreviewer>("Audio Previewer");
    }
    private AudioClip currentClip;
    private void OnGUI()
    {
        GUILayout.Label("Audio Previewer", EditorStyles.boldLabel); 
        currentClip = (AudioClip)EditorGUILayout.ObjectField("Audio Clip", currentClip, typeof(AudioClip), false);
        if (currentClip != null)
        {
            if (GUILayout.Button("Play"))
            {
                AudioSource.PlayClipAtPoint(currentClip, Vector3.zero);
            }
            if (GUILayout.Button("Stop"))
            {
                AudioSource.Stop();
            }
            if (GUILayout.Button("Loop"))
            {
                // Implement loop functionality
            }
        }
    }
}`
              ,}
          }
            onModalStateChange={handleModalStateChange}
          />
<ProjectCard 
  media={[{ type: 'image', src: "/images/sketchin-spells.png", alt: "Sketchin' Spells gameplay screenshot" }]}
  title="Sketchin' Spells DEMO" 
  techStack={["C#", "Unity", "2D"]} 
  description="A magical drawing-based adventure game where your imagination is your weapon! Created for a school project, Sketchin' Spells lets players draw spells, weapons, and tools to defeat a dark sorcerer and save the world. Designed to spark creativity and let players interact with hand-drawn magic in turn-based battles."
  codeSnippet={{
    code: `public class SpellSketcher : MonoBehaviour
{
    // Capture player drawings and convert them into usable magic spells
    public void CastSpell(Texture2D drawing) {
        // Analyze sketch and summon its power!
    }
}`,
    language: "csharp",
    title: "Drawing-Based Spell System"
  }}
  liveLink="https://beerv.itch.io/sketchin-spells"
  githubLink="https://github.com/beerv/sketchin-spells"
  contributors={[
    { name: "Beer de Vreeze", role: "Developer" },
  ]}
 features={[
  {
    title: "Draw-to-Cast System",
    description: "Sketch your own spells and tools directly in-game to influence combat.",
  },
  {
    title: "Creative Turn-Based Combat",
    description: "Strategically outplay enemies using your custom-drawn weapons and magical effects.",
  },
  {
    title: "Dynamic Drawing Input",
    description: "Use a custom drawing system to create unique spells and items.",
  },
  {
    title: "Story-Driven Adventure",
    description: "Join a magical journey to defeat the Dark Lord, with sketch-powered solutions to narrative challenges.",
  },
  {
    title: "Save & Reuse Drawings",
    description: "Store and reuse your favorite creations across battles and game sessions.",
  },
  {
    title: "Designed for Creativity",
    description: "Built to celebrate artistic freedom, whether you're a casual doodler or a detail-loving artist.",
  }
]}

  onModalStateChange={handleModalStateChange}
/>


          <ProjectCard 
            media={[{ type: 'image', src: "/images/cat.jpg", alt: "Project thumbnail" }]}
            title="Project Title" 
            techStack={["C#", "Unity"]} 
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget."
            liveLink="https://google.com"
            githubLink="https://github.com"
            contributors={[
              { name: "John Doe", role: "Developer" },
              { name: "Jane Doe", role: "Designer" },
              { name: "John Doe", role: "Artist" },
              { name: "Jane Doe", role: "Audio" },
              { name: "John Doe", role: "Other" },
            ]}
            onModalStateChange={handleModalStateChange}
          />
        </div>
      </main>

      <div 
        className={`fixed bottom-0 left-0 w-full z-10 transition-all duration-300 ease-in-out ${
          isAnyModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <Footer />
      </div>
    </div>
  );
}
