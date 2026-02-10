import { Message, Conversation, MessageType } from '../../types';

const sampleMessages = [
  "Hey! How's it going?",
  "Great to connect with you!",
  "I saw your profile and wanted to reach out.",
  "Would love to chat about your experience at the company.",
  "Thanks for accepting my connection request!",
  "Are you attending the alumni event next month?",
  "I'm working on a similar project, would love your insights.",
  "Hope you're doing well!",
  "Long time no see! How have you been?",
  "Congratulations on your new role!",
  "I'd love to learn more about your transition to your current field.",
  "Do you have time for a quick call this week?",
  "Thanks for the advice, it was really helpful!",
  "I'm currently looking for opportunities in your industry.",
  "Would you be open to a coffee chat sometime?",
];

export const generateMockMessages = (
  senderId: string,
  recipientId: string,
  count: number = 10
): Message[] => {
  const messages: Message[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const isFromSender = i % 2 === 0;
    messages.push({
      id: `msg_${senderId}_${recipientId}_${i}`,
      senderId: isFromSender ? senderId : recipientId,
      recipientId: isFromSender ? recipientId : senderId,
      content: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
      timestamp: now - (count - i) * 3600000,
      type: MessageType.TEXT,
      reactions: {},
      read: i < count - 2,
      status: 'sent',
    });
  }
  
  return messages;
};

export const createMockConversation = (
  currentUserId: string,
  otherUserId: string,
  messageCount: number = 10
): Conversation => {
  const messages = generateMockMessages(currentUserId, otherUserId, messageCount);
  const lastMessage = messages[messages.length - 1];
  const unreadCount = messages.filter(m => m.recipientId === currentUserId && !m.read).length;
  
  return {
    id: `conv_${currentUserId}_${otherUserId}`,
    participants: [currentUserId, otherUserId],
    messages,
    lastMessage,
    unreadCount,
    isGroup: false,
  };
};
