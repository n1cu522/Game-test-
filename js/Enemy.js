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
            this.color = '#c0392b';
        } else if (this.type === 2) {
            this.radius = 25;
            this.speed = 0.8;
            this.hp = 80;
            this.damage = 35;
            this.color = '#8e44ad';
        } else {
            this.radius = 16;
            this.speed = 1.3;
            this.hp = 35;
            this.damage = 10;
            this.color = '#27ae60';
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

        if (screenX < -40 || screenX > canvasW + 40 || screenY < -40 || screenY > canvasH + 40) return;

        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = this.color;
        if (this.type === 1) {
            ctx.fillRect(screenX - 4, screenY - this.radius - 2, 4, 6);
            ctx.fillRect(screenX - 4, screenY + this.radius - 4, 4, 6);
        } else {
            ctx.fillRect(screenX + this.radius - 3, screenY - 7, 10, 4);
            ctx.fillRect(screenX + this.radius - 3, screenY + 3, 10, 4);
        }
    }
}