import React, { useMemo } from "react";
import { Icons } from "../Icons";
import { RAM } from "../../models/RAM";
import { Processor } from "../../models/Processor";
import { Process } from "../../models/Process";
import { STATES } from "../../constants/states";
import "../../styles/MetricsDashboard.css";

interface MetricsDashboardProps {
  ram: RAM;
  processor: Processor;
  processes: Process[];
  currentTime: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  ram,
  processor,
  processes,
  currentTime,
}) => {
  const metrics = useMemo(() => {
    const activeProcesses = processes.filter((p) => p.state !== STATES.TERMINATED).length;
    const terminatedProcesses = processes.filter((p) => p.state === STATES.TERMINATED).length;
    const occupiedFrames = ram.frames.filter((f) => f !== null).length;
    const ramUsage = (occupiedFrames / ram.numFrames) * 100;
    
    const diskInfo = processor.mmu.disk.getAllPagesInfo();
    const totalPagesInDisk = diskInfo.reduce((sum, info) => sum + info.pageCount, 0);
    const diskUsage = Math.min((totalPagesInDisk / 100) * 100, 100);
    
    const cpuUtilization = processor.currentProcess ? 100 : 0;
    const throughput = currentTime > 0 ? terminatedProcesses / currentTime : 0;
    
    return {
      totalProcesses: processes.length,
      activeProcesses,
      terminatedProcesses,
      pageFaults: processor.mmu.pageFaults,
      pageHits: processor.mmu.pageHits,
      ramUsage,
      diskUsage,
      cpuUtilization,
      avgWaitTime: 0,
      throughput,
    };
  }, [ram, processor, processes, currentTime]);

  const hitRatio =
    metrics.pageFaults + metrics.pageHits > 0
      ? (
          (metrics.pageHits / (metrics.pageFaults + metrics.pageHits)) *
          100
        ).toFixed(1)
      : "0.0";

  const metricCards = [
    {
      id: "processes",
      icon: <Icons.Process />,
      title: "Procesos",
      value: metrics.activeProcesses,
      total: metrics.totalProcesses,
      color: "var(--primary-purple)",
      gradient: "var(--gradient-primary)",
      description: `${metrics.terminatedProcesses} terminados`,
    },
    {
      id: "ram",
      icon: <Icons.Memory />,
      title: "RAM",
      value: `${metrics.ramUsage.toFixed(1)}%`,
      color: "var(--secondary-blue)",
      gradient: "var(--gradient-primary)",
      description: "Utilización de memoria",
      progress: metrics.ramUsage,
    },
    {
      id: "cpu",
      icon: <Icons.CPU />,
      title: "CPU",
      value: `${metrics.cpuUtilization.toFixed(1)}%`,
      color: "var(--success-green)",
      gradient: "var(--gradient-success)",
      description: "Utilización del procesador",
      progress: metrics.cpuUtilization,
    },
    {
      id: "pagefaults",
      icon: <Icons.Warning />,
      title: "Page Faults",
      value: metrics.pageFaults,
      color: "var(--danger-red)",
      gradient: "var(--gradient-danger)",
      description: `Hit ratio: ${hitRatio}%`,
    },
    {
      id: "disk",
      icon: <Icons.Disk />,
      title: "Disco",
      value: `${metrics.diskUsage.toFixed(1)}%`,
      color: "var(--warning-amber)",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      description: "Utilización del disco",
      progress: metrics.diskUsage,
    },
    {
      id: "throughput",
      icon: <Icons.Activity />,
      title: "Throughput",
      value: metrics.throughput.toFixed(2),
      color: "var(--accent-cyan)",
      gradient: "var(--gradient-secondary)",
      description: "Procesos/ciclo",
    },
  ];

  return (
    <div className="metrics-dashboard">
      <div className="dashboard-header">
        <h3>
          <Icons.ChartBar />
          Métricas del Sistema
        </h3>
        <div className="dashboard-subtitle">
          Monitoreo en tiempo real del rendimiento
        </div>
      </div>

      <div className="metrics-grid">
        {metricCards.map((metric) => (
          <div
            key={metric.id}
            className="metric-card"
            style={{ "--card-color": metric.color } as React.CSSProperties}
          >
            <div
              className="metric-icon"
              style={{ background: metric.gradient }}
            >
              {metric.icon}
            </div>
            <div className="metric-content">
              <div className="metric-title">{metric.title}</div>
              <div className="metric-value">
                {metric.value}
                {metric.total && (
                  <span className="metric-total">/{metric.total}</span>
                )}
              </div>
              <div className="metric-description">{metric.description}</div>
            </div>
            {metric.progress !== undefined && (
              <div className="metric-progress">
                <div
                  className="metric-progress-fill"
                  style={{
                    width: `${Math.min(metric.progress, 100)}%`,
                    background: metric.gradient,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="metrics-summary">
        <div className="summary-item">
          <Icons.Clock />
          <div className="summary-content">
            <div className="summary-label">Tiempo Promedio de Espera</div>
            <div className="summary-value">
              {metrics.avgWaitTime.toFixed(2)} ciclos
            </div>
          </div>
        </div>
        <div className="summary-item">
          <Icons.CheckCircle />
          <div className="summary-content">
            <div className="summary-label">Tasa de Aciertos</div>
            <div className="summary-value">{hitRatio}%</div>
          </div>
        </div>
        <div className="summary-item">
          <Icons.Activity />
          <div className="summary-content">
            <div className="summary-label">Eficiencia del Sistema</div>
            <div className="summary-value">
              {((metrics.cpuUtilization + parseFloat(hitRatio)) / 2).toFixed(1)}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
