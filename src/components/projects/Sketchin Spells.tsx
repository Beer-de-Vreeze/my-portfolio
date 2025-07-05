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
    description="Want to unleash your inner artist with some digital magic? Sketchin' Spells is my love letter to creative expression—a polished real-time drawing game built in Unity that's packed with everything you need to create beautiful art! It features advanced canvas controls, responsive multi-touch support, and mesmerizing symmetry modes that turn simple strokes into intricate masterpieces. This project showcases some serious technical wizardry with smooth UI interactions and pixel-perfect efficiency, all wrapped up in a delightful drawing experience that feels like magic!"
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
        title: "Responsive Multi-Touch Magic",
        description:
          "Draw with all your fingers at once—seriously! The touch system handles multiple simultaneous touches with pressure sensitivity and gesture recognition that feels incredibly natural. I've engineered precise coordinate conversion between world space and pixel space, so every stroke lands exactly where you expect it to. Whether you're sketching with one finger or going wild with all ten, the canvas keeps up with your creativity!",
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
        title: "Mind-Blowing Symmetry Engine",
        description:
          "This is where the real magic happens! Watch your simple doodles transform into stunning symmetric masterpieces with real-time horizontal, vertical, and radial symmetry. Using smart matrix mathematics and reflection algorithms, every stroke you make gets mirrored across multiple axes instantly. It's like having a team of artists copying your every move—perfect for creating mandalas, kaleidoscope patterns, or just making everything look absolutely gorgeous!",
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
        title: "Smart Erasing & Undo System",
        description:
         "Made a mistake? No worries! The erasing system gives you multiple ways to fix things—point erasing for precision, area erasing for bigger oops moments, and even selective color erasing for when you just want to remove that one annoying blue line. Plus, there's a full undo/redo system with smart memory management, so you can experiment fearlessly knowing you can always go back to that perfect moment!",
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
        title: "Silky-Smooth Line Rendering",
        description:
          "Every line you draw is buttery smooth thanks to Bresenham's algorithm working behind the scenes to create beautiful anti-aliased strokes. I've optimized the pixel updates to eliminate any lag or jitter, so your artistic flow never gets interrupted. Whether you're drawing quick sketches or detailed artwork, the lines flow as naturally as if you were using a real pencil on paper!",
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
        title: "Complete Canvas Management",
        description:
          "Your artwork deserves to be saved and shared! The canvas system handles everything from saving your masterpieces as crisp PNG files to managing layers and persistent storage. You can export your art with transparent backgrounds, clear the canvas for a fresh start, or load previous works to continue where you left off. All of this is powered by memory-friendly texture handling that keeps everything running smoothly!",
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
        title: "Lightning-Fast Performance",
        description:
          "I've squeezed every bit of performance out of Unity's native texture features and GPU acceleration to ensure your drawing experience is always fluid and responsive. The system uses batched pixel updates and smart rendering optimizations that keep everything smooth, even on mobile devices. No lag, no stuttering—just pure, uninterrupted creative flow that lets you focus on making beautiful art!",
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