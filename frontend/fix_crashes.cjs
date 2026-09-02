const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/parth/OneDrive/Desktop/univoid/frontend/src');
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace `.charAt(0).toUpperCase()` with `.charAt(0)?.toUpperCase()`
    // Make sure it's preceded by `?` or `name` to be safe, but actually `charAt(0).toUpperCase()` is the target.
    content = content.replace(/\.charAt\(0\)\.toUpperCase\(\)/g, ".charAt(0)?.toUpperCase()");
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        changed++;
        console.log("Updated: " + file);
    }
});

console.log("Total files updated: " + changed);
