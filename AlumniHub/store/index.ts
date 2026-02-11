import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import directoryReducer from './directorySlice';
import messagingReducer from './messagingSlice';
import connectionReducer from './connectionSlice';
import groupsReducer from './groupsSlice';
import eventsReducer from './eventsSlice';
import jobsReducer from './jobsSlice';
import mentorshipReducer from './mentorshipSlice';
import feedReducer from './feedSlice';
import notificationsReducer from './notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    directory: directoryReducer,
    messaging: messagingReducer,
    connection: connectionReducer,
    groups: groupsReducer,
    events: eventsReducer,
    jobs: jobsReducer,
    mentorship: mentorshipReducer,
    feed: feedReducer,
    notifications: notificationsReducer,
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
