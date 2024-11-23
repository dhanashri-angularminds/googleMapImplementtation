import { createReducer, on } from '@ngrx/store';
import { selectRegion, loadRegions } from './map.actions';

export interface Region {
  name: string;
  description: string;
  areaSize: number;
}

export interface MapState {
  regions: Region[]; 
  selectedRegion: Region | null;
}

export const initialState: MapState = {
  regions: [],
  selectedRegion: null
};

export const mapReducer = createReducer(
  initialState,
  on(selectRegion, (state, { region, isUpdate = true }) => ({
    ...state,
    selectedRegion: region,
    regions: isUpdate ? [...state.regions, region] : [...state.regions]  
  })),
  on(loadRegions, (state) => ({
    ...state
  }))
);
