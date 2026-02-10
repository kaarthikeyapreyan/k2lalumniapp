import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EventsState, Event, EventType, RSVPStatus, EventFilterOptions } from '../types';
import * as eventService from '../mock/services/eventService';

const initialState: EventsState = {
  events: [],
  myEvents: [],
  currentEvent: null,
  isLoading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (filters: EventFilterOptions | undefined, { rejectWithValue }) => {
    try {
      return await eventService.getEvents(filters);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  'events/fetchMyEvents',
  async (_, { rejectWithValue }) => {
    try {
      return await eventService.getMyEvents();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (eventId: string, { rejectWithValue }) => {
    try {
      return await eventService.getEventById(eventId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (data: {
    title: string;
    description: string;
    type: EventType;
    startDate: number;
    endDate: number;
    location: {
      name: string;
      address?: string;
      city?: string;
      coordinates?: { latitude: number; longitude: number };
      virtual?: boolean;
      virtualLink?: string;
    };
    capacity?: number;
    categories: string[];
    speakers?: string[];
    image?: string;
    groupId?: string;
  }, { rejectWithValue }) => {
    try {
      return await eventService.createEvent(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rsvpToEvent = createAsyncThunk(
  'events/rsvpToEvent',
  async (data: { eventId: string; status: RSVPStatus }, { rejectWithValue }) => {
    try {
      return await eventService.rsvpToEvent(data.eventId, data.status);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUpcomingEvents = createAsyncThunk(
  'events/fetchUpcomingEvents',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      return await eventService.getUpcomingEvents(limit);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
      state.currentEvent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch my events
      .addCase(fetchMyEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myEvents = action.payload;
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch event by id
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.unshift(action.payload);
        state.myEvents.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // RSVP to event
      .addCase(rsvpToEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rsvpToEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const eventIndex = state.events.findIndex(e => e.id === action.payload.id);
        if (eventIndex !== -1) {
          state.events[eventIndex] = action.payload;
        }
        const myEventIndex = state.myEvents.findIndex(e => e.id === action.payload.id);
        if (myEventIndex !== -1) {
          state.myEvents[myEventIndex] = action.payload;
        }
        if (state.currentEvent?.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
      })
      .addCase(rsvpToEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch upcoming events
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update or add upcoming events to the list
        action.payload.forEach(upcomingEvent => {
          const index = state.events.findIndex(e => e.id === upcomingEvent.id);
          if (index === -1) {
            state.events.push(upcomingEvent);
          }
        });
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
