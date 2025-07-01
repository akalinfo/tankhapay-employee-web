// geofence.service.ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
declare var google: any;
interface CustomWindow extends Window {
  initMap?: () => void;
}

@Injectable({
  providedIn: 'root'
})

export class GeofencingService {
  constructor(private http: HttpClient,
  ) { }
  // private apiKey: string = 'AIzaSyAIJwu-8s3pbDcqdnZNjScNOIDl-Bz_SBc';
  private apiKey: string =environment.GOGOGLE_API_KEY_SELF; 
  private apiKeyMap: string =environment.GOGOGLE_API_KEY_SELF_MAP; 
  //'AIzaSyD-Ef4-DN62NTpKPxk0w4rwtF75heDatA8';
  private geocodingApiUrl: string = 'https://maps.googleapis.com/maps/api/geocode/json';
  private geofenceCenter: number | google.maps.LatLng | null = null;
  private geofenceRadius: number | null = null;
  private scriptLoaded = false;
    
  // for load js api start
  loadGoogleMapsScript(): Promise<void> {
    const apiKeyMap = this.apiKeyMap;

    return new Promise((resolve, reject) => {
      if (!this.scriptLoaded) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyMap}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;

        // Define the callback function
        (window as CustomWindow).initMap = () => {
          this.scriptLoaded = true;
          resolve();
        };

        // Attach the script to the document
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }
  // for load js api end

  setGeofence(latitude: number, longitude: number, radius: number): void {
    this.geofenceCenter = new google.maps.LatLng(latitude, longitude);
    this.geofenceRadius = radius;
  }

  // for check User location and destination location start
  isLocationInsideGeofence(latitude: number, longitude: number): boolean {
    if (!this.geofenceCenter || !this.geofenceRadius) {
      return false; // Geofence not set
    }
    const location = new google.maps.LatLng(latitude, longitude);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      this.geofenceCenter,
      location
    );
    return distance <= this.geofenceRadius;
  }
  // for check User location and destination location end

  getGeofenceCenter() {
    // Implement the logic to calculate and return the geofence center
    return { lat: 28.5581678, lng: 77.2084744 }; // Replace with your actual logic
  }
  getGeofenceRadius(): number {
    return 500; // Replace with your actual logic
  }


  //get current location start
  getCurrentLocation(): Promise<google.maps.LatLngLiteral> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: google.maps.LatLngLiteral = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            resolve(location);
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  }
  //get current location end

  async geocodeLocation(address: string, country: string): Promise<any> {
    await this.loadGoogleMapsScript();
    const geocoder = new google.maps.Geocoder();
    return await new Promise((resolve, reject) => {
      geocoder.geocode({ address: address, componentRestrictions: { country: country }  }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          resolve(results);
        } else {
          reject(`Geocode was not successful for the following reason: ${status}`);
        }
      });
    });
  }

  getPlacePredictions(input: string, country: string): Promise<any[]> {
    return this.loadGoogleMapsScript().then(() => {
      return new Promise((resolve, reject) => {
        const autocompleteService = new google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions({ input,  componentRestrictions: { country } }, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(predictions);
          } else {
            reject(`Autocomplete was not successful for the following reason: ${status}`);
          }
        });
      });
    });
  }

}
