# 测试流程说明

## 当前测试流程（2025-12-10 更新）

由于技术限制，本项目采用**半自动化测试流程**：

### AI 的职责

1. ✅ 实现代码功能
2. ✅ 更新 `ARCHITECTURE.md` 文档
3. ✅ 编写/更新测试用例
4. ✅ 提醒用户手动运行测试

### 用户的职责

1. 📝 在 `F:\Coding\humAInity\humainity` 目录手动运行 `npm test`
2. ✅ 查看测试结果
3. 📢 将结果反馈给 AI（通过或失败）
4. 🔧 如果失败，提供错误信息给 AI 修复

## 为什么采用手动测试？

### 技术问题

在尝试实现 AI 自动运行测试时，遇到以下无法解决的问题：

1. **进程不退出**：`npm test` 执行完成后，vitest 进程不会自动退出，导致 `run_terminal_cmd` 工具超时
2. **终端检测**：vitest 检测到交互式终端后会进入等待状态，即使使用了 `--no-watch` 参数
3. **环境限制**：Windows 环境下的 shell 语法差异导致环境变量设置困难

### 尝试过的方案

- ❌ 添加 `--no-watch` 参数
- ❌ 设置 `CI=true` 环境变量（shell 语法不兼容）
- ❌ 使用 `--reporter=tap` 非交互输出
- ❌ 在 `vitest.config.ts` 中设置 `watch: false`

所有方案都无法解决进程不退出的问题。

## 测试运行指南

### 运行测试

```powershell
# 切换到项目目录
cd F:\Coding\humAInity\humainity

# 运行所有测试
npm test
```

### 预期输出

成功的测试输出应该类似：

```
 ✓ __tests__/ChatDisplay.test.tsx (7)
 ✓ __tests__/ChatHistoryAutoHide.test.tsx (7)
 ✓ __tests__/ChopTreeFlow.test.ts (4)
 ✓ __tests__/EarIcon.test.tsx (5)
 ✓ __tests__/GameState.test.ts (4)
 ✓ __tests__/GameUI.test.tsx (7)
 ✓ __tests__/InputFocusRecovery.test.tsx (6)

 Test Files  7 passed (7)
      Tests  40 passed (40)
   Duration  2-3s
```

### 如何反馈结果

**测试通过时：**
```
测试全部通过！✅
```

**测试失败时：**
```
测试失败，错误信息如下：
[粘贴错误输出]
```

## 当前配置

### vitest.config.ts

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
    css: true,
    watch: false,  // 防止进入监视模式
    coverage: {
      enabled: false,
    },
  },
  // ... 其他配置
});
```

### package.json

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

## 优势

虽然不是完全自动化，但这个流程有以下优势：

1. ✅ **可靠性高**：避免了自动化工具的超时问题
2. ✅ **输出清晰**：使用默认 reporter，输出格式友好易读
3. ✅ **快速反馈**：测试运行时间通常只需 2-3 秒
4. ✅ **灵活控制**：用户可以选择何时运行测试
5. ✅ **问题追溯**：用户可以完整查看测试输出，便于问题定位

## 常见问题

### Q: 测试运行后卡住不动？

A: 正常现象。测试完成后，vitest 会等待用户输入。按 `q` 键退出即可。

### Q: 可以在其他终端运行测试吗？

A: 可以！在任何终端（PowerShell、CMD、Git Bash）中切换到 `humainity` 目录运行 `npm test` 都可以。

### Q: 测试失败了怎么办？

A: 将完整的错误信息复制给 AI，AI 会分析并修复问题。

### Q: 需要每次都运行测试吗？

A: 是的。这是保证代码质量的重要步骤。每次功能开发或修改后都应运行测试验证。

## 未来改进

如果找到解决进程不退出问题的方法，可以考虑：

1. 使用专门的测试运行脚本
2. 集成 CI/CD 工具（如 GitHub Actions）
3. 使用 VS Code 的测试扩展

但目前的手动流程已经足够高效可靠。

## 总结

**记住这个简单的流程：**

```
AI 完成开发 → 提醒测试 → 你运行 npm test → 反馈结果 → 完成 ✅
```

测试通常只需 2-3 秒，是确保代码质量的关键步骤！
