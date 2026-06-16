# Piano Roll Editor

轻量钢琴卷帘编辑器——纯浏览器端运行的 MIDI 编曲小工具。灵感来时打开即用，画音符、调音高时值、分音轨叠编、点播放听效果，全程本地离线。

## 快速开始

### 环境要求

- **Node.js** >= 18.x
- **npm** >= 9.x
- **浏览器**: Chrome 90+ / Edge 90+ / Firefox 90+ / Safari 15+（需支持 Web Audio API、Canvas 2D、IndexedDB）

### 安装与启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 浏览器访问 http://localhost:4200
```

### 构建生产版本

```bash
npm run build
# 产物输出到 dist/piano-roll-editor/
```

## 功能说明

| 功能 | 说明 |
|------|------|
| 钢琴卷帘编辑 | Canvas 绘制网格与音符，鼠标点击/拖拽创建、移动、拉伸音符 |
| 多音轨管理 | 增删音轨、静音/独奏、切换编辑音轨、不同音色选择 |
| 实时播放 | Tone.js 合成音色，Transport 精确调度，播放指针实时跟踪 |
| 量化吸附 | 可开关的 16 分音符吸附，确保音符对齐网格 |
| 工程持久化 | IndexedDB 自动保存（30 秒间隔），支持手动保存 |
| 缩放与滚动 | 水平/垂直缩放，Shift+滚轮水平滚动，滚轮纵向浏览音高 |

## 操作说明

- **Draw 模式**：在卷帘网格上点击创建音符，拖拽调整时值
- **Select 模式**：点击选中音符，拖拽移动位置；Shift+点击多选
- **Erase 模式**：点击/拖拽删除音符
- **播放控制**：▶ 播放 / ⏸ 暂停 / ⏹ 停止 / ↻ 循环
- **BPM**：底部控制栏输入 40-300 之间的速度值

## 技术架构

| 层 | 技术 | 说明 |
|----|------|------|
| 前端框架 | Angular 17 + TypeScript | Standalone 组件架构 |
| 样式 | TailwindCSS 3 | 自定义深色音乐工作站主题 |
| 状态管理 | NgRx (Store + Effects) | 单一数据源，渲染与播放解耦 |
| 音色合成 | Tone.js | PolySynth 支持多种音色 |
| 卷帘画布 | HTML5 Canvas 2D | requestAnimationFrame 持续渲染 |
| 数据持久化 | IndexedDB (idb) | 纯本地存储，断网可用 |

## 项目结构

```
src/app/
├── models/              # 数据模型 (Note, Track, Project, Constants)
├── store/               # NgRx 状态管理 (Actions, Reducer, Selectors, Effects)
├── services/
│   ├── piano-roll/      # Canvas 渲染引擎 & 鼠标交互解析
│   ├── playback/        # Tone.js 播放调度 & 合成器管理
│   └── persistence/     # IndexedDB 读写封装
├── components/
│   ├── piano-roll-canvas/  # 卷帘画布组件
│   ├── toolbar/            # 工具栏 (Select/Draw/Erase, Snap, Zoom)
│   ├── track-panel/        # 音轨面板
│   └── transport-bar/      # 播放控制条
├── app.component.ts     # 根组件
└── app.module.ts        # 根模块
```
