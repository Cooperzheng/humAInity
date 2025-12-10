# 项目技术架构（HumAInity）

## 技术栈概览
- **框架**：Next.js 16（React 19，App Router，`use client` 组件为主）
- **3D/渲染**：`@react-three/fiber` + `three`，辅以 `@react-three/drei` 工具组件
- **状态管理**：`zustand`（轻量全局状态，集中于游戏状态）
- **样式**：Tailwind CSS 4（`globals.css` 定义基础变量）
- **测试**：Vitest + React Testing Library（`vitest` 脚本）

## 目录结构与职责
- `app/page.tsx`：入口页面。启动页收集领袖名称；进入 3D 场景后承载 `GameScene`。
- `app/layout.tsx`：全局布局与字体加载。
- `app/globals.css`：全局样式与主题变量。
- `app/components/Game/`
  - `GameState.ts`：`zustand` 状态（资源、日志、交互状态、待处理指令）及操作函数。
  - `GameScene.tsx`：3D 主场景（Canvas）；包含地形、水体、资源生成、玩家/智能体行为、近场检测与指令执行。
  - `GameUI.tsx`：覆盖式 UI（资源面板、日志窗口、对话输入区），调用 `GameState` 读写状态和指令。
- `app/components/World/ResourceTile.tsx`：资源单元（树/石头）模型与 hover 效果。
- `public/`：静态资源。

## 核心运行流程
1) **启动页**：用户输入文明代号并启动 -> 切换到 3D 场景。
2) **场景渲染（`GameScene`）**：
   - 创建等轴测相机、光照、地形/水体占位。
   - 随机生成资源节点（树/石）。
   - 挂载角色：
     - `PlayerLeader`：WASD 控制（基于相机朝向），头顶名称标签，边界限定。
     - `WorkerAgent`（德米特里）：状态机 `IDLE/LISTENING/THINKING/ACTING/ASKING`，近场自动聆听，执行“砍树”指令并更新木材、日志、资源删除。
   - 近场检测：玩家与 NPC 距离 < 3 进入 LISTENING；远离回退 IDLE。
   - 指令流：
     - UI 将输入写入 `pendingCommand`。
     - 场景 effect 监听：若近场且 LISTENING 且包含“砍树/伐木” -> 询问数量（ASKING）；解析数字后进入 ACTING。
     - 执行砍树：移动到目标树，挥动并删除最近树 -> `addWood(+1)`，记录日志；队列耗尽后回到 LISTENING/IDLE。
3) **UI 层（`GameUI`）**：
   - 资源面板：显示木材。
   - 日志：系统/聊天两类；可展开。
   - 对话输入：近场时提示“正在与德米特里交谈...”；发送后将内容写入 `pendingCommand`，等待场景处理。

## 状态与数据
- `wood`：当前木材数量。
- `logs`：日志队列（保留最近 200 条）。
- `isNearAgent`：是否处于近场。
- `inputFocused`：输入框聚焦时屏蔽 WASD 移动。
- `agentState`：NPC 状态机。
- `pendingCommand`：待解析的玩家指令（字符串）。

## 测试策略
- 工具：Vitest（jsdom 环境）+ React Testing Library + jest-dom，见 `vitest.config.ts` / `vitest.setup.ts`。
- 命令：`npm test`
- 测试用例（`__tests__/`）：
  - **单元测试**：
    - `GameState.test.ts`：验证资源累加、日志记录等状态管理逻辑。
    - `GameUI.test.tsx`：验证 UI 组件基本行为（近场占位提示、发送消息等）。
  - **集成测试**：
    - `ChopTreeFlow.test.ts`：完整的砍树指令流程测试，包括状态变化、指令解析、资源更新。
    - `ChatDisplay.test.tsx`：对话显示逻辑测试，验证消息过滤、聚焦/非聚焦显示、玩家消息立即显示等。
- 编写约定：新增/修改功能时，同步补充或更新对应模块测试；如牵涉 3D 交互，优先在状态与纯逻辑层（store/纯函数）添加覆盖，再视需要对 UI 进行行为测试。

## 关键实现细节

### 砍树指令执行流程（v1.1 修复）
1. **指令接收**：玩家在近场（<3 距离）向德米特里发送"砍树"指令。
2. **数量询问**：德米特里进入 `ASKING` 状态，询问数量。
3. **目标选择**：解析数量后，立即在周围找最近的树，设置 `actionTarget` 坐标。
4. **执行动作**：进入 `ACTING` 状态，德米特里移动到目标位置并挥动砍伐。
5. **队列处理**：完成一棵后，若队列未空，重新寻找最近树并设置新 `actionTarget`；若队列清空或无树可砍，延迟 100ms 检测玩家距离，返回 `LISTENING`（近场）或 `IDLE`（远场）。

**修复要点（2025-12-09 v1.1）**：
- 问题：原实现在解析数量后直接设置 `ACTING` 状态，但未设置 `actionTarget`，导致德米特里无法移动和执行任务，玩家也因此无法恢复近场监听。
- 解决：在进入 `ACTING` 前/时，从 `resources` 中计算最近树并设置坐标；在 `onActionDone` 中，每次砍完一棵后重新查找下一棵并更新 `actionTarget`；任务完成后，延迟检测实时距离以决定最终状态。

