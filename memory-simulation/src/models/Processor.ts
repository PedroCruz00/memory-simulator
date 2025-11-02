import { STATES } from "../constants/states";
import { MMU } from "./MMU";
import { RAM } from "./RAM";
import { Disk } from "./Disk";
import { Process } from "./Process";

export class Processor {
  quantum: number;
  readyQueue: Process[];
  blockedQueue: Process[];
  currentProcess: Process | null;
  autoScheduling: boolean;
  mmu: MMU;

  constructor(quantum: number = 2000, ram: RAM, disk: Disk) {
    this.quantum = quantum; // Time slice for scheduling (ms)
    this.readyQueue = []; // Queue of ready processes
    this.blockedQueue = []; // Queue of blocked processes
    this.currentProcess = null; // Currently running process
    this.autoScheduling = false; // Auto-scheduling flag
    this.mmu = new MMU(ram, disk); // Initialize MMU with RAM and Disk
  }

  // Admit a new process to the system
  admitProcess(process: Process) {
    if (!process || typeof process.pid === "undefined") {
      throw new Error("Invalid process provided for admission");
    }
    this.mmu.initializeProcess(process); // Initialize memory pages in MMU
    process.transition(STATES.READY, "Admitido al sistema");
    this.readyQueue.push(process);
  }

  // Schedule the next process to run
  schedule() {
    // Try to unblock processes first
    this.checkBlockedQueue();

    // If there's a current process, continue or finish it
    if (this.currentProcess) {
      const p = this.currentProcess;

      // Simulate execution: decrease remaining time
      p.remainingTime -= 500; // 500ms tick

      // Access memory during execution (simulates work)
      this.simulateMemoryAccess(p);

      // Check if process finished
      if (p.remainingTime <= 0) {
        p.transition(STATES.TERMINATED, "Proceso completado");
        this.mmu.freeProcessMemory(p);
        this.currentProcess = null;

        // Schedule next
        if (this.readyQueue.length > 0) {
          this.schedule();
        }
        return;
      }

      // Random I/O blocking (10% chance - menos bloqueos)
      if (p.canBeBlocked() && Math.random() < 0.1) {
        p.transition(STATES.BLOCKED, "Operación de E/S");
        this.blockedQueue.push(p);
        this.currentProcess = null;

        // Schedule next
        if (this.readyQueue.length > 0) {
          this.schedule();
        }
        return;
      }

      // Context switch (10% chance - quantum expired)
      if (Math.random() < 0.1) {
        p.transition(STATES.READY, "Quantum expirado (context switch)");
        this.readyQueue.push(p);
        this.currentProcess = null;

        // Schedule next
        if (this.readyQueue.length > 0) {
          this.schedule();
        }
        return;
      }

      // Continue with current process
      return;
    }

    // No current process, get next from ready queue
    if (this.readyQueue.length === 0) {
      return; // Nothing to do
    }

    // Get next process from ready queue
    const nextProcess = this.readyQueue.shift();
    if (!nextProcess) return;

    this.currentProcess = nextProcess;
    nextProcess.transition(STATES.RUNNING, "Asignado a CPU");

    // Initial memory access
    this.simulateMemoryAccess(nextProcess);
  }

  // Helper: Simulate memory access for a process
  private simulateMemoryAccess(process: Process) {
    const numPages = process.pages.length;
    if (numPages === 0) return;

    const randomPage = Math.floor(Math.random() * numPages);
    try {
      process.simulateMemoryAccess(this.mmu, randomPage);
    } catch {
      // Silently handle memory errors
      console.warn(`Memory access warning for PID ${process.pid}`);
    }
  }

  // Helper: Check and unblock processes
  private checkBlockedQueue() {
    if (this.blockedQueue.length === 0) return;

    // Unblock processes with 60% chance each tick (más probabilidad)
    const toUnblock: Process[] = [];

    this.blockedQueue.forEach((p) => {
      if (Math.random() < 0.6) {
        toUnblock.push(p);
      }
    });

    toUnblock.forEach((p) => {
      const index = this.blockedQueue.indexOf(p);
      if (index >= 0) {
        this.blockedQueue.splice(index, 1);
        p.transition(STATES.READY, "E/S completada");
        this.readyQueue.push(p);
      }
    });
  }

  // Enable or disable auto-scheduling
  setAutoScheduling(enabled: boolean) {
    this.autoScheduling = enabled;
    if (enabled && !this.currentProcess && this.readyQueue.length > 0) {
      this.schedule(); // Start scheduling if enabled
    }
  }

  // Manually transition a process to a new state
  manualTransition(process: Process, newState: string, reason: string) {
    if (!process || !this.mmu.pageTable.has(process.pid)) {
      throw new Error(
        `Invalid process or no page table for PID ${process?.pid}`
      );
    }

    const oldState = process.state;

    // Remove from previous queues
    if (oldState === STATES.READY) {
      this.readyQueue = this.readyQueue.filter((p) => p.pid !== process.pid);
    } else if (oldState === STATES.BLOCKED) {
      this.blockedQueue = this.blockedQueue.filter(
        (p) => p.pid !== process.pid
      );
    } else if (
      oldState === STATES.RUNNING &&
      this.currentProcess?.pid === process.pid
    ) {
      this.currentProcess = null;
    }

    // Perform state transition
    process.transition(newState, reason);

    // Add to new queues or set as current process
    if (newState === STATES.READY) {
      if (!this.readyQueue.find((p) => p.pid === process.pid)) {
        this.readyQueue.push(process);
      }
    } else if (newState === STATES.BLOCKED) {
      if (!this.blockedQueue.find((p) => p.pid === process.pid)) {
        this.blockedQueue.push(process);
      }
    } else if (newState === STATES.RUNNING) {
      if (!this.currentProcess) {
        this.currentProcess = process;
        // Simulate memory access for running process (as it's now executing)
        const numPages = process.pages.length;
        if (numPages > 0) {
          const randomPage = Math.floor(Math.random() * numPages);
          try {
            process.simulateMemoryAccess(this.mmu, randomPage);
          } catch (error) {
            const err = error as Error;
            console.error(
              `Memory access error for process ${process.pid}: ${err.message}`
            );
            process.transition(STATES.BLOCKED, "Error de acceso a memoria");
            this.blockedQueue.push(process);
            this.currentProcess = null;
            if (this.autoScheduling) {
              this.schedule();
            }
            return;
          }
        }
      } else {
        throw new Error("CPU is already occupied");
      }
    } else if (newState === STATES.TERMINATED) {
      this.mmu.freeProcessMemory(process); // Free memory on termination
    }

    if (this.autoScheduling && !this.currentProcess) {
      this.schedule();
    }
  }
}
