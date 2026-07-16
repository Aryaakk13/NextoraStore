// ============================================================
// CONFIG — ISI SEMUA NILAI DI BAWAH INI DENGAN DATA ASLI KAMU.
// Nilai yang masih berawalan "GANTI_" TIDAK BOLEH dibiarkan saat live —
// situs akan menampilkan peringatan otomatis di layar selama ini.
// ============================================================
const CONFIG = {
  serverIp: 'play.nextorasmp.my.id',

  // Nomor tujuan transfer e-wallet (GoPay/OVO/DANA/ShopeePay) — nomor ASLI kamu.
  walletNumber: '0896-4707-6472',
  walletOwner: 'ARYA DHIMAS DWI PRAYOGO',  // nama pemilik rekening/akun e-wallet

  // QRIS statis MILIK KAMU SENDIRI (bukan milik toko/orang lain!).
  // Kalau ini salah, uang pembeli masuk ke rekening orang lain, bukan ke kamu.
  qrisImage: 'https://www.image2url.com/r2/default/images/1784183198182-4fbb221f-44f7-4d8f-bc4a-a7784b05163d.jpeg',
  qrisMerchant: 'ARVIE STORE',

  // URL backend (lihat folder /worker) yang menyimpan Discord webhook secara
  // AMAN di server, bukan di browser. Isi setelah kamu deploy Worker-nya.
 orderApiUrl: 'https://flat-sea-5916nextorasmp-api.melonetsfy-bhyz.workers.dev/api/order',
 leaderboardApiUrl: 'https://flat-sea-5916nextorasmp-api.melonetsfy-bhyz.workers.dev/api/leaderboard',
};

// ---------- CEK KONFIGURASI BELUM DIISI (tampilkan peringatan, jangan diam-diam salah) ----------
function findUnfilledConfig(){
  return Object.entries(CONFIG).filter(([, v]) => typeof v === 'string' && v.startsWith('GANTI_'));
}
function renderConfigWarning(){
  const missing = findUnfilledConfig();
  if(missing.length === 0) return;
  const bar = document.createElement('div');
  bar.style.cssText = 'position:sticky;top:0;z-index:2000;background:#E5484D;color:#fff;font:600 13px/1.5 Inter,sans-serif;padding:10px 16px;text-align:center;';
  bar.innerHTML = '⚠️ Situs belum siap launching — konfigurasi berikut masih placeholder: '
    + missing.map(([k]) => `<code style="background:rgba(255,255,255,.2);padding:1px 5px;border-radius:4px;">${k}</code>`).join(', ')
    + '. Isi di script.js (CONFIG) sebelum menerima pembayaran sungguhan.';
  document.body.prepend(bar);
  console.warn('[NextoraSMP] Konfigurasi belum lengkap:', missing.map(([k]) => k));
}

// ---------- SCROLL EFFECTS (navbar shadow + reveal on scroll) ----------
const siteHeader = document.getElementById('siteHeader');
window.addEventListener('scroll', ()=>{
  siteHeader.classList.toggle('scrolled', window.scrollY > 8);
}, { passive:true });

const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold:0.15 });

function observeReveals(root=document){
  root.querySelectorAll('.reveal:not(.in-view)').forEach(el=>revealObserver.observe(el));
}

// ---------- TOASTS ----------
function showToast(msg, ms=3500){
  const stack = document.getElementById('toastStack');
  if(!stack) return;
  const el = document.createElement('div');
  el.className = 'toast-item';
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity .25s ease'; el.style.opacity='0'; setTimeout(()=>el.remove(),260); }, ms);
}

// ---------- LIVE SERVER STATUS ----------
async function fetchServerStatus(){
  const badge = document.getElementById('statusBadge');
  const text = document.getElementById('statusText');
  const statOnline = document.getElementById('statOnline');

  try{
    const res = await fetch('https://api.mcsrvstat.us/3/' + CONFIG.serverIp);
    const data = await res.json();

    if(data && data.online){
      const players = data.players && typeof data.players.online === 'number' ? data.players.online : 0;
      badge.classList.remove('offline');
      text.textContent = players.toLocaleString('id-ID') + ' Player Online';
      statOnline.textContent = players.toLocaleString('id-ID');
    } else {
      badge.classList.add('offline');
      text.textContent = 'Server Sedang Offline';
      statOnline.textContent = '0';
    }
  } catch(err){
    badge.classList.add('offline');
    text.textContent = 'Status server tidak tersedia';
    statOnline.textContent = '—';
  }
}

