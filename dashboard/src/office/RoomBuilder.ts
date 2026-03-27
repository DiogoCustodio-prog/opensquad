import Phaser from 'phaser';
import { COLORS, TILE, MARGIN, WALL_H } from './palette';
import { FURNITURE_KEYS } from './assetKeys';

export class RoomBuilder {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  build(roomW: number, roomH: number): void {
    this.drawFloor(roomW, roomH);
    this.drawWalls(roomW);
    this.placeFurniture(roomW, roomH);
  }

  private drawFloor(roomW: number, roomH: number): void {
    const g = this.scene.add.graphics();
    g.fillStyle(COLORS.floor, 1);
    g.fillRect(0, WALL_H, roomW, roomH - WALL_H);
    g.fillStyle(COLORS.floorAlt, 0.3);
    for (let y = WALL_H; y < roomH; y += TILE) {
      for (let x = 0; x < roomW; x += TILE) {
        if ((x / TILE + y / TILE) % 2 === 0) {
          g.fillRect(x, y, TILE, TILE);
        }
      }
    }
    g.setDepth(-2);
  }

  private drawWalls(roomW: number): void {
    const g = this.scene.add.graphics();
    g.fillStyle(COLORS.wall, 1);
    g.fillRect(0, 0, roomW, WALL_H);
    g.fillStyle(COLORS.wallTrim, 1);
    g.fillRect(0, WALL_H - 4, roomW, 4);
    g.setDepth(-1);
  }

  placeFurniture(roomW: number, roomH: number): void {
    const s = this.scene;
    const centerX = roomW / 2;

    s.add.image(MARGIN + 64, WALL_H - 16, FURNITURE_KEYS.bookshelf)
      .setOrigin(0.5, 1).setDepth(0);
    s.add.image(centerX, WALL_H - 20, FURNITURE_KEYS.whiteboard)
      .setOrigin(0.5, 1).setDepth(0);
    s.add.image(centerX + 100, WALL_H - 28, FURNITURE_KEYS.clock)
      .setOrigin(0.5, 1).setDepth(0);
    s.add.image(roomW - MARGIN - 40, WALL_H - 16, FURNITURE_KEYS.blinds)
      .setOrigin(0.5, 1).setDepth(0);

    s.add.image(centerX, roomH * 0.65, FURNITURE_KEYS.rug)
      .setOrigin(0.5, 0.5).setDepth(roomH * 0.65);
    s.add.image(MARGIN, roomH * 0.5, FURNITURE_KEYS.plant1)
      .setOrigin(0.5, 1).setDepth(roomH * 0.5);
    s.add.image(roomW - MARGIN, roomH * 0.5, FURNITURE_KEYS.plant2)
      .setOrigin(0.5, 1).setDepth(roomH * 0.5);

    const couchY = roomH - MARGIN - TILE;
    s.add.image(MARGIN + 48, couchY, FURNITURE_KEYS.couch)
      .setOrigin(0.5, 1).setDepth(couchY);
    s.add.image(MARGIN + 48 + 80, couchY - 8, FURNITURE_KEYS.coffeeTable)
      .setOrigin(0.5, 1).setDepth(couchY - 8);
  }
}
