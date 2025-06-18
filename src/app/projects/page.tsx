"use client";
import { useState, useEffect, Suspense } from "react";
import ProjectCard from "@/components/projectCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Add highlight.js import and style
import "highlight.js/styles/monokai.css";
// Import custom highlighting styles
import "@/styles/code-highlight.css";

// Loading component for Suspense fallback
const ProjectCardLoading = () => (
  <div className="w-full h-96 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading project...</div>
  </div>
);

// Wrapper component to handle Suspense for ProjectCard
const SuspenseProjectCard = (
  props: React.ComponentProps<typeof ProjectCard>
) => (
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
          isAnyModalOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Navbar />
      </div>

      <main className="relative z-0 flex flex-col items-center flex-grow p-2 pt-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
          <SuspenseProjectCard
            projectId="Unity Audio Previewer"
            title="Unity Audio Previewer"
            description="A sophisticated Unity Editor extension that revolutionizes audio workflow for game developers and sound designers. Built with advanced waveform visualization algorithms, reflection-based Unity AudioUtil integration, and comprehensive project scanning capabilities. Features intelligent caching systems, drag-and-drop functionality, and real-time audio processing that seamlessly integrates into the Unity development environment."
            downloadLink={{
              url: "/assets/downloads/audio-previewer.zip",
              filename: "Unity Audio Previewer v1.2",
              fileSize: "2.4 MB",
            }}
            media={[
              {
                type: "image",
                src: "/images/AudioPreviewer 1.webp",
                alt: "AudioPreviewer",
              },
              {
                type: "image",
                src: "/images/AudioPreviewer 2.webp",
                alt: "AudioPreviewer FULL",
              },
              {
                type: "video",
                src: "/assets/videos/audio-previewer-demo.mp4",
                alt: "Audio Previewer Demo",
              },
            ]}
            techStack={[
              "Unity",
              "C#",
              "Editor Scripting",
              "Audio Processing",
              "Texture Generation",
            ]}
            features={[
              {
                title: "Advanced Waveform Visualization Engine",
                description:
                  "Real-time audio waveform rendering with sophisticated amplitude mapping and gradient color schemes. Features dynamic texture generation with configurable width/height settings, anti-aliased soft edges, and color interpolation across three-point gradients (blue-green-orange). Implements efficient sample processing with peak detection algorithms and visual amplitude representation.",
                codeSnippet: {
                  title: "Waveform Texture Generation Algorithm",
                  language: "csharp",
                  code: `private Texture2D GenerateWaveformTexture(AudioClip clip)
{
    int width = waveformSettings.width;
    int height = waveformSettings.height;
    Texture2D texture = new Texture2D(width, height, TextureFormat.RGBA32, false);

    // Initialize with dark background
    Color[] clearPixels = new Color[width * height];
    for (int i = 0; i < clearPixels.Length; i++)
    {
        clearPixels[i] = new Color(0.1f, 0.1f, 0.1f, 0.3f);
    }
    texture.SetPixels(clearPixels);

    float[] samples = GetAudioSamples(clip);
    if (samples == null || samples.Length == 0) return texture;

    int channelCount = clip.channels;
    int sampleCount = samples.Length / channelCount;
    float samplesPerPixel = (float)sampleCount / width;

    for (int x = 0; x < width; x++)
    {
        float maxValue = 0f;
        int sampleOffset = (int)(x * samplesPerPixel) * channelCount;
        int samplesToCheck = Mathf.Min((int)samplesPerPixel * channelCount, 
                                     samples.Length - sampleOffset);

        // Find peak amplitude for this pixel column
        for (int i = 0; i < samplesToCheck; i += channelCount)
        {
            float sampleValue = Mathf.Abs(samples[sampleOffset + i]);
            if (sampleValue > maxValue) maxValue = sampleValue;
        }

        // Create three-point gradient color system
        float colorPosition = (float)x / width;
        Color waveformColor = colorPosition < 0.5f
            ? Color.Lerp(waveformSettings.colorStart, waveformSettings.colorMiddle, colorPosition * 2f)
            : Color.Lerp(waveformSettings.colorMiddle, waveformSettings.colorEnd, (colorPosition - 0.5f) * 2f);

        // Render amplitude with soft edge anti-aliasing
        int waveformHeight = Mathf.RoundToInt(maxValue * height);
        int midPoint = height / 2;
        int minY = midPoint - waveformHeight / 2;
        int maxY = midPoint + waveformHeight / 2;

        for (int y = minY; y <= maxY; y++)
        {
            float distanceFromMiddle = Mathf.Abs((y - midPoint) / (float)(waveformHeight / 2));
            float alpha = 1f - Mathf.Pow(distanceFromMiddle, 2);
            texture.SetPixel(x, y, new Color(waveformColor.r, waveformColor.g, waveformColor.b, alpha));
        }
    }

    texture.Apply();
    return texture;
}`,
                },
              },
              {
                title: "Reflection-Based Unity AudioUtil Integration",
                description:
                  "Advanced Unity Editor audio integration using System.Reflection to access internal Unity AudioUtil methods. Features automatic method discovery, parameter adaptation for multiple Unity versions, and fallback mechanisms for cross-version compatibility. Supports PlayPreviewClip, StopAllPreviewClips, SetPreviewClipSamplePosition, and looping controls with robust error handling.",
                codeSnippet: {
                  title: "Cross-Version AudioUtil Reflection System",
                  language: "csharp",
                  code: `private static readonly Type audioUtilType = typeof(AudioImporter).Assembly.GetType("UnityEditor.AudioUtil");

private void PlayClip(AudioClip clip, bool loop)
{
    try
    {
        StopAllClips();
        var method = audioUtilType.GetMethod("PlayPreviewClip", 
            System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.Public);

        if (method == null)
        {
            Debug.LogError("Could not find PlayPreviewClip method");
            return;
        }

        var parameters = method.GetParameters();
        
        // Adaptive parameter handling for different Unity versions
        if (parameters.Length >= 3)
        {
            try
            {
                method.Invoke(null, new object[] { clip, 100, loop });  // Unity 2022+
            }
            catch
            {
                try
                {
                    method.Invoke(null, new object[] { clip, 1.0f, loop });  // Unity 2021
                }
                catch
                {
                    method.Invoke(null, new object[] { clip, loop, 1.0f });  // Unity 2020
                }
            }
        }
        else if (parameters.Length == 2)
        {
            method.Invoke(null, new object[] { clip, loop });  // Legacy versions
        }
    }
    catch (Exception e)
    {
        Debug.LogError($"Error playing audio clip: {e.Message}");
    }
}

private void SeekToTime(AudioClip clip, float timeInSeconds)
{
    try
    {
        var method = audioUtilType.GetMethod("SetPreviewClipSamplePosition", 
            System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.Public);
        
        if (method == null)
        {
            method = audioUtilType.GetMethod("SeekPreviewClip", 
                System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.Public);
        }

        int samplePosition = Mathf.FloorToInt(timeInSeconds * clip.frequency) * clip.channels;
        method.Invoke(null, new object[] { clip, samplePosition });
    }
    catch (Exception e)
    {
        Debug.LogError($"Error seeking audio clip: {e.Message}");
    }
}`,
                },
              },
              {
                title: "Intelligent Project Scanning & Asset Management",
                description:
                  "Comprehensive project-wide audio asset discovery using Unity's AssetDatabase API. Features automatic GUID-based scanning, path resolution, duplicate detection, and intelligent folder organization. Implements advanced filtering systems with case-insensitive search across clip names and folder paths, plus hierarchical folder grouping with visual organization.",
                codeSnippet: {
                  title: "Project Audio Asset Discovery System",
                  language: "csharp",
                  code: `private void ScanProjectForAudioClips()
{
    // Find all audio clip GUIDs in the project
    string[] guids = AssetDatabase.FindAssets("t:AudioClip");

    foreach (string guid in guids)
    {
        string path = AssetDatabase.GUIDToAssetPath(guid);
        AudioClip clip = AssetDatabase.LoadAssetAtPath<AudioClip>(path);

        // Add clip if valid and not already in the list
        if (clip != null && !clipDataList.Any(c => c.clip == clip))
        {
            string folderPath = System.IO.Path.GetDirectoryName(path).Replace('\\\\', '/');

            // Try to find existing saved data for this clip
            ClipData existingData = FindSavedClipData(clip);
            if (existingData != null)
            {
                existingData.folderPath = folderPath;
                clipDataList.Add(existingData);
            }
            else
            {
                clipDataList.Add(new ClipData { 
                    clip = clip, 
                    folderPath = folderPath 
                });
            }
        }
    }

    // Remove any null clips and reorganize by folder
    clipDataList = clipDataList.Where(c => c.clip != null).ToList();
    OrganizeClipsByFolder();
}

private void OrganizeClipsByFolder()
{
    folderGroups.Clear();
    var filteredClips = GetFilteredClips().Where(c => c.clip != null).ToList();
    var clipsByFolder = filteredClips.GroupBy(c => c.folderPath);

    foreach (var group in clipsByFolder)
    {
        string folderPath = group.Key;
        string displayName = !string.IsNullOrEmpty(folderPath) && folderPath.StartsWith("Assets/")
            ? System.IO.Path.GetFileName(folderPath)
            : "No Folder";

        FolderGroup folderGroup = new FolderGroup
        {
            folderPath = folderPath,
            displayName = displayName,
            clips = group.Where(c => c.clip != null).OrderBy(c => c.clip.name).ToList(),
        };
        folderGroups.Add(folderGroup);
    }

    folderGroups = folderGroups.OrderBy(g => g.displayName).ToList();
}`,
                },
              },
              {
                title: "Advanced Caching & Performance Optimization",
                description:
                  "Multi-layered caching system for waveform textures and audio sample data with intelligent memory management. Features Dictionary-based caching for generated waveforms, audio sample preprocessing, and EditorPrefs persistence for user settings and clip configurations. Implements lazy loading patterns and automatic cache invalidation for optimal performance.",
                codeSnippet: {
                  title: "Dual-Layer Caching System",
                  language: "csharp",
                  code: `private Dictionary<AudioClip, Texture2D> waveformCache = new Dictionary<AudioClip, Texture2D>();
private Dictionary<AudioClip, float[]> clipSampleCache = new Dictionary<AudioClip, float[]>();

private Texture2D GetWaveformTexture(AudioClip clip)
{
    // Check waveform cache first
    if (waveformCache.TryGetValue(clip, out Texture2D cachedTexture))
    {
        return cachedTexture;
    }

    // Generate and cache new waveform texture
    Texture2D texture = GenerateWaveformTexture(clip);
    waveformCache[clip] = texture;
    return texture;
}

private float[] GetAudioSamples(AudioClip clip)
{
    // Check sample cache first
    if (clipSampleCache.TryGetValue(clip, out float[] cachedSamples))
    {
        return cachedSamples;
    }

    // Extract and cache audio samples
    float[] samples = new float[clip.samples * clip.channels];
    if (!clip.GetData(samples, 0))
    {
        Debug.LogWarning($"Failed to get audio data for clip: {clip.name}");
        return null;
    }

    clipSampleCache[clip] = samples;
    return samples;
}

// EditorPrefs persistence system
private void SaveClips()
{
    int count = clipDataList.Count;
    EditorPrefs.SetInt(PrefsKeyPrefix + "Count", count);

    for (int i = 0; i < count; i++)
    {
        var data = clipDataList[i];
        if (data.clip != null)
        {
            string path = AssetDatabase.GetAssetPath(data.clip);
            EditorPrefs.SetString(PrefsKeyPrefix + i + "_Path", path);
            EditorPrefs.SetBool(PrefsKeyPrefix + i + "_Loop", data.loop);
            EditorPrefs.SetString(PrefsKeyPrefix + i + "_FolderPath", data.folderPath);
        }
    }
}`,
                },
              },
              {
                title: "Interactive UI & Drag-Drop System",
                description:
                  "Sophisticated Unity Editor GUI implementation with drag-and-drop functionality, progress bars, and interactive controls. Features real-time playback progress tracking, seeking capabilities, visual playback indicators, and comprehensive mouse interaction handling. Includes foldout folder organization, search filtering, and responsive layout scaling.",
              },
            ]}
            codeSnippet={{
              title: "AudioPreviewerWindow - Complete Editor Extension",
              language: "csharp",
              code: `/// <summary>
/// Custom Unity editor window for previewing audio clips in the project.
/// Provides functionality to scan for audio files, organize by folders,
/// play/stop clips, visualize waveforms, and more.
/// </summary>
public class AudioPreviewerWindow : EditorWindow
{
    /// <summary>
    /// Internal class to store data related to each audio clip
    /// including references, playback state, and visualization.
    /// </summary>
    private class ClipData
    {
        public AudioClip clip;              // Reference to the audio clip
        public bool loop;                   // Whether the clip should loop when playing
        public bool isPlaying;              // Current playback state
        public string folderPath;           // Path to folder containing the clip
        public Texture2D waveformTexture;   // Generated waveform visualization
    }

    /// <summary>
    /// Settings for generating waveform visualizations of audio clips.
    /// </summary>
    private class WaveformSettings
    {
        public Color colorStart = new Color(0.2f, 0.6f, 1f, 1f);     // Blue start color
        public Color colorMiddle = new Color(0.4f, 0.9f, 0.4f, 1f);  // Green middle color
        public Color colorEnd = new Color(1f, 0.6f, 0.2f, 1f);       // Orange end color
        public int width = 256;   // Width of the waveform texture
        public int height = 64;   // Height of the waveform texture
    }

    private WaveformSettings waveformSettings = new WaveformSettings();
    private Dictionary<AudioClip, Texture2D> waveformCache = new Dictionary<AudioClip, Texture2D>();
    private Dictionary<AudioClip, float[]> clipSampleCache = new Dictionary<AudioClip, float[]>();

    private List<ClipData> clipDataList = new();         // Main list of all audio clips
    private List<FolderGroup> folderGroups = new();      // Organized groups by folder
    private Vector2 scrollPos;                          // Scroll position for UI
    private string searchFilter = "";                   // Current search term
    private AudioClip currentlyPlayingClip;             // Currently playing clip reference
    private float playbackStartTime;                    // Playback start time for progress
    private bool autoLoadFromProject = true;            // Auto-load setting

    // EditorPrefs keys for persistence
    private const string PrefsKeyPrefix = "AudioPreviewer_";
    private const string PrefsKeyAutoLoadFromProject = PrefsKeyPrefix + "AutoLoadFromProject";

    /// <summary>
    /// Creates and shows the Audio Previewer window.
    /// </summary>
    [MenuItem("Tools/Audio Previewer")]
    public static void ShowWindow()
    {
        GetWindow<AudioPreviewerWindow>("Audio Previewer");
    }

    /// <summary>
    /// Called when the window is enabled. Loads preferences and initializes data.
    /// </summary>
    private void OnEnable()
    {
        // Load user preferences and auto-scan if enabled
        autoLoadFromProject = EditorPrefs.GetBool(PrefsKeyAutoLoadFromProject, true);
        LoadSavedClips();

        if (autoLoadFromProject && clipDataList.Count == 0)
        {
            ScanProjectForAudioClips();
        }
        OrganizeClipsByFolder();
    }

    /// <summary>
    /// Renders the complete editor window GUI with all controls and visualizations.
    /// </summary>
    private void OnGUI()
    {
        // Window title and search functionality
        GUILayout.Label("🎧 Audio Clip Previewer", EditorStyles.boldLabel);
        
        EditorGUILayout.BeginHorizontal();
        GUI.SetNextControlName("SearchField");
        
        string newSearchFilter = EditorGUILayout.TextField("Search:", searchFilter, EditorStyles.toolbarSearchField);
        if (newSearchFilter != searchFilter)
        {
            searchFilter = newSearchFilter;
            OrganizeClipsByFolder();
        }

        // Project scanning and controls
        if (GUILayout.Button("Scan Project", GUILayout.Height(30)))
        {
            ScanProjectForAudioClips();
        }

        // Display organized folder groups with waveforms and controls
        scrollPos = EditorGUILayout.BeginScrollView(scrollPos);
        foreach (var folderGroup in folderGroups)
        {
            if (folderGroup.clips.Count == 0) continue;
            
            // Folder header with expand/collapse
            folderGroup.expanded = EditorGUILayout.Foldout(folderGroup.expanded, 
                $"📁 {folderGroup.displayName}");

            if (folderGroup.expanded)
            {
                foreach (var data in folderGroup.clips)
                {
                    if (data.clip == null) continue;
                    DrawClipEntry(data);  // Draw individual clip with waveform and controls
                }
            }
        }
        EditorGUILayout.EndScrollView();

        // Repaint for real-time playback progress updates
        if (currentlyPlayingClip != null) Repaint();    }
}`,
            }}
            onModalStateChange={handleModalStateChange}
          />{" "}
          <SuspenseProjectCard
            projectId="ML-Agents"
            title="Unity ML-Agents Training Environment's"
            description="An advanced Unity-based machine learning training environment featuring multiple AI scenarios and intelligent agent systems. Built with Unity ML-Agents framework to create sophisticated AI behaviors including zombie survival scenarios, hunter-prey dynamics, and pellet collection challenges. This project demonstrates comprehensive reinforcement learning implementations with reward systems, observation spaces, and neural network training pipelines for accelerating AI development and research."
            githubLink="https://github.com/Beer-de-Vreeze/AI-FOR-VERSNELLEN"
            media={[
              {
                type: "image",
                src: "/images/ai-versnellen-1.webp",
                alt: "AI Training Environment Overview",
              },
              {
                type: "video",
                src: "/assets/videos/ai-training-demo.mp4",
                alt: "AI Training Demo",
              },
            ]}
            techStack={[
              "Unity",
              "Unity ML-Agents",
              "C#",
              "Python",
              "Reinforcement Learning",
              "PyTorch",
              "ONNX",
              "CUDA",
            ]}
            codeSnippet={{
              title: "Complete ML-Agent Architecture - MechAgentController",
              language: "csharp",
              code: `using Unity.MLAgents;
using Unity.MLAgents.Actuators;
using Unity.MLAgents.Sensors;
using UnityEngine;
using System.Collections.Generic;

public class MechAgentController : Agent
{
    [Header("Agent Configuration")]
    [SerializeField] private float _speed = 2f;
    [SerializeField] private float _rotationSpeed = 2f;
    private Rigidbody _rb;
    
    [Header("Reward System")]
    [SerializeField] private float _rewardForHit = 30f;
    [SerializeField] private float _punishmentForMiss = -1f;
    [SerializeField] private float _rewardForClearingAllZombies = 50f;
    [SerializeField] private float _punishment = -15f;
    
    [Header("Combat System")]
    [SerializeField] private GunController _gunController;
    private bool _canShoot, _hitTarget, _hasShot = false;
    private int _timeUntilNextShot = 0;
    [SerializeField] private int _minTimeUntilNextShot = 25;
    
    [Header("Observation Space")]
    [SerializeField] private float _zombieDetectionRadius = 15f;
    [SerializeField] private int _maxZombiesToObserve = 5;
    
    [Header("World Management")]
    [SerializeField] private WorldBehaviors _worldBehaviors;

    public override void Initialize()
    {
        _rb = GetComponent<Rigidbody>();
        _worldBehaviors = FindFirstObjectByType<WorldBehaviors>();
        
        if (_gunController == null)
        {
            _gunController = GetComponentInChildren<GunController>();
            if (_gunController == null)
                Debug.LogError("Gun Controller not found on agent!");
        }
    }

    public override void OnEpisodeBegin()
    {
        // Reset episode state
        _hasShot = false;
        _timeUntilNextShot = 0;
        
        // Initialize environment
        _worldBehaviors.ClearAllZombies();
        _worldBehaviors.StartSpawningZombies();
        _worldBehaviors.SpawnAgent();
    }

    public override void CollectObservations(VectorSensor sensor)
    {
        // Agent state observations (8 values)
        sensor.AddObservation(transform.localPosition);        // 3 values
        sensor.AddObservation(transform.forward);             // 3 values
        sensor.AddObservation(_rb.linearVelocity);            // 3 values
        
        // Combat state observations (2 values)
        sensor.AddObservation(_hasShot);                      // 1 value
        sensor.AddObservation((float)_timeUntilNextShot / _minTimeUntilNextShot); // 1 value
        
        // Dynamic zombie detection and observation
        Collider[] allColliders = Physics.OverlapSphere(transform.position, _zombieDetectionRadius);
        List<Collider> zombieColliders = new List<Collider>();
        
        foreach (Collider collider in allColliders)
        {
            if (collider != null && collider.CompareTag("Zombie"))
                zombieColliders.Add(collider);
        }

        int zombiesToObserve = Mathf.Min(zombieColliders.Count, _maxZombiesToObserve);
        sensor.AddObservation((float)zombiesToObserve / _maxZombiesToObserve); // 1 value

        // Zombie position observations (15 values: 5 zombies * 3 positions each)
        for (int i = 0; i < _maxZombiesToObserve; i++)
        {
            if (i < zombiesToObserve)
            {
                Vector3 relativePos = transform.InverseTransformPoint(
                    zombieColliders[i].transform.position);
                sensor.AddObservation(relativePos / _zombieDetectionRadius);
            }
            else
            {
                sensor.AddObservation(Vector3.zero); // Padding for non-existent zombies
            }
        }
        // Total observations: 8 + 2 + 1 + 15 = 26 values
    }

    public override void OnActionReceived(ActionBuffers actions)
    {
        _canShoot = false;

        // Continuous actions for movement
        float move_rotation = actions.ContinuousActions[0];  // Rotation input [-1, 1]
        float move_forward = actions.ContinuousActions[1];   // Forward movement [-1, 1]
        
        // Discrete action for shooting
        bool shoot = actions.DiscreteActions[0] > 0;         // Shoot button [0, 1]

        // Apply movement
        _rb.MovePosition(
            transform.position + transform.forward * move_forward * _speed * Time.deltaTime
        );
        transform.Rotate(0f, move_rotation * _rotationSpeed, 0f, Space.Self);

        // Handle shooting logic
        if (shoot && !_hasShot)
        {
            _canShoot = true;
        }
        
        if (_canShoot)
        {
            _hitTarget = _gunController.ShootGun();
            _timeUntilNextShot = _minTimeUntilNextShot;
            _hasShot = true;
            
            if (_hitTarget)
            {
                AddReward(_rewardForHit);
                
                // Check for episode completion
                if (AreAllZombiesEliminated())
                {
                    AddReward(_rewardForClearingAllZombies);
                    EndEpisode();
                }
            }
            else
            {
                AddReward(_punishmentForMiss);
            }
        }
    }

    private bool AreAllZombiesEliminated()
    {
        Collider[] allColliders = Physics.OverlapSphere(transform.position, 100f);
        foreach (Collider collider in allColliders)
        {
            if (collider.CompareTag("Zombie"))
                return false;
        }
        return true;
    }

    public override void Heuristic(in ActionBuffers actionsOut)
    {
        // Manual control for testing
        ActionSegment<float> continuousActions = actionsOut.ContinuousActions;
        ActionSegment<int> discreteActions = actionsOut.DiscreteActions;

        continuousActions[0] = Input.GetAxis("Horizontal");
        continuousActions[1] = Input.GetAxis("Vertical");
        discreteActions[0] = Input.GetKey(KeyCode.Space) ? 1 : 0;
    }

    private void OnCollisionEnter(Collision other)
    {
        // Collision penalties
        if (other.gameObject.CompareTag("Wall") || other.gameObject.CompareTag("Zombie"))
        {
            AddReward(_punishment);
            EndEpisode();
        }
    }

    private void FixedUpdate()
    {
        // Update shooting cooldown
        if (_hasShot)
        {
            _timeUntilNextShot--;
            if (_timeUntilNextShot <= 0)
                _hasShot = false;
        }
    }
}`,
            }}
            features={[
              {
                title: "Zombie Survival ML-Agent with Real-Time Detection",
                description:
                  "Advanced mech agent controller that uses Unity ML-Agents to learn survival strategies against zombie hordes. Features sophisticated observation collection with real-time zombie detection within a configurable radius, weapon systems with precise shooting mechanics, and comprehensive reward systems. The agent learns optimal movement patterns, target prioritization, and survival tactics through reinforcement learning episodes.",
                codeSnippet: {
                  title: "MechAgentController - Observation and Action Systems",
                  language: "csharp",
                  code: `public class MechAgentController : Agent
{
    [Header("Agent")]
    [SerializeField] private float _speed = 2f;
    [SerializeField] private float _rotationSpeed = 2f;
    
    [Header("Reward")]
    [SerializeField] private float _rewardForHit = 30f;
    [SerializeField] private float _punishmentForMiss = -1f;
    [SerializeField] private float _rewardForClearingAllZombies = 50f;
    [SerializeField] private float _punishment = -15f;
    
    [Header("Observation")]
    [SerializeField] private float _zombieDetectionRadius = 15f;
    [SerializeField] private int _maxZombiesToObserve = 5;
    
    public override void CollectObservations(VectorSensor sensor)
    {
        // Agent position and rotation
        sensor.AddObservation(transform.localPosition);
        sensor.AddObservation(transform.forward);
        sensor.AddObservation(_rb.linearVelocity);

        // Gun state
        sensor.AddObservation(_hasShot);
        sensor.AddObservation((float)_timeUntilNextShot / _minTimeUntilNextShot);

        // Detect zombies in real-time
        Collider[] allColliders = Physics.OverlapSphere(transform.position, _zombieDetectionRadius);
        List<Collider> zombieColliders = new List<Collider>();
        
        foreach (Collider collider in allColliders)
        {
            if (collider != null && collider.CompareTag("Zombie"))
                zombieColliders.Add(collider);
        }

        int zombiesToObserve = Mathf.Min(zombieColliders.Count, _maxZombiesToObserve);
        sensor.AddObservation((float)zombiesToObserve / _maxZombiesToObserve);

        // Add zombie data - let the agent learn priority
        for (int i = 0; i < _maxZombiesToObserve; i++)
        {
            if (i < zombiesToObserve)
            {
                Vector3 relativePos = transform.InverseTransformPoint(
                    zombieColliders[i].transform.position);
                sensor.AddObservation(relativePos / _zombieDetectionRadius);
            }
            else
            {
                sensor.AddObservation(Vector3.zero); // Padding for non-existent zombies
            }
        }
    }

    public override void OnActionReceived(ActionBuffers actions)
    {
        _canShoot = false;

        float move_rotation = actions.ContinuousActions[0];
        float move_forward = actions.ContinuousActions[1];
        bool shoot = actions.DiscreteActions[0] > 0;

        _rb.MovePosition(
            transform.position + transform.forward * move_forward * _speed * Time.deltaTime
        );
        transform.Rotate(0f, move_rotation * _rotationSpeed, 0f, Space.Self);

        if (shoot && !_hasShot)
        {
            _canShoot = true;
        }
        if (_canShoot)
        {
            _hitTarget = _gunController.ShootGun();
            _timeUntilNextShot = _minTimeUntilNextShot;
            _hasShot = true;
            if (_hitTarget)
            {
                AddReward(_rewardForHit);
                if (AreAllZombiesEliminated())
                {
                    AddReward(_rewardForClearingAllZombies);
                    EndEpisode();
                }
            }
            else
            {
                AddReward(_punishmentForMiss);
            }
        }
    }
}`,
                },
              },
              {
                title: "Hunter-Prey Multi-Agent System",
                description:
                  "Dynamic predator-prey ecosystem featuring two competing AI agents with opposing objectives. The hunter agent learns to track and capture prey while the prey agent develops evasion strategies. Both agents utilize continuous action spaces for movement, collision detection systems, and sophisticated reward mechanisms that create emergent behaviors and adaptive strategies.",
                codeSnippet: {
                  title: "Hunter Agent with Strategic Positioning",
                  language: "csharp",
                  code: `public class HunterController : Agent
{
    [Header("Agent")]
    [SerializeField] float _speed = 4f;
    [SerializeField] float _rotationSpeed = 4f;
    private Rigidbody _stijflichaam;
    
    [Header("Reward")]
    private float _reward = 10f;
    [SerializeField] private float _punishment = -15f;
    [SerializeField] private float _caughtPunishment = 13f;
    
    [Header("Prey")]
    [SerializeField] private GameObject _prey;
    [SerializeField] private AgentController _preyController;

    public override void OnEpisodeBegin()
    {
        // Spawn hunter at safe distance from prey
        Vector3 hunterPosition = new Vector3(Random.Range(-4f, 4f), 0.3f, Random.Range(-4f, 4f));

        bool distanceGood = _preyController.CheckOverlap(
            _prey.transform.localPosition,
            hunterPosition,
            5f
        );

        // Ensure minimum distance for fair gameplay
        while (!distanceGood)
        {
            hunterPosition = new Vector3(Random.Range(-4f, 4f), 0.3f, Random.Range(-4f, 4f));
            distanceGood = _preyController.CheckOverlap(
                _prey.transform.localPosition,
                hunterPosition,
                5f
            );
        }
        transform.localPosition = hunterPosition;
    }

    public override void CollectObservations(VectorSensor sensor)
    {
        sensor.AddObservation(transform.localPosition);
    }

    public override void OnActionReceived(ActionBuffers actions)
    {
        float moveRotate = actions.ContinuousActions[0];
        float moveForward = actions.ContinuousActions[1];

        _stijflichaam.MovePosition(
            transform.position + transform.forward * moveForward * _speed * Time.deltaTime
        );
        transform.Rotate(0f, moveRotate * _rotationSpeed, 0f, Space.Self);
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Agent"))
        {
            AddReward(_reward);
            _material.color = Color.yellow;
            _preyController.AddReward(_caughtPunishment);
            _preyController.EndEpisode();
            EndEpisode();
        }
        if (other.CompareTag("Wall"))
        {
            _material.color = Color.red;
            AddReward(_punishment);
            _preyController.EndEpisode();
            EndEpisode();
        }
    }
}`,
                },
              },
              {
                title:
                  "Intelligent Pellet Collection with Spatial Optimization",
                description:
                  "Multi-objective reinforcement learning environment where agents learn efficient resource collection strategies. Features dynamic pellet spawning with spatial optimization algorithms, overlap detection systems to prevent clustering, and time-based episodic challenges. Agents develop pathfinding strategies, resource prioritization, and optimal collection patterns through trial and error learning.",
                codeSnippet: {
                  title: "Spatial-Aware Pellet Generation System",
                  language: "csharp",
                  code: `public class AgentController : Agent
{
    [Header("Pellet Management")]
    [SerializeField] private GameObject _pellet;
    [SerializeField] private int _pelletCount = 2;
    [SerializeField] private List<GameObject> _pellets;
    
    [Header("Reward Configuration")]
    [SerializeField] private float _reward = 10f;
    [SerializeField] private float _endReward = 5f;
    [SerializeField] private float _punishment = -15f;

    private void CreatePellet()
    {
        distanceList.Clear();
        BaddistanceList.Clear();

        if (_pellets.Count != 0)
        {
            RemovePellet(_pellets);
        }
        for (int i = 0; i < _pelletCount; i++)
        {
            int counter = 0;
            bool distanceGood;
            bool alreadyDecrement = false;

            GameObject pellet = Instantiate(_pellet);
            pellet.transform.parent = _enviromentLocation;

            Vector3 pelletPosition = new Vector3(
                Random.Range(-4f, 4f),
                0.3f,
                Random.Range(-4f, 4f)
            );

            if (_pellets.Count != 0)
            {
                for (int j = 0; j < _pellets.Count; j++)
                {
                    if (counter < 10)
                    {
                        distanceGood = CheckOverlap(
                            pelletPosition,
                            _pellets[j].transform.localPosition,
                            5f
                        );
                        if (distanceGood == false)
                        {
                            pelletPosition = new Vector3(
                                Random.Range(-4f, 4f),
                                0.3f,
                                Random.Range(-4f, 4f)
                            );
                            j--;
                            alreadyDecrement = true;
                        }
                        distanceGood = CheckOverlap(pelletPosition, transform.localPosition, 5f);
                        if (distanceGood == false)
                        {
                            pelletPosition = new Vector3(
                                Random.Range(-4f, 4f),
                                0.3f,
                                Random.Range(-4f, 4f)
                            );
                            if (alreadyDecrement == false)
                            {
                                j--;
                            }
                        }

                        counter++;
                    }
                    else
                    {
                        j = _pellets.Count;
                    }
                }
            }
            pellet.transform.localPosition = pelletPosition;
            _pellets.Add(pellet);
        }
    }

    public bool CheckOverlap(Vector3 objectForOverlap, Vector3 alreadyExistingObject, float minDistance)
    {
        float distance = Vector3.Distance(objectForOverlap, alreadyExistingObject);
        if (distance <= minDistance)
        {
            distanceList.Add(distance);
            return true;
        }
        BaddistanceList.Add(distance);
        return false;
    }
}`,
                },
              },
              {
                title: "NavMesh-Based Zombie AI with Health Systems",
                description:
                  "Advanced enemy AI system utilizing Unity's NavMesh for realistic zombie pathfinding and behavior. Features dynamic target following with configurable update intervals, health systems with visual damage feedback, and performance-optimized movement patterns. Zombies exhibit emergent group behaviors and adaptive pathfinding around obstacles while maintaining realistic movement speeds and collision detection.",
                codeSnippet: {
                  title: "Intelligent Zombie Controller with Health System",
                  language: "csharp",
                  code: `[RequireComponent(typeof(NavMeshAgent))]
public class ZombieController : MonoBehaviour
{
    private NavMeshAgent _agent;
    private Transform _target;

    [SerializeField] private float _updateSpeed = 0.1f;
    [SerializeField] private float _speed = 5f;

    [Header("Health System")]
    [SerializeField] private float _maxHealth = 100f;
    private float _currentHealth;
    [SerializeField] private GameObject _damageEffectPrefab;
    [SerializeField] private GameObject _deathEffectPrefab;
    [SerializeField] private Renderer _zombieRenderer;

    private Coroutine _followRoutine;
    private bool _isActive = true;
    private Material _originalMaterial;
    private Color _originalColor;

    public void Initialize(Transform target)
    {
        _target = target;

        if (_followRoutine != null)
            StopCoroutine(_followRoutine);

        _followRoutine = StartCoroutine(FollowTarget());
    }

    private IEnumerator FollowTarget()
    {
        WaitForSeconds wait = new WaitForSeconds(_updateSpeed);

        while (_isActive && enabled)
        {
            GameObject targetObj = GameObject.FindGameObjectWithTag("Agent");
            if (targetObj != null)
            {
                _target = targetObj.transform;
                _agent.SetDestination(_target.position);
            }
            else
            {
                Debug.LogWarning("ZombieController: No target found with 'Agent' tag");
            }
            yield return wait;
        }
    }

    public void TakeDamage(float damage)
    {
        if (_currentHealth <= 0)
            return;

        _currentHealth -= damage;

        // Visual feedback
        StartCoroutine(FlashDamage());

        if (_currentHealth <= 0)
        {
            Die();
        }
    }

    private IEnumerator FlashDamage()
    {
        if (_zombieRenderer != null && _zombieRenderer.material != null)
        {
            _zombieRenderer.material.color = Color.red;
            yield return new WaitForSeconds(0.1f);
            _zombieRenderer.material.color = _originalColor;
        }

        if (_damageEffectPrefab != null)
        {
            GameObject effect = Instantiate(
                _damageEffectPrefab,
                transform.position + Vector3.up,
                Quaternion.identity
            );
            Destroy(effect, 1f);
        }
    }

    private void Die()
    {
        if (_deathEffectPrefab != null)
        {
            GameObject effect = Instantiate(
                _deathEffectPrefab,
                transform.position,
                Quaternion.identity
            );
            Destroy(effect, 2f);
        }

        SetActive(false);
        Destroy(gameObject, 0.1f);
    }
}`,
                },
              },
              {
                title: "Performance-Optimized World Management System",
                description:
                  "Sophisticated environment controller that manages AI training scenarios with performance optimization and scalable zombie spawning systems. Features batch processing for large-scale simulations, cleanup mechanisms for memory management, and configurable spawn patterns. The system maintains stable frame rates while supporting hundreds of AI entities through intelligent update scheduling and spatial optimization.",
                codeSnippet: {
                  title: "Scalable Zombie Spawning and Management",
                  language: "csharp",
                  code: `public class WorldBehaviors : MonoBehaviour
{
    [Header("Agent Settings")]
    [SerializeField] private MechAgentController _agentController;

    [Header("Zombie Settings")]
    [SerializeField] private ZombieController _zombieController;
    [SerializeField] private int _zombieCount = 50;
    [SerializeField] private float _spawnZombieInterval = 0.5f;
    [SerializeField] private List<ZombieController> _zombies = new List<ZombieController>();

    [Header("Performance")]
    [SerializeField] private int _maxZombiesPerBatch = 5;
    [SerializeField] private float _physicsUpdateInterval = 0.2f;
    [SerializeField] private float _cleanupDistance = 100f;

    public IEnumerator ContinuousZombieSpawning()
    {
        while (_isSpawningZombies)
        {
            if (_zombies.Count < _zombieCount)
            {
                int zombiesToSpawn = Mathf.Min(_maxZombiesPerBatch, _zombieCount - _zombies.Count);
                for (int i = 0; i < zombiesToSpawn; i++)
                {
                    SpawnNewZombie();
                    yield return new WaitForSeconds(0.05f);
                }
            }
            yield return new WaitForSeconds(_spawnZombieInterval);
        }
    }

    private void SpawnNewZombie()
    {
        if (_spawnPoints.Count <= 0)
            return;

        int randomIndex = Random.Range(0, _spawnPoints.Count);
        GameObject spawnPoint = _spawnPoints[randomIndex];
        Vector3 spawnPosition = new Vector3(
            Random.Range(
                spawnPoint.transform.position.x - spawnPoint.transform.localScale.x / 2,
                spawnPoint.transform.position.x + spawnPoint.transform.localScale.x / 2
            ),
            1.5f,
            Random.Range(
                spawnPoint.transform.position.z - spawnPoint.transform.localScale.z / 2,
                spawnPoint.transform.position.z + spawnPoint.transform.localScale.z / 2
            )
        );

        ZombieController zombie = Instantiate(
            _zombieController,
            spawnPosition,
            Quaternion.identity
        );

        if (_agentController != null)
            zombie.Initialize(_agentController.transform);

        _zombies.Add(zombie);
    }

    private IEnumerator ZombieMaintenanceRoutine()
    {
        WaitForSeconds wait = new WaitForSeconds(_physicsUpdateInterval);

        while (true)
        {
            CleanupDeadZombies();
            CleanupDistantZombies();
            yield return wait;
        }
    }

    private void CleanupDistantZombies()
    {
        if (_agentController == null)
            return;

        List<ZombieController> zombiesToRemove = new List<ZombieController>();

        foreach (ZombieController zombie in _zombies)
        {
            if (
                zombie != null
                && Vector3.Distance(_agentController.transform.position, zombie.transform.position)
                    > _cleanupDistance
            )
            {
                zombiesToRemove.Add(zombie);
            }
        }

        if (zombiesToRemove.Count > 0)
        {
            RemoveZombie(zombiesToRemove);
        }
    }
}`,
                },
              },
            ]}
            onModalStateChange={handleModalStateChange}
          />
<SuspenseProjectCard
  projectId="BearlyStealthy"
  title="Bearly Stealthy"
  description="A sophisticated Unity-based stealth game featuring a bear protagonist navigating through shadowy environments. Built with advanced AI systems, dynamic noise detection, and multi-layered stealth mechanics. The game showcases professional-grade enemy behavior patterns, complex state management, and immersive audio-visual feedback systems that create tension-filled gameplay experiences where every movement matters."
  githubLink="https://github.com/Beer-de-Vreeze/Bearly-Stealthy"
  media={[
    {
      type: "image",
      src: "/images/Bearly Stealth Images/Bear.webp",
      alt: "Bear",
    },
    {
      type: "video",
      src: "/images/Bearly Stealth Images/Bearly Stealthjy vid.webm",
      alt: "Bearly Stealthy Vid",
    },
    {
      type: "image",
      src: "/images/Bearly Stealth Images/Enviroment.webp",
      alt: "World",
    },
    {
      type: "image",
      src: "/images/Bearly Stealth Images/MapOverview.webp",
      alt: "Map Outlook",
    },
    {
      type: "image",
      src: "/images/Bearly Stealth Images/Hunter.webp",
      alt: "Hunter",
    },
  ]}
  techStack={["Unity", "C#", "Game Design"]}
            features={[
              {
                title: "Advanced Enemy AI with Multi-State Behavior",
                description: "Sophisticated enemy AI system featuring patrol, wandering, investigating, and chasing states. Enemies utilize NavMesh pathfinding, dynamic waypoint systems, and advanced detection algorithms. Each enemy type (BasePatrolEnemy, BaseWanderingEnemy) has unique behavioral patterns with configurable parameters for vision cones, hearing ranges, and investigation mechanics.",
                codeSnippet: {
                  title: "BaseEnemy Vision Detection System",
                  language: "csharp",
                  code: `private void CheckVision()
{
    if (CanSee)
    {
        Vector3 directionToPlayer = (Player.transform.position - transform.position).normalized;
        float angleToPlayer = Vector3.Angle(transform.forward, directionToPlayer);

        if (angleToPlayer < VisionAngle / 2 
            && Vector3.Distance(transform.position, Player.transform.position) <= VisionDistance)
        {
            RaycastHit hit;
            if (Physics.Raycast(transform.position, directionToPlayer, out hit, VisionDistance))
            {
                if (hit.collider.GetComponent<Player>() != null)
                {
                    if (!IsPlayerSpotted)
                    {
                        StartCoroutine(OnPlayerSpotted());
                        Debug.Log("Player spotted by " + gameObject.name);
                    }
                    LastPlayerVisibleTime = Time.time;
                    return;
                }
            }
        }
        
        // Handle visibility timeout and state transitions
        if (IsPlayerSpotted && _currentState == EnemyState.Chasing)
        {
            if (Time.time - LastPlayerVisibleTime > PlayerVisibilityTimeout)
            {
                LosePlayerVisibility();
            }
        }
    }
}`,
                },
              },
              {
                title: "Dynamic Noise Generation & Sound Propagation",
                description:
                  "Comprehensive noise system where player actions generate different noise levels (stealth: 2.0, walking: 5.0, running: 10.0, roaring: 100.0). The NoiseManager singleton handles sound propagation to all registered enemies, triggering investigation behaviors when noise exceeds hearing thresholds. Features noise decay over time and distance-based attenuation.",
                codeSnippet: {
                  title: "Player Noise Generation System",
                  language: "csharp",
                  code: `private void GenerateNoise()
{
    if (_movementDirection.magnitude > 0)
    {
        if (InputManager.Instance.PlayerInput.Player.Sprint.ReadValue<float>() > 0)
        {
            _noiseLevel = _runNoiseLevel;      // 10.0f
        }
        else if (InputManager.Instance.PlayerInput.Player.Stealth.ReadValue<float>() > 0)
        {
            _noiseLevel = _stealthNoiseLevel;  // 2.0f
        }
        else
        {
            _noiseLevel = _walkNoiseLevel;     // 5.0f
        }
        NoiseManager.Instance.GenerateNoise(transform.position, _noiseLevel);
    }
    else
    {
        _noiseLevel = 0f;
    }

    // Noise level decay over time
    if (_noiseLevel > 0)
    {
        _noiseLevel = Mathf.Max(0, _noiseLevel - Time.deltaTime * 5f);
    }
}`,
                },
              },
              {
                title: "Intelligent Patrol & Wandering Systems",
                description:
                  "Modular enemy movement systems with BasePatrolEnemy featuring configurable patrol routes with loop/back-and-forth patterns, and BaseWanderingEnemy using confined area exploration. Both systems integrate seamlessly with investigation and chase behaviors, utilizing Unity's NavMesh for obstacle avoidance and realistic pathfinding through complex 3D environments.",
                codeSnippet: {
                  title: "Patrol Pattern Implementation",
                  language: "csharp",
                  code: `private void PatrolBackAndForth()
{
    if (!Agent.pathPending && Agent.remainingDistance < 0.2f)
    {
        if (_currentPointIndex == 0)
        {
            _isReversing = false;
        }
        else if (_currentPointIndex == _patrolPoints.Length - 1)
        {
            _isReversing = true;
        }

        _currentPointIndex = _isReversing ? _currentPointIndex - 1 : _currentPointIndex + 1;
        Agent.SetDestination(_patrolPoints[_currentPointIndex].position);
        _waitCounter = _waitTime;
    }
}

private void PatrolLoopMethod()
{
    if (!Agent.pathPending && Agent.remainingDistance < 0.2f)
    {
        _currentPointIndex = (_currentPointIndex + 1) % _patrolPoints.Length;
        Agent.SetDestination(_patrolPoints[_currentPointIndex].position);
        _waitCounter = _waitTime;
    }
}`,
                },
              },
              {
                title: "Interactive Object System & Bear Abilities",
                description:
                  "Complete player interaction framework supporting object pickup, throwing for distraction, and special bear abilities. Features the iconic Bear Roar ability that generates massive noise (100.0 units) for enemy distraction, stealth movement modes, and physics-based object manipulation. All controlled through Unity's new Input System with multi-platform support.",
                codeSnippet: {
                  title: "Bear Roar Distraction System",
                  language: "csharp",
                  code: `private void BearRoar()
{
    GenerateNoise(100f);  // Maximum noise level for distraction
    _audioSource.PlayOneShot(_bearRoarSound);
}

private void SetUp()
{
    InputManager.Instance.PlayerInput.Player.Roar.performed += ctx => BearRoar();
}

private void HandleObjectInteraction()
{
    if (InputManager.Instance.PlayerInput.Player.Interact.triggered)
    {
        if (_isHoldingObject)
        {
            DropObject();
        }
        else
        {
            TryPickupObject();
        }
    }

    if (_isHoldingObject && InputManager.Instance.PlayerInput.Player.Throw.triggered)
    {
        ThrowObject();
    }
}`,
                },
              },
              {
                title: "Sophisticated Investigation Mechanics",
                description:
                  "Multi-layered investigation system where enemies react to disturbances with realistic behavior patterns. When enemies hear sounds, they transition to investigation state, move to the noise source, perform 360-degree searches, and gradually return to patrol patterns. Features configurable investigation timers, sound decay, and intelligent state transitions.",
                codeSnippet: {
                  title: "Enemy Sound Investigation Coroutine",
                  language: "csharp",
                  code: `protected virtual IEnumerator OnSoundHeard(Vector3 soundPosition)
{
    Debug.Log("Sound heard! " + gameObject.name);
    Agent.SetDestination(soundPosition);

    // Wait until we're close to the investigation point
    while (Vector3.Distance(transform.position, soundPosition) > 0.5f && _isInvestigating)
    {
        if (_currentState == EnemyState.Chasing && Player != null)
        {
            break; // Exit if we've switched to chasing
        }
        yield return null;
    }

    // Look around once we reach the point
    if (_isInvestigating && _currentState == EnemyState.Investigating)
    {
        float originalRotation = transform.eulerAngles.y;
        float timer = 0;
        while (timer < 2.0f && _isInvestigating)
        {
            transform.rotation = Quaternion.Euler(0, 
                originalRotation + Mathf.Sin(timer * 3.14f) * 90f, 0);
            timer += Time.deltaTime;
            yield return null;
        }
        transform.rotation = Quaternion.Euler(0, originalRotation, 0);    }
}`,
                },
              },
              {
                title: "Dynamic State Machine Architecture",
                description:
                  "Robust finite state machine implementation managing enemy behaviors across four primary states: Patrolling, Investigating, Chasing, and Wandering. Each state has specific entry/exit conditions, update logic, and transition rules. Features state persistence, debug visualization, and seamless state switching with proper cleanup and initialization.",
                codeSnippet: {
                  title: "Enemy State Management System",
                  language: "csharp",
                  code: `protected enum EnemyState
{
    Patrolling,
    Investigating, 
    Chasing,
    Wandering
}

protected virtual void Update()
{
    // State-specific behavior and transitions
    switch (_currentState)
    {
        case EnemyState.Patrolling:
            // Regular patrol behavior
            break;
        case EnemyState.Investigating:
            Agent.SetDestination(_lastHeardPosition);
            _investigationTimeRemaining -= Time.deltaTime;
            if (_investigationTimeRemaining <= 0)
            {
                _isInvestigating = false;
                _currentState = EnemyState.Patrolling;
            }
            break;
        case EnemyState.Chasing:
            if (Time.time - LastPlayerVisibleTime > PlayerVisibilityTimeout)
            {
                LosePlayerVisibility();
            }
            break;
        case EnemyState.Wandering:
            // Wandering is handled by coroutine system
            break;
    }
      CheckVision();
    CheckHearing();
}`,
                },
              },
              {
                title: "Advanced Physics-Based Movement System",
                description:
                  "Comprehensive player movement system utilizing Unity's Rigidbody physics for realistic bear locomotion. Features variable speed states (stealth, walk, sprint), smooth directional transitions, animation state synchronization, and terrain-adaptive movement. Integrates seamlessly with the noise generation system and input handling.",
                codeSnippet: {
                  title: "Player Movement & Animation System",
                  language: "csharp",
                  code: `private void MovePlayer()
{
    Vector3 movement = new Vector3(_movementDirection.x, 0, _movementDirection.z);
    
    if (movement.magnitude > 0.1f)
    {
        float currentSpeed = _walkSpeed;
        bool isRunning = false;
        bool isStealth = false;
        
        if (InputManager.Instance.PlayerInput.Player.Sprint.ReadValue<float>() > 0)
        {
            currentSpeed = _runSpeed;
            isRunning = true;
        }
        else if (InputManager.Instance.PlayerInput.Player.Stealth.ReadValue<float>() > 0)
        {
            currentSpeed = _stealthSpeed;
            isStealth = true;
        }
        
        // Apply movement with physics
        Vector3 targetVelocity = movement * currentSpeed;
        targetVelocity.y = _rb.velocity.y; // Preserve vertical velocity
        _rb.velocity = targetVelocity;
        
        // Smooth rotation towards movement direction
        Quaternion targetRotation = Quaternion.LookRotation(movement);
        transform.rotation = Quaternion.Slerp(transform.rotation, 
            targetRotation, _turnSpeed * Time.fixedDeltaTime);
            
        // Update animation states        SetAnimationState(isRunning, !isRunning && !isStealth, 
            _isMovingBackwards, false, false);
    }
}`,
                },
              },
            ]}
            codeSnippet={{
              title: "BaseEnemy - Complete AI Controller",
              language: "csharp",
              code: `[RequireComponent(typeof(NavMeshAgent)), RequireComponent(typeof(Rigidbody))]
public class BaseEnemy : MonoBehaviour
{
    [Tab("Movement")] 
    [SerializeField] protected float Speed = 2f;
    protected NavMeshAgent Agent;
    protected Player Player;
    
    [Tab("Vision")]
    [SerializeField] protected bool CanSee = true;
    [SerializeField] protected float VisionDistance = 10f;
    [SerializeField] protected float VisionAngle = 45f;
    [SerializeField] protected float PlayerVisibilityTimeout = 3f;
    
    [Tab("Hearing")]
    [SerializeField] protected bool CanHear = true;
    [SerializeField] protected float HearingDistance = 8f;
    [SerializeField] private float _hearingThreshold = 3f;
    
    [Tab("Investigation")]
    [SerializeField] protected float _investigationTime = 10f;
    [SerializeField, ReadOnly] private bool _isInvestigating = false;
    [SerializeField, ReadOnly] private Vector3 _lastHeardPosition;
    
    protected enum EnemyState { Patrolling, Investigating, Chasing, Wandering }
    [SerializeField, ReadOnly] protected EnemyState _currentState = EnemyState.Patrolling;
    
    protected virtual void Start()
    {
        Agent = GetComponent<NavMeshAgent>();
        Agent.speed = Speed;
        Player = FindFirstObjectByType<Player>();
        
        // Register with noise management system
        if (NoiseManager.Instance != null)
            NoiseManager.Instance.RegisterEnemy(this);
    }
    
    protected virtual void Update()
    {
        // Multi-state behavior management
        switch (_currentState)
        {
            case EnemyState.Chasing:
                if (Time.time - LastPlayerVisibleTime > PlayerVisibilityTimeout)
                    LosePlayerVisibility();
                break;
            case EnemyState.Investigating:
                Agent.SetDestination(_lastHeardPosition);
                _investigationTimeRemaining -= Time.deltaTime;
                if (_investigationTimeRemaining <= 0)
                {
                    _isInvestigating = false;
                    _currentState = EnemyState.Patrolling;
                }
                break;
        }
        
        CheckVision();
        CheckHearing();
    }
    
    public void OnNoiseHeard(Vector3 noisePosition, float noiseLevel)
    {
        if (CanHear && noiseLevel >= _hearingThreshold)
        {
            float distance = Vector3.Distance(transform.position, noisePosition);
            if (distance <= HearingDistance)
            {
                _lastHeardPosition = noisePosition;
                _isInvestigating = true;
                _investigationTimeRemaining = _investigationTime;
                _currentState = EnemyState.Investigating;
                StartCoroutine(OnSoundHeard(noisePosition));
            }
        }
    }
    
    private void CheckVision()
    {
        if (!CanSee || Player == null) return;
        
        Vector3 directionToPlayer = (Player.transform.position - transform.position).normalized;
        float angleToPlayer = Vector3.Angle(transform.forward, directionToPlayer);
        float distanceToPlayer = Vector3.Distance(transform.position, Player.transform.position);
        
        if (angleToPlayer < VisionAngle / 2 && distanceToPlayer <= VisionDistance)
        {
            if (Physics.Raycast(transform.position, directionToPlayer, out RaycastHit hit, VisionDistance))
            {
                if (hit.collider.GetComponent<Player>() != null)
                {
                    if (!IsPlayerSpotted)
                        StartCoroutine(OnPlayerSpotted());
                    LastPlayerVisibleTime = Time.time;
                }
            }
        }
    }
    
    protected virtual IEnumerator OnPlayerSpotted()
    {
        IsPlayerSpotted = true;
        _currentState = EnemyState.Chasing;
        
        while (_currentState == EnemyState.Chasing && Player != null)
        {
            Agent.SetDestination(Player.transform.position);
            yield return new WaitForSeconds(0.1f);
        }
    }
}`,
            }}
            onModalStateChange={handleModalStateChange}
          />{" "}
          <SuspenseProjectCard
            projectId="portfolio-website"
            media={[
              {
                type: "image",
                src: "/images/portfolio-preview.webp",
                alt: "Portfolio website showcase",
              },
            ]}
            title="Interactive Portfolio Website"
            techStack={["Next.js", "TypeScript", "React", "Tailwind CSS","Vercel"]}
            description="A modern, responsive portfolio website built with cutting-edge web technologies. Features dynamic project showcases, interactive UI components, and optimized performance for seamless user experience across all devices."
            githubLink="https://github.com/beerv/my-gameportfolio"
            liveLink="https://beer-portfolio.vercel.app"
            features={[
              {
                title: "Responsive Design Architecture",
                description:
                  "Mobile-first design approach with fluid layouts that adapt seamlessly across desktop, tablet, and mobile devices using modern CSS Grid and Flexbox techniques.",
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
}, []);`,
                },
              },
              {
                title: "Interactive Project Showcases",
                description:
                  "Dynamic modal-based project presentations with image carousels, video playback, and syntax-highlighted code snippets for comprehensive project documentation.",
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
};`,
                },
              },
              {
                title: "Performance Optimization",
                description:
                  "Implemented advanced optimization techniques including lazy loading, image optimization, and code splitting for lightning-fast page load times and smooth user interactions.",
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
});`,
                },
              },
              {
                title: "Modern Tech Stack Integration",
                description:
                  "Built with TypeScript for type safety, Next.js for server-side rendering, and Tailwind CSS for utility-first styling, ensuring maintainable and scalable code architecture.",
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
};`,
                },
              },
            ]}
            codeSnippet={{
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
}`,
            }}
            onModalStateChange={handleModalStateChange}
          />
          <SuspenseProjectCard
            projectId="sketchin-spells"
            media={[
              {
                type: "image",
                src: "/images/sketchin-spells.png",
                alt: "Sketchin' Spells drawing tool interface",
              },
            ]}
            title="Sketchin' Spells - Drawing Tool System"
            techStack={["Unity", "C#", "Real-time Drawing", "UI Systems"]}
            description="A sophisticated real-time drawing tool system built in Unity, featuring advanced canvas manipulation, multi-touch input handling, and dynamic symmetry modes. This technical implementation demonstrates complex UI interaction patterns, efficient pixel-level operations, and real-time texture generation for creative digital art applications."
            codeSnippet={{
              code: `public class Sketcher : MonoBehaviour
{
    [Header("Drawing Configuration")]
    public Camera drawingCamera;
    public LineRenderer lineRenderer;
    public float brushSize = 0.1f;
    public Color brushColor = Color.black;
    
    private Texture2D canvasTexture;
    private bool isDrawing = false;
    private Vector2 lastDrawPosition;
    
    void Update()
    {
        HandleTouchInput();
        if (isDrawing) ContinuousDrawing();
    }
    
    private void HandleTouchInput()
    {
        if (Input.GetMouseButtonDown(0))
        {
            StartDrawing(GetWorldDrawPosition());
        }
        else if (Input.GetMouseButtonUp(0))
        {
            StopDrawing();
        }
    }
    
    private void StartDrawing(Vector2 position)
    {
        isDrawing = true;
        lastDrawPosition = position;
        DrawPoint(position);
    }
    
    private void DrawPoint(Vector2 worldPos)
    {
        Vector2 pixelPos = WorldToPixelCoords(worldPos);
        DrawCircleOnTexture(pixelPos, brushSize, brushColor);
        canvasTexture.Apply();
    }
}`,
              language: "csharp",
              title: "Core Drawing Tool Implementation",
            }}
            liveLink="https://beerv.itch.io/sketchin-spells"
            githubLink="https://github.com/Beer-de-Vreeze/Sketchin-Spells"
            features={[
              {
                title: "Multi-Touch Canvas System",
                description:
                  "Advanced touch input processing with support for multiple simultaneous touch points, pressure sensitivity, and gesture recognition. Features optimized coordinate transformation between world space and pixel space for precise drawing operations.",
                codeSnippet: {
                  title: "Touch Input Handler",
                  language: "csharp",
                  code: `private void HandleTouchInput()
{
    for (int i = 0; i < Input.touchCount; i++)
    {
        Touch touch = Input.GetTouch(i);
        Vector2 touchWorldPos = drawingCamera.ScreenToWorldPoint(touch.position);
        
        switch (touch.phase)
        {
            case TouchPhase.Began:
                StartDrawing(touchWorldPos, i);
                break;
            case TouchPhase.Moved:
                if (activeTouches.ContainsKey(i))
                {
                    ContinueDrawing(touchWorldPos, i);
                }
                break;
            case TouchPhase.Ended:
                EndDrawing(i);
                break;
        }
    }
}`,
                },
              },
              {
                title: "Dynamic Symmetry Engine",
                description:
                  "Real-time symmetry system supporting horizontal, vertical, and radial symmetry modes. Uses matrix transformations and reflection algorithms to mirror drawing operations across multiple axes simultaneously, creating complex symmetric patterns.",
                codeSnippet: {
                  title: "Symmetry Drawing Logic",
                  language: "csharp",
                  code: `private void ApplySymmetryDrawing(Vector2 originalPos)
{
    List<Vector2> symmetryPoints = new List<Vector2> { originalPos };
    
    if (horizontalSymmetry)
    {
        symmetryPoints.Add(new Vector2(-originalPos.x, originalPos.y));
    }
    
    if (verticalSymmetry)
    {
        symmetryPoints.Add(new Vector2(originalPos.x, -originalPos.y));
    }
    
    if (radialSymmetry)
    {
        for (int i = 1; i < radialSymmetryCount; i++)
        {
            float angle = (360f / radialSymmetryCount) * i;
            Vector2 rotatedPoint = RotatePoint(originalPos, angle);
            symmetryPoints.Add(rotatedPoint);
        }
    }
    
    foreach (Vector2 point in symmetryPoints)
    {
        DrawPoint(point);
    }
}`,
                },
              },
              {
                title: "Advanced Erasing System",
                description:
                  "Intelligent erasing functionality with multiple erase modes including point erasing, area erasing, and selective color erasing. Features undo/redo operations with efficient memory management and state preservation for complex drawing sessions.",
                codeSnippet: {
                  title: "Smart Erasing Implementation",
                  language: "csharp",
                  code: `public void EraseAtPosition(Vector2 worldPos, float eraseRadius)
{
    Vector2 pixelPos = WorldToPixelCoords(worldPos);
    int eraseSizeInPixels = Mathf.RoundToInt(eraseRadius * pixelsPerUnit);
    
    for (int x = -eraseSizeInPixels; x <= eraseSizeInPixels; x++)
    {
        for (int y = -eraseSizeInPixels; y <= eraseSizeInPixels; y++)
        {
            if (x * x + y * y <= eraseSizeInPixels * eraseSizeInPixels)
            {
                int pixelX = Mathf.RoundToInt(pixelPos.x) + x;
                int pixelY = Mathf.RoundToInt(pixelPos.y) + y;
                
                if (IsWithinCanvasBounds(pixelX, pixelY))
                {
                    canvasTexture.SetPixel(pixelX, pixelY, Color.clear);
                }
            }
        }
    }
    canvasTexture.Apply();
}`,
                },
              },
              {
                title: "Efficient Line Rendering",
                description:
                  "Optimized line drawing algorithm using Bresenham's line algorithm for smooth, anti-aliased lines between touch points. Implements efficient pixel manipulation with minimal texture updates and smooth interpolation for fluid drawing experience.",
                codeSnippet: {
                  title: "Smooth Line Drawing",
                  language: "csharp",
                  code: `private void DrawLine(Vector2 from, Vector2 to)
{
    Vector2 fromPixel = WorldToPixelCoords(from);
    Vector2 toPixel = WorldToPixelCoords(to);
    
    float distance = Vector2.Distance(fromPixel, toPixel);
    int steps = Mathf.RoundToInt(distance / 0.5f);
    
    for (int i = 0; i <= steps; i++)
    {
        float t = i / (float)steps;
        Vector2 currentPixel = Vector2.Lerp(fromPixel, toPixel, t);
        
        DrawCircleOnTexture(currentPixel, brushSize, brushColor);
    }
    
    canvasTexture.Apply();
}`,
                },
              },
              {
                title: "Canvas State Management",
                description:
                  "Comprehensive canvas state system with save/load functionality, layer management, and persistent storage. Features PNG export with transparency, canvas clearing operations, and memory-efficient texture management for large drawing surfaces.",
                codeSnippet: {
                  title: "Canvas Save System",
                  language: "csharp",
                  code: `public void SaveCanvasAsImage(string fileName)
{
    byte[] pngData = canvasTexture.EncodeToPNG();
    string filePath = Path.Combine(Application.persistentDataPath, fileName + ".png");
    
    try
    {
        File.WriteAllBytes(filePath, pngData);
        Debug.Log($"Canvas saved successfully to: {filePath}");
        ShowNotification("Drawing saved!", NotificationType.Success);
    }
    catch (System.Exception e)
    {
        Debug.LogError($"Failed to save canvas: {e.Message}");
        ShowNotification("Save failed!", NotificationType.Error);
    }
}`,
                },
              },
              {
                title: "Performance-Optimized Rendering",
                description:
                  "High-performance texture manipulation system using Unity's native texture operations and GPU-accelerated rendering. Features batched pixel operations, efficient memory allocation, and optimized update cycles for smooth real-time drawing on mobile devices.",
                codeSnippet: {
                  title: "Optimized Texture Operations",
                  language: "csharp",
                  code: `private void DrawCircleOnTexture(Vector2 center, float radius, Color color)
{
    int radiusInPixels = Mathf.RoundToInt(radius * pixelsPerUnit);
    int minX = Mathf.Max(0, Mathf.RoundToInt(center.x - radiusInPixels));
    int maxX = Mathf.Min(canvasTexture.width - 1, Mathf.RoundToInt(center.x + radiusInPixels));
    int minY = Mathf.Max(0, Mathf.RoundToInt(center.y - radiusInPixels));
    int maxY = Mathf.Min(canvasTexture.height - 1, Mathf.RoundToInt(center.y + radiusInPixels));
    
    Color[] pixelArray = new Color[(maxX - minX + 1) * (maxY - minY + 1)];
    int index = 0;
    
    for (int y = minY; y <= maxY; y++)
    {
        for (int x = minX; x <= maxX; x++)
        {
            float distance = Vector2.Distance(new Vector2(x, y), center);
            if (distance <= radiusInPixels)
            {
                float alpha = 1f - (distance / radiusInPixels);
                Color blendedColor = Color.Lerp(canvasTexture.GetPixel(x, y), color, alpha);
                pixelArray[index] = blendedColor;
            }
            else
            {
                pixelArray[index] = canvasTexture.GetPixel(x, y);
            }
            index++;
        }
    }
      canvasTexture.SetPixels(minX, minY, maxX - minX + 1, maxY - minY + 1, pixelArray);
}`,
                },
              },
            ]}
            onModalStateChange={handleModalStateChange}
          />
          
          <SuspenseProjectCard
            projectId="BetterTetris"
            title="Better Tetris"
            description="A meticulously crafted Unity-based Tetris implementation that brings authentic arcade-quality gameplay to modern platforms. This professional-grade recreation features the industry-standard Super Rotation System (SRS), comprehensive audio feedback, ghost piece visualization, and a sophisticated scoring system. Built with clean architecture principles using Unity's advanced systems including Tilemaps for efficient rendering, ScriptableObjects for data management, and modular component design for maintainability."
            githubLink="https://github.com/Beer-de-Vreeze/Better-Tetris"
            media={[
              {
                type: "image",
                src: "/images/better-tetris-1.webp",
                alt: "Better Tetris Game Screenshot 1",
              },
            ]}
            techStack={["Unity", "C#", "Tilemap","Game Design"]}
            features={[
              {
                title: "Super Rotation System (SRS) Implementation",
                description:
                  "Complete implementation of the industry-standard Super Rotation System with authentic wall kick algorithms for all seven tetromino pieces. Features precise rotation mechanics, collision detection, and the complex wall kick patterns that define professional Tetris gameplay.",
                codeSnippet: {
                  title: "Advanced Rotation with Wall Kick System",
                  language: "csharp",
                  code: `private void Rotate(int direction)
{
    // Store the current rotation in case the rotation fails
    int originalRotation = rotationIndex;
    
    // Rotate all cells using a rotation matrix
    rotationIndex = Wrap(rotationIndex + direction, 0, 4);
    ApplyRotationMatrix(direction);
    
    // Revert the rotation if the wall kick tests fail
    if (!TestWallKicks(rotationIndex, direction))
    {
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
    int wallKickIndex = GetWallKickIndex(rotationIndex, rotationDirection);
    
    // Try each possible wall kick offset for this piece type
    for (int i = 0; i < data.wallKicks.GetLength(1); i++)
    {
        Vector2Int translation = data.wallKicks[wallKickIndex, i];
        
        if (Move(translation)) {
            return true; // Wall kick successful
        }
    }
    
    return false; // No valid wall kick found
}

private void ApplyRotationMatrix(int direction)
{
    float[] matrix = Data.RotationMatrix;
    
    // Rotate all cells using the rotation matrix
    for (int i = 0; i < cells.Length; i++)
    {
        Vector3 cell = cells[i];
        int x, y;
        
        switch (data.tetromino)
        {
            case Tetromino.I:
            case Tetromino.O:
                // I and O pieces rotate from offset center point
                cell.x -= 0.5f;
                cell.y -= 0.5f;
                x = Mathf.CeilToInt((cell.x * matrix[0] * direction) + (cell.y * matrix[1] * direction));
                y = Mathf.CeilToInt((cell.x * matrix[2] * direction) + (cell.y * matrix[3] * direction));
                break;
            default:
                // Standard rotation for other pieces
                x = Mathf.RoundToInt((cell.x * matrix[0] * direction) + (cell.y * matrix[1] * direction));
                y = Mathf.RoundToInt((cell.x * matrix[2] * direction) + (cell.y * matrix[3] * direction));
                break;
        }
        cells[i] = new Vector3Int(x, y, 0);
    }
}`,
                },
              },
              {
                title: "Efficient Tilemap-Based Board System",
                description:
                  "High-performance game board implementation using Unity's Tilemap system for optimal rendering and memory usage. Features intelligent line clearing algorithms, precise collision detection, and efficient piece validation that scales seamlessly with gameplay intensity.",
                codeSnippet: {
                  title: "Optimized Line Clearing Algorithm",
                  language: "csharp",
                  code: `public void ClearLines()
{
    RectInt bounds = Bounds;
    int row = bounds.yMin;
    
    // Clear lines from bottom to top
    while (row < bounds.yMax)
    {
        // Only advance to next row if current row is not cleared
        // because tiles above will fall down when a row is cleared
        if (IsLineFull(row))
        {
            LineClear(row);
        }
        else
        {
            row++;
        }
    }
}

public bool IsLineFull(int row)
{
    RectInt bounds = Bounds;
    
    // Check every column in the row
    for (int col = bounds.xMin; col < bounds.xMax; col++)
    {
        Vector3Int position = new Vector3Int(col, row, 0);
        
        // If any tile is missing, line is not full
        if (!tilemap.HasTile(position))
        {
            return false;
        }
    }
    
    return true;
}

public void LineClear(int row)
{
    RectInt bounds = Bounds;
    int linesCleared = 0;
    
    // Clear all tiles in the row
    for (int col = bounds.xMin; col < bounds.xMax; col++)
    {
        Vector3Int position = new Vector3Int(col, row, 0);
        tilemap.SetTile(position, null);
    }
    
    linesCleared++;
    
    // Shift every row above down one position
    while (row < bounds.yMax)
    {
        for (int col = bounds.xMin; col < bounds.xMax; col++)
        {
            Vector3Int position = new Vector3Int(col, row + 1, 0);
            TileBase above = tilemap.GetTile(position);
            
            position = new Vector3Int(col, row, 0);
            tilemap.SetTile(position, above);
        }
        row++;
    }
    
    // Update score and play audio feedback
    if (linesCleared > 0)
    {
        AddScore(linesCleared);
        playLineClearSound();
        UpdateUI();
    }
}`,
                },
              },
              {
                title: "Real-Time Ghost Piece Preview",
                description:
                  "Sophisticated ghost piece system that provides instant visual feedback showing where the current piece will land. Uses optimized drop simulation algorithms and transparent rendering to enhance player decision-making without impacting performance.",
                codeSnippet: {
                  title: "Ghost Piece Drop Simulation",
                  language: "csharp",
                  code: `public class Ghost : MonoBehaviour
{
    public Tile tile;
    public Board mainBoard;
    public Piece trackingPiece;
    
    public Tilemap tilemap { get; private set; }
    public Vector3Int[] cells { get; private set; }
    public Vector3Int position { get; private set; }
    
    private void Awake()
    {
        tilemap = GetComponentInChildren<Tilemap>();
        cells = new Vector3Int[4];
    }
    
    private void LateUpdate()
    {
        Clear();
        if (trackingPiece != null)
        {
            Copy();
            Drop();
            Set();
        }
    }
    
    private void Clear()
    {
        // Clear previous ghost piece position
        for (int i = 0; i < cells.Length; i++)
        {
            Vector3Int tilePosition = cells[i] + position;
            tilemap.SetTile(tilePosition, null);
        }
    }
    
    private void Copy()
    {
        // Copy the current piece's cell configuration
        for (int i = 0; i < cells.Length; i++) {
            cells[i] = trackingPiece.cells[i];
        }
    }
    
    private void Drop()
    {
        Vector3Int position = trackingPiece.position;
        int current = position.y;
        int bottom = -mainBoard.boardSize.y / 2 - 1;
        
        // Temporarily clear the active piece for accurate collision detection
        mainBoard.Clear(trackingPiece);
        
        // Simulate dropping the piece to find landing position
        for (int row = current; row >= bottom; row--)
        {
            position.y = row;
            
            if (mainBoard.IsValidPosition(trackingPiece, position)) {
                this.position = position;
            } else {
                break; // Hit obstacle, stop dropping
            }
        }
        
        // Restore the active piece to the board
        mainBoard.Set(trackingPiece);
    }
    
    private void Set()
    {
        // Render the ghost piece at the calculated position
        for (int i = 0; i < cells.Length; i++)
        {
            Vector3Int tilePosition = cells[i] + position;
            tilemap.SetTile(tilePosition, tile);
        }
    }
}`,
                },
              },
              {
                title: "Comprehensive Scoring & Progression System",
                description:
                  "Advanced scoring system with authentic Tetris point values and multipliers. Features persistent high score tracking, real-time UI updates, and escalating rewards that encourage strategic line clearing combinations for maximum points.",
                codeSnippet: {
                  title: "Multi-Level Scoring Algorithm",
                  language: "csharp",
                  code: `public void AddScore(int linesCleared)
{
    switch (linesCleared)
    {
        case 1:
            totalScore += scorePerLine;        // Single: 100 pts
            break;
        case 2:
            totalScore += scorePerLine * 3;    // Double: 300 pts (3x multiplier)
            break;
        case 3:
            totalScore += scorePerLine * 5;    // Triple: 500 pts (5x multiplier)
            break;
        case 4:
            totalScore += scorePerLine * 8;    // Tetris: 800 pts (8x multiplier!)
            break;
    }
}

private void Lock()
{
    board.Set(this);
    PlayLandSound();
    
    // Award points for successful piece placement
    board.totalScore += scoreLock;
    board.UpdateUI();
    board.ClearLines();
    board.SpawnPiece();
}

public void UpdateUI()
{
    hud_score.text = "Score\\n" + totalScore.ToString();
    UpdateHighScore();
    hud_highScore.text = "HighScore\\n" + highScore.ToString();
}

private void UpdateHighScore()
{
    if (totalScore > highScore)
    {
        highScore = totalScore;
        // Persist high score across game sessions
        PlayerPrefs.SetInt("highScore", highScore);
    }
}

public void GameOver()
{
    // Save final score for game over screen
    PlayerPrefs.SetInt("lastScore", totalScore);
    PlayerPrefs.SetInt("highScore", highScore);
    SceneManager.LoadScene("GameOver");
}`,
                },
              },
              {
                title: "Comprehensive Input & Movement System",
                description:
                  "Responsive input handling with customizable controls supporting both keyboard and potential gamepad input. Features smooth movement with proper delays, hard drop mechanics, soft drop acceleration, and intuitive piece manipulation controls.",
                codeSnippet: {
                  title: "Advanced Input Processing System",
                  language: "csharp",
                  code: `private void Update()
{
    board.Clear(this);
    
    // Lock timer prevents premature piece locking
    lockTime += Time.deltaTime;
    
    // Handle rotation inputs
    if (Input.GetKeyDown(KeyCode.X)) {
        Rotate(-1); // Rotate counterclockwise
    } else if (Input.GetKeyDown(KeyCode.Z) || Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.W)) {
        Rotate(1);  // Rotate clockwise
    }
    
    // Handle hard drop (instant drop to bottom)
    if (Input.GetKeyDown(KeyCode.Space)) {
        HardDrop();
    }
    
    // Handle piece hold functionality
    if (Input.GetKeyDown(KeyCode.LeftShift)) {
        board.HoldPiece();
    }
    
    // Continuous movement with proper timing
    if (Time.time > moveTime) {
        HandleMoveInputs();
    }
    
    // Automatic downward movement (gravity)
    if (Time.time > stepTime) {
        Step();
    }
    
    board.Set(this);
}

private void HandleMoveInputs()
{
    // Soft drop - faster downward movement
    if (Input.GetKey(KeyCode.DownArrow) || Input.GetKey(KeyCode.S)) {
        if (Move(Vector2Int.down)) {
            // Update step time to prevent double movement
            stepTime = Time.time + stepDelay;
        }
    }
    
    // Horizontal movement with repeat handling
    if (Input.GetKey(KeyCode.LeftArrow) || Input.GetKey(KeyCode.A)) {
        Move(Vector2Int.left);
    } else if (Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D)) {
        Move(Vector2Int.right);
    }
}

