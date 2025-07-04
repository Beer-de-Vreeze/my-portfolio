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
    description="A polished real-time drawing game made in Unity, packed with advanced canvas controls, multi-touch support, and cool symmetry modes. It’s a technical showcase of smooth UI interactions and pixel-level efficiency for a great drawing experience."
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
    liveLink="https://bjeerpeer.itch.io/sketchin-spells"
    githubLink="https://github.com/Beer-de-Vreeze/Sketchin-Spells"
    features={[
      {
        title: "Multi-Touch Canvas System",
        description:
          "Handles multiple touches at once with pressure sensitivity and gesture recognition. Converts coordinates between world space and pixel space perfectly for precise drawing.",
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
          "Supports horizontal, vertical, and radial symmetry in real time. Uses smart matrix math and reflection to mirror your strokes across several axes for beautiful symmetric designs.",
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
          "Multiple erase modes—point, area, and selective color erasing. Includes undo/redo with smart memory use to keep your drawing sessions smooth and flexible.",
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
          "Uses Bresenham's algorithm for smooth, anti-aliased lines between touches. Optimizes pixel updates for fluid, lag-free drawing.",
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
          "Full save/load support, layer handling, and persistent storage. Export your art as transparent PNGs and clear the canvas easily—all managed with memory-friendly texture handling.",
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
          "Leverages Unity’s native texture features and GPU acceleration for fast, batched pixel updates. Keeps drawing smooth even on mobile devices.",
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