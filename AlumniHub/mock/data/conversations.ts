import { Conversation } from '../../types';
import { createMockConversation } from './messages';
import { mockProfiles, currentUserProfile } from './profiles';

export const initializeConversations = (): Conversation[] => {
  const conversations: Conversation[] = [];
  
  for (let i = 0; i < 5; i++) {
    const otherUser = mockProfiles[i];
    const conversation = createMockConversation(
      currentUserProfile.id,
      otherUser.id,
      Math.floor(Math.random() * 15) + 5
    );
    conversations.push(conversation);
  }
  
  return conversations;
};
