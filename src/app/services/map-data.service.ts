import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  apiKey = environment.mapbox.accessToken; 
  constructor(private http:HttpClient) { }

  getData(lat:any,lon:any){
  return  this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${this.apiKey}`)
  }

   async getDetailedAreaName(lat: number, lon: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  
    try {
      const response = await this.http.get<any>(url).toPromise();
  
      if (response && response.address) {
        const address = response.address;

        const areaName =
          address.neighbourhood || 
          address.suburb ||        
          address.village ||      
          address.hamlet ||        
          address.town ||          
          address.city ||          
          address.state ||         
          'Unknown Area';        

        return areaName;
      }
      return 'Unknown Area'; 
    } catch (error) {
      console.error('Error fetching area name:', error);
      return 'Error fetching area';
    }
  }
}
