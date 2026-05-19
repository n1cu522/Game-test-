export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 18;
        this.speed = 3.5;
        this.hp = 100;
        this.maxHp = 100;
        this.xp = 0;
        this.nextLevelXp = 10;
        this.level = 1;

        this.weapons = {
            pistol: { level: 1, damage: 25, cooldown: 400, speed: 8, lastShot: 0 },
            shotgun: { level: 0, damage: 30, cooldown: 1500, speed: 7, lastShot: 0 },
            forcefield: { level: 0, damage: 12, cooldown: 1200, radius: 80, lastShot: 0 }
        };
    }

    update(keys, joystickVector) {
        let dx = 0;
        let dy = 0;

        if (joystickVector) {
            dx = joystickVector.x;
            dy = joystickVector.y;
        } else {
            if (keys['KeyW'] || keys['ArrowUp']) dy = -1;
            if (keys['KeyS'] || keys['ArrowDown']) dy = 1;
            if (keys['KeyA'] || keys['ArrowLeft']) dx = -1;
            if (keys['KeyD'] || keys['ArrowRight']) dx = 1;
        }

        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.nextLevelXp) {
            this.xp -= this.nextLevelXp;
            this.level++;
            this.nextLevelXp = Math.floor(this.nextLevelXp * 1.5) + 5;
            return true;
        }
        return false;
    }

    draw(ctx, screenX, screenY) {
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(screenX - 8, screenY + 4, 6, 12);
        ctx.fillRect(screenX + 2, screenY + 4, 6, 12);

        ctx.fillStyle = '#e67e22';
        ctx.fillRect(screenX - 12, screenY - 6, 24, 12);

        ctx.fillStyle = '#3498db';
        ctx.fillRect(screenX - 10, screenY - 4, 20, 10);

        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(screenX, screenY - 10, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(screenX - 8, screenY - 16, 16, 6);

        ctx.fillStyle = '#111111';
        ctx.fillRect(screenX + 2, screenY - 12, 2, 2);
        ctx.fillRect(screenX + 5, screenY - 12, 2, 2);

        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(screenX + 2, screenY - 8, 4, 1.5);
    }
}