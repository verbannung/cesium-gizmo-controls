# Cesium Gizmo Controls - 产品需求文档

## 1. 项目概述

### 1.1 项目名称
Cesium Gizmo Controls (cesium-gizmo-controls)

### 1.2 项目简介
面向 Cesium 场景的变换 Gizmo 控件，用于在3D场景中对绑定对象进行交互式变换操作（平移、旋转、缩放）。

### 1.3 技术栈
- **基础引擎**: Cesium Engine ^24.0.0
- **开发语言**: TypeScript 5.8+
- **构建工具**: Vite 6.2+
- **测试框架**: Vitest 3.0+
- **运行环境**: Node.js >= 18

### 1.4 项目定位
提供类似3D建模软件（如Blender、Unity、3ds Max）中变换工具的Gizmo控件，使开发者能够在Cesium 3D地球场景中直接操作和变换对象。

---

## 2. 核心功能需求

### 2.1 三种变换模式

#### 2.1.1 平移模式 (Translate)
**功能描述**: 
- 支持沿局部X、Y、Z轴单轴平移
- 支持在局部坐标系平面内双轴平移（XY、YZ、XZ平面）
- 支持在视图平面内自由平移

**交互方式**:
- 拖拽轴线句柄进行单轴平移
- 拖拽平面句柄进行双轴平面内平移
- 拖拽中心球体进行视图平面平移

**视觉反馈**:
- 实时显示引导线
- 显示当前位移数值
- 高亮当前操作的轴/平面

#### 2.1.2 旋转模式 (Rotate)
**功能描述**:
- 支持绕局部X、Y、Z轴旋转
- 支持绕视轴旋转
- 支持多圈连续旋转（角度累积）

**交互方式**:
- 拖拽旋转环进行绕轴旋转
- 拖拽外圈进行绕视轴旋转

**视觉反馈**:
- 显示完整旋转环
- 实时显示旋转扇形区域
- 显示旋转角度数值（度数）
- 显示旋转轴引导线和法线

**数学实现**:
- 使用轴角表示和四元数进行旋转计算
- 支持跨帧角度unwrap处理，避免±π边界跳变
- 采用Rodrigues公式进行轴角旋转

#### 2.1.3 缩放模式 (Scale)
**功能描述**:
- 支持沿X、Y、Z轴独立缩放
- 支持统一缩放（保持比例）

**交互方式**:
- 拖拽轴线句柄进行单轴缩放
- 拖拽中心句柄进行统一缩放

**视觉反馈**:
- 显示轴线引导
- 显示缩放比例数值
- 显示移动箭头（统一缩放时）

**约束条件**:
- 最小缩放值保护（默认0.01），防止对象塌缩
- 分母退化保护，避免数值爆炸

---

## 3. 技术架构需求

### 3.1 系统架构设计

#### 3.1.1 模块划分
项目采用清晰的模块化架构，包含以下核心系统：

1. **OrbitControl** - 外部API入口
2. **CenterController** - 组合根，协调各子系统
3. **RenderSystem** - 渲染和状态管理
4. **EventManager** - 事件处理和会话管理
5. **GeometryManager** - Gizmo几何体管理
6. **OverlayManager** - 辅助层绘制管理
7. **TranslateController / RotateController / ScaleController** - 三种模式的控制器

#### 3.1.2 数据流设计
```
输入事件 → EventManager → Controller → RenderSystem → GeometryManager/OverlayManager → Cesium Scene
```

### 3.2 坐标系统需求

#### 3.2.1 坐标变换支持
- 世界坐标系（Cesium ECEF坐标）
- 局部坐标系（对象自身TRS分解后的坐标系）
- 屏幕坐标系（2D视口坐标）

#### 3.2.2 矩阵要求
- 支持的变换矩阵必须可分解为 `T·R·S` 形式
- 旋转矩阵 `R` 必须正交
- 不支持包含剪切的矩阵

### 3.3 拾取和碰撞检测需求

#### 3.3.1 射线拾取
- 基于射线与三角形相交的精确拾取
- 支持可配置的拾取容差（默认8像素）

#### 3.3.2 拾取几何体优化
- 拾取用几何体比渲染几何体加粗，提高命中率
- 通过`pickPaddingPx`参数控制加粗宽度

### 3.4 视角退化处理需求

