import React from "react";
import SuspenseProjectCard from "../projectCard";

const Tetrtis = ({ onModalStateChange }: { onModalStateChange: (isOpen: boolean) => void }) => (
  <SuspenseProjectCard
    projectId="Better-Tetris"
    title="Tetris"
    description="Who doesn't love a good game of Tetris? I've recreated this timeless classic in Unity with all the modern polish and precision you'd expect! This isn't just any Tetris clone—I've implemented the official Super Rotation System, added smooth ghost piece previews, rich audio feedback, and a comprehensive scoring system that rewards strategic play. Built with clean, modular code using Unity's Tilemaps and ScriptableObjects, it's both a joy to play and a solid technical showcase. Drop some blocks and chase that perfect Tetris!"
    githubLink="https://github.com/Beer-de-Vreeze/Better-Tetris"
    liveLink="https://bjeerpeer.itch.io/better-tetris"
    coverImage="/images/BetterTetris Images/Tetris3.webp"
    media={[
      {
        type: "image",
        src: "/images/BetterTetris Images/Tetris1.webp",
        alt: "Better Tetris Game Screenshot 1",
      },
    ]}
    techStack={["Unity", "C#", "Tilemap", "Game Design"]}
    features={[
      {
        title: "Authentic Super Rotation System (SRS)",
        description:
          "I've meticulously implemented the official Super Rotation System with all the complex wall kick patterns that make Tetris feel just right! Every rotation is mathematically precise, collision detection is spot-on, and those tricky wall kicks work exactly like they should. Whether you're T-spinning like a pro or just trying to squeeze a piece into a tight spot, the rotation system responds perfectly and feels incredibly satisfying to use!",
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
        title: "Lightning-Fast Tilemap Board System",
        description:
          "Under the hood, I'm using Unity's powerful Tilemap system for blazing-fast rendering and efficient memory usage. The line clearing algorithm is optimized to handle even the most intense gameplay moments, with smart collision detection and board validation that keeps up with your fastest moves. No lag, no stuttering—just pure, smooth Tetris action that responds instantly to your every input!",
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
        title: "Crystal-Clear Ghost Piece Preview",
        description:
          "Never wonder where your piece will land again! The ghost piece system shows you exactly where your tetromino will drop with a sleek transparent preview. I've optimized the drop simulation to be lightning-fast, so you get instant visual feedback without any performance hiccups. It's like having X-ray vision for your Tetris strategy—plan your moves with confidence!",
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
        title: "Rewarding Scoring & Progression System",
        description:
          "Score big with an authentic Tetris scoring system that rewards smart play! Singles, doubles, triples, and those satisfying four-line Tetrises all have their own point values and multipliers. The game tracks your high scores persistently, updates everything in real-time, and gives you that rush of satisfaction when you nail a perfect combo. Every cleared line feels rewarding, and chasing that high score becomes addictive!",
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
        title: "Responsive Controls & Smooth Movement",
        description:
          "The controls feel incredibly responsive and intuitive! I've implemented smooth piece movement with customizable keyboard support, plus features like hard drops for instant placement and soft drops for precise control. The input system handles timing perfectly—no missed rotations or accidental moves. Whether you're a casual player or a Tetris speedrunner, the controls adapt to your playstyle beautifully!",
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
        title: "Clean Data-Driven Architecture",
        description:
         "Behind the scenes, everything is built with clean, maintainable code! I've used data-driven design with rotation matrices, static dictionaries for tetromino shapes, and organized ScriptableObjects that make the codebase easy to understand and extend. The mathematical precision of the rotation system combined with elegant data structures creates a solid foundation that any developer would appreciate working with!",
        codeSnippet: {
          title: "Tetromino Data & Rotation Mathematics",
          language: "csharp",
          code: `public static class Data
{
    // Mathematical constants for 90-degree rotation matrix
    public static readonly float cos = Mathf.Cos(Mathf.PI / 2f);
    public public static readonly float sin = Mathf.Sin(Mathf.PI / 2f);
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
    onModalStateChange={onModalStateChange}
  />
);

export default Tetrtis;