// ---------- IP COPY ----------
function copyIP(){
  const ip = CONFIG.serverIp;
  if(navigator.clipboard){ navigator.clipboard.writeText(ip).catch(()=>{}); }
  const btn = document.getElementById('ip-btn');
  const old = btn.textContent;
  btn.textContent = "IP Disalin!";
  setTimeout(()=>btn.textContent = old, 1500);
}

function toggleMenu(){
  document.querySelector('.nav-links').classList.toggle('open');
}

const fmt = n => "Rp" + n.toLocaleString('id-ID');

// ---------- RANK DATA ----------
// Ini bukan "dummy" — ini katalog produkmu. Tetap edit harga/nama sesuai server kamu.
const rankData = {
  vip:     {name:'IRON — NEXTRA',      ore:'ore-iron',      price:25000},
  mvp:     {name:'GOLD — NEXOR',       ore:'ore-gold',      price:50000},
  elite:   {name:'DIAMOND — NEZITH',   ore:'ore-diamond',   price:100000},
  legend:  {name:'NETHERITE — NEXTDYRE',ore:'ore-netherite', price:200000},
};

// ---------- GEMS DATA ----------
// Sama seperti rank: ini daftar harga produkmu, bukan dummy — sesuaikan nominal & harga.
const gemPackages = [
  {amt:1000,  price:15000,  bonus:0},
  {amt:2500,  price:35000,  bonus:100},
  {amt:5000,  price:65000,  bonus:300},
  {amt:7500,  price:90000,  bonus:600},
  {amt:10000, price:115000, bonus:1000, best:true},
  {amt:15000, price:160000, bonus:1800},
];

const grid = document.getElementById('gemGrid');
let selectedIdx = null;

gemPackages.forEach((p, i)=>{
  const card = document.createElement('div');
  card.className = 'gem-card reveal';
  card.innerHTML = `
    ${p.best ? '<span class="best-value">BEST VALUE</span>' : ''}
    <div class="gicon"></div>
    <div class="gamt">${p.amt.toLocaleString('id-ID')}</div>
    <div class="gprice">${fmt(p.price)}</div>
    ${p.bonus ? `<div class="gbonus">+${p.bonus} bonus</div>` : ''}
  `;
  card.onclick = ()=> selectPackage(i);
  grid.appendChild(card);
});

function selectPackage(i){
  selectedIdx = i;
  document.querySelectorAll('.gem-card').forEach((c,idx)=>c.classList.toggle('selected', idx===i));
  const p = gemPackages[i];
  document.getElementById('sumPkg').textContent = p.amt.toLocaleString('id-ID') + ' Gems';
  document.getElementById('sumGems').textContent = p.amt.toLocaleString('id-ID');
  document.getElementById('sumBonus').textContent = '+' + p.bonus.toLocaleString('id-ID');
  document.getElementById('sumTotal').textContent = fmt(p.price);
}
selectPackage(4);

// ---------- LEADERBOARD (data ASLI, diambil dari backend) ----------
// Tidak ada lagi nama pemain fiktif di sini. Data didapat dari CONFIG.leaderboardApiUrl,
// yang kamu isi lewat plugin server / cron job kamu sendiri (lihat worker/README).
const LB_UNITS = { vote:'votes', donate:'Rp', balance:'gems', playtime:'jam' };
let leaderboardData = null;   // null = belum dimuat
let leaderboardError = false;
let activeLbTab = 'vote';

async function loadLeaderboard(){
  try{
    const res = await fetch(CONFIG.leaderboardApiUrl);
    if(!res.ok) throw new Error('status ' + res.status);
    leaderboardData = await res.json();
    leaderboardError = false;
  }catch(err){
    console.error('Gagal memuat leaderboard:', err);
    leaderboardData = null;
    leaderboardError = true;
  }
  renderLbBody();
}

function showTab(tab, btn){
  activeLbTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  else {
    const match = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if(match) match.classList.add('active');
  }
  renderLbBody();
}

