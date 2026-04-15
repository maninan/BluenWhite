/* VERCEL ANALYTICS */
import { inject } from '@vercel/analytics';
inject();

/* NAV SCROLL */
        const nav = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        });

        /* REVEAL ON ANCHOR NAVIGATION
           When a user clicks a nav link (e.g. #about), the browser jumps
           instantly. This listener fires after the scroll lands and activates
           any .reveal elements that are now in view. */
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
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
        function closeMobile() {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        }

        /* FORM SUBMIT */
        function submitForm() {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const product = document.getElementById('product') ? document.getElementById('product').value : '';
            const units = document.getElementById('units') ? document.getElementById('units').value : '';
            const message = document.getElementById('message') ? document.getElementById('message').value : '';

            if (!name || !email) { alert('Please enter your name and email address.'); return; }
            
            fetch('http://localhost:3001/api/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, product_interest: product, units, message })
            }).then(res => res.json()).then(data => {
                alert('Thank you, ' + name + '! We\'ve received your enquiry and will reply within 24 hours.');
                ['name', 'email', 'product', 'units', 'message'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
            }).catch(err => {
                alert('Error submitting form. Please try again.');
            });
        }

        /* PRODUCT DATA */
        
let products = {};

async function loadProducts() {
    try {
        const res = await fetch('http://localhost:3001/api/products');
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
                const specRows = p.specs.slice(0, 4).map(s => 
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

document.addEventListener('DOMContentLoaded', loadProducts);

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
            if (ph.startsWith('Location, use case')) input.setAttribute('placeholder', '项目地点、使用场景（度假村、露营、住宅等）、时间规划、预算范围以及其他特殊要求...');
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


/* ═══════════════════════════════
   PREMIUM INTERACTIONS
═══════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
    
    // 2. Setup 3D Tilt Glare Dynamically
    document.querySelectorAll('.product-card').forEach(card => {
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
            
            const rotateX = ((y - centerY) / centerY) * -8; // max 8 deg tilt
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Move glare
            glare.style.transform = `translate(${x - rect.width}px, ${y - rect.height}px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            glare.style.transform = `translate(0px, 0px)`;
        });
    });

    
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

    // 3. Scroll Reveal Intersection Observer
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

    // Fallback: activate any reveals already in the viewport on page load
    // (e.g. when user navigates directly to a section via anchor link)
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.active)').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('active');
            }
        });
    }, 200);
});

/* ═══════════════════════════════
   PRODUCT FILTERING
═══════════════════════════════ */
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

/* ═══════════════════════════════
   GLOBAL EXPORTS
   type="module" scripts run in their own scope.
   Inline onclick handlers (e.g. onclick="toggleLanguage()")
   need these functions on window to work.
═══════════════════════════════ */
window.toggleLanguage   = toggleLanguage;
window.openModal        = openModal;
window.closeModal       = closeModal;
window.closeModalOutside = closeModalOutside;
window.submitForm       = submitForm;
window.filterProducts   = filterProducts;
window.closeMobile      = closeMobile;
