const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('./db.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from current directory
app.use(express.static(__dirname));

const SECRET_KEY = 'super-secret-admin-key';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';

// Verify Token Middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access Denied' });

    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });
        req.user = user;
        next();
    });
}

// ---- AUTH API ----
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// ---- PRODUCTS API ----
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        let products = [...rows];
        let queries = products.map(p => {
            return new Promise((resolve, reject) => {
                db.all('SELECT spec_key, spec_val FROM product_specs WHERE product_key = ?', [p.key], (err, specs) => {
                    if (err) reject(err);
                    p.specs = specs.map(s => [s.spec_key, s.spec_val]);
                    resolve();
                });
            });
        });

        Promise.all(queries).then(() => {
            res.json(products);
        }).catch(err => {
            res.status(500).json({ error: err.message });
        });
    });
});

app.post('/api/products', authenticateToken, (req, res) => {
    const { key, model, name, img, category, is_featured, specs } = req.body;
    const stmt = db.prepare('INSERT INTO products (key, model, name, img, category, is_featured) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(key, model, name, img, category, is_featured, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        if (specs && Array.isArray(specs)) {
            const specStmt = db.prepare('INSERT INTO product_specs (product_key, spec_key, spec_val) VALUES (?, ?, ?)');
            specs.forEach(s => specStmt.run(key, s[0], s[1]));
            specStmt.finalize();
        }
        res.json({ id: this.lastID });
    });
    stmt.finalize();
});

app.delete('/api/products/:key', authenticateToken, (req, res) => {
    db.run('DELETE FROM products WHERE key = ?', req.params.key, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// ---- ENQUIRIES API ----
app.get('/api/enquiries', authenticateToken, (req, res) => {
    db.all('SELECT * FROM enquiries ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/enquiries', (req, res) => {
    const { name, email, product_interest, units, message } = req.body;
    const stmt = db.prepare('INSERT INTO enquiries (name, email, product_interest, units, message) VALUES (?, ?, ?, ?, ?)');
    stmt.run(name, email, product_interest, units, message, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
    stmt.finalize();
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
