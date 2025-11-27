export const a11yStrings = {
  back: 'Go back',
  closeSearch: 'Close search',
  searchCityTitle: 'Search City',
  aboutTitle: 'About',
  qiblaFinderTitle: 'Qibla Finder',
  currentLocation: 'Current Location',
  retryGPS: 'Retry GPS',
  searchCity: 'Search City',
  useCurrentLocation: 'Use Current Location',
  resultsFound: (count: number) => count === 0 ? 'No cities found' : `${count} ${count === 1 ? 'result' : 'results'} found`,
  selectedCity: (name: string) => `Selected ${name}`,
  manualLocation: (city: string) => `Location ${city}`,
};

export type A11yStrings = typeof a11yStrings;
