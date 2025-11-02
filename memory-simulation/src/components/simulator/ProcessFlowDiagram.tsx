/**
 * ProcessFlowDiagram
 *
 * Diagrama de flujo de estados de procesos:
 * - NEW → READY → RUNNING → TERMINATED
 * - RUNNING → BLOCKED → READY
 * - Muestra cantidad de procesos por estado
 * - Animaciones de transiciones
 */

import React from "react";
import { Icons } from "../Icons";
import { Process } from "../../models/Process";
import { STATES } from "../../constants/states";
import "../../styles/ProcessFlowDiagram.css";

interface ProcessFlowDiagramProps {
  processes: Process[];
}

export const ProcessFlowDiagram: React.FC<ProcessFlowDiagramProps> = ({ processes }) => {
  const countByState = (state: string) => processes.filter((p) => p.state === state).length;

  const stateInfo = [
    {
      state: STATES.NEW,
      label: "NEW",
      count: countByState(STATES.NEW),
      color: "var(--state-new)",
      icon: <Icons.Add />,
    },
    {
      state: STATES.READY,
      label: "READY",
      count: countByState(STATES.READY),
      color: "var(--state-ready)",
      icon: <Icons.Clock />,
    },
    {
      state: STATES.RUNNING,
      label: "RUNNING",
      count: countByState(STATES.RUNNING),
      color: "var(--state-running)",
      icon: <Icons.Activity />,
    },
    {
      state: STATES.BLOCKED,
      label: "BLOCKED",
      count: countByState(STATES.BLOCKED),
      color: "var(--state-blocked)",
      icon: <Icons.Warning />,
    },
    {
      state: STATES.TERMINATED,
      label: "TERMINATED",
      count: countByState(STATES.TERMINATED),
      color: "var(--state-terminated)",
      icon: <Icons.CheckCircle />,
    },
  ];

  return (
    <div className="process-flow-diagram">
      <div className="process-flow-diagram__header">
        <div className="process-flow-diagram__title-group">
          <Icons.Grid />
          <h3 className="process-flow-diagram__title">Estados de Procesos</h3>
        </div>
        <div className="process-flow-diagram__total">
          Total: {processes.length}
        </div>
      </div>

      <div className="process-flow-diagram__states">
        {stateInfo.map((info, index) => (
          <div
            key={info.state}
            className="process-flow-diagram__state"
            style={{
              borderColor: info.color,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div
              className="process-flow-diagram__state-icon"
              style={{ background: info.color }}
            >
              {info.icon}
            </div>
            <div className="process-flow-diagram__state-content">
              <span className="process-flow-diagram__state-label">{info.label}</span>
              <span
                className="process-flow-diagram__state-count"
                style={{ color: info.color }}
              >
                {info.count}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="process-flow-diagram__legend">
        <div className="process-flow-diagram__legend-title">Transiciones:</div>
        <div className="process-flow-diagram__legend-items">
          <span>NEW → READY → RUNNING</span>
          <span>RUNNING → BLOCKED → READY</span>
          <span>RUNNING → TERMINATED</span>
        </div>
      </div>
    </div>
  );
};
