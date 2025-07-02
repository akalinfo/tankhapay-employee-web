// filter.actions.ts
import { createAction, props } from '@ngrx/store';

export const setFilters = createAction(
  '[Filters] Set Filters',
  props<{ filters: any }>()
);

export const clearFilters = createAction('[Filters] Clear Filters');
