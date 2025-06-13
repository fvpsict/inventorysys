// csvParse.js

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const items = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const item = {};
        
        headers.forEach((header, index) => {
            item[header] = values[index] || '';
        });
        
        items.push(item);
    }
    
    return items;
}
