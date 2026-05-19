export class Enemy {
    constructor(x, y, type = 0) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.isDead = false;

        if (this.type === 1) {
            this.radius = 13;
            this.speed = 2.3;
            this.hp = 20;
            this.damage = 15;
            this.bodyColor = '#962d22';
            this.skinColor = '#d5a6bd';
            this.clothesColor = '#4a154b';
        } else if (this.type === 2) {
            this.radius = 25;
            this.speed = 0.8;
            this.hp = 80;
            this.damage = 35;
            this.bodyColor = '#4d058a';
            this.skinColor = '#a881af';
            this.clothesColor = '#1a0933';
        } else {
            this.radius = 16;
            this.speed = 1.3;
            this.hp = 35;
            this.damage = 10;
            this.bodyColor = '#27ae60';
            this.skinColor = '#a2d1a0';
            this.clothesColor = '#7f8c8d';
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) this.isDead = true;
    }

    update(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    draw(ctx, cameraX, cameraY, canvasW, canvasH) {
        const screenX = canvasW / 2 + (this.x - cameraX);
        const screenY = canvasH / 2 + (this.y - cameraY);

        if (screenX < -50 || screenX > canvasW + 50 || screenY < -50 || screenY > canvasH + 50) return;

        let scale = this.radius / 16;

        ctx.fillStyle = this.clothesColor;
        ctx.fillRect(screenX - 6 * scale, screenY + 4 * scale, 4 * scale, 10 * scale);
        ctx.fillRect(screenX + 2 * scale, screenY + 4 * scale, 4 * scale, 10 * scale);

        ctx.fillStyle = this.bodyColor;
        ctx.fillRect(screenX - 10 * scale, screenY - 5 * scale, 20 * scale, 10 * scale);

        ctx.fillStyle = this.skinColor;
        ctx.fillRect(screenX - 14 * scale, screenY - 3 * scale, 4 * scale, 4 * scale);
        ctx.fillRect(screenX + 10 * scale, screenY - 3 * scale, 4 * scale, 4 * scale);

        ctx.beginPath();
        ctx.arc(screenX, screenY - 10 * scale, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX - 4 * scale, screenY - 12 * scale, 2 * scale, 2 * scale);
        ctx.fillRect(screenX + 2 * scale, screenY - 12 * scale, 2 * scale, 2 * scale);

        ctx.fillStyle = '#222222';
        ctx.fillRect(screenX - 3 * scale, screenY - 7 * scale, 6 * scale, 2 * scale);
    }
}