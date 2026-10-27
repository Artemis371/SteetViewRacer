import { Euler, MathUtils, type PerspectiveCamera, Vector3 } from 'three';

// Simple free-fly camera: click to capture the mouse, WASD to move,
// Q/E (or Ctrl/Space) down/up, Shift to go fast, Esc to release the mouse.
export class FlyCamera {

	speed = 40; // m/s
	fastMultiplier = 6;

	private keys = new Set<string>();
	private euler = new Euler( 0, 0, 0, 'YXZ' );
	private move = new Vector3();

	constructor( private camera: PerspectiveCamera, dom: HTMLElement ) {

		this.euler.setFromQuaternion( camera.quaternion );

		dom.addEventListener( 'click', () => {

			if ( document.pointerLockElement !== dom ) dom.requestPointerLock();

		} );

		document.addEventListener( 'mousemove', e => {

			if ( document.pointerLockElement !== dom ) return;
			this.euler.y -= e.movementX * 0.0022;
			this.euler.x -= e.movementY * 0.0022;
			this.euler.x = MathUtils.clamp( this.euler.x, - Math.PI / 2 + 0.01, Math.PI / 2 - 0.01 );
			this.camera.quaternion.setFromEuler( this.euler );

		} );

		window.addEventListener( 'keydown', e => this.keys.add( e.code ) );
		window.addEventListener( 'keyup', e => this.keys.delete( e.code ) );
		window.addEventListener( 'blur', () => this.keys.clear() );

	}

	// heading in radians, 0 = looking north (+Z), positive = clockwise toward east (-X)
	setPose( position: Vector3, headingRad: number, pitchRad: number ): void {

		this.camera.position.copy( position );
		// camera looks down its -Z; yaw PI faces +Z (north). East is -X, so clockwise = -yaw.
		this.euler.set( pitchRad, Math.PI - headingRad, 0 );
		this.camera.quaternion.setFromEuler( this.euler );

	}

	update( dt: number ): void {

		const k = this.keys;
		const m = this.move.set( 0, 0, 0 );
		if ( k.has( 'KeyW' ) || k.has( 'ArrowUp' ) ) m.z -= 1;
		if ( k.has( 'KeyS' ) || k.has( 'ArrowDown' ) ) m.z += 1;
		if ( k.has( 'KeyA' ) || k.has( 'ArrowLeft' ) ) m.x -= 1;
		if ( k.has( 'KeyD' ) || k.has( 'ArrowRight' ) ) m.x += 1;
		if ( m.lengthSq() > 0 ) m.normalize().applyQuaternion( this.camera.quaternion );
		if ( k.has( 'KeyE' ) || k.has( 'Space' ) ) m.y += 1;
		if ( k.has( 'KeyQ' ) || k.has( 'ControlLeft' ) ) m.y -= 1;

		const speed = this.speed * ( k.has( 'ShiftLeft' ) || k.has( 'ShiftRight' ) ? this.fastMultiplier : 1 );
		this.camera.position.addScaledVector( m, speed * dt );

	}

}
