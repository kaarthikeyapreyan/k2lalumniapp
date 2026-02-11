import { FeedItem, FeedComment, Notification, NotificationType } from '../../types';

export type WebSocketEventType = 
  | 'feed_update'
  | 'new_post'
  | 'post_like'
  | 'post_comment'
  | 'post_share'
  | 'notification';

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: FeedItem | FeedComment | Notification | { postId: string; userId: string };
  timestamp: number;
}

type EventHandler = (event: WebSocketEvent) => void;

class MockWebSocketService {
  private listeners: Map<WebSocketEventType, EventHandler[]> = new Map();
  private isConnected: boolean = false;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private eventSimulationInterval: NodeJS.Timeout | null = null;
  private connectionId: string = '';

  connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.connectionId = `ws_${Date.now()}`;
        this.startEventSimulation();
        console.log('[WebSocket] Connected:', this.connectionId);
        resolve();
      }, 500);
    });
  }

  disconnect(): void {
    this.isConnected = false;
    this.stopEventSimulation();
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    console.log('[WebSocket] Disconnected');
  }

  isConnectedStatus(): boolean {
    return this.isConnected;
  }

  subscribe(eventType: WebSocketEventType, handler: EventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(handler);

    return () => {
      const handlers = this.listeners.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  private emit(eventType: WebSocketEventType, data: WebSocketEvent['data']): void {
    const event: WebSocketEvent = {
      type: eventType,
      data,
      timestamp: Date.now(),
    };

    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  private startEventSimulation(): void {
    // Simulate random events every 30-60 seconds
    this.eventSimulationInterval = setInterval(() => {
      if (!this.isConnected) return;
      this.simulateRandomEvent();
    }, 30000 + Math.random() * 30000);
  }

  private stopEventSimulation(): void {
    if (this.eventSimulationInterval) {
      clearInterval(this.eventSimulationInterval);
      this.eventSimulationInterval = null;
    }
  }

  private simulateRandomEvent(): void {
    const events: WebSocketEventType[] = ['new_post', 'post_like', 'post_comment', 'notification'];
    const randomEvent = events[Math.floor(Math.random() * events.length)];

    switch (randomEvent) {
      case 'new_post':
        this.simulateNewPost();
        break;
      case 'post_like':
        this.simulatePostLike();
        break;
      case 'post_comment':
        this.simulatePostComment();
        break;
      case 'notification':
        this.simulateNotification();
        break;
    }
  }

  private simulateNewPost(): void {
    const mockUserIds = ['user_002', 'user_003', 'user_004', 'user_005', 'user_006'];
    const randomUserId = mockUserIds[Math.floor(Math.random() * mockUserIds.length)];
    
    const newPost: FeedItem = {
      id: `feed_sim_${Date.now()}`,
      type: 'post' as const,
      authorId: randomUserId,
      content: 'Just shared a quick update from the alumni network! 🚀',
      timestamp: Date.now(),
      likes: [],
      comments: [],
      shares: [],
      views: 0,
      isPinned: false,
      isEdited: false,
    };

    this.emit('new_post', newPost);
  }

  private simulatePostLike(): void {
    const mockPostIds = ['feed_001', 'feed_002', 'feed_003', 'feed_008', 'feed_010'];
    const randomPostId = mockPostIds[Math.floor(Math.random() * mockPostIds.length)];
    const mockUserIds = ['user_002', 'user_003', 'user_004', 'user_005'];
    const randomUserId = mockUserIds[Math.floor(Math.random() * mockUserIds.length)];

    this.emit('post_like', { postId: randomPostId, userId: randomUserId });
  }

  private simulatePostComment(): void {
    const mockPostIds = ['feed_001', 'feed_002', 'feed_003', 'feed_010'];
    const randomPostId = mockPostIds[Math.floor(Math.random() * mockPostIds.length)];
    const mockUserIds = ['user_002', 'user_003', 'user_004', 'user_005', 'user_006'];
    const randomUserId = mockUserIds[Math.floor(Math.random() * mockUserIds.length)];

    const commentTexts = [
      'Great post! Thanks for sharing. 👍',
      'This is really helpful!',
      'Couldn\'t agree more!',
      'Thanks for the insights!',
      'Well said! 🎯',
    ];

    const newComment: FeedComment = {
      id: `comment_sim_${Date.now()}`,
      postId: randomPostId,
      authorId: randomUserId,
      content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
      timestamp: Date.now(),
      likes: [],
    };

    this.emit('post_comment', newComment);
  }

  private simulateNotification(): void {
    const mockUserIds = ['user_002', 'user_003', 'user_004', 'user_005', 'user_006'];
    const randomUserId = mockUserIds[Math.floor(Math.random() * mockUserIds.length)];
    const notificationTypes = [NotificationType.POST_LIKE, NotificationType.POST_COMMENT, NotificationType.MENTION];
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

    const notification: Notification = {
      id: `notif_sim_${Date.now()}`,
      type: randomType,
      title: randomType === NotificationType.POST_LIKE ? 'New Like' : 
             randomType === NotificationType.POST_COMMENT ? 'New Comment' : 'New Mention',
      message: `User ${randomUserId} interacted with your content`,
      timestamp: Date.now(),
      isRead: false,
      senderId: randomUserId,
    };

    this.emit('notification', notification);
  }

  // Public methods to manually trigger events (for testing)
  triggerNewPost(post: FeedItem): void {
    this.emit('new_post', post);
  }

  triggerPostLike(postId: string, userId: string): void {
    this.emit('post_like', { postId, userId });
  }

  triggerPostComment(comment: FeedComment): void {
    this.emit('post_comment', comment);
  }

  triggerNotification(notification: Notification): void {
    this.emit('notification', notification);
  }
}

export const websocketService = new MockWebSocketService();
export default websocketService;
