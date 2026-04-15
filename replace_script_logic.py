import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update submitForm to POST to /api/enquiries
new_submit_form = """function submitForm() {
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
                alert('Thank you, ' + name + '! We\\'ve received your enquiry and will reply within 24 hours.');
                ['name', 'email', 'product', 'units', 'message'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
            }).catch(err => {
                alert('Error submitting form. Please try again.');
            });
        }"""

js = re.sub(r'function submitForm\(\) \{[\s\S]*?\}\n', new_submit_form + "\n", js)

# 2. Update Products Logic
# We need to remove the hardcoded `const products = { ... };` and replace it with dynamic fetch.
# The hardcoded products block starts at `const products = {` and ends before `function openModal`

js = re.sub(r'const products = \{[\s\S]*?^\};\n', "let products = {};\n", js, flags=re.MULTILINE)

# Also we should dynamically render the products grid if it exists.
dynamic_render = """
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
"""

js = js.replace('let products = {};\n', dynamic_render)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)