function renderLbBody(){
  const body = document.getElementById('lbBody');
  if(!body) return;

  if(leaderboardData === null){
    body.innerHTML = `<div class="lb-row"><span></span><span style="color:var(--text-mute)">${leaderboardError ? 'Gagal memuat data leaderboard. Coba refresh halaman.' : 'Memuat data...'}</span><span></span></div>`;
    return;
  }

  const rows = leaderboardData[activeLbTab] || [];
  if(rows.length === 0){
    body.innerHTML = `<div class="lb-row"><span></span><span style="color:var(--text-mute)">Belum ada data untuk kategori ini.</span><span></span></div>`;
    return;
  }

  const unit = LB_UNITS[activeLbTab];
  body.innerHTML = rows.map((row, i)=>{
    const val = unit==='Rp' ? fmt(row.v) : row.v.toLocaleString('id-ID') + ' ' + unit;
    return `
      <div class="lb-row">
        <span class="lb-rank">#${i+1}</span>
        <span class="lb-player"><span class="lb-avatar"></span>${escapeHtml(row.n)}</span>
        <span class="lb-value">${val}</span>
      </div>
    `;
  }).join('');
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

// ---------- FAQ ----------
const faqData = [
  {q:'Apakah pengiriman item benar-benar otomatis?', a:'Sebagian otomatis: begitu kamu klik "Saya Sudah Bayar/Transfer", sistem langsung mengirim notifikasi pesanan (nickname, item, kode unik) ke tim staff lewat backend kami. Staff mencocokkan mutasi pembayaran dengan kode unik lalu mengirim item lewat /kit di server. Verifikasi tetap dilakukan manusia — kalau kamu ingin verifikasi otomatis penuh, pertimbangkan payment gateway seperti Tripay/Midtrans/Duitku.'},
  {q:'Kenapa ada kode unik di belakang nominal?', a:'Kode unik (misalnya Rp50.137) membantu staff mencocokkan transfer kamu dengan pesanan yang benar, apalagi kalau ada banyak pembeli di waktu bersamaan. Selalu transfer PERSIS sejumlah nominal yang tertera, jangan dibulatkan.'},
  {q:'Bagaimana cara isi nickname Bedrock?', a:'Untuk pemain Bedrock (mobile/console), tambahkan garis bawah ( _ ) di depan nickname, contoh: _bilpayy. Ini standar dari Geyser/Floodgate agar nickname Bedrock tidak bentrok dengan akun Java.'},
  {q:'Berapa lama proses setelah bayar?', a:'Normalnya 5–15 menit di jam aktif staff. Kalau lebih dari 30 menit belum masuk, hubungi Discord resmi dengan menyertakan ID Pesanan.'},
];

function renderFaq(){
  const list = document.getElementById('faqList');
  if(!list) return;
  list.innerHTML = faqData.map((f,i)=>`
    <div class="faq-item" id="faqItem${i}">
      <div class="faq-q" onclick="toggleFaq(${i})"><span>${f.q}</span><span class="faq-arrow">▾</span></div>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>
  `).join('');
}
function toggleFaq(i){
  const item = document.getElementById('faqItem'+i);
  const a = item.querySelector('.faq-a');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el=>{
    el.classList.remove('open');
    el.querySelector('.faq-a').style.maxHeight = null;
  });
  if(!isOpen){
    item.classList.add('open');
    a.style.maxHeight = a.scrollHeight + 'px';
  }
}

// ---------- KIRIM ORDER KE BACKEND (bukan langsung ke Discord dari browser) ----------
async function submitOrder(order, attempt=1){
  try{
    const res = await fetch(CONFIG.orderApiUrl, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(order),
    });
    if(!res.ok) throw new Error('status ' + res.status);
    const data = await res.json();
    return !!data.success;
  }catch(err){
    console.error('Gagal kirim order ke backend (percobaan ' + attempt + '):', err);
    if(attempt < 3){
      await new Promise(r=>setTimeout(r, 1000 * attempt));
      return submitOrder(order, attempt + 1);
    }
    return false;
  }
}

// ---------- ORDER HISTORY (in-memory, reset saat reload — catatan permanen ada di backend/Discord) ----------
const orderHistory = [];

// ---------- POPOUT MODAL : MULTI-STEP PURCHASE FLOW ----------
const overlay = document.getElementById('modalOverlay');
const modalBox = document.getElementById('modalBox');

