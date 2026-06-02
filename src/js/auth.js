/**
 * CustomShape3D — Auth Module
 * Client-side kayıt / giriş sistemi
 * localStorage tabanlı kullanıcı veritabanı
 */

// ══════════════════════════════════════════════════════
// STORAGE HELPERS
// ══════════════════════════════════════════════════════
const STORAGE_KEY_USERS   = 'cs3d_users';
const STORAGE_KEY_SESSION = 'cs3d_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_SESSION)) || null; }
  catch { return null; }
}

function setCurrentUser(user) {
  if (user) localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY_SESSION);
}

function hashSimple(str) {
  // Basit obfuscation — production'da bcrypt kullanılmalı
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

// ══════════════════════════════════════════════════════
// MODAL HTML
// ══════════════════════════════════════════════════════
function createAuthModal() {
  const existing = document.getElementById('auth-modal');
  if (existing) return;

  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'auth-modal-overlay';
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Giriş / Kayıt');
  modal.innerHTML = `
    <div class="auth-modal-box" id="auth-modal-box">
      <!-- Close -->
      <button class="auth-close-btn" id="auth-close-btn" aria-label="Kapat">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <!-- Logo -->
      <div class="auth-logo">
        <div class="auth-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="auth-logo-text">Custom<span class="auth-logo-accent">Shape3D</span></span>
      </div>

      <!-- Tab switcher -->
      <div class="auth-tabs" role="tablist">
        <button class="auth-tab active" id="tab-login" data-tab="login" role="tab" aria-selected="true">Giriş Yap</button>
        <button class="auth-tab" id="tab-register" data-tab="register" role="tab" aria-selected="false">Kayıt Ol</button>
        <div class="auth-tab-indicator" id="auth-tab-indicator"></div>
      </div>

      <!-- LOGIN FORM -->
      <form class="auth-form auth-form-active" id="form-login" novalidate>
        <div class="auth-field-group">
          <div class="auth-field">
            <label class="auth-label" for="login-email">E-posta</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input class="auth-input" id="login-email" type="email" placeholder="ornek@email.com" autocomplete="email" />
            </div>
            <div class="auth-field-error" id="login-email-err"></div>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="login-password">Şifre</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input class="auth-input" id="login-password" type="password" placeholder="••••••••" autocomplete="current-password" />
              <button type="button" class="auth-pw-toggle" data-target="login-password" aria-label="Şifreyi göster/gizle">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <div class="auth-field-error" id="login-pw-err"></div>
          </div>
        </div>

        <div class="auth-forgot">
          <a href="#" class="auth-forgot-link">Şifremi Unuttum</a>
        </div>

        <button type="submit" class="auth-submit-btn" id="login-submit-btn">
          <span class="auth-submit-text">Giriş Yap</span>
          <div class="auth-submit-spinner" style="display:none;"></div>
        </button>

        <div class="auth-error-box" id="login-error" style="display:none;"></div>

        <p class="auth-switch-text">
          Hesabın yok mu?
          <button type="button" class="auth-switch-btn" data-goto="register">Kayıt Ol</button>
        </p>
      </form>

      <!-- REGISTER FORM -->
      <form class="auth-form" id="form-register" novalidate>
        <div class="auth-field-group">
          <div class="auth-field">
            <label class="auth-label" for="reg-name">Ad Soyad</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input class="auth-input" id="reg-name" type="text" placeholder="Ahmet Yılmaz" autocomplete="name" />
            </div>
            <div class="auth-field-error" id="reg-name-err"></div>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="reg-email">E-posta</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input class="auth-input" id="reg-email" type="email" placeholder="ornek@email.com" autocomplete="email" />
            </div>
            <div class="auth-field-error" id="reg-email-err"></div>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="reg-password">Şifre</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input class="auth-input" id="reg-password" type="password" placeholder="En az 6 karakter" autocomplete="new-password" />
              <button type="button" class="auth-pw-toggle" data-target="reg-password" aria-label="Şifreyi göster/gizle">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <!-- Password strength -->
            <div class="auth-pw-strength">
              <div class="auth-pw-bars">
                <div class="auth-pw-bar" id="pw-bar-1"></div>
                <div class="auth-pw-bar" id="pw-bar-2"></div>
                <div class="auth-pw-bar" id="pw-bar-3"></div>
                <div class="auth-pw-bar" id="pw-bar-4"></div>
              </div>
              <span class="auth-pw-label" id="pw-strength-label">Güç</span>
            </div>
            <div class="auth-field-error" id="reg-pw-err"></div>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="reg-password2">Şifre Tekrar</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input class="auth-input" id="reg-password2" type="password" placeholder="Şifreyi tekrarlayın" autocomplete="new-password" />
              <button type="button" class="auth-pw-toggle" data-target="reg-password2" aria-label="Şifreyi göster/gizle">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <div class="auth-field-error" id="reg-pw2-err"></div>
          </div>
        </div>

        <div class="auth-terms">
          <label class="auth-checkbox-label">
            <input type="checkbox" id="reg-terms" class="auth-checkbox" />
            <span class="auth-checkbox-custom"></span>
            <span><a href="#" class="auth-terms-link">Kullanım Koşulları</a>'nı ve <a href="#" class="auth-terms-link">Gizlilik Politikası</a>'nı kabul ediyorum</span>
          </label>
          <div class="auth-field-error" id="reg-terms-err"></div>
        </div>

        <button type="submit" class="auth-submit-btn" id="register-submit-btn">
          <span class="auth-submit-text">Hesap Oluştur</span>
          <div class="auth-submit-spinner" style="display:none;"></div>
        </button>

        <div class="auth-error-box" id="register-error" style="display:none;"></div>
        <div class="auth-success-box" id="register-success" style="display:none;"></div>

        <p class="auth-switch-text">
          Zaten hesabın var mı?
          <button type="button" class="auth-switch-btn" data-goto="login">Giriş Yap</button>
        </p>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

// ══════════════════════════════════════════════════════
// MODAL CONTROLS
// ══════════════════════════════════════════════════════
export function openAuthModal(tab = 'login') {
  createAuthModal();
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  requestAnimationFrame(() => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchTab(tab);
    // Focus first input
    setTimeout(() => {
      const first = modal.querySelector(`#form-${tab} .auth-input`);
      first?.focus();
    }, 350);
  });
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  // Clear errors
  modal.querySelectorAll('.auth-field-error').forEach(el => { el.textContent = ''; });
  modal.querySelectorAll('.auth-error-box, .auth-success-box').forEach(el => {
    el.style.display = 'none';
    el.textContent = '';
  });
  modal.querySelectorAll('.auth-input').forEach(el => {
    el.classList.remove('auth-input--error', 'auth-input--ok');
    el.value = '';
  });
  // Reset pw bars
  resetPwBars();
}

