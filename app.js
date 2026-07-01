
const LAB_PHONE   = '+917304949191';
const LAB_WA_NUM  = '917304949191';
const LAB_NAME    = 'Shreenathji Path Labs';

 

const store = {
  getUsers()      { return JSON.parse(localStorage.getItem('snpl_users')  || '[]'); },
  setUsers(u)     { localStorage.setItem('snpl_users', JSON.stringify(u)); },
  getAppts()      { return JSON.parse(localStorage.getItem('snpl_appts')  || '[]'); },
  setAppts(a)     { localStorage.setItem('snpl_appts', JSON.stringify(a)); },
  getSession()    { return JSON.parse(localStorage.getItem('snpl_session') || 'null'); },
  setSession(s)   { localStorage.setItem('snpl_session', JSON.stringify(s)); },
  clearSession()  { localStorage.removeItem('snpl_session'); }
};



function showToast(msg, type='info') {
  const t = document.getElementById('toast');
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  t.textContent = `${icons[type] || ''} ${msg}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}





function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function switchModal(from, to) { closeModal(from); openModal(to); }

document.getElementById('loginBtn').onclick  = () => openModal('loginModal');
document.getElementById('signupBtn').onclick = () => openModal('signupModal');



document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('active'); });
});



function signupUser() {
  const name  = document.getElementById('suName').value.trim();
  const phone = document.getElementById('suPhone').value.trim();
  const email = document.getElementById('suEmail').value.trim();
  const pass  = document.getElementById('suPass').value;
  const age   = document.getElementById('suAge').value;

  if (!name)  return showToast('Please enter your full name', 'error');
  if (!phone) return showToast('Mobile number is required', 'error');
  if (pass.length < 6) return showToast('Password must be at least 6 characters', 'error');

  const users = store.getUsers();
  if (users.find(u => u.phone === phone)) {
    return showToast('Account already exists with this number', 'error');
  }

  const user = { id: Date.now().toString(), name, phone, email, age, pass, createdAt: new Date().toLocaleString() };
  users.push(user);
  store.setUsers(users);
  store.setSession(user);
  closeModal('signupModal');
  updateNavForUser(user);
  showToast(`Welcome, ${name}! Account created ✨`, 'success');
}



function loginUser() {
  const id   = document.getElementById('loginId').value.trim();
  const pass = document.getElementById('loginPass').value;

  const users = store.getUsers();
  const user  = users.find(u => (u.phone === id || u.email === id) && u.pass === pass);

  if (!user) return showToast('Invalid credentials. Please try again.', 'error');

  store.setSession(user);
  closeModal('loginModal');
  updateNavForUser(user);
  showToast(`Welcome back, ${user.name}!`, 'success');
}



function logoutUser() {
  store.clearSession();
  document.getElementById('userMenu').style.display = 'none';
  document.getElementById('loginBtn').style.display = '';
  document.getElementById('signupBtn').style.display = '';
  document.getElementById('dashboard').style.display = 'none';
  showToast('Logged out successfully', 'info');
}



function updateNavForUser(user) {
  document.getElementById('loginBtn').style.display  = 'none';
  document.getElementById('signupBtn').style.display = 'none';
  document.getElementById('userMenu').style.display  = 'flex';
  document.getElementById('userAvatar').textContent  = user.name[0].toUpperCase();
}



function openDashboard() {
  const user = store.getSession();
  if (!user) return openModal('loginModal');

  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });

  

  const pContainer = document.getElementById('profileContainer');
  pContainer.innerHTML = `
    <div class="profile-field">
    <label>Name</label><span>${user.name}</span>
    </div>

    <div class="profile-field">
    <label>Mobile</label>
    <span>${user.phone}</span>
    </div>

    <div class="profile-field">
    <label>Email</label>
    <span>${user.email || '—'}</span>
    </div>

    <div class="profile-field">
    <label>Age</label>
    <span>${user.age || '—'}</span>
    </div>

    <div class="profile-field">
    <label>Member Since</label>
    <span>${user.createdAt}</span>
    </div>
  `;

  

  const appts = store.getAppts().filter(a => a.userId === user.id);
  const bContainer = document.getElementById('bookingsContainer');
  
  if (appts.length === 0) {
    bContainer.innerHTML = '<p class="empty-msg">No appointments yet. <a href="#appointment" style="color:var(--accent)">Book one now!</a></p>';
    return;
  }


  bContainer.innerHTML = appts.map(a => `
    <div class="booking-item">
      <h4>${a.test}</h4>
      <p>${a.name} &nbsp;·&nbsp; ${a.age ? a.age + ' yrs' : ''}
       &nbsp;·&nbsp; ${a.gender || ''}</p>

      <div class="bk-meta">
        <span class="bk-tag"><i class="fas fa-calendar"></i> ${a.date}</span>
        <span class="bk-tag"><i class="fas fa-clock"></i> ${a.time}</span>
        <span class="bk-tag"><i class="fas fa-home"></i> ${a.sampleCollection}</span>
      </div>

      <div class="bk-actions">
        <button class="bk-btn pdf" onclick='downloadPDF(${JSON.stringify(a)})'>
          <i class="fas fa-file-pdf"></i> Download PDF
        </button>

        <button class="bk-btn wa" onclick='shareViaWhatsApp(${JSON.stringify(a)})'>
          <i class="fab fa-whatsapp"></i> Share
        </button>

      </div>
    </div>
  `).join('');
}




document.getElementById('aptForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const user = store.getSession();

  const appt = {
    id:         Date.now().toString(),
    userId:     user ? user.id : 'guest',
    name:       document.getElementById('aptName').value.trim(),
    age:        document.getElementById('aptAge').value,
    phone:      document.getElementById('aptPhone').value.trim(),
    gender:     document.getElementById('aptGender').value,
    email:      document.getElementById('aptEmail').value.trim(),
    test:       document.getElementById('aptTest').value,
    date:       document.getElementById('aptDate').value,
    time:       document.getElementById('aptTime').value,
    collection: document.getElementById('aptCollection').value,
    address:    document.getElementById('aptAddress').value.trim(),
    bookedAt:   new Date().toLocaleString(),
    status:     'Confirmed'
  };

  if (!appt.name || !appt.phone || !appt.test || !appt.date) {
    return showToast('Please fill all required fields', 'error');
  }

  const appts = store.getAppts();
  appts.push(appt);
  store.setAppts(appts);

  showToast('🎉 Appointment booked! We will contact you shortly.', 'success');
  this.reset();

  

  const msg = `Hello ${LAB_NAME}! I'd like to confirm my appointment:\n\n` +
    `👤 Name: ${appt.name}\n📞 Phone: ${appt.phone}\n` +
    `🧪 Test: ${appt.test}\n📅 Date: ${appt.date}\n⏰ Time: ${appt.time}\n` +
    `🏠 Collection: ${appt.collection}${appt.address ? '\n📍 Address: ' + appt.address : ''}`;

  setTimeout(() => {
    if (confirm('Would you like to confirm your appointment via WhatsApp?')) {
      window.open(`https://wa.me/${LAB_WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  }, 400);
});




function downloadPDF(appt) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();


  

  doc.setFillColor(26, 111, 196);
  doc.rect(0, 0, 210, 40, 'F');

  

  doc.setFillColor(0, 198, 167);
  doc.roundedRect(10, 8, 24, 24, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('LAB', 22, 22, { align: 'center' });

  

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Shreenathji Path Labs', 42, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('NABL Accredited · ISO 9001:2015 · Trusted Since 1999', 42, 26);
  doc.text('12, Medical Complex, Nathdwara Road, Rajsamand, Rajasthan – 313301', 42, 32);


  

  doc.setFillColor(240, 248, 255);
  doc.roundedRect(10, 48, 190, 8, 2, 2, 'F');
  doc.setTextColor(26, 111, 196);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('APPOINTMENT CONFIRMATION', 105, 54, { align: 'center' });

  

  doc.setFillColor(26, 111, 196);
  doc.roundedRect(10, 60, 190, 16, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`Booking ID: #SNPL-${appt.id.slice(-6).toUpperCase()}`, 20, 71);
  doc.text(`Status: ${appt.status || 'Confirmed'} ✓`, 160, 71, { align: 'right' });

  

  const details = [
    ['Patient Name',   appt.name],
    ['Age / Gender',   `${appt.age || '—'} yrs / ${appt.gender || '—'}`],
    ['Mobile Number',  appt.phone],
    ['Email',          appt.email || '—'],
    ['Test / Package', appt.test],
    ['Date',           appt.date],
    ['Time Slot',      appt.time],
    ['sampleCollection',     appt.sampleCollection],
    ['Address',        appt.address || '—'],
    ['Booked On',      appt.bookedAt]
  ];


  let y = 88;
  doc.setFont('helvetica', 'normal');
  details.forEach(([label, val], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 252, 255);
      doc.rect(10, y - 5, 190, 10, 'F');
    }
    doc.setTextColor(100, 120, 140);
    doc.setFontSize(9);
    doc.text(label + ':', 18, y);
    doc.setTextColor(20, 40, 70);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(String(val), 80, y);
    doc.setFont('helvetica', 'normal');
    y += 12;
  });


  

  y += 8;
  doc.setFillColor(255, 248, 230);
  doc.roundedRect(10, y, 190, 42, 3, 3, 'F');
  doc.setDrawColor(255, 180, 0);
  doc.roundedRect(10, y, 190, 42, 3, 3, 'S');
  doc.setTextColor(160, 100, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠ Important Instructions', 20, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 60, 20);
  const instrs = [
    '• Please arrive 10 minutes before your appointment time.',
    '• Carry a valid ID proof (Aadhar / Voter ID / Passport).',
    '• For fasting tests, avoid food for 8–12 hours prior to collection.',
    '• Bring any previous reports or prescriptions if available.'
  ];
  instrs.forEach((line, i) => {
    doc.text(line, 20, y + 20 + i * 7);
  });


  

  doc.setFillColor(26, 111, 196);
  doc.rect(0, 272, 210, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('📞 +91 98765 43210   |   💬 WhatsApp: +91 98765 43210', 105, 282, { align: 'center' });
  doc.text('📧 info@shreenathjipathlabs.com   |   🌐 www.shreenathjipathlabs.com', 105, 289, { align: 'center' });

  doc.save(`SNPL_Appointment_${appt.id.slice(-6)}.pdf`);
  showToast('PDF downloaded successfully!', 'success');
}




function shareViaWhatsApp(appt) {
  const msg = `*${LAB_NAME} – Appointment Details*\n\n` +
    `🆔 Booking ID: #SNPL-${appt.id.slice(-6).toUpperCase()}\n` +
    `👤 Patient: ${appt.name}\n📞 Phone: ${appt.phone}\n` +
    `🧪 Test: ${appt.test}\n📅 Date: ${appt.date}\n⏰ Time: ${appt.time}\n` +
    `🏠 Collection: ${appt.collection}\n✅ Status: ${appt.status || 'Confirmed'}\n\n` +
    `For queries call: +91 98765 43210`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}


function openWhatsApp() {
  const phoneNumber = "917304949191";
  const msg = `Hello ${LAB_NAME}! I'd like to inquire about diagnostic tests and appointments.`;
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, '_blank');
}


function makeCall() {
  const phoneNumber = "+917304949191";
  window.location.href = `tel:${phoneNumber}`;
}




const navbar  = document.getElementById('navbar');
const backTop = document.getElementById('backTop');


window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
    backTop.classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    backTop.classList.remove('visible');
  }
});


