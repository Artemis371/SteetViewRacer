import {
	AmbientLight,
	Color,
	ConeGeometry,
	DirectionalLight,
	Fog,
	MathUtils,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	Timer,
	Vector3,
	WebGLRenderer,
} from 'three';
import type { TilesRenderer } from '3d-tiles-renderer';
import './style.css';
import { GOOGLE_MAPS_KEY, ORIGIN, SPAWN_HEADING_DEG } from './config';
import { QUALITY_PRESETS, loadQualityName, saveQualityName, type QualityName } from './quality';
import { applyTileQuality, createGoogleTiles } from './world/tiles';
import { raycastGround } from './world/ground';
import { AttributionOverlay } from './ui/attribution';
import { LoadingScreen } from './ui/loading';
import { FlyCamera } from './debug/flyCamera';

const app = document.getElementById( 'app' )!;

const renderer = new WebGLRenderer( { antialias: true, powerPreference: 'high-performance' } );
renderer.setSize( window.innerWidth, window.innerHeight );
app.appendChild( renderer.domElement );

const SKY = new Color( 0x9fc9ee );
const scene = new Scene();
scene.background = SKY;
scene.add( new AmbientLight( 0xffffff, 1.2 ) );
const sun = new DirectionalLight( 0xffffff, 2 );
sun.position.set( - 300, 600, 200 );
scene.add( sun );

const camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.5, 5000 );
// Look straight down from high above spawn so the tiles around it get requested first.
camera.position.set( 0, 400, 0 );
camera.lookAt( 0, 0, 0 );

const loading = new LoadingScreen( document.body );
const attribution = new AttributionOverlay( document.body );
const debugEl = document.createElement( 'div' );
debugEl.id = 'debug';
document.body.appendChild( debugEl );

let qualityName: QualityName = loadQualityName();
let tiles: TilesRenderer | null = null;

function applyQuality( name: QualityName ): void {

	qualityName = name;
	saveQualityName( name );
	const q = QUALITY_PRESETS[ name ];
	renderer.setPixelRatio( Math.min( window.devicePixelRatio, q.maxPixelRatio ) );
	camera.far = q.drawDistance;
	camera.updateProjectionMatrix();
	scene.fog = new Fog( SKY, q.drawDistance * 0.6, q.drawDistance );
	if ( tiles ) applyTileQuality( tiles, q );

}

if ( ! GOOGLE_MAPS_KEY ) {

	loading.showError(
		'No Google Maps API key found.<br><br>Copy <code>.env.example</code> to <code>.env</code>, set ' +
		'<code>VITE_GOOGLE_MAPS_KEY</code>, then restart <code>npm run dev</code>. See README.md.',
	);

} else {

	tiles = createGoogleTiles( GOOGLE_MAPS_KEY, camera, renderer );
	scene.add( tiles.group );

	tiles.addEventListener( 'load-error', ( e: { tile: unknown, error: Error } ) => {

		if ( e.tile === null ) {

			loading.showError(
				'Could not load the Google Photorealistic 3D Tiles root tileset.<br><br>' +
				'Usual causes: Map Tiles API not enabled, billing not set up, key restricted to the wrong ' +
				'HTTP referrer or API, or a typo in <code>.env</code>. Open DevTools &gt; Network and look at the ' +
				'<code>root.json</code> response for Google\'s exact error.',
			);

		}

	} );

}

applyQuality( qualityName );

const fly = new FlyCamera( camera, renderer.domElement );
const headingRad = SPAWN_HEADING_DEG * MathUtils.DEG2RAD;

// Red cone marks the snapped spawn point on Ali'i Drive. Toggle with M.
const marker = new Mesh( new ConeGeometry( 1.2, 4, 12 ), new MeshBasicMaterial( { color: 0xff2d2d } ) );
marker.rotation.x = Math.PI;
marker.visible = false;
scene.add( marker );

