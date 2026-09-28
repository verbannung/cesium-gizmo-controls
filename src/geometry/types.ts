import type { Cartesian3, Color } from '@cesium/engine'

/**
 * Geometry 模块协议：手柄标识、定义与网格数据。
 * 本文件只允许出现类型，不得导出任何运行时值；
 * Handle 运行时类见 geometry/handle.ts。
 */

/** 每个轴/手柄唯一标识 */
export type HandleId =
  | 'translate-x'
  | 'translate-y'
  | 'translate-z'
  | 'translate-xy'
  | 'translate-yz'
  | 'translate-zx'
  | 'translate-view'
  | 'rotate-x'
  | 'rotate-y'
  | 'rotate-z'
  | 'rotate-view'
  | 'scale-x'
  | 'scale-y'
  | 'scale-z'
  | 'scale-uniform'

/** 该 handle 的图元挂在哪个矩阵下。 */
export type HandleViewType = 'gizmo' | 'view' | 'axisFlip'

/** 展示参数：ring / arrow / box。 */
export type HandleVisual = {
  readonly color: Color
} & (
  | {
      readonly type: 'ring'
      readonly u: Cartesian3
      readonly v: Cartesian3
      readonly radius: number
      readonly halfWidthPx: number
      /** 空闲时是否展示背半环；激活时运行时强制整环。 */
      readonly showBack: boolean
    }
  | {
      /** 轴线 + 圆锥箭头。 */
      readonly type: 'arrow'
      readonly u: Cartesian3
      readonly v: Cartesian3
    }
  | {
      /** 轴线 + 端点方块。 */
      readonly type: 'box'
      readonly u: Cartesian3
      readonly v: Cartesian3
    }
)

/** 碰撞参数：ring / arrow / box / solid。 */
export type HandlePicking = {
  /** 数值越大越优先；同优先级取最近命中。 */
  readonly priority: number
} & (
  | {
      readonly type: 'ring'
      readonly u: Cartesian3
      readonly v: Cartesian3
      readonly radius: number
      readonly tubeRadius: number
      /** 是否允许命中背半环。 */
      readonly pickBack: boolean
    }
  | {
      readonly type: 'arrow'
      readonly u: Cartesian3
      readonly v: Cartesian3
    }
  | {
      readonly type: 'box'
      readonly u: Cartesian3
      readonly v: Cartesian3
    }
  | {
      /** 实心圆盘区域，可从两侧命中。 */
      readonly type: 'solid'
      readonly u: Cartesian3
      readonly v: Cartesian3
      readonly radius: number
    }
)

/** 计算约束：与 ControlMode 组合决定拖拽行为。 */
export type HandleCompute =
  | {
      readonly type: 'axis'
      /** Gizmo 局部坐标系中的单位轴方向。 */
      readonly axisDirection: Cartesian3
    }
  | {
      readonly type: 'plane'
      /** Gizmo 局部坐标系中的单位平面法线。 */
      readonly planeNormal: Cartesian3
    }
  | {
      readonly type: 'view'
    }
  | {
      readonly type: 'uniform'
    }

/** 手柄完整定义：身份、矩阵、展示、碰撞、计算。 */
export interface HandleDefinition {
  readonly id: HandleId
  readonly viewType: HandleViewType
  readonly visual: HandleVisual
  readonly picking: HandlePicking
  readonly compute: HandleCompute
}

/** 拾取对外结果：无 mode。 */
export interface HandleDescriptor {
  readonly id: HandleId
  readonly compute: HandleCompute
  readonly color: Color
}

export interface MeshData {
  positions: Cartesian3[]
  indices: Uint32Array
  boundingRadius: number
}
