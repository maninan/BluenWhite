/* NAV SCROLL */
const nav = document.getElementById('navbar');
if (nav) {
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    });
}

/* REVEAL ON ANCHOR NAVIGATION */
window.addEventListener('hashchange', () => {
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.active)').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('active');
            }
        });
    }, 150);
});

/* HAMBURGER */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });
}

function closeMobile() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburger) hamburger.classList.remove('open');
    if (mobileMenu) mobileMenu.classList.remove('open');
}

/* FORM SUBMIT */
async function submitForm() {
    const nameEl = document.getElementById('name');
    const emailEl = document.getElementById('email');
    if (!nameEl || !emailEl) return;

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const product = document.getElementById('product') ? document.getElementById('product').value : '';
    const units = document.getElementById('units') ? document.getElementById('units').value : '';
    const message = document.getElementById('message') ? document.getElementById('message').value : '';

    if (!name || !email) { 
        alert('Please enter your name and email address.'); 
        return; 
    }
    
    try {
        const res = await fetch('/api/enquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, product_interest: product, units, message })
        });
        const data = await res.json();
        if (data.success) {
            alert('Thank you, ' + name + '! We\'ve received your enquiry and will reply within 24 hours.');
            ['name', 'email', 'product', 'units', 'message'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
        } else {
            throw new Error('Server error');
        }
    } catch (err) {
        alert('Error submitting form. Please try again.');
        console.error(err);
    }
}

/* PRODUCT DATA & MODALS */
let products = {};

async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const grid = document.getElementById('mainProductsGrid');

        // Populate global object for modals
        data.forEach(p => {
            products[p.key] = {
                model: p.model,
                name: p.name,
                img: p.img,
                specs: p.specs
            };
        });

        if (grid) {
            grid.innerHTML = '';
            data.forEach(p => {
                const isFeatured = p.is_featured ? '<div class="featured-badge">Most Popular</div>' : '';
                const featuredClass = p.is_featured ? 'featured' : '';
                
                // Display first 4 specs on card
                const specRows = (p.specs || []).slice(0, 4).map(s => 
                    `<div class="spec-row"><span class="spec-key">${s[0]}</span><span class="spec-val">${s[1]}</span></div>`
                ).join('');

                const cardHtml = `
                    <div class="product-card filter-item ${featuredClass}" data-category="${p.category}" onclick="openModal('${p.key}')">
                        ${isFeatured}
                        <div class="product-img">
                            <div class="product-img-inner">
                                <img src="${p.img}" alt="${p.name}">
                            </div>
                        </div>
                        <div class="product-body">
                            <div class="product-model" style="font-size:22px;">${p.model}</div>
                            <div class="product-name">${p.name}</div>
                            ${specRows}
                            <span class="card-cta">View Details →</span>
                        </div>
                    </div>
                `;
                grid.innerHTML += cardHtml;
            });
            // Re-bind modal setup and glare
            setupCustomInteractions();
        }
    } catch (err) {
        console.error('Failed to load products:', err);
    }
}

function openModal(key) {
    const p = products[key];
    if (!p) {
        console.error('Product not found for key:', key);
        return;
    }
    
    const modalImg = document.getElementById('modalImg');
    const modalModel = document.getElementById('modalModel');
    const modalName = document.getElementById('modalName');
    const modalSpecs = document.getElementById('modalSpecs');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalImg) modalImg.style.background = `url('${p.img}') center/cover`;
    if (modalModel) modalModel.textContent = p.model;
    if (modalName) modalName.textContent = p.name;
    if (modalSpecs) modalSpecs.innerHTML = (p.specs || []).map(([k, v]) =>
        `<div class="modal-spec-item"><div class="modal-spec-label">${k}</div><div class="modal-spec-val">${v}</div></div>`
    ).join('');
    if (modalOverlay) modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

