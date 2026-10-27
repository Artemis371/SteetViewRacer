import { MathUtils, type PerspectiveCamera, type WebGLRenderer } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TilesRenderer } from '3d-tiles-renderer';
import {
	GoogleCloudAuthPlugin,
	GLTFExtensionsPlugin,
	ReorientationPlugin,
	TileCompressionPlugin,
} from '3d-tiles-renderer/plugins';
import { ORIGIN } from '../config';
import type { QualityPreset } from '../quality';

// Every root tileset request is billed, so the TilesRenderer must exist exactly once per
// page load. This flag lives on window so even a re-executed module can't make a second one.
// (Vite does a full page reload when main.ts or its imports change, which is a new page load.)
declare global {

	interface Window {

		__aliiTilesCreated?: boolean;

	}

}

export function createGoogleTiles( apiKey: string, camera: PerspectiveCamera, renderer: WebGLRenderer ): TilesRenderer {

	if ( window.__aliiTilesCreated ) {

		throw new Error( 'Google tileset already created for this page load. Refusing to create another (billing).' );

	}

	window.__aliiTilesCreated = true;

	const tiles = new TilesRenderer();

	// autoRefreshToken stays off: a refresh re-requests the billed root tileset.
	tiles.registerPlugin( new GoogleCloudAuthPlugin( { apiToken: apiKey } ) );
	tiles.registerPlugin( new TileCompressionPlugin() );
	tiles.registerPlugin( new GLTFExtensionsPlugin( {
		dracoLoader: new DRACOLoader().setDecoderPath( '/draco/' ),
	} ) );

	// Puts ORIGIN at (0,0,0) with +Y up, +Z north, +X west (ellipsoid height 0).
	tiles.registerPlugin( new ReorientationPlugin( {
		lat: ORIGIN.lat * MathUtils.DEG2RAD,
		lon: ORIGIN.lon * MathUtils.DEG2RAD,
		height: 0,
	} ) );

	tiles.setCamera( camera );
	tiles.setResolutionFromRenderer( camera, renderer );

	return tiles;

}

export function applyTileQuality( tiles: TilesRenderer, q: QualityPreset ): void {

	tiles.errorTarget = q.errorTarget;
	tiles.lruCache.minSize = q.cacheMinSize;
	tiles.lruCache.maxSize = q.cacheMaxSize;
	tiles.lruCache.maxBytesSize = q.cacheMaxBytes;
	tiles.lruCache.minBytesSize = q.cacheMaxBytes * 0.75;

}
