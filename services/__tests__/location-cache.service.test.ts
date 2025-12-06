import { locationCacheService } from '../location-cache.service';

describe('LocationCacheService', () => {
  beforeEach(() => {
    // Clear any cached location before each test
    locationCacheService.getAndClearLocation();
  });

  it('should set and retrieve location', () => {
    const location = {
      address: 'Test Address',
      lat: 10.0,
      lon: -84.0,
    };

    locationCacheService.setLocation(location);
    expect(locationCacheService.hasLocation()).toBe(true);

    const retrieved = locationCacheService.getAndClearLocation();
    expect(retrieved).toEqual(location);
  });

  it('should clear location after getting it', () => {
    const location = {
      address: 'Test Address',
      lat: 10.0,
      lon: -84.0,
    };

    locationCacheService.setLocation(location);
    locationCacheService.getAndClearLocation();
    
    expect(locationCacheService.hasLocation()).toBe(false);
    expect(locationCacheService.getAndClearLocation()).toBeNull();
  });

  it('should return null when no location is cached', () => {
    expect(locationCacheService.getAndClearLocation()).toBeNull();
  });

  it('should return false when checking if has location with no cache', () => {
    expect(locationCacheService.hasLocation()).toBe(false);
  });

  it('should overwrite previous location when setting new one', () => {
    const location1 = { address: 'Address 1', lat: 10.0, lon: -84.0 };
    const location2 = { address: 'Address 2', lat: 11.0, lon: -85.0 };

    locationCacheService.setLocation(location1);
    locationCacheService.setLocation(location2);

    const retrieved = locationCacheService.getAndClearLocation();
    expect(retrieved).toEqual(location2);
  });
});
