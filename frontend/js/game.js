class FitnessTrainerGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        this.gameState = 'menu';
        // Полосы движения (центры полос)
        this.lanes = [100, 200, 300]; // Равномерно распределены между 100 и 300
        this.currentLane = 1;
        
        this.player = {
    x: 100,
    y: this.lanes[this.currentLane],
    width: 64,
    height: 64,
    speed: 5
};
        
        this.obstacles = [];
        this.girls = [];
        this.score = 0;
        this.skurcents = 0;
        this.level = 1;
        this.speed = 4;
        
        this.obstacleTypes = [
            { name: 'Селёдка', value: 'strong_smell' },
            { name: 'Свинья', value: 'untidy' },
            { name: 'Корова', value: 'fat' },
            { name: 'Лошадь', value: 'disproportionate' },
            { name: 'Кактус', value: 'bad_shave' },
            { name: 'Куст', value: 'unshaven' }
        ];
        
        this.girlTypes = [
            { name: 'Барби', value: 'barbie', points: 25 },
            { name: 'Swag-девушка', value: 'swag', points: 25 },
            { name: 'Принцесса', value: 'princess', points: 25 }
        ];

        // Загрузка настоящих спрайтов
        this.images = {
            car: new Image(),
            barbie: new Image(),
            swagGirl: new Image(),
            princess: new Image(),
            herring: new Image(),
            pig: new Image(),
            cow: new Image(),
            horse: new Image(),
            cactus: new Image(),
            bush: new Image()
        };

        // Устанавливаем источники для изображений
        this.images.car.src = 'assets/sprites/characters/car.png';
        this.images.barbie.src = 'assets/sprites/girls/barbie.png';
        this.images.swagGirl.src = 'assets/sprites/girls/swag-girl.png';
        this.images.princess.src = 'assets/sprites/girls/princess.png';
        this.images.herring.src = 'assets/sprites/obstacles/herring.png';
        this.images.pig.src = 'assets/sprites/obstacles/pig.png';
        this.images.cow.src = 'assets/sprites/obstacles/cow.png';
        this.images.horse.src = 'assets/sprites/obstacles/horse.png';
        this.images.cactus.src = 'assets/sprites/obstacles/cactus.png';
        this.images.bush.src = 'assets/sprites/obstacles/bush.png';

        // Флаг загрузки изображений
        this.imagesLoaded = false;
        this.imagesToLoad = Object.keys(this.images).length;
        this.loadedImagesCount = 0;
        
        this.setupControls();
        this.setupImageLoadHandlers();
    }
    
    // Проверка загрузки всех изображений
    checkAllImagesLoaded() {
        this.loadedImagesCount++;
        if (this.loadedImagesCount === this.imagesToLoad) {
            this.imagesLoaded = true;
            console.log('Все спрайты загружены!');
        }
    }

    // Назначаем обработчики загрузки для каждого изображения
    setupImageLoadHandlers() {
        Object.values(this.images).forEach(img => {
            img.onload = () => this.checkAllImagesLoaded();
            img.onerror = () => console.error('Ошибка загрузки спрайта:', img.src);
        });
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            if (e.key === 'ArrowUp' && this.currentLane > 0) {
                this.currentLane--;
                this.player.y = this.lanes[this.currentLane]; 
            } else if (e.key === 'ArrowDown' && this.currentLane < 2) {
                this.currentLane++;
                this.player.y = this.lanes[this.currentLane]; // Центрируем
            }
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.skurcents = 0;
        this.level = 1;
        this.speed = 4;
        this.obstacles = [];
        this.girls = [];
        this.gameLoop();
    }
    
    spawnObstacle() {
        const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
        const lane = Math.floor(Math.random() * 3);
        
        this.obstacles.push({
            x: this.canvas.width,
            y: this.lanes[lane], // Центрируем по вертикали (64/2 = 32)
            width: 64,
            height: 64,
            type: type,
            lane: lane
        });
    }
    
    spawnGirl() {
        const type = this.girlTypes[Math.floor(Math.random() * this.girlTypes.length)];
        const lane = Math.floor(Math.random() * 3);
        
        this.girls.push({
            x: this.canvas.width,
            y: this.lanes[lane], // Центрируем по вертикали (64/2 = 32)
            width: 64,
            height: 64,
            type: type,
            lane: lane
        });
    }
    
    update() {
        // Движение препятствий
        this.obstacles.forEach(obs => {
            obs.x -= this.speed;
        });
        
        // Движение девушек
        this.girls.forEach(girl => {
            girl.x -= this.speed;
        });
        
        // Проверка столкновений с препятствиями
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            if (this.checkCollision(this.player, obs)) {
                this.gameOver();
                return;
            }
            
            if (obs.x < -obs.width) {
                this.obstacles.splice(i, 1);
            }
        }
        
        // Проверка сбора девушек
        for (let i = this.girls.length - 1; i >= 0; i--) {
            const girl = this.girls[i];
            if (this.checkCollision(this.player, girl)) {
                this.skurcents += girl.type.points;
                this.score += 10;
                this.girls.splice(i, 1);
                
                if (this.skurcents >= 200 && this.level === 1) {
                    this.level = 2;
                    this.speed = 6;
                } else if (this.skurcents >= 500 && this.level === 2) {
                    this.level = 3;
                    this.speed = 8;
                }
            }
            
            if (girl.x < -girl.width) {
                this.girls.splice(i, 1);
            }
        }
        
        // Спавн новых объектов
        if (Math.random() < 0.01) this.spawnObstacle();
        if (Math.random() < 0.008) this.spawnGirl();
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        // Очистка canvas
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
       // Рисуем полосы
