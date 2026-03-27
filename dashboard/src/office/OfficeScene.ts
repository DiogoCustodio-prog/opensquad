import Phaser from 'phaser';
import {
  CHARACTER_NAMES, avatarKeys, avatarPath,
  DESK_KEYS, DESK_PATHS,
  FURNITURE_KEYS, FURNITURE_PATHS,
} from './assetKeys';
import { TILE, CELL_W, CELL_H, MARGIN, WALL_H } from './palette';
import { RoomBuilder } from './RoomBuilder';
import { AgentSprite } from './AgentSprite';
import type { SquadState, Agent } from '@/types/state';

const DEMO_AGENTS: Agent[] = [
  { id: '1', name: 'Researcher', icon: '', status: 'working', deliverTo: null, desk: { col: 1, row: 1 } },
  { id: '2', name: 'Writer', icon: '', status: 'idle', deliverTo: null, desk: { col: 2, row: 1 } },
  { id: '3', name: 'Editor', icon: '', status: 'done', deliverTo: null, desk: { col: 3, row: 1 } },
  { id: '4', name: 'Designer', icon: '', status: 'working', deliverTo: null, desk: { col: 1, row: 2 } },
  { id: '5', name: 'Reviewer', icon: '', status: 'checkpoint', deliverTo: null, desk: { col: 2, row: 2 } },
  { id: '6', name: 'Publisher', icon: '', status: 'idle', deliverTo: null, desk: { col: 3, row: 2 } },
];

export class OfficeScene extends Phaser.Scene {
  private agentSprites: Map<string, AgentSprite> = new Map();
  private roomBuilder!: RoomBuilder;
  private currentState: SquadState | null = null;

  constructor() {
    super({ key: 'OfficeScene' });
  }

  preload(): void {
    for (const [key, path] of Object.entries(DESK_PATHS)) {
      this.load.image(key, path);
    }
    for (const name of CHARACTER_NAMES) {
      const keys = avatarKeys(name);
      this.load.image(keys.blink, avatarPath(name, 'blink'));
      this.load.image(keys.talk, avatarPath(name, 'talk'));
      this.load.image(keys.wave1, avatarPath(name, 'wave1'));
      this.load.image(keys.wave2, avatarPath(name, 'wave2'));
    }
    for (const [key, path] of Object.entries(FURNITURE_PATHS)) {
      this.load.image(key, path);
    }
  }

  create(): void {
    this.roomBuilder = new RoomBuilder(this);
    this.events.on('stateUpdate', (state: SquadState | null) => {
      this.onStateUpdate(state);
    });
    this.renderScene(DEMO_AGENTS);
  }

  private onStateUpdate(state: SquadState | null): void {
    this.currentState = state;
    const agents = state?.agents ?? DEMO_AGENTS;
    this.renderScene(agents);
  }

  private renderScene(agents: Agent[]): void {
    let maxCol = 0, maxRow = 0;
    for (const agent of agents) {
      maxCol = Math.max(maxCol, agent.desk.col);
      maxRow = Math.max(maxRow, agent.desk.row);
    }
    const roomW = maxCol * CELL_W + MARGIN * 2;
    const roomH = maxRow * CELL_H + MARGIN * 2 + WALL_H;

    this.clearScene();
    this.roomBuilder.build(roomW, roomH);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const x = (agent.desk.col - 1) * CELL_W + MARGIN + CELL_W / 2;
      const y = (agent.desk.row - 1) * CELL_H + MARGIN + WALL_H + CELL_H / 2;
      const characterName = CHARACTER_NAMES[i % CHARACTER_NAMES.length];
      const deskVariant = i % 2 === 0 ? 'black' : 'white';
      const agentSprite = new AgentSprite(this, x, y, characterName, deskVariant, agent);
      this.agentSprites.set(agent.id, agentSprite);
    }

    this.scale.setGameSize(roomW, roomH);
  }

  private clearScene(): void {
    for (const sprite of this.agentSprites.values()) {
      sprite.destroy();
    }
    this.agentSprites.clear();
    this.children.removeAll(true);
  }
}
