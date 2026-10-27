// World anchor. Wikipedia lists La'aloa Beach Park (Magic Sands) at 19.5939, -155.9714,
// which is about 17 m west of the Ali'i Drive centerline (on the sand). We snap the
// origin to the nearest point on the OSM centerline (way 45640842) so spawn is on the road.
export const ORIGIN = {
	lat: 19.593962,
	lon: -155.971255,
};

// Ali'i Drive runs roughly NNW/SSE here. Northbound heading is about 336 degrees
// (clockwise from true north), measured from the OSM centerline segment at spawn.
export const SPAWN_HEADING_DEG = 336;

export const GOOGLE_MAPS_KEY: string = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '';
