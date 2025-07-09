import React from "react";
import SuspenseProjectCard from "../projectCard";

const SketchinSpells = ({
  onModalStateChange,
}: {
  onModalStateChange: (isOpen: boolean) => void;
}) => (
  <SuspenseProjectCard
    projectId="sketchin-spells"
    coverImage="/images/SketchinSpells Images/Spell2.webp"
    media={[
      {
        type: "image",
        src: "/images/SketchinSpells Images/Spell2.webp",
        alt: "Sketchin' Spells drawing tool interface",
      },
      {
        type: "image",
        src: "/images/SketchinSpells Images/Spell3.webp",
        alt: "Sketchin' Spells drawing tool interface",
      },
      {
        type: "image",
        src: "/images/SketchinSpells Images/Spell4.webp",
        alt: "Sketchin' Spells drawing tool interface",
      },
    ]}
    title="Sketchin' Spells"
    techStack={["Unity", "C#", "Real-time Drawing", "UI Systems"]}
    description="Sketchin' Spells is a real-time drawing roguelike game built in Unity that combines spell-casting mechanics with creative drawing gameplay. Players draw magical symbols and spells in real-time to defeat enemies and progress through challenging levels. The project features advanced canvas manipulation, multi-touch input handling, and symmetry-based drawing algorithms optimized for fast-paced combat scenarios. I implemented custom drawing tools, coordinate conversion systems, and memory-efficient canvas management to create a unique gaming experience that merges artistic expression with tactical roguelike gameplay."
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
        // Draw a circle on the texture at the pixel position
        DrawCircleOnTexture(pixelPos, brushSize, brushColor);
        canvasTexture.Apply();
    }
}`,
      language: "csharp",
      title: "Core Drawing Tool Implementation",
    }}
    liveLink="https://bjeerpeer.itch.io/sketchin-spells"
    githubLink="https://github.com/Beer-de-Vreeze/Sketchin-Spells"
    features={[
      {
        title: "Multi-Touch Input Processing System",
        description:
          "A comprehensive touch input system that handles multiple simultaneous touches with precise coordinate conversion between screen space and world space. The system tracks individual touch phases, manages active touch states, and provides accurate positioning for drawing operations. Features include pressure sensitivity detection and gesture recognition for natural drawing experiences across different devices.",
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
        title: "Real-Time Symmetry Drawing Engine",
        description:
          "An advanced symmetry system that applies mathematical transformations to create mirrored drawing patterns in real-time. Supports horizontal, vertical, and radial symmetry modes using matrix calculations and reflection algorithms. The system generates multiple symmetric points for each input stroke, enabling complex pattern creation and mandala-style artwork through automated geometric transformations.",
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
        title: "Advanced Erasing & History Management",
        description:
         "A comprehensive editing system featuring multiple erasing modes including point erasing, area erasing, and selective color removal. The system implements efficient undo/redo functionality with intelligent memory management and state tracking. Features circular area calculations for smooth erasing operations and maintains canvas history for non-destructive editing workflows.",
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
        title: "Anti-Aliased Line Rendering Algorithm",
        description:
          "A sophisticated line drawing system implementing Bresenham's algorithm with anti-aliasing for smooth stroke rendering. The system interpolates between points to eliminate gaps and provides consistent line quality regardless of drawing speed or direction. Features optimized pixel updates and smooth curve generation for professional-quality digital art creation.",
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
        title: "Canvas Management & Export System",
        description:
          "A robust canvas system handling artwork persistence, export functionality, and layer management. Features PNG encoding for high-quality image exports, persistent storage integration, and memory-efficient texture handling. The system supports transparent backgrounds, format conversion, and cross-platform file operations for comprehensive artwork management.",
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
        title: "Optimized Texture Operations & Performance",
        description:
          "High-performance drawing system utilizing batched pixel updates and GPU acceleration for smooth operation across platforms. The system implements efficient texture manipulation with smart rendering optimizations, memory pooling, and frame rate-independent updates. Features include alpha blending calculations and distance-based brush rendering for consistent visual quality.",
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
    onModalStateChange={onModalStateChange}
  />
);

export default SketchinSpells;