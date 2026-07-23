// NEXTORA SMP - SMOOTH SCRIPT
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
  const el2 = document.getElementById('statOnline2');
  try {
    const res = await fetch('https://api.mcsrvstat.us/3/' + SERVER_IP);
    const data = await res.json();
    const p = (data?.online) ? (data.players?.online || 0) : 0;
    if(el) el.textContent = p;
    if(el2) el2.textContent = p + ' Online';
  } catch(e) {
    if(el) el.textContent = '--';
    if(el2) el2.textContent = '--';
  }
}

// Scroll reveal animation
(function() {
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  let observed = new Set();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !observed.has(entry.target)) {
        observed.add(entry.target);
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe sections when DOM is ready
  document.querySelectorAll('.scroll-reveal').forEach(section => {
    observer.observe(section);
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  fetchStatus();
  setInterval(fetchStatus, 30000);
});
