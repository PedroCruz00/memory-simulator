/**
 * SimulatorControls
 *
 * Panel de control principal del simulador con:
 * - Botones de control (Inicializar, Play, Pause, Step, Reset)
 * - Botón para agregar procesos
 * - Configuración del simulador
 */

import React, { useState } from "react";
import { Icons } from "../Icons";
import type { SimulatorConfig } from "../../hooks/useSimulator";
import "../../styles/SimulatorControls.css";

interface SimulatorControlsProps {
  isRunning: boolean;
  isInitialized: boolean;
  onInitialize: (config: SimulatorConfig) => void;
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onAddProcess: () => void;
  config: SimulatorConfig;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  isRunning,
  isInitialized,
  onInitialize,
  onStart,
  onPause,
  onStep,
  onReset,
  onAddProcess,
  config,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState<SimulatorConfig>(config);

  const handleInitialize = () => {
    onInitialize(configForm);
    setShowConfig(false);
  };

  return (
    <div className="simulator-controls">
      <div className="simulator-controls__main">
        {/* Configuration Button */}
        <button
          className="simulator-controls__btn simulator-controls__btn--config"
          onClick={() => setShowConfig(!showConfig)}
          title="Configuración"
        >
          <Icons.Settings />
          <span>Config</span>
        </button>

        {/* Initialize Button */}
        {!isInitialized && (
          <button
            className="simulator-controls__btn simulator-controls__btn--primary"
            onClick={handleInitialize}
          >
            <Icons.CheckCircle />
            <span>Inicializar</span>
          </button>
        )}

        {/* Control Buttons */}
        {isInitialized && (
          <>
            <div className="simulator-controls__divider" />

            {/* Play/Pause */}
            {!isRunning ? (
              <button
                className="simulator-controls__btn simulator-controls__btn--success"
                onClick={onStart}
                title="Iniciar simulación"
              >
                <Icons.Play />
                <span>Play</span>
              </button>
            ) : (
              <button
                className="simulator-controls__btn simulator-controls__btn--warning"
                onClick={onPause}
                title="Pausar simulación"
              >
                <Icons.Pause />
                <span>Pause</span>
              </button>
            )}

            {/* Step */}
            <button
              className="simulator-controls__btn"
              onClick={onStep}
              disabled={isRunning}
              title="Ejecutar un paso"
            >
              <Icons.Step />
              <span>Step</span>
            </button>

            <div className="simulator-controls__divider" />

            {/* Add Process */}
            <button
              className="simulator-controls__btn simulator-controls__btn--accent"
              onClick={onAddProcess}
              title="Agregar proceso"
            >
              <Icons.Add />
              <span>Proceso</span>
            </button>

            {/* Reset */}
            <button
              className="simulator-controls__btn simulator-controls__btn--danger"
              onClick={onReset}
              title="Reiniciar simulación"
            >
              <Icons.Reset />
              <span>Reset</span>
            </button>
          </>
        )}
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="simulator-controls__config">
          <h4 className="simulator-controls__config-title">
            Configuración del Simulador
          </h4>

          <div className="simulator-controls__config-grid">
            <div className="simulator-controls__config-item">
              <label className="simulator-controls__config-label">
                <Icons.Memory />
                <span>Frames RAM</span>
              </label>
              <input
                type="number"
                className="simulator-controls__config-input"
                value={configForm.ramFrames}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    ramFrames: parseInt(e.target.value) || 16,
                  })
                }
                min="4"
                max="32"
              />
              <span className="simulator-controls__config-hint">
                4-32 frames
              </span>
            </div>

            <div className="simulator-controls__config-item">
              <label className="simulator-controls__config-label">
                <Icons.Disk />
                <span>Tamaño Página</span>
              </label>
              <input
                type="number"
                className="simulator-controls__config-input"
                value={configForm.pageSize}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    pageSize: parseInt(e.target.value) || 4096,
                  })
                }
                step="1024"
              />
              <span className="simulator-controls__config-hint">bytes</span>
            </div>

            <div className="simulator-controls__config-item">
              <label className="simulator-controls__config-label">
                <Icons.Clock />
                <span>Quantum</span>
              </label>
              <input
                type="number"
                className="simulator-controls__config-input"
                value={configForm.processorQuantum}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    processorQuantum: parseInt(e.target.value) || 1000,
                  })
                }
                min="500"
                max="5000"
                step="100"
              />
              <span className="simulator-controls__config-hint">ms</span>
            </div>

            <div className="simulator-controls__config-item">
              <label className="simulator-controls__config-label">
                <Icons.Process />
                <span>Max Procesos</span>
              </label>
              <input
                type="number"
                className="simulator-controls__config-input"
                value={configForm.maxProcesses}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    maxProcesses: parseInt(e.target.value) || 10,
                  })
                }
                min="1"
                max="20"
              />
              <span className="simulator-controls__config-hint">procesos</span>
            </div>
          </div>

          <div className="simulator-controls__config-actions">
            <button
              className="simulator-controls__btn simulator-controls__btn--primary"
              onClick={handleInitialize}
            >
              Aplicar Configuración
            </button>
            <button
              className="simulator-controls__btn"
              onClick={() => setShowConfig(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
