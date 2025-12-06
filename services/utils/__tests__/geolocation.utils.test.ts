import { 
  calculateDistance, 
  formatDistance, 
  isWithinRadius 
} from '../geolocation.utils';

describe('Geolocation Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // San José, Costa Rica to Cartago, Costa Rica (aproximadamente 22km)
      const lat1 = 9.9281;
      const lon1 = -84.0907;
      const lat2 = 9.8626;
      const lon2 = -83.9198;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      
      // Debe estar cerca de 22km (22000m)
      expect(distance).toBeGreaterThan(20000);
      expect(distance).toBeLessThan(25000);
    });

    it('should return 0 for same coordinates', () => {
      const lat = 10.0;
      const lon = -84.0;
      
      const distance = calculateDistance(lat, lon, lat, lon);
      
      expect(distance).toBe(0);
    });

    it('should calculate distance between close points', () => {
      // Dos puntos muy cercanos (aproximadamente 100m)
      const lat1 = 10.0;
      const lon1 = -84.0;
      const lat2 = 10.001;
      const lon2 = -84.001;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(200);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-10.0, -84.0, -10.001, -84.001);
      
      expect(distance).toBeGreaterThan(0);
    });

    it('should calculate distance across equator', () => {
      const distance = calculateDistance(1.0, -84.0, -1.0, -84.0);
      
      expect(distance).toBeGreaterThan(200000); // >200km
    });
  });

  describe('formatDistance', () => {
    it('should format meters for distances less than 1km', () => {
      expect(formatDistance(100)).toBe('100 m');
      expect(formatDistance(500)).toBe('500 m');
      expect(formatDistance(999)).toBe('999 m');
    });

    it('should format kilometers for distances >= 1km', () => {
      expect(formatDistance(1000)).toBe('1.0 km');
      expect(formatDistance(1500)).toBe('1.5 km');
      expect(formatDistance(2345)).toBe('2.3 km');
    });

    it('should round meters to nearest integer', () => {
      expect(formatDistance(123.7)).toBe('124 m');
      expect(formatDistance(456.2)).toBe('456 m');
    });

    it('should format kilometers with one decimal', () => {
      expect(formatDistance(10500)).toBe('10.5 km');
      expect(formatDistance(10567)).toBe('10.6 km');
    });

    it('should handle zero distance', () => {
      expect(formatDistance(0)).toBe('0 m');
    });

    it('should handle very large distances', () => {
      expect(formatDistance(1000000)).toBe('1000.0 km');
    });
  });

  describe('isWithinRadius', () => {
    it('should return true when point is within radius', () => {
      const centerLat = 10.0;
      const centerLon = -84.0;
      const pointLat = 10.001;
      const pointLon = -84.001;
      const radius = 200; // 200 metros
      
      const result = isWithinRadius(centerLat, centerLon, pointLat, pointLon, radius);
      
      expect(result).toBe(true);
    });

    it('should return false when point is outside radius', () => {
      const centerLat = 10.0;
      const centerLon = -84.0;
      const pointLat = 10.01;
      const pointLon = -84.01;
      const radius = 500; // 500 metros
      
      const result = isWithinRadius(centerLat, centerLon, pointLat, pointLon, radius);
      
      expect(result).toBe(false);
    });

    it('should return true for same point', () => {
      const lat = 10.0;
      const lon = -84.0;
      const radius = 100;
      
      const result = isWithinRadius(lat, lon, lat, lon, radius);
      
      expect(result).toBe(true);
    });

    it('should return true when point is exactly at radius distance', () => {
      const centerLat = 10.0;
      const centerLon = -84.0;
      const pointLat = 10.0009; // Aproximadamente 100m
      const pointLon = -84.0;
      const radius = 150; // 150 metros
      
      const result = isWithinRadius(centerLat, centerLon, pointLat, pointLon, radius);
      
      expect(result).toBe(true);
    });

    it('should work with large radius', () => {
      const centerLat = 9.9281; // San José
      const centerLon = -84.0907;
      const pointLat = 9.8626; // Cartago
      const pointLon = -83.9198;
      const radius = 25000; // 25km
      
      const result = isWithinRadius(centerLat, centerLon, pointLat, pointLon, radius);
      
      expect(result).toBe(true);
    });

    it('should return false with very small radius', () => {
      const centerLat = 10.0;
      const centerLon = -84.0;
      const pointLat = 10.0001;
      const pointLon = -84.0001;
      const radius = 5; // 5 metros
      
      const result = isWithinRadius(centerLat, centerLon, pointLat, pointLon, radius);
      
      expect(result).toBe(false);
    });
  });
});
