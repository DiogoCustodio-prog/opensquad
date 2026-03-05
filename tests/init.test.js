import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { init } from '../src/init.js';

test('init creates _opensquad directory structure', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await stat(join(tempDir, '_opensquad'));
    await stat(join(tempDir, '_opensquad', 'core'));
    await stat(join(tempDir, '_opensquad', 'core', 'architect.agent.yaml'));
    await stat(join(tempDir, '_opensquad', 'core', 'runner.pipeline.md'));
    await stat(join(tempDir, '_opensquad', '_memory'));
    await stat(join(tempDir, '.claude', 'skills', 'opensquad', 'SKILL.md'));
    await stat(join(tempDir, 'CLAUDE.md'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates empty squads directory', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await stat(join(tempDir, 'squads'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init does not overwrite if already initialized', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await init(tempDir, { _skipPrompts: true }); // Should not throw, just warn
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLAUDE.md contains Opensquad instructions', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(join(tempDir, 'CLAUDE.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates _investigations directory', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await stat(join(tempDir, '_opensquad', '_investigations'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init writes preferences file with defaults when prompts skipped', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const prefs = await readFile(join(tempDir, '_opensquad', '_memory', 'preferences.md'), 'utf-8');
    assert.ok(prefs.includes('Output Language:'));
    assert.ok(prefs.includes('English'));
    assert.ok(prefs.includes('IDEs:'));
    assert.ok(prefs.includes('claude-code'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with language option produces translated preferences', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _language: 'Português (Brasil)' });

    const prefs = await readFile(join(tempDir, '_opensquad', '_memory', 'preferences.md'), 'utf-8');
    assert.ok(prefs.includes('Português (Brasil)'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates .opensquad-version file', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const version = await readFile(join(tempDir, '_opensquad', '.opensquad-version'), 'utf-8');
    assert.ok(version.trim().length > 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates README.md in user project', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(join(tempDir, 'README.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('README.md contains /opensquad command', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(join(tempDir, 'README.md'), 'utf-8');
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('README.md is in Portuguese when language is PT-BR', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _language: 'Português (Brasil)' });

    const content = await readFile(join(tempDir, 'README.md'), 'utf-8');
    assert.ok(content.includes('Instalação'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('README.md is in Spanish when language is Español', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _language: 'Español' });

    const content = await readFile(join(tempDir, 'README.md'), 'utf-8');
    assert.ok(content.includes('Instalación'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides installs only selected IDE files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['claude-code'] });

    // claude-code files exist
    await stat(join(tempDir, '.claude', 'skills', 'opensquad', 'SKILL.md'));
    await stat(join(tempDir, 'CLAUDE.md'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides opencode creates AGENTS.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['opencode'] });

    const content = await readFile(join(tempDir, 'AGENTS.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides codex creates AGENTS.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['codex'] });

    const content = await readFile(join(tempDir, 'AGENTS.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with opencode and codex both selected writes AGENTS.md only once', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['opencode', 'codex'] });

    const content = await readFile(join(tempDir, 'AGENTS.md'), 'utf-8');
    assert.ok(content.includes('Opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides antigravity creates .antigravity/rules.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['antigravity'] });

    const content = await readFile(
      join(tempDir, '.antigravity', 'rules.md'),
      'utf-8'
    );
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('/opensquad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with _ides antigravity creates .agent/workflows/opensquad.md', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['antigravity'] });

    const content = await readFile(
      join(tempDir, '.agent', 'workflows', 'opensquad.md'),
      'utf-8'
    );
    assert.ok(content.includes('description:'));
    assert.ok(content.includes('Opensquad'));
    assert.ok(content.includes('rules.md'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with multiple ides records all in preferences', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['claude-code', 'opencode'] });

    const prefs = await readFile(join(tempDir, '_opensquad', '_memory', 'preferences.md'), 'utf-8');
    assert.ok(prefs.includes('claude-code'));
    assert.ok(prefs.includes('opencode'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates .gitignore with browser profile exclusion', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(join(tempDir, '.gitignore'), 'utf-8');
    assert.ok(content.includes('_opensquad/_browser_profile/'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init creates playwright config with persistent context', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(
      join(tempDir, '_opensquad', 'config', 'playwright.config.json'),
      'utf-8'
    );
    const config = JSON.parse(content);
    assert.equal(config.browser.isolated, false);
    assert.equal(config.browser.userDataDir, '_opensquad/_browser_profile');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init with claude-code IDE creates .mcp.json with playwright server', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));

  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['claude-code'] });

    const content = await readFile(join(tempDir, '.mcp.json'), 'utf-8');
    const config = JSON.parse(content);
    assert.ok(config.mcpServers.playwright);
    assert.ok(config.mcpServers.playwright.args.includes('--config'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init installs all bundled agents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    const agentsDir = join(tempDir, 'agents');
    await stat(agentsDir);
    const entries = await readdir(agentsDir);
    const agentFiles = entries.filter((f) => f.endsWith('.agent.md'));
    assert.ok(agentFiles.length > 0, 'No agent files found');
    await stat(join(agentsDir, 'researcher.agent.md'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init installs all bundled skills including MCP skills', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    const skillsDir = join(tempDir, 'skills');
    const entries = await readdir(skillsDir);
    assert.ok(entries.includes('apify'), 'apify should be auto-installed');
    assert.ok(entries.includes('blotato'), 'blotato should be auto-installed');
    assert.ok(entries.includes('canva'), 'canva should be auto-installed');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init installs opensquad-skill-creator including subdirs', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    const scripts = await readdir(join(tempDir, 'skills', 'opensquad-skill-creator', 'scripts'));
    assert.ok(scripts.length > 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init does not overwrite existing package.json', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    const pkgPath = join(tempDir, 'package.json');
    await writeFile(pkgPath, JSON.stringify({ name: 'my-project', version: '2.0.0' }), 'utf-8');

    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);
    assert.equal(pkg.name, 'my-project');
    assert.equal(pkg.version, '2.0.0');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('init copies package.json to fresh project', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'opensquad-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });

    const content = await readFile(join(tempDir, 'package.json'), 'utf-8');
    const pkg = JSON.parse(content);
    assert.ok(pkg.dependencies?.playwright, 'playwright should be listed as a dependency');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
