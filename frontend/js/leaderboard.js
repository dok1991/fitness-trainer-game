// Логика таблицы лидеров
async function showLeaderboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('leaderboard-section').style.display = 'block';
    
    try {
        const response = await fetch('/leaderboard?limit=10');
        const leaderboard = await response.json();
        
        const leaderboardElement = document.getElementById('leaderboard');
        leaderboardElement.innerHTML = '';
        
        if (leaderboard.length === 0) {
            leaderboardElement.innerHTML = '<p>Пока нет результатов</p>';
            return;
        }
        
        leaderboard.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <strong>${index + 1}. ${player.display_name} (@${player.username})</strong><br>
                Очки: ${player.score} | Шкурценты: $${player.skurcents} | Уровень: ${player.level}
            `;
            leaderboardElement.appendChild(item);
        });
        
    } catch (error) {
        console.error('Ошибка загрузки таблицы лидеров:', error);
        document.getElementById('leaderboard').innerHTML = '<p>Ошибка загрузки таблицы лидеров</p>';
    }
}