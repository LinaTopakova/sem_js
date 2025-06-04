// uiService.js

export function enableNextButtonOnInput() {
  const input = document.getElementById('username');
  const btn = document.getElementById('nextBtn');
  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().length === 0;
  });
}

export function showMainPage(username) {
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('mainPage').style.display = 'block';
  document.getElementById('header').textContent = `Привет, ${username}!`;
}

export function renderUserIdFilters(posts, onChange) {
  const userIdSet = new Set(posts.map(p => p.userId));
  const container = document.getElementById('userIdFilters');
  container.innerHTML = '';
  userIdSet.forEach(userId => {
    const label = document.createElement('label');
    label.style.marginRight = '10px';
    label.innerHTML = `<input type="checkbox" value="${userId}" checked /> User ${userId}`;
    container.appendChild(label);
  });
  container.addEventListener('change', onChange);
}

export function renderPostsTable(posts) {
  const tbody = document.getElementById('postsTableBody');
  tbody.innerHTML = '';
  posts.forEach(post => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${post.id}</td>
      <td>${escapeHtml(post.title)}</td>
      <td>${escapeHtml(post.body)}</td>
    `;
    tbody.appendChild(tr);
  });
}

export function renderStats(posts) {
  const statsDiv = document.getElementById('stats');
  if (!posts.length) {
    statsDiv.textContent = 'Нет данных для отображения статистики.';
    return;
  }
  const total = posts.length;
  const userIds = [...new Set(posts.map(p => p.userId))];
  statsDiv.textContent = `Всего записей: ${total}. Уникальных пользователей: ${userIds.length}.`;
}

export function setupTableSort(onSort) {
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => onSort(th.dataset.sort));
  });
}

export function setupResetFilters(onReset) {
  document.getElementById('resetFilters').addEventListener('click', onReset);
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
