const API_URL = '/api';

function getToken() {
    return localStorage.getItem('adminToken');
}

function setToken(token) {
    localStorage.setItem('adminToken', token);
}

function checkAuth() {
    if (getToken()) {
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('dashboardView').classList.remove('hidden');
        loadEnquiries();
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);

async function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    try {
        let res = await fetch(API_URL + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        let data = await res.json();
        if (data.token) {
            setToken(data.token);
            document.getElementById('loginError').style.display = 'none';
            checkAuth();
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    } catch(err) {
        console.error(err);
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('loginView').classList.remove('hidden');
}

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('enquiriesTab').classList.add('hidden');
    document.getElementById('productsTab').classList.add('hidden');
    
    document.getElementById(tab + 'Tab').classList.remove('hidden');
    
    if (tab === 'enquiries') loadEnquiries();
    if (tab === 'products') loadProducts();
}

async function loadEnquiries() {
    let res = await fetch(API_URL + '/enquiries', {
        headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    if(res.status === 403 || res.status === 401) return logout();
    let data = await res.json();
    
    let html = data.map(e => `
        <tr>
            <td>${new Date(e.created_at).toLocaleString()}</td>
            <td><strong>${e.name}</strong></td>
            <td><a href="mailto:${e.email}">${e.email}</a></td>
            <td>${e.product_interest || '-'} (${e.units || '-'} units)</td>
            <td>${e.message || '-'}</td>
        </tr>
    `).join('');
    document.getElementById('enquiriesTableBody').innerHTML = html;
}

async function loadProducts() {
    let res = await fetch(API_URL + '/products');
    let data = await res.json();
    
    let html = data.map(p => `
        <tr>
            <td><img src="${p.img}" width="60" style="border-radius:4px;"></td>
            <td><strong>${p.model}</strong></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td><button class="btn btn-danger" style="padding:6px 10px; font-size:12px;" onclick="deleteProduct('${p.key}')">Delete</button></td>
        </tr>
    `).join('');
    document.getElementById('productsTableBody').innerHTML = html;
}

function addSpecField() {
    let html = `<div class="spec-item"><input type="text" placeholder="Key (e.g. Size)" class="s-key"><input type="text" placeholder="Value (e.g. 10m)" class="s-val"></div>`;
    document.getElementById('specsContainer').insertAdjacentHTML('beforeend', html);
}

async function saveProduct() {
    const key = document.getElementById('pKey').value;
    const model = document.getElementById('pModel').value;
    const name = document.getElementById('pName').value;
    const img = document.getElementById('pImg').value;
    const category = document.getElementById('pCat').value;
    const is_featured = document.getElementById('pFeat').checked ? 1 : 0;
    
    const specs = [];
    document.querySelectorAll('.spec-item').forEach(el => {
        let k = el.querySelector('.s-key').value;
        let v = el.querySelector('.s-val').value;
        if(k && v) specs.push([k, v]);
    });
    
    if(!key || !model || !name) return alert("Fill out Key, Model, and Name");
    
    await fetch(API_URL + '/products', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify({ key, model, name, img, category, is_featured, specs })
    });
    
    document.getElementById('addProductForm').classList.add('hidden');
    loadProducts();
}

async function deleteProduct(key) {
    if(!confirm("Are you sure you want to delete this product?")) return;
    await fetch(API_URL + '/products/' + key, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    loadProducts();
}
