import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { Event, RSVPStatus, EventType, EventFilterOptions } from '../../types';
import { mockEvents } from '../data/events';
import { currentUserProfile } from '../data/profiles';

let events = [...mockEvents];

export const getEvents = async (filters?: EventFilterOptions): Promise<Event[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch events');
  
  let filteredEvents = [...events];
  
  if (filters) {
    if (filters.types?.length) {
      filteredEvents = filteredEvents.filter(e => filters.types!.includes(e.type));
    }
    if (filters.dateRange) {
      filteredEvents = filteredEvents.filter(
        e => e.startDate >= filters.dateRange!.start && e.startDate <= filters.dateRange!.end
      );
    }
    if (filters.locations?.length) {
      filteredEvents = filteredEvents.filter(
        e => e.location.city && filters.locations!.some(loc => e.location.city!.includes(loc))
      );
    }
    if (filters.virtual !== undefined) {
      filteredEvents = filteredEvents.filter(e => e.location.virtual === filters.virtual);
    }
  }
  
  return filteredEvents.sort((a, b) => a.startDate - b.startDate);
};

export const getEventById = async (eventId: string): Promise<Event> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch event details');
  
  const event = events.find(e => e.id === eventId);
  if (!event) throw new Error('Event not found');
  return event;
};

export const getMyEvents = async (): Promise<Event[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch your events');
  
  return events.filter(
    e => e.attendees.some(a => a.userId === currentUserProfile.id) || e.createdBy === currentUserProfile.id
  );
};

export const createEvent = async (data: {
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
}): Promise<Event> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to create event');
  
  const newEvent: Event = {
    id: `event_${Date.now()}`,
    title: data.title,
    description: data.description,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate,
    location: data.location,
    capacity: data.capacity,
    categories: data.categories,
    speakers: [],
    hosts: [currentUserProfile.id],
    attendees: [],
    attendeeCount: 0,
    createdBy: currentUserProfile.id,
    groupId: data.groupId,
    createdAt: Date.now(),
    image: data.image,
  };
  
  events = [...events, newEvent];
  return newEvent;
};

export const updateEvent = async (
  eventId: string,
  data: Partial<Event>
): Promise<Event> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to update event');
  
  const eventIndex = events.findIndex(e => e.id === eventId);
  if (eventIndex === -1) throw new Error('Event not found');
  
  const updatedEvent = { ...events[eventIndex], ...data };
  events = [
    ...events.slice(0, eventIndex),
    updatedEvent,
    ...events.slice(eventIndex + 1),
  ];
  return updatedEvent;
};

export const rsvpToEvent = async (
  eventId: string,
  status: RSVPStatus
): Promise<Event> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to update RSVP');
  
  const eventIndex = events.findIndex(e => e.id === eventId);
  if (eventIndex === -1) throw new Error('Event not found');
  
  const event = events[eventIndex];
  const existingAttendeeIndex = event.attendees.findIndex(
    a => a.userId === currentUserProfile.id
  );
  
  let updatedAttendees;
  if (existingAttendeeIndex >= 0) {
    updatedAttendees = event.attendees.map((a, idx) =>
      idx === existingAttendeeIndex
        ? { ...a, status, rsvpAt: Date.now() }
        : a
    );
  } else {
    updatedAttendees = [
      ...event.attendees,
      {
        userId: currentUserProfile.id,
        status,
        rsvpAt: Date.now(),
      },
    ];
  }
  
  const attendeeCount = status === RSVPStatus.NOT_GOING
    ? Math.max(0, event.attendeeCount - (existingAttendeeIndex >= 0 ? 1 : 0))
    : event.attendeeCount + (existingAttendeeIndex >= 0 ? 0 : 1);
  
  const updatedEvent = {
    ...event,
    attendees: updatedAttendees,
    attendeeCount,
    userRSVP: status,
  };
  
  events = [
    ...events.slice(0, eventIndex),
    updatedEvent,
    ...events.slice(eventIndex + 1),
  ];
  return updatedEvent;
};

export const inviteToEvent = async (
  eventId: string,
  userId: string
): Promise<Event> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to send invitation');
  
  const eventIndex = events.findIndex(e => e.id === eventId);
  if (eventIndex === -1) throw new Error('Event not found');
  
  const event = events[eventIndex];
  const alreadyInvited = event.attendees.some(a => a.userId === userId);
  
  if (alreadyInvited) {
    return event;
  }
  
  const updatedEvent = {
    ...event,
    attendees: [
      ...event.attendees,
      { userId, status: RSVPStatus.INTERESTED, rsvpAt: Date.now() },
    ],
  };
  
  events = [
    ...events.slice(0, eventIndex),
    updatedEvent,
    ...events.slice(eventIndex + 1),
  ];
  return updatedEvent;
};

export const cancelEvent = async (eventId: string): Promise<void> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to cancel event');
  
  const event = events.find(e => e.id === eventId);
  if (!event) throw new Error('Event not found');
  
  events = events.map(e =>
    e.id === eventId ? { ...e, isActive: false } : e
  );
};

export const getUpcomingEvents = async (limit: number = 5): Promise<Event[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch upcoming events');
  
  const now = Date.now();
  return events
    .filter(e => e.startDate > now)
    .sort((a, b) => a.startDate - b.startDate)
    .slice(0, limit);
};

export const getGroupEvents = async (groupId: string): Promise<Event[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch group events');
  
  return events
    .filter(e => e.groupId === groupId)
    .sort((a, b) => a.startDate - b.startDate);
};

export const getEventTypes = (): { value: EventType; label: string }[] => [
  { value: EventType.REUNION, label: 'Reunion' },
  { value: EventType.CAREER, label: 'Career' },
  { value: EventType.NETWORKING, label: 'Networking' },
  { value: EventType.SOCIAL, label: 'Social' },
  { value: EventType.EDUCATIONAL, label: 'Educational' },
  { value: EventType.SPORTS, label: 'Sports' },
  { value: EventType.CHARITY, label: 'Charity' },
];

export const getEventCategories = (): string[] => [
  'Networking',
  'Career',
  'Social',
  'Education',
  'Leadership',
  'Tech',
  'Finance',
  'Entrepreneurship',
  'Diversity',
  'AI',
  'Machine Learning',
  'Sports',
  'Charity',
  'Community',
  'Product',
  'B2B SaaS',
];
