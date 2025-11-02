/**
 * DataFlowVisualization
 *
 * Muestra el flujo de datos entre componentes del sistema:
 * - CPU → MMU → RAM/Disco
 * - Animaciones de eventos (Page Hit, Page Fault, Swap)
 * - Indicadores visuales de operaciones en tiempo real
 */

import React, { useEffect, useState } from "react";
import { Icons } from "../Icons";
import type { MMUEvent } from "../../models/MMU";
import type { Processor } from "../../models/Processor";
import type { RAM } from "../../models/RAM";
import type { Disk } from "../../models/Disk";
import "../../styles/DataFlowVisualization.css";

interface DataFlowVisualizationProps {
  lastEvent: MMUEvent | null;
  processor: Processor;
  ram: RAM;
  disk: Disk;
}

export const DataFlowVisualization: React.FC<DataFlowVisualizationProps> = ({
  lastEvent,
  processor,
  ram,
  disk,
}) => {
  const [activeFlow, setActiveFlow] = useState<string | null>(null);

  useEffect(() => {
    if (lastEvent) {
      switch (lastEvent.type) {
        case "PAGE_HIT":
          setActiveFlow("cpu-ram");
          break;
        case "PAGE_FAULT":
          setActiveFlow("ram-disk");
          break;
        case "PAGE_SWAP":
          setActiveFlow("disk-ram");
          break;
        case "PAGE_LOAD":
          setActiveFlow("disk-ram");
          break;
      }

      const timer = setTimeout(() => setActiveFlow(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  const getEventColor = (type?: string): string => {
    switch (type) {
      case "PAGE_HIT":
        return "var(--success-green)";
      case "PAGE_FAULT":
        return "var(--danger-red)";
      case "PAGE_SWAP":
        return "var(--warning-amber)";
      case "PAGE_LOAD":
        return "var(--accent-cyan)";
      default:
        return "var(--primary-purple)";
    }
  };

  const pageFaults = processor.mmu.pageFaults;
  const pageHits = processor.mmu.pageHits;
  const hitRatio = processor.mmu.getHitRatio();

  return (
    <div className="data-flow-visualization">
      <div className="data-flow-visualization__header">
        <div className="data-flow-visualization__title-group">
          <Icons.Activity />
          <h3 className="data-flow-visualization__title">Flujo de Datos</h3>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="data-flow-visualization__diagram">
        {/* CPU Node */}
        <div className="data-flow-visualization__node data-flow-visualization__node--cpu">
          <div className="data-flow-visualization__node-icon">
            <Icons.CPU />
          </div>
          <span className="data-flow-visualization__node-label">CPU</span>
        </div>

        {/* Arrow CPU to MMU */}
        <div
          className={`data-flow-visualization__arrow ${
            activeFlow === "cpu-ram" ? "data-flow-visualization__arrow--active" : ""
          }`}
          style={{ "--arrow-color": getEventColor(lastEvent?.type) } as React.CSSProperties}
        >
          <div className="data-flow-visualization__arrow-line" />
        </div>

        {/* MMU Node */}
        <div className="data-flow-visualization__node data-flow-visualization__node--mmu">
          <div className="data-flow-visualization__node-icon">
            <Icons.Settings />
          </div>
          <span className="data-flow-visualization__node-label">MMU</span>
          <div className="data-flow-visualization__node-badge">
            {processor.mmu.clock.getPointer()}
          </div>
        </div>

        {/* Arrows MMU to RAM and Disk */}
        <div className="data-flow-visualization__split">
          {/* To RAM */}
          <div className="data-flow-visualization__branch">
            <div
              className={`data-flow-visualization__arrow ${
                activeFlow === "cpu-ram" || activeFlow === "disk-ram"
                  ? "data-flow-visualization__arrow--active"
                  : ""
              }`}
              style={{ "--arrow-color": getEventColor(lastEvent?.type) } as React.CSSProperties}
            >
              <div className="data-flow-visualization__arrow-line" />
            </div>

            <div className="data-flow-visualization__node data-flow-visualization__node--ram">
              <div className="data-flow-visualization__node-icon">
                <Icons.Memory />
              </div>
              <span className="data-flow-visualization__node-label">RAM</span>
              <div className="data-flow-visualization__node-info">
                {ram.frames.filter((f) => f !== null).length}/{ram.numFrames}
              </div>
            </div>
          </div>

          {/* To Disk */}
          <div className="data-flow-visualization__branch">
            <div
              className={`data-flow-visualization__arrow data-flow-visualization__arrow--disk ${
                activeFlow === "ram-disk" || activeFlow === "disk-ram"
                  ? "data-flow-visualization__arrow--active"
                  : ""
              }`}
              style={{ "--arrow-color": getEventColor(lastEvent?.type) } as React.CSSProperties}
            >
              <div className="data-flow-visualization__arrow-line" />
            </div>

            <div className="data-flow-visualization__node data-flow-visualization__node--disk">
              <div className="data-flow-visualization__node-icon">
                <Icons.Disk />
              </div>
              <span className="data-flow-visualization__node-label">Disco</span>
              <div className="data-flow-visualization__node-info">
                {disk.getAllPagesInfo().reduce((sum, info) => sum + info.pageCount, 0)} pág.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Display */}
      {lastEvent && (
        <div
          className="data-flow-visualization__event"
          style={{ borderColor: getEventColor(lastEvent.type) }}
        >
          <div
            className="data-flow-visualization__event-indicator"
            style={{ background: getEventColor(lastEvent.type) }}
          />
          <div className="data-flow-visualization__event-content">
            <span className="data-flow-visualization__event-type">
              {lastEvent.type.replace("_", " ")}
            </span>
            <span className="data-flow-visualization__event-details">
              P{lastEvent.processPid} • Pág {lastEvent.pageNumber}
              {lastEvent.frameNumber !== undefined && ` • Frame ${lastEvent.frameNumber}`}
            </span>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="data-flow-visualization__stats">
        <div className="data-flow-visualization__stat data-flow-visualization__stat--success">
          <Icons.CheckCircle />
          <div className="data-flow-visualization__stat-content">
            <span className="data-flow-visualization__stat-label">Page Hits</span>
            <span className="data-flow-visualization__stat-value">{pageHits}</span>
          </div>
        </div>

        <div className="data-flow-visualization__stat data-flow-visualization__stat--danger">
          <Icons.Warning />
          <div className="data-flow-visualization__stat-content">
            <span className="data-flow-visualization__stat-label">Page Faults</span>
            <span className="data-flow-visualization__stat-value">{pageFaults}</span>
          </div>
        </div>

        <div className="data-flow-visualization__stat data-flow-visualization__stat--primary">
          <Icons.ChartBar />
          <div className="data-flow-visualization__stat-content">
            <span className="data-flow-visualization__stat-label">Hit Ratio</span>
            <span className="data-flow-visualization__stat-value">
              {(hitRatio * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
