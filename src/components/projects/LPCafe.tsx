import React from "react";
import SuspenseProjectCard from "../SuspenseProjectCard";

const LPCafe = ({ onModalStateChange }: { onModalStateChange: (isOpen: boolean) => void }) => (
  <SuspenseProjectCard
    projectId="LP-Cafe"
    title="LP-Cafe"
    description={`LP-Cafe is a visual novel/dating sim built in Unity that features a custom dialogue system and branching storylines. The game includes multiple romance options with unique character personalities and storylines, all supported by a sophisticated dialogue engine I built from scratch. I handled the complete audio production pipeline, including voice acting for Beer the catboy character, sound effects, and audio editing.\n\nThe project showcases advanced Unity editor tools, including a visual node editor for dialogue creation, dynamic UI systems with smooth animations, and a comprehensive save system that tracks relationship progress and discovered character preferences. The game combines narrative design with technical systems to create an engaging interactive experience.`}
    coverImage="/images/LPCafe Images/Cafe.webp"
    liveLink="https://tanixgames.itch.io/lp-cafe"
    githubLink="https://github.com/Beer-de-Vreeze/LP-Cafe"
    media={[
      {
        type: "video",
        src: "/images/LPCafe Images/LP Cafe Trailer.webm",
        alt: "LP Cafe Trailer",
      },
      {
        type: "image",
        src: "/images/LPCafe Images/Catboy.webp",
        alt: "Beer the Catboy (yes, that's me!)",
      },
      {
        type: "image",
        src: "/images/LPCafe Images/James Talking.webp",
        alt: "James character dialogue scene",
      },
      {
        type: "video",
        src: "/images/LPCafe Images/DialogueTool.webm",
        alt: "Custom dialogue tool in action",
      },
      {
        type: "video",
        src: "/images/LPCafe Images/Recording Session.webm",
        alt: "Voice acting recording session",
      },
    ]}
    techStack={[
      "Unity",
      "C#",
      "Custom Dialogue Tool",
      "Voice Acting",
      "Editor Scripting",
      "Audacity",
      "DOTween",
      "Text Animator",
      "UI/UX",
    ]}
    features={[
      {
        title: "Character Voice Acting & Audio Production",
        description:
          "I performed all voice acting for Beer the catboy character and handled the complete audio production pipeline. This included recording dialogue, sound effects, and ambient audio, followed by professional editing in Audacity with noise reduction, EQ adjustments, compression, and timing optimization to integrate seamlessly with the dialogue system's typewriter effects.",
      },
      {
        title: "Custom Dialogue Engine with Branching Logic",
        description:
          "A sophisticated dialogue system built from scratch featuring conditional branching, setter nodes for state management, and audio integration. The engine handles complex dialogue trees with typewriter effects, character animations, and seamless transitions between different conversation types, all managed through a visual node-based editor.",
        codeSnippet: {
          title: "Dialogue Processing with Conditional Branching",
          language: "csharp",
          code: `public void ShowDialogue()
{
    // Clear previous choices and reset layout
    ClearChoices();
    EnsureVerticalLayoutSettings();
    EnsureLoveMeterSetup();
    
    if (_continueIcon != null)
        _continueIcon.SetActive(false);
    
    // Handle special node types
    if (IsConditionNode(_dialogue))
    {
        // Evaluate conditions and apply logic if the conditition is met or not
        EvaluateConditionNode();
        return;
    }
    
    if (IsSetterNode(_dialogue))
    {
        // Applying Setter Node to update Love Meter or preferences
        ApplySetterNode();
        return;
    }
    
    // Display character name and image
    if (_bachelor != null && _nameText != null)
    {
        _nameText.text = _bachelor._name ?? "ERROR";
    }
    
    // Handle character sprites with fade effects
    if (_dialogue?.m_dialogue != null && _bachelorImage != null)
    {
        _bachelorImage.sprite = _dialogue.m_dialogue.m_bachelorImageData;
        _bachelorImage.color = new Color(
            _bachelorImage.color.r, _bachelorImage.color.g, 
            _bachelorImage.color.b, 1f
        );
        _bachelorImage.enabled = _dialogue.m_dialogue.m_bachelorImageData != null;
    }
    
    // Display dialogue text with audio integration
    if (_dialogue?.m_dialogue != null && _displayText != null)
    {
        _displayText.text = _dialogue.m_dialogue.m_dialogueTextData;
        
        // Play associated voice clip
        if (_audioSource != null)
        {
            var audioClip = _dialogue.m_dialogue.m_dialogueAudioData;
            if (audioClip != null)
            {
                _audioSource.Stop();
                _audioSource.clip = audioClip;
                _audioSource.Play();
            }
        }
    }
    
    // Handle player choices
    var choices = _dialogue.m_dialogue.m_dialogueChoiceData;
    if (choices?.Count > 0)
    {
        // Checks the DialogueChoiceData for any choices and displays them
        ShowChoices(choices);
        _canAdvance = false;
    }
}`
        },
      },
      {
        title: "DOTween-Powered UI Animation System",
        description:
          "An animated love meter system using DOTween for smooth visual feedback. Features include fade transitions, dial rotations with physics-based easing, and coordinated animation sequences that provide satisfying visual responses to player choices and relationship progress.",
        codeSnippet: {
          title: "Love Meter Animation System",
          language: "csharp",
          code: `public void ShowLoveMeterWithAnimation(int targetLoveValue, System.Action onComplete = null)
{
    if (loveMeterData == null || !gameObject.activeInHierarchy) return;
    if (canvasGroup == null) return;

    // Smooth fade-in animation
    canvasGroup.alpha = 0f;
    canvasGroup.DOFade(1f, fadeInDuration).OnComplete(() =>
    {
        // Animate the dial to new love value
        UpdateDialPosition(targetLoveValue, true);
        
        // Stay visible for dramatic effect
        DOVirtual.DelayedCall(stayDuration, () =>
        {
            // Fade out elegantly
            canvasGroup.DOFade(0f, fadeOutDuration).OnComplete(() =>
            {
                onComplete?.Invoke();
            });
        });
    });
}

private void UpdateDialPosition(int loveValue, bool animate = false)
{
    if (dialTransform == null || loveMeterData == null) return;
    
    float normalizedValue = (float)loveValue / loveMeterData.maxLoveValue;
    float targetRotation = Mathf.Lerp(minRotation, maxRotation, normalizedValue);
    
    if (animate)
    {
        // Smooth rotation with easing
        dialTransform.DORotate(new Vector3(0, 0, targetRotation), 
            animationDuration, RotateMode.FastBeyond360)
            .SetEase(rotationEase);
    }
    else
    {
        dialTransform.rotation = Quaternion.Euler(0, 0, targetRotation);
    }
}`
        },
      },
      {
        title: "Event-Driven Notebook Discovery System",
        description:
          "An intelligent notebook system that automatically tracks and displays discovered character preferences. Features event-driven updates, smooth entry animations with scale and color effects, and duplicate prevention to maintain a clean, organized preference database throughout gameplay.",
        codeSnippet: {
          title: "Preference Discovery & Animation",
          language: "csharp",
          code: `public void AddEntry(string newEntry, bool isLike, bool animate = true)
{
    GameObject entryObj = Instantiate(entryPrefab, 
        isLike ? likesContent : dislikesContent);
    
    var entryText = entryObj.GetComponentInChildren<TextMeshProUGUI>();
    if (entryText != null)
    {
        entryText.text = newEntry;
        
        if (animate)
        {
            // Highlight animation for new discoveries
            entryText.color = highlightColor;
            entryText.DOColor(normalColor, highlightDuration)
                .SetEase(Ease.OutQuad);
                
            // Scale pop-in effect
            entryObj.transform.localScale = Vector3.zero;
            entryObj.transform.DOScale(Vector3.one, 0.3f)
                .SetEase(Ease.OutBack);
        }
    }
    
    // Store reference for dynamic updates
    if (isLike)
        likeEntries.Add(entryObj);
    else
        dislikeEntries.Add(entryObj);
}

private void OnPreferenceDiscovered(string preferenceName, bool isLike)
{
    Debug.Log($"Preference discovered: {preferenceName} (Like: {isLike})");
    
    // Check if already exists to prevent duplicates
    var existingEntries = isLike ? likeEntries : dislikeEntries;
    bool alreadyExists = existingEntries.Any(entry => 
    {
        var text = entry.GetComponentInChildren<TextMeshProUGUI>();
        return text != null && text.text == preferenceName;
    });
    
    if (!alreadyExists)
    {
        AddEntry(preferenceName, isLike, animate: true);
        
        // Play discovery sound effect
        if (audioSource != null && discoverySound != null)
        {
            audioSource.PlayOneShot(discoverySound);
        }
    }
}`
        },
      },
      {
        title: "Visual Node Editor for Dialogue Creation",
        description:
          "A custom Unity editor tool that enables non-programmers to create complex dialogue trees through a visual interface. Features dynamic dropdown population, real-time validation, and preference selection systems that automatically sync with character data for streamlined dialogue creation workflow.",
        codeSnippet: {
          title: "Dynamic Dropdown Population",
          language: "csharp",
          code: `private void PopulatePreferenceDropdown()
{
    if (m_bachelor == null)
    {
        preferenceDropdown.choices = new List<string> { "No bachelor selected" };
        preferenceDropdown.index = 0;
        return;
    }

    List<string> preferences = new List<string>();
    
    // Dynamically populate based on preference type
    if (m_isLikePreference && m_bachelor._likes != null)
    {
        foreach (var like in m_bachelor._likes)
        {
            preferences.Add(like.description);
        }
    }
    else if (!m_isLikePreference && m_bachelor._dislikes != null)
    {
        foreach (var dislike in m_bachelor._dislikes)
        {
            preferences.Add(dislike.description);
        }
    }

    // Update dropdown with validation
    if (preferences.Count > 0)
    {
        preferenceDropdown.choices = preferences;
        
        // Maintain selection if valid
        int currentIndex = preferences.IndexOf(m_selectedPreference);
        preferenceDropdown.index = currentIndex >= 0 ? currentIndex : 0;
        m_selectedPreference = preferences[preferenceDropdown.index];
    }
    else
    {
        preferenceDropdown.choices = new List<string> { "No preferences found" };
        preferenceDropdown.index = 0;
        m_selectedPreference = "";
    }
}

private void OnPreferenceSelectionChanged(ChangeEvent<string> evt)
{
    m_selectedPreference = evt.newValue;
    EditorUtility.SetDirty(target);
    
    // Real-time validation feedback
    ValidatePreferenceSelection();
}`
        },
      },
      {
        title: "Comprehensive Save & State Management",
        description:
          "A robust persistence system that tracks relationship progress, discovered preferences, and game state across sessions. Features automatic serialization, data validation, and backward compatibility to ensure seamless save/load functionality as the game evolves and updates.",
        codeSnippet: {
          title: "Bachelor State Management & Persistence",
          language: "csharp",
          code: `public void MarkAsDated()
{
    Debug.Log($"[MarkAsDated] Marking {_name} as speed dated");

    // Validate before saving
    if (string.IsNullOrEmpty(_name))
    {
        Debug.LogError($"Cannot save bachelor with empty name! Bachelor object: {name}");
        return;
    }

    _HasBeenSpeedDated = true;

    // Ensure save data exists
    SaveData saveData = SaveSystem.Deserialize() ?? new SaveData();

    // Update bachelor-specific data with preferences
    BachelorPreferencesData prefData = saveData.GetOrCreateBachelorData(_name);
    prefData.hasBeenSpeedDated = true;
    
    // Maintain backward compatibility
    if (!saveData.DatedBachelors.Contains(_name))
    {
        saveData.DatedBachelors.Add(_name);
    }

    // Save discovered preferences
    SaveBachelorPreferencesToSaveData(saveData);
    
    // Persist to disk with validation
    SaveSystem.SerializeData(saveData);
    Debug.Log($"[MarkAsDated] Successfully saved state for {_name}");
}

private void SaveBachelorPreferencesToSaveData(SaveData saveData)
{
    var prefData = saveData.GetOrCreateBachelorData(_name);
    
    // Save discovered likes
    foreach (var like in _discoveredLikes)
    {
        if (!prefData.discoveredLikes.Contains(like.description))
        {
            prefData.discoveredLikes.Add(like.description);
        }
    }
    
    // Save discovered dislikes
    foreach (var dislike in _discoveredDislikes)
    {
        if (!prefData.discoveredDislikes.Contains(dislike.description))
        {
            prefData.discoveredDislikes.Add(dislike.description);
        }
    }
}`
        },
      },
    ]}
    codeSnippet={{
      title: "NewBachelorSO: MarkAsDated",
      language: "csharp",
      code: `/// <summary>
/// Marks this bachelor as having been dated
/// </summary>
public void MarkAsDated()
{
    Debug.Log($"[MarkAsDated] Marking {_name} as speed dated");

    // Validate name before saving
    if (string.IsNullOrEmpty(_name))
    {
        Debug.LogError(
            $"[MarkAsDated] Cannot save bachelor with empty name! Bachelor object: {name}. Please set the _name field in the Inspector."
        );
        return;
    }

    _HasBeenSpeedDated = true;
    Debug.Log($"[MarkAsDated] Set local flag _HasBeenSpeedDated to true");

    // Also ensure it's saved to the save system
    SaveData saveData = SaveSystem.Deserialize();
    if (saveData == null)
    {
        saveData = new SaveData();
        Debug.Log($"[MarkAsDated] Created new SaveData");
    }

    // Update the bachelor-specific data
    BachelorPreferencesData prefData = saveData.GetOrCreateBachelorData(_name);
    prefData.hasBeenSpeedDated = true;
    Debug.Log($"[MarkAsDated] Set hasBeenSpeedDated flag for {_name} in save system");

    // Add to legacy DatedBachelors list for backward compatibility
    if (!saveData.DatedBachelors.Contains(_name))
    {
        saveData.DatedBachelors.Add(_name);
        Debug.Log(
            $"[MarkAsDated] Also added {_name} to legacy DatedBachelors list for compatibility"
        );
    }

    // Also update BachelorPreferences to save discovered likes/dislikes
    SaveBachelorPreferencesToSaveData(saveData);

    // Save the updated data
    SaveSystem.SerializeData(saveData);
    Debug.Log($"[MarkAsDated] Save data serialized to disk");
}`
    }}
    onModalStateChange={onModalStateChange}
  />
);

export default LPCafe;
