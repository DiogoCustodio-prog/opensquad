import { useEffect, useMemo, useRef, useState } from "react";
import type { AuditEvent } from "@/types/state";

const PAGE_SIZE = 8;

function fmtDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR", { hour12: false });
}

function statusBadgeStyle(status: string): Record<string, string> {
  if (status === "completed") {
    return { background: "#163a24", color: "#8ff0a4", border: "1px solid #2a6b43" };
  }

  if (status === "failed") {
    return { background: "#3f1b1b", color: "#ffb3b3", border: "1px solid #8f3a3a" };
  }

  if (status === "running") {
    return { background: "#1f2d4d", color: "#a9c6ff", border: "1px solid #3f5d9a" };
  }

  return { background: "#2a2a2a", color: "#e0e0e0", border: "1px solid #3f3f3f" };
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
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);
  const isFirstFilterSync = useRef(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setTicketId(params.get("auditTicketId") ?? "");
    setStatus(params.get("auditStatus") ?? "");
    setSince(params.get("auditSince") ?? "");
    setUntil(params.get("auditUntil") ?? "");

    const rawPage = Number.parseInt(params.get("auditPage") ?? "1", 10);
    setPage(Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage));
    setHydratedFromUrl(true);
  }, []);

  useEffect(() => {
    if (!hydratedFromUrl) return;

    const params = new URLSearchParams(window.location.search);

    if (ticketId.trim()) params.set("auditTicketId", ticketId.trim());
    else params.delete("auditTicketId");

    if (status) params.set("auditStatus", status);
    else params.delete("auditStatus");

    if (since) params.set("auditSince", since);
    else params.delete("auditSince");

    if (until) params.set("auditUntil", until);
    else params.delete("auditUntil");

    params.set("auditPage", String(page));

    const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState({}, "", next);
  }, [ticketId, status, since, until, page, hydratedFromUrl]);

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

  useEffect(() => {
    if (!hydratedFromUrl) return;
    if (isFirstFilterSync.current) {
      isFirstFilterSync.current = false;
      return;
    }

    setPage(1);
  }, [ticketId, status, since, until, hydratedFromUrl]);

  function clearFilters() {
    setTicketId("");
    setStatus("");
    setSince("");
    setUntil("");
    setPage(1);
  }

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
        <button onClick={clearFilters} style={{ fontSize: 12 }}>
          Limpar filtros
        </button>
      </div>

      <div style={{ overflow: "auto", padding: 8, display: "grid", gap: 8, flex: 1 }}>
        {loading && <div style={{ fontSize: 12, opacity: 0.7 }}>Carregando...</div>}
        {!loading && events.length === 0 ? (
          <div style={{ fontSize: 12, opacity: 0.7, padding: 8 }}>Sem eventos para o filtro atual.</div>
        ) : (
          events.map((event) => {
            const payloadStatus = typeof event.payload?.status === "string" ? event.payload.status : "-";
            const badgeStyle = statusBadgeStyle(payloadStatus);

            return (
              <div key={event.eventId} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 600 }}>{event.eventType}</div>
                <div style={{ opacity: 0.8 }}>{fmtDate(event.createdAt)}</div>
                <div>Squad: {event.squad ?? "-"}</div>
                <div>Ticket: {event.ticketId ?? "-"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Status:
                  <span style={{ ...badgeStyle, borderRadius: 999, padding: "2px 8px", fontWeight: 600, fontSize: 11 }}>
                    {payloadStatus}
                  </span>
                </div>
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
