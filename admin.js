/* ── STORAGE HELPERS ── */
const S = {
    get: (k, def = null) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

/* ── DEFAULT DATA ── */
const DEFAULTS = {
    credentials: { username: 'admin', password: 'aizentech2025', displayName: 'Admin' },
    content: {
        heroLine1: 'Gələcəyi',
        heroGradient: 'Süni İntellekt',
        heroLine3: 'ilə İnşa Edirik',
        heroSubtitle: 'Aizentech olaraq AI texnologiyasını hər sahəyə tətbiq edərək biznesləri dönüşdürən innovativ məhsullar hazırlayırıq.',
        contactEmail: 'info@aizentech.co',
        contactAddress: 'Bakı, Azərbaycan',
        contactWebsite: 'www.aizentech.co',
        statYears: 3,
        statClients: 20,
        statProducts: 5,
    },
    products: [
        { id: 1, emoji: '✈️', name: 'Tales on Tours', tagline: 'AI ilə Ağıllı Turizm Platforması', desc: 'Turizm sektorunu köklü şəkildə dəyişdirən AI əsaslı səyahət platforması.', status: 'live' },
        { id: 2, emoji: '🏥', name: 'MediAI', tagline: 'Sağlamlıq üçün AI', desc: 'Səhiyyə sektoru üçün AI diaqnostika və xəstə idarəetmə sistemi.', status: 'soon' },
        { id: 3, emoji: '📚', name: 'EduFlow AI', tagline: 'Fərdiləşdirilmiş Təhsil', desc: 'Adaptiv öyrənmə yolları və AI müəllim asistanı ilə yeni nəsil təhsil.', status: 'soon' },
        { id: 4, emoji: '🏢', name: 'BizFlow', tagline: 'Biznes Avtomatlaşdırma', desc: 'KOMBİ-lər üçün AI əsaslı iş prosesi avtomatlaşdırması.', status: 'soon' },
    ],
    submissions: [],
};

function initDefaults() {
    if (!S.get('credentials')) S.set('credentials', DEFAULTS.credentials);
    if (!S.get('content'))     S.set('content',     DEFAULTS.content);
    if (!S.get('products'))    S.set('products',    DEFAULTS.products);
    if (!S.get('submissions')) S.set('submissions', DEFAULTS.submissions);
}

/* ── AUTH ── */
let currentUser = null;

function checkAuth() {
    currentUser = S.get('currentSession');
    if (currentUser) showAdmin();
    else showLogin();
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminLayout').style.display = 'none';
}

function showAdmin() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'grid';
    document.getElementById('topbarUsername').textContent = currentUser.displayName || 'Admin';
    document.querySelector('.user-avatar').textContent = (currentUser.displayName || 'A')[0].toUpperCase();
    refreshAll();
    startClock();
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const creds = S.get('credentials');
    const err = document.getElementById('loginErr');

    if (user === creds.username && pass === creds.password) {
        currentUser = { username: user, displayName: creds.displayName };
        S.set('currentSession', currentUser);
        showAdmin();
    } else {
        err.textContent = 'İstifadəçi adı və ya şifrə yanlışdır.';
        document.getElementById('loginPass').value = '';
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentSession');
    currentUser = null;
    showLogin();
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginErr').textContent = '';
});

/* ── NAVIGATION ── */
function navigate(pageId) {
    document.querySelectorAll('.sb-link').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + pageId));
    const titles = { dashboard: 'Dashboard', submissions: 'Müraciətlər', content: 'Kontent İdarəetmə', products: 'Məhsullar', settings: 'Parametrlər' };
    document.getElementById('pageTitle').textContent = titles[pageId] || pageId;
    if (window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('open');
}

document.querySelectorAll('.sb-link').forEach(l => {
    l.addEventListener('click', (e) => { e.preventDefault(); navigate(l.dataset.page); });
});

document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); navigate(el.dataset.goto); });
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

/* ── CLOCK ── */
function startClock() {
    function tick() {
        const now = new Date();
        document.getElementById('topbarTime').textContent =
            now.toLocaleDateString('az-AZ') + ' ' + now.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
    }
    tick();
    setInterval(tick, 30000);
}

/* ── TOAST ── */
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = type === 'success' ? '✓  ' + msg : '✕  ' + msg;
    t.className = 'toast show ' + type;
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.className = 'toast', 2800);
}

/* ── SUBMISSIONS ── */
function getSubmissions() { return S.get('submissions') || []; }

