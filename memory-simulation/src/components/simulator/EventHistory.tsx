/**
 * EventHistory
 *
 * Muestra el historial de eventos recientes del simulador:
 * - Page Hits
 * - Page Faults
 * - Page Swaps
 * - Page Loads
 * - Context Switches
 * - Transiciones de estado
 */

import React from "react";
import { Icons } from "../Icons";
import type { MMUEvent } from "../../models/MMU";
import "../../styles/EventHistory.css";

interface EventHistoryProps {
  events: MMUEvent[];
  maxEvents?: number;
}

export const EventHistory: React.FC<EventHistoryProps> = ({
  events,
  maxEvents = 100,
}) => {
  // Obtener los últimos N eventos (ahora hasta 100)
  const recentEvents = events.slice(-maxEvents).reverse();

  const getEventIcon = (type: string) => {
    switch (type) {
      case "PAGE_HIT":
        return <Icons.CheckCircle />;
      case "PAGE_FAULT":
        return <Icons.Warning />;
      case "PAGE_SWAP":
        return <Icons.Activity />;
      case "PAGE_LOAD":
        return <Icons.Arrow />;
      default:
        return <Icons.Info />;
    }
  };

  const getEventColor = (type: string): string => {
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

  const getEventLabel = (type: string): string => {
    switch (type) {
      case "PAGE_HIT":
        return "Page Hit";
      case "PAGE_FAULT":
        return "Page Fault";
      case "PAGE_SWAP":
        return "Page Swap";
      case "PAGE_LOAD":
        return "Page Load";
      default:
        return type;
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className="event-history">
      <div className="event-history__header">
        <div className="event-history__title-group">
          <Icons.Activity />
          <h3 className="event-history__title">Historial de Eventos</h3>
        </div>
        <div className="event-history__count">
          {recentEvents.length} / {maxEvents}
        </div>
      </div>

      <div className="event-history__list">
        {recentEvents.length === 0 ? (
          <div className="event-history__empty">
            <Icons.Info />
            <p>No hay eventos registrados aún</p>
            <span>Inicia la simulación para ver el historial</span>
          </div>
        ) : (
          recentEvents.map((event, index) => (
            <div
              key={`${event.timestamp}-${index}`}
              className="event-history__item"
              style={{
                borderLeftColor: getEventColor(event.type),
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div
                className="event-history__item-icon"
                style={{ color: getEventColor(event.type) }}
              >
                {getEventIcon(event.type)}
              </div>

              <div className="event-history__item-content">
                <div className="event-history__item-header">
                  <span
                    className="event-history__item-type"
                    style={{ color: getEventColor(event.type) }}
                  >
                    {getEventLabel(event.type)}
                  </span>
                  <span className="event-history__item-time">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>

                <div className="event-history__item-details">
                  <span className="event-history__item-detail">
                    <strong>Proceso:</strong> P{event.processPid}
                  </span>
                  <span className="event-history__item-detail">
                    <strong>Página:</strong> {event.pageNumber}
                  </span>
                  {event.frameNumber !== undefined && (
                    <span className="event-history__item-detail">
                      <strong>Frame:</strong> {event.frameNumber}
                    </span>
                  )}
                  {event.victimPid !== undefined && (
                    <span className="event-history__item-detail">
                      <strong>Víctima:</strong> P{event.victimPid} (Pág{" "}
                      {event.victimPageNumber})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