function closeModalOutside(e) {
    const modalOverlay = document.getElementById('modalOverlay');
    if (e.target === modalOverlay) closeModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function setupCustomInteractions() {
    document.querySelectorAll('.product-card').forEach(card => {
        if (card.querySelector('.glare-container')) return; // already set up
        const glareContainer = document.createElement('div');
        glareContainer.className = 'glare-container';
        const glare = document.createElement('div');
        glare.className = 'glare';
        glareContainer.appendChild(glare);
        card.appendChild(glareContainer);
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            glare.style.transform = `translate(${x - rect.width}px, ${y - rect.height}px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            glare.style.transform = `translate(0px, 0px)`;
        });
    });
}

/* TRANSLATIONS */
const zhTranslations = {
    "Products": "产品展示",
    "Customize": "定制服务",
    "About Us": "关于我们",
    "Blog": "博客资讯",
    "Contact": "联系我们",
    "Get a Quote": "获取报价",
    "Smart Modular Living · Changzhou, China": "智能模块化居住 · 中国常州",
    "Capsule Homes": "太空舱房屋",
    "Delivered Ready": "成品交付",
    "to Live In.": "即刻入住。",
    "Factory-finished capsule houses for resorts, glamping, residential, and commercial projects. Smart controls built in. Shipped anywhere.": "为度假村、奢华露营、住宅和商业项目提供工厂定制太空舱房屋。内置智能控制，全球配送。",
    "Explore Products": "探索产品",
    "Scroll": "滚动",
    "Capsule Models": "太空舱型号",
    "Factory Finished": "工厂完工",
    "Smart": "智能",
    "Home Built-In": "全屋智能",
    "Full": "全套",
    "Interior Fit-Out": "精装交付",
    "Global": "全球",
    "Shipping": "物流配送",
    "Included in every unit": "全系标配",
    "What You See Is What You Get": "所见即所得",
    "Full Interior": "精装内饰",
    "Eco wood floors, marble bathroom, custom vanity, bar area — completely finished.": "环保木地板、大理石卫浴、定制洗漱台、吧台区域 —— 完全精装。",
    "Smart Home": "智能家居",
    "Card-access power, voice control, app door lock, multi-scene lighting — all standard.": "插卡取电、语音控制、APP门锁、多场景照明 —— 全系标配。",
    "Ready in Days": "快速交付",
    "Factory finished and shipped ready. No on-site construction. Move in immediately.": "工厂预制，成品发货。无需现场施工，落地即住。",
    "Weather-Proof": "全天候无忧",
    "Galvanised steel frame, fluorocarbon aluminium shell, tempered glass — built to last outdoors.": "镀锌钢骨架、氟碳铝合金外壳、钢化玻璃 —— 专为户外长久使用打造。",
    "Email Address": "邮箱地址",
    "Send Enquiry →": "发送询价 →",
    "We reply within 24 hours · All enquiries are confidential": "我们将在24小时内回复 · 所有询价信息将严格保密",
    "3–4 people": "3–4 人",
    "2 people": "2 人",
    "2–4 people": "2–4 人",
    "4 people": "4 人",
    "Floor area": "建筑面积",
    "Floors": "楼层",
    "Guests": "入住人数",
    "Weight": "重量",
    "View Details →": "查看详情 →"
};

let currentLang = 'en';

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'zh' : 'en';
    
    // Update button text
    const btn = document.getElementById('langToggle');
    const mobileBtn = document.getElementById('langToggleMobile');
    const text = currentLang === 'en' ? '中文' : 'EN';
    if (btn) btn.textContent = text;
    if (mobileBtn) mobileBtn.textContent = text;

    // Traverse all text nodes and replace
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while(node = walker.nextNode()) {
        if(node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE')) continue;
        
        let textVal = node.nodeValue;
        let trimText = textVal.trim();
        if(!trimText) continue;

        // Store original text
        if(currentLang === 'zh') {
            if(!node.originalText) {
                node.originalText = textVal;
            }
            if(zhTranslations[trimText]) {
                node.nodeValue = textVal.replace(trimText, zhTranslations[trimText]);
            }
        } else {
            // Revert to English
            if(node.originalText) {
                node.nodeValue = node.originalText;
            }
        }
    }

    // Special handlers for placeholders
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(input => {
        let ph = input.getAttribute('placeholder');
        if (currentLang === 'zh') {
            if (!input.dataset.origPh) input.dataset.origPh = ph;
            if (ph === 'Full name') input.setAttribute('placeholder', '全名');
            if (ph === 'you@email.com') input.setAttribute('placeholder', 'you@email.com');
            if (ph === 'e.g. 5–10') input.setAttribute('placeholder', '例如：5–10套');
            if (ph && ph.startsWith('Location, use case')) input.setAttribute('placeholder', '项目地点、使用场景（度假村、露营、住宅等）、时间规划、预算范围以及其他特殊要求...');
        } else {
            if (input.dataset.origPh) input.setAttribute('placeholder', input.dataset.origPh);
        }
    });

    // Special handler for <select> options
    const selectOptions = document.querySelectorAll('select option');
    selectOptions.forEach(opt => {
        let textVal = opt.textContent.trim();
        if (currentLang === 'zh') {
            if (!opt.dataset.origText) opt.dataset.origText = textVal;
            if (textVal === 'Select a model...') opt.textContent = '请选择型号...';
            if (textVal === 'Custom / Bespoke Build') opt.textContent = '个性化定制 / 商业定制';
        } else {
            if (opt.dataset.origText) opt.textContent = opt.dataset.origText;
        }
    });
}

/* DOM CONTENT LOADED */
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    
    // Scroll To Top Button Logic
    const scrollBtn = document.getElementById('scrollTopBtn');
    if(scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });
        scrollBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Scroll Reveal Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
});

/* PRODUCT FILTERING */
function filterProducts(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event && event.target && event.target.classList.contains('filter-btn')) {
        event.target.classList.add('active');
    }

    const items = document.querySelectorAll('.filter-item');
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            setTimeout(() => { 
                item.style.opacity = '1'; 
                item.style.transform = 'translateY(0) scale(1)'; 
            }, 50);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(() => { 
                if(item.style.opacity === '0') {
                    item.style.display = 'none'; 
                }
            }, 300);
        }
    });
}

/* CATALOG DOWNLOAD */
async function downloadCatalog() {
    const nameEl = document.getElementById('catalogName');
    const emailEl = document.getElementById('catalogEmail');
    
    if (!nameEl || !emailEl) return;
    
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    
    if (!name || !email) {
        alert('Please enter your name and email address.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    try {
        // Save enquiry to database
        const res = await fetch('/api/enquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name, 
                email, 
                product_interest: 'Catalog Request',
                message: 'Requested product catalog download'
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            // Trigger download
            const link = document.createElement('a');
            link.href = '/api/catalog/download';
            link.download = 'Flower-Smart-Capsule-Homes-Catalog.pptx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('Thank you, ' + name + '! Your catalog is downloading. We\'ll send you more information shortly.');
            
            // Clear form
            nameEl.value = '';
            emailEl.value = '';
        } else {
            throw new Error('Server error');
        }
    } catch (err) {
        alert('Error processing your request. Please try again.');
        console.error(err);
    }
}

/* GLOBAL EXPORTS */
window.toggleLanguage   = toggleLanguage;
window.openModal        = openModal;
window.closeModal       = closeModal;
window.closeModalOutside = closeModalOutside;
window.submitForm       = submitForm;
window.filterProducts   = filterProducts;
window.closeMobile      = closeMobile;
window.downloadCatalog  = downloadCatalog;
