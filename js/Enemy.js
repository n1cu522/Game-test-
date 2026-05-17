import { getDirection } from './utils/math.js';

export class Enemy {
    constructor(worldX, worldY) {
        this.x = worldX;
        this.y = worldY;
        this.radius = 12;
        this.speed = 2;
        this.hp = 10;
        this.damage = 5;
    }

    update(playerWorldX, playerWorldY) {
        const dir = getDirection(this.x, this.y, playerWorldX, playerWorldY);
        this.x += dir.x * this.speed;
        this.y += dir.y * this.speed;
    }

    draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
        const screenX = canvasWidth / 2 + (this.x - cameraX);
        const screenY = canvasHeight / 2 + (this.y - cameraY);

        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.closePath();
    }
}