export function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function getDirection(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return { x: 0, y: 0 };
    return { x: dx / distance, y: dy / distance };
}

export function checkCollision(obj1, obj2) {
    const dist = getDistance(obj1.x, obj1.y, obj2.x, obj2.y);
    return dist < (obj1.radius + obj2.radius);
}