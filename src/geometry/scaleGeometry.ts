import { Cartesian3, Color } from '@cesium/engine'
import { INNER_VIEW_AXIS_RADIUS, OUTER_VIEW_AXIS_RADIUS } from '../constants'
import { BaseGeometry } from './baseGeometry'
import {
  RING_HALF_WIDTH_PX,
  buildBoxAxis,
  buildBoxAxisMeshes,
  buildRing,
  buildSolidDiskMesh,
} from './geometryUtil'
import { Handle } from './handle'

export class ScaleGeometry extends BaseGeometry {
  build(): void {
    const X = Cartesian3.UNIT_X
    const Y = Cartesian3.UNIT_Y
    const Z = Cartesian3.UNIT_Z

    this.assets = [
      new Handle(
        'scale-x',
        'axisFlip',
        { type: 'box', u: Y, v: Z, color: Color.RED },
        { type: 'box', u: Y, v: Z, priority: 2 },
        { type: 'axis', axisDirection: X },
        buildBoxAxisMeshes(Y, Z),
        buildBoxAxis(Y, Z, Color.RED),
      ),
      new Handle(
        'scale-y',
        'axisFlip',
        { type: 'box', u: Z, v: X, color: Color.LIME },
        { type: 'box', u: Z, v: X, priority: 2 },
        { type: 'axis', axisDirection: Y },
        buildBoxAxisMeshes(Z, X),
        buildBoxAxis(Z, X, Color.LIME),
      ),
      new Handle(
        'scale-z',
        'axisFlip',
        { type: 'box', u: X, v: Y, color: Color.DODGERBLUE },
        { type: 'box', u: X, v: Y, priority: 2 },
        { type: 'axis', axisDirection: Z },
        buildBoxAxisMeshes(X, Y),
        buildBoxAxis(X, Y, Color.DODGERBLUE),
      ),
      new Handle(
        'scale-uniform',
        'view',
        {
          type: 'ring',
          u: X,
          v: Y,
          radius: INNER_VIEW_AXIS_RADIUS,
          halfWidthPx: RING_HALF_WIDTH_PX,
          color: Color.WHITE,
          showBack: true,
        },
        {
          type: 'solid',
          u: X,
          v: Y,
          radius: INNER_VIEW_AXIS_RADIUS,
          priority: 0,
        },
        { type: 'uniform' },
        [buildSolidDiskMesh(X, Y, OUTER_VIEW_AXIS_RADIUS)],
        buildRing(
          X,
          Y,
          'scale-uniform',
          Color.WHITE,
          OUTER_VIEW_AXIS_RADIUS,
          false,
          RING_HALF_WIDTH_PX,
        ),
      ),
    ]
    for (const handle of this.assets) {
      for (const p of handle.primitives) this.scene.primitives.add(p)
    }
  }
}
