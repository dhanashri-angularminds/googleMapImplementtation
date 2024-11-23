import { Component, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectRegionDetails,
  selectRegions,
} from '../../store/map/map.selectors';
import { loadRegions, selectRegion } from '../../store/map/map.actions';
import 'leaflet-draw';
import { Region } from '../../store/map/map.reducer';
import { MapDataService } from 'src/app/services/map-data.service';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private map!: L.Map;
  private drawnItems: L.FeatureGroup = new L.FeatureGroup();

  @ViewChild('modalBtn') modalBtn: any;

  regionDetails$: Observable<any>;

  regions$: Observable<Region[]>;

  constructor(private store: Store, private mapDataService: MapDataService) {
    this.regionDetails$ = this.store.select(selectRegionDetails);
    this.regions$ = this.store.select(selectRegions);
  }

  ngOnInit(): void {
    this.initMap();
    this.store.dispatch(loadRegions());
  }

  private initMap(): void {

    this.map = L.map('map', {
      center: [18.5204, 73.8567],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    const drawFeatureGroup = new L.FeatureGroup();
    this.map.addLayer(drawFeatureGroup);
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems,
        remove: true,edit:false
      },
      draw: {
        rectangle: false,
        polyline: false,
        circlemarker: false,
        marker: false
      }
    });

    this.map.addControl(drawControl);

    this.map.addLayer(this.drawnItems);

    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      this.handleShapeDrawn(event);
    });
  }

  private async handleShapeDrawn(event: any) {
    const layer = event.layer;

    this.drawnItems.addLayer(layer);

    const areaDetails = await this.getRegionData(layer);

    layer.bindPopup(
      `<b>Region:</b> ${areaDetails.name}<br>
       <b>Description:</b> ${areaDetails.description}<br>
       <b>Area Size:</b> ${areaDetails.areaSize} sq km`
    ).openPopup();

    layer['regionDetails'] = areaDetails;

    this.store.dispatch(selectRegion({ region: areaDetails, isUpdate: true }));

    layer.on("click", () => {
      const selectedRegion = layer['regionDetails'];
      this.store.dispatch(selectRegion({ region: areaDetails, isUpdate: false }));
      this.modalBtn.nativeElement.click();
    });
  }

  private async getRegionData(layer: L.Layer) {
    let backdata: any;

    if (layer instanceof L.Polygon) {
      const polygonLayer: any = layer as L.Polygon;
      const center = polygonLayer.getBounds().getCenter();
      let area = this.calculateArea(polygonLayer.getLatLngs()[0])
      backdata = await this.getDataFromBackend(center.lat, center.lng, area);

    } else if (layer instanceof L.Circle) {
      const center = layer.getLatLng();
      backdata = await this.getDataFromBackend(center.lat, center.lng, this.calculateAreaFromRadius(layer.getRadius()))
    }

    return {
      name: backdata.name,
      description: backdata.description,
      areaSize: backdata.areaSize,
    };
  }

  getDataFromBackend(lat: number, lon: number, areaval: any) {
    return new Promise((res, rej) => {
      this.mapDataService.getData(lat, lon).subscribe(async (data: any) => {
        if (data.results && data.results.length > 0) {
          let name = await this.mapDataService.getDetailedAreaName(lat, lon)
          const result = data.results[0];
          let description = result.formatted_address;
          let areaSize = areaval;
          // const country = result.address_components.find((component: any) => component.types.includes('country'));
          // const state = result.address_components.find((component: any) => component.types.includes('administrative_area_level_1'));
          // const city = result.address_components.find((component: any) => component.types.includes('locality'));

          res({
            name: name,
            description: description,
            areaSize: areaSize,
          })
        } else {
          res(null)
        }
      })
    })
  }


  private calculateArea(lat: any) {
    const area = L.GeometryUtil.geodesicArea(lat);
    return Number(`${(area / 1000000).toFixed(2)}`);
  }

  calculateAreaFromRadius(radius: number): number {
    const area = Math.PI * Math.pow(radius, 2);
    return Number(`${(area / 1000000).toFixed(2)}`);;
  }
}
