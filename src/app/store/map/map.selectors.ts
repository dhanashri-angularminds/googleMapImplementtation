import { createSelector, createFeatureSelector } from '@ngrx/store';
import { MapState } from './map.reducer';

export const selectMapState = createFeatureSelector<MapState>('map');

export const selectRegionDetails = createSelector(
  selectMapState,
  (state) => state.selectedRegion
);

export const selectRegions = createSelector(
  selectMapState,
  (state) => state.regions  
);
