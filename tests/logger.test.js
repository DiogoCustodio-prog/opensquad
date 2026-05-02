import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { logEvent, readCliLogs, logAuditEvent, readAuditLogs } from '../src/logger.js';

test('logEvent writes JSONL line to cli.log', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    const raw = await readFile(join(dir, '_opensquad', 'logs', 'cli.log'), 'utf-8');
    const entry = JSON.parse(raw.trim());
    assert.equal(entry.action, 'init');
    assert.ok(entry.timestamp);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logEvent appends multiple entries', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    const raw = await readFile(join(dir, '_opensquad', 'logs', 'cli.log'), 'utf-8');
    const lines = raw.trim().split('\n');
    assert.equal(lines.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logEvent includes details', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('skill:install', { name: 'apify' }, dir);
    const raw = await readFile(join(dir, '_opensquad', 'logs', 'cli.log'), 'utf-8');
    const entry = JSON.parse(raw.trim());
    assert.equal(entry.details.name, 'apify');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logEvent silently fails on invalid path', async () => {
  await logEvent('init', {}, '/nonexistent/path/that/does/not/exist');
});

test('readCliLogs returns entries', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    const logs = await readCliLogs({}, dir);
    assert.equal(logs.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs filters by action', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    await logEvent('init', {}, dir);
    const logs = await readCliLogs({ action: 'init' }, dir);
    assert.equal(logs.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs respects limit', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    await logEvent('init', {}, dir);
    const logs = await readCliLogs({ limit: 2 }, dir);
    assert.equal(logs.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs returns newest first', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    const logs = await readCliLogs({}, dir);
    assert.equal(logs[0].action, 'update');
    assert.equal(logs[1].action, 'init');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs handles malformed lines gracefully', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    const { mkdir, writeFile } = await import('node:fs/promises');
    await mkdir(join(dir, '_opensquad', 'logs'), { recursive: true });
    await writeFile(
      join(dir, '_opensquad', 'logs', 'cli.log'),
      'not json\n{"action":"init","timestamp":"2026-01-01T00:00:00Z","details":{}}\n',
      'utf-8'
    );
    const logs = await readCliLogs({}, dir);
    assert.equal(logs.length, 1);
    assert.equal(logs[0].action, 'init');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs returns empty array when no log file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    const logs = await readCliLogs({}, dir);
    assert.equal(logs.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logAuditEvent writes structured audit event', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-audit-'));
  try {
    await logAuditEvent({
      eventType: 'state_change',
      actor: 'system',
      runId: 'run_1',
      ticketId: 'tck_1',
      payload: { status: 'started' },
    }, dir);

    const logs = await readAuditLogs({}, dir);
    assert.equal(logs.length, 1);
    assert.equal(logs[0].eventType, 'state_change');
    assert.equal(logs[0].actor, 'system');
    assert.equal(logs[0].runId, 'run_1');
    assert.equal(logs[0].ticketId, 'tck_1');
    assert.equal(logs[0].payload.status, 'started');
    assert.ok(logs[0].eventId);
    assert.ok(logs[0].createdAt);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readAuditLogs filters by runId and eventType', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-audit-'));
  try {
    await logAuditEvent({ eventType: 'state_change', actor: 'system', runId: 'run_1' }, dir);
    await logAuditEvent({ eventType: 'approval', actor: 'user', runId: 'run_1' }, dir);
    await logAuditEvent({ eventType: 'state_change', actor: 'system', runId: 'run_2' }, dir);

    const logs = await readAuditLogs({ runId: 'run_1', eventType: 'state_change' }, dir);
    assert.equal(logs.length, 1);
    assert.equal(logs[0].runId, 'run_1');
    assert.equal(logs[0].eventType, 'state_change');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