#### 3.4.1 轴退化检测
- 当轴与视线夹角接近0°时（几乎对着看），隐藏该轴
- 通过`axisLimit`参数控制阈值（默认0.98）

#### 3.4.2 平面退化检测
- 当平面法线与视线夹角接近90°时（侧视），隐藏该平面
- 通过`planeLimit`参数控制阈值（默认0.2）

#### 3.4.3 数值退化保护
- 旋转起始半径保护：`minRotateRadius`
- 缩放分母保护：`minScaleDenominator`
- 退化阈值：`degenerateThreshold`

---

## 4. 交互体验需求

### 4.1 视觉反馈需求

#### 4.1.1 Gizmo尺寸
- 保持屏幕固定像素尺寸，不随相机远近变化
- 默认目标尺寸：80像素
- 可通过`gizmoPixelSize`参数配置

#### 4.1.2 颜色方案
- X轴：红色
- Y轴：绿色
- Z轴：蓝色
- 高亮状态：黄色或更亮的颜色

#### 4.1.3 辅助层显示
拖拽过程中显示辅助图形：
- **平移模式**：
  - 轴线引导（单轴）
  - 平面矩形引导（平面）
  - 圆环引导（视图平面）
  - 移动箭头
  
- **旋转模式**：
  - 完整旋转环
  - 旋转扇形
  - 轴线引导
  - 法线引导
  
- **缩放模式**：
  - 轴线引导（单轴）
  - 移动箭头（统一缩放）

- 所有模式：实时数值标签

#### 4.1.4 高亮和悬停
- 鼠标悬停时高亮对应句柄
- 拖拽时只显示当前操作的句柄
- 其他句柄在拖拽时隐藏

### 4.2 吸附功能需求

#### 4.2.1 平移吸附
- 支持对累积位移进行步长吸附
- 通过`translateSnap`参数配置步长（0表示关闭）
- 吸附在物体局部单位下进行

#### 4.2.2 缩放吸附
- 支持对累积缩放比例进行步长吸附
- 通过`scaleSnap`参数配置步长（0表示关闭）

#### 4.2.3 旋转吸附
- 目前代码未实现旋转吸附
- 可作为未来扩展功能

### 4.3 相机交互需求
- 拖拽Gizmo时自动禁用相机控制
- 释放鼠标后恢复相机控制
- 保留拖拽前的相机启用状态

### 4.4 键盘交互需求
- 示例中实现了1/2/3键切换模式
- 可扩展支持更多快捷键（如精确模式、吸附开关等）

---

## 5. API设计需求

### 5.1 核心API

#### 5.1.1 构造函数
```typescript
new OrbitControl(
  canvas: HTMLCanvasElement,
  scene: Scene,
  camera: Camera,
  options?: OrbitControlOptions
)
```

#### 5.1.2 绑定方法
```typescript
bind(modelMatrix: Matrix4, mode?: ControlMode): void
```
- 绑定要操作的对象矩阵
- 可选指定初始模式

#### 5.1.3 模式切换
```typescript
setMode(mode: ControlMode): void
get currentMode(): ControlMode
```

#### 5.1.4 销毁方法
```typescript
destroy(): void
```
- 清理所有资源
- 移除事件监听
- 销毁Cesium图元

### 5.2 配置选项需求

#### 5.2.1 基础选项
| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `gizmoPixelSize` | number | 80 | Gizmo屏幕像素尺寸 |
| `pickPaddingPx` | number | 8 | 拾取容差（像素） |
| `showOverlay` | boolean | true | 是否显示辅助层 |
| `onChange` | function | undefined | 变换回调函数 |

#### 5.2.2 吸附选项
| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `translateSnap` | number | 0 | 平移吸附步长 |
| `scaleSnap` | number | 0 | 缩放吸附步长 |
| `minScale` | number | 0.01 | 最小缩放值 |

#### 5.2.3 高级选项
| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `degenerateThreshold` | number | 0.15 | 退化检测阈值 |
| `minRotateRadius` | number | 0.10 | 最小旋转半径 |
| `minScaleDenominator` | number | 1e-6 | 最小缩放分母 |
| `axisLimit` | number | 0.98 | 轴退化阈值 |
| `planeLimit` | number | 0.2 | 平面退化阈值 |

### 5.3 事件回调需求