const paymentCategories = [
  {id:'qris',    label:'QRIS',    icon:'QR', desc:'Scan sekali, berlaku untuk semua bank & e-wallet'},
  {id:'ewallet', label:'E-Wallet', icon:'EW', desc:'Transfer manual ke nomor GoPay/OVO/DANA/ShopeePay'},
];

const wallets = [
  {id:'gopay',     label:'GoPay',      cls:'pm-gopay',     tag:'GP'},
  {id:'ovo',       label:'OVO',        cls:'pm-ovo',       tag:'OVO'},
  {id:'dana',      label:'DANA',       cls:'pm-dana',      tag:'DN'},
  {id:'shopeepay', label:'ShopeePay',  cls:'pm-shopeepay', tag:'SP'},
];

let flow = null; // { order, step, platform, nickname, player, category, wallet, uniqueCode }
let qrTimerId = null;
let qrSecondsLeft = 600;

function startFlow(order){
  flow = { order, step:1, platform:'java', nickname:'', player:null, category:null, wallet:null,
           uniqueCode: 1 + Math.floor(Math.random()*97) };
  openModal();
  renderStep();
}

function openRankModal(key){
  const r = rankData[key];
  startFlow({ title:r.name, subtitle:'Pembelian rank permanen', ore:r.ore, price:r.price });
}

function openGemsModal(){
  if(selectedIdx===null) return;
  const p = gemPackages[selectedIdx];
  startFlow({
    title: p.amt.toLocaleString('id-ID') + ' Gems' + (p.bonus? ' + ' + p.bonus.toLocaleString('id-ID') + ' bonus' : ''),
    subtitle: 'Top up mata uang server',
    ore: 'ore-diamond',
    price: p.price,
  });
}

function totalWithCode(){
  return flow.order.price + flow.uniqueCode;
}

function stepIndicatorHTML(){
  const labels = ['1','2','3'];
  return `<div class="step-indicator">
    ${labels.map((l,i)=>{
      const n = i+1;
      const cls = n < flow.step ? 'done' : (n === flow.step ? 'active' : '');
      const dot = `<div class="step-dot ${cls}">${n < flow.step ? '✓' : l}</div>`;
      return i < labels.length-1 ? dot + `<div class="step-line ${n < flow.step ? 'done' : ''}"></div>` : dot;
    }).join('')}
  </div>`;
}

function itemRecapHTML(){
  return `<div class="item-recap">
    <div class="modal-ore ${flow.order.ore}"></div>
    <div style="flex:1">
      <div class="ir-name">${flow.order.title}</div>
      <div class="ir-price">${fmt(flow.order.price)}</div>
    </div>
  </div>`;
}

function renderStep(){
  clearQrTimer();
  if(flow.step === 1) renderNicknameStep();
  if(flow.step === 2) renderCategoryStep();
  if(flow.step === 3) renderPaymentDetailStep();
  modalBox.classList.remove('step-anim');
  void modalBox.offsetWidth; // restart animation
  modalBox.classList.add('step-anim');
}

// ---- STEP 1: NICKNAME (Java / Bedrock) ----
function renderNicknameStep(){
  const isBedrock = flow.platform === 'bedrock';
  modalBox.innerHTML = `
    <div class="modal-head">
      <div style="flex:1">
        <h3>Masukkan Nickname</h3>
        <p>Pilih platform lalu isi username tujuan pengiriman item.</p>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${stepIndicatorHTML()}
      ${itemRecapHTML()}
      <div class="field-label">Platform Minecraft</div>
      <div class="platform-toggle">
        <div class="platform-btn ${!isBedrock?'active':''}" onclick="setPlatform('java')">Java</div>
        <div class="platform-btn ${isBedrock?'active':''}" onclick="setPlatform('bedrock')">Bedrock (Mobile/Console)</div>
      </div>
      <div class="field-label">Username ${isBedrock ? '(wajib diawali garis bawah _)' : '(Java)'}</div>
      <div class="nick-input-row">
        <input type="text" class="nick-input" id="nickInput" placeholder="${isBedrock ? 'cth: _bilpayy' : 'cth: BilPlays'}" maxlength="17" value="${flow.nickname}">
        <button class="nick-check-btn" id="nickCheckBtn" onclick="checkNickname()">Cek Nickname</button>
      </div>
      <div class="field-hint" id="nickHint">${isBedrock ? 'Ketik gamertag Xbox kamu diawali dengan _ (contoh: _bilpayy). Wajib dicek dulu sebelum lanjut.' : '3–16 karakter, huruf/angka/underscore. Wajib dicek dulu sebelum lanjut.'}</div>
      <div id="playerCardSlot"></div>
      <div class="modal-actions">
        <button class="pixel-btn pixel-border" id="nickNextBtn" onclick="goStep(2)" disabled style="opacity:.5;">Lanjutkan →</button>
      </div>
    </div>
  `;
  document.getElementById('nickInput').addEventListener('keydown', e=>{
    if(e.key === 'Enter'){ e.preventDefault(); checkNickname(); }
  });
  if(flow.player){
    renderPlayerCard(flow.player);
    setNextEnabled(true);
  }
}

