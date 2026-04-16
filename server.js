require('dotenv').config();
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

// Load credentials from environment variables
const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-admin-key';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password123';

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

// ---- CATALOG API ----
app.get('/api/catalog/download', (req, res) => {
    const fs = require('fs');
    // Check for PPTX first (preferred)
    const catalogPptxPath = path.join(__dirname, 'catalog.pptx');
    const catalogPdfPath = path.join(__dirname, 'catalog.pdf');
    
    if (fs.existsSync(catalogPptxPath)) {
        // Serve existing PPTX catalog
        res.download(catalogPptxPath, 'Flower-Smart-Capsule-Homes-Catalog.pptx');
    } else if (fs.existsSync(catalogPdfPath)) {
        // Serve existing PDF
        res.download(catalogPdfPath, 'Flower-Smart-Capsule-Homes-Catalog.pdf');
    } else {
        // Generate a basic PDF with product information
        generateCatalogPDF(res);
    }
});

function generateCatalogPDF(res) {
    // Generate a simple HTML-based PDF content
    // Since pdfkit might not be installed, we'll create a basic downloadable file
    // with product information rendered as an HTML document that can be saved as PDF
    
    const catalogContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 1500 >>
stream
BT
/F1 24 Tf
50 720 Td
(Flower Smart Capsule Homes - Product Catalog) Tj
0 -40 Td
/F1 14 Tf
(Complete Product Guide) Tj
0 -30 Td
/F1 12 Tf
(Thank you for your interest in Flower Smart intelligent capsule homes!) Tj
0 -20 Td
(Our catalog includes:) Tj
0 -20 Td
(• 9+ Premium Capsule Home Models) Tj
0 -15 Td
(• Full Technical Specifications & Dimensions) Tj
0 -15 Td
(• Smart Home Features & Technology Built-In) Tj
0 -15 Td
(• Customization Options & Pricing) Tj
0 -15 Td
(• Installation & Delivery Information) Tj
0 -30 Td
(Available Models:) Tj
0 -20 Td
/F1 11 Tf
(E3 Orbit Cabin - Compact single-floor model) Tj
0 -15 Td
(E5 Nova Pod - Premium mid-size model) Tj
0 -15 Td
(E7 Stellar Lodge - Luxury flagship model) Tj
0 -15 Td
(F5 Dune Pod - Resort & Glamping model) Tj
0 -15 Td
(F7 Ridge Cabin - Residential series) Tj
0 -15 Td
(Zenith Twin - Double-layer model) Tj
0 -15 Td
(N7 Forest Cabin - Nature resort model) Tj
0 -15 Td
(H7 Meadow Pod - Hospitality model) Tj
0 -15 Td
(H3 Steam Pod - Wellness & spa model) Tj
0 -30 Td
/F1 12 Tf
(For detailed specifications, pricing, and custom quotes:) Tj
0 -20 Td
(Email: ridoyrkr@outlook.com) Tj
0 -15 Td
(Phone/WhatsApp: +86 132 2252 5102) Tj
0 -15 Td
(Location: Changzhou, Jiangsu, China) Tj
0 -30 Td
/F1 11 Tf
(www.flowersmarttech.com) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000322 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1873
%%EOF
    `;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Flower-Smart-Capsule-Homes-Catalog.pdf"');
    res.send(catalogContent);
}

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
