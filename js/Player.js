export class Player {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.radius = 16;
        this.speed = 3.5;
        this.hp = 100;
        this.maxHp = 100;
        
        this.level = 1;
        this.xp = 0;
        this.nextLevelXp = 10;

        this.weapons = {
            pistol: { level: 1, lastShot: 0, cooldown: 1200, damage: 6, speed: 7 },
            shotgun: { level: 0, lastShot: 0, cooldown: 2000, damage: 5, speed: 6 },
            forcefield: { level: 0, lastShot: 0, cooldown: 3000, radius: 70, damage: 15 }
        };
    }

    update(keys, joystickVector) {
        let moveX = 0;
        let moveY = 0;

        if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

        if (moveX !== 0 && moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }

        if (moveX === 0 && moveY === 0 && joystickVector) {
            moveX = joystickVector.x;
            moveY = joystickVector.y;
        }

        this.x += moveX * this.speed;
        this.y += moveY * this.speed;
    }

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.nextLevelXp) {
            this.xp -= this.nextLevelXp;
            this.level += 1;
            this.nextLevelXp = Math.floor(this.nextLevelXp * 1.4) + 5;
            return true;
        }
        return false;
    }

    draw(ctx, screenX, screenY) {
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.closePath();

        if (this.weapons.forcefield.level > 0) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.weapons.forcefield.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
    }
}