// NEXTORA SMP - SCRIPT
const SERVER_IP = 'play.nextorasmp.my.id';

function copyIP() {
  navigator.clipboard.writeText(SERVER_IP).catch(()=>{});
  showToast('IP disalin!');
}

function showToast(msg) {
  let stack = document.getElementById('toastStack');
  if(!stack) return;
  const el = document.createElement('div');
  el.className = 'toast-item';
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(()=>{
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px) scale(0.9)';
    setTimeout(()=>el.remove(), 300);
  }, 2500);
}

async function fetchStatus() {
  const el = document.getElementById('statOnline');
  try {
    const res = await fetch('https://api.mcsrvstat.us/3/' + SERVER_IP);
    const data = await res.json();
    const p = (data?.online) ? (data.players?.online || 0) : 0;
    if(el) el.textContent = p + ' Online';
  } catch(e) {
    if(el) el.textContent = '-- Online';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchStatus();
  setInterval(fetchStatus, 30000);
});