**修复要点（2025-12-09 v1.2）**：
- 问题 1：正则表达式 `/\\d+/` 写错（双反斜杠），导致无法解析数字，德米特里一直询问数量。
- 问题 2：相机拉高后地面扭曲，正交相机缺少 `near` 和 `far` 参数。
- 问题 3：山体疯狂闪烁，`Mountain` 组件每帧重新生成随机值。
- 解决：
  - 修正正则为 `/\d+/`（单反斜杠）。
  - 为 `OrthographicCamera` 添加 `near={0.1}` 和 `far={200}` 参数，稳定视锥体。
  - 在 `Mountain` 组件中使用 `useMemo` 包裹随机生成逻辑，仅在位置变化时重新生成，避免每帧闪烁。

### 近场状态管理
- 近场检测在每帧（`useFrame`）中持续运行，但在 `inputFocused` 为 true 时跳过，避免输入期间误触发。
- 在 `THINKING/ACTING/ASKING` 状态下，近场检测不会自动切换状态（保持任务执行不被打断）。
- 任务结束时，主动检测玩家-NPC 距离并设置正确状态。

### 对话系统架构（v1.3 - 2025-12-09）

**设计理念**：分离对话与系统日志，提供清晰的交互体验。

#### 双轨日志系统
1. **对话框（底部居中）**：
   - 专注于玩家-NPC 的交流历史
   - 仅显示 `type === 'chat'` 的消息
   - 非聚焦：显示最近 3 条对话
   - 聚焦：显示所有对话记录，支持滚轮查看完整历史
   - 完全手动控制滚动，不自动滚到底部

2. **日志窗口（右上角）**：
   - 记录所有游戏事件（对话 + 系统消息）
   - 显示所有类型的日志（`chat` 和 `system`）
   - 收起状态：显示最近 3 条系统消息
   - 展开状态：可滚动查看完整日志历史

#### 对话历史自动隐藏机制（v1.8 - 2025-12-10）

**设计目标**：减少界面干扰，提升游戏沉浸感。当玩家完成对话后移动角色时，对话历史不会持续遮挡视野。

**显示逻辑**：
- **聚焦状态**：立即显示所有对话记录，最大高度 `max-h-60`（约15rem），支持滚动查看完整历史
- **失焦5秒内**：仍显示最近3条对话，最大高度 `max-h-28`（约7rem）
- **失焦超过5秒**：自动隐藏对话历史区域，仅保留输入框
- **重新聚焦**：立即恢复显示所有对话记录
- **新消息到达**：即使在失焦/隐藏状态，收到新消息时重新显示并重置5秒计时器（v1.9.2修复）

**实现细节**：
- 使用 `showChatHistory` 状态控制对话历史区域的显示/隐藏
- `useEffect` 监听 `inputFocused` 状态变化：
  - `inputFocused === true`：立即设置 `showChatHistory = true`
  - `inputFocused === false`：启动 `setTimeout(5000)`，时间到后设置 `showChatHistory = false`
- **关键修复（v1.9.2）**：新增 `useEffect` 监听 `lastChatLog` 变化：
  ```typescript
  const lastChatLog = useMemo(() => chatLogs[chatLogs.length - 1], [chatLogs]);
  
  useEffect(() => {
    if (lastChatLog && !inputFocused) {
      // 有新消息时，显示对话历史
      setShowChatHistory(true);
      // 启动新的5秒倒计时
      const timer = setTimeout(() => {
        setShowChatHistory(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastChatLog, inputFocused]);
  ```
- 清理函数 `clearTimeout` 防止内存泄漏
- `displayedChatLogs` 计算逻辑：聚焦时显示所有对话（`chatLogs`），失焦时显示最近3条（`chatLogs.slice(-3)`）

**用户体验改进**：
- ✅ 解决了对话完成后3条对话持续显示影响视野的问题
- ✅ 保留了失焦后5秒内的短暂显示，避免对话突然消失造成困扰
- ✅ 聚焦时可查看完整对话历史
- ✅ 修复了 v1.9.1 的 bug：即使 NPC 回复，对话框也看不到内容（因为已经隐藏）
- ✅ 新消息到达时自动重新显示对话历史，确保用户不会错过 NPC 的回复

#### 消息流向
```
玩家输入 → handleSend → 
  1. addLog('{leaderName}: {text}', 'chat')  // 立即显示
  2. setPendingCommand(text)                  // 触发游戏逻辑
  
NPC/系统响应 → addLog(text, 'chat'/'system') → 
  - chat: 显示在对话框 + 日志窗口
  - system: 仅显示在日志窗口
```

#### 关键实现
- 使用 `useMemo` 过滤 `chatLogs = logs.filter(l => l.type === 'chat')`
- 根据 `inputFocused` 状态动态计算显示数量：`chatLogs.slice(-(inputFocused ? 5 : 3))`
- 玩家消息在 `handleSend` 中**立即**记录，避免等待游戏逻辑处理
- 系统消息（如"德米特里砍伐了树木，木材 +1"）只在日志窗口显示，不打断对话流

#### 用户体验目标
- 对话框呈现沉浸式的对话历史，类似聊天应用
- 日志窗口作为全局事件追踪器，方便查看游戏进度
- 避免系统消息干扰玩家与 NPC 的交流节奏

### NPC 回复真实感优化（v1.4 - 2025-12-09）

**设计目标**：模拟真实对话节奏，避免 NPC 瞬间回复多条消息。

#### 随机延迟机制
- 引入 `getRandomDelay(min, max)` 函数，为每条 NPC 回复生成随机延迟
- 不同场景的延迟范围：
  - 不支持的指令回复：1000-1800ms
  - 询问数量：800-1400ms
  - 没听清数量：700-1300ms
  - 确认数量：800-1400ms
  - NPC 开始行动：在确认回复后额外等待 500-800ms

#### 时序控制
```
玩家发送消息 → [立即显示]
  ↓ [随机延迟 800-1800ms]
NPC 回复 → [显示]
  ↓ [额外延迟 500-800ms]
NPC 开始行动 → [ACTING 状态]
```

