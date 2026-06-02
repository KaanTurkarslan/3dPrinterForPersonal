/**
 * CustomShape3D — Cart & Payment Module
 * Handles slide-over Cart Drawer, Checkout, Credit Card UI and 3D Secure verification flow.
 */

// Shared cart state
let cart = JSON.parse(localStorage.getItem('cs3d_cart')) || [];

// Injects the Cart Drawer and Checkout Modal HTML to the page on load
export function initCart() {
  injectCartHTML();
  updateCartBadge();
  renderCartItems();
  setupEventListeners();

  // Real-time synchronization across tabs when localStorage changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'cs3d_cart') {
      cart = JSON.parse(e.newValue) || [];
      updateCartBadge();
      renderCartItems();
    }
  });
}

function injectCartHTML() {
  if (document.getElementById('cart-drawer')) return;

  // Cart Drawer HTML
  const drawer = document.createElement('div');
  drawer.id = 'cart-drawer-container';
  drawer.innerHTML = `
    <!-- Overlay -->
    <div class="cart-overlay" id="cart-overlay"></div>
    
    <!-- Drawer -->
    <aside class="cart-drawer" id="cart-drawer" aria-modal="true" role="dialog" aria-label="Alışveriş Sepeti">
      <div class="cart-drawer-header">
        <h2 class="cart-drawer-title">Alışveriş Sepetim (<span id="cart-count-title">0</span>)</h2>
        <button class="cart-drawer-close" id="cart-close-btn" aria-label="Sepeti Kapat">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Cart items scroll area -->
      <div class="cart-drawer-body" id="cart-drawer-body">
        <!-- Dynamic items list -->
        <div class="cart-items-list" id="cart-items-list"></div>
        
        <!-- Empty cart message -->
        <div class="cart-empty-state" id="cart-empty-state">
          <svg width="64" height="64" fill="none" stroke="var(--text-muted, #64748B)" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p>Sepetiniz henüz boş.</p>
          <button class="btn-primary" style="margin-top:16px; padding:10px 20px; font-size:0.85rem;" id="cart-continue-shopping">Alışverişe Başla</button>
        </div>
      </div>
      
      <!-- Cart footer (Total + Checkout CTA) -->
      <div class="cart-drawer-footer" id="cart-drawer-footer">
        <div class="cart-total-row">
          <span class="cart-total-label">Genel Toplam:</span>
          <span class="cart-total-value" id="cart-total-val">₺0</span>
        </div>
        <button class="btn-primary cart-checkout-btn" id="cart-checkout-btn">
          <span>Ödemeye Geç</span>
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </aside>
  `;
  document.body.appendChild(drawer);

  // Checkout Modal HTML
  const checkout = document.createElement('div');
  checkout.id = 'checkout-modal-container';
  checkout.innerHTML = `
    <!-- Overlay -->
    <div class="checkout-overlay" id="checkout-overlay"></div>
    
    <!-- Modal -->
    <div class="checkout-modal" id="checkout-modal" role="dialog" aria-modal="true">
      <button class="checkout-close" id="checkout-close-btn" aria-label="Kapat">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      
      <div class="checkout-modal-grid">
        <!-- Form Section -->
        <div class="checkout-form-section">
          <h2 class="checkout-section-title">Ödeme ve Teslimat Bilgileri</h2>
          
          <form id="checkout-form" novalidate>
            <!-- Step 1: Delivery Address -->
            <div class="form-group-wrap">
              <h3 class="form-subtitle">📍 1. Teslimat Adresi</h3>
              <div class="form-row">
                <div class="form-field">
                  <label for="co-name">Ad Soyad</label>
                  <input type="text" id="co-name" required placeholder="Adınızı ve soyadınızı yazın.." />
                </div>
                <div class="form-field">
                  <label for="co-phone">Telefon</label>
                  <input type="tel" id="co-phone" required placeholder="05xx xxx xx xx" />
                </div>
              </div>
              <div class="form-field">
                <label for="co-address">Açık Adres</label>
                <textarea id="co-address" rows="2" required placeholder="Sokak, mahalle, bina no, daire no.."></textarea>
              </div>
            </div>
            
            <!-- Step 2: Payment Cards -->
            <div class="form-group-wrap" style="margin-top: 24px;">
              <h3 class="form-subtitle">💳 2. Kart Bilgileri</h3>
              <div class="form-field">
                <label for="co-cardname">Kart Üzerindeki İsim</label>
                <input type="text" id="co-cardname" required placeholder="KART SAHİBİNİN ADI" />
              </div>
              <div class="form-field">
                <label for="co-cardnumber">Kart Numarası</label>
                <div style="position:relative">
                  <input type="text" id="co-cardnumber" maxlength="19" required placeholder="0000 0000 0000 0000" />
                  <span class="card-brand-icon" id="card-brand-icon">💳</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label for="co-exp">Son Kullanma Tarihi</label>
                  <input type="text" id="co-exp" maxlength="5" required placeholder="AA/YY" />
                </div>
                <div class="form-field">
                  <label for="co-cvc">CVC / CVC2</label>
                  <input type="text" id="co-cvc" maxlength="3" required placeholder="***" />
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <!-- Summary Section -->
        <div class="checkout-summary-section">
          <h2 class="checkout-section-title">Sipariş Özeti</h2>
          
          <div class="checkout-summary-items" id="co-summary-items"></div>
          
          <div class="checkout-summary-footer">
            <div class="pb-row">
              <span class="pb-label">Ara Toplam:</span>
              <span class="pb-val" id="co-subtotal">₺0</span>
            </div>
            <div class="pb-row">
              <span class="pb-label">Kargo Ücreti:</span>
              <span class="pb-val" style="color:#10B981; font-weight:600;">ÜCRETSİZ</span>
            </div>
            <div class="pb-divider"></div>
            <div class="pb-total">
              <span class="pb-total-label">Ödenecek Tutar:</span>
              <span class="pb-total-val" id="co-total">₺0</span>
            </div>
            
            <button class="btn-primary btn-checkout-submit" id="btn-pay-secure">
              <span class="secure-icon">🔒</span>
              <span id="btn-pay-text">Güvenli Ödeme Yap</span>
            </button>
            
            <div class="secure-payment-badge">
              <svg width="24" height="24" fill="none" stroke="#5B8DEF" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <span>256-Bit iyzico Altyapısı ile Güvenli Ödeme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 3D Secure / Success Screen -->
    <div class="checkout-flow-overlay" id="checkout-flow-overlay">
      <!-- Loading State -->
      <div class="checkout-flow-card" id="flow-loading-card" style="display:none;">
        <div class="checkout-spinner"></div>
        <h3>Banka Onayı Bekleniyor</h3>
        <p>3D Secure doğrulama penceresine yönlendiriliyorsunuz, lütfen sayfayı kapatmayın...</p>
      </div>
      
      <!-- Success State -->
      <div class="checkout-flow-card" id="flow-success-card" style="display:none;">
        <div class="success-checkmark">
          <div class="check-icon"></div>
        </div>
        <h3 style="color:#10B981; font-size:1.4rem; margin-top:20px;">Ödeme Başarılı!</h3>
        <p style="margin: 10px 0 20px; font-size:0.9rem; color:var(--text-muted, #64748B);">Siparişiniz başarıyla alındı ve üretim sırasına eklendi.</p>
        <div class="order-details-box">
          <div>Sipariş Numarası: <strong id="order-no">#CS-98402</strong></div>
          <div style="margin-top:4px;">Tahmini Kargo: <strong>Aynı Gün (16:00 öncesi)</strong></div>
        </div>
        <button class="btn-primary" id="btn-flow-done" style="width:100%; padding:12px;">Mağazaya Geri Dön</button>
      </div>
    </div>
  `;
  document.body.appendChild(checkout);
}

