import { getDirection } from './utils/math.js';

export class Projectile {
    constructor(startX, startY, targetX, targetY, damage, speed, color) {
        this.x = startX;
        this.y = startY;
        this.damage = damage;
        this.speed = speed;
        this.radius = 5;
        this.color = color;
        this.isDead = false;

        const dir = getDirection(startX, startY, targetX, targetY);
        this.velX = dir.x * this.speed;
        this.velY = dir.y * this.speed;
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;
    }

    draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
        const screenX = canvasWidth / 2 + (this.x - cameraX);
        const screenY = canvasHeight / 2 + (this.y - cameraY);

        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

export class Particle {
    constructor(worldX, worldY, color) {
        this.x = worldX;
        this.y = worldY;
        this.radius = Math.random() * 3 + 1;
        this.velX = (Math.random() - 0.5) * 6;
        this.velY = (Math.random() - 0.5) * 6;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.02;
        this.color = color;
        this.isDead = false;
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;
        this.alpha -= this.decay;
        if (this.alpha <= 0) this.isDead = true;
    }

    draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
        const screenX = canvasWidth / 2 + (this.x - cameraX);
        const screenY = canvasHeight / 2 + (this.y - cameraY);

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

export class ExperienceGem {
    constructor(worldX, worldY, value) {
        this.x = worldX;
        this.y = worldY;
        this.value = value;
        this.radius = 6;
        this.isDead = false;
    }

    draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
        const screenX = canvasWidth / 2 + (this.x - cameraX);
        const screenY = canvasHeight / 2 + (this.y - cameraY);

        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#2ecc71';
        ctx.fill();
        ctx.closePath();
    }
}