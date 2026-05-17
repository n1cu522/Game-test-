import { Player } from './Player.js';
import { Enemy } from './Enemy.js';

export class Engine {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        this.player = new Player(0, 0);
        this.enemies = [];
        this.keys = {};

        this.lastSpawnTime = 0;
        this.spawnInterval = 1000;

        this.joystick = {
            isActive: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            vector: { x: 0, y: 0 },
            maxRadius: 50
        };

        this.initInput();
    }

    initInput() {
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd(), { passive: false });

        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.joystick.isActive = true;
        this.joystick.startX = touch.clientX;
        this.joystick.startY = touch.clientY;
        this.joystick.currentX = touch.clientX;
        this.joystick.currentY = touch.clientY;
    }

    handleTouchMove(e) {
        if (!this.joystick.isActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.joystick.currentX = touch.clientX;
        this.joystick.currentY = touch.clientY;

        const dx = this.joystick.currentX - this.joystick.startX;
        const dy = this.joystick.currentY - this.joystick.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            this.joystick.vector = { x: 0, y: 0 };
        } else {
            this.joystick.vector = { x: dx / distance, y: dy / distance };
            
            if (distance > this.joystick.maxRadius) {
                this.joystick.currentX = this.joystick.startX + this.joystick.vector.x * this.joystick.maxRadius;
                this.joystick.currentY = this.joystick.startY + this.joystick.vector.y * this.joystick.maxRadius;
            }
        }
    }

    handleTouchEnd() {
        this.joystick.isActive = false;
        this.joystick.vector = { x: 0, y: 0 };
    }

    update() {
        this.player.update(this.keys, this.joystick.isActive ? this.joystick.vector : null);

        const currentTime = performance.now();
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            const angle = Math.random() * Math.PI * 2;
            const spawnDistance = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
            
            const spawnX = this.player.x + Math.cos(angle) * spawnDistance;
            const spawnY = this.player.y + Math.sin(angle) * spawnDistance;

            this.enemies.push(new Enemy(spawnX, spawnY));
            this.lastSpawnTime = currentTime;
        }

        for (let enemy of this.enemies) {
            enemy.update(this.player.x, this.player.y);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const screenX = this.canvas.width / 2;
        const screenY = this.canvas.height / 2;

        for (let enemy of this.enemies) {
            enemy.draw(this.ctx, this.player.x, this.player.y, this.canvas.width, this.canvas.height);
        }

        this.player.draw(this.ctx, screenX, screenY);

        if (this.joystick.isActive) {
            this.drawJoystick();
        }
    }

    drawJoystick() {
        this.ctx.beginPath();
        this.ctx.arc(this.joystick.startX, this.joystick.startY, this.joystick.maxRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.arc(this.joystick.currentX, this.joystick.currentY, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fill();
        this.ctx.closePath();
    }

    start() {
        const loop = () => {
            this.update();
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}