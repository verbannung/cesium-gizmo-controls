/**
 * 几何碰撞/拾取工具：射线与手柄网格求交、拾取优先级排序。
 * 与 geometryUtil（建网格/图元）分工，本文件只处理拾取相关纯函数。
 */
import { Cartesian3, IntersectionTests, Matrix4, Ray } from '@cesium/engine'
import type { GeometryFrameContext } from '../render/types'
import type { HandlePicking, MeshData } from './types'
import { hitsBoundingSphere } from '../util/ray'
import { matrixForHandle, toCameraLocal } from './handleFrame'
import type { Handle } from './handle'

const scratchInv = new Matrix4()
const scratchCamera = new Cartesian3()
const meshRay = new Ray(new Cartesian3(), new Cartesian3())

/**
 * 对当前手柄列表做射线拾取，返回命中的 Handle。
 * 使用与绘制完全相同的矩阵规则（见 matrixForHandle）。
 */
export function pickHandle(
  worldRay: Ray,
  handles: readonly Handle[],
  frame: GeometryFrameContext,
): Handle | null {
  const ordered = sortHandle(handles)
  const cameraLocal = toCameraLocal(frame, scratchCamera)
  let best: Handle | null = null
  let bestT = Infinity
  let bestPri = -1

  for (const handle of ordered) {
    const picking = handle.picking
    const localRay = toHandleLocalRay(worldRay, handle, frame, meshRay)
    const t = intersectMeshes(localRay, handle.meshes, cameraLocal, cullBackHalf(picking))
    if (t === null) continue

    const pri = picking.priority
    if (pri > bestPri || (pri === bestPri && t < bestT)) {
      bestPri = pri
      bestT = t
      best = handle
    }
  }

  return best
}

export function sortHandle(handles: readonly Handle[]): Handle[] {
  return handles
    .slice()
    .sort((a, b) => b.picking.priority - a.picking.priority)
}

function toHandleLocalRay(
  worldRay: Ray,
  handle: Handle,
  frame: GeometryFrameContext,
  result: Ray,
): Ray {
  Matrix4.inverse(matrixForHandle(handle, frame), scratchInv)
  Matrix4.multiplyByPoint(scratchInv, worldRay.origin, result.origin)
  Matrix4.multiplyByPointAsVector(scratchInv, worldRay.direction, result.direction)
  return result
}

function intersectMeshes(
  localRay: Ray,
  meshes: readonly MeshData[],
  cameraLocal: Cartesian3,
  cullBackface = false,
): number | null {
  let best = Infinity

  for (const mesh of meshes) {
    if (!hitsBoundingSphere(localRay, mesh.boundingRadius)) continue

    for (let i = 0; i < mesh.indices.length; i += 3) {
      const t = IntersectionTests.rayTriangleParametric(
        localRay,
        mesh.positions[mesh.indices[i]],
        mesh.positions[mesh.indices[i + 1]],
        mesh.positions[mesh.indices[i + 2]],
        true,
      )

      if (t === undefined || t <= 0 || t >= best) continue
      best = t
    }
  }

  const hit = best < Infinity ? best : null
  if (cullBackface && hit !== null) {
    const hitPointLocal = Ray.getPoint(localRay, hit, new Cartesian3())
    if (Cartesian3.dot(hitPointLocal, cameraLocal) < 0) return null
  }

  return hit
}

/** 仅 ring 且 pickBack === false 时剔除背半环。 */
function cullBackHalf(picking: HandlePicking): boolean {
  return picking.type === 'ring' && picking.pickBack === false
}
