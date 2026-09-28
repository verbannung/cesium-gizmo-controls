import { Cartesian3, Color } from '@cesium/engine'
import { OUTER_AXIS_RADIUS, OUTER_VIEW_AXIS_RADIUS } from '../constants'
import { BaseGeometry } from './baseGeometry'
import {
  PICK_SEGMENTS,
  PICK_SIDES,
  RING_HALF_WIDTH_PX,
  TUBE_RADIUS,
  buildRing,
  buildRingTubeMesh,
} from './geometryUtil'
import { Handle } from './handle'

export class RotateGeometry extends BaseGeometry {
  build(): void {
    const X = Cartesian3.UNIT_X
    const Y = Cartesian3.UNIT_Y
    const Z = Cartesian3.UNIT_Z

    this.assets = [
      new Handle(
        'rotate-x',
        'gizmo',
        {
          type: 'ring',
          u: Y,
          v: Z,
          radius: OUTER_AXIS_RADIUS,
          halfWidthPx: RING_HALF_WIDTH_PX,
          color: Color.RED,
          showBack: false,
        },
        {
          type: 'ring',
          u: Y,
          v: Z,
          radius: OUTER_AXIS_RADIUS,
          tubeRadius: TUBE_RADIUS,
          pickBack: false,
          priority: 2,
        },
        { type: 'axis', axisDirection: X },
        [
          buildRingTubeMesh(
            X,
            Y,
            Z,
            OUTER_AXIS_RADIUS,
            TUBE_RADIUS,
            PICK_SEGMENTS,
            PICK_SIDES,
          ),
        ],
        buildRing(
          Y,
          Z,
          'rotate-x',
          Color.RED,
          OUTER_AXIS_RADIUS,
          true,
          RING_HALF_WIDTH_PX,
        ),
      ),
      new Handle(
        'rotate-y',
        'gizmo',
        {
          type: 'ring',
          u: Z,
          v: X,
          radius: OUTER_AXIS_RADIUS,
          halfWidthPx: RING_HALF_WIDTH_PX,
          color: Color.LIME,
          showBack: false,
        },
        {
          type: 'ring',
          u: Z,
          v: X,
          radius: OUTER_AXIS_RADIUS,
          tubeRadius: TUBE_RADIUS,
          pickBack: false,
          priority: 2,
        },
        { type: 'axis', axisDirection: Y },
        [
          buildRingTubeMesh(
            Y,
            Z,
            X,
            OUTER_AXIS_RADIUS,
            TUBE_RADIUS,
            PICK_SEGMENTS,
            PICK_SIDES,
          ),
        ],
        buildRing(
          Z,
          X,
          'rotate-y',
          Color.LIME,
          OUTER_AXIS_RADIUS,
          true,
          RING_HALF_WIDTH_PX,
        ),
      ),
      new Handle(
        'rotate-z',
        'gizmo',
        {
          type: 'ring',
          u: X,
          v: Y,
          radius: OUTER_AXIS_RADIUS,
          halfWidthPx: RING_HALF_WIDTH_PX,
          color: Color.DODGERBLUE,
          showBack: false,
        },
        {
          type: 'ring',
          u: X,
          v: Y,
          radius: OUTER_AXIS_RADIUS,
          tubeRadius: TUBE_RADIUS,
          pickBack: false,
          priority: 2,
        },
        { type: 'axis', axisDirection: Z },
        [
          buildRingTubeMesh(
            Z,
            X,
            Y,
            OUTER_AXIS_RADIUS,
            TUBE_RADIUS,
            PICK_SEGMENTS,
            PICK_SIDES,
          ),
        ],
        buildRing(
          X,
          Y,
          'rotate-z',
          Color.DODGERBLUE,
          OUTER_AXIS_RADIUS,
          true,
          RING_HALF_WIDTH_PX,
        ),
      ),
      new Handle(
        'rotate-view',
        'view',
        {
          type: 'ring',
          u: X,
          v: Y,
          radius: OUTER_VIEW_AXIS_RADIUS,
          halfWidthPx: RING_HALF_WIDTH_PX,
          color: Color.WHITE,
          showBack: true,
        },
        {
          type: 'ring',
          u: X,
          v: Y,
          radius: OUTER_VIEW_AXIS_RADIUS,
          tubeRadius: TUBE_RADIUS,
          pickBack: true,
          priority: 3,
        },
        { type: 'view' },
        [
          buildRingTubeMesh(
            Z,
            X,
            Y,
            OUTER_VIEW_AXIS_RADIUS,
            TUBE_RADIUS,
            PICK_SEGMENTS,
            PICK_SIDES,
          ),
        ],
        buildRing(
          X,
          Y,
          'rotate-view',
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
