import React from "react";
import SuspenseProjectCard from "../projectCard";

const MLAgent = ({
  onModalStateChange,
}: {
  onModalStateChange: (isOpen: boolean) => void;
}) => (
  <SuspenseProjectCard
    projectId="ML-Agents"
    title="Unity ML-Agents Training"
    description="Welcome to my AI playground! This Unity ML-Agents project is where I dive deep into the fascinating world of machine learning and artificial intelligence. I've created multiple training environments where AI agents learn to survive zombie attacks, engage in epic hunter-prey battles, and master complex pellet collection challenges. Using Unity's ML-Agents framework, I've built sophisticated reinforcement learning systems with custom reward mechanisms, observation spaces, and neural network training pipelines. It's like watching digital creatures evolve and get smarter right before your eyes—absolutely mind-blowing stuff!"
    githubLink="https://github.com/Beer-de-Vreeze/ML-Agents-Training"
    coverImage="/images/AI Images/Title.webp"
    media={[
      {
        type: "video",
        src: "/images/AI Images/Jerry Move.webm",
        alt: "Move 1 first itteration",
      },
      {
        type: "video",
        src: "/images/AI Images/Jerry MoveWithVision.webm",
        alt: "Move with raycast training",
      },
      {
        type: "video",
        src: "/images/AI Images/Jerry MoveWithFEEDBACKV2.webm",
        alt: "Training with feedback",
      },
      {
        type: "video",
        src: "/images/AI Images/Jerry MoveWithFEEDBACKTRAINING2.webm",
        alt: "Training with Timer",
      },
      {
        type: "video",
        src: "/images/AI Images/HUNTERVSPREY.webm",
        alt: "Hunter VS Prey simulation",
      },
    ]}
    techStack={[
      "Unity",
      "Unity ML-Agents",
      "C#",
      "Reinforcement Learning",
      "Neural Networks",
    ]}
    features={[
      {
        title: "Jerry the Pellet Collector",
        description:
          "Meet Jerry, my first AI agent who learned to collect pellets like a pro! Starting with simple transform-based movement, Jerry evolved through multiple iterations—first learning basic navigation, then getting raycast vision to see his surroundings, and finally mastering efficient pellet collection with visual feedback systems. Watch him go from confused wandering to strategic pellet hunting with smooth movement and smart pathfinding!",
        codeSnippet: {
          title: "Jerry's Core Movement & Reward System",
          language: "csharp",
          code: `public class AgentController : Agent
{
    [Header("Agent")]
    [SerializeField] float _speed = 4f;
    [SerializeField] float _rotationSpeed = 4f;
    private Rigidbody _rb;
    
    [Header("Reward")]
    [SerializeField] private float _reward = 10f;
    [SerializeField] private float _punishment = -15f;
    [SerializeField] private float _endReward = 5f;
    
    public override void OnActionReceived(ActionBuffers actions)
    {
        float moveRotate = actions.ContinuousActions[0];
        float moveForward = actions.ContinuousActions[1];

        // Move the agent forward based on the action value
        _rb.MovePosition(
            transform.position + transform.forward * moveForward * _speed * Time.deltaTime
        );

        // Rotate the agent around the y-axis based on the action value
        transform.Rotate(0f, moveRotate * _rotationSpeed, 0f, Space.Self);
    }
    
    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Pellet"))
        {
            _pellets.Remove(other.gameObject);
            Destroy(other.gameObject);
            AddReward(_reward);
            if (_pellets.Count == 0)
            {
                _material.color = Color.green;
                AddReward(_endReward);
                EndEpisode();
            }
        }
        if (other.CompareTag("Wall"))
        {
            _material.color = Color.red;
            AddReward(_punishment);
            EndEpisode();
        }
    }
}`
        },
      },
      {
        title: "Hunter vs Prey Dynamics",
        description:
          "Experience the thrill of predator-prey AI behavior! I've created a fascinating ecosystem where hunters chase prey agents while prey try to collect pellets and avoid capture. Both agents learn simultaneously through competitive training—hunters get rewarded for catching prey, while prey learn evasive maneuvers and efficient resource collection. It's like watching nature documentaries, but with neural networks!",
        codeSnippet: {
          title: "Hunter AI with Competitive Rewards",
          language: "csharp",
          code: `public class HunterController : Agent
{
    [Header("Reward")]
    private float _reward = 10f;
    [SerializeField] private float _punishment = -15f;
    [SerializeField] private float _caughtPunishment = 13f;
    
    [Header("Prey")]
    [SerializeField] private GameObject _prey;
    [SerializeField] private AgentController _preyController;
    
    public override void OnEpisodeBegin()
    {
        // Smart positioning to avoid overlaps
        Vector3 hunterPosition = new Vector3(Random.Range(-4f, 4f), 0.3f, Random.Range(-4f, 4f));

        bool distanceGood = _preyController.CheckOverlap(
            _prey.transform.localPosition,
            hunterPosition,
            5f
        );

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
    }
}`
        },
      },
      {
        title: "Zombie Survival Challenge",
        description:
          "This is where things get intense! I've built a zombie apocalypse survival scenario where the AI agent must eliminate waves of zombies using a gun while avoiding getting overwhelmed. The agent learns tactical shooting, movement patterns, and resource management. Zombies spawn continuously and hunt the player using NavMesh pathfinding, creating genuine survival pressure that forces the AI to develop smart combat strategies!",
        codeSnippet: {
          title: "Combat AI with Gun Control & Zombie Detection",
          language: "csharp",
          code: `public class MechAgentController : Agent
{
    [Header("Gun")]
    [SerializeField] private GunController _gunController;
    private bool _canShoot, _hitTarget, _hasShot = false;
    private int _timeUntilNextShot = 0;
    
    [Header("Reward")]
    [SerializeField] private float _rewardForHit = 30f;
    [SerializeField] private float _punishmentForMiss = -1f;
    [SerializeField] private float _rewardForClearingAllZombies = 50f;
    
    [Header("Observation")]
    [SerializeField] private float _zombieDetectionRadius = 15f;
    [SerializeField] private int _maxZombiesToObserve = 5;
    
    public override void CollectObservations(VectorSensor sensor)
    {
        // Agent state
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

        // Add zombie positions relative to agent
        int zombiesToObserve = Mathf.Min(zombieColliders.Count, _maxZombiesToObserve);
        sensor.AddObservation((float)zombiesToObserve / _maxZombiesToObserve);

        for (int i = 0; i < _maxZombiesToObserve; i++)
        {
            if (i < zombiesToObserve)
            {
                Vector3 relativePos = transform.InverseTransformPoint(
                    zombieColliders[i].transform.position
                );
                sensor.AddObservation(relativePos / _zombieDetectionRadius);
            }
            else
            {
                sensor.AddObservation(Vector3.zero);
            }
        }
    }
    
    public override void OnActionReceived(ActionBuffers actions)
    {
        float move_rotation = actions.ContinuousActions[0];
        float move_forward = actions.ContinuousActions[1];
        bool shoot = actions.DiscreteActions[0] > 0;

        // Movement
        _rb.MovePosition(
            transform.position + transform.forward * move_forward * _speed * Time.deltaTime
        );
        transform.Rotate(0f, move_rotation * _rotationSpeed, 0f, Space.Self);

        // Shooting with cooldown
        if (shoot && !_hasShot)
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
}`
        },
      },
      {
        title: "Smart Zombie AI System",
        description:
          "The zombies aren't just mindless drones—they're intelligent hunters! Each zombie uses NavMesh pathfinding to track the agent, has a health system with visual damage feedback, and spawns strategically around the environment. They create realistic threat patterns that force the player agent to develop tactical thinking and situational awareness.",
        codeSnippet: {
          title: "Intelligent Zombie Behavior & Health System",
          language: "csharp",
          code: `[RequireComponent(typeof(NavMeshAgent))]
public class ZombieController : MonoBehaviour
{
    private NavMeshAgent _agent;
    private Transform _target;
    
    [Header("Health System")]
    [SerializeField] private float _maxHealth = 100f;
    private float _currentHealth;
    [SerializeField] private GameObject _damageEffectPrefab;
    [SerializeField] private GameObject _deathEffectPrefab;
    
    private void Awake()
    {
        _agent = GetComponent<NavMeshAgent>();
        _agent.speed = _speed;
        _currentHealth = _maxHealth;
        
        if (_zombieRenderer != null && _zombieRenderer.material != null)
        {
            _originalMaterial = _zombieRenderer.material;
            _originalColor = _originalMaterial.color;
        }
    }
    
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
            yield return wait;
        }
    }
    
    public void TakeDamage(float damage)
    {
        if (_currentHealth <= 0) return;

        _currentHealth -= damage;
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
}`
        },
      },
      {
        title: "Advanced Gun & Combat System",
        description:
          "The combat system features realistic ballistics with raycast shooting, spread mechanics, and visual effects. The gun system includes laser visualization, hit detection for different target types, and damage calculation—creating an engaging combat experience that the AI must master to survive the zombie onslaught!",
        codeSnippet: {
          title: "Precision Gun Control with Visual Effects",
          language: "csharp",
          code: `public class GunController : MonoBehaviour
{
    [Header("Laser Settings")]
    [SerializeField] float _laserDuration = 0.05f;
    [SerializeField] float _laserRange = 600f;
    [SerializeField] LineRenderer _laser_line;
    
    [Header("Gun Statistics")]
    [SerializeField] private float _damage = 25f;
    [SerializeField] private float _spread = 0.02f;
    
    [Header("Visual Effects")]
    [SerializeField] private GameObject _zombieHitEffectPrefab;
    [SerializeField] private GameObject _wallHitEffectPrefab;
    
    public bool ShootGun()
    {
        // Get the agent's transform and shooting direction
        Transform agentTransform = transform.parent;
        Vector3 shotDirection = agentTransform.forward;
        
        // Apply spread for realistic ballistics
        if (_spread > 0)
        {
            shotDirection += new Vector3(
                Random.Range(-_spread, _spread),
                Random.Range(-_spread, _spread),
                Random.Range(-_spread, _spread)
            );
        }

        // Raycast shooting with hit detection
        if (Physics.Raycast(_SpawnPoint.position, shotDirection, out RaycastHit hit, _laserRange))
        {
            _laser_line.SetPosition(0, _SpawnPoint.position);
            _laser_line.SetPosition(1, hit.point);
            _laser_line.enabled = true;

            PlayHitEffect(hit);

            if (hit.collider.CompareTag("Zombie"))
            {
                ZombieController zombie = hit.collider.GetComponent<ZombieController>();
                if (zombie != null)
                {
                    zombie.TakeDamage(_damage);
                }
                StartCoroutine(ShootLaser());
                return true;
            }
            else if (hit.collider.CompareTag("Wall"))
            {
                StartCoroutine(ShootLaser());
                return false;
            }
        }

        StartCoroutine(ShootLaser());
        return false;
    }
    
    private void PlayHitEffect(RaycastHit hit)
    {
        if (hit.collider.CompareTag("Zombie") && _zombieHitEffectPrefab != null)
        {
            GameObject effect = Instantiate(
                _zombieHitEffectPrefab,
                hit.point,
                Quaternion.LookRotation(hit.normal)
            );
            Destroy(effect, 1f);
        }
        else if (hit.collider.CompareTag("Wall") && _wallHitEffectPrefab != null)
        {
            GameObject effect = Instantiate(
                _wallHitEffectPrefab,
                hit.point,
                Quaternion.LookRotation(hit.normal)
            );
            Destroy(effect, 1f);
        }
    }
}`
        },
      },
      {
        title: "Dynamic Environment & Spawning Systems",
        description:
          "The world is alive and constantly changing! I've built sophisticated spawning systems that manage zombie populations, cleanup distant enemies for performance, and create dynamic challenge scaling. The environment responds to AI behavior and maintains optimal challenge levels throughout training sessions.",
        codeSnippet: {
          title: "Intelligent Spawning & Environment Management",
          language: "csharp",
          code: `public class WorldBehaviors : MonoBehaviour
{
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
        if (_spawnPoints.Count <= 0) return;

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

        ZombieController zombie = Instantiate(_zombieController, spawnPosition, Quaternion.identity);

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
        if (_agentController == null) return;

        List<ZombieController> zombiesToRemove = new List<ZombieController>();

        foreach (ZombieController zombie in _zombies)
        {
            if (zombie != null && 
                Vector3.Distance(_agentController.transform.position, zombie.transform.position) > _cleanupDistance)
            {
                zombiesToRemove.Add(zombie);
            }
        }

        if (zombiesToRemove.Count > 0)
        {
            RemoveZombie(zombiesToRemove);
        }
    }
}`
        },
      },
    ]}
    codeSnippet={{
      title: "ML-Agents Training Framework Integration",
      language: "csharp",
      code: `/// <summary>
/// Complete ML-Agents training setup with multiple scenarios
/// Showcasing Jerry pellet collection, Hunter vs Prey, and Zombie survival
/// </summary>
using Unity.MLAgents;
using Unity.MLAgents.Actuators;
using Unity.MLAgents.Sensors;

// Base Agent Controller demonstrating core ML-Agents patterns
public abstract class BaseAgentController : Agent
{
    [Header("Movement")]
    [SerializeField] protected float _speed = 4f;
    [SerializeField] protected float _rotationSpeed = 4f;
    protected Rigidbody _rb;
    
    [Header("Rewards")]
    [SerializeField] protected float _successReward = 10f;
    [SerializeField] protected float _failurePunishment = -15f;
    [SerializeField] protected float _stepPenalty = -0.01f;
    
    [Header("Training")]
    [SerializeField] protected int _maxSteps = 5000;
    [SerializeField] protected float _episodeTimeout = 60f;
    private float _episodeStartTime;
    
    public override void Initialize()
    {
        _rb = GetComponent<Rigidbody>();
        SetupAgent();
    }
    
    public override void OnEpisodeBegin()
    {
        _episodeStartTime = Time.time;
        ResetAgent();
        SetupEnvironment();
    }
    
    public override void CollectObservations(VectorSensor sensor)
    {
        // Core observations all agents need
        sensor.AddObservation(transform.localPosition);
        sensor.AddObservation(transform.forward);
        sensor.AddObservation(_rb.linearVelocity);
        sensor.AddObservation(_rb.angularVelocity);
        
        // Episode progress
        float episodeProgress = (Time.time - _episodeStartTime) / _episodeTimeout;
        sensor.AddObservation(episodeProgress);
        
        // Agent-specific observations
        CollectAgentObservations(sensor);
    }
    
    public override void OnActionReceived(ActionBuffers actions)
    {
        // Universal movement system
        float moveRotate = actions.ContinuousActions[0];
        float moveForward = actions.ContinuousActions[1];
        
        // Physics-based movement
        Vector3 movement = transform.forward * moveForward * _speed * Time.deltaTime;
        _rb.MovePosition(transform.position + movement);
        transform.Rotate(0f, moveRotate * _rotationSpeed, 0f, Space.Self);
        
        // Small step penalty to encourage efficient behavior
        AddReward(_stepPenalty);
        
        // Agent-specific actions
        ProcessAgentActions(actions);
        
        // Check episode termination conditions
        if (Time.time - _episodeStartTime >= _episodeTimeout)
        {
            AddReward(_failurePunishment);
            EndEpisode();
        }
    }
    
    // Abstract methods for different agent types
    protected abstract void SetupAgent();
    protected abstract void ResetAgent();
    protected abstract void SetupEnvironment();
    protected abstract void CollectAgentObservations(VectorSensor sensor);
    protected abstract void ProcessAgentActions(ActionBuffers actions);
    
    // Utility methods for training feedback
    protected void ProvideSuccessReward(string reason = "")
    {
        AddReward(_successReward);
        Debug.Log($"Agent {name} succeeded: {reason}");
    }
    
    protected void ProvideFailureReward(string reason = "")
    {
        AddReward(_failurePunishment);
        Debug.Log($"Agent {name} failed: {reason}");
    }
    
    // Training configuration for different scenarios
    [System.Serializable]
    public class TrainingConfig
    {
        public bool useRaycastSensors = true;
        public bool useTimerPressure = true;
        public bool useCompetitiveTraining = false;
        public float rewardScale = 1f;
        public int observationStackSize = 1;
    }
    
    [SerializeField] protected TrainingConfig _trainingConfig;
}

// Example: Jerry Pellet Collector Implementation
public class JerryAgentController : BaseAgentController
{
    [Header("Pellet Collection")]
    [SerializeField] private Transform _target;
    [SerializeField] private List<GameObject> _pellets;
    private Material _environmentMaterial;
    
    protected override void SetupAgent()
    {
        _environmentMaterial = GetComponent<Renderer>().material;
    }
    
    protected override void ResetAgent()
    {
        transform.localPosition = new Vector3(Random.Range(-4f, 4f), 0.3f, Random.Range(-4f, 4f));
        _environmentMaterial.color = Color.white;
    }
    
    protected override void SetupEnvironment()
    {
        CreatePellets();
    }
    
    protected override void CollectAgentObservations(VectorSensor sensor)
    {
        // Add pellet positions for spatial awareness
        foreach (var pellet in _pellets)
        {
            if (pellet != null)
            {
                Vector3 relativePelletPos = transform.InverseTransformPoint(pellet.transform.position);
                sensor.AddObservation(relativePelletPos);
            }
        }
        
        // Add remaining pellet count
        sensor.AddObservation(_pellets.Count);
    }
    
    protected override void ProcessAgentActions(ActionBuffers actions)
    {
        // Jerry-specific behavior handled in base movement
        // Could add special abilities here
    }
    
    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Pellet"))
        {
            _pellets.Remove(other.gameObject);
            Destroy(other.gameObject);
            ProvideSuccessReward("Pellet collected!");
            
            if (_pellets.Count == 0)
            {
                _environmentMaterial.color = Color.green;
                AddReward(_successReward * 2); // Bonus for completion
                EndEpisode();
            }
        }
        else if (other.CompareTag("Wall"))
        {
            _environmentMaterial.color = Color.red;
            ProvideFailureReward("Hit wall");
            EndEpisode();
        }
    }
}`
    }}
    onModalStateChange={onModalStateChange}
  />
);

export default MLAgent;