function switchTab(tab) {
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const indicator = document.getElementById('auth-tab-indicator');

  if (tab === 'login') {
    loginForm?.classList.add('auth-form-active');
    registerForm?.classList.remove('auth-form-active');
    tabLogin?.classList.add('active');
    tabRegister?.classList.remove('active');
    tabLogin?.setAttribute('aria-selected', 'true');
    tabRegister?.setAttribute('aria-selected', 'false');
    if (indicator) indicator.style.transform = 'translateX(0)';
  } else {
    registerForm?.classList.add('auth-form-active');
    loginForm?.classList.remove('auth-form-active');
    tabRegister?.classList.add('active');
    tabLogin?.classList.remove('active');
    tabRegister?.setAttribute('aria-selected', 'true');
    tabLogin?.setAttribute('aria-selected', 'false');
    if (indicator) indicator.style.transform = 'translateX(100%)';
  }
}

// ══════════════════════════════════════════════════════
// VALIDATION HELPERS
// ══════════════════════════════════════════════════════
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function setFieldError(inputId, errId, msg) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (input) input.classList.add('auth-input--error');
  if (err) err.textContent = msg;
  return false;
}

function clearFieldError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (input) { input.classList.remove('auth-input--error'); input.classList.add('auth-input--ok'); }
  if (err) err.textContent = '';
}

// Password strength
function getPwStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

function updatePwBars(pw) {
  const score = getPwStrength(pw);
  const colors = ['', '#EF4444', '#F59E0B', '#22C55E', '#10B981'];
  const labels = ['', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'];
  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`pw-bar-${i}`);
    if (bar) bar.style.background = i <= score ? colors[score] : '';
  }
  const label = document.getElementById('pw-strength-label');
  if (label) {
    label.textContent = pw.length > 0 ? labels[score] : 'Güç';
    label.style.color = colors[score] || '';
  }
}

