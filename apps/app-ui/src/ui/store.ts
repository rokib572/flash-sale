import { configureStore, createSlice } from '@reduxjs/toolkit';

type UiState = {
  message: string | null;
};

const initialState: UiState = {
  message: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMessage(state, action: { payload: string | null }) {
      state.message = action.payload;
    },
    clearMessage(state) {
      state.message = null;
    },
  },
});

export const { setMessage, clearMessage } = uiSlice.actions;

type AuthState = {
  user: { email: string } | null;
  token: string | null;
};

const authInitial: AuthState = { user: null, token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitial,
  reducers: {
    loginSuccess(state, action: { payload: { email: string; token: string } }) {
      state.user = { email: action.payload.email };
      state.token = action.payload.token;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    auth: authSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
