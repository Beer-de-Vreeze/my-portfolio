'use client'
import { useState, useEffect, Suspense } from "react";
import ProjectCard from "@/components/projectCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Add highlight.js import and style
import 'highlight.js/styles/monokai.css';
// Import custom highlighting styles
import '@/styles/code-highlight.css';

// Loading component for Suspense fallback
const ProjectCardLoading = () => (
  <div className="w-full h-96 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading project...</div>
  </div>
);

// Wrapper component to handle Suspense for ProjectCard
const SuspenseProjectCard = (props: React.ComponentProps<typeof ProjectCard>) => (
  <Suspense fallback={<ProjectCardLoading />}>
    <ProjectCard {...props} />
  </Suspense>
);


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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">          <SuspenseProjectCard 
            projectId="better-tetris"
            title="Better Tetris"
            description="A Unity-based Tetris clone featuring classic gameplay with enhanced visual effects, scoring systems, and modern gaming elements. This project implements a complete Tetris game with Super Rotation System (SRS), wall kicks, and audio feedback."
            githubLink="https://github.com/Beer-de-Vreeze/Better-Tetris"
            media={[
              { type: 'image', src: "/images/better-tetris-1.webp", alt: "Better Tetris Game Screenshot 1" }
            ]}
            techStack={["Unity", "C#", "Game Design", "Tilemap"]}
            features={[
              {
                title: "Complete Tetris Gameplay",
                description: "Features all seven standard tetromino pieces (I, J, L, O, S, T, Z) with accurate rotation systems and physics, including the Super Rotation System (SRS) and wall kicks."
              },
              {
                title: "Advanced Board Mechanics",
                description: "Tilemap-based board implementation with line clearing, piece preview, scoring system, and high score tracking with persistent storage."
              },
              {
                title: "Audio Feedback",
                description: "Complete sound system with audio cues for movement, rotation, landing, and line clears, enhancing the gameplay experience."
              },
              {
                title: "Game States",
                description: "Proper game state management including game over detection, score tracking, and UI integration with TextMeshPro for clean, responsive text elements."
              },
            ]}
            codeSnippet={{
              title: "Tetromino Rotation System with Wall Kicks",
              language: "csharp",
              code: `private void Rotate(int direction)
{
    // Save the current rotation state
    int originalRotation = rotationIndex;
    
    // Apply the rotation
    rotationIndex = Wrap(rotationIndex + direction, 0, 4);
    
    // Apply the rotation matrix to each cell of the tetromino
    ApplyRotationMatrix(direction);
    
    // Test if the rotated position is valid, if not try wall kicks
    if (!TestWallKicks(originalRotation, direction))
    {
        // If all wall kicks fail, revert to the original rotation
        rotationIndex = originalRotation;
        ApplyRotationMatrix(-direction);
    }
    else
    {
        PlayRotateSound();
    }
}

private bool TestWallKicks(int rotationIndex, int rotationDirection)
{
    // Get the appropriate wall kick index for this rotation
    int wallKickIndex = GetWallKickIndex(rotationIndex, rotationDirection);
    
    // Try each possible wall kick offset
    for (int i = 0; i < data.wallKicks.GetLength(1); i++)
    {
        Vector2Int translation = data.wallKicks[wallKickIndex, i];
        
        // If the position is valid with this wall kick, use it
        if (Move(translation))
        {
            return true;
        }
    }
    
    // If no wall kicks worked, return false
    return false;
}`
            }}
            onModalStateChange={handleModalStateChange}
          />          <SuspenseProjectCard 
            projectId="bearly-stealthy"
            title="Bearly Stealthy"
            description="A stealth game where you play as a bear trying to gather food while remaining undetected. Navigate through various environments, use special bear abilities, and avoid detection from rangers and other enemies."
            githubLink="https://github.com/Beer-de-Vreeze/Bearly-Stealthy"
            media={[
              { type: 'image', src: "/images/bearly-stealthy-1.webp", alt: "Bearly Stealthy Game Screenshot 1" },
              { type: 'image', src: "/images/bearly-stealthy-2.webp", alt: "Bearly Stealthy Game Screenshot 2" },
              { type: 'image', src: "/images/bearly-stealthy-3.webp", alt: "Bearly Stealthy Game Screenshot 3" }
            ]}
            techStack={["Unity", "C#", "Game Design"]}
            features={[
              {
                title: "Immersive Stealth Mechanics",
                description: "Play as a bear navigating through environments to collect food while avoiding detection from enemies. Features advanced stealth mechanics based on noise, movement patterns, and line of sight detection."
              },
              {
                title: "Special Bear Abilities",
                description: "Use various bear abilities including Roar (distract enemies), Scent Tracking (find food), Fast Movement (sprint), and silent movement through different terrain types."
              },
              {
                title: "Advanced AI Systems",
                description: "Enemy AI responds to sound and movement with sophisticated patrol behaviors, detection systems, and chase mechanics creating unpredictable challenges and adaptive difficulty."
              },
              {
                title: "Dynamic Environments",
                description: "Explore different environments like forests, campsites, and rivers with day/night cycles and weather effects that impact gameplay and stealth mechanics."
              }
            ]}
            codeSnippet={{
              title: "Enemy Detection System",
              language: "csharp",
              code: `// Advanced enemy AI detection system
public class EnemyDetection : MonoBehaviour
{
    [Header("Detection Settings")]
    [SerializeField] private float sightRange = 10f;
    [SerializeField] private float sightAngle = 60f;
    [SerializeField] private float hearingRange = 15f;
    [SerializeField] private LayerMask detectionLayers;
    [SerializeField] private Transform playerTransform;
    
    [Header("Awareness")]
    [SerializeField] private float awarenessLevel = 0f;
    [SerializeField] private float maxAwareness = 100f;
    [SerializeField] private float awarenessDecayRate = 5f;
    
    private EnemyController controller;
    private AudioSource alertSound;
    
    private void Awake()
    {
        controller = GetComponent<EnemyController>();
        alertSound = GetComponent<AudioSource>();
    }
    
    private void Update()
    {
        // Decay awareness level over time when not detecting player
        if (awarenessLevel > 0 && !IsPlayerVisible() && !IsPlayerAudible())
        {
            awarenessLevel -= awarenessDecayRate * Time.deltaTime;
        }
        
        // Check for player detection
        DetectPlayer();
    }
    
    private void DetectPlayer()
    {
        if (IsPlayerVisible())
        {
            // Increase awareness based on visibility
            float distance = Vector3.Distance(transform.position, playerTransform.position);
            float visibilityFactor = 1f - Mathf.Clamp01(distance / sightRange);
            awarenessLevel += visibilityFactor * 10f * Time.deltaTime;
        }
        
        if (IsPlayerAudible())
        {
            // Increase awareness based on sound level
            awarenessLevel += controller.GetPlayerNoiseLevel() * Time.deltaTime;
        }
        
        // Check if player has been detected
        if (awarenessLevel >= maxAwareness)
        {
            alertSound.Play();
            controller.SetAlertState(true);
        }
    }
}`
            }}
            onModalStateChange={handleModalStateChange}
          /><SuspenseProjectCard 
            projectId="unity-audio-previewer"
            title="Unity Audio Previewer"
              description="A comprehensive Unity Editor extension designed to streamline audio workflow for game developers and sound designers. Features advanced waveform visualization, intuitive playback controls, and seamless asset management capabilities that integrate directly into the Unity development environment."            downloadLink={{
              url: "/assets/downloads/audio-previewer.zip",
              filename: "Unity Audio Previewer v1.2",
              fileSize: "2.4 MB"
            }}
            media={[
              { type: 'image', src: "/images/AudioPreviewer 1.webp", alt: "AudioPreviewer" },
              { type: 'image', src: "/images/AudioPreviewer 2.webp", alt: "AudioPreviewer FULL" },
              { type: 'video', src: "/assets/videos/audio-previewer-demo.mp4", alt: "Audio Previewer Demo" }
            ]}            techStack={["C#", "Unity", "Editor Scripting", "Audio Processing"]} 
