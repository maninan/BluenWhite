import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace links
link_replacements = {
    'href="#products"': 'href="products.html"',
    'href="#customize"': 'href="customize.html"',
    'href="#about"': 'href="about.html"',
    'href="#blog"': 'href="blog.html"',
    'href="#contact"': 'href="contact.html"',
    'href="#home"': 'href="index.html"',
    'href="#" class="nav-logo"': 'href="index.html" class="nav-logo"',
}
for k, v in link_replacements.items():
    html = html.replace(k, v)

# Update nav to have a Home link if not present? It's fine without it, clicking logo is standard.
# Let's extract sections.
def extract_section(start_marker, end_marker=None):
    if end_marker:
        pattern = f"({start_marker}.*?){end_marker}"
        match = re.search(pattern, html, flags=re.DOTALL)
        if match:
            return match.group(1)
        return ""
    else:
        # Just find from start_marker to the next <!-- ════════
        idx = html.find(start_marker)
        if idx == -1: return ""
        next_idx = html.find('<!-- ════════', idx + len(start_marker))
        if next_idx == -1:
            # Maybe it's at the end
            next_idx = html.find('<!--', idx + len(start_marker))
        return html[idx:next_idx]

head_nav = html[:html.find('<!-- ════════ HERO ════════ -->')]

hero = extract_section('<!-- ════════ HERO ════════ -->', '<!-- TRUST BAR -->')
trust_bar = extract_section('<!-- TRUST BAR -->', '<!-- ════════ PRODUCTS ════════ -->')
products = extract_section('<!-- ════════ PRODUCTS ════════ -->', '<!-- ════════ FEATURES STRIP ════════ -->')
features = extract_section('<!-- ════════ FEATURES STRIP ════════ -->', '<!-- ════════ CUSTOMIZE ════════ -->')
customize = extract_section('<!-- ════════ CUSTOMIZE ════════ -->', '<!-- ════════ ABOUT ════════ -->')
about = extract_section('<!-- ════════ ABOUT ════════ -->', '<!-- ════════ BLOG ════════ -->')
blog = extract_section('<!-- ════════ BLOG ════════ -->', '<!-- ════════ CONTACT ════════ -->')
contact = extract_section('<!-- ════════ CONTACT ════════ -->', '<!-- ════════ FOOTER ════════ -->')

footer_start = html.find('<!-- ════════ FOOTER ════════ -->')
footer_tail = html[footer_start:]

# Some pages might need the modal (like products and home)
modal = extract_section('<!-- ════════ PRODUCT MODAL ════════ -->', '<script type="module" src="script.js"></script>')

# Helper to build page
def build_page(content, include_modal=False):
    page = head_nav + content
    if include_modal:
        # replace the modal section in footer_tail or add it
        # footer_tail already has modal.
        return page + footer_tail
    else:
        # Remove modal from footer tail
        ft = re.sub(r'<!-- ════════ PRODUCT MODAL ════════ -->.*?(?=<script type="module" src="script.js">)', '', footer_tail, flags=re.DOTALL)
        return page + ft

# 1. index.html - Hero, Trust bar, Features Strip maybe
index_content = hero + trust_bar + features
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(build_page(index_content, include_modal=False))

# 2. products.html - Products + features (features is good here too)
with open('products.html', 'w', encoding='utf-8') as f:
    f.write(build_page(products + "\n" + features, include_modal=True))

# 3. customize.html 
with open('customize.html', 'w', encoding='utf-8') as f:
    f.write(build_page(customize, include_modal=False))

# 4. about.html
with open('about.html', 'w', encoding='utf-8') as f:
    f.write(build_page(about, include_modal=False))

# 5. blog.html
with open('blog.html', 'w', encoding='utf-8') as f:
    f.write(build_page(blog, include_modal=False))

# 6. contact.html
with open('contact.html', 'w', encoding='utf-8') as f:
    f.write(build_page(contact, include_modal=False))

