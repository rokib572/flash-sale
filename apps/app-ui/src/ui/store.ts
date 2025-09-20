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

type AuthUser = { id: string; email: string; givenName: string; familyName: string };
type AuthState = { user: AuthUser | null; token: string | null };

const authInitial: AuthState = { user: null, token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitial,
  reducers: {
    hydrateAuth(state, action: { payload: AuthState }) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginSuccess(state, action: { payload: { token: string; user: AuthUser } }) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
});

export const { loginSuccess, logout, hydrateAuth } = authSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    auth: authSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Persistence helpers
const STORAGE_KEY = 'auth';
const loadAuth = (): AuthState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
};
const saveAuth = (state: RootState) => {
  try {
    const data: AuthState = { token: state.auth.token, user: state.auth.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

export const initAuthPersistence = () => {
  // hydrate once
  const initial = typeof window !== 'undefined' ? loadAuth() : null;
  if (initial) store.dispatch(hydrateAuth(initial));
  // subscribe to changes
  let prev: string | null = null;
  store.subscribe(() => {
    const current = JSON.stringify({ token: store.getState().auth.token, user: store.getState().auth.user });
    if (current !== prev) {
      prev = current;
      saveAuth(store.getState());
    }
  });
};
