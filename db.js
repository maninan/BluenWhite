const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Enquiries Table
        db.run(`CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            product_interest TEXT,
            units TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            model TEXT NOT NULL,
            name TEXT NOT NULL,
            img TEXT NOT NULL,
            category TEXT NOT NULL,
            is_featured BOOLEAN DEFAULT 0
        )`);

        // Specs Table
        db.run(`CREATE TABLE IF NOT EXISTS product_specs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_key TEXT NOT NULL,
            spec_key TEXT NOT NULL,
            spec_val TEXT NOT NULL,
            FOREIGN KEY (product_key) REFERENCES products(key) ON DELETE CASCADE
        )`);

        // Check if products exist, otherwise seed them
        db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
            if (row && row.count === 0) {
                seedProducts();
            }
        });
    });
}

function seedProducts() {
    console.log('Seeding initial products into database...');
    const products = [
        { key: 'e3', category: 'double', is_featured: 0, model: 'E3', name: 'Orbit Cabin — 2 Floor Flagship', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80', specs: [['Floor 1 Size', 'L 11,500 × W 3,300 × H 3,200 mm'], ['Floor 2 Size', 'L 8,500 × W 3,300 × H 3,200 mm'], ['Floor Area', '50 ㎡'], ['Floors', '2'], ['Guests', '3–4 people'], ['Weight', '9,000 kg']] },
        { key: 'e5', category: 'single', is_featured: 1, model: 'E5', name: 'Nova Pod — Compact Single Floor', img: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=900&q=80', specs: [['Size', 'L 8,500 × W 3,300 × H 3,200 mm'], ['Floor Area', '28 ㎡'], ['Floors', '1'], ['Guests', '2 people'], ['Weight', '6,000 kg']] },
        { key: 'e7', category: 'single', is_featured: 0, model: 'E7', name: 'Stellar Lodge — Spacious Single', img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=900&q=80', specs: [['Size', 'L 11,500 × W 3,300 × H 3,200 mm'], ['Floor Area', '38 ㎡'], ['Floors', '1'], ['Guests', '2–4 people'], ['Weight', '7,000 kg']] },
        { key: 'f5', category: 'single', is_featured: 0, model: 'F5', name: 'Dune Pod — Desert Edition', img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=900&q=80', specs: [['Size', 'L 8,500 × W 3,300 × H 3,200 mm'], ['Floor Area', '28 ㎡'], ['Floors', '1'], ['Guests', '2 people'], ['Weight', '6,000 kg']] },
        { key: 'f7', category: 'single', is_featured: 0, model: 'F7', name: 'Ridge Cabin — Mountain Edition', img: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=900&q=80', specs: [['Size', 'L 11,500 × W 3,300 × H 3,200 mm'], ['Floor Area', '38 ㎡'], ['Floors', '1'], ['Guests', '2–4 people'], ['Weight', '7,000 kg']] },
        { key: 'dbl', category: 'double', is_featured: 0, model: 'ZENITH', name: 'Zenith Twin — Double Layer Cluster', img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=900&q=80', specs: [['Configuration', '3×3 units'], ['Size per unit', 'L 11,500×3 × W 3,200×3 × H 3,200×3 mm'], ['Floors', '2'], ['Guests', '4 people'], ['Weight', '7,000 kg']] },
        { key: 'n7', category: 'apple', is_featured: 0, model: 'N7', name: 'Forest Cabin — Apple Series', img: 'https://images.unsplash.com/photo-1544015759-237f4042a8e5?w=900&q=80', specs: [['Size', 'L 11,500 × W 3,300 × H 3,200 mm'], ['Floor Area', '38 ㎡'], ['Guests', '2–4 people'], ['Weight', '7,000 kg'], ['Customisable', 'Layout, exterior & interior']] },
        { key: 'h7', category: 'apple', is_featured: 0, model: 'H7', name: 'Meadow Pod — Apple Series', img: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=900&q=80', specs: [['Size', 'L 11,500 × W 3,300 × H 3,200 mm'], ['Floor Area', '38 ㎡'], ['Guests', '2–4 people'], ['Weight', '7,500 kg'], ['Customisable', 'Layout, exterior & interior']] },
        { key: 'h3', category: 'specialty', is_featured: 0, model: 'H3', name: 'Steam Pod — Sauna Edition', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80', specs: [['Size', 'L 5,800 × W 3,300 × H 3,200 mm'], ['Floor Area', '20 ㎡'], ['Guests', '2 people'], ['Weight', '4,500 kg'], ['Use Case', 'Sauna · Wellness · Spa']] }
    ];

    const stmt = db.prepare('INSERT INTO products (key, model, name, img, category, is_featured) VALUES (?, ?, ?, ?, ?, ?)');
    const specStmt = db.prepare('INSERT INTO product_specs (product_key, spec_key, spec_val) VALUES (?, ?, ?)');

    products.forEach(p => {
        stmt.run(p.key, p.model, p.name, p.img, p.category, p.is_featured);
        p.specs.forEach(s => {
            specStmt.run(p.key, s[0], s[1]);
        });
    });

    stmt.finalize();
    specStmt.finalize();
}

module.exports = db;
