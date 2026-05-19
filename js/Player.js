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
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX + 5, screenY - 5, 4, 0, Math.PI * 2);
        ctx.arc(screenX + 5, screenY + 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(screenX + 7, screenY - 5, 1.5, 0, Math.PI * 2);
        ctx.arc(screenX + 7, screenY + 5, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}