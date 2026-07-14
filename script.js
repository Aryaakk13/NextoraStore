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

// ---------- LIVE SERVER STATUS ----------
const SERVER_IP = 'play.nextorasmp.net';

async function fetchServerStatus(){
  const badge = document.getElementById('statusBadge');
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const statOnline = document.getElementById('statOnline');

  try{
    const res = await fetch('https://api.mcsrvstat.us/3/' + SERVER_IP);
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
  const ip = "play.nextorasmp.net";
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
const rankData = {
  vip:     {name:'IRON — VIP',        ore:'ore-iron',      price:25000},
  mvp:     {name:'GOLD — MVP',        ore:'ore-gold',      price:50000},
  elite:   {name:'DIAMOND — ELITE',   ore:'ore-diamond',   price:100000},
  legend:  {name:'NETHERITE — LEGEND',ore:'ore-netherite', price:200000},
};

// ---------- GEMS DATA ----------
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

// ---------- LEADERBOARD DATA ----------
const leaderboards = {
  vote: {unit:'votes', data:[
    {n:'ZephyrDrake', v:342},{n:'MikaBlaze', v:301},{n:'RyuuNova', v:287},
    {n:'AstraHex', v:255},{n:'KaelWynter', v:238},{n:'LunarSaphire', v:214},
    {n:'ObsidianFox', v:198},{n:'TidalRex', v:176},
  ]},
  donate: {unit:'Rp', data:[
    {n:'GoldenHarrow', v:1250000},{n:'VelvetStorm', v:980000},{n:'NoctisKage', v:875000},
    {n:'EmberQuinn', v:640000},{n:'SableWraith', v:520000},{n:'FrostByte_ID', v:410000},
    {n:'CrimsonYuki', v:365000},{n:'ArcaneVexen', v:290000},
  ]},
  balance: {unit:'gems', data:[
    {n:'IronCladBoy', v:48200},{n:'PixelMerchant', v:41750},{n:'ShardHunter', v:38900},
    {n:'GleamRunner', v:33400},{n:'DustyForge', v:29850},{n:'CopperVein', v:26100},
    {n:'MossyOak_ID', v:21700},{n:'QuartzKid', v:18450},
  ]},
  playtime: {unit:'jam', data:[
    {n:'MarrowKnight', v:612},{n:'WillowStrider', v:548},{n:'HexBastion', v:501},
    {n:'ThornVale', v:467},{n:'GraniteSoul', v:433},{n:'EchoRavine', v:398},
    {n:'BrackenFall', v:355},{n:'SolsticeMoor', v:312},
  ]},
};

function showTab(tab, btn){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const body = document.getElementById('lbBody');
  body.innerHTML = '';
  const { unit, data } = leaderboards[tab];
  data.forEach((row, i)=>{
    const el = document.createElement('div');
    el.className = 'lb-row';
    const val = unit==='Rp' ? fmt(row.v) : row.v.toLocaleString('id-ID') + ' ' + unit;
    el.innerHTML = `
      <span class="lb-rank">#${i+1}</span>
      <span class="lb-player"><span class="lb-avatar"></span>${row.n}</span>
      <span class="lb-value">${val}</span>
    `;
    body.appendChild(el);
  });
}

// ---------- POPOUT MODAL : MULTI-STEP PURCHASE FLOW ----------
const overlay = document.getElementById('modalOverlay');
const modalBox = document.getElementById('modalBox');

const paymentCategories = [
  {id:'qris',    label:'QRIS',    icon:'QR', desc:'Scan sekali, berlaku untuk semua bank & e-wallet'},
  {id:'ewallet', label:'E-Wallet', icon:'EW', desc:'GoPay, OVO, DANA, atau ShopeePay'},
];

const wallets = [
  {id:'gopay',     label:'GoPay',      cls:'pm-gopay',     tag:'GP'},
  {id:'ovo',       label:'OVO',        cls:'pm-ovo',       tag:'OVO'},
  {id:'dana',      label:'DANA',       cls:'pm-dana',      tag:'DN'},
  {id:'shopeepay', label:'ShopeePay',  cls:'pm-shopeepay', tag:'SP'},
];

let flow = null; // { order, step, nickname, player, category, wallet }
let qrTimerId = null;
let qrSecondsLeft = 600;

function startFlow(order){
  flow = { order, step:1, nickname:'', player:null, category:null, wallet:null };
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

// ---- STEP 1: NICKNAME ----
function renderNicknameStep(){
  modalBox.innerHTML = `
    <div class="modal-head">
      <div style="flex:1">
        <h3>Masukkan Nickname</h3>
        <p>Isi username Minecraft (Java) tujuan pengiriman item.</p>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${stepIndicatorHTML()}
      ${itemRecapHTML()}
      <div class="field-label">Username Minecraft</div>
      <div class="nick-input-row">
        <input type="text" class="nick-input" id="nickInput" placeholder="cth: Steve_Builder" maxlength="16" value="${flow.nickname}">
        <button class="nick-check-btn" id="nickCheckBtn" onclick="checkNickname()">Cek Nickname</button>
      </div>
      <div class="field-hint" id="nickHint">3–16 karakter, huruf/angka/underscore. Wajib dicek dulu sebelum lanjut.</div>
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
  flow.player = { name: flow.nickname, uuid:null, avatar:'https://mc-heads.net/avatar/' + encodeURIComponent(flow.nickname) + '/100' };
  renderPlayerCard(flow.player);
  setNextEnabled(true);
}

// ---- STEP 2: CATEGORY (QRIS atau E-Wallet) ----
function renderCategoryStep(){
  modalBox.innerHTML = `
    <div class="modal-head">
      <div style="flex:1">
        <h3>Pilih Metode Bayar</h3>
        <p>Pembayaran instan, dua opsi tersedia.</p>
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

// ---- STEP 3: PAYMENT DETAIL (QRIS code / daftar e-wallet) ----
function renderPaymentDetailStep(){
  if(flow.category === 'qris') renderQrisPayment();
  else renderWalletList();
}

function renderQrisPayment(){
  qrSecondsLeft = 600;
  const orderRef = 'NXR-' + Math.floor(100000 + Math.random()*900000);
  const qrData = encodeURIComponent(`NEXTORASMP|${orderRef}|${flow.order.price}|${flow.player.name}`);
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${qrData}`;
  modalBox.innerHTML = `
    <div class="modal-head">
      <div style="flex:1">
        <h3>Scan QRIS</h3>
        <p>Bayar pakai aplikasi bank atau e-wallet apa pun.</p>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${stepIndicatorHTML()}
      ${itemRecapHTML()}
      <div class="qr-box">
        <div class="qr-frame"><img src="${qrImgUrl}" alt="Kode QRIS pembayaran"></div>
        <div class="qr-amount">${fmt(flow.order.price)}</div>
        <div class="qr-timer" id="qrTimer">10:00</div>
      </div>
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
        <p>Kamu akan diarahkan untuk konfirmasi di aplikasi.</p>
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
      openWalletProcessing();
    };
  });
}

function openWalletProcessing(){
  const w = wallets.find(x=>x.id===flow.wallet);
  modalBox.innerHTML = `
    <div class="processing-view">
      <div class="spinner-lg"></div>
      <h3>Membuka ${w.label}...</h3>
      <p>Konfirmasi pembayaran ${fmt(flow.order.price)} di aplikasi ${w.label}.</p>
    </div>
  `;
  setTimeout(()=>confirmPayment(w.label), 1700);
}

function goStep(n){
  flow.step = n;
  renderStep();
}

function confirmPayment(methodLabel){
  clearQrTimer();
  const orderId = 'NXR-' + Math.floor(100000 + Math.random()*900000);
  modalBox.innerHTML = `
    <div class="modal-success">
      <div class="success-mark">✓</div>
      <h3>Pembayaran Dikonfirmasi</h3>
      <p>${flow.order.title} sebesar ${fmt(flow.order.price)} via ${methodLabel} sedang diproses untuk akun <strong>${flow.player.name}</strong>. Cek /inventory di server setelah pembayaran selesai.</p>
      <div class="order-id">ID Pesanan: ${orderId}</div>
      <br>
      <button class="pixel-btn pixel-border" onclick="closeModal()" style="margin-top:20px;">Tutup</button>
    </div>
  `;
  modalBox.classList.remove('step-anim');
  void modalBox.offsetWidth;
  modalBox.classList.add('step-anim');
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
showTab('vote', document.querySelector('.tab-btn.active'));
observeReveals();
fetchServerStatus();
setInterval(fetchServerStatus, 60000); // refresh tiap 60 detik