function setPlatform(p){
  flow.platform = p;
  flow.player = null;
  if(p === 'bedrock' && flow.nickname && !flow.nickname.startsWith('_')){
    flow.nickname = '_' + flow.nickname;
  }
  renderNicknameStep();
}

function setNextEnabled(on){
  const btn = document.getElementById('nickNextBtn');
  if(!btn) return;
  btn.disabled = !on;
  btn.style.opacity = on ? '1' : '.5';
}

function renderPlayerCard(player){
  const slot = document.getElementById('playerCardSlot');
  slot.innerHTML = `
    <div class="player-card">
      <img src="${player.avatar}" alt="avatar ${player.name}" onerror="this.style.display='none'">
      <div>
        <div class="pc-name">${player.name}</div>
        <div class="pc-verified">Nickname terverifikasi</div>
      </div>
    </div>
  `;
}

async function checkNickname(){
  const input = document.getElementById('nickInput');
  const hint = document.getElementById('nickHint');
  const btn = document.getElementById('nickCheckBtn');
  const name = input.value.trim();
  flow.nickname = name;
  flow.player = null;
  setNextEnabled(false);
  document.getElementById('playerCardSlot').innerHTML = '';
  input.classList.remove('error');

  if(flow.platform === 'bedrock'){
    const validFormat = /^_[A-Za-z0-9_]{2,15}$/.test(name);
    if(!validFormat){
      input.classList.add('error');
      hint.textContent = 'Nickname Bedrock wajib diawali garis bawah ( _ ), contoh: _bilpayy.';
      hint.classList.add('error');
      return;
    }
    hint.classList.remove('error');
    hint.textContent = 'Mengecek gamertag Xbox...';
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Cek...';
    const gamertag = name.slice(1); // strip leading underscore for Xbox lookup
    try{
      const res = await fetch('https://api.geysermc.org/v2/xbox/xuid/' + encodeURIComponent(gamertag));
      if(res.ok){
        const data = await res.json();
        if(data && data.xuid){
          flow.player = { name, uuid: data.xuid, avatar: 'https://mc-heads.net/avatar/Steve/100' };
          hint.textContent = 'Gamertag Xbox ditemukan dan valid.';
          renderPlayerCard(flow.player);
          setNextEnabled(true);
        } else {
          throw new Error('not found');
        }
      } else {
        throw new Error('not found');
      }
    }catch(err){
      input.classList.add('error');
      hint.classList.add('error');
      hint.innerHTML = 'Gamertag tidak ditemukan. Periksa ejaannya, atau <a href="#" onclick="skipVerify(event)" style="color:var(--blue-deep); text-decoration:underline;">lanjutkan tanpa verifikasi</a>.';
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Cek Nickname';
    }
    return;
  }

  // ---- Java ----
  const validFormat = /^[A-Za-z0-9_]{3,16}$/.test(name);
  if(!validFormat){
    input.classList.add('error');
    hint.textContent = 'Format nickname tidak valid. Gunakan 3–16 karakter huruf/angka/underscore.';
    hint.classList.add('error');
    return;
  }
  hint.classList.remove('error');
  hint.textContent = 'Mengecek nickname ke database Minecraft...';
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Cek...';

  try{
    const res = await fetch('https://playerdb.co/api/player/minecraft/' + encodeURIComponent(name));
    const data = await res.json();
    if(data && data.code === 'player.found'){
      const p = data.data.player;
      flow.player = { name: p.username, uuid: p.id, avatar: p.avatar || ('https://crafatar.com/avatars/' + p.id + '?overlay') };
      hint.textContent = 'Nickname ditemukan dan valid.';
      renderPlayerCard(flow.player);
      setNextEnabled(true);
    } else {
      input.classList.add('error');
      hint.classList.add('error');
      hint.textContent = 'Nickname tidak ditemukan di akun Minecraft manapun. Periksa kembali ejaannya.';
    }
  } catch(err){
    hint.classList.add('error');
    hint.innerHTML = 'Tidak bisa menghubungi server pengecekan saat ini. <a href="#" onclick="skipVerify(event)" style="color:var(--blue-deep); text-decoration:underline;">Lanjutkan tanpa verifikasi</a>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Cek Nickname';
  }
}

