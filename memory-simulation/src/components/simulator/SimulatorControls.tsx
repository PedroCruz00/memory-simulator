import React, { useState } from "react";
import type { SimulatorConfig } from "../../hooks/useSimulator";
import "../../styles/SimulatorControls.css";

interface SimulatorControlsProps {
  config: SimulatorConfig;
  onConfigChange: (config: Partial<SimulatorConfig>) => void;
  onInitialize: () => void;
  onAddProcess: () => void;
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  isRunning: boolean;
  processCount: number;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  config,
  onConfigChange,
  onInitialize,
  onAddProcess,
  onStart,
  onPause,
  onStep,
  onReset,
  isRunning,
  processCount,
}) => {
  const [memorySize, setMemorySize] = useState<number>(8192);
  const [canBeBlocked, setCanBeBlocked] = useState<boolean>(false);

  const handleAddProcess = () => {
    onAddProcess();
  };

  return (
    <div className="simulator-controls">
      <div className="control-section">
        <h3>Configuración Inicial</h3>
        <div className="config-group">
          <label>
            Frames en RAM:
            <input
              type="number"
              min="4"
              max="64"
              value={config.ramFrames}
              onChange={(e) =>
                onConfigChange({ ramFrames: parseInt(e.target.value) })
              }
            />
          </label>
          <label>
            Tamaño de Página (bytes):
            <input
              type="number"
              min="512"
              max="16384"
              step="512"
              value={config.pageSize}
              onChange={(e) =>
                onConfigChange({ pageSize: parseInt(e.target.value) })
              }
            />
          </label>
          <label>
            Quantum del Procesador (ms):
            <input
              type="number"
              min="100"
              max="10000"
              step="100"
              value={config.processorQuantum}
              onChange={(e) =>
                onConfigChange({ processorQuantum: parseInt(e.target.value) })
              }
            />
          </label>
          <label>
            Máximo de Procesos:
            <input
              type="number"
              min="1"
              max="20"
              value={config.maxProcesses}
              onChange={(e) =>
                onConfigChange({ maxProcesses: parseInt(e.target.value) })
              }
            />
          </label>
        </div>
        <button className="btn btn-primary" onClick={onInitialize}>
          Inicializar Simulador
        </button>
      </div>

      <div className="control-section">
        <h3>Control de Ejecución</h3>
        <div className="button-group">
          <button
            className={`btn ${isRunning ? "btn-warning" : "btn-success"}`}
            onClick={isRunning ? onPause : onStart}
            disabled={processCount === 0}
          >
            {isRunning ? "⏸ Pausar" : "▶ Iniciar"}
          </button>
          <button
            className="btn btn-info"
            onClick={onStep}
            disabled={isRunning || processCount === 0}
          >
            ⏭ Paso
          </button>
          <button className="btn btn-danger" onClick={onReset}>
            🔄 Reiniciar
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3>Crear Proceso</h3>
        <div className="process-config">
          <label>
            Tamaño de Memoria (bytes):
            <input
              type="number"
              min="4096"
              max="65536"
              step="4096"
              value={memorySize}
              onChange={(e) => setMemorySize(parseInt(e.target.value))}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={canBeBlocked}
              onChange={(e) => setCanBeBlocked(e.target.checked)}
            />
            Puede Bloquearse (I/O)
          </label>
          <button
            className="btn btn-secondary"
            onClick={handleAddProcess}
            disabled={processCount >= config.maxProcesses}
          >
            ➕ Crear Proceso
          </button>
        </div>
      </div>

      <div className="info-panel">
        <h4>Información</h4>
        <p>
          <strong>Procesos Activos:</strong> {processCount}/{config.maxProcesses}
        </p>
        <p>
          <strong>RAM Total:</strong>{" "}
          {(config.ramFrames * config.pageSize) / 1024} KB
        </p>
        <p>
          <strong>Estado:</strong> {isRunning ? "🟢 Ejecutando" : "🔴 Parado"}
        </p>
      </div>
    </div>
  );
};
