class PacmanGame {
    constructor() {
        this.config = {
            cellSize: 25,
            mapWidth: 21,
            mapHeight: 19,
            gameTime: 120,
            dotScore: 10,
            powerPelletScore: 50,
            ghostKillScore: 200,
            playerLives: 3,
            playerSpeed: 0.08,
            ghostSpeed: 0.06,
            powerPelletDuration: 10000,
            speedBoostDuration: 5000,
            invincibilityDuration: 5000,
            freezeDuration: 5000,
            ghostRespawnTime: 5000,
            playerRespawnTime: 2000
        };
        
        this.directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 },
            none: { x: 0, y: 0 }
        };
        
        this.gameState = 'start'; // start, playing, paused, gameOver
        this.isMuted = false;
        this.timer = null;
        this.animationFrame = null;
        this.lastTime = 0;
        this.elapsedTime = 0;
        
        this.players = [];
        this.ghosts = [];
        this.dots = [];
        this.powerPellets = [];
        this.powerUps = [];
        this.scorePopups = [];
        
        this.map = [];
        this.initMap();
        
        this.elements = {
            gameBoard: document.getElementById('game-board'),
            player1Score: document.getElementById('player1-score'),
            player2Score: document.getElementById('player2-score'),
            player1Lives: document.getElementById('player1-lives'),
            player2Lives: document.getElementById('player2-lives'),
            gameTimer: document.getElementById('game-timer'),
            pauseBtn: document.getElementById('pause-btn'),
            restartBtn: document.getElementById('restart-btn'),
            muteBtn: document.getElementById('mute-btn'),
            gameOverlay: document.getElementById('game-overlay'),
            overlayTitle: document.getElementById('overlay-title'),
            overlayMessage: document.getElementById('overlay-message')
        };
        
        this.init();
    }
    
    initMap() {
        const wall = 1;
        const path = 0;
        const ghostHouse = 2;
        const player1Start = 3;
        const player2Start = 4;
        const ghostStart = 5;
        
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
            [1,0,0,0,0,1,0,0,0,1,1,1,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1],
            [0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0],
            [1,1,1,1,0,1,0,1,1,2,2,2,1,1,0,1,0,1,1,1,1],
            [0,0,0,0,0,0,0,1,2,2,5,2,2,1,0,0,0,0,0,0,0],
            [1,1,1,1,0,1,0,1,1,2,2,2,1,1,0,1,0,1,1,1,1],
            [0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0],
            [1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,1,0,1],
            [1,0,0,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,0,0,1],
            [1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.player1StartPos = { x: 1, y: 17 };
        this.player2StartPos = { x: 19, y: 17 };
        this.ghostStartPos = [
            { x: 9, y: 9 },
            { x: 11, y: 9 },
            { x: 10, y: 8 },
            { x: 10, y: 9 }
        ];
    }
    
    init() {
        this.setupBoard();
        this.setupEventListeners();
        this.initGameObjects();
        this.render();
        this.showOverlay('游戏开始', '按空格键开始游戏');
    }
    
    setupBoard() {
        this.elements.gameBoard.style.gridTemplateColumns = `repeat(${this.config.mapWidth}, ${this.config.cellSize}px)`;
        this.elements.gameBoard.style.gridTemplateRows = `repeat(${this.config.mapHeight}, ${this.config.cellSize}px)`;
        
        this.elements.gameBoard.innerHTML = '';
        
        for (let y = 0; y < this.config.mapHeight; y++) {
            for (let x = 0; x < this.config.mapWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                if (this.map[y][x] === 1) {
                    cell.classList.add('wall');
                }
                
                this.elements.gameBoard.appendChild(cell);
            }
        }
    }
    
    initGameObjects() {
        this.players = [
            {
                id: 1,
                x: this.player1StartPos.x,
                y: this.player1StartPos.y,
                direction: this.directions.right,
                nextDirection: this.directions.none,
                score: 0,
                lives: this.config.playerLives,
                color: 'player1-body',
                speed: this.config.playerSpeed,
                isAlive: true,
                isInvincible: false,
                hasSpeedBoost: false,
                powerPelletActive: false
            },
            {
                id: 2,
                x: this.player2StartPos.x,
                y: this.player2StartPos.y,
                direction: this.directions.left,
                nextDirection: this.directions.none,
                score: 0,
                lives: this.config.playerLives,
                color: 'player2-body',
                speed: this.config.playerSpeed,
                isAlive: true,
                isInvincible: false,
                hasSpeedBoost: false,
                powerPelletActive: false
            }
        ];
        
        const ghostColors = ['ghost-red', 'ghost-pink', 'ghost-blue', 'ghost-orange'];
        this.ghosts = [];
        
        for (let i = 0; i < 4; i++) {
            this.ghosts.push({
                id: i,
                x: this.ghostStartPos[i].x,
                y: this.ghostStartPos[i].y,
                direction: this.directions.none,
                color: ghostColors[i],
                speed: this.config.ghostSpeed,
                isAlive: true,
                isScared: false,
                isFrozen: false,
                mode: 'patrol'
            });
        }
        
        this.generateDots();
        this.generatePowerPellets();
        this.powerUps = [];
        this.scorePopups = [];
        this.elapsedTime = 0;
    }
    
    generateDots() {
        this.dots = [];
        
        for (let y = 0; y < this.config.mapHeight; y++) {
            for (let x = 0; x < this.config.mapWidth; x++) {
                if (this.map[y][x] === 0 || this.map[y][x] === 3 || this.map[y][x] === 4) {
                    if ((x !== this.player1StartPos.x || y !== this.player1StartPos.y) &&
                        (x !== this.player2StartPos.x || y !== this.player2StartPos.y)) {
                        this.dots.push({ x, y, collected: false });
                    }
                }
            }
        }
    }
    
    generatePowerPellets() {
        this.powerPellets = [];
        
        const powerPelletPositions = [
            { x: 1, y: 1 },
            { x: 19, y: 1 },
            { x: 1, y: 13 },
            { x: 19, y: 13 }
        ];
        
        powerPelletPositions.forEach(pos => {
            if (this.map[pos.y][pos.x] === 0) {
                this.powerPellets.push({ x: pos.x, y: pos.y, collected: false });
                
                const dotIndex = this.dots.findIndex(dot => dot.x === pos.x && dot.y === pos.y);
                if (dotIndex !== -1) {
                    this.dots.splice(dotIndex, 1);
                }
            }
        });
    }
    
    generatePowerUp() {
        if (Math.random() > 0.3) return;
        
        const types = ['speed-boost', 'freeze', 'invincibility'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const availableCells = [];
        for (let y = 0; y < this.config.mapHeight; y++) {
            for (let x = 0; x < this.config.mapWidth; x++) {
                if (this.map[y][x] === 0) {
                    const hasDot = this.dots.some(dot => dot.x === x && dot.y === y && !dot.collected);
                    const hasPowerPellet = this.powerPellets.some(p => p.x === x && p.y === y && !p.collected);
                    const hasPowerUp = this.powerUps.some(p => p.x === x && p.y === y);
                    
                    if (!hasDot && !hasPowerPellet && !hasPowerUp) {
                        availableCells.push({ x, y });
                    }
                }
            }
        }
        
        if (availableCells.length > 0) {
            const pos = availableCells[Math.floor(Math.random() * availableCells.length)];
            this.powerUps.push({
                x: pos.x,
                y: pos.y,
                type: type,
                spawnTime: Date.now(),
                duration: 10000
            });
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.restartBtn.addEventListener('click', () => this.restart());
        this.elements.muteBtn.addEventListener('click', () => this.toggleMute());
    }
    
    handleKeyDown(e) {
        e.preventDefault();
        
        switch (e.code) {
            case 'KeyW':
                this.players[0].nextDirection = this.directions.up;
                break;
            case 'KeyS':
                this.players[0].nextDirection = this.directions.down;
                break;
            case 'KeyA':
                this.players[0].nextDirection = this.directions.left;
                break;
            case 'KeyD':
                this.players[0].nextDirection = this.directions.right;
                break;
                
            case 'ArrowUp':
                this.players[1].nextDirection = this.directions.up;
                break;
            case 'ArrowDown':
                this.players[1].nextDirection = this.directions.down;
                break;
            case 'ArrowLeft':
                this.players[1].nextDirection = this.directions.left;
                break;
            case 'ArrowRight':
                this.players[1].nextDirection = this.directions.right;
                break;
                
            case 'KeyP':
                this.togglePause();
                break;
            case 'KeyR':
                this.restart();
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'Space':
                if (this.gameState === 'start' || this.gameState === 'gameOver') {
                    this.start();
                }
                break;
        }
    }
    
    start() {
        if (this.gameState === 'playing') return;
        
        this.initGameObjects();
        this.gameState = 'playing';
        this.hideOverlay();
        this.lastTime = performance.now();
        
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.updateTimer(), 1000);
        
        this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    restart() {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        if (this.timer) clearInterval(this.timer);
        
        this.elements.player1Score.textContent = '0';
        this.elements.player2Score.textContent = '0';
        this.elements.player1Lives.textContent = '3';
        this.elements.player2Lives.textContent = '3';
        this.elements.gameTimer.textContent = this.config.gameTime;
        
        this.start();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            if (this.timer) clearInterval(this.timer);
            this.showOverlay('游戏暂停', '按空格键或P键继续');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideOverlay();
            this.timer = setInterval(() => this.updateTimer(), 1000);
            this.lastTime = performance.now();
            this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.elements.muteBtn.textContent = this.isMuted ? '取消静音 (M)' : '静音 (M)';
    }
    
    updateTimer() {
        if (this.gameState !== 'playing') return;
        
        const currentTime = parseInt(this.elements.gameTimer.textContent);
        if (currentTime > 0) {
            this.elements.gameTimer.textContent = currentTime - 1;
        } else {
            this.endGame();
        }
    }
    
    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.elapsedTime += deltaTime;
        
        if (Math.floor(this.elapsedTime) % 10 === 0 && Math.floor(this.elapsedTime) !== Math.floor(this.elapsedTime - deltaTime)) {
            this.generatePowerUp();
        }
        
        this.players.forEach(player => {
            if (player.isAlive) {
                this.updatePlayer(player, deltaTime);
            }
        });
        
        this.ghosts.forEach(ghost => {
            if (ghost.isAlive && !ghost.isFrozen) {
                this.updateGhost(ghost, deltaTime);
            }
        });
        
        this.checkCollisions();
        this.updatePowerUps();
        this.updateScorePopups();
        
        if (this.allDotsCollected()) {
            this.endGame();
        }
    }
    
    updatePlayer(player, deltaTime) {
        const cellX = Math.round(player.x);
        const cellY = Math.round(player.y);
        
        const isAtCenter = Math.abs(player.x - cellX) < 0.05 && Math.abs(player.y - cellY) < 0.05;
        
        if (isAtCenter) {
            player.x = cellX;
            player.y = cellY;
            
            if (player.nextDirection !== this.directions.none) {
                const nextX = cellX + player.nextDirection.x;
                const nextY = cellY + player.nextDirection.y;
                
                if (!this.isWall(nextX, nextY)) {
                    player.direction = player.nextDirection;
                    player.nextDirection = this.directions.none;
                }
            }
            
            const newDirectionX = cellX + player.direction.x;
            const newDirectionY = cellY + player.direction.y;
            
            if (this.isWall(newDirectionX, newDirectionY)) {
                player.direction = this.directions.none;
            }
        }
        
        if (player.direction === this.directions.none) return;
        
        const speed = player.hasSpeedBoost ? player.speed * 2 : player.speed;
        const moveAmount = speed * deltaTime * 60;
        
        let newX = player.x + player.direction.x * moveAmount;
        let newY = player.y + player.direction.y * moveAmount;
        
        if (player.direction.x !== 0) {
            const targetCellX = Math.round(newX);
            
            if (this.isWall(targetCellX, cellY)) {
                const wallBoundary = player.direction.x > 0 ? targetCellX - 0.5 : targetCellX + 0.5;
                if ((player.direction.x > 0 && newX >= wallBoundary) || 
                    (player.direction.x < 0 && newX <= wallBoundary)) {
                    newX = wallBoundary;
                    player.direction = this.directions.none;
                }
            }
        }
        
        if (player.direction.y !== 0) {
            const targetCellY = Math.round(newY);
            
            if (this.isWall(cellX, targetCellY)) {
                const wallBoundary = player.direction.y > 0 ? targetCellY - 0.5 : targetCellY + 0.5;
                if ((player.direction.y > 0 && newY >= wallBoundary) || 
                    (player.direction.y < 0 && newY <= wallBoundary)) {
                    newY = wallBoundary;
                    player.direction = this.directions.none;
                }
            }
        }
        
        player.x = newX;
        player.y = newY;
        
        if (player.x <= -0.5) player.x = this.config.mapWidth - 0.5;
        if (player.x >= this.config.mapWidth - 0.5) player.x = -0.5;
    }
    
    updateGhost(ghost, deltaTime) {
        const cellX = Math.round(ghost.x);
        const cellY = Math.round(ghost.y);
        
        const isAtCenter = Math.abs(ghost.x - cellX) < 0.05 && Math.abs(ghost.y - cellY) < 0.05;
        
        if (isAtCenter) {
            ghost.x = cellX;
            ghost.y = cellY;
            
            if (ghost.isScared) {
                ghost.direction = this.getRandomDirection(ghost);
            } else {
                const nearestPlayer = this.findNearestPlayer(ghost);
                if (nearestPlayer && Math.random() > 0.3) {
                    ghost.direction = this.getDirectionTowards(ghost, nearestPlayer);
                } else {
                    ghost.direction = this.getRandomDirection(ghost);
                }
            }
        }
        
        if (ghost.direction === this.directions.none) return;
        
        const speed = ghost.isScared ? ghost.speed * 0.5 : ghost.speed;
        const moveAmount = speed * deltaTime * 60;
        
        let newX = ghost.x + ghost.direction.x * moveAmount;
        let newY = ghost.y + ghost.direction.y * moveAmount;
        
        if (ghost.direction.x !== 0) {
            const targetCellX = Math.round(newX);
            
            if (this.isWall(targetCellX, cellY)) {
                const wallBoundary = ghost.direction.x > 0 ? targetCellX - 0.5 : targetCellX + 0.5;
                if ((ghost.direction.x > 0 && newX >= wallBoundary) || 
                    (ghost.direction.x < 0 && newX <= wallBoundary)) {
                    newX = wallBoundary;
                    ghost.direction = this.getRandomDirection(ghost);
                }
            }
        }
        
        if (ghost.direction.y !== 0) {
            const targetCellY = Math.round(newY);
            
            if (this.isWall(cellX, targetCellY)) {
                const wallBoundary = ghost.direction.y > 0 ? targetCellY - 0.5 : targetCellY + 0.5;
                if ((ghost.direction.y > 0 && newY >= wallBoundary) || 
                    (ghost.direction.y < 0 && newY <= wallBoundary)) {
                    newY = wallBoundary;
                    ghost.direction = this.getRandomDirection(ghost);
                }
            }
        }
        
        ghost.x = newX;
        ghost.y = newY;
        
        if (ghost.x <= -0.5) ghost.x = this.config.mapWidth - 0.5;
        if (ghost.x >= this.config.mapWidth - 0.5) ghost.x = -0.5;
    }
    
    getRandomDirection(ghost) {
        const directions = [this.directions.up, this.directions.down, this.directions.left, this.directions.right];
        const validDirections = [];
        
        const currentX = Math.round(ghost.x);
        const currentY = Math.round(ghost.y);
        
        directions.forEach(dir => {
            const newX = currentX + dir.x;
            const newY = currentY + dir.y;
            
            if (!this.isWall(newX, newY)) {
                if (dir.x === -ghost.direction.x && dir.y === -ghost.direction.y) {
                    if (Math.random() > 0.7) {
                        validDirections.push(dir);
                    }
                } else {
                    validDirections.push(dir);
                }
            }
        });
        
        if (validDirections.length === 0) {
            directions.forEach(dir => {
                const newX = currentX + dir.x;
                const newY = currentY + dir.y;
                
                if (!this.isWall(newX, newY)) {
                    validDirections.push(dir);
                }
            });
        }
        
        if (validDirections.length > 0) {
            return validDirections[Math.floor(Math.random() * validDirections.length)];
        }
        
        return this.directions.none;
    }
    
    getNewDirection(ghost) {
        const directions = [this.directions.up, this.directions.down, this.directions.left, this.directions.right];
        const validDirections = [];
        
        const currentX = Math.round(ghost.x);
        const currentY = Math.round(ghost.y);
        
        directions.forEach(dir => {
            const newX = currentX + dir.x;
            const newY = currentY + dir.y;
            
            if (!this.isWall(newX, newY) && 
                !(dir.x === -ghost.direction.x && dir.y === -ghost.direction.y)) {
                validDirections.push(dir);
            }
        });
        
        if (validDirections.length === 0) {
            directions.forEach(dir => {
                const newX = currentX + dir.x;
                const newY = currentY + dir.y;
                
                if (!this.isWall(newX, newY)) {
                    validDirections.push(dir);
                }
            });
        }
        
        if (validDirections.length > 0) {
            return validDirections[Math.floor(Math.random() * validDirections.length)];
        }
        
        return this.directions.none;
    }
    
    findNearestPlayer(ghost) {
        let nearestPlayer = null;
        let minDistance = Infinity;
        
        this.players.forEach(player => {
            if (player.isAlive) {
                const distance = Math.abs(ghost.x - player.x) + Math.abs(ghost.y - player.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPlayer = player;
                }
            }
        });
        
        return nearestPlayer;
    }
    
    getDirectionTowards(ghost, target) {
        const directions = [this.directions.up, this.directions.down, this.directions.left, this.directions.right];
        let bestDirection = this.directions.none;
        let minDistance = Infinity;
        
        const currentX = Math.round(ghost.x);
        const currentY = Math.round(ghost.y);
        
        directions.forEach(dir => {
            const newX = currentX + dir.x;
            const newY = currentY + dir.y;
            
            if (!this.isWall(newX, newY)) {
                const distance = Math.abs(newX - target.x) + Math.abs(newY - target.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestDirection = dir;
                }
            }
        });
        
        if (bestDirection === this.directions.none) {
            return this.getRandomDirection(ghost);
        }
        
        return bestDirection;
    }
    
    isWall(x, y) {
        if (x < 0 || x >= this.config.mapWidth || y < 0 || y >= this.config.mapHeight) {
            return false;
        }
        return this.map[y][x] === 1;
    }
    
    checkCollisions() {
        this.players.forEach(player => {
            if (!player.isAlive) return;
            
            const playerX = Math.round(player.x);
            const playerY = Math.round(player.y);
            
            this.dots.forEach(dot => {
                if (!dot.collected && dot.x === playerX && dot.y === playerY) {
                    dot.collected = true;
                    player.score += this.config.dotScore;
                    this.updatePlayerScore(player);
                    this.showScorePopup(dot.x, dot.y, this.config.dotScore);
                }
            });
            
            this.powerPellets.forEach(pellet => {
                if (!pellet.collected && pellet.x === playerX && pellet.y === playerY) {
                    pellet.collected = true;
                    player.score += this.config.powerPelletScore;
                    this.updatePlayerScore(player);
                    this.showScorePopup(pellet.x, pellet.y, this.config.powerPelletScore);
                    
                    player.powerPelletActive = true;
                    setTimeout(() => {
                        player.powerPelletActive = false;
                    }, this.config.powerPelletDuration);
                    
                    this.ghosts.forEach(ghost => {
                        ghost.isScared = true;
                        setTimeout(() => {
                            ghost.isScared = false;
                        }, this.config.powerPelletDuration);
                    });
                }
            });
            
            this.powerUps.forEach((powerUp, index) => {
                if (powerUp.x === playerX && powerUp.y === playerY) {
                    this.activatePowerUp(player, powerUp);
                    this.powerUps.splice(index, 1);
                }
            });
            
            this.ghosts.forEach(ghost => {
                if (!ghost.isAlive) return;
                
                const ghostX = Math.round(ghost.x);
                const ghostY = Math.round(ghost.y);
                
                if (Math.abs(player.x - ghost.x) < 0.8 && Math.abs(player.y - ghost.y) < 0.8) {
                    if (ghost.isScared && player.powerPelletActive) {
                        player.score += this.config.ghostKillScore;
                        this.updatePlayerScore(player);
                        this.showScorePopup(ghostX, ghostY, this.config.ghostKillScore);
                        
                        ghost.isAlive = false;
                        ghost.x = this.ghostStartPos[ghost.id].x;
                        ghost.y = this.ghostStartPos[ghost.id].y;
                        
                        setTimeout(() => {
                            ghost.isAlive = true;
                            ghost.isScared = false;
                        }, this.config.ghostRespawnTime);
                    } else if (!player.isInvincible) {
                        this.killPlayer(player);
                    }
                }
            });
        });
        
        this.checkPlayerPlayerCollision();
    }
    
    checkPlayerPlayerCollision() {
        const player1 = this.players[0];
        const player2 = this.players[1];
        
        if (!player1.isAlive || !player2.isAlive) return;
        
        if (Math.abs(player1.x - player2.x) < 0.8 && Math.abs(player1.y - player2.y) < 0.8) {
            if (player1.powerPelletActive && !player2.powerPelletActive) {
                player1.score += 100;
                this.updatePlayerScore(player1);
                this.killPlayer(player2);
            } else if (player2.powerPelletActive && !player1.powerPelletActive) {
                player2.score += 100;
                this.updatePlayerScore(player2);
                this.killPlayer(player1);
            }
        }
    }
    
    killPlayer(player) {
        player.lives--;
        this.updatePlayerLives(player);
        player.isAlive = false;
        
        if (player.lives <= 0) {
            setTimeout(() => {
                this.endGame();
            }, 500);
        } else {
            const startPos = player.id === 1 ? this.player1StartPos : this.player2StartPos;
            
            setTimeout(() => {
                player.x = startPos.x;
                player.y = startPos.y;
                player.direction = player.id === 1 ? this.directions.right : this.directions.left;
                player.isAlive = true;
                player.isInvincible = true;
                
                setTimeout(() => {
                    player.isInvincible = false;
                }, 3000);
            }, this.config.playerRespawnTime);
        }
    }
    
    activatePowerUp(player, powerUp) {
        switch (powerUp.type) {
            case 'speed-boost':
                player.hasSpeedBoost = true;
                setTimeout(() => {
                    player.hasSpeedBoost = false;
                }, this.config.speedBoostDuration);
                this.showScorePopup(powerUp.x, powerUp.y, '速度提升!');
                break;
                
            case 'freeze':
                this.ghosts.forEach(ghost => {
                    ghost.isFrozen = true;
                    setTimeout(() => {
                        ghost.isFrozen = false;
                    }, this.config.freezeDuration);
                });
                this.showScorePopup(powerUp.x, powerUp.y, '幽灵冻结!');
                break;
                
            case 'invincibility':
                player.isInvincible = true;
                setTimeout(() => {
                    player.isInvincible = false;
                }, this.config.invincibilityDuration);
                this.showScorePopup(powerUp.x, powerUp.y, '无敌模式!');
                break;
        }
    }
    
    updatePowerUps() {
        const currentTime = Date.now();
        this.powerUps = this.powerUps.filter(powerUp => {
            return currentTime - powerUp.spawnTime < powerUp.duration;
        });
    }
    
    updatePlayerScore(player) {
        if (player.id === 1) {
            this.elements.player1Score.textContent = player.score;
        } else {
            this.elements.player2Score.textContent = player.score;
        }
    }
    
    updatePlayerLives(player) {
        if (player.id === 1) {
            this.elements.player1Lives.textContent = player.lives;
        } else {
            this.elements.player2Lives.textContent = player.lives;
        }
    }
    
    showScorePopup(x, y, score) {
        const popup = {
            x: x,
            y: y,
            score: score,
            startTime: Date.now(),
            duration: 1000
        };
        this.scorePopups.push(popup);
    }
    
    updateScorePopups() {
        const currentTime = Date.now();
        this.scorePopups = this.scorePopups.filter(popup => {
            return currentTime - popup.startTime < popup.duration;
        });
    }
    
    allDotsCollected() {
        return this.dots.every(dot => dot.collected) && 
               this.powerPellets.every(pellet => pellet.collected);
    }
    
    endGame() {
        if (this.gameState === 'gameOver') return;
        
        this.gameState = 'gameOver';
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        if (this.timer) clearInterval(this.timer);
        
        const player1Score = this.players[0].score;
        const player2Score = this.players[1].score;
        const player1Lives = this.players[0].lives;
        const player2Lives = this.players[1].lives;
        
        let title, message;
        
        if (player1Lives <= 0 && player2Lives <= 0) {
            title = '游戏结束 - 双方同归于尽!';
            if (player1Score > player2Score) {
                message = `玩家1 得分更高: ${player1Score} 分 vs 玩家2: ${player2Score} 分`;
            } else if (player2Score > player1Score) {
                message = `玩家2 得分更高: ${player2Score} 分 vs 玩家1: ${player1Score} 分`;
            } else {
                message = `平局! 双方得分: ${player1Score} 分`;
            }
        } else if (player1Lives <= 0) {
            title = '玩家2 获胜!';
            message = `玩家1 生命耗尽 (得分: ${player1Score})<br>玩家2 存活 (得分: ${player2Score})`;
        } else if (player2Lives <= 0) {
            title = '玩家1 获胜!';
            message = `玩家2 生命耗尽 (得分: ${player2Score})<br>玩家1 存活 (得分: ${player1Score})`;
        } else {
            if (player1Score > player2Score) {
                title = '玩家1 获胜!';
                message = `时间结束! 玩家1: ${player1Score} 分 vs 玩家2: ${player2Score} 分`;
            } else if (player2Score > player1Score) {
                title = '玩家2 获胜!';
                message = `时间结束! 玩家2: ${player2Score} 分 vs 玩家1: ${player1Score} 分`;
            } else {
                title = '平局!';
                message = `时间结束! 双方得分: ${player1Score} 分`;
            }
        }
        
        this.showOverlay(title, message + '<br><br>按空格键重新开始');
    }
    
    showOverlay(title, message) {
        this.elements.overlayTitle.textContent = title;
        this.elements.overlayMessage.innerHTML = message;
        this.elements.gameOverlay.classList.remove('hidden');
    }
    
    hideOverlay() {
        this.elements.gameOverlay.classList.add('hidden');
    }
    
    render() {
        this.renderGameObjects();
        this.renderScorePopups();
    }
    
    renderGameObjects() {
        const existingDots = this.elements.gameBoard.querySelectorAll('.dot');
        existingDots.forEach(dot => dot.remove());
        
        const existingPowerPellets = this.elements.gameBoard.querySelectorAll('.power-pellet');
        existingPowerPellets.forEach(pellet => pellet.remove());
        
        const existingPowerUps = this.elements.gameBoard.querySelectorAll('.speed-boost, .freeze, .invincibility');
        existingPowerUps.forEach(powerUp => powerUp.remove());
        
        const existingPlayers = this.elements.gameBoard.querySelectorAll('.player');
        existingPlayers.forEach(player => player.remove());
        
        const existingGhosts = this.elements.gameBoard.querySelectorAll('.ghost');
        existingGhosts.forEach(ghost => ghost.remove());
        
        this.dots.forEach(dot => {
            if (!dot.collected) {
                const dotElement = document.createElement('div');
                dotElement.className = 'dot';
                dotElement.style.position = 'absolute';
                dotElement.style.left = `${dot.x * this.config.cellSize + this.config.cellSize / 2 - 4}px`;
                dotElement.style.top = `${dot.y * this.config.cellSize + this.config.cellSize / 2 - 4}px`;
                this.elements.gameBoard.appendChild(dotElement);
            }
        });
        
        this.powerPellets.forEach(pellet => {
            if (!pellet.collected) {
                const pelletElement = document.createElement('div');
                pelletElement.className = 'power-pellet';
                pelletElement.style.position = 'absolute';
                pelletElement.style.left = `${pellet.x * this.config.cellSize + this.config.cellSize / 2 - 8}px`;
                pelletElement.style.top = `${pellet.y * this.config.cellSize + this.config.cellSize / 2 - 8}px`;
                this.elements.gameBoard.appendChild(pelletElement);
            }
        });
        
        this.powerUps.forEach(powerUp => {
            const powerUpElement = document.createElement('div');
            powerUpElement.className = powerUp.type;
            powerUpElement.style.position = 'absolute';
            powerUpElement.style.left = `${powerUp.x * this.config.cellSize + this.config.cellSize / 2 - 10}px`;
            powerUpElement.style.top = `${powerUp.y * this.config.cellSize + this.config.cellSize / 2 - 10}px`;
            this.elements.gameBoard.appendChild(powerUpElement);
        });
        
        this.players.forEach(player => {
            if (player.isAlive) {
                const playerElement = document.createElement('div');
                playerElement.className = `player ${player.color}`;
                
                if (player.isInvincible) {
                    playerElement.classList.add('invincible');
                }
                if (player.hasSpeedBoost) {
                    playerElement.classList.add('speed-boost-active');
                }
                
                playerElement.style.left = `${player.x * this.config.cellSize + 1}px`;
                playerElement.style.top = `${player.y * this.config.cellSize + 1}px`;
                
                let rotation = 0;
                if (player.direction === this.directions.up) rotation = -90;
                else if (player.direction === this.directions.down) rotation = 90;
                else if (player.direction === this.directions.left) rotation = 180;
                
                playerElement.style.transform = `rotate(${rotation}deg)`;
                
                this.elements.gameBoard.appendChild(playerElement);
            }
        });
        
        this.ghosts.forEach(ghost => {
            if (ghost.isAlive) {
                const ghostElement = document.createElement('div');
                ghostElement.className = `ghost ${ghost.color}`;
                
                if (ghost.isScared) {
                    ghostElement.style.background = 'linear-gradient(to bottom, #0000ff 0%, #0000cc 100%)';
                    ghostElement.style.boxShadow = '0 0 8px #0000ff';
                }
                
                if (ghost.isFrozen) {
                    ghostElement.style.opacity = '0.5';
                    ghostElement.style.filter = 'grayscale(100%)';
                }
                
                ghostElement.style.left = `${ghost.x * this.config.cellSize + 1}px`;
                ghostElement.style.top = `${ghost.y * this.config.cellSize + 1}px`;
                
                const eyesElement = document.createElement('div');
                eyesElement.className = 'ghost-eyes';
                const leftEye = document.createElement('div');
                leftEye.className = 'ghost-eye';
                const rightEye = document.createElement('div');
                rightEye.className = 'ghost-eye';
                eyesElement.appendChild(leftEye);
                eyesElement.appendChild(rightEye);
                ghostElement.appendChild(eyesElement);
                
                this.elements.gameBoard.appendChild(ghostElement);
            }
        });
    }
    
    renderScorePopups() {
        const existingPopups = this.elements.gameBoard.querySelectorAll('.score-popup');
        existingPopups.forEach(popup => popup.remove());
        
        const currentTime = Date.now();
        
        this.scorePopups.forEach(popup => {
            const elapsed = currentTime - popup.startTime;
            const progress = elapsed / popup.duration;
            
            const popupElement = document.createElement('div');
            popupElement.className = 'score-popup';
            popupElement.textContent = popup.score;
            popupElement.style.left = `${popup.x * this.config.cellSize + this.config.cellSize / 2}px`;
            popupElement.style.top = `${popup.y * this.config.cellSize - 30 * progress}px`;
            popupElement.style.opacity = 1 - progress;
            
            this.elements.gameBoard.appendChild(popupElement);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PacmanGame();
});