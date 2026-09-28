import type { Color, Primitive } from '@cesium/engine'
import type {
  HandleCompute,
  HandleId,
  HandlePicking,
  HandleViewType,
  HandleVisual,
  MeshData,
} from './types'

/**
 * 一个手柄的完整运行时资产：身份、展示、碰撞、计算 + 网格/图元。
 */
export class Handle {
  readonly id: HandleId
  readonly viewType: HandleViewType
  readonly visual: HandleVisual
  readonly picking: HandlePicking
  readonly compute: HandleCompute
  meshes: MeshData[]
  primitives: Primitive[]

  constructor(
    id: HandleId,
    viewType: HandleViewType,
    visual: HandleVisual,
    picking: HandlePicking,
    compute: HandleCompute,
    meshes: MeshData[],
    primitives: Primitive[],
  ) {
    this.id = id
    this.viewType = viewType
    this.visual = visual
    this.picking = picking
    this.compute = compute
    this.meshes = meshes
    this.primitives = primitives
  }

  get color(): Color {
    return this.visual.color
  }
}