#### 5.3.1 onChange回调
```typescript
onChange?: (modelMatrix: Matrix4) => void
```
- 每次变换时调用
- 传递克隆后的矩阵（不可变）
- 用于同步外部状态

---

## 6. 性能需求

### 6.1 渲染性能
- Gizmo应使用高效的几何体（低多边形）
- 使用Cesium Primitive而非Entity以提高性能
- 每帧只更新必要的矩阵

### 6.2 计算性能
- 射线拾取应在一帧内完成
- 拖拽计算应保持60fps流畅度
- 避免不必要的矩阵分解和重组

### 6.3 内存管理
- 复用Cesium数学对象（Cartesian3、Matrix4等）
- 使用scratch变量避免频繁内存分配
- destroy时正确清理所有Cesium资源

---

## 7. 质量需求

### 7.1 类型安全
- 全部代码使用TypeScript编写
- 导出完整的类型定义
- 无any类型滥用

### 7.2 测试覆盖
- 核心算法单元测试
- 坐标变换测试
- 边界条件测试

### 7.3 文档完整性
- 提供中英文README
- API文档完整
- 代码注释清晰（特别是数学计算部分）

---

## 8. 兼容性需求

### 8.1 浏览器兼容性
- 支持所有现代浏览器（Chrome、Firefox、Safari、Edge）
- 需要WebGL支持

### 8.2 Cesium版本
- 当前支持Cesium Engine ^24.0.0
- 作为peer dependency，由使用者提供

### 8.3 模块系统
- 支持ESM导入
- 支持CommonJS导入
- 提供TypeScript声明文件

---

## 9. 构建和发布需求

### 9.1 构建产物
- ES模块：`dist/index.js`
- CommonJS模块：`dist/index.cjs`
- TypeScript声明：`dist/index.d.ts`

### 9.2 开发流程
- `npm run dev` - 启动开发服务器和示例
- `npm run build` - 构建库文件
- `npm run test` - 运行测试
- `npm run typecheck` - 类型检查

### 9.3 发布方式
- 通过GitHub Release发布
- 包文件名格式：`cesium-gizmo-controls-{version}.tgz`
- 发布标签：`latest`（从main分支）

---

## 10. 示例和演示需求

### 10.1 在线演示
- 部署在GitHub Pages
- 地址：https://verbannung.github.io/cesium-gizmo-controls/
- 展示三种模式的基本用法

### 10.2 示例功能
- 在地理坐标系上放置可变换的立方体
- 键盘快捷键切换模式
- 显示当前模式提示

### 10.3 示例代码
- 提供清晰的示例代码
- 展示基本用法
- 展示配置选项用法

---

## 11. 未来扩展方向

### 11.1 功能扩展
- [ ] 旋转角度吸附
- [ ] 多对象同时变换
- [ ] 撤销/重做支持
- [ ] 变换历史记录
- [ ] 约束模式（如只允许水平移动）
- [ ] 自定义Gizmo外观
- [ ] 触摸设备支持

### 11.2 性能优化
- [ ] 更精细的LOD控制
- [ ] 视锥剔除优化
- [ ] 更高效的拾取算法

### 11.3 用户体验
- [ ] 更多视觉反馈选项
- [ ] 声音反馈
- [ ] 更丰富的吸附选项
- [ ] 预设配置模板

---

## 12. 已知限制

### 12.1 矩阵限制
- 不支持包含剪切的矩阵
- 旋转矩阵必须正交
- 必须可分解为T·R·S形式

### 12.2 场景限制
- 仅支持3D场景（scene3DOnly模式）
- 不支持2D或Columbus View

### 12.3 功能限制
- 当前不支持自定义Gizmo外观
- 不支持动画插值
- 不提供内置的撤销/重做

---

## 附录：术语表

- **Gizmo**: 3D场景中的交互式变换控件
- **TRS**: Translation-Rotation-Scale（平移-旋转-缩放）
- **ECEF**: Earth-Centered Earth-Fixed（地心地固坐标系）
- **ENU**: East-North-Up（东北天坐标系）
- **射线拾取**: 使用鼠标位置的射线与场景对象求交
- **退化**: 几何或数值条件接近奇异点，导致计算不稳定
- **unwrap**: 角度连续化处理，避免±π边界跳变
- **scratch变量**: 可复用的临时变量，避免内存分配
