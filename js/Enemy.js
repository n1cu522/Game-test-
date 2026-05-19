import { getDirection } from './utils/math.js';

export class Enemy {
    constructor(worldX, worldY, type = 0) {
        this.x = worldX;
        this.y = worldY;
        this.type = type;
        this.isDead = false;

        if (this.type === 1) {
            this.radius = 9;
            this.speed = 3.2;
            this.hp = 6;
            this.maxHp = 6;
            this.damage = 8;
            this.color = '#f39c12';
        } else if (this.type === 2) {
            this.radius = 20;
            this.speed = 1.2;
            this.hp = 35;
            this.maxHp = 35;
            this.damage = 20;
            this.color = '#27ae60';
        } else {
            this.radius = 13;
            this.speed = 2.0;
            this.hp = 12;
            this.maxHp = 12;
            this.damage = 12;
            this.color = '#95a5a6';
        }
    }

    update(playerWorldX, playerWorldY) {
        const dir = getDirection(this.x, this.y, playerWorldX, playerWorldY);
        this.x += dir.x * this.speed;
        this.y += dir.y * this.speed;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.isDead = true;
        }
    }

    draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
        const screenX = canvasWidth / 2 + (this.x - cameraX);
        const screenY = canvasHeight / 2 + (this.y - cameraY);

        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        if (this.hp < this.maxHp) {
            const barW = this.radius * 2;
            const barH = 4;
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(screenX - this.radius, screenY - this.radius - 8, barW, barH);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(screenX - this.radius, screenY - this.radius - 8, barW * (this.hp / this.maxHp), barH);
        }
    }
}