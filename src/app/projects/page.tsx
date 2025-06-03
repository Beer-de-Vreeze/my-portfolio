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
              { type: 'image', src: "/images/AudioPreviewer 1.webp", alt: "AudioPreviewer" },
              { type: 'image', src: "/images/AudioPreviewer 2.webp", alt: "AudioPreviewer FULL" },
              { type: 'video', src: "/assets/videos/audio-previewer-demo.mp4", alt: "Audio Previewer Demo" }
            ]}

            techStack={["C#", "Unity", "Editor Scripting", "Audio"]} 
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

            codeSnippet={{
              code: `public class AudioPreviewer : EditorWindow
{
    [MenuItem("Window/Audio Previewer")]
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
            
            // Playback controls
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button(isPlaying ? "Pause" : "Play", GUILayout.Width(80)))
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
            
            if (GUILayout.Button("Stop", GUILayout.Width(80)))
            {
                AudioSource.Stop();
                isPlaying = false;
            }
            
            isLooping = GUILayout.Toggle(isLooping, "Loop", GUILayout.Width(80));
            EditorGUILayout.EndHorizontal();
        }
    }
    
    /// <summary>
    /// Generates a texture visualizing the waveform of an audio clip with color gradients.
    /// </summary>
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
    
    /// <summary>
    /// Extracts audio samples from an AudioClip.
    /// </summary>
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