private void HardDrop()
{
    // Drop piece instantly to the bottom
    while (Move(Vector2Int.down, true)) {
        continue;
    }
    Lock(); // Immediately lock the piece
}

private bool Move(Vector2Int translation, bool isHardDrop = false)
{
    Vector3Int newPosition = position;
    newPosition.x += translation.x;
    newPosition.y += translation.y;
    
    bool valid = board.IsValidPosition(this, newPosition);
    
    if (valid) {
        position = newPosition;
        moveTime = Time.time + moveDelay;
        lockTime = 0f; // Reset lock timer on successful move
        
        if (!isHardDrop) {
            PlayMoveSound();
        }
    }
    
    return valid;
}`,
                },
              },
              {
                title: "Data-Driven Tetromino Architecture",
                description:
                  "Elegant data structure system using static dictionaries and mathematical rotation matrices to define all seven tetromino types. Implements authentic piece shapes, rotation behaviors, and wall kick patterns through clean, maintainable code architecture.",
                codeSnippet: {
                  title: "Tetromino Data & Rotation Mathematics",
                  language: "csharp",
                  code: `public static class Data
{
    // Mathematical constants for 90-degree rotation matrix
    public static readonly float cos = Mathf.Cos(Mathf.PI / 2f);
    public static readonly float sin = Mathf.Sin(Mathf.PI / 2f);
    public static readonly float[] RotationMatrix = new float[] { cos, sin, -sin, cos };
    
    // Define all seven tetromino shapes with their cell positions
    public static readonly Dictionary<Tetromino, Vector2Int[]> Cells = 
        new Dictionary<Tetromino, Vector2Int[]>()
    {
        { Tetromino.I, new Vector2Int[] { 
            new Vector2Int(-1, 1), new Vector2Int( 0, 1), 
            new Vector2Int( 1, 1), new Vector2Int( 2, 1) } },
        { Tetromino.J, new Vector2Int[] { 
            new Vector2Int(-1, 1), new Vector2Int(-1, 0), 
            new Vector2Int( 0, 0), new Vector2Int( 1, 0) } },
        { Tetromino.L, new Vector2Int[] { 
            new Vector2Int( 1, 1), new Vector2Int(-1, 0), 
            new Vector2Int( 0, 0), new Vector2Int( 1, 0) } },
        { Tetromino.O, new Vector2Int[] { 
            new Vector2Int( 0, 1), new Vector2Int( 1, 1), 
            new Vector2Int( 0, 0), new Vector2Int( 1, 0) } },
        { Tetromino.S, new Vector2Int[] { 
            new Vector2Int( 0, 1), new Vector2Int( 1, 1), 
            new Vector2Int(-1, 0), new Vector2Int( 0, 0) } },
        { Tetromino.T, new Vector2Int[] { 
            new Vector2Int( 0, 1), new Vector2Int(-1, 0), 
            new Vector2Int( 0, 0), new Vector2Int( 1, 0) } },
        { Tetromino.Z, new Vector2Int[] { 
            new Vector2Int(-1, 1), new Vector2Int( 0, 1), 
            new Vector2Int( 0, 0), new Vector2Int( 1, 0) } },
    };
    
    // Wall kick data for Super Rotation System (SRS)
    // Different patterns for I-piece vs other pieces
    private static readonly Vector2Int[,] WallKicksI = new Vector2Int[,] {
        { new Vector2Int(0, 0), new Vector2Int(-2, 0), new Vector2Int( 1, 0), new Vector2Int(-2,-1), new Vector2Int( 1, 2) },
        { new Vector2Int(0, 0), new Vector2Int( 2, 0), new Vector2Int(-1, 0), new Vector2Int( 2, 1), new Vector2Int(-1,-2) },
        { new Vector2Int(0, 0), new Vector2Int(-1, 0), new Vector2Int( 2, 0), new Vector2Int(-1, 2), new Vector2Int( 2,-1) },
        { new Vector2Int(0, 0), new Vector2Int( 1, 0), new Vector2Int(-2, 0), new Vector2Int( 1,-2), new Vector2Int(-2, 1) },
    };
    
    private static readonly Vector2Int[,] WallKicksJLOSTZ = new Vector2Int[,] {
        { new Vector2Int(0, 0), new Vector2Int(-1, 0), new Vector2Int(-1, 1), new Vector2Int(0,-2), new Vector2Int(-1,-2) },
        { new Vector2Int(0, 0), new Vector2Int( 1, 0), new Vector2Int( 1,-1), new Vector2Int(0, 2), new Vector2Int( 1, 2) },
        { new Vector2Int(0, 0), new Vector2Int( 1, 0), new Vector2Int( 1, 1), new Vector2Int(0,-2), new Vector2Int( 1,-2) },
        { new Vector2Int(0, 0), new Vector2Int(-1, 0), new Vector2Int(-1,-1), new Vector2Int(0, 2), new Vector2Int(-1, 2) },
    };
    
    public static readonly Dictionary<Tetromino, Vector2Int[,]> WallKicks = 
        new Dictionary<Tetromino, Vector2Int[,]>()
    {
        { Tetromino.I, WallKicksI },
        { Tetromino.J, WallKicksJLOSTZ },
        { Tetromino.L, WallKicksJLOSTZ },
        { Tetromino.O, WallKicksJLOSTZ },
        { Tetromino.S, WallKicksJLOSTZ },
        { Tetromino.T, WallKicksJLOSTZ },
        { Tetromino.Z, WallKicksJLOSTZ },
    };
}

