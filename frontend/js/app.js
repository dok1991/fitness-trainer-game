// Основная логика приложения
function showMainMenu() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('leaderboard-section').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    
    if (currentUser) {
        document.getElementById('user-greeting').textContent = currentUser.display_name;
    }
}

function startGame() {
    // Всегда переходим на страницу инструкции при нажатии "Играть"
    window.location.href = 'instructions.html';
}

// Глобальные функции для кнопок
window.showLeaderboard = showLeaderboard;
window.showMainMenu = showMainMenu;
window.startGame = startGame;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fitness Trainer Game loaded');
});