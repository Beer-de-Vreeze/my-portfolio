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
    description="A cool Unity stealth game where you play as a bear sneaking through shadowy environments. It’s built with advanced AI, dynamic noise detection, and layered stealth mechanics that make every move count. The game features smart enemy behavior and complex state management that keep the tension high throughout gameplay."
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
        title: "Advanced Enemy AI with Multi-State Behavior",
        description:
          "Enemies have smart AI with patrol, wandering, investigating, and chasing states. They use NavMesh pathfinding and dynamic waypoints. Each enemy type (like BasePatrolEnemy and BaseWanderingEnemy) has unique behaviors, with adjustable vision cones, hearing ranges, and investigation settings.",
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
          "Player actions create different noise levels—stealth is quiet, running is loud, and a bear roar is huge. The NoiseManager handles spreading the noise to nearby enemies, triggering their investigation if it’s loud enough. Noise fades over time and distance to keep things realistic.",
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
          "Enemies move using modular systems: patrols follow set routes (loops or back-and-forth), while wanderers explore confined areas. Both connect with investigation and chase behaviors and use Unity’s NavMesh for smooth pathfinding and obstacle avoidance.",
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
          "Players can pick up objects to distract enemies. The bear’s special roar ability creates a huge noise burst to draw attention. Movement modes include stealth, and physics-based object interactions make gameplay feel alive. Controls are built with Unity’s new Input System and work on multiple platforms.",
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
          "When enemies hear a noise, they switch to investigation: moving to the source, searching around, then returning to patrol if nothing’s found. This system uses timers, sound decay, and smart state changes to keep enemy behavior believable.",
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
          "Enemy behavior is managed with a solid finite state machine covering patrolling, investigating, chasing, and wandering. Each state has clear rules for entering, updating, and exiting, with debug tools to visualize state changes and ensure smooth transitions.",
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
          "The bear moves realistically using Rigidbody physics, with different speeds for stealth, walking, and sprinting. Direction changes are smooth, animations sync nicely, and movement adapts to the terrain. This system works tightly with noise generation and player input.",
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
    onModalStateChange={onModalStateChange}
  />
);

export default BearlyStealthy;