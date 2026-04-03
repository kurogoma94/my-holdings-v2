const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

// Replace "budgetMin" with "dinnerBudgetMin"
content = content.replace(/"budgetMin":/g, '"dinnerBudgetMin":');
// Replace "budgetMax" with "dinnerBudgetMax"
content = content.replace(/"budgetMax":/g, '"dinnerBudgetMax":');

fs.writeFileSync(mockDataPath, content, 'utf8');
console.log('✅ Replaced budgetMin/budgetMax with dinnerBudgetMin/dinnerBudgetMax in MockData.ts');
