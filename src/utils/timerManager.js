// Simple global timer manager to prevent stale timers
class TimerManager {
  constructor() {
    this.timers = new Set();
  }

  addTimer(timerId) {
    this.timers.add(timerId);
    return timerId;
  }

  clearTimer(timerId) {
    if (timerId) {
      clearInterval(timerId);
      this.timers.delete(timerId);
    }
  }

  clearAllTimers() {
    console.log("🧹 Clearing all timers:", this.timers.size);
    this.timers.forEach(timerId => {
      if (timerId) {
        clearInterval(timerId);
      }
    });
    this.timers.clear();
  }
}

// Global singleton
export const timerManager = new TimerManager();

// Cleanup function to call when app shuts down
export const globalTimerCleanup = () => {
  timerManager.clearAllTimers();
};
