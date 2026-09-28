import { Cartesian3, Color } from '@cesium/engine'
import { INNER_VIEW_AXIS_RADIUS } from '../constants'
import { BaseGeometry } from './baseGeometry'
import {
  RING_HALF_WIDTH_PX,
  buildHeadAxis,
  buildHeadAxisMeshes,
  buildRing,
  buildSolidDiskMesh,
} from './geometryUtil'
import { Handle } from './handle'

export class TranslateGeometry extends BaseGeometry {
  build(): void {
    const X = Cartesian3.UNIT_X
    const Y = Cartesian3.UNIT_Y
    const Z = Cartesian3.UNIT_Z

    this.assets = [
      new Handle(
        'translate-x',
        'axisFlip',
        { type: 'arrow', u: Y, v: Z, color: Color.RED },
        { type: 'arrow', u: Y, v: Z, priority: 2 },
        { type: 'axis', axisDirection: X },
        buildHeadAxisMeshes(Y, Z),
        buildHeadAxis(Y, Z, Color.RED),
      ),
      new Handle(
        'translate-y',
        'axisFlip',
        { type: 'arrow', u: Z, v: X, color: Color.LIME },
        { type: 'arrow', u: Z, v: X, priority: 2 },
        { type: 'axis', axisDirection: Y },
        buildHeadAxisMeshes(Z, X),
        buildHeadAxis(Z, X, Color.LIME),
      ),
      new Handle(
        'translate-z',
        'axisFlip',
        { type: 'arrow', u: X, v: Y, color: Color.DODGERBLUE },
        { type: 'arrow', u: X, v: Y, priority: 2 },
        { type: 'axis', axisDirection: Z },
        buildHeadAxisMeshes(X, Y),
        buildHeadAxis(X, Y, Color.DODGERBLUE),
      ),
      new Handle(
        'translate-view',
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
          priority: 3,
        },
        { type: 'view' },
        [buildSolidDiskMesh(X, Y, INNER_VIEW_AXIS_RADIUS)],
        buildRing(
          X,
          Y,
          'translate-view',
          Color.WHITE,
          INNER_VIEW_AXIS_RADIUS,
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