function skipVerify(e){
  e.preventDefault();
  flow.player = { name: flow.nickname, uuid:null, avatar:'https://mc-heads.net/avatar/' + encodeURIComponent(flow.nickname.replace(/^_/,'')) + '/100' };
  renderPlayerCard(flow.player);
  setNextEnabled(true);
}

// ---- STEP 2: CATEGORY (QRIS atau E-Wallet) ----
function renderCategoryStep(){
  modalBox.innerHTML = `
    <div class="modal-head">
      <div style="flex:1">
        <h3>Pilih Metode Bayar</h3>
        <p>Pembayaran manual, diverifikasi staff via kode unik.</p>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${stepIndicatorHTML()}
      ${itemRecapHTML()}
      <div class="field-label">Kategori Pembayaran</div>
      <div class="category-grid" id="categoryGrid">
        ${paymentCategories.map(c=>`
          <div class="category-card ${flow.category===c.id?'active':''}" data-id="${c.id}">
            <div class="cc-icon">${c.icon}</div>
            <h4>${c.label}</h4>
            <p>${c.desc}</p>
          </div>
        `).join('')}
      </div>
      <div class="modal-actions">
        <button class="pixel-btn pixel-border btn-back" onclick="goStep(1)">← Kembali</button>
        <button class="pixel-btn yellow pixel-border" id="catNextBtn" onclick="goStep(3)" ${flow.category?'':'disabled style="opacity:.5;"'}>Lanjutkan →</button>
      </div>
    </div>
  `;
  modalBox.querySelectorAll('.category-card').forEach(el=>{
    el.onclick = ()=>{
      flow.category = el.dataset.id;
      modalBox.querySelectorAll('.category-card').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      const nb = document.getElementById('catNextBtn');
      nb.disabled = false;
      nb.removeAttribute('style');
    };
  });
}

// ---- STEP 3: PAYMENT DETAIL (QRIS statis / daftar e-wallet) ----
function renderPaymentDetailStep(){
  if(flow.category === 'qris') renderQrisPayment();
  else renderWalletList();
}

function renderQrisPayment(){
  qrSecondsLeft = 600;
  const orderRef = 'NXR-' + Math.floor(100000 + Math.random()*900000);
  flow.orderRef = orderRef;
  const total = totalWithCode();
  modalBox.innerHTML = `
    <div class="modal-head">
      <div style="flex:1">
        <h3>Scan QRIS — ${CONFIG.qrisMerchant}</h3>
        <p>Scan pakai aplikasi bank atau e-wallet apa pun (QRIS satu untuk semua).</p>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${stepIndicatorHTML()}
      ${itemRecapHTML()}
      <div class="qr-box">
        <div class="qr-frame"><img src="${CONFIG.qrisImage}" alt="Kode QRIS ${CONFIG.qrisMerchant}"></div>
        <div class="qr-amount">${fmt(flow.order.price)} <span class="unique">+ ${flow.uniqueCode}</span></div>
        <div class="qr-amount-note">Total yang wajib dibayar: <strong style="color:#fff;">${fmt(total)}</strong></div>
        <div class="qr-timer" id="qrTimer">10:00</div>
      </div>
      <div class="qr-warning">⚠️ QRIS ini statis, jadi nominal <strong>tidak</strong> otomatis terisi. Setelah scan, ketik manual <strong>${fmt(total)}</strong> (persis sampai 3 digit terakhir) di aplikasi pembayaranmu — angka ${flow.uniqueCode} di belakang adalah kode unik agar staff bisa mencocokkan pesananmu.</div>
      <div class="qr-note">Untuk akun <strong>${flow.player.name}</strong> · Ref: ${orderRef}. QR akan kedaluwarsa dalam 10 menit.</div>
      <button class="pixel-btn yellow pixel-border" id="qrPaidBtn" onclick="confirmPayment('QRIS')">Saya Sudah Membayar</button>
      <div class="modal-actions" style="margin-top:10px;">
        <button class="pixel-btn pixel-border btn-back" onclick="goStep(2)">← Ganti Metode</button>
      </div>
    </div>
  `;
  startQrTimer();
}

