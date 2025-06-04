// main.js
import { fetchPosts } from './dataService.js';
import { enableNextButtonOnInput, showMainPage, renderUserIdFilters, renderPostsTable, renderStats, setupTableSort, setupResetFilters } from './uiService.js';

let allPosts = [];
let filteredPosts = [];
let currentSort = { field: 'id', ascending: true };
let activeUserIds = new Set();

function sortPosts(posts, field, ascending) {
  return posts.slice().sort((a, b) => {
    if (typeof a[field] === 'string') {
      return ascending ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field]);
    }
    return ascending ? a[field] - b[field] : b[field] - a[field];
  });
}

function applyFilters() {
  filteredPosts = allPosts.filter(post => activeUserIds.has(post.userId));
}

function updateDisplay() {
  let sorted = sortPosts(filteredPosts, currentSort.field, currentSort.ascending);
  renderPostsTable(sorted);
  renderStats(sorted);
}

function initMainPage(username) {
  showMainPage(username);

  renderUserIdFilters(allPosts, () => {
    const checkboxes = document.querySelectorAll('#userIdFilters input[type=checkbox]');
    activeUserIds = new Set();
    checkboxes.forEach(cb => { if(cb.checked) activeUserIds.add(Number(cb.value)); });
    applyFilters();
    updateDisplay();
  });

  activeUserIds = new Set(allPosts.map(p => p.userId));
  applyFilters();

  setupTableSort((field) => {
    if (currentSort.field === field) currentSort.ascending = !currentSort.ascending;
    else {
      currentSort.field = field;
      currentSort.ascending = true;
    }
    updateDisplay();
  });

  setupResetFilters(() => {
    const checkboxes = document.querySelectorAll('#userIdFilters input[type=checkbox]');
    checkboxes.forEach(cb => cb.checked = true);
    activeUserIds = new Set(allPosts.map(p => p.userId));
    applyFilters();
    updateDisplay();
  });

  updateDisplay();
}

function startApp() {
  enableNextButtonOnInput();

  document.getElementById('nextBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    if (!username) return;

    try {
      allPosts = await fetchPosts();
      initMainPage(username);
    } catch (e) {
      alert('Ошибка при загрузке данных: ' + e.message);
    }
  });
}

startApp();
