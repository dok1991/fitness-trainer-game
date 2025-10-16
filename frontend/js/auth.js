// Логика авторизации и регистрации
let currentUser = null;

document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const displayName = document.getElementById('display-name').value;
    const username = document.getElementById('username').value;
    
    try {
        // Используем FormData для правильной отправки
        const formData = new FormData();
        formData.append('username', username);
        formData.append('display_name', displayName);
        
        const response = await fetch('/register', {
            method: 'POST',
            body: formData  // Не указываем Content-Type, браузер сам установит
        });
        
        if (response.ok) {
            const result = await response.json();
            currentUser = result;
            localStorage.setItem('user_id', result.user_id);
            localStorage.setItem('username', result.username);
            localStorage.setItem('display_name', displayName);
            
            showMainMenu();
        } else {
            const errorText = await response.text();
            console.error('Ошибка регистрации:', errorText);
            alert('Ошибка регистрации: ' + errorText);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка соединения с сервером: ' + error.message);
    }
});

// Проверяем авторизацию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const savedUserId = localStorage.getItem('user_id');
    const savedUsername = localStorage.getItem('username');
    const savedDisplayName = localStorage.getItem('display_name');
    
    if (savedUserId && savedUsername) {
        currentUser = {
            user_id: savedUserId,
            username: savedUsername,
            display_name: savedDisplayName
        };
        showMainMenu();
    }
});