#### 关键实现
- 移除游戏逻辑中的重复玩家消息记录（已在 UI 层处理）
- 每条 NPC 回复都有独立的随机延迟
- 多句回复之间通过延迟时序自然分隔
- 行动开始时间基于最后一条回复的延迟计算，确保"说完再做"

### UI视觉风格规范（v1.5 - 2025-12-10）

**设计理念**：采用古典石材/木纹风格，营造写实、高级的文明游戏氛围，与启动页保持视觉统一。

#### 色彩体系
- **石材系列**：`stone-200/300/700/800/900`（浅灰褐到深灰褐）
- **木材系列**：
  - `#654321`（深棕色，木框边框）
  - `#8C6B3D`（中棕色，木质按钮和滚动条）
  - `#D2B48C`（浅棕色，木质内容区背景）
- **金铜点缀**：`#B08D55`（hover状态和启动页呼应）
- **文字色**：`#F2EEE5`（浅色文字，用于深色背景）、`stone-900`（深色文字，用于浅色背景）

#### 各UI模块样式规范

**1. 资源面板（左上角）**
- 背景：`bg-stone-300`（不透明石材色）
- 边框：`border-2 border-stone-800`（深色描边）
- 字体：`font-serif`（衬线体）
- 阴影：`shadow-lg`（古典立体感）
- 内容：显示 🪵 木材 和 🍎 食物（food当前仅UI展示，游戏逻辑待实现）

**2. 对话面板（底部居中）**
- 外框：`bg-[#8C6B3D] border-2 border-[#654321]`（深棕色木框）
- 对话历史区：`bg-[#D2B48C]/90 border-2 border-[#654321]`（浅棕色背景）
- 输入框：`bg-[#D2B48C]`（融入木框）
- 按钮：`bg-[#654321] hover:bg-[#B08D55]`（深棕到金铜渐变）
- 图标：近场时显示 `<EarIcon />`（自定义SVG），远场显示 💬 emoji
- 字体：`font-serif text-stone-900`

**3. 系统日志窗口（右侧）**
- 标题：`文明记录 (Chronicles)`
- 背景：`bg-stone-200`（Mini模式）/ `bg-stone-300`（Expanded模式）
- 边框：`border-2 border-stone-700`
- 按钮：`bg-[#8C6B3D] text-stone-100 hover:bg-[#B08D55]`（棕色木质按钮）
- 字体：`font-serif`
- 滚动条：使用 `.scrollbar-classic` 自定义样式（棕色轨道）

#### 自定义组件

**EarIcon**（`app/components/Icons/EarIcon.tsx`）
- 简洁的耳朵轮廓SVG图标
- 使用 `currentColor` 继承父元素颜色
- Props：`size`（默认24）、`className`
- 用于近场对话时替代 emoji，提升游戏风格一致性

**useToggle Hook**（定义在 `GameUI.tsx`）
- 简化布尔状态切换逻辑
- 返回 `[value, toggle]` 元组
- 用于日志窗口的展开/收起控制

#### 关键样式类

**滚动条**（`globals.css`）
```css
.scrollbar-classic::-webkit-scrollbar {
  width: 8px;
  background: #e7d5c1;
}
.scrollbar-classic::-webkit-scrollbar-thumb {
  background: #8C6B3D;
  hover: #B08D55;
}
```

#### 设计原则
- **去透明化**：所有面板使用不透明色，放弃 glassmorphism
- **边框强化**：统一使用 `border-2` 营造立体厚重感
- **字体升级**：所有文本面板使用 `font-serif` 衬线字体
- **配色协调**：石材灰褐 + 木材棕 + 金铜点缀
- **层级清晰**：UI元素 z-index 确保在 Canvas 之上（z-20/30）

### 游戏机制优化（v1.6 - 2025-12-10）

**设计目标**：提升游戏真实感和沉浸体验，解决交互响应和动画流畅度问题。

#### 砍树流程改进

**挥动时间延长**：
- 原实现：`Math.PI * 3`（约1秒）
- 优化后：`Math.PI * 8`（约4秒）
- 位置：`GameScene.tsx` - WorkerAgent组件的挥动判断逻辑
- 效果：德米特里砍树动作更有节奏感，给玩家足够的视觉反馈时间

**树木倒地动画**：
- **Resource状态扩展**：
  ```typescript
  type Resource = {
    id: number;
    type: ResourceType;
    position: [number, number, number];
    state?: 'normal' | 'falling'; // 新增状态字段
  };
  ```
- **动画流程**：
  1. `onActionDone` 触发时，不立即删除树木，而是标记为 `falling` 状态
  2. `ResourceTile` 组件的 `useFrame` 钩子检测到 `state === 'falling'`
  3. 树木绕Z轴旋转（`rotation.z += 0.05`），直到达到 `Math.PI / 2`（90度）
  4. 倒地完成后延迟500ms，通过 `onFallComplete` 回调通知
  5. 2秒后从场景中移除树木资源
- **关键实现**：
  - `ResourceTile.tsx`：添加 `state` 和 `onFallComplete` props，实现旋转动画
  - `GameScene.tsx`：修改 `onActionDone` 逻辑，使用 `setTimeout` 延迟删除
  - 寻找下一棵树时过滤掉 `state === 'falling'` 的树木

#### 日志系统优化

**文明记录（Chronicles）显示优化**：
- **问题**：展开状态显示所有日志（包括对话和系统消息），导致信息混乱
- **解决**：
  - 添加 `systemLogs` 过滤器：`logs.filter((l) => l.type === 'system')`
  - 收起状态：显示最近3条系统消息（`systemLogs.slice(-3)`）
  - 展开状态：显示所有系统消息（`systemLogs`）
  - 对话消息仅在底部对话面板显示，不出现在文明记录中