function resetPwBars() {
  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`pw-bar-${i}`);
    if (bar) bar.style.background = '';
  }
  const label = document.getElementById('pw-strength-label');
  if (label) { label.textContent = 'Güç'; label.style.color = ''; }
}

// ══════════════════════════════════════════════════════
// AUTH HANDLERS
// ══════════════════════════════════════════════════════
function handleLogin(e) {
  e.preventDefault();
  let valid = true;

  const email = document.getElementById('login-email')?.value.trim() || '';
  const password = document.getElementById('login-password')?.value || '';

  // Clear
  clearFieldError('login-email', 'login-email-err');
  clearFieldError('login-password', 'login-pw-err');
  const errBox = document.getElementById('login-error');
  if (errBox) { errBox.style.display = 'none'; errBox.textContent = ''; }

  if (!email) { setFieldError('login-email', 'login-email-err', 'E-posta zorunludur'); valid = false; }
  else if (!isValidEmail(email)) { setFieldError('login-email', 'login-email-err', 'Geçerli bir e-posta girin'); valid = false; }

  if (!password) { setFieldError('login-password', 'login-pw-err', 'Şifre zorunludur'); valid = false; }

  if (!valid) return;

  // Show spinner
  setSubmitLoading('login-submit-btn', true);

  setTimeout(() => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.passwordHash === hashSimple(password));

    setSubmitLoading('login-submit-btn', false);

    if (!user) {
      if (errBox) {
        errBox.textContent = 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.';
        errBox.style.display = 'block';
      }
      return;
    }

    // Login success
    const sessionUser = { id: user.id, name: user.name, email: user.email, avatar: getInitials(user.name) };
    setCurrentUser(sessionUser);
    updateNavForAuth(sessionUser);
    closeAuthModal();
    showAuthToast(`Hoş geldiniz, ${user.name.split(' ')[0]}! 👋`);
  }, 600);
}

function handleRegister(e) {
  e.preventDefault();
  let valid = true;

  const name     = document.getElementById('reg-name')?.value.trim() || '';
  const email    = document.getElementById('reg-email')?.value.trim() || '';
  const password = document.getElementById('reg-password')?.value || '';
  const password2= document.getElementById('reg-password2')?.value || '';
  const terms    = document.getElementById('reg-terms')?.checked;

  // Clear all
  ['reg-name', 'reg-email', 'reg-password', 'reg-password2'].forEach(id => {
    document.getElementById(id)?.classList.remove('auth-input--error', 'auth-input--ok');
  });
  ['reg-name-err','reg-email-err','reg-pw-err','reg-pw2-err','reg-terms-err'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '';
  });
  const errBox = document.getElementById('register-error');
  const succBox = document.getElementById('register-success');
  if (errBox) errBox.style.display = 'none';
  if (succBox) succBox.style.display = 'none';

  if (!name || name.length < 2) { setFieldError('reg-name','reg-name-err','Ad Soyad en az 2 karakter olmalı'); valid = false; }
  else clearFieldError('reg-name','reg-name-err');

  if (!email) { setFieldError('reg-email','reg-email-err','E-posta zorunludur'); valid = false; }
  else if (!isValidEmail(email)) { setFieldError('reg-email','reg-email-err','Geçerli bir e-posta girin'); valid = false; }
  else clearFieldError('reg-email','reg-email-err');

  if (!password || password.length < 6) { setFieldError('reg-password','reg-pw-err','Şifre en az 6 karakter olmalı'); valid = false; }
  else clearFieldError('reg-password','reg-pw-err');

  if (password !== password2) { setFieldError('reg-password2','reg-pw2-err','Şifreler eşleşmiyor'); valid = false; }
  else if (password2) clearFieldError('reg-password2','reg-pw2-err');

  if (!terms) {
    const termsErr = document.getElementById('reg-terms-err');
    if (termsErr) termsErr.textContent = 'Devam etmek için koşulları kabul etmelisiniz';
    valid = false;
  }

  if (!valid) return;

  setSubmitLoading('register-submit-btn', true);

  setTimeout(() => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      setSubmitLoading('register-submit-btn', false);
      setFieldError('reg-email','reg-email-err','Bu e-posta zaten kayıtlı');
      return;
    }

    const newUser = {
      id: Date.now().toString(36),
      name, email,
      passwordHash: hashSimple(password),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);

    setSubmitLoading('register-submit-btn', false);

    if (succBox) {
      succBox.textContent = 'Hesabınız oluşturuldu! Giriş yapılıyor...';
      succBox.style.display = 'block';
    }

    setTimeout(() => {
      const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: getInitials(newUser.name) };
      setCurrentUser(sessionUser);
      updateNavForAuth(sessionUser);
      closeAuthModal();
      showAuthToast(`Hoş geldiniz, ${newUser.name.split(' ')[0]}! Hesabınız oluşturuldu 🎉`);
    }, 1200);
  }, 800);
}

