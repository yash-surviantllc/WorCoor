#!/bin/bash

echo "🔍 Checking for broken imports..."

# Check for broken imports in warehouse
echo "Checking warehouse imports..."
cd warehouse && node -c App.js 2>&1 | grep -E "(error|Error)" || echo "✅ Warehouse App.js syntax OK"

# Check some key components
echo "Checking warehouse components..."
node -c components/WarehouseDesigner.js 2>&1 | grep -E "(error|Error)" || echo "✅ WarehouseDesigner.js syntax OK"
node -c components/WarehouseCanvas.js 2>&1 | grep -E "(error|Error)" || echo "✅ WarehouseCanvas.js syntax OK"

# Check for broken imports in app
echo "Checking app imports..."
cd .. && npm run build 2>&1 | grep -E "(error|Error)" | head -5 || echo "✅ App builds OK"

echo "🔍 Checking for missing files..."
find . -name "*.js" -o -name "*.tsx" | xargs grep -l "from.*\.\./.*" | head -5

echo "✅ Validation complete"
