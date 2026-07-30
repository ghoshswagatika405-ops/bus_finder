// Google Maps API Utilities (Geocoding, Directions & Distance Matrix)

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/**
 * Fetch turn-by-turn route coordinates from Google Maps Directions API
 * @param {Array<number>} origin [lat, lng]
 * @param {Array<number>} destination [lat, lng]
 * @returns {Promise<Array<[number, number]>>} Array of lat/lng route points
 */
export async function fetchGoogleDirections(origin, destination) {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('YOUR_GOOGLE_MAPS_API_KEY')) {
    console.log('Google Maps API key not configured in .env. Using fallback route.');
    return null;
  }

  try {
    const originStr = `${origin[0]},${origin[1]}`;
    const destStr = `${destination[0]},${destination[1]}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && data.routes && data.routes.length > 0) {
      const points = data.routes[0].overview_polyline.points;
      return decodePolyline(points);
    }
  } catch (err) {
    console.error('Error fetching Google Directions API:', err);
  }
  return null;
}

/**
 * Convert address string to Lat/Lng via Google Geocoding API
 * @param {string} address 
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export async function fetchGoogleGeocode(address) {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('YOUR_GOOGLE_MAPS_API_KEY')) {
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
  } catch (err) {
    console.error('Error in Google Geocoding API:', err);
  }
  return null;
}

/**
 * Calculate live traffic ETA using Google Distance Matrix API
 * @param {Array<number>} origin [lat, lng]
 * @param {Array<number>} destination [lat, lng]
 * @returns {Promise<{distanceText: string, durationText: string} | null>}
 */
export async function fetchGoogleDistanceMatrix(origin, destination) {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('YOUR_GOOGLE_MAPS_API_KEY')) {
    return null;
  }

  try {
    const originStr = `${origin[0]},${origin[1]}`;
    const destStr = `${destination[0]},${destination[1]}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&departure_time=now&key=${GOOGLE_MAPS_API_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const element = data.rows[0].elements[0];
      return {
        distanceText: element.distance.text,
        durationText: element.duration_in_traffic ? element.duration_in_traffic.text : element.duration.text
      };
    }
  } catch (err) {
    console.error('Error in Google Distance Matrix API:', err);
  }
  return null;
}

/**
 * Helper to decode Google Encoded Polyline algorithm into lat/lng pairs
 */
function decodePolyline(encoded) {
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}