function handleLogout() {
  setCurrentUser(null);
  updateNavForAuth(null);
  showAuthToast('Çıkış yapıldı. Görüşmek üzere! 👋');
}

// ══════════════════════════════════════════════════════
// NAVBAR UPDATE
// ══════════════════════════════════════════════════════
function updateNavForAuth(user) {
  const signinBtn = document.getElementById('nav-signin');
  const ctaBtn    = document.getElementById('nav-cta');
  const mobileSignin = document.getElementById('mobile-signin');
  const mobileCta    = document.getElementById('mobile-cta');

  // Remove existing user widget
  document.getElementById('nav-user-widget')?.remove();
  document.getElementById('nav-user-dropdown')?.remove();
  document.getElementById('mobile-user-info')?.remove();

  if (user) {
    // Hide sign-in / CTA buttons
    if (signinBtn) signinBtn.style.display = 'none';
    if (ctaBtn) ctaBtn.style.display = 'none';

    // Create user widget
    const widget = document.createElement('div');
    widget.id = 'nav-user-widget';
    widget.className = 'nav-user-widget';
    widget.innerHTML = `
      <button class="nav-user-btn" id="nav-user-btn" aria-haspopup="true" aria-expanded="false">
        <div class="nav-user-avatar">${user.avatar}</div>
        <span class="nav-user-name">${user.name.split(' ')[0]}</span>
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
    `;

    const dropdown = document.createElement('div');
    dropdown.id = 'nav-user-dropdown';
    dropdown.className = 'nav-user-dropdown';
    dropdown.innerHTML = `
      <div class="nav-dropdown-header">
        <div class="nav-dropdown-avatar">${user.avatar}</div>
        <div>
          <div class="nav-dropdown-name">${user.name}</div>
          <div class="nav-dropdown-email">${user.email}</div>
        </div>
      </div>
      <div class="nav-dropdown-divider"></div>
      <a href="#" class="nav-dropdown-item">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Profilim
      </a>
      <a href="#shop" class="nav-dropdown-item">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
        Siparişlerim
      </a>
      <a href="#" class="nav-dropdown-item">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l7.78-7.78a5.5 5.5 0 000-7.84z"/></svg>
        Favorilerim
      </a>
      <div class="nav-dropdown-divider"></div>
      <button class="nav-dropdown-item nav-dropdown-logout" id="nav-logout-btn">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Çıkış Yap
      </button>
    `;

    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
      navActions.insertBefore(widget, navActions.querySelector('.hamburger'));
      navActions.appendChild(dropdown);
    }

    // Toggle dropdown
    document.getElementById('nav-user-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = document.getElementById('nav-user-dropdown');
      const btn = document.getElementById('nav-user-btn');
      const isOpen = dd?.classList.toggle('active');
      btn?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.getElementById('nav-logout-btn')?.addEventListener('click', () => {
      document.getElementById('nav-user-dropdown')?.classList.remove('active');
      handleLogout();
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#nav-user-widget') && !e.target.closest('#nav-user-dropdown')) {
        document.getElementById('nav-user-dropdown')?.classList.remove('active');
        document.getElementById('nav-user-btn')?.setAttribute('aria-expanded', 'false');
      }
    });

    // Mobile user info
    const mobileFooter = document.querySelector('.mobile-menu-footer');
    if (mobileFooter) {
      if (mobileSignin) mobileSignin.style.display = 'none';
      if (mobileCta) mobileCta.style.display = 'none';

      const mobileInfo = document.createElement('div');
      mobileInfo.id = 'mobile-user-info';
      mobileInfo.className = 'mobile-user-info';
      mobileInfo.innerHTML = `
        <div class="mobile-user-avatar">${user.avatar}</div>
        <div>
          <div class="mobile-user-name">${user.name}</div>
          <div class="mobile-user-email">${user.email}</div>
        </div>
        <button class="mobile-logout-btn" id="mobile-logout-btn">Çıkış</button>
      `;
      mobileFooter.prepend(mobileInfo);

      document.getElementById('mobile-logout-btn')?.addEventListener('click', () => {
        handleLogout();
        document.getElementById('mobile-overlay')?.classList.remove('active');
        document.getElementById('mobile-menu')?.classList.remove('active');
      });
    }

  } else {
    // Show sign-in / CTA buttons
    if (signinBtn) signinBtn.style.display = '';
    if (ctaBtn) ctaBtn.style.display = '';
    if (mobileSignin) mobileSignin.style.display = '';
    if (mobileCta) mobileCta.style.display = '';
  }
}