[System.Serializable]
public struct TetrominoData
{
    public Tile tile;
    public Tetromino tetromino;
    public Vector2Int[] cells { get; private set; }
    public Vector2Int[,] wallKicks { get; private set; }
    
    public void Initialize()
    {
        cells = Data.Cells[tetromino];
        wallKicks = Data.WallKicks[tetromino];
    }
}`,
                },
              },
            ]}
            codeSnippet={{
              title: "Complete Game Architecture Overview",
              language: "csharp",
              code: `// Main Board class - orchestrates the entire game
public class Board : MonoBehaviour
{
    [Header("Game Configuration")]
    public TetrominoData[] tetrominoes;
    public Vector2Int boardSize = new Vector2Int(10, 20);
    public Vector3Int spawnPosition = new Vector3Int(-1, 8, 0);
    
    [Header("Scoring")]
    public int totalScore = 0;
    public int highScore;
    public int scorePerLine = 100;
    
    [Header("Audio")]
    public AudioClip rowDeleteSound;
    
    [Header("UI References")]
    public TextMeshProUGUI hud_score;
    public TextMeshProUGUI hud_highScore;
    
    // Core game components
    public Tilemap tilemap { get; private set; }
    public Piece activePiece { get; private set; }
    private GameObject previewTetromino;
    private TetrominoData previewPiece;
    private TetrominoData nextTetrominoData;
    
