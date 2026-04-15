import json

with open('package.json', 'r') as f:
    data = json.load(f)

if 'dependencies' not in data:
    data['dependencies'] = {}

deps_to_add = {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.0"
}

data['dependencies'].update(deps_to_add)

if 'scripts' not in data:
    data['scripts'] = {}
data['scripts']['server'] = "node server.js"

with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)

