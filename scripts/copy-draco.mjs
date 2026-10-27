// Copies three.js's Draco decoder into public/draco so Google's Draco-compressed
// tiles decode locally (no third-party CDN needed). Runs on `npm install`.
import { cpSync, existsSync, mkdirSync } from 'node:fs';

const src = 'node_modules/three/examples/jsm/libs/draco/gltf';
const dst = 'public/draco';

if ( existsSync( src ) ) {

	mkdirSync( dst, { recursive: true } );
	cpSync( src, dst, { recursive: true } );
	console.log( 'copy-draco: decoder copied to public/draco' );

} else {

	console.warn( 'copy-draco: three.js Draco decoder not found, skipping' );

}
