import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import directoryReducer from './directorySlice';
import messagingReducer from './messagingSlice';
import connectionReducer from './connectionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    directory: directoryReducer,
    messaging: messagingReducer,
    connection: connectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
