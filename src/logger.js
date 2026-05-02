import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

function logsDir(targetDir) {
  return join(targetDir, '_opensquad', 'logs');
}

async function appendJsonLine(filePath, payload) {
  const entry = JSON.stringify(payload);
  await appendFile(filePath, entry + '\n', 'utf-8');
}

async function readJsonLines(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  const lines = raw.trim().split('\n');
  const entries = [];
  for (const line of lines) {
    try {
      entries.push(JSON.parse(line));
    } catch {
      // Skip malformed lines
    }
  }
  return entries;
}

export async function logEvent(action, details = {}, targetDir = process.cwd()) {
  try {
    const logDir = logsDir(targetDir);
    await mkdir(logDir, { recursive: true });
    await appendJsonLine(join(logDir, 'cli.log'), {
      timestamp: new Date().toISOString(),
      action,
      details,
    });
  } catch {
    // Silent — logging must never break the operation
  }
}

export async function readCliLogs({ action, limit } = {}, targetDir = process.cwd()) {
  try {
    const filePath = join(logsDir(targetDir), 'cli.log');
    let entries = await readJsonLines(filePath);
    entries.reverse(); // newest first
    if (action) entries = entries.filter((e) => e.action === action);
    if (limit) entries = entries.slice(0, limit);
    return entries;
  } catch {
    return [];
  }
}

export async function logAuditEvent(event = {}, targetDir = process.cwd()) {
  try {
    const logDir = logsDir(targetDir);
    await mkdir(logDir, { recursive: true });
    await appendJsonLine(join(logDir, 'audit.log'), {
      eventId: event.eventId || `evt_${randomUUID()}`,
      eventType: event.eventType || 'state_change',
      actor: event.actor || 'system',
      runId: event.runId || null,
      ticketId: event.ticketId || null,
      payload: event.payload || {},
      createdAt: event.createdAt || new Date().toISOString(),
    });
  } catch {
    // Silent — logging must never break the operation
  }
}

export async function readAuditLogs({ runId, ticketId, eventType, limit } = {}, targetDir = process.cwd()) {
  try {
    const filePath = join(logsDir(targetDir), 'audit.log');
    let entries = await readJsonLines(filePath);
    entries.reverse(); // newest first
    if (runId) entries = entries.filter((e) => e.runId === runId);
    if (ticketId) entries = entries.filter((e) => e.ticketId === ticketId);
    if (eventType) entries = entries.filter((e) => e.eventType === eventType);
    if (limit) entries = entries.slice(0, limit);
    return entries;
  } catch {
    return [];
  }
}
