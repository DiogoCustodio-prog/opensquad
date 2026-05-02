import { useMemo } from "react";
import { useSquadStore } from "@/store/useSquadStore";

function fmtDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR", { hour12: false });
}

export function AuditEventsCard() {
  const auditEvents = useSquadStore((s) => s.auditEvents);

  const rows = useMemo(() => auditEvents.slice(0, 8), [auditEvents]);

  return (
    <aside
      style={{
        width: 340,
        minWidth: 340,
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-sidebar)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.3,
        }}
      >
        Últimos eventos de auditoria
      </div>

      <div style={{ overflow: "auto", padding: 8, display: "grid", gap: 8 }}>
        {rows.length === 0 ? (
          <div style={{ fontSize: 12, opacity: 0.7, padding: 8 }}>Sem eventos recentes.</div>
        ) : (
          rows.map((event) => {
            const status = typeof event.payload?.status === "string" ? event.payload.status : "-";
            return (
              <div
                key={event.eventId}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 8,
                  fontSize: 12,
                  lineHeight: 1.35,
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div style={{ fontWeight: 600 }}>{event.eventType}</div>
                <div style={{ opacity: 0.8 }}>{fmtDate(event.createdAt)}</div>
                <div>Squad: {event.squad ?? "-"}</div>
                <div>Ticket: {event.ticketId ?? "-"}</div>
                <div>Status: {status}</div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
