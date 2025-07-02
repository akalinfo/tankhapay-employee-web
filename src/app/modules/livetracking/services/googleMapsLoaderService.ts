import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private isLoaded = false;
  private googleApiKey = environment.googleMaps_ApiKey_For_LiveTracking;
  private loadPromise!: Promise<void>;

  load(): Promise<void> {
    if (this.isLoaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      if ((window as any).google?.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleApiKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = (err) => {
        console.error('Google Maps script load failed', err);
        reject(err);
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}
