import { showMainPage, enableNextButtonOnInput } from './uiService.js';

function initMainPage(username) {

  showMainPage(username);
  // Больше ничего не рендерим
}

function startApp() {
  enableNextButtonOnInput();

  document.getElementById('nextBtn').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    if (!username) return;

    initMainPage(username);
  });
}

startApp();