features={[
  {
    title: "Advanced Waveform Visualization",
    description: "Real-time audio waveform rendering with color-coded amplitude mapping, providing instant visual feedback for audio analysis and precise sound editing workflows.",
  },
  {
    title: "Integrated Playback Controls",
    description: "Seamless audio playback directly within the Unity Editor, featuring play/pause functionality, scrubbing capabilities, and position tracking for efficient audio review.",
  },
  {
    title: "Smart Loop Management",
    description: "One-click loop toggle functionality with visual indicators, enabling rapid testing of seamless audio transitions and background music loops.",
  },
  {
    title: "Intuitive Asset Management",
    description: "Drag-and-drop interface with automatic file detection and import, streamlining the process of adding audio assets to your project workflow.",
  },
  {
    title: "Organized File Structure",
    description: "Hierarchical folder-based organization system with search functionality, allowing for efficient management of large audio libraries and quick asset retrieval.",
  }
]}            codeSnippet={{
              title: "Audio Waveform Generation System",
              language: "csharp",
              code: `public class AudioPreviewer : EditorWindow
{
    [MenuItem("Window/Audio Tools/Audio Previewer")]
    public static void ShowWindow()
    {
        GetWindow<AudioPreviewer>("Audio Previewer");
    }
    
    private AudioClip currentClip;
    private Texture2D waveformTexture;
    private Vector2 scrollPosition;
    private bool isPlaying = false;
    private bool isLooping = false;
    
    [Serializable]
    private struct WaveformSettings
    {
        public int width;
        public int height;
        public Color colorStart;
        public Color colorMiddle;
        public Color colorEnd;
    }
    
    private WaveformSettings waveformSettings = new WaveformSettings 
    {
        width = 512,
        height = 128,
        colorStart = new Color(0.2f, 0.4f, 0.85f), // Blue
        colorMiddle = new Color(0.3f, 0.85f, 0.3f), // Green
        colorEnd = new Color(0.85f, 0.4f, 0.2f)     // Orange
    };
    
    private void OnGUI()
    {
        GUILayout.Label("Audio Previewer", EditorStyles.boldLabel); 
        EditorGUI.BeginChangeCheck();
        currentClip = (AudioClip)EditorGUILayout.ObjectField("Audio Clip", currentClip, typeof(AudioClip), false);
        if (EditorGUI.EndChangeCheck() && currentClip != null)
        {
            // Generate waveform when audio clip changes
            waveformTexture = GenerateWaveformTexture(currentClip);
        }
        
        if (currentClip != null)
        {
            // Display waveform visualization
            if (waveformTexture != null)
            {
                Rect rect = GUILayoutUtility.GetRect(waveformSettings.width, waveformSettings.height);
                EditorGUI.DrawPreviewTexture(rect, waveformTexture);
            }
            
            // Playback controls        EditorGUILayout.BeginHorizontal();
        if (GUILayout.Button(isPlaying ? "Pause" : "Play", GUILayout.Width(80)))
        {
            TogglePlayback();
        }
        
        if (GUILayout.Button("Stop", GUILayout.Width(80)))
        {
            StopPlayback();
        }
        
        isLooping = GUILayout.Toggle(isLooping, "Loop", GUILayout.Width(80));
        EditorGUILayout.EndHorizontal();
    }
    
    private void TogglePlayback()
    {
        if (isPlaying)
        {
            AudioSource.Stop();
            isPlaying = false;
        }
        else
        {
            AudioSource.PlayClipAtPoint(currentClip, Vector3.zero);
            isPlaying = true;
        }
    }
    
    private void StopPlayback()
    {
        AudioSource.Stop();
        isPlaying = false;
            }
            
            isLooping = GUILayout.Toggle(isLooping, "Loop", GUILayout.Width(80));
            EditorGUILayout.EndHorizontal();
        }
    }
    
    // Generates a texture visualizing the waveform of an audio clip with color gradients.
    private Texture2D GenerateWaveformTexture(AudioClip clip)
    {
        int width = waveformSettings.width;
        int height = waveformSettings.height;

        // Create new texture with dark background
        Texture2D texture = new Texture2D(width, height, TextureFormat.RGBA32, false);
        Color[] clearPixels = new Color[width * height];
        for (int i = 0; i < clearPixels.Length; i++)
        {
            clearPixels[i] = new Color(0.1f, 0.1f, 0.1f, 0.3f);
        }
        texture.SetPixels(clearPixels);

        // Get audio sample data
        float[] samples = GetAudioSamples(clip);
        if (samples == null || samples.Length == 0)
        {
            texture.Apply();
            return texture;
        }

        int channelCount = clip.channels;
        int sampleCount = samples.Length / channelCount;
        float samplesPerPixel = (float)sampleCount / width;

        // Generate waveform visualization
        for (int x = 0; x < width; x++)
        {
            float maxValue = 0f;

            // Find peak amplitude for this pixel column
            int sampleOffset = (int)(x * samplesPerPixel) * channelCount;
            int samplesToCheck = Mathf.Min(
                (int)samplesPerPixel * channelCount,
                samples.Length - sampleOffset
            );

            for (int i = 0; i < samplesToCheck; i += channelCount)
            {
                float sampleValue = Mathf.Abs(samples[sampleOffset + i]);
                if (sampleValue > maxValue)
                {
                    maxValue = sampleValue;
                }
            }

            int waveformHeight = Mathf.RoundToInt(maxValue * height);

            // Create gradient color based on position
            float colorPosition = (float)x / width;
            Color waveformColor;

            if (colorPosition < 0.5f)
            {
                waveformColor = Color.Lerp(
                    waveformSettings.colorStart,  // Blue
                    waveformSettings.colorMiddle, // Green
                    colorPosition * 2f
                );
            }
            else
            {
                waveformColor = Color.Lerp(
                    waveformSettings.colorMiddle, // Green
                    waveformSettings.colorEnd,    // Orange
                    (colorPosition - 0.5f) * 2f
                );
            }

            // Draw amplitude on texture with soft edges
            int midPoint = height / 2;
            int minY = midPoint - waveformHeight / 2;
            int maxY = midPoint + waveformHeight / 2;

            for (int y = 0; y < height; y++)
            {
                if (y >= minY && y <= maxY)
                {
                    float distanceFromMiddle = Mathf.Abs(
                        (y - midPoint) / (float)(waveformHeight / 2)
                    );
                    float alpha = 1f - Mathf.Pow(distanceFromMiddle, 2);
                    Color pixelColor = new Color(
                        waveformColor.r,
                        waveformColor.g,
                        waveformColor.b,
                        alpha
                    );
                    texture.SetPixel(x, y, pixelColor);
                }
            }
        }

        texture.Apply();
        return texture;
    }
    
    // Extracts audio samples from an AudioClip.
    private float[] GetAudioSamples(AudioClip clip)
    {
        if (clip == null)
            return null;
            
        float[] samples = new float[clip.samples * clip.channels];
        clip.GetData(samples, 0);
        return samples;
    }
}`
              ,}
          }
            onModalStateChange={handleModalStateChange}
          />
