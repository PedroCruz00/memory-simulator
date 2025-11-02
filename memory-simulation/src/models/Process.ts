import { STATES, VALID_TRANSITIONS } from "../constants/states";
import { PROCESS_COLORS } from "../constants/colors";
import type { Page } from "./MMU";
import type { MMU } from "./MMU";

export interface TransitionInfo {
  pid: number;
  from: string;
  to: string;
  reason: string;
  timestamp: Date;
  timeInState: number;
}

export class Process {
  pid: number;
  state: string;
  priority: number;
  pc: number;
  registers: { AX: number; BX: number; CX: number };
  systemCalls: string[];
  canBeBlockedFlag: boolean;
  remainingTime: number;
  memorySize: number;
  pages: Page[];
  color: string;
  stateHistory: Array<{
    state: string;
    timestamp: Date;
    reason: string;
    timeInPreviousState?: number;
  }>;
  stateStartTime: Date;
  onTransition: ((info: TransitionInfo) => void) | null;

  constructor(
    pid: number,
    canBeBlocked: boolean = false,
    memorySize: number = Math.floor(Math.random() * 32768) + 4096
  ) {
    this.pid = pid; // Unique process ID
    this.state = STATES.NEW; // Initial state
    this.priority = Math.floor(Math.random() * 10) + 1; // Random priority (1-10)
    this.pc = Math.floor(Math.random() * 1000); // Program counter
    this.registers = {
      AX: Math.floor(Math.random() * 255),
      BX: Math.floor(Math.random() * 255),
      CX: Math.floor(Math.random() * 255),
    }; // Simulated registers
    this.systemCalls = []; // Track system calls
    this.canBeBlockedFlag = canBeBlocked; // Whether process can be blocked
    this.remainingTime = Math.floor(Math.random() * 6000) + 4000; // CPU time (4-10s) - tiempo moderado para observar el ciclo completo
    this.memorySize = memorySize; // Memory size in bytes (4KB-36KB)
    this.pages = []; // Array of Page objects (initialized by MMU)
    this.color = PROCESS_COLORS[pid % PROCESS_COLORS.length]; // Assign color based on PID

    this.stateHistory = [
      {
        state: STATES.NEW,
        timestamp: new Date(),
        reason: "Proceso creado",
      },
    ]; // Track state changes
    this.stateStartTime = new Date(); // Time of current state start
    this.onTransition = null; // Callback for UI updates
  }

  // Transition to a new state with validation
  transition(newState: string, reason: string = "") {
    const currentState = this.state;
    if (!VALID_TRANSITIONS[currentState].includes(newState)) {
      throw new Error(`Transición inválida: ${currentState} → ${newState}`);
    }

    const now = new Date();
    const timeInCurrentState = now.getTime() - this.stateStartTime.getTime();

    this.state = newState;
    this.stateStartTime = now;
    this.stateHistory.push({
      state: newState,
      timestamp: now,
      reason: reason || "Cambio automático",
      timeInPreviousState: timeInCurrentState,
    });

    // Log system calls for specific states
    if (newState === STATES.RUNNING) {
      this.systemCalls.push(`exec() - ${now.toLocaleTimeString()}`);
    } else if (newState === STATES.BLOCKED) {
      this.systemCalls.push(`I/O wait - ${now.toLocaleTimeString()}`);
    }

    // Notify UI via callback
    if (this.onTransition) {
      this.onTransition({
        pid: this.pid,
        from: currentState,
        to: newState,
        reason,
        timestamp: now,
        timeInState: timeInCurrentState,
      });
    }
  }

  // Check if process can be blocked
  canBeBlocked(): boolean {
    return this.canBeBlockedFlag;
  }

  // Get time spent in current state
  getTimeInCurrentState(): number {
    return new Date().getTime() - this.stateStartTime.getTime();
  }

  // Compute statistics for each state
  getStats(): Record<string, { totalTime: number; count: number }> {
    const stateStats: Record<string, { totalTime: number; count: number }> = {};
    Object.values(STATES).forEach((state) => {
      stateStats[state] = {
        totalTime: 0,
        count: 0,
      };
    });

    this.stateHistory.forEach((entry, index) => {
      stateStats[entry.state].count++;
      if (entry.timeInPreviousState) {
        const prevState = this.stateHistory[index - 1]?.state;
        if (prevState) {
          stateStats[prevState].totalTime += entry.timeInPreviousState;
        }
      }
    });

    return stateStats;
  }

  // Simulate memory access for a specific page
  simulateMemoryAccess(mmu: MMU, pageNumber: number) {
    if (pageNumber >= this.pages.length || pageNumber < 0) {
      throw new Error(
        `Invalid page number ${pageNumber} for process ${this.pid}`
      );
    }
    
    try {
      // Try to access memory
      mmu.accessMemory(this, pageNumber);
    } catch (error) {
      // Page fault occurred, handle it
      const err = error as Error;
      if (err.message.includes("Page fault")) {
        // Handle the page fault by loading the page into RAM
        mmu.handlePageFault(this, pageNumber);
      } else {
        // Re-throw if it's a different error
        throw error;
      }
    }
  }

  // Added: Get summary of page locations (for debugging or UI)
  getMemoryLocationSummary(mmu: MMU) {
    const processPageTable = mmu.pageTable.get(this.pid);
    if (!processPageTable) return { inRAM: 0, inDisk: 0 };
    let inRAM = 0;
    let inDisk = 0;
    processPageTable.forEach((location: number | "disk") => {
      if (typeof location === "number") inRAM++;
      else if (location === "disk") inDisk++;
    });
    return { inRAM, inDisk, totalPages: processPageTable.size };
  }
}
