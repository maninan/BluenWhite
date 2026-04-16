# Database Access Commands

## View All Products:
sqlite3 database.sqlite 'SELECT * FROM products;'

## View All Enquiries:
sqlite3 database.sqlite 'SELECT * FROM enquiries;'

## View Product Specifications:
sqlite3 database.sqlite 'SELECT * FROM product_specs;'

## Count Records:
sqlite3 database.sqlite 'SELECT COUNT(*) FROM enquiries;'

## View Recent Enquiries:
sqlite3 database.sqlite 'SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 5;'

## Database File Location:
/Users/capsulehouse/Desktop/VSCode/BluenWhite/database.sqlite