function renderSubmissions() {
    const list = getSubmissions();
    const unread = list.filter(s => s.status === 'new').length;

    // badge
    const badge = document.getElementById('sbBadge');
    badge.textContent = unread;
    badge.classList.toggle('visible', unread > 0);

    // stats
    document.getElementById('statSubmissions').textContent = list.length;
    document.getElementById('statUnread').textContent = unread;

    // table
    const tbody = document.getElementById('submissionsBody');
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Müraciət yoxdur</td></tr>';
    } else {
        tbody.innerHTML = [...list].reverse().map(s => `
            <tr>
                <td>${formatDate(s.date)}</td>
                <td><strong>${esc(s.name)}</strong></td>
                <td>${esc(s.email)}</td>
                <td>${esc(s.company || '—')}</td>
                <td>${esc(s.service || '—')}</td>
                <td><span class="status-badge ${s.status}">${s.status === 'new' ? '🔵 Yeni' : '✓ Oxundu'}</span></td>
                <td class="row-actions">
                    <button class="row-btn" onclick="viewSubmission('${s.id}')">Bax</button>
                    <button class="row-btn danger" onclick="deleteSubmission('${s.id}')">Sil</button>
                </td>
            </tr>
        `).join('');
    }

    // recent (dashboard)
    const recent = document.getElementById('recentSubmissions');
    if (!list.length) {
        recent.innerHTML = '<p class="empty-msg">Hələ müraciət yoxdur</p>';
    } else {
        recent.innerHTML = [...list].reverse().slice(0, 4).map(s => `
            <div style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:center;cursor:pointer" onclick="navigate('submissions')">
                <div style="flex:1">
                    <div style="font-size:14px;font-weight:600">${esc(s.name)}</div>
                    <div style="font-size:12px;color:var(--muted2)">${esc(s.email)} · ${formatDate(s.date)}</div>
                </div>
                <span class="status-badge ${s.status}">${s.status === 'new' ? 'Yeni' : 'Oxundu'}</span>
            </div>
        `).join('');
    }
}

let viewingId = null;

function viewSubmission(id) {
    const list = getSubmissions();
    const s = list.find(x => x.id === id);
    if (!s) return;

    // mark as read
    s.status = 'read';
    S.set('submissions', list);
    renderSubmissions();

    viewingId = id;
    document.getElementById('detailBody').innerHTML = `
        <div class="detail-row"><span class="detail-label">Ad Soyad</span><span class="detail-val">${esc(s.name)}</span></div>
        <div class="detail-row"><span class="detail-label">Email</span><span class="detail-val">${esc(s.email)}</span></div>
        <div class="detail-row"><span class="detail-label">Şirkət</span><span class="detail-val">${esc(s.company || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Xidmət</span><span class="detail-val">${esc(s.service || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Tarix</span><span class="detail-val">${new Date(s.date).toLocaleString('az-AZ')}</span></div>
        <div class="detail-message">${esc(s.message)}</div>
    `;
    document.getElementById('detailModal').classList.add('open');
}

function deleteSubmission(id) {
    if (!confirm('Bu müraciəti silmək istəyirsiniz?')) return;
    const list = getSubmissions().filter(s => s.id !== id);
    S.set('submissions', list);
    renderSubmissions();
    document.getElementById('detailModal').classList.remove('open');
    showToast('Müraciət silindi');
}

document.getElementById('detailClose').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('open');
});
document.getElementById('detailDelete').addEventListener('click', () => {
    if (viewingId) deleteSubmission(viewingId);
});
document.getElementById('detailEmail').addEventListener('click', () => {
    const list = getSubmissions();
    const s = list.find(x => x.id === viewingId);
    if (s) window.open(`mailto:${s.email}?subject=Aizentech - Müraciətinizə cavab`);
});

document.getElementById('clearAllBtn').addEventListener('click', () => {
    if (!confirm('Bütün müraciətləri silmək istəyirsiniz?')) return;
    S.set('submissions', []);
    renderSubmissions();
    showToast('Bütün müraciətlər silindi');
});

