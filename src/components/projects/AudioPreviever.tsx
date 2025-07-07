import React from "react";
import SuspenseProjectCard from "../projectCard";
import useMobileDetection from "../utils/useMobileDetection";

const AudioPreviever = ({ onModalStateChange }: { onModalStateChange: (isOpen: boolean) => void }) => {
  // Mobile detection hook is included for consistency across components
  // but not currently used since this component doesn't have video content
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isMobile = useMobileDetection();
  
  return (
  <SuspenseProjectCard
    projectId="Unity Audio Previewer"
    title="Unity Audio Previewer"
    description="Working with audio files in Unity can be surprisingly tedious - you often have to rely on external tools just to preview sounds or dig through folders to find the right audio clip. I created this Unity Editor extension to solve that problem by bringing comprehensive audio management directly into the Unity interface. It features real-time waveform visualizations, seamless playback controls, and intelligent project organization, making it much easier for developers and sound designers to work with audio assets without constantly switching between applications."
    coverImage="/images/CoverImageSound.webp"
    downloadLink={{
      url: "/downloads/audio-previewer.zip",
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
        title: "Intuitive Interface & Drag-Drop Controls",
        description:
          "The interface centers around intuitive drag-and-drop functionality with real-time playback controls and responsive layouts. It includes collapsible folder organization and fast search filtering to help manage large audio libraries efficiently. The design focuses on staying out of your way while providing quick access to essential audio management features.",
      },
      {
        title: "Real-Time Waveform Visualization",
        description:
          "Each audio file gets a real-time waveform visualization with smooth amplitude mapping and a three-color gradient system (blue to green to orange) that makes it easy to visually distinguish between different types of sounds. The waveforms are generated using efficient peak detection algorithms and feature soft anti-aliased edges for a clean, professional look that helps you quickly identify audio characteristics.",
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
      },              {
        title: "Native Unity AudioUtil Integration",
        description:
         "Rather than building a separate audio player, this tool taps directly into Unity's internal AudioUtil system using reflection techniques. This provides native audio playback, looping, and seeking capabilities that work consistently across different Unity versions. The reflection-based approach automatically adapts to Unity's API changes, ensuring compatibility as Unity evolves.",
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
        title: "Automated Project Asset Discovery",
        description:
         "The tool automatically scans your entire project using Unity's AssetDatabase to discover all audio clips, detect duplicates, and organize them by folder structure. It includes powerful search and filtering capabilities that let you quickly locate specific sounds - whether you're searching by filename, folder location, or audio characteristics. This eliminates the need to manually hunt through project folders.",
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
    // Sort clips by name
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
        // Add the folder group to the list
        folderGroups.Add(folderGroup);
    }

    folderGroups = folderGroups.OrderBy(g => g.displayName).ToList();
}`,
        },
      },
      {
        title: "Optimized Dual-Layer Caching System",
        description:
         "A dual-layer caching system stores both waveform textures and audio sample data with intelligent memory management to ensure smooth performance even with large audio libraries. The system uses lazy loading for instant previews and persists settings between Unity sessions. This architecture allows the tool to handle hundreds of audio files without performance degradation.",
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
    onModalStateChange={onModalStateChange}
  />
  );
};

export default AudioPreviever;