// ══════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════
function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

function setSubmitLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const text = btn.querySelector('.auth-submit-text');
  const spinner = btn.querySelector('.auth-submit-spinner');
  btn.disabled = loading;
  if (text) text.style.opacity = loading ? '0' : '1';
  if (spinner) spinner.style.display = loading ? 'block' : 'none';
}

function showAuthToast(msg) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'shop-toast';
  t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 380); }, 3500);
}

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
export function initAuth() {
  // Restore session
  const user = getCurrentUser();
  if (user) updateNavForAuth(user);

  // Navbar buttons
  document.getElementById('nav-signin')?.addEventListener('click', () => openAuthModal('login'));
  document.getElementById('nav-cta')?.addEventListener('click', () => openAuthModal('register'));
  document.getElementById('mobile-signin')?.addEventListener('click', () => {
    document.getElementById('mobile-overlay')?.classList.remove('active');
    document.getElementById('mobile-menu')?.classList.remove('active');
    setTimeout(() => openAuthModal('login'), 300);
  });
  document.getElementById('mobile-cta')?.addEventListener('click', () => {
    document.getElementById('mobile-overlay')?.classList.remove('active');
    document.getElementById('mobile-menu')?.classList.remove('active');
    setTimeout(() => openAuthModal('register'), 300);
  });

  // Modal events (delegated since modal is created lazily)
  document.addEventListener('click', (e) => {
    // Tab switching
    const tab = e.target.closest('.auth-tab');
    if (tab) { switchTab(tab.dataset.tab); return; }

    // Switch buttons inside form
    const switchBtn = e.target.closest('.auth-switch-btn');
    if (switchBtn) { switchTab(switchBtn.dataset.goto); return; }

    // Close on overlay click
    if (e.target.id === 'auth-modal') { closeAuthModal(); return; }

    // Close button
    if (e.target.closest('#auth-close-btn')) { closeAuthModal(); return; }

    // PW toggle
    const pwToggle = e.target.closest('.auth-pw-toggle');
    if (pwToggle) {
      const targetId = pwToggle.dataset.target;
      const input = document.getElementById(targetId);
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
      return;
    }
  });

  // Form submissions
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-login') { handleLogin(e); return; }
    if (e.target.id === 'form-register') { handleRegister(e); return; }
  });

  // Password strength live update
  document.addEventListener('input', (e) => {
    if (e.target.id === 'reg-password') updatePwBars(e.target.value);
  });

  // Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAuthModal();
  });

  // Footer newsletter form
  document.getElementById('footer-nl-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('footer-nl-email')?.value.trim() || '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAuthToast('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    document.getElementById('footer-nl-email').value = '';
    showAuthToast('E-bülten aboneliğiniz alındı! 🎉');
  });

  // Footer membership links — data-auth-open attribute
  document.addEventListener('click', (e) => {
    const authLink = e.target.closest('[data-auth-open]');
    if (authLink) {
      e.preventDefault();
      openAuthModal(authLink.dataset.authOpen || 'login');
    }
  });
}