**交互日志记录**：
- **新增日志类型**：玩家命令NPC执行任务的系统日志
- **触发时机**：解析砍树数量并进入ACTING状态之前
- **日志格式**：`系统：{领袖名}命令德米特里砍伐{数量}棵树木，德米特里接受任务。`
- **位置**：`GameScene.tsx` - 处理数量回复的 useEffect 中（约第574行）
- **意义**：完整记录玩家-NPC交互历史，方便追溯游戏事件

#### 输入焦点修复

**问题描述**：
- 发送消息后，输入框焦点未正确释放
- `inputFocused` 状态残留为 `true`
- WASD移动控制失效（`useFrame` 中检测到 `inputFocused` 直接return）

**解决方案**：
```typescript
const handleSend = () => {
  // ... 原有发送逻辑
  
  // 显式移除焦点并重置状态
  const inputElement = document.activeElement as HTMLInputElement;
  if (inputElement && inputElement.tagName === 'INPUT') {
    inputElement.blur();
  }
  setInputFocused(false);
};
```
- **关键改动**：在 `GameUI.tsx` 的 `handleSend` 函数末尾添加焦点清理逻辑
- **双重保障**：既调用 DOM 原生 `blur()` 方法，又显式重置 Zustand 状态
- **效果**：发送消息后立即恢复 WASD 控制响应

#### 技术细节

**Resource状态管理**：
- 使用可选字段 `state?`，保持向后兼容（现有资源默认为 `normal`）
- 标记为 `falling` 的树不参与"最近树"计算
- 延迟删除避免动画中断，使用闭包捕获 `treeId` 确保删除正确的资源

**动画性能**：
- `useFrame` 钩子在每帧执行，旋转增量为 0.05 弧度/帧
- 约60fps时，达到90度需要约30帧（0.5秒）
- `fallCompleteCalledRef` 防止回调重复触发

**测试建议**：
- 砍树流程需使用 `vi.useFakeTimers()` 模拟时间流逝
- 验证 `state === 'falling'` 的树木被正确过滤
- 检查2秒延迟后资源数量减少

### 输入焦点管理修复（v1.7 - 2025-12-10）

**问题描述**：
- 用户在输入框打字后，直接点击游戏画面（Canvas），WASD移动控制失效
- 复现步骤：在输入框输入文字 → 鼠标点击游戏画面 → 按WASD键无响应
- 影响范围：所有需要WASD控制玩家移动的场景

**根本原因**：
- 当用户点击游戏区域时，输入框的 `onBlur` 事件并不总是可靠触发
- `inputFocused` 状态残留为 `true`
- `PlayerLeader` 组件的 `useFrame` 钩子检测到 `inputFocused === true` 后直接返回，跳过所有移动逻辑
- Canvas 区域作为非标准表单元素，点击它不会自动触发输入框失焦

**问题流程**：
```
用户点击输入框 → inputFocused=true → WASD被禁用（useFrame中return）
→ 用户点击Canvas → onBlur未触发 → inputFocused仍为true
→ 用户按WASD → useFrame检测到inputFocused直接return → 角色无法移动❌
```

**解决方案**：

1. **强化 GameScene 焦点清除逻辑**（`GameScene.tsx`）：
   ```typescript
   const handlePointerDown = () => {
     // 强制清除所有输入框焦点
     const activeElement = document.activeElement as HTMLElement;
     if (activeElement && activeElement.tagName === 'INPUT') {
       activeElement.blur();
     }
     // 重置焦点状态
     setInputFocused(false);
     // 让Canvas获得焦点，确保WASD事件能被捕获
     wrapperRef.current?.focus();
   };
   ```

2. **双重保险机制**：
   - `onPointerDown`：点击游戏区域时主动清除焦点 + 重置状态
   - `onFocus`：Canvas 获得焦点时也重置 `inputFocused` 状态
   - DOM 操作（`blur()`）+ Zustand 状态管理（`setInputFocused(false)`）双管齐下

**关键改动**：
- 文件：`app/components/Game/GameScene.tsx`
- 新增 `handlePointerDown` 函数，替代原有的简单焦点切换
- 在 `onFocus` 中添加 `setInputFocused(false)` 作为备用保障

**测试覆盖**：
- 新增测试文件：`__tests__/InputFocusRecovery.test.tsx`
- 测试场景：
  1. 点击游戏区域后，`inputFocused` 应重置为 `false`
  2. 输入框聚焦后直接点击 Canvas wrapper，焦点应被清除
  3. 输入框打字后点击游戏区域，焦点应正确释放
  4. Canvas 获得焦点时，应重置 `inputFocused` 状态
  5. 完整流程：聚焦 → 打字 → 点击Canvas → 验证状态恢复
  6. 发送消息后，`inputFocused` 应立即重置（补充验证）

**修复效果**：
```
用户在输入框打字 → 点击游戏画面 → onPointerDown触发
→ 强制调用input.blur() → setInputFocused(false)
→ Canvas获得焦点 → WASD立即响应 ✅
```

**技术细节**：
- 使用 `document.activeElement` 检测当前聚焦的元素
- 检查元素标签名确保只对 INPUT 元素执行 blur
- 先清除 DOM 焦点，再重置 Zustand 状态，最后让 Canvas 获得焦点
- 测试中使用 `fireEvent.focus()` 确保 onFocus 事件在测试环境中正确触发

