(function apexBasket() {
  'use strict';
  const CART_KEY = 'apex-access-local-cart-v1';
  const cart = new Map();
  const byId = id => products.find(p => p.id === id);
  const countItems = () => [...cart.values()].reduce((sum, n) => sum + n, 0);

  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      for (const [id, qty] of Object.entries(stored)) {
        if (/^[a-z0-9-]{1,90}$/.test(id) && Number.isInteger(qty) && qty > 0) cart.set(id, Math.min(qty, 99));
      }
    }
  } catch (_) { /* Basket still works when browser storage is blocked. */ }

  const basketIcon = document.createElement('button');
  basketIcon.type = 'button';
  basketIcon.id = 'basketBtn';
  basketIcon.className = 'header-icon apex-basket-button';
  basketIcon.title = 'Open basket';
  basketIcon.setAttribute('aria-label', 'Open shopping basket');
  basketIcon.innerHTML = '<svg class="apex-basket-svg" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 12.5h21l-2.4 12H7.9l-2.4-12Z"/><path d="m11 12.5 5-8 5 8"/><path d="m12 17 1 4.5M20 17l-1 4.5M16 17v4.5"/></svg><span class="pill-count hidden" id="basketCount">0</span>';
  const savedButton = document.getElementById('savedBtn');
  savedButton.parentNode.insertBefore(basketIcon, savedButton);

  const drawer = document.createElement('aside');
  drawer.id = 'basketSheet';
  drawer.className = 'sheet apex-basket-sheet';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-label', 'Your shopping basket');
  drawer.innerHTML = '<div class="sheet-top"><div><span class="small-cap">Your selection</span><h2>Shopping basket <span id="basketTitleCount" class="apex-cart-muted">(0)</span></h2></div><button class="header-icon" id="basketClose" aria-label="Close basket">×</button></div><p>Items are saved privately on this device. You can change quantities or remove anything.</p><div class="apex-cart-items" id="basketItems" aria-live="polite"></div><div class="apex-cart-bottom"><div class="apex-cart-totals"><span>Items</span><strong id="basketQuantity">0</strong></div><div class="apex-cart-totals"><span>Subtotal</span><strong>Awaiting verified prices</strong></div><p class="apex-cart-notice">Secure payment and digital delivery are not yet configured. Adding an item does not place an order or charge you.</p><button type="button" class="button button-dark apex-checkout-disabled" disabled aria-disabled="true">Checkout not yet available</button><button type="button" class="apex-continue" id="basketContinue">Continue shopping</button></div>';
  document.body.appendChild(drawer);

  const nativeReset = resetOverlays;
  resetOverlays = function () {
    nativeReset();
    drawer.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
  };
  function openBasket() {
    resetOverlays();
    renderCart();
    activeModal = 'basketSheet';
    drawer.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
    document.getElementById('overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
    tone('open');
    document.getElementById('basketClose').focus();
  }
  function closeBasket() { closeModal(); }
  basketIcon.addEventListener('click', openBasket);
  document.getElementById('basketClose').addEventListener('click', closeBasket);
  document.getElementById('basketContinue').addEventListener('click', () => {
    closeBasket();
    document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
  });

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(Object.fromEntries(cart))); } catch (_) {}
  }
  function refreshCounter() {
    const n = countItems();
    const bubble = document.getElementById('basketCount');
    bubble.textContent = n > 99 ? '99+' : String(n);
    bubble.classList.toggle('hidden', n === 0);
    document.getElementById('basketTitleCount').textContent = `(${n})`;
    document.getElementById('basketQuantity').textContent = String(n);
    basketIcon.setAttribute('aria-label', `Open shopping basket, ${n} items`);
  }
  function addToBasket(id, amount = 1) {
    const p = byId(id);
    if (!p) return;
    cart.set(id, Math.min(99, (cart.get(id) || 0) + amount));
    saveCart();
    refreshCounter();
    renderCart();
    tone('save');
    showToast(`${p.name} added to basket`);
  }
  function changeQty(id, next) {
    if (!byId(id)) return;
    if (next <= 0) cart.delete(id);
    else cart.set(id, Math.min(99, next));
    saveCart();
    renderCart();
  }
  function renderCart() {
    refreshCounter();
    const items = [...cart.entries()].map(([id, qty]) => ({ product: byId(id), qty })).filter(x => x.product);
    const root = document.getElementById('basketItems');
    if (!items.length) {
      root.innerHTML = '<div class="apex-cart-empty"><svg viewBox="0 0 64 64" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="1.8"><path d="M11 25h42l-5 26H16l-5-26Zm11 0L32 10l10 15M25 35v8m14-8v8"/></svg><h3>Your basket is empty.</h3><p>Browse the collection and add something you like.</p></div>';
      return;
    }
    root.innerHTML = items.map(({ product: p, qty }) => `
      <article class="apex-cart-row">
        <div class="apex-cart-art" style="--swatch:${p.swatch}"><img src="${p.icon}" alt="" loading="lazy" onerror="this.style.display='none'"></div>
        <div class="apex-cart-info">
          <span class="apex-cart-cat">${safeText(p.cat)}</span>
          <strong>${safeText(p.name)}</strong>
          <small>Price and available plans pending confirmation</small>
          <div class="apex-cart-qty" aria-label="Quantity for ${safeText(p.name)}">
            <button data-cart-action="decrease" data-cart-id="${p.id}" aria-label="Decrease ${safeText(p.name)} quantity">−</button>
            <span aria-live="polite">${qty}</span>
            <button data-cart-action="increase" data-cart-id="${p.id}" aria-label="Increase ${safeText(p.name)} quantity" ${qty >= 99 ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <button class="apex-cart-remove" data-cart-action="remove" data-cart-id="${p.id}" aria-label="Remove ${safeText(p.name)} from basket">×</button>
      </article>`).join('');
  }
  document.getElementById('basketItems').addEventListener('click', e => {
    const btn = e.target.closest('[data-cart-action]');
    if (!btn) return;
    const id = btn.dataset.cartId;
    const current = cart.get(id) || 0;
    if (btn.dataset.cartAction === 'increase') changeQty(id, current + 1);
    else if (btn.dataset.cartAction === 'decrease') changeQty(id, current - 1);
    else if (btn.dataset.cartAction === 'remove') changeQty(id, 0);
    tone('tap');
  });

  // Reuse the original collection rendering, adding only a product-level basket control.
  const renderOriginalProducts = renderProducts;
  renderProducts = function () {
    renderOriginalProducts();
    for (const card of document.querySelectorAll('#products .product')) {
      const save = card.querySelector('[data-save]');
      const p = byId(save?.dataset.save);
      const footer = card.querySelector('.product-footer');
      if (!p || !footer) continue;
      const label = footer.querySelector('span');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'apex-add-button';
      button.textContent = 'Add to basket +';
      button.setAttribute('aria-label', `Add ${p.name} to basket`);
      button.addEventListener('click', () => addToBasket(p.id));
      if (label) label.replaceWith(button);
      else footer.prepend(button);
    }
  };

  // Replace old external product-listing button with a native basket action.
  const oldPreviewLink = document.getElementById('previewLink');
  const previewButton = document.createElement('button');
  previewButton.id = 'previewLink';
  previewButton.type = 'button';
  previewButton.className = oldPreviewLink.className;
  previewButton.style.width = '100%';
  previewButton.textContent = 'Add to basket +';
  oldPreviewLink.replaceWith(previewButton);
  const previewList = document.querySelector('#previewModal .preview-list');
  previewList.innerHTML = '<li>Choose this product and keep it in your basket without leaving the site.</li><li>Available plans, stock and current pricing still need to be verified.</li><li>Payment will only become available once secure checkout and delivery are configured.</li>';
  openPreview = function (id) {
    const p = byId(id);
    if (!p) return;
    document.getElementById('previewLogo').src = p.icon;
    document.getElementById('previewLogo').alt = `${p.name} brand icon`;
    document.getElementById('previewHeading').textContent = p.name;
    document.getElementById('previewSubtitle').textContent = p.desc;
    previewButton.onclick = () => { addToBasket(id); closeModal(); openBasket(); };
    openModal('previewModal');
  };

  // Wishlist now uses the internal basket rather than links to another storefront.
  renderSaved = function () {
    updateSavedCount();
    document.getElementById('savedItems').innerHTML = saved.size
      ? [...saved].map(id => byId(id)).filter(Boolean).map(p => `<div class="saved-item"><img src="${p.icon}" alt="${safeText(p.name)} icon"><div><strong>${safeText(p.name)}</strong><button class="apex-saved-add" data-saved-to-basket="${p.id}">Add to basket +</button></div><button data-remove="${p.id}" aria-label="Remove ${safeText(p.name)}">×</button></div>`).join('')
      : '<div class="empty-search">Nothing saved yet. Tap a heart to save your favourites.</div>';
  };
  document.getElementById('savedItems').addEventListener('click', e => {
    const add = e.target.closest('[data-saved-to-basket]');
    if (!add) return;
    addToBasket(add.dataset.savedToBasket);
    openBasket();
  });

  // All shop navigation stays on this website, including support and policy links.
  for (const link of document.querySelectorAll('a[href^="https://apexaccesshub.mysellauth.com"]')) {
    link.setAttribute('href', '#help');
    link.removeAttribute('target');
    link.removeAttribute('rel');
    const t = link.textContent.trim();
    if (/support|help/i.test(t)) link.textContent = 'Help';
    else if (/terms|privacy|refund|policy/i.test(t)) link.textContent = 'Store information';
    else link.textContent = 'Browse on Apex Access';
  }
  const help = document.createElement('section');
  help.id = 'help';
  help.className = 'section wrap apex-help';
  help.innerHTML = '<div class="section-top"><div><div class="small-cap">04 — Store information</div><h2 class="section-heading">Everything in <em>one place.</em></h2></div></div><p class="section-note">You can browse, save and manage a basket here. Verified prices, seller contact information, payment processing, fulfilment and current store policies must be configured before purchases can be taken.</p>';
  document.querySelector('#how').insertAdjacentElement('afterend', help);
  const copy = document.querySelector('#collection .section-note');
  if (copy) copy.textContent = 'Browse and add to your basket without leaving Apex Access. Current product prices and plan details still need verification.';
  const howCards = document.querySelectorAll('#how .how-card');
  if (howCards.length >= 3) {
    howCards[1].querySelector('h3').textContent = 'Choose your products';
    howCards[1].querySelector('p').textContent = 'Explore product details and add items to your basket without visiting another store.';
    howCards[2].querySelector('h3').textContent = 'Review your basket';
    howCards[2].querySelector('p').textContent = 'Update quantities and save your selection. Secure checkout will appear here when payment and delivery are configured.';
  }
  const savedFooter = document.querySelector('#savedSheet .sheet-foot');
  if (savedFooter) savedFooter.textContent = 'Your saved list is separate from your basket. You can add saved products to the basket here.';
  const disclaimer = document.querySelector('.disclaimer b');
  if (disclaimer) disclaimer.textContent = 'Independent software storefront preview';
  renderProducts();
  renderSaved();
  renderCart();
  (function extendApexCatalogue() {
  const money = value => ' + value.toFixed(2);
  const productRender = renderProducts;
  renderProducts = function() {
    productRender();
    for (const card of document.querySelectorAll('#products .product')) {
      const id = card.querySelector('[data-save]')?.dataset.save;
      const product = byId(id);
      const footer = card.querySelector('.product-footer');
      if (!product || !footer || !Number.isFinite(product.priceFrom)) continue;
      const price = document.createElement('p');
      price.className = 'apex-price-from';
      price.textContent = 'From ' + money(product.priceFrom) + ' USD';
      footer.parentElement.insertBefore(price, footer);
    }
  };
  const cartRender = renderCart;
  renderCart = function() {
    cartRender();
    const visibleProducts = [...cart.entries()].map(([id, qty]) => ({ p: byId(id), qty })).filter(x => x.p);
    const rows = document.querySelectorAll('#basketItems .apex-cart-row');
    visibleProducts.forEach(({ p }, index) => {
      const small = rows[index]?.querySelector('.apex-cart-info small');
      if (small && Number.isFinite(p.priceFrom)) small.textContent = 'From ' + money(p.priceFrom) + ' USD per item';
    });
    const allPriced = visibleProducts.length > 0 && visibleProducts.every(x => Number.isFinite(x.p.priceFrom));
    const minimum = visibleProducts.reduce((sum, x) => sum + (x.p.priceFrom || 0) * x.qty, 0);
    const label = drawer.querySelector('.apex-cart-totals:nth-child(2) span');
    const value = drawer.querySelector('.apex-cart-totals:nth-child(2) strong');
    if (label) label.textContent = 'Estimated minimum';
    if (value) value.textContent = allPriced ? money(minimum) + '+ USD' : 'Awaiting prices';
  };
  const preview = openPreview;
  openPreview = function(id) {
    preview(id);
    const product = byId(id);
    if (product && Number.isFinite(product.priceFrom)) {
      document.getElementById('previewSubtitle').textContent += ' · From ' + money(product.priceFrom) + ' USD';
    }
  };

  async function loadFullCatalogue() {
    const response = await fetch('./catalogue.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Catalogue unavailable');
    const catalogue = await response.json();
    if (!Array.isArray(catalogue.products) || catalogue.products.length < 12) throw new Error('Incomplete catalogue');
    const originals = new Map(products.map(p => [p.slug, p]));
    const loaded = [];
    const used = new Set();
    for (const entry of catalogue.products.slice(0, 250)) {
      if (!entry || typeof entry.slug !== 'string' || !/^[a-z0-9-]{1,90}$/.test(entry.slug) || used.has(entry.slug)) continue;
      if (typeof entry.name !== 'string' || typeof entry.cat !== 'string') continue;
      used.add(entry.slug);
      const original = originals.get(entry.slug);
      const numericPrice = Number(entry.minPriceUSD);
      loaded.push({
        id: original?.id || entry.slug,
        slug: entry.slug,
        name: entry.name.replace(/\s*\(OUR BESTSELLER\)/gi, '').trim(),
        cat: entry.cat,
        desc: original?.desc || entry.desc || 'Digital software and subscription options.',
        icon: original?.icon || (/^https:\/\/static\.mysellauth\.com\//.test(entry.icon) ? entry.icon : ''),
        swatch: original?.swatch || entry.swatch || '#d8d9d1',
        priceFrom: Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : undefined
      });
    }
    if (loaded.length < 12) throw new Error('Catalogue could not be imported');
    products.splice(0, products.length, ...loaded);
    for (const p of loaded) if (!categories.includes(p.cat)) categories.push(p.cat);
    if (selectedCat !== 'All products' && !categories.includes(selectedCat)) selectedCat = 'All products';
    try {
      const storedSaved = JSON.parse(localStorage.getItem('apex-editorial-saved') || '[]');
      saved.clear();
      if (Array.isArray(storedSaved)) for (const id of storedSaved) if (byId(id)) saved.add(id);
    } catch (_) {}
    const intro = document.querySelector('#collection .section-note');
    if (intro) intro.textContent = `${loaded.length} product listings. Prices in USD are starting prices from the published catalogue; plans and availability can change.`;
    const help = document.querySelector('#help .section-note');
    if (help) help.textContent = 'Explore the full catalogue, save products and manage your basket here. Starting prices are shown for reference. Secure payment, delivery and store policies need to be configured before purchases are accepted.';
    renderProducts();
    renderSaved();
    renderCart();
  }
  loadFullCatalogue().catch(error => console.warn('Could not import full Apex Access catalogue:', error));
})();
})();
