const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');

try {
    // Read the current (restored) content
    const rawBuffer = fs.readFileSync(mockDataPath);
    
    // Convert to string and strip null characters (\u0000) or other junk
    // We expect a valid UTF-8 string.
    let content = rawBuffer.toString('utf8');
    
    // Check if there's a BOM at the start (EF BB BF)
    if (content.charCodeAt(0) === 0xFEFF) {
        console.log('Detected BOM, stripping it.');
        content = content.slice(1);
    }

    // Strip null characters if any
    const originalLength = content.length;
    content = content.replace(/\0/g, '');
    if (content.length !== originalLength) {
        console.log(`Stripped ${originalLength - content.length} null characters.`);
    }

    // Ensure the structure is correct (last ] must be closed properly)
    // Sometimes scripts might cut things off in an encoding-confused way.
    if (!content.trim().endsWith('];')) {
        console.log('Warning: File does not end with ]; - looking for last ]');
        const lastBracket = content.lastIndexOf(']');
        if (lastBracket !== -1) {
            content = content.slice(0, lastBracket + 1) + ';\n';
        } else {
            console.log('Error: Could not find closing bracket! The file might be severely truncated.');
        }
    }

    // Rewrite as clean UTF-8
    fs.writeFileSync(mockDataPath, content, 'utf8');
    console.log('✅ Sanitization complete. File rewritten as clean UTF-8.');

} catch (err) {
    console.error('Error during sanitization:', err);
}
