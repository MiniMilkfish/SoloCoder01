// FC经典坦克大战 - 游戏主逻辑
// 纯原生JavaScript实现，无任何游戏引擎依赖

// 游戏配置
const CONFIG = {
    TILE_SIZE: 26,
    GRID_SIZE: 20,
    CANVAS_SIZE: 520,
    FPS: 60,
    BASE_POSITION: { x: 9, y: 19 }, // 基地位置（网格坐标）
    SPAWN_POINTS: [
        { x: 0, y: 0 },
        { x: 9, y: 0 },
        { x: 19, y: 0 }
    ],
    PLAYER_SPAWN_POINTS: [
        { x: 4, y: 18 },
        { x: 15, y: 18 }
    ]
};

// 方向枚举
const DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

// 地图瓦片类型
const TILE_TYPE = {
    EMPTY: 0,
    BRICK: 1,      // 砖墙（可摧毁）
    STEEL: 2,      // 钢墙（不可摧毁）
    GRASS: 3,      // 草地（遮挡视野）
    WATER: 4,      // 水域（不可通过）
    BASE: 5,       // 基地
    BASE_DESTROYED: 6 // 基地被摧毁
};

// 坦克类型
const TANK_TYPE = {
    PLAYER1: 'player1',
    PLAYER2: 'player2',
    BASIC: 'basic',       // 普通坦克
    FAST: 'fast',         // 快速坦克
    HEAVY: 'heavy',       // 重型坦克
    SPECIAL: 'special'    // 特殊坦克（掉落道具）
};

// 道具类型
const POWERUP_TYPE = {
    HELMET: 'helmet',     // 护甲（暂时无敌）
    CLOCK: 'clock',       // 时钟（暂停敌人）
    SHOVEL: 'shovel',     // 铲子（钢墙保护基地）
    STAR: 'star',         // 星星（升级）
    BOMB: 'bomb',         // 炸弹（消灭所有敌人）
    TANK: 'tank',         // 坦克（加一条命）
    SHIELD: 'shield'      // 护盾（暂时友军误伤无效）
};

// 游戏状态
const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover',
    LEVEL_COMPLETE: 'levelcomplete'
};

// 关卡数据
const LEVELS = [
    // 关卡1 - 简单
    {
        map: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0],
            [0,0,1,1,0,0,1,1,2,2,1,1,0,0,1,1,0,0,0,0],
            [0,0,1,1,0,0,1,1,2,2,1,1,0,0,1,1,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
            [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,1,1,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,1,1,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0]
        ],
        enemies: [
            { type: TANK_TYPE.BASIC, count: 8 },
            { type: TANK_TYPE.FAST, count: 4 },
            { type: TANK_TYPE.SPECIAL, count: 2 }
        ],
        enemySpawnInterval: 3000
    },
    // 关卡2 - 中等
    {
        map: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0],
            [0,0,1,1,2,2,1,1,0,0,1,1,2,2,1,1,0,0,0,0],
            [0,0,1,1,2,2,1,1,0,0,1,1,2,2,1,1,0,0,0,0],
            [0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,1,1,0,0],
            [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,1,1,0,0],
            [0,0,1,1,0,0,1,1,2,2,1,1,0,0,1,1,0,0,0,0],
            [0,0,1,1,0,0,1,1,2,2,1,1,0,0,1,1,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0]
        ],
        enemies: [
            { type: TANK_TYPE.BASIC, count: 6 },
            { type: TANK_TYPE.FAST, count: 6 },
            { type: TANK_TYPE.HEAVY, count: 2 },
            { type: TANK_TYPE.SPECIAL, count: 2 }
        ],
        enemySpawnInterval: 2500
    },
    // 关卡3 - 困难
    {
        map: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [2,2,1,1,2,2,1,1,2,2,2,2,1,1,2,2,1,1,2,2],
            [2,2,1,1,2,2,1,1,2,2,2,2,1,1,2,2,1,1,2,2],
            [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1],
            [0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1],
            [2,2,1,1,2,2,1,1,2,2,2,2,1,1,2,2,1,1,2,2],
            [2,2,1,1,2,2,1,1,2,2,2,2,1,1,2,2,1,1,2,2],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0],
            [0,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0],
            [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0]
        ],
        enemies: [
            { type: TANK_TYPE.BASIC, count: 4 },
            { type: TANK_TYPE.FAST, count: 6 },
            { type: TANK_TYPE.HEAVY, count: 6 },
            { type: TANK_TYPE.SPECIAL, count: 2 }
        ],
        enemySpawnInterval: 2000
    }
];

