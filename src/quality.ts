export type QualityName = 'low' | 'medium' | 'high';

export interface QualityPreset {
	// screen-space error target for tile refinement; higher = blurrier, fewer tiles
	errorTarget: number;
	// camera far plane in meters; tiles beyond it are culled and never requested
	drawDistance: number;
	// cap on devicePixelRatio
	maxPixelRatio: number;
	// LRU cache tile count and byte budget
	cacheMinSize: number;
	cacheMaxSize: number;
	cacheMaxBytes: number;
}

const MB = 1024 * 1024;

export const QUALITY_PRESETS: Record<QualityName, QualityPreset> = {
	low: {
		errorTarget: 40,
		drawDistance: 2500,
		maxPixelRatio: 0.75,
		cacheMinSize: 1500,
		cacheMaxSize: 2500,
		cacheMaxBytes: 200 * MB,
	},
	medium: {
		errorTarget: 24,
		drawDistance: 5000,
		maxPixelRatio: 1,
		cacheMinSize: 3000,
		cacheMaxSize: 4500,
		cacheMaxBytes: 300 * MB,
	},
	high: {
		errorTarget: 12,
		drawDistance: 10000,
		maxPixelRatio: 2,
		cacheMinSize: 6000,
		cacheMaxSize: 8000,
		cacheMaxBytes: 500 * MB,
	},
};

const STORAGE_KEY = 'alii-racer-quality';

export function loadQualityName(): QualityName {

	try {

		const v = localStorage.getItem( STORAGE_KEY );
		if ( v === 'low' || v === 'medium' || v === 'high' ) return v;

	} catch {

		// storage unavailable, fall through to default

	}

	return 'medium';

}

export function saveQualityName( name: QualityName ): void {

	try {

		localStorage.setItem( STORAGE_KEY, name );

	} catch {

		// ignore

	}

}