// `stats` exists at runtime but isn't in the package's type definitions.
function tileStats( t: TilesRenderer ): { downloading: number, parsing: number } {

	return ( t as unknown as { stats: { downloading: number, parsing: number } } ).stats;

}

let worldReady = false;
let groundY = 0;

function placeCameraAtSpawn(): void {

	// a bit south (behind) of spawn, raised, looking north up Ali'i Drive
	const back = new Vector3( Math.sin( headingRad ), 0, - Math.cos( headingRad ) ).multiplyScalar( 40 );
	fly.setPose( new Vector3( back.x, groundY + 15, back.z ), headingRad, - 0.2 );

}

function tryFinishLoading( t: TilesRenderer ): void {

	if ( worldReady || ! t.root ) return;

	const hit = raycastGround( t.group, 0, 0 );
	const stats = tileStats( t );
	const busy = stats.downloading + stats.parsing;
	loading.setProgress( t.loadProgress, hit ? 'Streaming detail...' : 'Loading Magic Sands...' );

	// Ready once we have ground under spawn and the first wave of downloads has settled.
	if ( hit && busy < 4 ) {

		worldReady = true;
		groundY = hit.point.y;
		marker.position.set( 0, groundY + 2, 0 );
		marker.visible = true;
		placeCameraAtSpawn();
		loading.hide();
		console.info( `[world] ground at spawn: y=${ groundY.toFixed( 2 ) } m (ellipsoid-relative)` );

	}

}

window.addEventListener( 'keydown', e => {

	if ( e.code === 'KeyP' && worldReady ) placeCameraAtSpawn();
	if ( e.code === 'KeyM' ) marker.visible = ! marker.visible;
	if ( e.code === 'Digit1' ) applyQuality( 'low' );
	if ( e.code === 'Digit2' ) applyQuality( 'medium' );
	if ( e.code === 'Digit3' ) applyQuality( 'high' );

} );

window.addEventListener( 'resize', () => {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

} );

const timer = new Timer();
const invGroup = new Matrix4();
const tmp = new Vector3();
const carto = { lat: 0, lon: 0, height: 0 };
let fpsAccum = 0;
let fpsFrames = 0;
let fps = 0;

renderer.setAnimationLoop( time => {

	timer.update( time );
	const dt = Math.min( timer.getDelta(), 0.1 );

	if ( worldReady ) fly.update( dt );

	camera.updateMatrixWorld();
	if ( tiles ) {

		tiles.setCamera( camera );
		tiles.setResolutionFromRenderer( camera, renderer );
		tiles.update();
		tryFinishLoading( tiles );
		attribution.update( tiles );

	}

	renderer.render( scene, camera );

	fpsAccum += dt;
	fpsFrames ++;
	if ( fpsAccum >= 0.5 ) {

		fps = fpsFrames / fpsAccum;
		fpsAccum = 0;
		fpsFrames = 0;

		if ( tiles ) {

			invGroup.copy( tiles.group.matrixWorld ).invert();
			tmp.copy( camera.position ).applyMatrix4( invGroup );
			tiles.ellipsoid.getPositionToCartographic( tmp, carto );
			const s = tileStats( tiles );
			debugEl.textContent =
				`${ fps.toFixed( 0 ) } fps | quality ${ qualityName } (1/2/3)\n` +
				`cam ${ ( carto.lat * MathUtils.RAD2DEG ).toFixed( 6 ) }, ${ ( carto.lon * MathUtils.RAD2DEG ).toFixed( 6 ) } ` +
				`h ${ carto.height.toFixed( 1 ) } m\n` +
				`tiles visible ${ tiles.visibleTiles.size } dl ${ s.downloading } parse ${ s.parsing }\n` +
				'click: mouse look | WASD move | Q/E down/up | Shift fast | P back to spawn | M marker';

		}

	}

} );

// origin for reference in the console, never the key
console.info( `[world] origin ${ ORIGIN.lat }, ${ ORIGIN.lon }, spawn heading ${ SPAWN_HEADING_DEG } deg` );
