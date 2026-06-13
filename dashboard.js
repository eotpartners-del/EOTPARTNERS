const SESSION_KEY = 'eot_session';
  const BALANCE_KEY = 'eot_balance';
  const INVESTMENTS_KEY = 'eot_investments';
  const NOTIFICATIONS_KEY = 'eot_notifications';
  let balanceVisible = true;

  function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1a1f2b;border:1px solid rgba(212,175,55,0.3);color:#D4AF37;padding:12px 24px;border-radius:30px;font-size:13px;font-weight:600;z-index:9999;';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  function getSession() { const s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; }
  function getBalance() { const b = localStorage.getItem(BALANCE_KEY); return b ? JSON.parse(b) : { totalUSDT: 0, totalInvested: 0, totalProfit: 0 }; }
  function getInvestments() { const i = localStorage.getItem(INVESTMENTS_KEY); return i ? JSON.parse(i) : []; }

  // ========== Slider ==========
  let currentSlide = 0, slides = [], dots = [], totalSlides = 0;
  function loadSlider() {
  const mySlides = [
  { title:'صورة 1', subtitle:'وصف 1', image:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=300&fit=crop' },
  { title:'صورة 2', subtitle:'وصف 2', image:'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=300&fit=crop' },
  { title:'صورة 3', subtitle:'وصف 3', image:'https://images.unsplash.com/photo-1590283603385-17ffb3a7f584?w=800&h=300&fit=crop' },
  { title:'صورة 4', subtitle:'وصف 4', image:'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=300&fit=crop' },
  { title:'صورة 5', subtitle:'وصف 5', image:'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop' },
  { title:'صورة 6', subtitle:'وصف 6', image:'https://images.unsplash.com/photo-1612810806695-30f7a8258391?w=800&h=300&fit=crop' }
];
    const c = document.getElementById('sliderContainer');
    c.innerHTML = mySlides.map((s,i) => '<div class="slide '+(i===0?'active':'')+'" style="background-image:url(\''+s.image+'\');"><div class="slide-overlay"><div class="slide-title">'+s.title+'</div><div class="slide-subtitle">'+s.subtitle+'</div></div></div>').join('');
    const dotsContainer = document.getElementById('sliderDots');
    dotsContainer.innerHTML = mySlides.map((_,i) => '<span class="slider-dot '+(i===0?'active':'')+'" onclick="goToSlide('+i+')"></span>').join('');
    slides = document.querySelectorAll('.slide'); dots = document.querySelectorAll('.slider-dot'); totalSlides = slides.length; currentSlide = 0;
  }
  function goToSlide(i) { if (!slides[currentSlide]) return; slides[currentSlide].classList.remove('active'); dots[currentSlide].classList.remove('active'); currentSlide = i; slides[currentSlide].classList.add('active'); dots[currentSlide].classList.add('active'); }
  function nextSlide() { goToSlide((currentSlide + 1) % totalSlides); }

  // ========== Balance ==========
  function updateBalanceDisplay(b) {
    const c = b.totalInvested||0, p = b.totalProfit||0, t = (b.totalUSDT||0)+c+p;
    if (balanceVisible) {
      document.getElementById('grandTotal').textContent = '$' + t.toFixed(2);
      document.getElementById('totalInvestedDisplay').textContent = '$' + c.toFixed(2);
      document.getElementById('totalProfitSmall').textContent = (p>=0?'+':'') + '$' + p.toFixed(2);
    } else {
      document.getElementById('grandTotal').textContent = '****';
      document.getElementById('totalInvestedDisplay').textContent = '****';
      document.getElementById('totalProfitSmall').textContent = '****';
    }
  }
  function toggleBalance() { balanceVisible = !balanceVisible; updateBalanceDisplay(getBalance()); const i = document.querySelector('.balance-eye i'); if(i) i.className = balanceVisible ? 'fas fa-eye' : 'fas fa-eye-slash'; }

  function updateStats(b) {
    const profit = b.totalProfit||0, invested = b.totalInvested||0, available = b.totalUSDT||0;
    const total = available + invested + profit, target = total > 0 ? total * 10 : 0;
    const pct = target > 0 ? Math.min(Math.round((invested / target) * 100), 100) : 0;
    const circle = document.getElementById('progressCircle');
    if (circle) circle.style.strokeDashoffset = 534 - (pct / 100) * 534;
    document.getElementById('progressPercent').textContent = pct + '%';
    document.getElementById('progressInvested').textContent = '$' + invested.toFixed(0);
    document.getElementById('progressTarget').textContent = '$' + target.toFixed(0);
    document.getElementById('progressProfit').textContent = '$' + profit.toFixed(0);
    document.getElementById('progressPartners').textContent = getInvestments().filter(inv => inv.type === 'partner').length;
  }

  function updateWeeklyBadge(b) {
    const pct = b.totalInvested ? ((b.totalProfit||0) / b.totalInvested) * 100 : 0;
    const badge = document.getElementById('weeklyBadge');
    if (!badge) return;
    badge.textContent = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
    badge.style.color = pct >= 0 ? '#4ADE80' : '#F87171';
    badge.style.background = pct >= 0 ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)';
  }

  function updateInvestmentsList() {
    const investments = getInvestments(), container = document.getElementById('activeInvestments');
    if (!container) return;
    if (!investments.length) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:#6B7280;background:rgba(15,18,25,0.7);border-radius:20px;border:1px dashed rgba(255,255,255,0.06);"><div style="font-size:48px;margin-bottom:16px;opacity:0.3;"><i class="fas fa-rocket"></i></div><p style="font-weight:600;">لا توجد استثمارات بعد</p></div>';
      return;
    }
    container.innerHTML = investments.slice(0,5).map((inv,i) => '<div style="background:rgba(15,18,25,0.7);border:1px solid rgba(255,255,255,0.04);border-radius:16px;padding:16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="display:flex;align-items:center;gap:14px;"><div style="width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:18px;background:'+(inv.type==='invest'?'rgba(6,182,212,0.15)':'rgba(168,85,247,0.15)')+';color:'+(inv.type==='invest'?'#22D3EE':'#C084FC')+';"><i class="fas '+(inv.type==='invest'?'fa-chart-line':'fa-handshake')+'"></i></div><div><div style="color:#FFF;font-weight:600;">'+(inv.name||'استثمار #'+(i+1))+'</div><div style="font-size:11px;color:#6B7280;">'+(inv.type==='invest'?'استثمار':'شراكة')+' • '+(inv.date||'مستمر')+'</div></div></div><div style="text-align:left;"><div style="color:#FFF;font-weight:700;">$'+(inv.amount||0).toFixed(2)+'</div><div style="color:#4ADE80;font-size:12px;">+'+(inv.profit||0).toFixed(2)+'</div></div></div>').join('');
  }

  function initDashboard() {
    const session = getSession(); if (!session) { window.location.href = 'login.html'; return; }
    const balance = getBalance();
    updateBalanceDisplay(balance); updateStats(balance); updateInvestmentsList(); updateWeeklyBadge(balance);
  }

  function logout() { localStorage.removeItem(SESSION_KEY); window.location.href = 'login.html'; }

  // ========== Chat ==========
  function getChatQuestions() { return window.CHAT_QUESTIONS || []; }
  function loadQuestions() {
    const container = document.getElementById('chatQuestions');
    if (!container) return; const questions = getChatQuestions();
    if (!questions.length) { container.innerHTML = ''; return; }
    container.style.display = 'block';
    container.innerHTML = '<div style="font-size:10px;color:#999;margin-bottom:8px;">الأسئلة الشائعة:</div>' + questions.map((q,i) => '<button onclick="askQuestion('+i+')" style="display:block;width:100%;text-align:right;padding:8px 12px;margin-bottom:4px;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:10px;font-size:11px;cursor:pointer;color:#D4AF37;font-family:inherit;">'+q.icon+' '+q.question+'</button>').join('');
  }
  function askQuestion(index) {
    const q = (getChatQuestions()||[])[index]; if (!q) return;
    const b = document.getElementById('chatBody'), n = new Date(), t = n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0');
    b.innerHTML += '<div style="align-self:flex-start;max-width:85%;"><div style="background:rgba(212,175,55,0.15);color:#FFF;padding:10px 14px;border-radius:14px;font-size:12px;">'+q.question+'</div></div>';
    document.getElementById('chatQuestions').style.display = 'none';
    setTimeout(() => { b.innerHTML += '<div style="align-self:flex-end;max-width:85%;"><div style="background:#1a2740;color:#FFF;padding:10px 14px;border-radius:14px;font-size:12px;">'+q.answer+'</div></div>'; b.scrollTop = b.scrollHeight; }, 800);
    b.scrollTop = b.scrollHeight;
  }
  function toggleChat() { const c = document.getElementById('chatWindow'); c.style.display = c.style.display === 'flex' ? 'none' : 'flex'; if (c.style.display === 'flex') loadQuestions(); }
  function sendMessage() {
    const inp = document.getElementById('chatInput'), msg = inp.value.trim(); if (!msg) return;
    const b = document.getElementById('chatBody'), n = new Date(), t = n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0');
    b.innerHTML += '<div style="align-self:flex-start;max-width:85%;"><div style="background:rgba(212,175,55,0.15);color:#FFF;padding:10px 14px;border-radius:14px;font-size:12px;">'+msg+'</div></div>';
    document.getElementById('chatQuestions').style.display = 'none';
    setTimeout(() => { b.innerHTML += '<div style="align-self:flex-end;max-width:85%;"><div style="background:#1a2740;color:#FFF;padding:10px 14px;border-radius:14px;font-size:12px;">شكراً لتواصلك! سنرد عليك قريباً.</div></div>'; b.scrollTop = b.scrollHeight; }, 1000);
    inp.value = ''; b.scrollTop = b.scrollHeight;
  }
    // ========== Dots Menu ==========
  function toggleDotsMenu(e) { if(e) e.preventDefault(); const m = document.getElementById('dotsMenu'); m.style.display = m.style.display === 'block' ? 'none' : 'block'; }
  function getNotifications() { const s = getSession(); if (s) { const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)) || []; return all.filter(n => n.user === s.email || n.user === 'all'); } return []; }
  function getUnreadCount() { return getNotifications().filter(n => !n.read).length; }
  function loadNotifBadge() { const badge = document.getElementById('notifCountBadge'); if (!badge) return; const count = getUnreadCount(); badge.style.display = count > 0 ? 'inline-block' : 'none'; if (count > 0) badge.textContent = count; }
  function loadNotifSubmenu() {
    const list = document.getElementById('notifList'), empty = document.getElementById('notifEmpty');
    if (!list || !empty) return; const notifs = getNotifications().slice(-5).reverse();
    if (!notifs.length) { empty.style.display = 'block'; list.innerHTML = ''; }
    else { empty.style.display = 'none'; list.innerHTML = notifs.map((n, i) => '<div onclick="markNotifRead('+i+');event.stopPropagation();" style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;font-size:12px;display:flex;align-items:center;gap:8px;color:#E8EDF2;">' + (!n.read ? '<span style="width:8px;height:8px;border-radius:50%;background:#D4AF37;flex-shrink:0;"></span>' : '') + '<div><div style="font-weight:600;color:#FFF;">'+(n.title||'إشعار')+'</div><div style="font-size:9px;color:#999;">'+(n.date||'')+'</div></div></div>').join(''); }
  }
  function markNotifRead(index) { const s = getSession(); if (!s) return; const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)) || []; const userNotifs = all.filter(n => n.user === s.email || n.user === 'all'); const target = userNotifs[userNotifs.length - 1 - index]; if (target) { const ri = all.findIndex(n => n === target); if (ri !== -1) { all[ri].read = true; localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all)); loadNotifSubmenu(); loadNotifBadge(); } } }
  function toggleNotifSubmenu(e) { if (e) e.stopPropagation(); const sub = document.getElementById('notifSubmenu'), lang = document.getElementById('langSubmenu'); if (!sub) return; if (lang) lang.style.display = 'none'; loadNotifSubmenu(); loadNotifBadge(); sub.style.display = sub.style.display === 'block' ? 'none' : 'block'; }
  function toggleLangSubmenu(e) { if (e) e.stopPropagation(); const sub = document.getElementById('langSubmenu'), notif = document.getElementById('notifSubmenu'); if (!sub) return; if (notif) notif.style.display = 'none'; updateLangActive(); sub.style.display = sub.style.display === 'block' ? 'none' : 'block'; }
  function updateLangActive() { const currentLang = localStorage.getItem('eot_lang') || 'ar'; const items = document.querySelectorAll('#langSubmenu > div'); const langs = ['ar', 'en', 'fr', 'he', 'es', 'de', 'tr']; const index = langs.indexOf(currentLang); items.forEach(el => { el.style.background = ''; el.querySelector('.lang-check').style.display = 'none'; }); if (index !== -1 && items[index]) { items[index].style.background = 'rgba(212,175,55,0.1)'; items[index].querySelector('.lang-check').style.display = 'inline-block'; } }
  function setLanguage(lang) { const labels = { ar:'العربية', en:'English', fr:'Français', he:'עברית', es:'Español', de:'Deutsch', tr:'Türkçe' }; localStorage.setItem('eot_lang', lang); const label = document.getElementById('currentLangLabel'); if (label) label.textContent = labels[lang] || 'العربية'; updateLangActive(); document.getElementById('langSubmenu').style.display = 'none'; showToast('تم تغيير اللغة إلى ' + (labels[lang] || 'العربية')); if (lang === 'en') { setTimeout(() => { window.location.href = 'dashboard-en.html'; }, 500); } }

  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('notifMenuItem').addEventListener('click', toggleNotifSubmenu);
    document.getElementById('langMenuItem').addEventListener('click', toggleLangSubmenu);
    loadNotifBadge();
  });

  document.addEventListener('click', function(e) {
    const dotsMenu = document.getElementById('dotsMenu'), notifSub = document.getElementById('notifSubmenu'), langSub = document.getElementById('langSubmenu');
    const bottomBtn = document.querySelector('.bottom-item .fa-ellipsis-h')?.parentElement;
    if (dotsMenu && bottomBtn && !dotsMenu.contains(e.target) && !bottomBtn.contains(e.target)) dotsMenu.style.display = 'none';
    if (notifSub && !notifSub.contains(e.target) && e.target !== document.getElementById('notifMenuItem') && !document.getElementById('notifMenuItem').contains(e.target)) notifSub.style.display = 'none';
    if (langSub && !langSub.contains(e.target) && e.target !== document.getElementById('langMenuItem') && !document.getElementById('langMenuItem').contains(e.target)) langSub.style.display = 'none';
    const c = document.getElementById('chatWindow'), btn = document.querySelector('.support-float');
    if (c && btn && !c.contains(e.target) && !btn.contains(e.target)) c.style.display = 'none';
  });

  let lastScroll = 0;
  window.addEventListener('scroll', function() {
    const nav = document.getElementById('bottomNav');
    if (!nav) return;
    const s = window.pageYOffset;
    if (s > lastScroll && s > 80) { nav.style.transform = 'translateY(100%)'; }
    else { nav.style.transform = 'translateY(0)'; }
    lastScroll = s;
  });

const session = getSession();
if (session) {
  loadSlider(); initDashboard();
  setInterval(nextSlide, 15000);
  setInterval(function() { const b = getBalance(); updateBalanceDisplay(b); updateStats(b); updateWeeklyBadge(b); }, 30000);
} else {
  window.location.href = 'login.html';
}