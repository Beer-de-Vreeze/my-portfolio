import React from "react";
import SuspenseProjectCard from "../cards/SuspenseProjectCard";
import useMobileDetection from "../utils/useMobileDetection";

const BearlyStealthy = () => {
  const isMobile = useMobileDetection();
  
  return (
  <SuspenseProjectCard
    projectId="Bearly-Stealthy"
    title="Bearly Stealthy"
    description="Bearly Stealthy is a stealth game where you play as a bear navigating through dangerous environments while avoiding detection. I built this Unity project to explore advanced AI systems and stealth mechanics, creating enemies with sophisticated behavior patterns including patrol routes, sound investigation, and dynamic vision systems. The game combines physics-based movement, realistic noise propagation, and multi-state AI to create engaging stealth gameplay where every step and sound matters."
    githubLink="https://github.com/Beer-de-Vreeze/Bearly-Stealthy"
    liveLink="https://bjeerpeer.itch.io/bearly-stealthy"
    media={[
      {
        type: "image",
        src: "/images/Bearly Stealth Images/Bear.webp",
        alt: "Bear",
      },
      {
        type: isMobile ? "youtube" : "video",
        src: isMobile 
          ? "https://youtu.be/sko7rdFqJ4E" // YouTube link for Bearly Stealthy video
          : "/images/Bearly Stealth Images/Bearly Stealthjy vid.webm",
        alt: "Bearly Stealthy Vid",
        thumbnail: "/images/Bearly Stealth Images/Bear.webp", // Use Bear image as thumbnail
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
      {
        type: isMobile ? "youtube" : "video",
        src: isMobile 
          ? "https://youtu.be/ryoPsTMYDNY" // YouTube link for Noise visualization
          : "/images/Bearly Stealth Images/Noise.webm",
        alt: "Noise visualization system",
        thumbnail: "/images/Bearly Stealth Images/MapOverview.webp",
      },
    ]}
    techStack={["Unity", "C#", "Game Design"]}
    features={[
      {
        title: "Multi-State Enemy AI System",
        description:
         "The enemies feature a comprehensive multi-state AI system that handles patrolling, investigating, and chasing behaviors. Each enemy type has distinct movement patterns - some follow set patrol routes while others explore their territory randomly. They use Unity's NavMesh for pathfinding and have configurable vision cones and hearing ranges. The AI responds dynamically to player actions, creating varied and unpredictable encounters that keep the stealth experience challenging.",
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
                // Enemy lost sight of player go patrol the area you lost sight of them and after a bit return to patrolling
                LosePlayerVisibility();
            }
        }
    }
}`,
        },
      },
      {
        title: "Dynamic Noise & Sound Propagation",
        description:
          "The game implements a dynamic noise system where different player actions generate varying sound levels - from silent tiptoeing to attention-grabbing sprinting. The bear's roar ability creates strategic noise bursts for enemy distraction. Sound propagates realistically through the environment, with enemies investigating suspicious noises based on proximity and volume thresholds. This creates a layered stealth experience where sound management is crucial to survival. The Noise.webm visualization shows how sound waves propagate and alert enemies, illustrating this core stealth mechanic.",
        codeSnippet: {
          title: "NoiseManager - Centralized Sound System",
          language: "csharp",
          code: `[System.Serializable]
public struct NoiseEvent
{
    public Vector3 position;
    public float intensity;
    public float maxRadius;
    public float startTime;
    public float duration;
}

public void GenerateNoise(Vector3 position, float noiseLevel)
{
    // Notify all registered enemies about the noise
    foreach (var enemy in _enemies)
    {
        enemy.OnNoiseHeard(position, noiseLevel);
    }

    // Add to active noise events for debug visualization
    if (_showNoiseGizmos)
    {
        NoiseEvent newEvent = new NoiseEvent
        {
            position = position,
            intensity = noiseLevel,
            maxRadius = Mathf.Min(noiseLevel * 2.0f, _maxNoiseDistance),
            startTime = Time.time,
            duration = _defaultNoiseDuration
        };
        _activeNoiseEvents.Add(newEvent);
    }
}

public void RegisterEnemy(BaseEnemy enemy)
{
    if (!_enemies.Contains(enemy))
    {
        _enemies.Add(enemy);
    }
}`,
        },
      },
      {
        title: "Patrol & Exploration Movement Systems",
        description:
          "I designed two distinct enemy movement patterns that create varied gameplay scenarios. Patrol enemies follow predetermined routes with options for looping or back-and-forth patterns, while wandering enemies explore their territory randomly. Both systems integrate seamlessly with investigation and chase states, using Unity's NavMesh for smooth obstacle avoidance and natural pathfinding through complex environments.",
        codeSnippet: {
          title: "Patrol Route Visualization System",
          language: "csharp",
          code: `protected override void OnDrawGizmos()
{
    base.OnDrawGizmos();
    if (!_showGizmos || _patrolPoints == null || _patrolPoints.Length == 0)
        return;

    for (int i = 0; i < _patrolPoints.Length; i++)
    {
        if (_patrolPoints[i] != null)
        {
            if (i == 0)
            {
                Gizmos.color = Color.green; // Start point
            }
            else if (i == _patrolPoints.Length - 1)
            {
                Gizmos.color = Color.red; // End point
            }
            else
            {
                Gizmos.color = Color.blue; // Intermediate points
            }

            Gizmos.DrawSphere(_patrolPoints[i].position, 0.3f);
            Gizmos.color = Color.yellow;
            if (i < _patrolPoints.Length - 1 && _patrolPoints[i + 1] != null)
            {
                Gizmos.DrawLine(_patrolPoints[i].position, _patrolPoints[i + 1].position);
            }
        }
    }

    // Draw loop connection for looping patrol routes
    if (_patrolLoop && _patrolPoints.Length > 1 
        && _patrolPoints[0] != null && _patrolPoints[_patrolPoints.Length - 1] != null)
    {
        Gizmos.DrawLine(_patrolPoints[_patrolPoints.Length - 1].position, 
            _patrolPoints[0].position);
    }
}`,
        },
      },
      {
        title: "Bear Abilities & Object Interaction",
        description:
          "The player bear has multiple interaction capabilities including object pickup and throwing for creating distractions, stealth mode for silent movement, and a powerful roar for strategic misdirection. The system is built using Unity's Input System for responsive cross-platform controls. These abilities combine to offer multiple approaches to stealth scenarios, from careful planning to improvised solutions.",
        codeSnippet: {
          title: "Bear Object Interaction System",
          language: "csharp",
          code: `private void HandleObjectInteraction()
{
    // Pickup/Drop objects
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

    // Throw objects
    if (_isHoldingObject && InputManager.Instance.PlayerInput.Player.Throw.triggered)
    {
        ThrowObject();
    }
}

private void TryPickupObject()
{
    RaycastHit hit;
    if (Physics.Raycast(Camera.main.transform.position, Camera.main.transform.forward,
        out hit, _pickupDistance, _interactableLayers))
    {
        DistractionObject distractionObject = hit.collider.GetComponent<DistractionObject>();
        if (distractionObject != null && distractionObject.CanBePickedUp)
        {
            _heldObject = distractionObject;
            _heldObject.PickUp(_holdPosition);
            _isHoldingObject = true;
        }
    }
}

private void ThrowObject()
{
    if (_heldObject != null)
    {
        GenerateNoise(_heldObject.NoiseOnThrow);
        _heldObject.Throw(Camera.main.transform.forward * _throwForce);
        _heldObject = null;
        _isHoldingObject = false;
    }
}`,
        },
      },
      {
        title: "Enemy Investigation Behavior",
        description:
          "When enemies detect suspicious sounds, they transition to an investigation state where they move to the noise source and actively search the area. The investigation system uses realistic timers and behavior patterns - enemies look around, check nearby areas, and only return to normal patrol after thorough searching. This creates tension and strategic depth as players must consider the consequences of every noise they make.",
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
        title: "Finite State Machine Architecture",
        description:
         "Every enemy operates using a finite state machine that manages transitions between patrolling, investigating, chasing, and wandering states. Each state has defined entry conditions, behaviors, and exit criteria, ensuring consistent and predictable AI responses. The system includes debug visualization tools for monitoring enemy states during development, making it easier to balance and refine AI behavior patterns.",
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
            // Go to the last heard position and investigate
            Agent.SetDestination(_lastHeardPosition);
            _investigationTimeRemaining -= Time.deltaTime;
            if (_investigationTimeRemaining <= 0)
            {
                _isInvestigating = false;
                _currentState = EnemyState.Patrolling;
            }
            break;
        case EnemyState.Chasing:
            // Chase the player if spotted
            if (Time.time - LastPlayerVisibleTime > PlayerVisibilityTimeout)
            {
                // Enemy lost sight of player, go patrol the area you lost sight of them and after a bit return to patrolling
                LosePlayerVisibility();
            }
            break;
    }
      CheckVision();
    CheckHearing();
}`,
        },
      },
      {
        title: "Physics-Based Bear Movement System",
        description:
          "The bear movement system uses Unity's Rigidbody physics for realistic weight and momentum. Different movement speeds (sneaking, walking, sprinting) are tied to noise generation levels, creating tactical decision-making around movement choices. The physics-based approach ensures natural interaction with terrain and environmental objects, while smooth animation blending provides responsive character control.",
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
            // Register this enemy for noise events
            NoiseManager.Instance.RegisterEnemy(this);
    }
    
    protected virtual void Update()
    {
        // Multi-state behavior management
        switch (_currentState)
        {
            case EnemyState.Chasing:
                if (Time.time - LastPlayerVisibleTime > PlayerVisibilityTimeout)
                {
                    // Enemy lost sight of player, go patrol the area you lost sight of them and after
                    LosePlayerVisibility();
                break;
            case EnemyState.Investigating:
                // Go to the last heard position and investigate
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
                // Notify the enemy to investigate the noise
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
                    // Enemy spotted the player, start chasing
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
  />
  );
};

export default BearlyStealthy;