import { useEffect, useMemo, useState } from "react";
import type { AuditEvent } from "@/types/state";

const PAGE_SIZE = 8;

function fmtDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR", { hour12: false });
}

export function AuditEventsCard() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [ticketId, setTicketId] = useState("");
  const [status, setStatus] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [ticketId, status, since, until]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", String(PAGE_SIZE));
        params.set("offset", String((page - 1) * PAGE_SIZE));
        if (ticketId.trim()) params.set("ticketId", ticketId.trim());
        if (status) params.set("status", status);
        if (since) params.set("since", new Date(`${since}T00:00:00`).toISOString());
        if (until) params.set("until", new Date(`${until}T23:59:59`).toISOString());

        const res = await fetch(`/api/audit-events?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) return;

        const data = (await res.json()) as { events?: AuditEvent[]; total?: number };
        if (cancelled) return;

        setEvents(Array.isArray(data.events) ? data.events : []);
        setTotal(typeof data.total === "number" ? data.total : 0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const timer = setInterval(load, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [page, ticketId, status, since, until]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  return (
    <aside
      style={{
        width: 360,
        minWidth: 360,
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-sidebar)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 700 }}>
        Últimos eventos de auditoria
      </div>

      <div style={{ padding: 8, display: "grid", gap: 6, borderBottom: "1px solid var(--border)" }}>
        <input placeholder="Ticket ID" value={ticketId} onChange={(e) => setTicketId(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Status (todos)</option>
          <option value="running">running</option>
          <option value="completed">completed</option>
          <option value="failed">failed</option>
          <option value="checkpoint">checkpoint</option>
        </select>
        <div style={{ display: "flex", gap: 6 }}>
          <input type="date" value={since} onChange={(e) => setSince(e.target.value)} style={{ flex: 1 }} />
          <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} style={{ flex: 1 }} />
        </div>
      </div>

      <div style={{ overflow: "auto", padding: 8, display: "grid", gap: 8, flex: 1 }}>
        {loading && <div style={{ fontSize: 12, opacity: 0.7 }}>Carregando...</div>}
        {!loading && events.length === 0 ? (
          <div style={{ fontSize: 12, opacity: 0.7, padding: 8 }}>Sem eventos para o filtro atual.</div>
        ) : (
          events.map((event) => {
            const payloadStatus = typeof event.payload?.status === "string" ? event.payload.status : "-";
            return (
              <div key={event.eventId} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 600 }}>{event.eventType}</div>
                <div style={{ opacity: 0.8 }}>{fmtDate(event.createdAt)}</div>
                <div>Squad: {event.squad ?? "-"}</div>
                <div>Ticket: {event.ticketId ?? "-"}</div>
                <div>Status: {payloadStatus}</div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 8, borderTop: "1px solid var(--border)" }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</button>
        <span style={{ fontSize: 12 }}>Página {page}/{totalPages} · {total} evento(s)</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Próxima</button>
      </div>
    </aside>
  );
}
