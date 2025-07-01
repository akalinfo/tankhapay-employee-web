import { createAction, props } from '@ngrx/store';

export const setActiveMenu = createAction(
  '[Menu] Set Active Menu',
  props<{ activeMenu: string }>()
);
