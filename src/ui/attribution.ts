import type { TilesRenderer } from '3d-tiles-renderer';

// Google Map Tiles API policy: show the Google Maps logo plus the aggregated, sorted
// copyright strings of all currently visible tiles, unobstructed.
// The logo file is Google's official attribution asset
// (developers.google.com/maps/documentation/tile/policies).
export class AttributionOverlay {

	private textEl: HTMLElement;
	private last = '';

	constructor( parent: HTMLElement ) {

		const root = document.createElement( 'div' );
		root.id = 'attribution';
		root.innerHTML = `
			<img class="google-logo" src="/attribution/google-maps-logo.svg" alt="Google Maps" width="105" height="22">
			<span class="tile-credits"></span>
			<span class="osm-credit">Road data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a></span>
		`;
		parent.appendChild( root );
		this.textEl = root.querySelector( '.tile-credits' )!;

	}

	update( tiles: TilesRenderer ): void {

		// The GoogleCloudAuthPlugin builds this string from each visible tile's
		// glTF asset.copyright, sorted by how many visible tiles share it.
		const items = tiles.getAttributions();
		const text = items
			.filter( a => a.type === 'string' )
			.map( a => String( a.value ) )
			.join( '; ' );

		if ( text !== this.last ) {

			this.last = text;
			this.textEl.textContent = text;

		}

	}

}
