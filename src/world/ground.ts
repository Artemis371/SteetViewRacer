import { Object3D, Raycaster, Vector3, type Intersection } from 'three';

const raycaster = new Raycaster();
const origin = new Vector3();
const down = new Vector3( 0, - 1, 0 );

// Casts straight down at (x, z) from `fromY` and returns the first hit, or null if
// no loaded tile geometry is under that point yet.
export function raycastGround( root: Object3D, x: number, z: number, fromY = 2000 ): Intersection | null {

	origin.set( x, fromY, z );
	raycaster.set( origin, down );
	raycaster.far = fromY + 2000;
	const hits = raycaster.intersectObject( root, true );
	return hits.length ? hits[ 0 ] : null;

}