<SuspenseProjectCard 
  projectId="sketchin-spells"
  media={[{ type: 'image', src: "/images/sketchin-spells.png", alt: "Sketchin' Spells gameplay screenshot" }]}
  title="Sketchin' Spells"
  techStack={["C#", "Unity", "2D Graphics", "Game Design"]} 
  description="An innovative drawing-based RPG adventure that transforms player creativity into magical gameplay mechanics. This academic project explores the intersection of artistic expression and interactive entertainment, featuring a custom drawing recognition system that converts player sketches into usable in-game spells and tools."  codeSnippet={{
    code: `public class SpellSketcher : MonoBehaviour
{
    [Header("Drawing Recognition")]
    public LayerMask drawingLayer;
    public Camera drawingCamera;
    
    // Advanced spell analysis and casting system
    public void ProcessPlayerDrawing(Texture2D playerSketch) 
    {
        SpellType recognizedSpell = AnalyzeDrawingPattern(playerSketch);
        CastSpell(recognizedSpell, CalculateSpellPower(playerSketch));
    }
    
    private SpellType AnalyzeDrawingPattern(Texture2D drawing)
    {
        // Pattern recognition algorithm implementation
        return SpellDatabase.GetSpellFromPattern(drawing);
    }
}`,
    language: "csharp",
    title: "Drawing Recognition & Spell Casting System"
  }}
  liveLink="https://beerv.itch.io/sketchin-spells"
  githubLink="https://github.com/beerv/sketchin-spells" features={[
  {
    title: "Sketch-to-Magic System",
    description: "Proprietary drawing recognition technology that interprets player sketches and translates them into functional spell components with varying effectiveness based on drawing accuracy.",
  },
  {
    title: "Strategic Turn-Based Combat",
    description: "Tactical battle system where hand-drawn spells create unique combat scenarios, encouraging creative problem-solving and strategic thinking.",
  },
  {
    title: "Custom Input Recognition",
    description: "Real-time drawing analysis with pattern matching algorithms that recognize shapes, symbols, and artistic intent to determine spell outcomes.",
  },
  {
    title: "Narrative-Driven Adventure",
    description: "Immersive storytelling experience where creative expression directly influences story progression and character development.",
  },
  {
    title: "Persistent Spell Library",
    description: "Save and categorize custom-drawn spells with a personal grimoire system, building a unique collection of player-created magical abilities.",
  },
  {
    title: "Accessibility-Focused Design",
    description: "Inclusive interface designed to accommodate various artistic skill levels, making creativity accessible to all players regardless of drawing experience.",
  }
]}

  onModalStateChange={handleModalStateChange}          />