function startQrTimer(){
  clearQrTimer();
  updateQrTimerDisplay();
  qrTimerId = setInterval(()=>{
    qrSecondsLeft--;
    if(qrSecondsLeft <= 0){
      clearQrTimer();
      const timerEl = document.getElementById('qrTimer');
      if(timerEl){
        timerEl.textContent = 'Kedaluwarsa';
        timerEl.classList.add('warn');
      }
      const btn = document.getElementById('qrPaidBtn');
      if(btn){ btn.disabled = true; btn.style.opacity = '.5'; }
    } else {
      updateQrTimerDisplay();
    }
  }, 1000);
}

function updateQrTimerDisplay(){
  const timerEl = document.getElementById('qrTimer');
  if(!timerEl) return;
  const m = Math.floor(qrSecondsLeft / 60).toString().padStart(2,'0');
  const s = (qrSecondsLeft % 60).toString().padStart(2,'0');
  timerEl.textContent = `${m}:${s}`;
  timerEl.classList.toggle('warn', qrSecondsLeft <= 60);
}

function clearQrTimer(){
  if(qrTimerId){ clearInterval(qrTimerId); qrTimerId = null; }
}

function renderWalletList(){
  modalBox.innerHTML = `
    <div class="modal-head">
      <div style="flex:1">
        <h3>Pilih E-Wallet</h3>
        <p>Transfer manual ke nomor tujuan, lalu konfirmasi.</p>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${stepIndicatorHTML()}
      ${itemRecapHTML()}
      <div class="field-label">E-Wallet Tersedia</div>
      <div class="wallet-list" id="walletList">
        ${wallets.map(w=>`
          <div class="wallet-item" data-id="${w.id}">
            <div class="pm-icon ${w.cls}">${w.tag}</div>
            <span class="wi-name">${w.label}</span>
            <span class="wi-arrow">→</span>
          </div>
        `).join('')}
      </div>
      <div class="modal-actions">
        <button class="pixel-btn pixel-border btn-back" onclick="goStep(2)">← Ganti Metode</button>
      </div>
    </div>
  `;
  modalBox.querySelectorAll('.wallet-item').forEach(el=>{
    el.onclick = ()=>{
      flow.wallet = el.dataset.id;
      renderWalletTransfer();
    };
  });
}

function renderWalletTransfer(){
  const w = wallets.find(x=>x.id===flow.wallet);
  const total = totalWithCode();
  const orderRef = 'NXR-' + Math.floor(100000 + Math.random()*900000);
  flow.orderRef = orderRef;
  modalBox.innerHTML = `
    <div class="modal-head">
      <div class="pm-icon ${w.cls}" style="width:44px;height:44px;font-size:10px;">${w.tag}</div>
      <div style="flex:1">
        <h3>Transfer via ${w.label}</h3>
        <p>Kirim ke nomor di bawah, jumlah harus persis.</p>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${stepIndicatorHTML()}
      ${itemRecapHTML()}
      <div class="transfer-box">
        <div class="field-label" style="margin-bottom:2px;">Kirim ke nomor ${w.label}</div>
        <div class="transfer-number" id="transferNum">${CONFIG.walletNumber}</div>
        <div class="transfer-owner">a.n. ${CONFIG.walletOwner}</div>
        <button class="copy-num-btn" onclick="copyWalletNumber()">Copy Nomor</button>
        <div class="transfer-amount-row">
          <span>Jumlah:</span>
          <span class="amt">${fmt(flow.order.price)} <span class="unique">+${flow.uniqueCode}</span></span>
        </div>
      </div>
      <div class="qr-warning">⚠️ Transfer PERSIS <strong>${fmt(total)}</strong> (termasuk ${flow.uniqueCode} rupiah kode unik di belakang) supaya staff bisa mencocokkan otomatis dengan pesanan <strong>${flow.player.name}</strong>. Ref: ${orderRef}.</div>
      <button class="pixel-btn yellow pixel-border" onclick="confirmPayment('${w.label}')">Saya Sudah Transfer</button>
      <div class="modal-actions" style="margin-top:10px;">
        <button class="pixel-btn pixel-border btn-back" onclick="renderWalletList()">← Ganti E-Wallet</button>
      </div>
    </div>
  `;
}

