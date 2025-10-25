import { useState, useCallback, useRef } from "react";
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
      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      const ram = new RAM(finalConfig.ramFrames, finalConfig.pageSize);
      const disk = new Disk();
      const processor = new Processor(finalConfig.processorQuantum, ram, disk);

      setState((prev) => ({
        ...prev,
        ram,
        disk,
        processor,
        config: finalConfig,
        processes: [],
        currentTime: 0,
        isRunning: false,
      }));
    },
    []
  );

  // Crear y admitir un nuevo proceso
  const addProcess = useCallback(
    (canBeBlocked: boolean = false, memorySize?: number) => {
      setState((prev) => {
        if (
          !prev.processor ||
          prev.processes.length >= prev.config.maxProcesses
        ) {
          return prev;
        }

        const newProcess = new Process(
          prev.processes.length,
          canBeBlocked,
          memorySize
        );
        prev.processor.admitProcess(newProcess);

        return {
          ...prev,
          processes: [...prev.processes, newProcess],
        };
      });
    },
    []
  );

  // Iniciar la simulación
  const startSimulation = useCallback(() => {
    setState((prev) => {
      if (!prev.processor) return prev;
      prev.processor.setAutoScheduling(true);
      return { ...prev, isRunning: true };
    });
  }, []);

  // Pausar la simulación
  const pauseSimulation = useCallback(() => {
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
      return { ...prev, currentTime: prev.currentTime + 1 };
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