/* ── HAMBURGER ────────────────────────────────────────── */

document.getElementById('hamburger').onclick = () => {
  document.getElementById('navLinks').classList.toggle('open');
};
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
});


/* ── COUNTER ANIMATION ────────────────────────────────── */

function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = +el.dataset.target;
    let count = 0;
    const step = target / 80;
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = Math.floor(count).toLocaleString();
      if (count >= target) clearInterval(timer);
    }, 20);
  });
}
let countersStarted = false;


/* ── SCROLL REVEAL ────────────────────────────────────── */

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay || 0;
      setTimeout(() => e.target.classList.add('visible'), +delay);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ── HERO OBSERVER (counters) ─────────────────────────── */

const heroObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    animateCounters();
  }
}, { threshold: 0.3 });
heroObserver.observe(document.querySelector('.hero-stats'));

/* ── DNA HELIX BUILD ──────────────────────────────────── */

function buildDNA() {
  const container = document.getElementById('dnaRungs');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const rung = document.createElement('div');
    rung.className = 'dna-rung';
    rung.style.cssText = `
      top: ${i * 22}px;
      width: ${40 + Math.sin(i * 0.7) * 30}px;
      transform: translateX(calc(-50% + ${Math.sin(i * 0.7) * 25}px));
      animation-delay: ${i * 0.1}s;
      opacity: ${0.3 + Math.abs(Math.sin(i * 0.7)) * 0.5};
    `;
    container.appendChild(rung);
  }
}
buildDNA();


/* ── FLOATING PARTICLES ───────────────────────────────── */

function createParticles() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const pEl  = document.getElementById('particles');
  pEl.style.position = 'fixed';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  pEl.appendChild(canvas);

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 2.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.35,
    dy: (Math.random() - 0.5) * 0.35,
    alpha: Math.random() * 0.4 + 0.1
  }));

  const colors = ['rgba(26,111,196,', 'rgba(0,198,167,', 'rgba(255,255,255,'];

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      const c = colors[Math.floor(Math.random() * colors.length) % 3];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = c + p.alpha + ')';
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(26,111,196,${0.07 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}
createParticles();




const dateInput = document.getElementById('aptDate');

if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}



window.addEventListener('DOMContentLoaded', () => {
  const sess = store.getSession();
  if (sess) updateNavForUser(sess);


  


  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
    });
  });
});