this.ctx.strokeStyle = '#3333ff';
this.ctx.lineWidth = 2;
this.lanes.forEach(lane => {
    this.ctx.beginPath();
    this.ctx.moveTo(0, lane);
    this.ctx.lineTo(this.canvas.width, lane);
    this.ctx.stroke();
});
        
        // Если изображения еще не загрузились, показываем заглушку
        if (!this.imagesLoaded) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = '16px Courier New';
            this.ctx.fillText('Загрузка спрайтов...', 350, 200);
            return;
        }
        
        // Игрок - машина
        this.ctx.drawImage(
            this.images.car, 
            this.player.x, 
            this.player.y, 
            this.player.width, 
            this.player.height
        );
        
        // Квадратные колеса
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(this.player.x - 5, this.player.y - 5, 10, 10);
        this.ctx.fillRect(this.player.x + this.player.width - 5, this.player.y - 5, 10, 10);
        this.ctx.fillRect(this.player.x - 5, this.player.y + this.player.height - 5, 10, 10);
        this.ctx.fillRect(this.player.x + this.player.width - 5, this.player.y + this.player.height - 5, 10, 10);
        
        // Препятствия - спрайты
        this.obstacles.forEach(obs => {
            let sprite = this.images.herring; // по умолчанию
            
            if (obs.type.value === 'strong_smell') sprite = this.images.herring;
            else if (obs.type.value === 'untidy') sprite = this.images.pig;
            else if (obs.type.value === 'fat') sprite = this.images.cow;
            else if (obs.type.value === 'disproportionate') sprite = this.images.horse;
            else if (obs.type.value === 'bad_shave') sprite = this.images.cactus;
            else if (obs.type.value === 'unshaven') sprite = this.images.bush;
            
            this.ctx.drawImage(sprite, obs.x, obs.y, obs.width, obs.height);
        });
        
        // Девушки - спрайты
        this.girls.forEach(girl => {
            let sprite = this.images.barbie; // по умолчанию
            
            if (girl.type.value === 'barbie') sprite = this.images.barbie;
            else if (girl.type.value === 'swag') sprite = this.images.swagGirl;
            else if (girl.type.value === 'princess') sprite = this.images.princess;
            
            this.ctx.drawImage(sprite, girl.x, girl.y, girl.width, girl.height);
        });
        
        // Интерфейс
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Courier New';
        this.ctx.fillText(`Очки: ${this.score}`, 10, 20);
        this.ctx.fillText(`Шкурценты: $${this.skurcents}`, 10, 40);
        this.ctx.fillText(`Уровень: ${this.level}`, 10, 60);
        this.ctx.fillText(`Скорость: ${this.speed}`, 10, 80);
    }
    
    gameOver() {
        this.gameState = 'gameover';
        this.saveScore();
        alert(`Игра окончена! Ваш результат: ${this.score} очков, $${this.skurcents} шкурцентов`);
        window.location.href = 'index.html';
    }
    
    async saveScore() {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) return;
            
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('score', this.score);
            formData.append('skurcents', this.skurcents);
            formData.append('level', this.level);
            
            const response = await fetch('/save_score', {
                method: 'POST',
                body: formData
            });
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', function() {
    const game = new FitnessTrainerGame('game-canvas');
    game.startGame();
});