    public RectInt Bounds
    {
        get
        {
            Vector2Int position = new Vector2Int(-boardSize.x / 2, -boardSize.y / 2);
            return new RectInt(position, boardSize);
        }
    }
    
    private void Awake()
    {
        tilemap = GetComponentInChildren<Tilemap>();
        activePiece = GetComponentInChildren<Piece>();
        audioSource = GetComponent<AudioSource>();
        
        // Initialize high score from saved data
        highScore = PlayerPrefs.GetInt("highScore");
        
        // Initialize all tetromino data
        for (int i = 0; i < tetrominoes.Length; i++)
        {
            tetrominoes[i].Initialize();
        }
    }
    
    private void Start()
    {
        UpdateUI();
        GenerateNextPiece();
        SpawnPiece();
    }
    
    public void SpawnPiece()
    {
        SetNextPiece();
        PreviewPiece();
        activePiece.Initialize(this, spawnPosition, nextTetrominoData);
        
        if (IsValidPosition(activePiece, spawnPosition))
        {
            Set(activePiece);
        }
        else
        {
            GameOver(); // No space for new piece - game over
        }
    }
    
    public bool IsValidPosition(Piece piece, Vector3Int position)
    {
        RectInt bounds = Bounds;
        
        // Check if every cell of the piece is in a valid position
        for (int i = 0; i < piece.cells.Length; i++)
        {
            Vector3Int tilePosition = piece.cells[i] + position;
            
            // Check bounds
            if (!bounds.Contains((Vector2Int)tilePosition))
            {
                return false;
            }
            
            // Check for existing tiles
            if (tilemap.HasTile(tilePosition))
            {
                return false;
            }
        }
          return true;
    }
}`,
            }}
            onModalStateChange={handleModalStateChange}
          />
        </div>
      </main>

      <div
        className={`fixed bottom-0 left-0 w-full z-10 transition-all duration-300 ease-in-out ${
          isAnyModalOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Footer />
      </div>
    </div>
  );
}
