import React from "react";
import SuspenseProjectCard from "../projectCard";

const BearlyStealthy = ({
  onModalStateChange,
}: {
  onModalStateChange: (isOpen: boolean) => void;
}) => (
  <SuspenseProjectCard
    projectId="Bearly-Stealthy"
    title="Bearly Stealthy"
    description="Ever wanted to be a sneaky bear? Well, now's your chance! Bearly Stealthy is my take on the stealth genre with a furry twist—you play as a bear trying to sneak through dangerous environments without getting caught. I've packed this Unity game with sophisticated AI systems, dynamic noise detection, and layered stealth mechanics that make every step matter. The enemies are smart, the tension is real, and the bear is absolutely adorable (but deadly sneaky!). It's a technical showcase of advanced game AI that keeps you on your toes throughout every mission."
    githubLink="https://github.com/Beer-de-Vreeze/Bearly-Stealthy"
    liveLink="https://bjeerpeer.itch.io/bearly-stealthy"
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
        title: "Brain-Powered Enemy AI",
        description:
         "These aren't your typical dumb NPCs! I've built a multi-state AI system where enemies patrol their routes, investigate suspicious sounds, and chase you down when spotted. Each enemy type has its own personality—some patrol in loops, others wander around exploring. They use Unity's NavMesh for smart pathfinding and have realistic vision cones and hearing ranges. When they spot you, things get intense fast! The AI adapts and reacts to your behavior, making every encounter feel dynamic and challenging.",
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
        title: "Realistic Noise & Sound Propagation",
        description:
          "Every footstep matters in this world! I've created a dynamic noise system where different actions generate different sound levels—tiptoeing around is whisper-quiet, normal walking creates moderate noise, and running? Well, you might as well ring a dinner bell! The best part is the bear's special roar ability that creates a massive noise burst perfect for distracting enemies. Sound travels realistically through the environment, and enemies will investigate if they hear something suspicious. It's all about managing your noise footprint!",
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
        title: "Intelligent Patrol & Exploration Systems",
        description:
          "I've designed two distinct enemy movement patterns that feel naturally different. Patrol enemies follow set routes—some loop around in circles, others walk back and forth like they're guarding something important. Meanwhile, wandering enemies explore their territory randomly, making them unpredictable and exciting to avoid. Both systems integrate seamlessly with the investigation and chase behaviors, using Unity's NavMesh for obstacle avoidance and smooth pathfinding. No more enemies walking through walls!",
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
        title: "Bear Powers & Interactive Gameplay",
        description:
          "Being a bear has its perks! You can pick up and throw objects to create distractions, sneak around in stealth mode, or unleash a mighty roar that draws every enemy's attention (great for strategic misdirection!). The interaction system feels natural and responsive, built with Unity's modern Input System for smooth controls across different platforms. Whether you're carefully planning your route or improvising on the fly, the bear handles beautifully and makes stealth feel empowering rather than frustrating.",
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
        title: "Smart Investigation Mechanics",
        description:
          "When enemies hear something suspicious, they don't just ignore it—they investigate! I've programmed them to move to the noise source, search the area by looking around, and only return to their normal routine if they don't find anything. This creates incredible tension as you watch guards carefully checking out that trash can you accidentally knocked over. The investigation system uses realistic timers and state transitions, making enemy behavior feel believable and adding strategic depth to every encounter.",
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
        title: "Rock-Solid State Machine Architecture",
        description:
         "Under the hood, every enemy runs on a carefully crafted finite state machine that manages patrolling, investigating, chasing, and wandering behaviors. Each state has clear rules for when to enter, what to do while active, and when to exit to another state. I've included debug visualization tools that let me see exactly what each enemy is thinking, ensuring smooth transitions and consistent behavior. It's the kind of solid foundation that makes complex AI feel effortless and reliable!",
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
        title: "Physics-Based Bear Movement",
        description:
          "This bear moves with realistic weight and momentum! Using Unity's Rigidbody physics system, I've created movement that feels natural and responsive. The bear has different speeds for sneaking, walking, and sprinting, with smooth direction changes and perfectly synchronized animations. Movement speed directly affects noise generation, so you're constantly making tactical decisions about how fast to move. The physics-based approach means the bear interacts naturally with the environment and terrain—no more floating or sliding around!",
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
    onModalStateChange={onModalStateChange}
  />
);

export default BearlyStealthy;