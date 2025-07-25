// Timer worker for background operation
class TimerWorker {
  private worker: Worker | null = null;
  private callbacks: Map<string, (data: any) => void> = new Map();

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.initializeWorker();
    }
  }

  private initializeWorker() {
    // Create worker from inline script to avoid external file dependency
    const workerScript = `
      let timerId = null;
      let startTime = null;
      let duration = 0;
      let paused = false;
      let pausedTime = 0;

      self.onmessage = function(e) {
        const { type, payload } = e.data;
        
        switch (type) {
          case 'START':
            startTime = Date.now() - (payload.elapsed || 0);
            duration = payload.duration;
            paused = false;
            pausedTime = 0;
            startTimer();
            break;
            
          case 'PAUSE':
            paused = true;
            pausedTime = Date.now();
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
            break;
            
          case 'RESUME':
            if (paused && pausedTime) {
              const pauseDuration = Date.now() - pausedTime;
              startTime += pauseDuration;
              paused = false;
              startTimer();
            }
            break;
            
          case 'STOP':
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
            startTime = null;
            paused = false;
            break;
        }
      };

      function startTimer() {
        if (timerId) {
          clearInterval(timerId);
        }
        
        timerId = setInterval(() => {
          if (paused) return;
          
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, duration - elapsed);
          
          self.postMessage({
            type: 'TICK',
            payload: {
              elapsed: Math.floor(elapsed / 1000),
              remaining: Math.floor(remaining / 1000),
              completed: remaining <= 0
            }
          });
          
          if (remaining <= 0) {
            clearInterval(timerId);
            timerId = null;
            self.postMessage({
              type: 'COMPLETE',
              payload: { duration: Math.floor(duration / 1000) }
            });
          }
        }, 1000);
      }
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));

    this.worker.onmessage = (e) => {
      const { type, payload } = e.data;
      const callback = this.callbacks.get(type);
      if (callback) {
        callback(payload);
      }
    };
  }

  public startTimer(duration: number, elapsed: number = 0) {
    if (this.worker) {
      this.worker.postMessage({
        type: 'START',
        payload: { duration: duration * 1000, elapsed: elapsed * 1000 }
      });
    }
  }

  public pauseTimer() {
    if (this.worker) {
      this.worker.postMessage({ type: 'PAUSE' });
    }
  }

  public resumeTimer() {
    if (this.worker) {
      this.worker.postMessage({ type: 'RESUME' });
    }
  }

  public stopTimer() {
    if (this.worker) {
      this.worker.postMessage({ type: 'STOP' });
    }
  }

  public onTick(callback: (data: { elapsed: number; remaining: number; completed: boolean }) => void) {
    this.callbacks.set('TICK', callback);
  }

  public onComplete(callback: (data: { duration: number }) => void) {
    this.callbacks.set('COMPLETE', callback);
  }

  public destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.callbacks.clear();
  }
}

// Singleton instance
let timerWorkerInstance: TimerWorker | null = null;

export function getTimerWorker(): TimerWorker {
  if (!timerWorkerInstance) {
    timerWorkerInstance = new TimerWorker();
  }
  return timerWorkerInstance;
}

export function destroyTimerWorker() {
  if (timerWorkerInstance) {
    timerWorkerInstance.destroy();
    timerWorkerInstance = null;
  }
}