function copyWalletNumber(){
  if(navigator.clipboard){ navigator.clipboard.writeText(CONFIG.walletNumber.replace(/-/g,'')).catch(()=>{}); }
  showToast('Nomor disalin: ' + CONFIG.walletNumber);
}

function goStep(n){
  flow.step = n;
  renderStep();
}

let confirmInFlight = false;

async function confirmPayment(methodLabel){
  if(confirmInFlight) return; // cegah klik ganda -> notifikasi dobel
  confirmInFlight = true;
  clearQrTimer();
  const orderId = flow.orderRef || ('NXR-' + Math.floor(100000 + Math.random()*900000));
  const total = totalWithCode();

  const order = {
    id: orderId,
    itemName: flow.order.title,
    price: flow.order.price,
    uniqueCode: flow.uniqueCode,
    totalWithCode: total,
    method: methodLabel,
    platform: flow.platform,
    nickname: flow.player.name,
    time: new Date().toISOString(),
  };
  orderHistory.push(order);
  flow.lastOrder = order;

  renderProcessing(order);
  const sent = await submitOrder(order);
  confirmInFlight = false;
  renderSuccess(order, methodLabel, total, sent);
}

function renderProcessing(order){
  modalBox.innerHTML = `
    <div class="processing-view">
      <div class="spinner-lg"></div>
      <h3>Mengirim notifikasi ke staff...</h3>
      <p>Menyiapkan pesanan ${order.id}</p>
    </div>
  `;
}

function renderSuccess(order, methodLabel, total, sent){
  modalBox.innerHTML = `
    <div class="modal-success">
      <div class="success-mark">${sent ? '✓' : '⏳'}</div>
      <h3>Pesanan Diterima</h3>
      <p>${flow.order.title} sebesar <strong>${fmt(total)}</strong> via ${methodLabel} untuk akun <strong>${flow.player.name}</strong> sudah tercatat. ${sent ? 'Notifikasi otomatis sudah masuk ke Discord staff dan akan diverifikasi lalu dikirim.' : 'Notifikasi otomatis gagal terkirim (koneksi bermasalah) — staff belum tahu pesanan ini. Coba kirim ulang di bawah, atau hubungi Discord resmi dengan ID Pesanan ini.'} Cek /inventory di server setelah item terkirim (biasanya 5–15 menit).</p>
      <div class="order-id">ID Pesanan: ${order.id}</div>
      ${!sent ? `<button class="pixel-btn yellow pixel-border" onclick="retryNotify('${order.id}')" style="margin-top:16px;">Kirim Ulang Notifikasi</button>` : ''}
      <br>
      <button class="pixel-btn pixel-border" onclick="closeModal()" style="margin-top:12px;">Tutup</button>
    </div>
  `;
  modalBox.classList.remove('step-anim');
  void modalBox.offsetWidth;
  modalBox.classList.add('step-anim');
  showToast(sent ? ('Pesanan ' + order.id + ' terkirim ke staff.') : ('Pesanan ' + order.id + ' tercatat, notifikasi belum terkirim.'));
}

async function retryNotify(orderId){
  const order = orderHistory.find(o=>o.id===orderId);
  if(!order) return;
  renderProcessing(order);
  const sent = await submitOrder(order);
  renderSuccess(order, order.method, order.totalWithCode, sent);
}

function openModal(){
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  clearQrTimer();
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  flow = null;
}
overlay.addEventListener('click', (e)=>{
  if(e.target === overlay) closeModal();
});
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeModal();
});

// ---------- INIT ----------
renderConfigWarning();
showTab('vote', document.querySelector('.tab-btn.active'));
loadLeaderboard();
renderFaq();
observeReveals();
fetchServerStatus();
setInterval(fetchServerStatus, 60000);   // refresh status server tiap 60 detik
setInterval(loadLeaderboard, 5 * 60000); // refresh leaderboard tiap 5 menit