<SuspenseProjectCard
            projectId="jerry-ai-evolution"
            media={[
              { type: 'image', src: '/images/Jerry_Move.gif', alt: 'Jerry V1 Movement' },
              { type: 'image', src: '/images/Jerry_MoveWithVision.gif', alt: 'Jerry V2 Raycast Perception' },
              { type: 'image', src: '/images/Jerry_MoveWithFEEDBACKTRAINING2.gif', alt: 'Jerry V3 Feedback Training' },
              { type: 'image', src: '/images/Jerry_MoveWithFEEDBACKV2.gif', alt: 'Jerry V3 Post-Training' },
              { type: 'image', src: '/images/HUNTERVSPREY.gif', alt: 'Hunter vs Prey' },
              { type: 'image', src: '/images/zombie.png', alt: 'Zombie Survival AI' },
            ]}            title="Jerry AI: Machine Learning Evolution"
            techStack={["Python", "C#", "Unity", "PyTorch", "ML-Agents", "Reinforcement Learning"]}
            description="A comprehensive machine learning research project documenting the progressive development of an AI agent through multiple evolutionary stages. This project demonstrates advanced reinforcement learning concepts, from basic locomotion to complex survival scenarios, showcasing the practical application of Unity ML-Agents toolkit in game AI development."            features={[
              { 
                title: 'Phase 1: Basic Locomotion', 
                description: 'Implemented fundamental movement mechanics using Unity Transform components, establishing baseline navigation capabilities on X and Z axes with basic neural network architecture.' 
              },
              { 
                title: 'Phase 2: Environmental Perception', 
                description: 'Integrated raycast-based sensory system enabling spatial awareness and obstacle detection, significantly improving navigation accuracy and environmental interaction.' 
              },
              { 
                title: 'Phase 3: Reinforcement Learning Integration', 
                description: 'Advanced feedback loop implementation with visual success/failure indicators (red/green states) providing real-time learning progress visualization and reward optimization.' 
              },
              { 
                title: 'Phase 4: Competitive Multi-Agent Systems', 
                description: 'Developed complex hunter-prey dynamics with time constraints and resource collection objectives, implementing advanced reward structures and competitive learning algorithms.' 
              },
              { 
                title: 'Advanced Configuration Management', 
                description: 'Custom YAML-based controller scripting system enabling simultaneous multi-agent training scenarios with independent hyperparameter optimization for each agent type.' 
              },
              { 
                title: 'Combat AI Specialization', 
                description: 'Specialized survival AI implementation featuring dynamic threat assessment, weapon handling, and strategic positioning in high-pressure combat scenarios against multiple adversaries.' 
              },
            ]}
            onModalStateChange={handleModalStateChange}          />          <SuspenseProjectCard 
            projectId="portfolio-website"
            media={[{ type: 'image', src: "/images/portfolio-preview.webp", alt: "Portfolio website showcase" }]}
            title="Interactive Portfolio Website"
            techStack={["TypeScript", "Next.js", "Tailwind CSS", "React"]} 
            description="A modern, responsive portfolio website built with cutting-edge web technologies. Features dynamic project showcases, interactive UI components, and optimized performance for seamless user experience across all devices."
            githubLink="https://github.com/beerv/my-gameportfolio"
            liveLink="https://beer-portfolio.vercel.app"            features={[
              {
                title: "Responsive Design Architecture",
                description: "Mobile-first design approach with fluid layouts that adapt seamlessly across desktop, tablet, and mobile devices using modern CSS Grid and Flexbox techniques.",
                codeSnippet: {
                  title: "Responsive Grid Layout System",
                  language: "typescript",
                  code: `// Responsive layout component with Tailwind CSS
const ProjectGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">      {projects.map((project, index) => (
        <SuspenseProjectCard 
          key={index}
          {...project}
          onModalStateChange={handleModalStateChange}
        />
      ))}
    </div>
  );
};

// Adaptive background pattern based on screen size
const [backgroundAttachment, setBackgroundAttachment] = useState("fixed");

useEffect(() => {
  const updateBackground = () => {
    if (window.innerWidth < 768) {
      setBackgroundAttachment("scroll"); // Mobile optimization
    } else {
      setBackgroundAttachment("fixed");  // Desktop parallax effect
    }
  };
  
  updateBackground();
  window.addEventListener('resize', updateBackground);
  return () => window.removeEventListener('resize', updateBackground);
}, []);`
                }
              },
              {
                title: "Interactive Project Showcases",
                description: "Dynamic modal-based project presentations with image carousels, video playback, and syntax-highlighted code snippets for comprehensive project documentation.",
                codeSnippet: {
                  title: "Advanced Modal System with Media Carousel",
                  language: "typescript",
                  code: `// Interactive modal with touch gesture support
const ProjectModal: React.FC<ModalProps> = ({ isOpen, onClose, project }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  // Touch gesture handling for mobile swipe navigation
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swipe left - next media
        setCurrentMediaIndex(prev => 
          (prev + 1) % project.media.length
        );
      } else {
        // Swipe right - previous media
        setCurrentMediaIndex(prev => 
          (prev - 1 + project.media.length) % project.media.length
        );
      }
    }
  };
  
  // Syntax highlighting for code snippets
  useEffect(() => {
    if (isOpen && project.codeSnippet) {
      import('highlight.js').then(hljs => {
        document.querySelectorAll('pre code').forEach(block => {
          hljs.default.highlightElement(block as HTMLElement);
        });
      });
    }
  }, [isOpen, project.codeSnippet, currentMediaIndex]);
  
  return (
    <div className="fixed inset-0 z-50 modal-overlay">
      {/* Modal implementation with animations */}
    </div>
  );
};`
                }
              },
              {
                title: "Performance Optimization",
                description: "Implemented advanced optimization techniques including lazy loading, image optimization, and code splitting for lightning-fast page load times and smooth user interactions.",
                codeSnippet: {
                  title: "Next.js Image Optimization & Lazy Loading",
                  language: "typescript",
                  code: `// Optimized image loading with Next.js
import Image from 'next/image';

const OptimizedProjectCard: React.FC<ProjectProps> = ({ 
  thumbnailImage, 
  title, 
  media 
}) => {
  return (
    <div className="project-card">
      {/* Optimized thumbnail with blur placeholder */}
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <Image 
          src={thumbnailImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform hover:scale-105"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
          priority={false} // Lazy load by default
        />
      </div>
      
      {/* Lazy-loaded media carousel */}
      <div className="media-carousel">
        {media.map((item, index) => (
          <div key={index} className="media-item">
            {item.type === 'image' ? (
              <Image
                src={item.src}
                alt={item.alt || title}
                width={800}
                height={600}
                loading="lazy"
                className="w-full h-auto"
              />
            ) : (
              <video
                src={item.src}
                controls
                preload="metadata" // Only load metadata initially
                className="w-full h-auto"
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Code splitting for better performance
const LazyProjectCard = dynamic(() => import('@/components/ProjectCard'), {
  loading: () => <ProjectCardSkeleton />,
  ssr: false // Client-side rendering for heavy components
});`
                }
              },
              {
                title: "Modern Tech Stack Integration",
                description: "Built with TypeScript for type safety, Next.js for server-side rendering, and Tailwind CSS for utility-first styling, ensuring maintainable and scalable code architecture.",
                codeSnippet: {
                  title: "Type-Safe API Integration & State Management",
                  language: "typescript",
                  code: `// Type-safe project data management
interface Project {
  id: string;
  title: string;
  description: string;
  techStack: Technology[];
  media: MediaItem[];
  features: Feature[];
  links: {
    live?: string;
    github?: string;
    download?: DownloadLink;
  };
}

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
  caption?: string;
}

// Custom hook for project data fetching
const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from an API
        const projectData = await import('@/data/projects.json');
        setProjects(projectData.default);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Project loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  return { projects, loading, error };
};

// Tailwind CSS custom configuration
const tailwindConfig = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideUp': 'slideUp 0.4s ease-out',
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(300px, 1fr))',
      },
      backdropBlur: {
        'xs': '2px',
      }
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ]
};`
                }
              }
            ]}            codeSnippet={{
              title: "Main Portfolio Architecture",
              language: "typescript",
              code: `// Portfolio main page component structure
'use client'
import { useState, useEffect } from "react";
import ProjectCard from "@/components/projectCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import 'highlight.js/styles/monokai.css';
import '@/styles/code-highlight.css';

export default function Projects() {
  const [backgroundAttachment, setBackgroundAttachment] = useState("fixed");
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  // Responsive background optimization
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setBackgroundAttachment("scroll");
      } else {
        setBackgroundAttachment("fixed");
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global modal state management
  const handleModalStateChange = (isOpen: boolean) => {
    setIsAnyModalOpen(isOpen);
    
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-black text-white"
      style={{
        backgroundImage: \`linear-gradient(to right, rgba(9,9,9,0.8) 2px, transparent 1px),
          linear-gradient(to bottom, rgba(9,9,9,0.8) 1px, transparent 1px)\`,
        backgroundSize: "20.5px 21px",
        backgroundAttachment: backgroundAttachment,
      }}
    >
      {/* Conditional navbar rendering based on modal state */}
      <div 
        className={\`fixed top-0 left-0 w-full z-10 transition-all duration-300 ease-in-out \${
          isAnyModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }\`}
      >
        <Navbar />
      </div>

      {/* Main content grid */}
      <main className="relative z-0 flex flex-col items-center flex-grow p-2 pt-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
          {/* Project cards with modal state management */}          {projects.map((project, index) => (
            <SuspenseProjectCard 
              key={project.id}
              {...project}
              onModalStateChange={handleModalStateChange}
            />
          ))}
        </div>
      </main>

      {/* Conditional footer rendering */}
      <div 
        className={\`fixed bottom-0 left-0 w-full z-10 transition-all duration-300 ease-in-out \${
          isAnyModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }\`}
      >
        <Footer />
      </div>
    </div>
  );
}`
            }}
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
