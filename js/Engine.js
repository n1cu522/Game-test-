import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Projectile, Particle, ExperienceGem } from './Weapon.js';
import { checkCollision, getDistance } from './utils/math.js';

export class Engine {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        this.player = new Player(0, 0);
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.gems = [];
        this.keys = {};

        this.lastSpawnTime = 0;
        this.spawnInterval = 1000;
        this.scoreTime = 0;
        this.startTime = performance.now();
        this.isGameOver = false;
        this.isLevelUpSelection = false;
        this.levelUpOptions = [];

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
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (this.isGameOver && e.code === 'KeyR') this.restart();
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

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
        
        if (this.isGameOver) {
            this.restart();
            return;
        }

        if (this.isLevelUpSelection) {
            this.handleUpgradeSelection(touch.clientX, touch.clientY);
            return;
        }

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

    handleTouchEnd(e) {
        e.preventDefault();
        this.joystick.isActive = false;
        this.joystick.vector = { x: 0, y: 0 };
    }

    handleUpgradeSelection(touchX, touchY) {
        const itemW = 260;
        const itemH = 70;
        const startX = this.canvas.width / 2 - itemW / 2;
        const startY = this.canvas.height / 2 - 60;

        for (let i = 0; i < this.levelUpOptions.length; i++) {
            const currentY = startY + i * (itemH + 15);
            if (touchX >= startX && touchX <= startX + itemW && touchY >= currentY && touchY <= currentY + itemH) {
                this.applyUpgrade(this.levelUpOptions[i]);
                break;
            }
        }
    }

    triggerLevelUp() {
        this.isLevelUpSelection = true;
        this.levelUpOptions = [];
        
        const list = [];
        if (this.player.weapons.pistol.level < 5) list.push('pistol');
        if (this.player.weapons.shotgun.level < 5) list.push('shotgun');
        if (this.player.weapons.forcefield.level < 5) list.push('forcefield');
        list.push('heal');

        while (this.levelUpOptions.length < Math.min(3, list.length)) {
            const randomType = list[Math.floor(Math.random() * list.length)];
            if (!this.levelUpOptions.includes(randomType)) {
                this.levelUpOptions.push(randomType);
            }
        }
    }

