// ===== Parlem Flores — JS (Vintage Elegance) =====

let siteData = null;

async function loadData() {
  const res = await fetch('data.json?v=' + Date.now());
  siteData = await res.json();
  renderAll();
}

function renderAll() {
  renderTopBar();
  renderNavLinks();
  renderHero();
  renderOccasions();
  renderProducts('all');
  renderCategoryTabs();
  renderServices();
  renderAbout();
  renderWedding();
  renderTestimonials();
  renderContact();
  renderFooter();
}

// ---- TOP BAR ----
function renderTopBar() {
  const bar = document.querySelector('.top-bar');
  if (!bar) return;
  const text = siteData.site.top_bar_text;
  if (text) {
    bar.innerHTML = text + ' · <a href="#contacto">Más info</a>';
  }
}

// ---- NAV LINKS ----
function renderNavLinks() {
  const navLinks = document.getElementById('nav-links');
  const mobileNavLinks = document.getElementById('mobile-nav-links');
  const links = siteData.site.nav_links || [];

  if (navLinks && links.length > 0) {
    navLinks.innerHTML = links.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('');
  }

  if (mobileNavLinks && links.length > 0) {
    mobileNavLinks.innerHTML = links.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('');
  }

  // Social links
  const ig = siteData.site.instagram || '';
  const wa = siteData.site.whatsapp || '';

  ['nav-ig', 'mobile-nav-ig', 'contact-ig-btn', 'footer-ig', 'ig-banner-link'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = `https://instagram.com/${ig}`;
  });

  ['nav-wa', 'mobile-nav-wa', 'contact-wa-btn', 'footer-wa', 'wa-float', 'wa-link'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'wa-link') {
        el.href = `https://wa.me/${wa}?text=Hola%20Parlem%20Flores%2C%20me%20gustaría%20hacer%20un%20pedido%20%F0%9F%8C%BF`;
      } else {
        el.href = `https://wa.me/${wa}`;
      }
    }
  });
}

// ---- HERO ----
function renderHero() {
  const s = siteData.site;
  document.getElementById('hero-title').innerHTML = s.hero_title.replace(/([A-Za-záéíóúñ]+)$/i, '<em>$1</em>');
  document.getElementById('hero-subtitle').textContent = s.hero_subtitle;

  // Badge
  const badge = document.querySelector('.hero-badge');
  if (badge && s.hero_badge) badge.textContent = s.hero_badge;

  // Background image
  const bg = document.getElementById('hero-bg-img');
  if (s.hero_image) {
    const imgSrc = s.hero_image.startsWith('data:') ? s.hero_image : s.hero_image;
    bg.style.backgroundImage = `url('${imgSrc}')`;
    bg.style.opacity = String((Number(s.hero_image_opacity ?? 70) || 70) / 100);
    bg.classList.add('active');
  } else if (bg) {
    bg.style.backgroundImage = '';
    bg.style.opacity = '';
    bg.classList.remove('active');
  }

  // Tags
  const tagsContainer = document.querySelector('.hero-tags');
  if (tagsContainer && s.hero_tags && s.hero_tags.length > 0) {
    tagsContainer.innerHTML = s.hero_tags.map(t => `<span>${t}</span>`).join('');
  }
}

// ---- OCCASIONS STRIP ----
function renderOccasions() {
  const strip = document.getElementById('occasions-strip');
  if (!strip) return;
  const occasions = siteData.occasions || [];
  if (occasions.length === 0) { strip.style.display = 'none'; return; }
  strip.style.display = '';
  strip.innerHTML = occasions.map(o => `
    <a class="occasion-card" href="#productos" onclick="filterByOccasion('${o.label}')">
      <span class="occ-icon">${o.icon}</span>
      <span class="occ-label">${o.label}</span>
      <span class="occ-desc">${o.desc}</span>
    </a>
  `).join('');
}