// 游戏类
class TankGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = GAME_STATE.START;
        this.currentLevel = 0;
        this.twoPlayerMode = false;
        
        // 游戏对象
        this.players = [];
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        this.explosions = [];
        
        // 游戏数据
        this.map = [];
        this.enemySpawnPoint = 0;
        this.enemySpawnTimer = 0;
        this.enemiesToSpawn = [];
        this.remainingEnemies = 0;
        this.score = [0, 0];
        this.baseProtected = false;
        this.baseProtectionTimer = 0;
        this.enemiesPaused = false;
        this.enemiesPauseTimer = 0;
        
        // 按键状态
        this.keys = {};
        
        // 初始化
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupUI();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
            
            // 暂停/继续
            if (e.key.toLowerCase() === 'p') {
                if (this.gameState === GAME_STATE.PLAYING) {
                    this.pauseGame();
                } else if (this.gameState === GAME_STATE.PAUSED) {
                    this.resumeGame();
                }
            }
            
            // 重新开始
            if (e.key.toLowerCase() === 'r') {
                this.restartGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });
    }
    
    setupUI() {
        // 开始按钮
        document.getElementById('startButton').addEventListener('click', () => {
            this.twoPlayerMode = false;
            this.startGame();
        });
        
        document.getElementById('twoPlayerButton').addEventListener('click', () => {
            this.twoPlayerMode = true;
            this.startGame();
        });
        
        // 暂停界面按钮
        document.getElementById('resumeButton').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 游戏结束界面按钮
        document.getElementById('gameOverRestartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 关卡完成界面按钮
        document.getElementById('nextLevelButton').addEventListener('click', () => {
            this.nextLevel();
        });
    }
    
    startGame() {
        this.currentLevel = 0;
        this.score = [0, 0];
        this.initLevel();
        this.gameState = GAME_STATE.PLAYING;
        this.hideAllScreens();
    }
    
    initLevel() {
        const level = LEVELS[this.currentLevel % LEVELS.length];
        
        // 复制地图数据
        this.map = level.map.map(row => [...row]);
        
        // 初始化敌人生成队列
        this.enemiesToSpawn = [];
        level.enemies.forEach(enemyConfig => {
            for (let i = 0; i < enemyConfig.count; i++) {
                this.enemiesToSpawn.push(enemyConfig.type);
            }
        });
        
        // 打乱敌人生成顺序
        this.shuffleArray(this.enemiesToSpawn);
        
        this.remainingEnemies = this.enemiesToSpawn.length;
        this.enemySpawnTimer = 0;
        this.enemySpawnPoint = 0;
        
        // 清空游戏对象
        this.players = [];
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        this.explosions = [];
        
        // 创建玩家
        this.createPlayers();
        
        // 重置特殊效果
        this.baseProtected = false;
        this.baseProtectionTimer = 0;
        this.enemiesPaused = false;
        this.enemiesPauseTimer = 0;
        
        // 更新UI
        this.updateUI();
    }
    
    createPlayers() {
        // 玩家1
        this.players.push(new Tank(
            CONFIG.PLAYER_SPAWN_POINTS[0].x * CONFIG.TILE_SIZE,
            CONFIG.PLAYER_SPAWN_POINTS[0].y * CONFIG.TILE_SIZE,
            TANK_TYPE.PLAYER1,
            this
        ));
        
        // 玩家2（如果是双人模式）
        if (this.twoPlayerMode) {
            this.players.push(new Tank(
                CONFIG.PLAYER_SPAWN_POINTS[1].x * CONFIG.TILE_SIZE,
                CONFIG.PLAYER_SPAWN_POINTS[1].y * CONFIG.TILE_SIZE,
                TANK_TYPE.PLAYER2,
                this
            ));
        }
    }
    
    spawnEnemy() {
        if (this.enemiesToSpawn.length === 0) return;
        
        const spawnPoint = CONFIG.SPAWN_POINTS[this.enemySpawnPoint];
        const tankType = this.enemiesToSpawn.shift();
        
        // 检查生成点是否被占用
        const x = spawnPoint.x * CONFIG.TILE_SIZE;
        const y = spawnPoint.y * CONFIG.TILE_SIZE;
        
        if (!this.isPositionOccupied(x, y)) {
            const enemy = new Tank(x, y, tankType, this);
            this.enemies.push(enemy);
        } else {
            // 如果被占用，放回到队列末尾
            this.enemiesToSpawn.unshift(tankType);
        }
        
        // 轮换生成点
        this.enemySpawnPoint = (this.enemySpawnPoint + 1) % CONFIG.SPAWN_POINTS.length;
    }
    
    isPositionOccupied(x, y) {
        const checkCollision = (tank) => {
            return this.checkBoxCollision(
                x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE,
                tank.x, tank.y, tank.width, tank.height
            );
        };
        
        return this.players.some(checkCollision) || this.enemies.some(checkCollision);
    }
    
    pauseGame() {
        this.gameState = GAME_STATE.PAUSED;
        document.getElementById('pauseScreen').classList.remove('hidden');
    }
    
    resumeGame() {
        this.gameState = GAME_STATE.PLAYING;
        document.getElementById('pauseScreen').classList.add('hidden');
    }
    
    restartGame() {
        this.currentLevel = 0;
        this.score = [0, 0];
        this.initLevel();
        this.gameState = GAME_STATE.PLAYING;
        this.hideAllScreens();
    }
    
    nextLevel() {
        this.currentLevel++;
        this.initLevel();
        this.gameState = GAME_STATE.PLAYING;
        this.hideAllScreens();
    }
    
    gameOver(win = false) {
        this.gameState = GAME_STATE.GAME_OVER;
        
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        const finalPlayer1Score = document.getElementById('finalPlayer1Score');
        const finalPlayer2Score = document.getElementById('finalPlayer2Score');
        
        if (win) {
            title.textContent = '胜利！';
            message.textContent = '恭喜你完成了所有关卡！';
        } else {
            title.textContent = '游戏结束';
            message.textContent = '基地被摧毁或玩家全部阵亡！';
        }
        
        finalPlayer1Score.textContent = this.score[0];
        
        if (this.twoPlayerMode) {
            finalPlayer2Score.classList.remove('hidden');
            finalPlayer2Score.querySelector('span').textContent = this.score[1];
        } else {
            finalPlayer2Score.classList.add('hidden');
        }
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    levelComplete() {
        this.gameState = GAME_STATE.LEVEL_COMPLETE;
        document.getElementById('levelCompleteScreen').classList.remove('hidden');
    }
    
    hideAllScreens() {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('levelCompleteScreen').classList.add('hidden');
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    checkBoxCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
    
    getTileAt(x, y) {
        const gridX = Math.floor(x / CONFIG.TILE_SIZE);
        const gridY = Math.floor(y / CONFIG.TILE_SIZE);
        
        if (gridX < 0 || gridX >= CONFIG.GRID_SIZE || gridY < 0 || gridY >= CONFIG.GRID_SIZE) {
            return TILE_TYPE.STEEL;
        }
        
        // 安全检查：确保地图数组已初始化
        if (!this.map || !this.map[gridY]) {
            return TILE_TYPE.EMPTY;
        }
        
        return this.map[gridY][gridX];
    }
    
    isTileBlocking(tileType) {
        return tileType === TILE_TYPE.BRICK || 
               tileType === TILE_TYPE.STEEL || 
               tileType === TILE_TYPE.WATER ||
               tileType === TILE_TYPE.BASE;
    }
    
    isTileDestructible(tileType) {
        return tileType === TILE_TYPE.BRICK || tileType === TILE_TYPE.BASE;
    }
    
    damageTile(gridX, gridY, damage) {
        if (gridX < 0 || gridX >= CONFIG.GRID_SIZE || gridY < 0 || gridY >= CONFIG.GRID_SIZE) {
            return false;
        }
        
        const tileType = this.map[gridY][gridX];
        
        if (tileType === TILE_TYPE.BRICK) {
            this.map[gridY][gridX] = TILE_TYPE.EMPTY;
            return true;
        } else if (tileType === TILE_TYPE.BASE) {
            this.map[gridY][gridX] = TILE_TYPE.BASE_DESTROYED;
            this.gameOver();
            return true;
        }
        
        return false;
    }
    
    spawnPowerup(x, y) {
        const types = Object.values(POWERUP_TYPE);
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerups.push(new Powerup(x, y, type, this));
    }
    
    applyPowerup(powerup, player) {
        const playerIndex = player.type === TANK_TYPE.PLAYER1 ? 0 : 1;
        
        switch (powerup.type) {
            case POWERUP_TYPE.HELMET:
                player.invincible = true;
                player.invincibleTimer = 600; // 10秒
                break;
                
            case POWERUP_TYPE.CLOCK:
                this.enemiesPaused = true;
                this.enemiesPauseTimer = 600; // 10秒
                break;
                
            case POWERUP_TYPE.SHOVEL:
                this.protectBase();
                this.baseProtected = true;
                this.baseProtectionTimer = 1200; // 20秒
                break;
                
            case POWERUP_TYPE.STAR:
                player.upgrade();
                break;
                
            case POWERUP_TYPE.BOMB:
                this.enemies.forEach(enemy => {
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    this.score[playerIndex] += enemy.scoreValue;
                });
                this.enemies = [];
                break;
                
            case POWERUP_TYPE.TANK:
                player.lives++;
                break;
                
            case POWERUP_TYPE.SHIELD:
                player.friendlyFireImmune = true;
                player.friendlyFireImmuneTimer = 600; // 10秒
                break;
        }
    }
    
    protectBase() {
        // 将基地周围的砖墙替换为钢墙
        const baseX = CONFIG.BASE_POSITION.x;
        const baseY = CONFIG.BASE_POSITION.y;
        
        // 基地周围的8个方向
        const positions = [
            {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
            {x: -1, y: 0},                    {x: 1, y: 0},
            {x: -1, y: 1},  {x: 0, y: 1},  {x: 1, y: 1}
        ];
        
        positions.forEach(pos => {
            const gridX = baseX + pos.x;
            const gridY = baseY + pos.y;
            
            if (gridX >= 0 && gridX < CONFIG.GRID_SIZE && 
                gridY >= 0 && gridY < CONFIG.GRID_SIZE) {
                if (this.map[gridY][gridX] === TILE_TYPE.BRICK || 
                    this.map[gridY][gridX] === TILE_TYPE.EMPTY) {
                    this.map[gridY][gridX] = TILE_TYPE.STEEL;
                }
            }
        });
    }
    
    unprotectBase() {
        // 将基地周围的钢墙替换为砖墙
        const baseX = CONFIG.BASE_POSITION.x;
        const baseY = CONFIG.BASE_POSITION.y;
        
        const positions = [
            {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
            {x: -1, y: 0},                    {x: 1, y: 0},
            {x: -1, y: 1},  {x: 0, y: 1},  {x: 1, y: 1}
        ];
        
        positions.forEach(pos => {
            const gridX = baseX + pos.x;
            const gridY = baseY + pos.y;
            
            if (gridX >= 0 && gridX < CONFIG.GRID_SIZE && 
                gridY >= 0 && gridY < CONFIG.GRID_SIZE) {
                if (this.map[gridY][gridX] === TILE_TYPE.STEEL) {
                    this.map[gridY][gridX] = TILE_TYPE.BRICK;
                }
            }
        });
    }
    
    createExplosion(x, y, size = 'medium') {
        this.explosions.push(new Explosion(x, y, size));
    }
    
    update() {
        if (this.gameState !== GAME_STATE.PLAYING) return;
        
        const level = LEVELS[this.currentLevel % LEVELS.length];
        
        // 更新敌人生成
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= level.enemySpawnInterval / 16.67 && 
            this.enemiesToSpawn.length > 0 && 
            this.enemies.length < 4) { // 最多同时存在4个敌人
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        // 更新特殊效果计时器
        if (this.enemiesPauseTimer > 0) {
            this.enemiesPauseTimer--;
            if (this.enemiesPauseTimer === 0) {
                this.enemiesPaused = false;
            }
        }
        
        if (this.baseProtectionTimer > 0) {
            this.baseProtectionTimer--;
            if (this.baseProtectionTimer === 0) {
                this.baseProtected = false;
                this.unprotectBase();
            }
        }
        
        // 更新玩家
        this.players.forEach(player => {
            player.update();
        });
        
        // 移除死亡的玩家
        this.players = this.players.filter(player => !player.dead);
        
        // 如果没有玩家了，游戏结束
        if (this.players.length === 0) {
            this.gameOver();
            return;
        }
        
        // 更新敌人
        if (!this.enemiesPaused) {
            this.enemies.forEach(enemy => {
                enemy.update();
            });
        }
        
        // 移除死亡的敌人
        this.enemies = this.enemies.filter(enemy => !enemy.dead);
        
        // 更新子弹
        this.bullets.forEach(bullet => {
            bullet.update();
        });
        
        // 移除无效的子弹
        this.bullets = this.bullets.filter(bullet => bullet.active);
        
        // 更新道具
        this.powerups.forEach(powerup => {
            powerup.update();
        });
        
        // 移除已收集或过期的道具
        this.powerups = this.powerups.filter(powerup => powerup.active);
        
        // 更新爆炸效果
        this.explosions.forEach(explosion => {
            explosion.update();
        });
        
        // 移除结束的爆炸效果
        this.explosions = this.explosions.filter(explosion => explosion.active);
        
        // 检查关卡完成
        if (this.enemiesToSpawn.length === 0 && this.enemies.length === 0) {
            if (this.currentLevel >= LEVELS.length - 1) {
                this.gameOver(true);
            } else {
                this.levelComplete();
            }
        }
        
        // 更新UI
        this.updateUI();
    }
    
    updateUI() {
        // 更新玩家分数
        if (this.players.length > 0) {
            document.getElementById('player1-score').textContent = this.score[0];
            document.getElementById('player1-health').textContent = this.players[0].health;
            document.getElementById('player1-lives').textContent = this.players[0].lives;
        }
        
        if (this.twoPlayerMode && this.players.length > 1) {
            document.getElementById('player2-score').textContent = this.score[1];
            document.getElementById('player2-health').textContent = this.players[1].health;
            document.getElementById('player2-lives').textContent = this.players[1].lives;
        }
        
        // 更新关卡信息
        document.getElementById('current-level').textContent = this.currentLevel + 1;
        document.getElementById('remaining-enemies').textContent = 
            this.enemiesToSpawn.length + this.enemies.length;
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 只有在游戏进行中才渲染游戏内容
        if (this.gameState !== GAME_STATE.PLAYING) return;
        
        // 渲染地图
        this.renderMap();
        
        // 渲染道具
        this.powerups.forEach(powerup => {
            powerup.render(this.ctx);
        });
        
        // 渲染坦克
        this.players.forEach(player => {
            player.render(this.ctx);
        });
        
        this.enemies.forEach(enemy => {
            enemy.render(this.ctx);
        });
        
        // 渲染子弹
        this.bullets.forEach(bullet => {
            bullet.render(this.ctx);
        });
        
        // 渲染爆炸效果
        this.explosions.forEach(explosion => {
            explosion.render(this.ctx);
        });
    }
    
    renderMap() {
        for (let y = 0; y < CONFIG.GRID_SIZE; y++) {
            for (let x = 0; x < CONFIG.GRID_SIZE; x++) {
                const tileType = this.map[y][x];
                const posX = x * CONFIG.TILE_SIZE;
                const posY = y * CONFIG.TILE_SIZE;
                
                switch (tileType) {
                    case TILE_TYPE.BRICK:
                        this.drawBrickTile(posX, posY);
                        break;
                    case TILE_TYPE.STEEL:
                        this.drawSteelTile(posX, posY);
                        break;
                    case TILE_TYPE.GRASS:
                        this.drawGrassTile(posX, posY);
                        break;
                    case TILE_TYPE.WATER:
                        this.drawWaterTile(posX, posY);
                        break;
                    case TILE_TYPE.BASE:
                        this.drawBaseTile(posX, posY, false);
                        break;
                    case TILE_TYPE.BASE_DESTROYED:
                        this.drawBaseTile(posX, posY, true);
                        break;
                }
            }
        }
    }
    
    drawBrickTile(x, y) {
        this.ctx.fillStyle = '#8B4513'; // 棕色
        this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        
        // 砖块纹理
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(x + 1, y + 1, CONFIG.TILE_SIZE/2 - 2, CONFIG.TILE_SIZE/2 - 2);
        this.ctx.fillRect(x + CONFIG.TILE_SIZE/2 + 1, y + 1, CONFIG.TILE_SIZE/2 - 2, CONFIG.TILE_SIZE/2 - 2);
        this.ctx.fillRect(x + 1, y + CONFIG.TILE_SIZE/2 + 1, CONFIG.TILE_SIZE/2 - 2, CONFIG.TILE_SIZE/2 - 2);
        this.ctx.fillRect(x + CONFIG.TILE_SIZE/2 + 1, y + CONFIG.TILE_SIZE/2 + 1, CONFIG.TILE_SIZE/2 - 2, CONFIG.TILE_SIZE/2 - 2);
    }
    
    drawSteelTile(x, y) {
        this.ctx.fillStyle = '#808080'; // 灰色
        this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        
        // 钢墙纹理
        this.ctx.fillStyle = '#A9A9A9';
        this.ctx.fillRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
        
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.fillRect(x + 4, y + 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8);
    }
    
    drawGrassTile(x, y) {
        this.ctx.fillStyle = '#228B22'; // 绿色
        this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        
        // 草地纹理
        this.ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 10; i++) {
            const gx = x + Math.random() * CONFIG.TILE_SIZE;
            const gy = y + Math.random() * CONFIG.TILE_SIZE;
            this.ctx.fillRect(gx, gy, 2, 4);
        }
    }
    
    drawWaterTile(x, y) {
        this.ctx.fillStyle = '#1E90FF'; // 蓝色
        this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        
        // 水波纹
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(x + 4, y + 6, CONFIG.TILE_SIZE - 8, 2);
        this.ctx.fillRect(x + 4, y + 16, CONFIG.TILE_SIZE - 8, 2);
    }
    
    drawBaseTile(x, y, destroyed) {
        if (destroyed) {
            // 基地被摧毁
            this.ctx.fillStyle = '#8B0000'; // 深红色
            this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = '16px Arial';
            this.ctx.fillText('X', x + 8, y + 18);
        } else {
            // 正常基地
            this.ctx.fillStyle = '#FFD700'; // 金色
            this.ctx.fillRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
            
            this.ctx.fillStyle = '#FFA500';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('鹰', x + 6, y + 18);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 坦克类
class Tank {
    constructor(x, y, type, game) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.TILE_SIZE;
        this.height = CONFIG.TILE_SIZE;
        this.type = type;
        this.game = game;
        this.direction = DIRECTION.UP;
        this.speed = this.getSpeedByType();
        this.health = this.getHealthByType();
        this.maxHealth = this.health;
        this.lives = 3;
        this.scoreValue = this.getScoreValueByType();
        this.bulletSpeed = 4;
        this.bulletDamage = 1;
        this.bulletCooldown = 0;
        this.bulletCooldownTime = 30;
        this.canShoot = true;
        this.dead = false;
        this.level = 0; // 玩家等级（用于升级）
        this.invincible = false;
        this.invincibleTimer = 0;
        this.friendlyFireImmune = false;
        this.friendlyFireImmuneTimer = 0;
        this.isPlayer = this.type === TANK_TYPE.PLAYER1 || this.type === TANK_TYPE.PLAYER2;
        
        // AI属性
        if (!this.isPlayer) {
            this.aiMoveTimer = 0;
            this.aiMoveInterval = 60 + Math.random() * 120;
            this.aiShootTimer = 0;
            this.aiShootInterval = 30 + Math.random() * 60;
        }
    }
    
    getSpeedByType() {
        switch (this.type) {
            case TANK_TYPE.PLAYER1:
            case TANK_TYPE.PLAYER2:
                return 2;
            case TANK_TYPE.FAST:
                return 3;
            case TANK_TYPE.HEAVY:
                return 1;
            case TANK_TYPE.SPECIAL:
                return 2;
            default:
                return 1.5;
        }
    }
    
    getHealthByType() {
        switch (this.type) {
            case TANK_TYPE.PLAYER1:
            case TANK_TYPE.PLAYER2:
                return 1;
            case TANK_TYPE.HEAVY:
                return 4;
            case TANK_TYPE.SPECIAL:
                return 1;
            default:
                return 1;
        }
    }
    
    getScoreValueByType() {
        switch (this.type) {
            case TANK_TYPE.BASIC:
                return 100;
            case TANK_TYPE.FAST:
                return 200;
            case TANK_TYPE.HEAVY:
                return 400;
            case TANK_TYPE.SPECIAL:
                return 500;
            default:
                return 0;
        }
    }
    
    upgrade() {
        this.level++;
        if (this.level >= 1) {
            this.bulletSpeed = 6;
        }
        if (this.level >= 2) {
            this.bulletCooldownTime = 20;
        }
        if (this.level >= 3) {
            this.bulletDamage = 2;
        }
    }
    
    update() {
        // 更新无敌状态
        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
            if (this.invincibleTimer === 0) {
                this.invincible = false;
            }
        }
        
        // 更新友军误伤免疫状态
        if (this.friendlyFireImmuneTimer > 0) {
            this.friendlyFireImmuneTimer--;
            if (this.friendlyFireImmuneTimer === 0) {
                this.friendlyFireImmune = false;
            }
        }
        
        // 更新子弹冷却
        if (this.bulletCooldown > 0) {
            this.bulletCooldown--;
            if (this.bulletCooldown === 0) {
                this.canShoot = true;
            }
        }
        
        if (this.isPlayer) {
            this.handlePlayerInput();
        } else {
            this.handleAI();
        }
    }
    
    handlePlayerInput() {
        const keys = this.game.keys;
        let moved = false;
        
        // 玩家1控制：WASD移动，空格射击
        // 玩家2控制：方向键移动，0射击
        if (this.type === TANK_TYPE.PLAYER1) {
            if (keys['w'] || keys['W']) {
                this.direction = DIRECTION.UP;
                if (this.canMove(0, -this.speed)) {
                    this.y -= this.speed;
                    moved = true;
                }
            } else if (keys['s'] || keys['S']) {
                this.direction = DIRECTION.DOWN;
                if (this.canMove(0, this.speed)) {
                    this.y += this.speed;
                    moved = true;
                }
            } else if (keys['a'] || keys['A']) {
                this.direction = DIRECTION.LEFT;
                if (this.canMove(-this.speed, 0)) {
                    this.x -= this.speed;
                    moved = true;
                }
            } else if (keys['d'] || keys['D']) {
                this.direction = DIRECTION.RIGHT;
                if (this.canMove(this.speed, 0)) {
                    this.x += this.speed;
                    moved = true;
                }
            }
            
            if (keys[' '] && this.canShoot) {
                this.shoot();
            }
        } else if (this.type === TANK_TYPE.PLAYER2) {
            if (keys['ArrowUp']) {
                this.direction = DIRECTION.UP;
                if (this.canMove(0, -this.speed)) {
                    this.y -= this.speed;
                    moved = true;
                }
            } else if (keys['ArrowDown']) {
                this.direction = DIRECTION.DOWN;
                if (this.canMove(0, this.speed)) {
                    this.y += this.speed;
                    moved = true;
                }
            } else if (keys['ArrowLeft']) {
                this.direction = DIRECTION.LEFT;
                if (this.canMove(-this.speed, 0)) {
                    this.x -= this.speed;
                    moved = true;
                }
            } else if (keys['ArrowRight']) {
                this.direction = DIRECTION.RIGHT;
                if (this.canMove(this.speed, 0)) {
                    this.x += this.speed;
                    moved = true;
                }
            }
            
            if (keys['0'] && this.canShoot) {
                this.shoot();
            }
        }
        
        // 对齐到网格（如果没有移动）
        if (!moved) {
            this.snapToGrid();
        }
    }
    
    handleAI() {
        this.aiMoveTimer++;
        this.aiShootTimer++;
        
        // 随机改变方向
        if (this.aiMoveTimer >= this.aiMoveInterval) {
            this.aiMoveTimer = 0;
            this.aiMoveInterval = 60 + Math.random() * 120;
            
            // 有70%的概率朝向玩家
            if (Math.random() < 0.7 && this.game.players.length > 0) {
                const target = this.game.players[Math.floor(Math.random() * this.game.players.length)];
                this.direction = this.getDirectionToTarget(target);
            } else {
                // 随机方向
                this.direction = Math.floor(Math.random() * 4);
            }
        }
        
        // 尝试移动
        let dx = 0, dy = 0;
        switch (this.direction) {
            case DIRECTION.UP: dy = -this.speed; break;
            case DIRECTION.DOWN: dy = this.speed; break;
            case DIRECTION.LEFT: dx = -this.speed; break;
            case DIRECTION.RIGHT: dx = this.speed; break;
        }
        
        if (this.canMove(dx, dy)) {
            this.x += dx;
            this.y += dy;
        } else {
            // 不能移动，改变方向
            this.direction = Math.floor(Math.random() * 4);
        }
        
        // 尝试射击
        if (this.aiShootTimer >= this.aiShootInterval) {
            this.aiShootTimer = 0;
            this.aiShootInterval = 30 + Math.random() * 60;
            
            if (this.canShoot) {
                // 有80%的概率射击
                if (Math.random() < 0.8) {
                    this.shoot();
                }
            }
        }
    }
    
    getDirectionToTarget(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
        } else {
            return dy > 0 ? DIRECTION.DOWN : DIRECTION.UP;
        }
    }
    
    canMove(dx, dy) {
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // 检查边界
        if (newX < 0 || newX + this.width > CONFIG.CANVAS_SIZE ||
            newY < 0 || newY + this.height > CONFIG.CANVAS_SIZE) {
            return false;
        }
        
        // 检查地图碰撞
        const corners = [
            {x: newX + 2, y: newY + 2},
            {x: newX + this.width - 2, y: newY + 2},
            {x: newX + 2, y: newY + this.height - 2},
            {x: newX + this.width - 2, y: newY + this.height - 2}
        ];
        
        for (const corner of corners) {
            const tile = this.game.getTileAt(corner.x, corner.y);
            if (this.game.isTileBlocking(tile)) {
                return false;
            }
        }
        
        // 检查与其他坦克的碰撞
        const allTanks = [...this.game.players, ...this.game.enemies];
        for (const tank of allTanks) {
            if (tank === this) continue;
            
            if (this.game.checkBoxCollision(
                newX, newY, this.width, this.height,
                tank.x, tank.y, tank.width, tank.height
            )) {
                return false;
            }
        }
        
        return true;
    }
    
    snapToGrid() {
        // 对齐到网格
        const gridX = Math.round(this.x / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE;
        const gridY = Math.round(this.y / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE;
        
        // 只有当离网格很近时才对齐
        if (Math.abs(this.x - gridX) < this.speed) {
            this.x = gridX;
        }
        if (Math.abs(this.y - gridY) < this.speed) {
            this.y = gridY;
        }
    }
    
    shoot() {
        if (!this.canShoot) return;
        
        const bullet = new Bullet(this, this.game);
        this.game.bullets.push(bullet);
        
        this.canShoot = false;
        this.bulletCooldown = this.bulletCooldownTime;
    }
    
    takeDamage(damage, fromPlayer = false) {
        if (this.invincible) return false;
        
        // 友军误伤检查
        if (this.isPlayer && fromPlayer && !this.friendlyFireImmune) {
            // 友军误伤生效
        } else if (this.isPlayer && fromPlayer && this.friendlyFireImmune) {
            return false;
        }
        
        this.health -= damage;
        
        if (this.health <= 0) {
            if (this.lives > 0) {
                this.lives--;
                this.health = this.maxHealth;
                this.respawn();
            } else {
                this.die();
            }
        }
        
        return true;
    }
    
    respawn() {
        // 玩家重生
        const spawnPoint = this.type === TANK_TYPE.PLAYER1 ? 
            CONFIG.PLAYER_SPAWN_POINTS[0] : CONFIG.PLAYER_SPAWN_POINTS[1];
        
        this.x = spawnPoint.x * CONFIG.TILE_SIZE;
        this.y = spawnPoint.y * CONFIG.TILE_SIZE;
        this.direction = DIRECTION.UP;
        this.invincible = true;
        this.invincibleTimer = 180; // 3秒无敌
    }
    
    die() {
        this.dead = true;
        this.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 'large');
        
        // 特殊坦克掉落道具
        if (this.type === TANK_TYPE.SPECIAL) {
            this.game.spawnPowerup(this.x, this.y);
        }
    }
    
    render(ctx) {
        // 坦克颜色
        let color, secondaryColor;
        
        if (this.type === TANK_TYPE.PLAYER1) {
            color = '#4ecdc4';
            secondaryColor = '#1a535c';
        } else if (this.type === TANK_TYPE.PLAYER2) {
            color = '#ffd93d';
            secondaryColor = '#6b4b00';
        } else if (this.type === TANK_TYPE.BASIC) {
            color = '#e94560';
            secondaryColor = '#533483';
        } else if (this.type === TANK_TYPE.FAST) {
            color = '#ff6b6b';
            secondaryColor = '#c92a2a';
        } else if (this.type === TANK_TYPE.HEAVY) {
            color = '#808080';
            secondaryColor = '#404040';
        } else { // SPECIAL
            color = '#ff69b4';
            secondaryColor = '#ff1493';
        }
        
        // 闪烁效果（无敌状态）
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // 绘制坦克主体
        ctx.fillStyle = color;
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // 绘制坦克边框
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // 绘制炮管
        ctx.fillStyle = secondaryColor;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        switch (this.direction) {
            case DIRECTION.UP:
                ctx.fillRect(centerX - 3, this.y, 6, this.height / 2);
                break;
            case DIRECTION.DOWN:
                ctx.fillRect(centerX - 3, centerY, 6, this.height / 2);
                break;
            case DIRECTION.LEFT:
                ctx.fillRect(this.x, centerY - 3, this.width / 2, 6);
                break;
            case DIRECTION.RIGHT:
                ctx.fillRect(centerX, centerY - 3, this.width / 2, 6);
                break;
        }
        
        // 绘制坦克内部细节
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(centerX - 5, centerY - 5, 10, 10);
        
        ctx.globalAlpha = 1;
    }
}

// 子弹类
class Bullet {
    constructor(tank, game) {
        this.tank = tank;
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.width = 4;
        this.height = 4;
        this.direction = tank.direction;
        this.speed = tank.bulletSpeed;
        this.damage = tank.bulletDamage;
        this.isPlayerBullet = tank.isPlayer;
        this.active = true;
        
        // 设置子弹初始位置
        this.setInitialPosition();
    }
    
    setInitialPosition() {
        const tankCenterX = this.tank.x + this.tank.width / 2;
        const tankCenterY = this.tank.y + this.tank.height / 2;
        
        switch (this.direction) {
            case DIRECTION.UP:
                this.x = tankCenterX - this.width / 2;
                this.y = this.tank.y - this.height;
                break;
            case DIRECTION.DOWN:
                this.x = tankCenterX - this.width / 2;
                this.y = this.tank.y + this.tank.height;
                break;
            case DIRECTION.LEFT:
                this.x = this.tank.x - this.width;
                this.y = tankCenterY - this.height / 2;
                break;
            case DIRECTION.RIGHT:
                this.x = this.tank.x + this.tank.width;
                this.y = tankCenterY - this.height / 2;
                break;
        }
    }
    
    update() {
        if (!this.active) return;
        
        // 移动子弹
        switch (this.direction) {
            case DIRECTION.UP:
                this.y -= this.speed;
                break;
            case DIRECTION.DOWN:
                this.y += this.speed;
                break;
            case DIRECTION.LEFT:
                this.x -= this.speed;
                break;
            case DIRECTION.RIGHT:
                this.x += this.speed;
                break;
        }
        
        // 检查边界
        if (this.x < 0 || this.x > CONFIG.CANVAS_SIZE ||
            this.y < 0 || this.y > CONFIG.CANVAS_SIZE) {
            this.active = false;
            return;
        }
        
        // 检查地图碰撞
        this.checkMapCollision();
        
        // 检查坦克碰撞
        if (this.active) {
            this.checkTankCollision();
        }
        
        // 检查子弹碰撞
        if (this.active) {
            this.checkBulletCollision();
        }
    }
    
    checkMapCollision() {
        const corners = [
            {x: this.x, y: this.y},
            {x: this.x + this.width, y: this.y},
            {x: this.x, y: this.y + this.height},
            {x: this.x + this.width, y: this.y + this.height}
        ];
        
        for (const corner of corners) {
            const gridX = Math.floor(corner.x / CONFIG.TILE_SIZE);
            const gridY = Math.floor(corner.y / CONFIG.TILE_SIZE);
            const tile = this.game.getTileAt(corner.x, corner.y);
            
            if (tile === TILE_TYPE.STEEL) {
                this.active = false;
                this.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 'small');
                return;
            }
            
            if (this.game.isTileDestructible(tile)) {
                this.active = false;
                this.game.damageTile(gridX, gridY, this.damage);
                this.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 'small');
                return;
            }
        }
    }
    
    checkTankCollision() {
        // 检查与玩家的碰撞
        if (!this.isPlayerBullet) {
            for (const player of this.game.players) {
                if (this.game.checkBoxCollision(
                    this.x, this.y, this.width, this.height,
                    player.x, player.y, player.width, player.height
                )) {
                    this.active = false;
                    player.takeDamage(this.damage, false);
                    this.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 'small');
                    return;
                }
            }
        } else {
            // 玩家子弹可以击中敌人和友军
            // 检查敌人
            for (const enemy of this.game.enemies) {
                if (this.game.checkBoxCollision(
                    this.x, this.y, this.width, this.height,
                    enemy.x, enemy.y, enemy.width, enemy.height
                )) {
                    this.active = false;
                    if (enemy.takeDamage(this.damage, false)) {
                        // 敌人受伤或死亡，加分
                        if (enemy.dead) {
                            const playerIndex = this.tank.type === TANK_TYPE.PLAYER1 ? 0 : 1;
                            this.game.score[playerIndex] += enemy.scoreValue;
                        }
                    }
                    this.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 'small');
                    return;
                }
            }
            
            // 检查友军（友军误伤）
            for (const player of this.game.players) {
                if (player === this.tank) continue;
                
                if (this.game.checkBoxCollision(
                    this.x, this.y, this.width, this.height,
                    player.x, player.y, player.width, player.height
                )) {
                    this.active = false;
                    player.takeDamage(this.damage, true);
                    this.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 'small');
                    return;
                }
            }
        }
    }
    
    checkBulletCollision() {
        for (const bullet of this.game.bullets) {
            if (bullet === this || !bullet.active) continue;
            
            if (this.game.checkBoxCollision(
                this.x, this.y, this.width, this.height,
                bullet.x, bullet.y, bullet.width, bullet.height
            )) {
                this.active = false;
                bullet.active = false;
                this.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 'small');
                return;
            }
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.isPlayerBullet ? '#ffffff' : '#ff6b6b';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 道具类
class Powerup {
    constructor(x, y, type, game) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.TILE_SIZE;
        this.height = CONFIG.TILE_SIZE;
        this.type = type;
        this.game = game;
        this.active = true;
        this.lifetime = 900; // 15秒
        this.blinkTimer = 0;
    }
    
    update() {
        if (!this.active) return;
        
        this.lifetime--;
        if (this.lifetime <= 0) {
            this.active = false;
            return;
        }
        
        // 检查与玩家的碰撞
        for (const player of this.game.players) {
            if (this.game.checkBoxCollision(
                this.x, this.y, this.width, this.height,
                player.x, player.y, player.width, player.height
            )) {
                this.collect(player);
                return;
            }
        }
    }
    
    collect(player) {
        this.active = false;
        this.game.applyPowerup(this, player);
        
        // 收集特效
        this.game.createExplosion(this.x + this.width / 2, this.y + this.height / 2, 'small');
    }
    
    render(ctx) {
        // 闪烁效果（快消失时）
        this.blinkTimer++;
        if (this.lifetime < 300 && Math.floor(this.blinkTimer / 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // 背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // 道具图标
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        switch (this.type) {
            case POWERUP_TYPE.HELMET:
                ctx.fillText('盔', centerX, centerY);
                break;
            case POWERUP_TYPE.CLOCK:
                ctx.fillText('钟', centerX, centerY);
                break;
            case POWERUP_TYPE.SHOVEL:
                ctx.fillText('铲', centerX, centerY);
                break;
            case POWERUP_TYPE.STAR:
                ctx.fillText('星', centerX, centerY);
                break;
            case POWERUP_TYPE.BOMB:
                ctx.fillText('弹', centerX, centerY);
                break;
            case POWERUP_TYPE.TANK:
                ctx.fillText('坦', centerX, centerY);
                break;
            case POWERUP_TYPE.SHIELD:
                ctx.fillText('盾', centerX, centerY);
                break;
        }
        
        ctx.globalAlpha = 1;
    }
}

// 爆炸效果类
class Explosion {
    constructor(x, y, size = 'medium') {
        this.x = x;
        this.y = y;
        this.size = size;
        this.frame = 0;
        this.maxFrames = size === 'large' ? 30 : 20;
        this.active = true;
    }
    
    update() {
        this.frame++;
        if (this.frame >= this.maxFrames) {
            this.active = false;
        }
    }
    
    render(ctx) {
        const progress = this.frame / this.maxFrames;
        const size = this.size === 'large' ? 60 : 30;
        const currentSize = size * (1 - progress * 0.5);
        
        // 爆炸颜色渐变
        const colors = ['#ff0000', '#ff6600', '#ffff00', '#ffffff'];
        const colorIndex = Math.floor(progress * colors.length);
        const color = colors[Math.min(colorIndex, colors.length - 1)];
        
        ctx.fillStyle = color;
        ctx.globalAlpha = 1 - progress;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    const game = new TankGame();
});