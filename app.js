// Read-only Neon Launcher
// - Loads ./items.json (array of {name, url, icon})
// - Renders links only; no UI to add/edit/delete inside the page.
// Edit items.json to change what appears.

const CONFIG_PATH = './items.json';
const launcher = document.getElementById('launcher');

let items = [];

fetch(CONFIG_PATH, {cache: "no-store"})
  .then(r => {
    if (!r.ok) throw new Error('Config not found');
    return r.json();
  })
  .then(data => {
    if (Array.isArray(data)) items = data;
    else items = [];
  })
  .catch(() => {
    // if config missing or invalid, show empty state (no auto-created items)
    items = [];
  })
  .finally(() => render());

function render(){
  launcher.innerHTML = '';
  if (!items.length){
    const hint = document.createElement('div');
    hint.className = 'tile';
    hint.style.opacity = '0.9';
    hint.innerHTML = `<div class="icon">✨</div><div class="title">No items configured</div><div class="meta">Edit items.json to add links</div>`;
    launcher.appendChild(hint);
    return;
  }

  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'tile';
    el.tabIndex = 0;
    el.innerHTML = `
      <div class="icon">${renderIcon(it.icon)}</div>
      <div class="title" title="${escapeHtml(it.name)}">${escapeHtml(it.name)}</div>
      <div class="meta">${escapeHtml(prettyUrl(it.url || ''))}</div>
    `;

    el.addEventListener('click', () => openLink(it.url));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') openLink(it.url); });

    launcher.appendChild(el);
  });
}

function renderIcon(icon){
  if (!icon) return '🔗';
  try{
    const u = new URL(icon);
    return `<img src="${escapeHtml(icon)}" alt="" style="width:46px;height:46px;border-radius:8px;object-fit:cover">`;
  }catch(e){
    return escapeHtml(icon);
  }
}

function prettyUrl(u){
  if (!u) return '';
  return u.length > 36 ? u.slice(0,34) + '…' : u;
}

function openLink(u){
  if (!u) return;
  // Note: opening local executables from a browser may be blocked.
  // If you need native local launching, wrap this with Electron.
  window.open(u, '_blank', 'noopener');
}

function escapeHtml(s){
  return String(s || '').replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}