function filterByOccasion(label) {
  setTimeout(() => {
    document.querySelector('#productos').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// ---- CATEGORY TABS ----
function renderCategoryTabs() {
  const tabs = document.getElementById('category-tabs');
  if (!tabs) return;
  const cats = siteData.categories || [];
  const allCats = [{ id: 'all', name: 'Todas' }, ...cats];
  tabs.innerHTML = allCats.map(c => `
    <button class="tab-btn ${c.id === 'all' ? 'active' : ''}" onclick="filterProducts('${c.id}', this)">
      ${c.name}
    </button>
  `).join('');
}

function filterProducts(catId, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSubcategoryTabs(catId);
  renderProducts(catId);
}

function renderSubcategoryTabs(catId, activeSubcategory = 'all') {
  const tabs = document.getElementById('subcategory-tabs');
  if (!tabs) return;
  const category = (siteData.categories || []).find(c => c.id === catId);
  const subcategories = category?.subcategories || [];
  if (!subcategories.length) {
    tabs.innerHTML = '';
    tabs.style.display = 'none';
    return;
  }
  tabs.style.display = 'flex';
  const items = [{ id: 'all', name: 'Todos' }, ...subcategories];
  tabs.innerHTML = items.map(s => `
    <button class="subtab-btn ${s.id === activeSubcategory ? 'active' : ''}" onclick="filterProductsBySubcategory('${catId}', '${s.id}', this)">
      ${s.name}
    </button>
  `).join('');
}

function filterProductsBySubcategory(catId, subcategoryId, btn) {
  document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(catId, subcategoryId);
}

// ---- PRODUCTS ----
function renderProducts(catId, subcategoryId = 'all') {
  const grid = document.getElementById('products-grid');
  if (catId === 'all') renderSubcategoryTabs('all');
  const isVisibleProduct = p => p.available && p.image;
  const products = catId === 'all'
    ? siteData.products.filter(isVisibleProduct)
    : siteData.products.filter(p => p.category === catId && isVisibleProduct(p) && (subcategoryId === 'all' || p.subcategory === subcategoryId));

  if (products.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem;grid-column:1/-1">No hay productos disponibles en esta categoría.</p>';
    return;
  }

  grid.innerHTML = products.map(p => {
    const badgeClass = p.badge && p.badge.toLowerCase().includes('consul') ? 'consultar' :
                       p.badge && p.badge.toLowerCase().includes('nuevo') ? 'nuevo' : '';
    let priceHtml;
    if (p.price === 0) {
      priceHtml = `<span class="product-price"><small>Consultar presupuesto</small></span>`;
    } else if (p.price_max && p.price_max > p.price) {
      priceHtml = `
        <div>
          <span class="product-price">${p.price}€</span>
          <span class="product-price-range">desde ${p.price}€ – ${p.price_max}€</span>
        </div>`;
    } else {
      priceHtml = `
        <div>
          <span class="product-price">${p.price}€</span>
          ${p.price_label ? `<span class="product-price-range">${p.price_label}</span>` : ''}
        </div>`;
    }
    const subcategoryName = p.subcategory ? getSubcategoryName(p.category, p.subcategory) : '';
    return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img">
        ${p.image ? `<button class="image-zoom-btn" type="button" onclick='openImageLightbox(${JSON.stringify(p.image)}, ${JSON.stringify(p.name)})'><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.closest('.product-img').innerHTML='<span class=\\'image-placeholder\\'>Sin foto</span>'"></button>` : '<span class="image-placeholder">Sin foto</span>'}
      </div>
      ${p.badge ? `<span class="product-badge ${badgeClass}">${p.badge}</span>` : ''}
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        ${subcategoryName ? `<div class="product-subcategory">${subcategoryName}</div>` : ''}
        <div class="product-desc">${p.description}</div>
        <div class="product-footer">
          ${priceHtml}
          <a class="btn-order" href="https://wa.me/${siteData.site.whatsapp}?text=${encodeURIComponent(`Hola Parlem Flores, me interesa ${p.name}. ¿Me puedes dar más información?`)}" target="_blank">
            WhatsApp
          </a>
        </div>
      </div>
    </div>`;
  }).join('');
}

function getSubcategoryName(catId, subcategoryId) {
  const category = (siteData.categories || []).find(c => c.id === catId);
  const subcategory = (category?.subcategories || []).find(s => s.id === subcategoryId);
  return subcategory ? subcategory.name : '';
}

// ---- SERVICES ----
function renderServices() {
  const grid = document.querySelector('.services-grid');
  if (!grid) return;
  const services = siteData.site.services || siteData.services || [];
  if (services.length === 0) return;
  grid.innerHTML = services.map(s => `
    <div class="service-card">
      <div class="service-icon">${s.icon || '✨'}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>
  `).join('');
}

function openImageLightbox(src, alt = '') {
  let modal = document.getElementById('image-lightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'image-lightbox';
    modal.className = 'image-lightbox';
    modal.innerHTML = `
      <button class="image-lightbox-close" type="button" aria-label="Cerrar">×</button>
      <img alt="">
    `;
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.classList.contains('image-lightbox-close')) closeImageLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeImageLightbox();
    });
    document.body.appendChild(modal);
  }
  const img = modal.querySelector('img');
  img.src = src;
  img.alt = alt;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeImageLightbox() {
  const modal = document.getElementById('image-lightbox');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ---- ABOUT ----
function renderAbout() {
  const s = siteData.site;
  const section = document.getElementById('nosotros');
  if (!s.about_text && section) {
    section.style.display = 'none';
    return;
  }
  if (section) section.style.display = '';
  document.getElementById('about-name').textContent = s.about_name;
  document.getElementById('about-text').textContent = s.about_text;
  const img = document.getElementById('about-img');
  if (s.about_image) {
    img.innerHTML = `<img src="${s.about_image}" alt="${s.about_name}" onerror="this.parentElement.innerHTML='✿'">`;
  }

  // Stats
  const statsGrid = document.querySelector('.about-stats');
  if (statsGrid && s.about_stats && s.about_stats.length > 0) {
    statsGrid.innerHTML = s.about_stats.map(st => `
      <div class="stat-item">
        <div class="stat-num">${st.num}</div>
        <div class="stat-label">${st.label}</div>
      </div>
    `).join('');
  }
}

// ---- WEDDING ----
function renderWedding() {
  const s = siteData.site;
  if (s.wedding_text) {
    const weddingCard = document.querySelector('.wedding-card p');
    if (weddingCard) weddingCard.textContent = s.wedding_text;
  }
  if (s.wedding_cta) {
    const weddingBtn = document.getElementById('wedding-wa');
    if (weddingBtn) weddingBtn.textContent = 'PEDIR PRESUPUESTO';
  }
}

// ---- TESTIMONIALS ----
function renderTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  grid.innerHTML = siteData.testimonials.map(t => `
    <div class="testimonial-card" style="position:relative">
      <div class="stars">${'★'.repeat(t.stars)}${'☆'.repeat(5 - t.stars)}</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">${t.name}</div>
      <div class="testimonial-source">via ${t.source}</div>
    </div>
  `).join('');
}

// ---- CONTACT ----
function renderContact() {
  const s = siteData.site;
  document.getElementById('contact-address').textContent = s.address;
  document.getElementById('contact-phone').textContent = s.phone;
  document.getElementById('contact-phone').href = `tel:${s.phone.replace(/\s/g, '')}`;
  document.getElementById('contact-hours').textContent = s.hours;
  document.getElementById('contact-delivery').textContent = s.delivery_info;
}

// ---- FOOTER ----
function renderFooter() {
  const s = siteData.site;
  document.getElementById('footer-tagline').textContent = s.tagline;
  document.getElementById('footer-year').textContent = new Date().getFullYear();
}

// ---- UTILS ----
function openWA(e) {
  e.preventDefault();
  window.open(`https://wa.me/${siteData.site.whatsapp}?text=Hola%21%20Quiero%20pedir%20flores%20%F0%9F%8C%BF`, '_blank');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ---- FORM SUBMIT ----
function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('form-name').value;
  const phone = document.getElementById('form-phone').value;
  const type = document.getElementById('form-type').value;
  const msg = document.getElementById('form-msg').value;
  const text = `Hola Parlem Flores! Soy *${name}*.\n📱 Teléfono: ${phone}\n📌 Tipo: ${type}\n💬 ${msg}`;
  window.open(`https://wa.me/${siteData.site.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  showToast('✅ Redirigiendo a WhatsApp...');
  e.target.reset();
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  // Mobile hamburger
  const ham = document.getElementById('hamburger');
  const overlay = document.getElementById('mobile-nav-overlay');

  ham?.addEventListener('click', () => {
    overlay.classList.toggle('open');
    document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  document.querySelectorAll('#mobile-nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on overlay click (outside nav)
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    let current = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  // Instagram banner
  setTimeout(() => {
    if (siteData) {
      const ig = siteData.site.instagram;
      const igLink = document.getElementById('ig-banner-link');
      if (igLink && ig) {
        igLink.href = `https://instagram.com/${ig}`;
        igLink.textContent = `@${ig} →`;
      }
    }
  }, 500);

  loadData();
});

function openWeddingWA(e) {
  e.preventDefault();
  if (siteData) {
    window.open(`https://wa.me/${siteData.site.whatsapp}?text=Hola%21%20Me%20gustar%C3%ADa%20consultar%20sobre%20decoraci%C3%B3n%20floral%20para%20un%20evento`, '_blank');
  }
}

function filterToWedding(e) {
  e.preventDefault();
  document.querySelector('#productos').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    const btn = [...document.querySelectorAll('.tab-btn')].find(b => b.textContent.toLowerCase().includes('evento'));
    if (btn) btn.click();
  }, 600);
}
