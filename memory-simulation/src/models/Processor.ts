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
    this.mmu = new MMU(ram, disk, ram.numFrames); // Initialize MMU with RAM and Disk
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
    if (this.currentProcess || this.readyQueue.length === 0) {
      return; // No scheduling if CPU is busy or queue is empty
    }

    this.currentProcess = this.readyQueue.shift() || null;
    if (this.currentProcess) {
      this.currentProcess.transition(STATES.RUNNING, "Planificador asigna CPU");

      // Simulate memory access (may cause page fault)
      const numPages = this.currentProcess.pages.length;
      if (numPages > 0) {
        const randomPage = Math.floor(Math.random() * numPages);
        try {
          this.currentProcess.simulateMemoryAccess(this.mmu, randomPage);
        } catch (error: unknown) {
          const err = error as Error;
          console.error(
            `Memory access error for process ${this.currentProcess?.pid}: ${err.message}`
          );
          this.currentProcess.transition(
            STATES.BLOCKED,
            "Error de acceso a memoria"
          );
          this.blockedQueue.push(this.currentProcess);
          this.currentProcess = null;
          if (this.autoScheduling) {
            this.schedule();
          }
          return;
        }
      }
    } else {
      return; // No process to schedule
    }

    // Schedule dispatch if auto-scheduling is enabled
    if (this.autoScheduling) {
      setTimeout(() => this.dispatch(), this.quantum);
    }
  }

  // Enable or disable auto-scheduling
  setAutoScheduling(enabled: boolean) {
    this.autoScheduling = enabled;
    if (enabled && !this.currentProcess && this.readyQueue.length > 0) {
      this.schedule(); // Start scheduling if enabled
    }
  }

  // Dispatch the current process (handle time slice or termination)
  dispatch() {
    const p = this.currentProcess;
    if (!p) {
      if (this.autoScheduling) {
        this.schedule();
      }
      return;
    }

    p.remainingTime -= this.quantum;

    if (p.remainingTime <= 0) {
      p.transition(STATES.TERMINATED, "Proceso finalizado");
      this.mmu.freeProcessMemory(p); // Free memory resources
      this.currentProcess = null;
    } else {
      // Check if process should be blocked (e.g., I/O)
      if (p.canBeBlocked() && Math.random() < 0.3) {
        p.transition(STATES.BLOCKED, "Llamada a E/S");
        this.blockedQueue.push(p);
        // Simulate I/O completion
        setTimeout(() => {
          const idx = this.blockedQueue.findIndex((proc) => proc.pid === p.pid);
          if (idx >= 0) {
            this.blockedQueue.splice(idx, 1);
            p.transition(STATES.READY, "E/S completada");
            this.readyQueue.push(p);
            if (this.autoScheduling) {
              this.schedule();
            }
          }
        }, Math.random() * 3000 + 1000); // Random I/O delay (1-4s)
        this.currentProcess = null;
      } else {
        // Quantum expired, return to ready queue
        p.transition(STATES.READY, "Quantum expirado");
        this.readyQueue.push(p);
        this.currentProcess = null;
      }
    }

    if (this.autoScheduling) {
      this.schedule();
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