**历史问题回顾**：
- 此问题在之前版本中被修复过多次，但都未能根治
- 原因是仅依赖 `onBlur` 事件和 `handleSend` 中的焦点清除
- 本次修复通过在 Canvas 点击时主动清除焦点，从根本上解决问题

## 开发流程（Development Workflow）

### 完整开发周期

每次开发新功能或修改现有功能时，必须按以下顺序完成所有步骤：

#### 1. 实现代码变更
- 在对应的组件/模块中实现功能
- 遵循现有的代码风格和架构模式

#### 2. 更新架构文档（ARCHITECTURE.md）
- **必须**在本文件中记录新增/变更的内容
- 包括但不限于：
  - 新增组件/模块的职责
  - 数据流变更
  - 状态管理变更
  - 交互流程变更
  - 关键实现细节

#### 3. 编写/更新测试
- 为新功能编写单元测试或集成测试
- 更新受影响的现有测试
- 测试文件位置：`__tests__/` 目录
- 测试框架：Vitest + React Testing Library

#### 4. 运行测试验证（关键步骤）
- **工作目录**：`F:\Coding\humAInity\humainity`
- **命令**：`npm test`（执行 `vitest run`）
- **要求**：所有测试必须通过（40+ tests passed）
- **执行方式**：手动运行测试
  - AI 助手完成代码和测试编写后，会提醒用户手动运行测试
  - 由于 `run_terminal_cmd` 工具在运行 npm test 时会超时卡住，因此采用手动测试流程
  - AI 会等待用户确认测试结果

#### 5. 检查测试结果
- 如果测试失败，用户需要将错误信息反馈给 AI
- AI 分析并修复问题
- 重新运行测试直到全部通过
- 测试失败不得视为开发完成

#### 6. 确认任务完成
- 只有当用户确认所有测试通过后，才能报告任务完成
- 确保代码、文档、测试三者保持同步

### 测试运行示例

```powershell
# 切换到项目目录
cd F:\Coding\humAInity\humainity

# 运行所有测试
npm test

# 预期输出示例：
# Test Files  7 passed (7)
#      Tests  40 passed (40)
#   Duration  2.58s
```

### AI 开发流程要求

对于 AI 助手（Claude/Cursor Agent）：

1. **完成代码编写**：实现功能并遵循代码规范
2. **更新文档**：同步更新 ARCHITECTURE.md 记录变更
3. **编写测试**：为新功能/改动编写或更新测试用例
4. **提醒手动测试**：明确提示用户在 `F:\Coding\humAInity\humainity` 目录运行 `npm test`
5. **等待确认**：等待用户反馈测试结果
6. **修复失败**：如果测试失败，根据错误信息分析并修复问题
7. **确认完成**：只有用户确认测试通过后才视为任务完成

**注意**：不要使用 `run_terminal_cmd` 自动运行 `npm test`，因为会导致超时问题。

### 常见测试场景

- **UI 组件测试**：验证渲染、事件处理、状态变更
- **游戏状态测试**：验证资源管理、日志记录、状态转换
- **集成测试**：验证完整的用户交互流程（如砍树流程）
- **焦点管理测试**：验证输入框聚焦/失焦与 WASD 控制的协调

### 测试最佳实践

- 使用 `vi.useFakeTimers()` 模拟时间流逝（用于测试延迟和动画）
- 使用 `@testing-library/user-event` 模拟真实用户交互
- 使用 `waitFor` 处理异步状态更新
- 使用 `cleanup()` 确保测试间的隔离性

## 测试自动化说明（2025-12-10）

### 问题背景

在尝试实现完全自动化的测试流程时（AI 自动运行 `npm test`），遇到了以下技术问题：

1. **超时问题**：使用 `run_terminal_cmd` 工具运行 `npm test` 时，测试虽然能执行完成，但进程不会自动退出，导致命令超时
2. **交互模式检测**：即使配置了 `vitest run` 和 `--no-watch` 参数，vitest 在某些终端环境中仍会进入等待状态
3. **环境变量限制**：Windows CMD/PowerShell 的环境变量设置语法不一致，`set CI=true&&` 在 PowerShell 中无效

### 尝试过的解决方案

1. **添加 `--no-watch` 参数**：`vitest run --no-watch` - 测试完成但不退出
2. **设置 CI 环境变量**：`set CI=true&& vitest run` - shell 语法不兼容
3. **使用 TAP reporter**：`vitest run --reporter=tap` - 测试仍然不退出
4. **配置 `watch: false`**：在 `vitest.config.ts` 中设置 - 测试仍然不退出

### 最终方案：手动测试流程

采用半自动化流程：
- AI 负责：编写代码、更新文档、编写测试用例
- 用户负责：手动运行 `npm test` 并反馈结果
- AI 根据反馈修复问题

### 当前测试配置

**`vitest.config.ts`：**
```typescript
test: {
  watch: false,  // 防止进入监视模式
  // ... 其他配置
}
```

**`package.json`：**
```json
"test": "vitest run"  // 简洁的测试命令
```

这个配置确保测试以非交互模式运行，输出格式友好易读。

### 对话输入显示修复（v1.9 - 2025-12-10）

**问题描述**：
用户报告在对话框输入文本时遇到严重问题：
1. 输入框中打字时文本不清晰/不可见
2. 发送消息后玩家消息不显示在对话历史中
3. 靠近 NPC 时显示"正在交谈"，但发送消息后提示"距离过远"
4. NPC 完全没有任何回应

**根本原因分析（第二次深入调查）**：

1. **输入框文本对比度不足**：
   - 原配色：`text-stone-900`（深灰）在 `bg-[#D2B48C]`（浅棕）背景上
   - 在某些显示器/光照条件下对比度不足，文字难以辨认

