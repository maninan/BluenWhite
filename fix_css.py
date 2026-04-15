import re

with open('style.css', 'r') as f:
    css = f.read()

# Replace root variables
css = re.sub(r'--navy: #0B1622;', '--navy: #ffffff;', css)
css = re.sub(r'--dark: #0F2030;', '--dark: #f0f2f5;', css)
css = re.sub(r'--card: #152638;', '--card: #ffffff;', css)
css = re.sub(r'--border: #1E3A52;', '--border: #ccd0d5;', css)
css = re.sub(r'--teal: #00C4A8;', '--teal: #1877F2;', css)
css = re.sub(r'--teal-dim: #009E87;', '--teal-dim: #166fe5;', css)
css = re.sub(r'--gray: #7A9DB0;', '--gray: #65676B;', css)
css = re.sub(r'--text: #B8D0DC;', '--text: #050505;', css)
css = re.sub(r'--light: #EEF4F8;', '--light: #EBEDF0;', css)
css = re.sub(r'--red: #E05050;', '--red: #E41E3F;', css)

# Replace body background and color
css = re.sub(r'background: radial-gradient\(circle at top right, #102A43, var\(--navy\) 60\);\s*background-attachment: fixed;\s*color: var\(--white\);',
             r'background: #f0f2f5;\n            color: var(--text);', css)

# Replace strong color
css = re.sub(r'strong \{\s*color: var\(--white\);', r'strong {\n            color: var(--text);', css)

# Replace nav.scrolled background
css = re.sub(r'background: rgba\(11, 22, 34, \.96\);', r'background: rgba(255, 255, 255, 0.96);', css)

# Replace mobile menu texts
css = re.sub(r'\.mobile-menu a \{\s*font-family: var\(--font-display\);\s*font-size: 32px;\s*font-weight: 700;\s*color: var\(--white\);',
             r'.mobile-menu a {\n            font-family: var(--font-display);\n            font-size: 32px;\n            font-weight: 700;\n            color: var(--text);', css)

# Replace hero background
css = re.sub(r'background:\n\s*linear-gradient\(to right, rgba\(11, 22, 34, \.92\) 45%, rgba\(11, 22, 34, \.4\) 100%\),',
             r'background:\n                linear-gradient(to right, rgba(235, 237, 240, 0.95) 45%, rgba(235, 237, 240, 0.7) 100%),', css)

# Replace btn-outline
css = re.sub(r'\.btn-outline \{\s*display: inline-block;\s*border: 1px solid rgba\(255, 255, 255, \.3\);\s*color: var\(--white\);',
             r'.btn-outline {\n            display: inline-block;\n            border: 1px solid var(--teal);\n            color: var(--teal);', css)

# Replace hamburger spans
css = re.sub(r'\.hamburger span \{\s*display: block;\s*width: 24px;\s*height: 2px;\s*background: var\(--white\);',
             r'.hamburger span {\n            display: block;\n            width: 24px;\n            height: 2px;\n            background: var(--text);', css)

# Replace card CTA hover
css = re.sub(r'\.product-card:hover \.card-cta \{\s*background: var\(--teal\);\s*color: var\(--navy\);',
             r'.product-card:hover .card-cta {\n            background: var(--red);\n            color: var(--white);\n            border-color: var(--red);', css)

# Set the red button color specifically for 'Get a Quote' / nav button
css = re.sub(r'\.btn-nav \{\s*background: var\(--teal\);', r'.btn-nav {\n            background: var(--red);', css)
css = re.sub(r'\.btn-nav:hover \{\s*background: #00dfc0;', r'.btn-nav:hover {\n            background: #d01835;', css)

css = re.sub(r'\.spec-val \{\s*color: var\(--white\);', r'.spec-val {\n            color: var(--text);', css)

# Change secondary backgrounds
css = re.sub(r'background: #0a1824;', r'background: var(--light);', css)
css = re.sub(r'background: #080F18;', r'background: var(--card);', css)

# Navbar links dark text
css = re.sub(r'\.nav-links a:hover \{\s*color: var\(--white\);', r'.nav-links a:hover {\n            color: var(--teal);', css)
css = re.sub(r'\.nav-links a \{\s*font-size: 13px;\s*font-weight: 500;\s*color: var\(--gray\);', r'.nav-links a {\n            font-size: 13px;\n            font-weight: 600;\n            color: var(--text);', css)


# Form inputs background
css = re.sub(r'\.form-group input,\n\s*\.form-group select,\n\s*\.form-group textarea \{\n\s*background: #0a1824;',
             r'.form-group input,\n        .form-group select,\n        .form-group textarea {\n            background: var(--light);', css)

css = re.sub(r'\.form-group input,\n\s*\.form-group select,\n\s*\.form-group textarea \{\s*background: var\(--light\);\s*border: 1px solid var\(--border\);\s*border-radius: 8px;\s*color: var\(--white\);',
             r'.form-group input,\n        .form-group select,\n        .form-group textarea {\n            background: var(--light);\n            border: 1px solid var(--border);\n            border-radius: 8px;\n            color: var(--text);', css)

# Form group hover 
css = re.sub(r'color: var\(--white\);', r'color: var(--text);', css)

with open('style.css', 'w') as f:
    f.write(css)

