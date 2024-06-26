const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let player = { segment: 0 };
let enemies = [];
let bullets = [];
let score = 0;
let level = 1;
let lives = 3;
let gameOver = false;

const PLAYER_SIZE = 15;
const ENEMY_SIZE = 10;
const BULLET_RADIUS = 2;
const ENEMY_SPEED = 0.5;
const BULLET_SPEED = 5;
const SEGMENTS = 16;
const INNER_RADIUS = 100;
const OUTER_RADIUS = 300;

function createGrid() {
    let grid = [];
    for (let i = 0; i < SEGMENTS; i++) {
        const angle = (i / SEGMENTS) * Math.PI * 2;
        grid.push({
            innerX: Math.cos(angle) * INNER_RADIUS + canvas.width / 2,
            innerY: Math.sin(angle) * INNER_RADIUS + canvas.height / 2,
            outerX: Math.cos(angle) * OUTER_RADIUS + canvas.width / 2,
            outerY: Math.sin(angle) * OUTER_RADIUS + canvas.height / 2
        });
    }
    return grid;
}

const grid = createGrid();

function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

function update() {
    enemies.forEach((enemy, index) => {
        enemy.t += ENEMY_SPEED / 100;
        enemy.x = enemy.startX + (enemy.endX - enemy.startX) * enemy.t;
        enemy.y = enemy.startY + (enemy.endY - enemy.startY) * enemy.t;

        if (enemy.t >= 1) {
            enemies.splice(index, 1);
        }

        // Check collision with player
        const nextPlayerSegment = (player.segment + 1) % SEGMENTS;
        const playerX = (grid[player.segment].outerX + grid[nextPlayerSegment].outerX) / 2;
        const playerY = (grid[player.segment].outerY + grid[nextPlayerSegment].outerY) / 2;

        if (Math.hypot(enemy.x - playerX, enemy.y - playerY) < PLAYER_SIZE + ENEMY_SIZE) {
            enemies.splice(index, 1);
            lives--;
            if (lives <= 0) gameOver = true;
        }
    });

    bullets.forEach((bullet, index) => {
        bullet.t += BULLET_SPEED / 100;
        bullet.x = bullet.startX + (bullet.endX - bullet.startX) * bullet.t;
        bullet.y = bullet.startY + (bullet.endY - bullet.startY) * bullet.t;

        if (bullet.t >= 1) {
            bullets.splice(index, 1);
        }

        enemies.forEach((enemy, enemyIndex) => {
            if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < BULLET_RADIUS + ENEMY_SIZE) {
                enemies.splice(enemyIndex, 1);
                bullets.splice(index, 1);
                score += 10;
            }
        });
    });

    if (Math.random() < 0.02) {
        const segment = Math.floor(Math.random() * SEGMENTS);
        const nextSegment = (segment + 1) % SEGMENTS;
        enemies.push({
            startX: (grid[segment].innerX + grid[nextSegment].innerX) / 2,
            startY: (grid[segment].innerY + grid[nextSegment].innerY) / 2,
            endX: (grid[segment].outerX + grid[nextSegment].outerX) / 2,
            endY: (grid[segment].outerY + grid[nextSegment].outerY) / 2,
            t: 0
        });
    }
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 1;
    ctx.beginPath();
    grid.forEach(point => {
        ctx.moveTo(point.innerX, point.innerY);
        ctx.lineTo(point.outerX, point.outerY);
    });
    for (let i = 0; i < SEGMENTS; i++) {
        ctx.moveTo(grid[i].innerX, grid[i].innerY);
        ctx.lineTo(grid[(i + 1) % SEGMENTS].innerX, grid[(i + 1) % SEGMENTS].innerY);
        ctx.moveTo(grid[i].outerX, grid[i].outerY);
        ctx.lineTo(grid[(i + 1) % SEGMENTS].outerX, grid[(i + 1) % SEGMENTS].outerY);
    }
    ctx.stroke();

    // Draw player
    const nextSegment = (player.segment + 1) % SEGMENTS;
    const playerX = (grid[player.segment].outerX + grid[nextSegment].outerX) / 2;
    const playerY = (grid[player.segment].outerY + grid[nextSegment].outerY) / 2;
    const angle = Math.atan2(canvas.height / 2 - playerY, canvas.width / 2 - playerX);

    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(
        playerX + Math.cos(angle) * PLAYER_SIZE,
        playerY + Math.sin(angle) * PLAYER_SIZE
    );
    ctx.lineTo(
        playerX + Math.cos(angle + 2.5) * PLAYER_SIZE,
        playerY + Math.sin(angle + 2.5) * PLAYER_SIZE
    );
    ctx.lineTo(
        playerX + Math.cos(angle - 2.5) * PLAYER_SIZE,
        playerY + Math.sin(angle - 2.5) * PLAYER_SIZE
    );
    ctx.closePath();
    ctx.fill();

    // Draw enemies
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, ENEMY_SIZE, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw bullets
    ctx.fillStyle = 'yellow';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw score, level, and lives
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 10, 60);
    ctx.fillText(`Lives: ${lives}`, 10, 90);

    // Draw game over screen
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    }

    // Draw controls
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Controls:', canvas.width - 150, 30);
    ctx.fillText('Left Arrow: Move Left', canvas.width - 150, 60);
    ctx.fillText('Right Arrow: Move Right', canvas.width - 150, 90);
    ctx.fillText('Space: Shoot', canvas.width - 150, 120);
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowLeft') {
        player.segment = (player.segment - 1 + SEGMENTS) % SEGMENTS;
    } else if (event.code === 'ArrowRight') {
        player.segment = (player.segment + 1) % SEGMENTS;
    } else if (event.code === 'Space') {
        const nextSegment = (player.segment + 1) % SEGMENTS;
        const startX = (grid[player.segment].outerX + grid[nextSegment].outerX) / 2;
        const startY = (grid[player.segment].outerY + grid[nextSegment].outerY) / 2;
        const endX = canvas.width / 2;
        const endY = canvas.height / 2;
        bullets.push({ startX, startY, endX, endY, x: startX, y: startY, t: 0 });
    }
});

gameLoop();