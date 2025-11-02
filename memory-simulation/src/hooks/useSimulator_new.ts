import { useState, useCallback, useRef, useEffect } from "react";
import { Processor } from "../models/Processor";
import { RAM } from "../models/RAM";
import { Disk } from "../models/Disk";
import { Process } from "../models/Process";

export interface SimulatorConfig {
  ramFrames: number;
  pageSize: number;
  processorQuantum: number;
  maxProcesses: number;
  autoScheduling: boolean;
}

export interface SimulatorState {
  processor: Processor | null;
  processes: Process[];
  ram: RAM | null;
  disk: Disk | null;
  currentTime: number;
  isRunning: boolean;
  config: SimulatorConfig;
}

const DEFAULT_CONFIG: SimulatorConfig = {
  ramFrames: 16,
  pageSize: 4096,
  processorQuantum: 2000,
  maxProcesses: 10,
  autoScheduling: false,
};

export const useSimulator = () => {
  const [state, setState] = useState<SimulatorState>({
    processor: null,
    processes: [],
    ram: null,
    disk: null,
    currentTime: 0,
    isRunning: false,
    config: DEFAULT_CONFIG,
  });

  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // Inicializar el simulador con configuración
  const initializeSimulator = useCallback(
    (config: Partial<SimulatorConfig>) => {
      const newConfig = { ...DEFAULT_CONFIG, ...config };

      // Create RAM instance
      const ram = new RAM(newConfig.ramFrames, newConfig.pageSize);

      // Create Disk instance
      const disk = new Disk();

      // Create Processor with quantum (order: quantum, ram, disk)
      const processor = new Processor(newConfig.processorQuantum, ram, disk);

      setState((prev) => ({
        ...prev,
        processor,
        ram,
        disk,
        config: newConfig,
        processes: [],
        currentTime: 0,
        isRunning: false,
      }));
    },
    []
  );

  // Agregar un nuevo proceso
  const addProcess = useCallback(
    (canBeBlocked: boolean = false, memorySize?: number) => {
      setState((prev) => {
        if (!prev.processor) return prev;

        const newProcess = new Process(
          prev.processes.length + 1,
          canBeBlocked,
          memorySize
        );

        // Add process to processor
        prev.processor.admitProcess(newProcess);

        return {
          ...prev,
          processes: [...prev.processes, newProcess],
        };
      });
    },
    []
  );

  // Iniciar la simulación con ciclo automático
  const startSimulation = useCallback(() => {
    setState((prev) => {
      if (!prev.processor) return prev;

      // Clear existing interval if any
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }

      // Start new simulation loop
      simulationIntervalRef.current = setInterval(() => {
        setState((current) => {
          if (!current.processor || !current.isRunning) return current;

          // Execute one scheduling cycle
          current.processor.schedule();

          return {
            ...current,
            currentTime: current.currentTime + 1,
            processes: [...current.processes], // Force re-render
          };
        });
      }, 500); // Execute every 500ms

      prev.processor.setAutoScheduling(true);
      return { ...prev, isRunning: true };
    });
  }, []);

  // Pausar la simulación
  const pauseSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    setState((prev) => {
      if (!prev.processor) return prev;
      prev.processor.setAutoScheduling(false);
      return { ...prev, isRunning: false };
    });
  }, []);

  // Realizar un paso manual en la simulación
  const stepSimulation = useCallback(() => {
    setState((prev) => {
      if (!prev.processor) return prev;
      prev.processor.schedule();
      return {
        ...prev,
        currentTime: prev.currentTime + 1,
        processes: [...prev.processes], // Force re-render
      };
    });
  }, []);

  // Reiniciar la simulación
  const resetSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      processes: [],
      currentTime: 0,
      isRunning: false,
      processor: null,
      ram: null,
      disk: null,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  return {
    state,
    initializeSimulator,
    addProcess,
    startSimulation,
    pauseSimulation,
    stepSimulation,
    resetSimulation,
  };
};
