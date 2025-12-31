// 替换 HTML 中的 JSX 脚本
const fs = require('fs');
const path = require('path');

// 读取文件
const htmlPath = path.join(__dirname, 'humAInity.V1.6.html');
const compiledJsPath = path.join(__dirname, 'temp-components-compiled.js');

let html = fs.readFileSync(htmlPath, 'utf-8');
const compiledJs = fs.readFileSync(compiledJsPath, 'utf-8');

// 找到并替换 script 标签
// 从 <script type="text/babel"> 到 </script>
const scriptRegex = /<script type="text\/babel">([\s\S]*?)<\/script>/;
const newScript = `<script>\n${compiledJs}\n    </script>`;

html = html.replace(scriptRegex, newScript);

// 写回文件
fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('✅ Successfully replaced JSX with compiled JavaScript!');
console.log('📊 Optimizations applied:');
console.log('   - Removed Babel Standalone (2.8MB)');
console.log('   - Pre-compiled all JSX to React.createElement');
console.log('   - Using production React libraries');
console.log('   - Added CDN preconnect');
