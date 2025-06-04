export function enableNextButtonOnInput() {
  const input = document.getElementById('username');
  const btn = document.getElementById('nextBtn');
  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().length === 0;
  });
}

export function showMainPage(username) {
  // Скрываем экран приветствия
  document.getElementById('welcome').style.display = 'none';
  
  // Отображаем главную страницу
  document.getElementById('mainPage').style.display = 'block';
  
  // Устанавливаем заголовок
  document.getElementById('header').textContent = `Привет, ${username}!`;

}
