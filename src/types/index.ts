export interface Translation {
  heroTitle: string;
  heroSubtitle: string;
  searchInputPlaceholder: string;
  searchButton: string;
  backButton: string;
  passengerLogin: string;
  driverLogin: string;
  mapTitle: string;
  passengerTab: string;
  driverTab: string;
  passengerWelcome: string;
  passengerSubtext: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  loginButton: string;
  orSignInWith: string;
  driverWelcome: string;
  driverSubtext: string;
  driverIdLabel: string;
  driverIdPlaceholder: string;
  otpLabel: string;
  otpPlaceholder: string;
  driverHelpText: string;
  liveTracking: string;
  nearbyStops: string;
  routeInfo: string;
}

export interface Translations {
  [key: string]: Translation;
}

export type Language = 'en' | 'hi' | 'te';

export interface BusLocation {
  id: string;
  lat: number;
  lng: number;
  route: string;
  nextStop: string;
  eta: number;
}