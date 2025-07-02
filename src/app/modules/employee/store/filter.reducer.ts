import { createReducer, on } from '@ngrx/store';
import { setFilters, clearFilters } from './filter.actions';

export interface FilterState {
  keyword: string;
  department: any;
  designation: any;
  status: string;
  orgUnit: any;
}

export const initialState: FilterState = {
  keyword: '',
  department: [],
  designation: [],
  status: 'Active',
  orgUnit: []
};

const _filtersReducer = createReducer(
  initialState,
  on(setFilters, (state, { filters }) => ({ ...state, ...filters })),
  on(clearFilters, () => initialState)
);

export function filtersReducer(state: any, action: any) {
  return _filtersReducer(state, action);
}
