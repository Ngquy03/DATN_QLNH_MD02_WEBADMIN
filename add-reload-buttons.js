// Script để tự động thêm nút Reload vào tất cả Management components
const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/components/modules');
const components = [
    'MenuManagement.tsx',
    'IngredientManagement.tsx',
    'TableManagement.tsx',
    'VoucherManagement.tsx',
    'ShiftManagement.tsx',
    'SalaryManagement.tsx'
];

function addReloadButton(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);

        // Check if already has ReloadOutlined
        if (content.includes('ReloadOutlined')) {
            console.log(`⏭️  Skipped ${fileName} - already has Reload button`);
            return;
        }

        // 1. Add ReloadOutlined to imports
        if (content.includes('@ant-design/icons')) {
            // Find the import line and add ReloadOutlined
            content = content.replace(
                /from '@ant-design\/icons';/,
                (match) => {
                    // Check if it's already a multi-line import
                    const importStart = content.lastIndexOf('import {', content.indexOf(match));
                    const importEnd = content.indexOf('}', importStart);
                    const importContent = content.substring(importStart, importEnd + 1);

                    if (!importContent.includes('ReloadOutlined')) {
                        return match.replace(
                            /} from '@ant-design\/icons';/,
                            '    ReloadOutlined,\\n} from \'@ant-design/icons\';'
                        );
                    }
                    return match;
                }
            );
        }

        // 2. Find the header section and add Reload button
        // Look for pattern: <Button type="primary" ... >Thêm ...
        const buttonPattern = /(<Button\s+type="primary"[^>]*>\s*Thêm[^<]*<\/Button>)/;

        if (buttonPattern.test(content)) {
            content = content.replace(
                buttonPattern,
                `<Button
                        icon={<ReloadOutlined />}
                        onClick={fetch\\w+}
                        loading={loading}
                        size="large"
                    >
                        Tải lại
                    </Button>
                    $1`
            );
        }

        // Write back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${fileName}`);

    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
}

console.log('🚀 Adding Reload button to all Management components...\\n');

components.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (fs.existsSync(filePath)) {
        addReloadButton(filePath);
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log('\\n✅ Done!');
