import { createAction, props } from '@ngrx/store';
import { Region } from './map.reducer';

export const loadRegions = createAction('[Map] Load Regions');

export const loadRegionsSuccess = createAction(
  '[Map] Load Regions Success',
  props<{ regions: Region[] }>() 
);

export const selectRegion = createAction(
  '[Map] Select Region',
  props<{ region: Region, isUpdate : boolean }>()
);
