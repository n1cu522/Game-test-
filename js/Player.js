export class Player {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.radius = 16;
        this.speed = 4;
        this.hp = 100;
        this.maxHp = 100;
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

    draw(ctx, screenX, screenY) {
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.closePath();
    }
}