/**
 * Utilidades de geolocalización
 * Incluye funciones para cálculo de distancias entre coordenadas
 */

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del primer punto (en grados)
 * @param lon1 Longitud del primer punto (en grados)
 * @param lat2 Latitud del segundo punto (en grados)
 * @param lon2 Longitud del segundo punto (en grados)
 * @returns Distancia en metros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Radio de la Tierra en metros
  const R = 6371000;

  // Convertir grados a radianes
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  // Fórmula de Haversine
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distancia en metros
  const distance = R * c;

  return distance;
}

/**
 * Formatea la distancia de manera legible
 * @param meters Distancia en metros
 * @returns String formateado (ej: "1.5 km" o "250 m")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Verifica si un punto está dentro de un radio específico desde un centro
 * @param centerLat Latitud del centro
 * @param centerLon Longitud del centro
 * @param pointLat Latitud del punto a verificar
 * @param pointLon Longitud del punto a verificar
 * @param radiusM Radio en metros
 * @returns true si el punto está dentro del radio
 */
export function isWithinRadius(
  centerLat: number,
  centerLon: number,
  pointLat: number,
  pointLon: number,
  radiusM: number
): boolean {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
  return distance <= radiusM;
}
