import React, { useEffect } from "react";
import { useSimulator } from "../hooks/useSimulator";
import { SimulatorControls } from "./simulator/SimulatorControls";
import { RAMVisualization } from "./simulator/RAMVisualization";
import { ProcessorVisualization } from "./simulator/ProcessorVisualization";
import { ProcessDetails } from "./simulator/ProcessDetails";
import "../styles/SimulatorLayout.css";

export const MemorySimulator: React.FC = () => {
  const {
    state,
    initializeSimulator,
    addProcess,
    startSimulation,
    pauseSimulation,
    stepSimulation,
    resetSimulation,
  } = useSimulator();

  useEffect(() => {
    // Inicializar con configuración por defecto
    initializeSimulator({});
  }, [initializeSimulator]);

  const handleConfigChange = (config: any) => {
    // Este handler permite cambiar la configuración
    state.config = { ...state.config, ...config };
  };

  const handleAddProcess = () => {
    if (state.processor) {
      addProcess(false);
    }
  };

  return (
    <div className="simulator-container">
      <header className="simulator-header">
        <div className="header-content">
          <h1>🖥️ Simulador de Memoria y Procesos</h1>
          <p>Visualización interactiva del sistema operativo</p>
        </div>
      </header>

      <main className="simulator-main">
        <div className="layout-grid">
          {/* Columna izquierda: Controles */}
          <div className="column controls-column">
            <SimulatorControls
              config={state.config}
              onConfigChange={handleConfigChange}
              onInitialize={() => initializeSimulator(state.config)}
              onAddProcess={handleAddProcess}
              onStart={startSimulation}
              onPause={pauseSimulation}
              onStep={stepSimulation}
              onReset={resetSimulation}
              isRunning={state.isRunning}
              processCount={state.processes.length}
            />
          </div>

          {/* Columna derecha: Visualizaciones */}
          <div className="column visualizations-column">
            {/* Fila superior: RAM y Procesador */}
            <div className="visualizations-row">
              <div className="visualization-box">
                <RAMVisualization ram={state.ram} processes={state.processes} />
              </div>
              <div className="visualization-box">
                <ProcessorVisualization
                  processor={state.processor}
                  processes={state.processes}
                />
              </div>
            </div>

            {/* Fila inferior: Detalles de Procesos */}
            <div className="visualization-box full-width">
              <ProcessDetails processes={state.processes} />
            </div>
          </div>
        </div>
      </main>

      <footer className="simulator-footer">
        <p>
          Simulador de Sistema Operativo | Gestión de Memoria Virtual con
          Paginación
        </p>
      </footer>
    </div>
  );
};