// Setup events for toggle, input validation and submit
function setupEventListeners() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  const closeBtn = document.getElementById('cart-close-btn');
  const continueShopping = document.getElementById('cart-continue-shopping');
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  
  // Open / Close actions
  const openCart = () => {
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  
  const closeCart = () => {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  };
  
  closeBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  if (continueShopping) continueShopping.addEventListener('click', closeCart);
  
  // Attach open trigger to navbar cart buttons (can be dynamically created)
  document.body.addEventListener('click', e => {
    const trigger = e.target.closest('#nav-cart') || e.target.closest('[data-auth-open="cart"]');
    if (trigger) {
      e.preventDefault();
      openCart();
    }
  });

  // Quantity Change & Delete events inside scroll area
  const list = document.getElementById('cart-items-list');
  list.addEventListener('click', e => {
    const btnPlus = e.target.closest('.cart-qty-btn--plus');
    const btnMinus = e.target.closest('.cart-qty-btn--minus');
    const btnRemove = e.target.closest('.cart-item-remove');
    
    if (btnPlus) {
      const idx = parseInt(btnPlus.dataset.index);
      updateQuantity(idx, 1);
    }
    if (btnMinus) {
      const idx = parseInt(btnMinus.dataset.index);
      updateQuantity(idx, -1);
    }
    if (btnRemove) {
      const idx = parseInt(btnRemove.dataset.index);
      removeItem(idx);
    }
  });

  // Open Checkout Modal
  const checkoutOverlay = document.getElementById('checkout-overlay');
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutClose = document.getElementById('checkout-close-btn');

  const openCheckout = () => {
    closeCart();
    checkoutOverlay.classList.add('active');
    checkoutModal.classList.add('active');
    renderCheckoutSummary();
    document.body.style.overflow = 'hidden';
  };

  const closeCheckout = () => {
    checkoutOverlay.classList.remove('active');
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  checkoutBtn.addEventListener('click', openCheckout);
  checkoutClose.addEventListener('click', closeCheckout);
  checkoutOverlay.addEventListener('click', closeCheckout);

  // CC card number grouping logic
  const cardInput = document.getElementById('co-cardnumber');
  cardInput.addEventListener('input', e => {
    let val = e.target.value.replace(/\D/g, '');
    let grouped = val.match(/.{1,4}/g)?.join(' ') || val;
    e.target.value = grouped;

    // Detect card brand
    const icon = document.getElementById('card-brand-icon');
    if (val.startsWith('4')) icon.textContent = '✈️ VISA';
    else if (val.startsWith('5')) icon.textContent = '💳 MC';
    else if (val.startsWith('9')) icon.textContent = '🇹🇷 TROY';
    else icon.textContent = '💳';
  });

  // MM/YY Exp date auto slash
  const expInput = document.getElementById('co-exp');
  expInput.addEventListener('input', e => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) {
      e.target.value = val.substring(0,2) + '/' + val.substring(2,4);
    } else {
      e.target.value = val;
    }
  });

  // Secure payment submit flow simulation
  const payBtn = document.getElementById('btn-pay-secure');
  payBtn.addEventListener('click', e => {
    e.preventDefault();
    const form = document.getElementById('checkout-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Step 3: Start 3D Secure / Payment verification simulation
    const flowOverlay = document.getElementById('checkout-flow-overlay');
    const loadingCard = document.getElementById('flow-loading-card');
    const successCard = document.getElementById('flow-success-card');
    
    flowOverlay.classList.add('active');
    loadingCard.style.display = 'flex';
    
    setTimeout(() => {
      // 3D Secure loading complete -> Show success checkmark
      loadingCard.style.display = 'none';
      successCard.style.display = 'flex';
      
      // Random Order Number generator
      document.getElementById('order-no').textContent = `#CS-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Clear Cart!
      clearCart();
    }, 2500);
  });

  // Finish Checkout flow
  document.getElementById('btn-flow-done').addEventListener('click', () => {
    document.getElementById('checkout-flow-overlay').classList.remove('active');
    document.getElementById('flow-success-card').style.display = 'none';
    closeCheckout();
  });
}

// Add a product item configured in product detail page
export function addProductToCart(item) {
  // Check if identical item is already in cart to increment qty
  const existingIdx = cart.findIndex(c => 
    c.id === item.id && 
    c.color.hex === item.color.hex && 
    c.material.id === item.material.id && 
    c.quality.id === item.quality.id
  );

  if (existingIdx > -1) {
    cart[existingIdx].qty += item.qty;
    cart[existingIdx].total = cart[existingIdx].qty * cart[existingIdx].unitPrice;
  } else {
    cart.push(item);
  }

  saveCart();
  updateCartBadge();
  renderCartItems();
  
  // Show toast notification
  showCartToast(`🛒 ${item.name} sepetinize eklendi!`);
  
  // Open the drawer automatically
  document.getElementById('cart-overlay').classList.add('active');
  document.getElementById('cart-drawer').classList.add('active');
}

function updateQuantity(index, delta) {
  if (cart[index]) {
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart[index].qty = 1;
    cart[index].total = cart[index].qty * cart[index].unitPrice;
    saveCart();
    updateCartBadge();
    renderCartItems();
  }
}

function removeItem(index) {
  if (cart[index]) {
    cart.splice(index, 1);
    saveCart();
    updateCartBadge();
    renderCartItems();
  }
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function saveCart() {
  localStorage.setItem('cs3d_cart', JSON.stringify(cart));
}

// Re-renders list of items in drawer
function renderCartItems() {
  const list = document.getElementById('cart-items-list');
  const emptyState = document.getElementById('cart-empty-state');
  const footer = document.getElementById('cart-drawer-footer');
  const countTitle = document.getElementById('cart-count-title');
  
  if (!list) return;

  if (cart.length === 0) {
    list.style.display = 'none';
    emptyState.style.display = 'flex';
    footer.style.display = 'none';
    countTitle.textContent = '0';
    return;
  }

  list.style.display = 'flex';
  emptyState.style.display = 'none';
  footer.style.display = 'block';
  
  let totalCount = 0;
  let totalPrice = 0;
  
  let html = '';
  cart.forEach((item, idx) => {
    totalCount += item.qty;
    totalPrice += item.total;
    
    html += `
      <div class="cart-item">
        <div class="cart-item-info">
          <div>
            <h4 class="cart-item-name">${item.name}</h4>
            <div class="cart-item-details">
              <span>🧬 ${item.material.name}</span> • 
              <span>🔬 ${item.quality.name}</span> • 
              <span class="cart-item-color-tag">
                <span class="color-tag-dot" style="background:${item.color.hex}"></span>
                ${item.color.name}
              </span>
            </div>
          </div>
          <button class="cart-item-remove" data-index="${idx}" aria-label="Ürünü sepetten çıkar">
            🗑️
          </button>
        </div>
        <div class="cart-item-price-row">
          <!-- Qty adjust -->
          <div class="cart-qty-selector">
            <button class="cart-qty-btn cart-qty-btn--minus" data-index="${idx}">−</button>
            <span class="cart-qty-value">${item.qty}</span>
            <button class="cart-qty-btn cart-qty-btn--plus" data-index="${idx}">+</button>
          </div>
          <!-- Pricing -->
          <div class="cart-item-price">
            <span class="cart-item-unit-price">₺${item.unitPrice} / adet</span>
            <span class="cart-item-total-price">₺${item.total.toLocaleString('tr-TR')}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  countTitle.textContent = totalCount;
  list.innerHTML = html;
  document.getElementById('cart-total-val').textContent = `₺${totalPrice.toLocaleString('tr-TR')}`;
}

// Re-renders items summary in Checkout panel
function renderCheckoutSummary() {
  const container = document.getElementById('co-summary-items');
  const subtotalEl = document.getElementById('co-subtotal');
  const totalEl = document.getElementById('co-total');
  
  if (!container) return;
  
  let totalPrice = 0;
  let html = '';
  
  cart.forEach(item => {
    totalPrice += item.total;
    html += `
      <div class="co-item">
        <div class="co-item-info">
          <span class="co-item-name">${item.name} x${item.qty}</span>
          <span class="co-item-details">🧬 ${item.material.name} • 🔬 ${item.quality.name} • 🎨 ${item.color.name}</span>
        </div>
        <span class="co-item-price">₺${item.total.toLocaleString('tr-TR')}</span>
      </div>
    `;
  });
  
  container.innerHTML = html;
  subtotalEl.textContent = `₺${totalPrice.toLocaleString('tr-TR')}`;
  totalEl.textContent = `₺${totalPrice.toLocaleString('tr-TR')}`;
}

// Synchronize navbar badges
function updateCartBadge() {
  const count = cart.reduce((acc, c) => acc + c.qty, 0);
  const badges = document.querySelectorAll('.nav-cart-badge');
  
  badges.forEach(badge => {
    if (count > 0) {
      badge.style.display = 'flex';
      badge.textContent = count;
      badge.classList.remove('badge-pop');
      badge.offsetWidth;
      badge.classList.add('badge-pop');
    } else {
      badge.style.display = 'none';
    }
  });
}

function showCartToast(msg) {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = 'shop-toast show';
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 380);
  }, 3500);
}