    applyUpgrade(type) {
        if (type === 'heal') {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 35);
        } else {
            const weapon = this.player.weapons[type];
            weapon.level += 1;
            if (weapon.level === 1) {
                weapon.lastShot = performance.now();
            } else {
                weapon.damage = Math.floor(weapon.damage * 1.3);
                weapon.cooldown = Math.floor(weapon.cooldown * 0.85);
                if (type === 'forcefield') weapon.radius += 15;
            }
        }
        this.isLevelUpSelection = false;
    }

    findClosestEnemy() {
        let closest = null;
        let minDist = Infinity;
        for (let enemy of this.enemies) {
            const dist = getDistance(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < minDist) {
                minDist = dist;
                closest = enemy;
            }
        }
        return closest;
    }

    fireWeapons(currentTime) {
        const closest = this.findClosestEnemy();

        if (this.player.weapons.pistol.level > 0 && currentTime - this.player.weapons.pistol.lastShot > this.player.weapons.pistol.cooldown) {
            if (closest) {
                this.projectiles.push(new Projectile(
                    this.player.x, this.player.y, closest.x, closest.y,
                    this.player.weapons.pistol.damage, this.player.weapons.pistol.speed, '#f1c40f'
                ));
                this.player.weapons.pistol.lastShot = currentTime;
            }
        }

        if (this.player.weapons.shotgun.level > 0 && currentTime - this.player.weapons.shotgun.lastShot > this.player.weapons.shotgun.cooldown) {
            if (closest) {
                const baseAngle = Math.atan2(closest.y - this.player.y, closest.x - this.player.x);
                const angles = [baseAngle - 0.2, baseAngle, baseAngle + 0.2];
                for (let angle of angles) {
                    const tX = this.player.x + Math.cos(angle) * 100;
                    const tY = this.player.y + Math.sin(angle) * 100;
                    this.projectiles.push(new Projectile(
                        this.player.x, this.player.y, tX, tY,
                        this.player.weapons.shotgun.damage, this.player.weapons.shotgun.speed, '#e67e22'
                    ));
                }
                this.player.weapons.shotgun.lastShot = currentTime;
            }
        }

        if (this.player.weapons.forcefield.level > 0 && currentTime - this.player.weapons.forcefield.lastShot > this.player.weapons.forcefield.cooldown) {
            const ffield = this.player.weapons.forcefield;
            for (let enemy of this.enemies) {
                if (getDistance(this.player.x, this.player.y, enemy.x, enemy.y) <= ffield.radius) {
                    enemy.takeDamage(ffield.damage);
                    for (let i = 0; i < 4; i++) {
                        this.particles.push(new Particle(enemy.x, enemy.y, '#3498db'));
                    }
                }
            }
            this.player.weapons.forcefield.lastShot = currentTime;
        }
    }

    update() {
        if (this.isGameOver || this.isLevelUpSelection) return;

        const currentTime = performance.now();
        this.scoreTime = Math.floor((currentTime - this.startTime) / 1000);

        this.player.update(this.keys, this.joystick.isActive ? this.joystick.vector : null);

        this.fireWeapons(currentTime);

        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            const angle = Math.random() * Math.PI * 2;
            const spawnDistance = Math.max(this.canvas.width, this.canvas.height) / 2 + 60;
            const spawnX = this.player.x + Math.cos(angle) * spawnDistance;
            const spawnY = this.player.y + Math.sin(angle) * spawnDistance;

            let rand = Math.random();
            let type = 0;
            if (this.scoreTime > 20 && rand < 0.25) type = 1;
            if (this.scoreTime > 45 && rand > 0.80) type = 2;

            this.enemies.push(new Enemy(spawnX, spawnY, type));
            this.lastSpawnTime = currentTime;
            this.spawnInterval = Math.max(300, 1000 - Math.floor(this.scoreTime / 10) * 80);
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update();

            if (getDistance(this.player.x, this.player.y, p.x, p.y) > 1200) {
                this.projectiles.splice(i, 1);
                continue;
            }

            for (let enemy of this.enemies) {
                if (checkCollision(p, enemy)) {
                    enemy.takeDamage(p.damage);
                    p.isDead = true;
                    for (let k = 0; i < 6; i++) {
                        this.particles.push(new Particle(enemy.x, enemy.y, '#27ae60'));
                    }
                    break;
                }
            }

            if (p.isDead) this.projectiles.splice(i, 1);
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(this.player.x, this.player.y);

            if (checkCollision(this.player, enemy)) {
                this.player.hp -= enemy.damage / 60;
                if (this.player.hp <= 0) {
                    this.isGameOver = true;
                }
            }

            if (enemy.isDead) {
                this.gems.push(new ExperienceGem(enemy.x, enemy.y, enemy.type === 2 ? 5 : (enemy.type === 1 ? 2 : 1)));
                this.enemies.splice(i, 1);
            }
        }

        for (let i = this.gems.length - 1; i >= 0; i--) {
            const gem = this.gems[i];
            if (checkCollision(this.player, gem)) {
                const leveledUp = this.player.gainXp(gem.value);
                gem.isDead = true;
                if (leveledUp) {
                    this.triggerLevelUp();
                }
            }
            if (gem.isDead) this.gems.splice(i, 1);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead) this.particles.splice(i, 1);
        }
    }

    render() {
        this.ctx.fillStyle = '#1c1c1c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cameraX = this.player.x;
        const cameraY = this.player.y;

        this.ctx.strokeStyle = '#282828';
        this.ctx.lineWidth = 1;
        const gridSize = 80;
        const startGridX = Math.floor((cameraX - this.canvas.width / 2) / gridSize) * gridSize;
        const startGridY = Math.floor((cameraY - this.canvas.height / 2) / gridSize) * gridSize;

        for (let x = startGridX; x < cameraX + this.canvas.width / 2 + gridSize; x += gridSize) {
            const sX = this.canvas.width / 2 + (x - cameraX);
            this.ctx.beginPath();
            this.ctx.moveTo(sX, 0);
            this.ctx.lineTo(sX, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = startGridY; y < cameraY + this.canvas.height / 2 + gridSize; y += gridSize) {
            const sY = this.canvas.height / 2 + (y - cameraY);
            this.ctx.beginPath();
            this.ctx.moveTo(0, sY);
            this.ctx.lineTo(this.canvas.width, sY);
            this.ctx.stroke();
        }

        for (let gem of this.gems) gem.draw(this.ctx, cameraX, cameraY, this.canvas.width, this.canvas.height);
        for (let enemy of this.enemies) enemy.draw(this.ctx, cameraX, cameraY, this.canvas.width, this.canvas.height);
        for (let p of this.projectiles) p.draw(this.ctx, cameraX, cameraY, this.canvas.width, this.canvas.height);
        for (let part of this.particles) part.draw(this.ctx, cameraX, cameraY, this.canvas.width, this.canvas.height);

        this.player.draw(this.ctx, this.canvas.width / 2, this.canvas.height / 2);

        if (this.joystick.isActive) this.drawJoystick();

        this.drawUI();

        if (this.isLevelUpSelection) this.drawLevelUpMenu();
        if (this.isGameOver) this.drawGameOverScreen();
    }

    drawJoystick() {
        this.ctx.beginPath();
        this.ctx.arc(this.joystick.startX, this.joystick.startY, this.joystick.maxRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(this.joystick.currentX, this.joystick.currentY, 18, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        this.ctx.fill();
    }

    drawUI() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(10, 10, this.canvas.width - 20, 14);
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(10, 10, (this.canvas.width - 20) * (this.player.xp / this.player.nextLevelXp), 14);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.fillText(`LVL ${this.player.level}`, 15, 21);

        const hpBarW = 140;
        const hpX = this.canvas.width / 2 - hpBarW / 2;
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(hpX, 35, hpBarW, 8);
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(hpX, 35, hpBarW * (Math.max(0, this.player.hp) / this.player.maxHp), 8);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px sans-serif';
        this.ctx.textAlign = 'center';
        
        const min = Math.floor(this.scoreTime / 60);
        const sec = this.scoreTime % 60;
        this.ctx.fillText(`${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`, this.canvas.width / 2, 65);
    }

    drawLevelUpMenu() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#2ecc71';
        this.ctx.font = 'bold 24px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL UP', this.canvas.width / 2, this.canvas.height / 2 - 100);

        const itemW = 260;
        const itemH = 70;
        const startX = this.canvas.width / 2 - itemW / 2;
        const startY = this.canvas.height / 2 - 60;

        this.levelUpOptions.forEach((option, i) => {
            const currentY = startY + i * (itemH + 15);
            
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.fillRect(startX, currentY, itemW, itemH);
            this.ctx.strokeStyle = '#34495e';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(startX, currentY, itemW, itemH);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px sans-serif';
            this.ctx.textAlign = 'left';

            let title = '';
            let desc = '';
            if (option === 'pistol') { title = 'Pistol +1'; desc = 'Increases rate and damage'; }
            if (option === 'shotgun') { title = 'Shotgun'; desc = 'Fires multi-directional cone'; }
            if (option === 'forcefield') { title = 'Forcefield'; desc = 'Aura damages closest enemies'; }
            if (option === 'heal') { title = 'Medkit'; desc = 'Restores 35 HP instantly'; }

            this.ctx.fillText(title, startX + 15, currentY + 30);
            this.ctx.fillStyle = '#bdc3c7';
            this.ctx.font = '12px sans-serif';
            this.ctx.fillText(desc, startX + 15, currentY + 52);
        });
    }

    drawGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#c0392b';
        this.ctx.font = 'bold 36px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DIED', this.canvas.width / 2, this.canvas.height / 2 - 40);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px sans-serif';
        this.ctx.fillText(`Survived: ${this.scoreTime} seconds`, this.canvas.width / 2, this.canvas.height / 2 + 10);

        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.font = '14px sans-serif';
        this.ctx.fillText('Tap screen or Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }

    restart() {
        this.player = new Player(0, 0);
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.gems = [];
        this.startTime = performance.now();
        this.scoreTime = 0;
        this.isGameOver = false;
        this.isLevelUpSelection = false;
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