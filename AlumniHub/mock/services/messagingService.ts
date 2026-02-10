import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { Conversation, Message, MessageType } from '../../types';
import { createMockConversation } from '../data/messages';

const conversationsMap = new Map<string, Conversation>();

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to load conversations. Please try again.');
  }
  
  const userConversations = Array.from(conversationsMap.values()).filter(conv =>
    conv.participants.includes(userId)
  );
  
  return userConversations.sort((a, b) => {
    const aTime = a.lastMessage?.timestamp || 0;
    const bTime = b.lastMessage?.timestamp || 0;
    return bTime - aTime;
  });
};

export const getConversation = async (conversationId: string): Promise<Conversation> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to load conversation. Please try again.');
  }
  
  const conversation = conversationsMap.get(conversationId);
  
  if (!conversation) {
    throw new Error('Conversation not found');
  }
  
  return conversation;
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to load messages. Please try again.');
  }
  
  const conversation = conversationsMap.get(conversationId);
  
  if (!conversation) {
    return [];
  }
  
  return conversation.messages;
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  type: MessageType = MessageType.TEXT
): Promise<Message> => {
  await mockDelay(200, 500);
  
  if (shouldFail()) {
    throw new Error('Failed to send message. Please try again.');
  }
  
  let conversation = conversationsMap.get(conversationId);
  
  if (!conversation) {
    const recipientId = conversationId.replace(`conv_${senderId}_`, '');
    conversation = createMockConversation(senderId, recipientId, 0);
    conversationsMap.set(conversationId, conversation);
  }
  
  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    senderId,
    recipientId: conversation.participants.find(p => p !== senderId) || '',
    content,
    timestamp: Date.now(),
    type,
    reactions: {},
    read: false,
    status: 'sent',
  };
  
  conversation.messages.push(newMessage);
  conversation.lastMessage = newMessage;
  
  return newMessage;
};

export const markAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  await mockDelay(100, 200);
  
  const conversation = conversationsMap.get(conversationId);
  
  if (!conversation) {
    return;
  }
  
  conversation.messages.forEach(message => {
    if (message.recipientId === userId) {
      message.read = true;
    }
  });
  
  conversation.unreadCount = 0;
};

export const createConversation = async (
  currentUserId: string,
  otherUserId: string
): Promise<Conversation> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to create conversation. Please try again.');
  }
  
  const conversationId = `conv_${currentUserId}_${otherUserId}`;
  let conversation = conversationsMap.get(conversationId);
  
  if (!conversation) {
    conversation = createMockConversation(currentUserId, otherUserId, 0);
    conversationsMap.set(conversationId, conversation);
  }
  
  return conversation;
};

export const simulateIncomingMessage = (
  conversationId: string,
  senderId: string,
  content: string
): Message => {
  const conversation = conversationsMap.get(conversationId);
  
  if (!conversation) {
    return null as any;
  }
  
  const newMessage: Message = {
    id: `msg_incoming_${Date.now()}`,
    senderId,
    recipientId: conversation.participants.find(p => p !== senderId) || '',
    content,
    timestamp: Date.now(),
    type: MessageType.TEXT,
    reactions: {},
    read: false,
    status: 'sent',
  };
  
  conversation.messages.push(newMessage);
  conversation.lastMessage = newMessage;
  conversation.unreadCount += 1;
  
  return newMessage;
};
