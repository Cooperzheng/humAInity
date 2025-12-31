// 临时脚本：提取并转换 JSX
const fs = require('fs');
const path = require('path');

// 读取 HTML 文件
const htmlPath = path.join(__dirname, 'humAInity.V1.6.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// 提取 script 标签中的 JSX 代码
const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);

if (scriptMatch) {
    const jsxCode = scriptMatch[1];
    
    // 保存为临时 JSX 文件
    const jsxPath = path.join(__dirname, 'temp-components.jsx');
    fs.writeFileSync(jsxPath, jsxCode, 'utf-8');
    
    console.log('JSX code extracted successfully!');
    console.log(`Saved to: ${jsxPath}`);
    console.log(`Total lines: ${jsxCode.split('\n').length}`);
} else {
    console.error('No JSX script block found!');
}