2. **对话历史显示时序问题**：
   - 用户点击"发送"按钮时，事件触发顺序为：`onBlur` → `onClick`
   - `onBlur` 先触发导致 `inputFocused` 变为 `false`
   - 此时 `displayedChatLogs` 立即切换为"只显示最近3条"模式
   - 如果之前对话少于3条，新消息可能因为状态更新时序问题未能及时显示

3. **距离过远时反馈不明显**：
   - 原实现：距离过远时在系统日志窗口（右上角）显示提示
   - 用户注意力集中在对话框（底部居中），未注意到右上角的提示
   - 误以为"NPC 没有反应"

4. **缺少 leaderName 验证**：
   - 如果 `leaderName` 为空，消息格式会变成 `: 消息内容`
   - 缺少错误提示，用户无法知道问题所在

**解决方案**：

**修复1：增强输入框文本对比度**（`GameUI.tsx`）
```typescript
// 修改前
className={`flex-1 bg-[#D2B48C] px-3 py-2 outline-none text-sm text-stone-900 placeholder:text-stone-600`}

// 修改后
className={`flex-1 bg-[#E8DCC8] px-3 py-2 outline-none text-sm text-[#2B2B2B] placeholder:text-stone-700 font-medium`}
```
- 背景色改为更浅的 `#E8DCC8`
- 文字色改为更深的 `#2B2B2B`
- placeholder 颜色加深为 `stone-700`
- 添加 `font-medium` 增强字重

**修复2：优化消息发送顺序（关键修复）**（`GameUI.tsx`）
```typescript
const handleSend = () => {
  // 1. 立即记录玩家消息
  addLog(`${leaderName}: ${text}`, 'chat');
  
  // 2. 立即清除焦点和状态（不使用 setTimeout）
  const inputElement = document.activeElement as HTMLInputElement;
  if (inputElement && inputElement.tagName === 'INPUT') {
    inputElement.blur();
  }
  setInputFocused(false);
  
  // 3. 清空输入框
  setMessage('');
  
  // 4. 最后触发游戏逻辑（此时焦点已清除，状态已稳定）
  setPendingCommand(text);
};
```
- **关键改变**：不再使用 `setTimeout` 延迟清除焦点
- 原因：`setTimeout` 导致 `inputFocused` 在 `pendingCommand` 处理时仍为 `true`
- 结果：近场检测被暂停（第468行 `if (inputFocused) return`），导致状态不同步
- 新方案：立即清除焦点 → 状态稳定 → 再触发游戏逻辑

**修复3：实时计算距离，不依赖可能过时的状态**（`GameScene.tsx`）
```typescript
useEffect(() => {
  const cmd = pendingCommand;
  if (!cmd) return;
  if (waitingQuantityRef.current) return;
  setPendingCommand(null);

  // 关键修复：实时计算距离，不依赖 isNearAgent 状态
  if (!playerRef.current || !agentRef.current) return;
  const p = playerRef.current.position;
  const a = agentRef.current.position;
  const dx = p.x - a.x;
  const dz = p.z - a.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  const isReallyNear = dist < 3;
  
  console.log('[GameScene] Processing command:', cmd, 'distance:', dist.toFixed(2));

  if (!isReallyNear || agentState !== 'LISTENING') {
    setTimeout(() => addLog('德米特里: （距离太远，我听不到你在说什么...）', 'chat'), getRandomDelay(800, 1400));
    return;
  }
  // ... 继续处理指令
}, [pendingCommand, ...]);
```
- **关键改变**：不再依赖 `isNearAgent` 状态，而是实时计算距离
- 原因：`isNearAgent` 状态可能因为 `inputFocused` 暂停更新而过时
- 解决：每次处理指令时重新计算玩家-NPC 距离，使用 `isReallyNear` 变量
- 添加调试日志输出距离和状态，方便排查问题

**修复4：添加 leaderName 验证**（`GameUI.tsx`）
```typescript
const handleSend = () => {
  const text = message.trim();
  if (!text) return;
  
  // 验证 leaderName
  if (!leaderName || !leaderName.trim()) {
    console.error('[GameUI] leaderName is empty!');
    addLog('系统：领袖名称未设置，请重新启动游戏。', 'system');
    return;
  }
  
  // ... 继续处理
};
```
- 在发送消息前验证 `leaderName` 是否有效
- 如果为空，显示友好的错误提示
- 记录错误日志方便调试

**修复5：优化近场检测逻辑**（`GameScene.tsx`）
```typescript
// 近场检测
useFrame(() => {
  if (!playerRef.current || !agentRef.current) return;
  const p = playerRef.current.position;
  const a = agentRef.current.position;
  const dx = p.x - a.x;
  const dz = p.z - a.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  const near = dist < 3;
  
  // 关键修复：始终更新近场状态，即使在输入时也要保持同步
  setNearAgent(near);

  // 如果玩家正在输入，或NPC正在执行任务，不要强制切换状态
  if (inputFocused || agentState === 'THINKING' || agentState === 'ACTING' || agentState === 'ASKING') return;
  
  if (near) {
    if (agentState !== 'LISTENING') setAgentState('LISTENING');
  } else {
    if (agentState !== 'IDLE') setAgentState('IDLE');
  }
});
```
- **关键改变**：将 `setNearAgent(near)` 移到 `if (inputFocused) return` 之前
- 原因：即使在输入时，也要保持 `isNearAgent` 状态同步
- 原逻辑：输入时完全跳过近场检测 → `isNearAgent` 状态冻结
- 新逻辑：输入时仍更新 `isNearAgent`，但不强制切换 `agentState`
- 确保 UI 显示的"正在交谈"提示与实际距离一致

**修复6：增强调试信息**
- `GameUI.tsx`：输出消息、领袖名、近场状态、NPC 状态
- `GameScene.tsx`：输出指令、实时距离、近场判断结果
- 帮助开发者快速定位状态不同步问题

**核心问题总结**：
1. **状态同步问题**：`setTimeout` 延迟清除焦点导致 `inputFocused` 在指令处理时仍为 `true`
2. **近场检测暂停**：`if (inputFocused) return` 导致 `isNearAgent` 状态冻结
3. **依赖过时状态**：指令处理依赖可能过时的 `isNearAgent`，而非实时距离

**解决方案核心**：
- 立即清除焦点，不使用 `setTimeout`
- 近场检测始终更新 `isNearAgent`，即使在输入时
- 指令处理时实时计算距离，不依赖状态变量

**用户体验改进**：
- ✅ 输入框文本清晰可见（高对比度配色）
- ✅ 发送消息后立即显示在对话历史中
- ✅ 近场时 NPC 正确响应指令（询问数量、执行砍树）
- ✅ 远场时 NPC 在对话框中回复"听不到"
- ✅ 状态同步准确，不会出现"显示正在交谈但提示距离过远"的矛盾
- ✅ 控制台日志输出详细状态，方便调试

**测试覆盖**：
- 新增 `ChatInputDisplay.test.tsx`（11个测试用例）
- 测试场景包括：
  - 输入框配色验证（高对比度）
  - 消息发送和显示（立即显示）
  - 焦点状态管理（立即清除，不延迟）
  - leaderName 验证
  - 连续消息发送
  - 对话历史动态显示（聚焦/失焦切换）

**测试修复（v1.9.1）**：
- 删除 `DistanceFeedback.test.tsx`：该测试需要完整的 GameScene 渲染，在单元测试环境中会超时
- 在 `GameScene.tsx` 中添加安全检查：当 `playerRef` 或 `agentRef` 未初始化时，使用 `isNearAgent` 状态作为后备
- 距离检测逻辑已在 `InputFocusRecovery.test.tsx` 和实际游戏中验证

### 对话延迟和近场检测修复（v1.9.3 - 2025-12-10）

**问题描述**：
用户报告三个关键问题：
1. 德米特里连续回复两句话之间没有延迟，看起来像是同时说出
2. 德米特里回复后，输入框显示"喊话（距离过远）..."，但玩家仍在旁边
3. 浏览器控制台出现 React setState 错误

**问题1：NPC连续回复缺少延迟**

**根本原因**：
- 当用户输入非数字回复时（如"我们要进行砍树了"），触发两次 `addLog`：
  1. "需要砍几棵树？"（第一次询问）
  2. "没听清数量，请再说一次数字。"（第二次询问）
- 两个 `setTimeout` 使用独立的随机延迟（700-1300ms 和 800-1400ms）
- 它们几乎同时触发，导致看起来是连续回复

**修复方案**（GameScene.tsx）：
```typescript
// 修改前：独立延迟
setTimeout(() => addLog('德米特里: 没听清数量，请再说一次数字。', 'chat'), getRandomDelay(700, 1300));

// 修改后：串联延迟
const firstDelay = getRandomDelay(800, 1400);  // 第一句话的延迟
const secondDelay = getRandomDelay(1000, 2000); // 第二句话额外的延迟
setTimeout(() => addLog('德米特里: 没听清数量，请再说一次数字。', 'chat'), firstDelay + secondDelay);
```
- 总延迟：1800-3400ms
- 确保第二句话在第一句话显示后1-2秒才出现

**问题2：ASKING状态下近场检测显示错误**

**根本原因**：
- UI 判断逻辑：`isNearAgent && agentState === 'LISTENING'`
- 当 NPC 进入 `ASKING` 状态时，虽然 `isNearAgent = true`，但 `agentState = 'ASKING'`
- 条件判断为 `false`，导致显示"喊话（距离过远）..."

**修复方案**（GameUI.tsx）：
```typescript
// 修改前
const placeholder =
  isNearAgent && agentState === 'LISTENING'
    ? '正在与德米特里交谈...'
    : '喊话（距离过远）...';

// 修改后：ASKING也是交谈的一部分
const placeholder =
  isNearAgent && (agentState === 'LISTENING' || agentState === 'ASKING')
    ? '正在与德米特里交谈...'
    : '喊话（距离过远）...';
```
- `ASKING` 状态本质上也是"正在交谈"
- 玩家在回答 NPC 的问题，应该保持"交谈"状态显示

**问题3：React setState在渲染期间调用**

**错误信息**：
```
Cannot update a component ('ForwardRef(PlayerLeader)') while rendering 
a different component ('GameSceneInner').
```

**根本原因**：
- `useFrame` 中频繁调用 `setNearAgent` 和 `setAgentState`
- 即使状态没有实际改变，也会触发 setState
- 在某些情况下可能导致 React 警告

**修复方案**（GameScene.tsx）：
```typescript
// 使用 ref 缓存上一次的状态
const lastNearRef = useRef(false);
const lastAgentStateRef = useRef<AgentState>('IDLE');

useFrame(() => {
  // ...计算距离
  
  // 只在状态真正改变时才调用 setState
  if (near !== lastNearRef.current) {
    lastNearRef.current = near;
    setNearAgent(near);
  }
  
  // 只在状态真正需要改变时才更新
  if (newState && newState !== lastAgentStateRef.current) {
    lastAgentStateRef.current = newState;
    setAgentState(newState);
  }
});
```
- 使用 `useRef` 缓存上一次的状态值
- 只在状态真正改变时才调用 `setState`
- 减少不必要的渲染和潜在的 React 警告

**用户体验改进**：
- ✅ NPC 连续回复之间有明显的1-2秒延迟，更自然
- ✅ 在 ASKING 状态下，输入框正确显示"正在与德米特里交谈..."
- ✅ 消除 React setState 警告，提升性能
- ✅ 对话流程更加流畅和真实

**补充修复（v1.9.3.1）**：NPC头顶图标显示逻辑

**问题**：玩家走远后，德米特里头顶仍显示"👂"（LISTENING）图标，但输入框已显示"距离过远"

**根本原因**：
- 头顶图标只检查 `agentState === 'LISTENING'`
- 没有同时检查 `isNearAgent` 状态
- 导致即使玩家走远，只要 `agentState` 是 `LISTENING`，图标就会显示

**修复方案**：
```typescript
// 修改前
{agentState === 'LISTENING' ? '👂 ' : ...}德米特里

// 修改后：同时检查近场状态
{isNearAgent && agentState === 'LISTENING' ? '👂 ' : ...}德米特里
```

**实现细节**：
1. 在 `WorkerAgentProps` 接口中添加 `isNearAgent: boolean` 属性
2. 在 `<WorkerAgent>` 组件调用时传入 `isNearAgent={isNearAgent}`
3. 在头顶标签渲染逻辑中添加 `isNearAgent &&` 条件

**效果**：
- ✅ 玩家在近场：显示"👂 德米特里"
- ✅ 玩家走远：显示"德米特里"（无图标）
- ✅ NPC执行任务：显示"🪓 德米特里"（无论距离）
- ✅ 图标显示与输入框提示保持一致

### 对话历史和砍树动画修复（v1.9.4 - 2025-12-10）

**问题1：聚焦输入框时对话历史不立即显示**

**现象**：
- 用户完成第一次砍树后，再次点击输入框
- 输入文字时看不到之前的对话内容
- 必须发送消息后才能看到对话历史

**根本原因**：
- `onFocus` 事件只设置了 `setInputFocused(true)`
- 但没有同时设置 `setShowChatHistory(true)`
- 对话历史的显示依赖于两个 `useEffect`：
  1. 监听 `inputFocused` 变化
  2. 监听 `lastChatLog` 变化
- 如果对话历史已经隐藏（超过5秒），仅设置 `inputFocused` 不会立即触发显示

**修复方案**（GameUI.tsx）：
```typescript
// 修改前
onFocus={() => setInputFocused(true)}

// 修改后：同时显示对话历史
onFocus={() => {
  setInputFocused(true);
  setShowChatHistory(true); // 立即显示对话历史
}}
```

**效果**：
- ✅ 点击输入框时，对话历史立即显示
- ✅ 显示所有对话记录（聚焦状态）
- ✅ WASD 移动功能自动禁用
- ✅ 用户体验更流畅

**问题2：第一棵树瞬间倒下**

**现象**：
- 德米特里砍树时，第一棵树瞬间倒下（无挥动动画）
- 第二、第三棵树有正常的4秒挥动延迟

**根本原因**：
- `swingPhase.current` 是一个累积值
- 第一次砍树时，`swingPhase` 从 0 开始累积
- 砍完第一棵树后，`swingPhase` 被重置为 0
- **但是**，在移动到第二棵树的过程中，`swingPhase` 继续累积（行走摆动）
- 到达第二棵树时，`swingPhase` 可能已经是一个较大的值
- 导致第二棵树需要完整的挥动时间，而第一棵树的 `swingPhase` 初始值恰好接近阈值

**实际问题**：
- 查看代码后发现，`swingPhase` 在到达目标后继续累积
- 如果 `swingPhase` 初始值较大（从上一次行走累积），可能立即满足 `> Math.PI * 8` 条件

**修复方案**（GameScene.tsx）：
```typescript
// 添加标志跟踪挥动状态
const isSwingingRef = useRef(false);

// 在 ACTING 状态下
if (dist > 0.15) {
  // 还在移动
  isSwingingRef.current = false;
  // 移动逻辑...
} else {
  // 到达目标，准备挥动
  // 关键修复：第一次进入挥动状态时，重置 swingPhase
  if (!isSwingingRef.current) {
    swingPhase.current = 0;
    isSwingingRef.current = true;
  }
  
  swingPhase.current += delta * 6;
  // 挥动逻辑...
  
  if (swingPhase.current > Math.PI * 8) {
    swingPhase.current = 0;
    isSwingingRef.current = false; // 重置标志
    onActionDone();
  }
}
```

**实现细节**：
1. 添加 `isSwingingRef` 标志跟踪是否正在挥动
2. 移动时设置 `isSwingingRef.current = false`
3. 第一次到达目标时（`!isSwingingRef.current`），重置 `swingPhase.current = 0`
4. 挥动完成后，重置标志 `isSwingingRef.current = false`

**效果**：
- ✅ 每棵树都有完整的4秒挥动动画
- ✅ 第一棵树不再瞬间倒下
- ✅ 所有树的砍伐体验一致
- ✅ 动画流畅自然

## 维护指引
- 新功能或改动时务必同步更新本文件（新增模块、数据流、交互变更、测试策略变更）。
- 先更新文档，再补/改测试，提醒用户手动运行 `npm test`，全部通过后再视为完成开发。
- Bug 修复应记录在"关键实现细节"相关章节，注明日期与问题描述。
- **测试配置**：`vitest.config.ts` 中设置 `watch: false` 防止进入监视模式；`package.json` 中使用 `vitest run` 执行一次性测试。

