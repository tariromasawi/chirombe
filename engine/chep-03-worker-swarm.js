/* ============================================================
   CHIROMBE AUTONOMOUS EVOLUTION ENGINE
   WORKER SWARM / TASK ORCHESTRATION ENGINE — PART 03 / 10
   Version: 1.0.0
   Protocol: CHEP-03
   ============================================================ */

(() => {
  "use strict";

  const CORE = globalThis.CHIROMBE;
  const MEMORY = globalThis.CHIROMBE_MEMORY;

  if (!CORE) {
    console.error(
      "[CHIROMBE WORKERS] CORE KERNEL NOT FOUND."
    );
    return;
  }

  const ENGINE = {
    name: "CHIROMBE_WORKER_SWARM",
    version: "1.0.0",
    protocol: "CHEP-03",

    workers: new Map(),
    jobs: new Map(),
    lanes: new Map(),
    schedules: new Map(),

    configuration: {
      maxWorkers: 64,
      maxJobs: 5000,
      defaultTimeout: 30000,
      retryLimit: 3,
      heartbeat: 10000,
      concurrency: 4,
      autonomous: true,
      safeExecution: true
    },

    statistics: {
      submitted: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      retried: 0,
      timedOut: 0,
      recovered: 0
    }
  };

  /* ============================================================
     BASIC UTILITIES
     ============================================================ */

  const now = () => Date.now();

  const id = (prefix = "x") =>
    prefix + "_" +
    Date.now().toString(36) +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 10);

  const clone = value => {
    try {
      return JSON.parse(
        JSON.stringify(value)
      );
    } catch {
      return value;
    }
  };

  const sleep = ms =>
    new Promise(resolve =>
      setTimeout(resolve, ms)
    );

  /* ============================================================
     WORKER STATE MODEL
     ============================================================ */

  function createWorker(
    name,
    handler,
    options = {}
  ) {

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      throw new Error(
        "Worker requires a name."
      );
    }

    if (
      typeof handler !== "function"
    ) {
      throw new Error(
        "Worker requires a function."
      );
    }

    if (
      ENGINE.workers.size >=
      ENGINE.configuration.maxWorkers
    ) {
      throw new Error(
        "Maximum worker capacity reached."
      );
    }

    const worker = {
      id: id("worker"),
      name: name.trim(),
      handler,

      status: "IDLE",

      priority:
        Number(options.priority || 0),

      lane:
        options.lane || "GENERAL",

      description:
        options.description || "",

      capabilities:
        Array.isArray(
          options.capabilities
        )
          ? options.capabilities
          : [],

      registered:
        now(),

      lastActivity:
        null,

      jobsStarted: 0,
      jobsCompleted: 0,
      jobsFailed: 0,
      jobsTimedOut: 0,

      retries: 0,

      enabled:
        options.enabled !== false,

      autonomous:
        options.autonomous !== false
    };

    ENGINE.workers.set(
      worker.name,
      worker
    );

    ensureLane(worker.lane);

    CORE.emit(
      "worker_swarm:registered",
      {
        id: worker.id,
        name: worker.name,
        lane: worker.lane
      }
    );

    return worker;
  }

  function removeWorker(name) {

    const worker =
      ENGINE.workers.get(name);

    if (!worker) return false;

    worker.enabled = false;
    worker.status = "REMOVED";

    ENGINE.workers.delete(name);

    CORE.emit(
      "worker_swarm:removed",
      { name }
    );

    return true;
  }

  /* ============================================================
     LANES
     ============================================================ */

  function ensureLane(name) {

    if (!ENGINE.lanes.has(name)) {

      ENGINE.lanes.set(
        name,
        {
          name,
          queue: [],
          active: 0,
          completed: 0,
          failed: 0,
          created: now()
        }
      );
    }

    return ENGINE.lanes.get(name);
  }

  /* ============================================================
     JOB CREATION
     ============================================================ */

  function submit(
    workerName,
    payload = {},
    options = {}
  ) {

    if (
      ENGINE.jobs.size >=
      ENGINE.configuration.maxJobs
    ) {
      throw new Error(
        "Job history capacity reached."
      );
    }

    const worker =
      ENGINE.workers.get(
        workerName
      );

    if (!worker) {
      throw new Error(
        "Unknown worker: " +
        workerName
      );
    }

    if (!worker.enabled) {
      throw new Error(
        "Worker disabled: " +
        workerName
      );
    }

    const job = {

      id: id("job"),

      worker:
        workerName,

      lane:
        options.lane ||
        worker.lane,

      payload:
        clone(payload),

      priority:
        Number(
          options.priority ??
          worker.priority ??
          0
        ),

      created:
        now(),

      started:
        null,

      completed:
        null,

      status:
        "QUEUED",

      attempts:
        0,

      maxRetries:
        Number(
          options.maxRetries ??
          ENGINE.configuration.retryLimit
        ),

      timeout:
        Number(
          options.timeout ??
          ENGINE.configuration.defaultTimeout
        ),

      dependencies:
        Array.isArray(
          options.dependencies
        )
          ? options.dependencies
          : [],

      result:
        null,

      error:
        null,

      metadata:
        clone(
          options.metadata || {}
        )
    };

    ENGINE.jobs.set(
      job.id,
      job
    );

    const lane =
      ensureLane(job.lane);

    lane.queue.push(job.id);

    ENGINE.statistics.submitted++;

    sortLane(lane);

    CORE.emit(
      "worker_swarm:job_submitted",
      {
        id: job.id,
        worker: workerName,
        lane: job.lane
      }
    );

    return job.id;
  }

  function sortLane(lane) {

    lane.queue.sort(
      (a, b) => {

        const A =
          ENGINE.jobs.get(a);

        const B =
          ENGINE.jobs.get(b);

        return (
          (B?.priority || 0) -
          (A?.priority || 0)
        );
      }
    );
  }

  /* ============================================================
     DEPENDENCY CHECKING
     ============================================================ */

  function dependenciesComplete(job) {

    if (!job.dependencies.length) {
      return true;
    }

    return job.dependencies.every(
      dependencyId => {

        const dependency =
          ENGINE.jobs.get(
            dependencyId
          );

        return (
          dependency &&
          dependency.status ===
            "COMPLETED"
        );
      }
    );
  }

  function dependencyFailed(job) {

    return job.dependencies.some(
      dependencyId => {

        const dependency =
          ENGINE.jobs.get(
            dependencyId
          );

        return (
          dependency &&
          (
            dependency.status ===
              "FAILED" ||
            dependency.status ===
              "CANCELLED"
          )
        );
      }
    );
  }

  /* ============================================================
     SAFE EXECUTION WRAPPER
     ============================================================ */

  async function execute(
    job
  ) {

    const worker =
      ENGINE.workers.get(
        job.worker
      );

    if (!worker) {
      throw new Error(
        "Worker disappeared."
      );
    }

    if (!worker.enabled) {
      throw new Error(
        "Worker disabled."
      );
    }

    job.status = "RUNNING";
    job.started = now();
    job.attempts++;

    worker.status = "RUNNING";
    worker.lastActivity = now();
    worker.jobsStarted++;

    const lane =
      ENGINE.lanes.get(
        job.lane
      );

    if (lane) {
      lane.active++;
    }

    CORE.emit(
      "worker_swarm:job_started",
      {
        id: job.id,
        worker: job.worker
      }
    );

    let timer = null;

    try {

      const taskPromise =
        Promise.resolve(
          worker.handler(
            clone(job.payload),
            {
              job: clone(job),
              worker: clone({
                id: worker.id,
                name: worker.name,
                lane: worker.lane,
                capabilities:
                  worker.capabilities
              }),
              core: CORE,
              memory: MEMORY || null
            }
          )
        );

      const timeoutPromise =
        new Promise(
          (_, reject) => {

            timer =
              setTimeout(
                () => {

                  ENGINE.statistics
                    .timedOut++;

                  worker.jobsTimedOut++;

                  reject(
                    new Error(
                      "WORKER_TIMEOUT"
                    )
                  );

                },
                job.timeout
              );
          }
        );

      const result =
        await Promise.race([
          taskPromise,
          timeoutPromise
        ]);

      if (timer) {
        clearTimeout(timer);
      }

      job.result =
        clone(result);

      job.completed =
        now();

      job.status =
        "COMPLETED";

      worker.jobsCompleted++;
      worker.status = "IDLE";

      ENGINE.statistics
        .completed++;

      if (lane) {
        lane.active =
          Math.max(
            0,
            lane.active - 1
          );

        lane.completed++;
      }

      CORE.emit(
        "worker_swarm:job_completed",
        {
          id: job.id,
          worker: job.worker,
          result: clone(result)
        }
      );

      persistJob(job);

      return result;

    } catch (error) {

      if (timer) {
        clearTimeout(timer);
      }

      job.error =
        String(error);

      worker.jobsFailed++;

      worker.status = "IDLE";

      if (lane) {
        lane.active =
          Math.max(
            0,
            lane.active - 1
          );

        lane.failed++;
      }

      if (
        job.attempts <=
        job.maxRetries
      ) {

        job.status =
          "RETRY_PENDING";

        worker.retries++;

        ENGINE.statistics
          .retried++;

        CORE.emit(
          "worker_swarm:retry",
          {
            id: job.id,
            attempt:
              job.attempts,
            maxRetries:
              job.maxRetries
          }
        );

        await sleep(
          Math.min(
            5000,
            500 *
              Math.pow(
                2,
                job.attempts - 1
              )
          )
        );

        return execute(job);
      }

      job.status =
        "FAILED";

      ENGINE.statistics
        .failed++;

      CORE.emit(
        "worker_swarm:job_failed",
        {
          id: job.id,
          worker: job.worker,
          error: job.error
        }
      );

      persistJob(job);

      throw error;
    }
  }

  /* ============================================================
     QUEUE DISPATCHER
     ============================================================ */

  async function dispatchLane(
    lane
  ) {

    if (!lane) return;

    while (
      lane.active <
      ENGINE.configuration.concurrency
    ) {

      let selected = null;

      for (
        const jobId
        of lane.queue
      ) {

        const job =
          ENGINE.jobs.get(
            jobId
          );

        if (!job) continue;

        if (
          job.status !==
          "QUEUED"
        ) {
          continue;
        }

        if (
          dependencyFailed(job)
        ) {

          job.status =
            "CANCELLED";

          ENGINE.statistics
            .cancelled++;

          continue;
        }

        if (
          !dependenciesComplete(job)
        ) {
          continue;
        }

        selected = job;
        break;
      }

      if (!selected) break;

      lane.queue =
        lane.queue.filter(
          id =>
            id !== selected.id
        );

      execute(selected)
        .catch(() => {})
        .finally(() => {
          setTimeout(
            () => dispatchLane(lane),
            0
          );
        });
    }
  }

  async function dispatch() {

    for (
      const lane
      of ENGINE.lanes.values()
    ) {
      await dispatchLane(lane);
    }
  }

  /* ============================================================
     JOB CONTROL
     ============================================================ */

  function cancel(jobId) {

    const job =
      ENGINE.jobs.get(jobId);

    if (!job) return false;

    if (
      job.status ===
        "COMPLETED" ||
      job.status ===
        "FAILED"
    ) {
      return false;
    }

    job.status =
      "CANCELLED";

    ENGINE.statistics
      .cancelled++;

    CORE.emit(
      "worker_swarm:cancelled",
      { id: jobId }
    );

    return true;
  }

  function getJob(jobId) {

    const job =
      ENGINE.jobs.get(
        jobId
      );

    return job
      ? clone(job)
      : null;
  }

  /* ============================================================
     PERSISTENT JOB RECORD
     ============================================================ */

  function persistJob(job) {

    if (
      !MEMORY ||
      typeof MEMORY.write !==
        "function"
    ) {
      return;
    }

    try {

      MEMORY.write(
        "WORKERS",
        "job_" + job.id,
        {
          id: job.id,
          worker: job.worker,
          lane: job.lane,
          status: job.status,
          attempts: job.attempts,
          created: job.created,
          started: job.started,
          completed: job.completed,
          result: job.result,
          error: job.error
        },
        {
          type: "worker_job",
          protocol:
            ENGINE.protocol
        }
      );

    } catch (error) {

      console.warn(
        "[CHIROMBE WORKERS] Memory persistence failed:",
        error
      );
    }
  }

  /* ============================================================
     SCHEDULER
     ============================================================ */

  function schedule(
    workerName,
    payload,
    interval,
    options = {}
  ) {

    const scheduleId =
      id("schedule");

    const delay =
      Math.max(
        1000,
        Number(interval)
      );

    const timer =
      setInterval(
        () => {

          try {

            submit(
              workerName,
              payload,
              options
            );

            dispatch();

          } catch (error) {

            CORE.emit(
              "worker_swarm:schedule_error",
              {
                scheduleId,
                error:
                  String(error)
              }
            );
          }

        },
        delay
      );

    ENGINE.schedules.set(
      scheduleId,
      {
        id: scheduleId,
        worker: workerName,
        interval: delay,
        timer,
        created: now()
      }
    );

    CORE.emit(
      "worker_swarm:scheduled",
      {
        scheduleId,
        worker: workerName,
        interval: delay
      }
    );

    return scheduleId;
  }

  function unschedule(
    scheduleId
  ) {

    const item =
      ENGINE.schedules.get(
        scheduleId
      );

    if (!item) return false;

    clearInterval(
      item.timer
    );

    ENGINE.schedules.delete(
      scheduleId
    );

    return true;
  }

  /* ============================================================
     SYSTEM WORKERS
     ============================================================ */

  createWorker(
    "SWARM_HEALTH",
    async () => {

      const workers =
        Array.from(
          ENGINE.workers.values()
        );

      return {
        healthy: workers
          .filter(
            w =>
              w.enabled &&
              w.status !==
                "ERROR"
          ).length,

        total:
          workers.length,

        jobs:
          ENGINE.jobs.size,

        queue:
          Array.from(
            ENGINE.lanes.values()
          ).reduce(
            (total, lane) =>
              total +
              lane.queue.length,
            0
          )
      };

    },
    {
      lane: "SYSTEM",
      priority: 100,
      capabilities: [
        "diagnostics",
        "health"
      ]
    }
  );

  createWorker(
    "SWARM_DISPATCH",
    async () => {

      await dispatch();

      return {
        dispatched: true,
        timestamp: now()
      };

    },
    {
      lane: "SYSTEM",
      priority: 90,
      capabilities: [
        "orchestration"
      ]
    }
  );

  createWorker(
    "SWARM_MEMORY_COMMIT",
    async payload => {

      if (
        !MEMORY ||
        typeof MEMORY.write !==
          "function"
      ) {
        return {
          stored: false,
          reason:
            "MEMORY_ENGINE_UNAVAILABLE"
        };
      }

      const key =
        payload?.key ||
        id("memory");

      const value =
        payload?.value ??
        {};

      const result =
        await MEMORY.write(
          "WORKERS",
          key,
          value,
          {
            source:
              "WORKER_SWARM"
          }
        );

      return {
        stored: true,
        record:
          result
      };

    },
    {
      lane: "MEMORY",
      priority: 80,
      capabilities: [
        "memory",
        "persistence"
      ]
    }
  );

  /* ============================================================
     AUTONOMOUS DISPATCH CYCLE
     ============================================================ */

  let heartbeat = null;

  function start() {

    if (heartbeat) {
      clearInterval(
        heartbeat
      );
    }

    heartbeat =
      setInterval(
        () => {

          dispatch()
            .catch(error =>
              CORE.emit(
                "worker_swarm:dispatcher_error",
                {
                  error:
                    String(error)
                }
              )
            );

        },
        ENGINE.configuration
          .heartbeat
      );

    CORE.emit(
      "worker_swarm:online",
      {
        workers:
          ENGINE.workers.size
      }
    );
  }

  function stop() {

    if (heartbeat) {
      clearInterval(
        heartbeat
      );

      heartbeat = null;
    }

    CORE.emit(
      "worker_swarm:stopped",
      {}
    );
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  const API = {

    name:
      ENGINE.name,

    version:
      ENGINE.version,

    createWorker,

    removeWorker,

    submit,

    dispatch,

    cancel,

    getJob,

    schedule,

    unschedule,

    start,

    stop,

    workers() {

      return Array.from(
        ENGINE.workers.values()
      ).map(
        worker => ({
          id: worker.id,
          name: worker.name,
          status: worker.status,
          lane: worker.lane,
          enabled:
            worker.enabled,
          jobsStarted:
            worker.jobsStarted,
          jobsCompleted:
            worker.jobsCompleted,
          jobsFailed:
            worker.jobsFailed,
          retries:
            worker.retries
        })
      );
    },

    jobs() {

      return Array.from(
        ENGINE.jobs.values()
      ).map(clone);
    },

    lanes() {

      return Array.from(
        ENGINE.lanes.values()
      ).map(
        lane => ({
          name: lane.name,
          queued:
            lane.queue.length,
          active:
            lane.active,
          completed:
            lane.completed,
          failed:
            lane.failed
        })
      );
    },

    schedules() {

      return Array.from(
        ENGINE.schedules.values()
      ).map(
        item => ({
          id: item.id,
          worker: item.worker,
          interval:
            item.interval,
          created:
            item.created
        })
      );
    },

    statistics() {

      return {
        ...clone(
          ENGINE.statistics
        ),

        workers:
          ENGINE.workers.size,

        jobs:
          ENGINE.jobs.size,

        lanes:
          ENGINE.lanes.size,

        schedules:
          ENGINE.schedules.size
      };
    }
  };

  /* ============================================================
     REGISTER MODULE
     ============================================================ */

  globalThis.CHIROMBE_WORKERS =
    API;

  CORE.registerModule(
    "WORKER_SWARM",
    API,
    {
      version:
        ENGINE.version,

      protocol:
        ENGINE.protocol,

      purpose:
        "Parallel task execution, worker management, retries, scheduling and orchestration"
    }
  );

  /* ============================================================
     BOOT
     ============================================================ */

  start();

  console.log(
    "[CHIROMBE WORKERS] Worker Swarm ONLINE."
  );

})();