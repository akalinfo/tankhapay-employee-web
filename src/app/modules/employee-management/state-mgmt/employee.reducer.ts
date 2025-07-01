import { createReducer, on } from '@ngrx/store';
import { setActiveMenu } from './employee.actions';

export interface MenuState {
  activeMenu: string;
}

export const initialState: MenuState = {
  activeMenu: localStorage.getItem('empmgmt') ? localStorage.getItem('empmgmt') :'Profile',  // default active menu
};

export const menuReducer = createReducer(
  initialState,
  on(setActiveMenu, (state, { activeMenu }) => ({ ...state, activeMenu }))
);