document.getElementById('exportBtn').addEventListener('click', () => {
    const list = getSubmissions();
    if (!list.length) { showToast('Müraciət yoxdur', 'error'); return; }
    const header = 'Tarix,Ad Soyad,Email,Şirkət,Xidmət,Mesaj,Status';
    const rows = list.map(s => [
        new Date(s.date).toLocaleString('az-AZ'),
        s.name, s.email, s.company || '', s.service || '',
        '"' + (s.message || '').replace(/"/g, '""') + '"',
        s.status
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `aizentech-muraciетler-${Date.now()}.csv`;
    a.click();
    showToast('CSV yükləndi');
});

/* ── CONTENT EDITOR ── */
function loadContent() {
    const c = S.get('content') || DEFAULTS.content;
    document.getElementById('heroLine1').value      = c.heroLine1 || '';
    document.getElementById('heroGradient').value   = c.heroGradient || '';
    document.getElementById('heroLine3').value      = c.heroLine3 || '';
    document.getElementById('heroSubtitle').value   = c.heroSubtitle || '';
    document.getElementById('contactEmail').value   = c.contactEmail || '';
    document.getElementById('contactAddress').value = c.contactAddress || '';
    document.getElementById('contactWebsite').value = c.contactWebsite || '';
    document.getElementById('statYears').value      = c.statYears || 3;
    document.getElementById('statClients').value    = c.statClients || 20;
    document.getElementById('statProducts').value   = c.statProducts || 5;
}

document.getElementById('saveContentBtn').addEventListener('click', () => {
    const c = {
        heroLine1:      document.getElementById('heroLine1').value,
        heroGradient:   document.getElementById('heroGradient').value,
        heroLine3:      document.getElementById('heroLine3').value,
        heroSubtitle:   document.getElementById('heroSubtitle').value,
        contactEmail:   document.getElementById('contactEmail').value,
        contactAddress: document.getElementById('contactAddress').value,
        contactWebsite: document.getElementById('contactWebsite').value,
        statYears:      parseInt(document.getElementById('statYears').value) || 3,
        statClients:    parseInt(document.getElementById('statClients').value) || 20,
        statProducts:   parseInt(document.getElementById('statProducts').value) || 5,
    };
    S.set('content', c);
    showToast('Kontent yadda saxlandı');
});

/* ── PRODUCTS ── */
let editingProductId = null;

function renderProducts() {
    const list = S.get('products') || DEFAULTS.products;
    const statusLabel = { live: 'Canlı', soon: 'Tezliklə', development: 'İnkişafda' };
    document.getElementById('productsList').innerHTML = list.length
        ? list.map(p => `
            <div class="product-item">
                <div class="pi-top">
                    <div class="pi-emoji">${p.emoji}</div>
                    <div class="pi-info">
                        <h4>${esc(p.name)}</h4>
                        <p>${esc(p.tagline)}</p>
                    </div>
                    <span class="pi-status ${p.status}">${statusLabel[p.status]}</span>
                </div>
                <p class="pi-desc">${esc(p.desc)}</p>
                <div class="pi-actions">
                    <button class="row-btn" onclick="openProductModal(${p.id})">Düzəlt</button>
                    <button class="row-btn danger" onclick="deleteProduct(${p.id})">Sil</button>
                </div>
            </div>
        `).join('')
        : '<p class="empty-msg">Məhsul yoxdur</p>';
}

function openProductModal(id = null) {
    editingProductId = id;
    const modal = document.getElementById('productModal');
    document.getElementById('modalTitle').textContent = id ? 'Məhsulu Düzəlt' : 'Məhsul Əlavə Et';
    if (id) {
        const p = (S.get('products') || []).find(x => x.id === id);
        if (p) {
            document.getElementById('prodEmoji').value   = p.emoji;
            document.getElementById('prodName').value    = p.name;
            document.getElementById('prodTagline').value = p.tagline;
            document.getElementById('prodDesc').value    = p.desc;
            document.getElementById('prodStatus').value  = p.status;
        }
    } else {
        document.getElementById('prodEmoji').value   = '';
        document.getElementById('prodName').value    = '';
        document.getElementById('prodTagline').value = '';
        document.getElementById('prodDesc').value    = '';
        document.getElementById('prodStatus').value  = 'soon';
    }
    modal.classList.add('open');
}

function deleteProduct(id) {
    if (!confirm('Bu məhsulu silmək istəyirsiniz?')) return;
    const list = (S.get('products') || []).filter(p => p.id !== id);
    S.set('products', list);
    renderProducts();
    showToast('Məhsul silindi');
}

document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
document.getElementById('modalClose').addEventListener('click', () => document.getElementById('productModal').classList.remove('open'));
document.getElementById('modalCancel').addEventListener('click', () => document.getElementById('productModal').classList.remove('open'));

document.getElementById('modalSave').addEventListener('click', () => {
    const name = document.getElementById('prodName').value.trim();
    if (!name) { showToast('Ad boş ola bilməz', 'error'); return; }

    const list = S.get('products') || [];
    if (editingProductId) {
        const idx = list.findIndex(p => p.id === editingProductId);
        if (idx >= 0) {
            list[idx] = {
                ...list[idx],
                emoji:   document.getElementById('prodEmoji').value || '📦',
                name,
                tagline: document.getElementById('prodTagline').value,
                desc:    document.getElementById('prodDesc').value,
                status:  document.getElementById('prodStatus').value,
            };
        }
    } else {
        list.push({
            id:      Date.now(),
            emoji:   document.getElementById('prodEmoji').value || '📦',
            name,
            tagline: document.getElementById('prodTagline').value,
            desc:    document.getElementById('prodDesc').value,
            status:  document.getElementById('prodStatus').value,
        });
    }
    S.set('products', list);
    renderProducts();
    document.getElementById('productModal').classList.remove('open');
    showToast(editingProductId ? 'Məhsul yeniləndi' : 'Məhsul əlavə edildi');
});

/* ── SETTINGS ── */
function loadSettings() {
    const creds = S.get('credentials') || DEFAULTS.credentials;
    document.getElementById('adminUsername').value    = creds.username;
    document.getElementById('adminDisplayName').value = creds.displayName || 'Admin';
}

document.getElementById('savePassBtn').addEventListener('click', () => {
    const curr = document.getElementById('currPass').value;
    const nw   = document.getElementById('newPass').value;
    const conf = document.getElementById('confPass').value;
    const msg  = document.getElementById('passMsg');
    const creds = S.get('credentials');

    if (curr !== creds.password) {
        msg.textContent = 'Hazırkı şifrə yanlışdır'; msg.className = 'settings-msg error'; return;
    }
    if (nw.length < 6) {
        msg.textContent = 'Şifrə ən az 6 simvol olmalıdır'; msg.className = 'settings-msg error'; return;
    }
    if (nw !== conf) {
        msg.textContent = 'Şifrələr uyğun deyil'; msg.className = 'settings-msg error'; return;
    }
    creds.password = nw;
    S.set('credentials', creds);
    msg.textContent = 'Şifrə uğurla yeniləndi'; msg.className = 'settings-msg success';
    document.getElementById('currPass').value = '';
    document.getElementById('newPass').value  = '';
    document.getElementById('confPass').value = '';
    showToast('Şifrə yeniləndi');
});

document.getElementById('saveUserBtn').addEventListener('click', () => {
    const un   = document.getElementById('adminUsername').value.trim();
    const dn   = document.getElementById('adminDisplayName').value.trim();
    const msg  = document.getElementById('userMsg');
    if (!un) { msg.textContent = 'İstifadəçi adı boş ola bilməz'; msg.className = 'settings-msg error'; return; }
    const creds = S.get('credentials');
    creds.username = un;
    creds.displayName = dn || 'Admin';
    S.set('credentials', creds);
    currentUser.displayName = creds.displayName;
    S.set('currentSession', currentUser);
    document.getElementById('topbarUsername').textContent = creds.displayName;
    msg.textContent = 'Məlumatlar yadda saxlandı'; msg.className = 'settings-msg success';
    showToast('Məlumatlar yeniləndi');
});

document.getElementById('dangerClearBtn').addEventListener('click', () => {
    if (!confirm('Bütün məlumatlar (müraciətlər, kontent, məhsullar) silinəcək. Davam edirsinizsə?')) return;
    ['submissions','content','products'].forEach(k => localStorage.removeItem(k));
    initDefaults();
    refreshAll();
    showToast('Bütün məlumatlar sıfırlandı');
});

/* ── MAIN REFRESH ── */
function refreshAll() {
    renderSubmissions();
    renderProducts();
    loadContent();
    loadSettings();
}

/* ── CONTACT FORM INTEGRATION ── */
/* Save submissions from main page via localStorage event */
window.addEventListener('storage', (e) => {
    if (e.key === 'newSubmission' && e.newValue) {
        const sub = JSON.parse(e.newValue);
        const list = getSubmissions();
        list.push(sub);
        S.set('submissions', list);
        localStorage.removeItem('newSubmission');
        renderSubmissions();
    }
});

/* ── UTILS ── */
function esc(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(iso) {
    try { return new Date(iso).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return iso; }
}

/* ── CLOSE MODALS ON BACKDROP ── */
document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('open'); });
});

/* ── INIT ── */
initDefaults();
checkAuth();
