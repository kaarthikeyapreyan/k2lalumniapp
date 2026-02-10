import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchConversation, sendNewMessage, addOptimisticMessage } from '../../store/messagingSlice';
import { Message, MessageType } from '../../types';
import { mockProfiles } from '../../mock/data/profiles';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentConversation } = useSelector((state: RootState) => state.messaging);
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchConversation(id));
    }
  }, [id, dispatch]);

  const getOtherUser = () => {
    if (!currentConversation || !user) return null;
    const otherId = currentConversation.participants.find((p) => p !== user.id);
    return mockProfiles.find((profile) => profile.id === otherId);
  };

  const otherUser = getOtherUser();

  const handleSend = () => {
    if (!message.trim() || !user || !currentConversation) return;

    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      senderId: user.id,
      recipientId: currentConversation.participants.find((p) => p !== user.id) || '',
      content: message.trim(),
      timestamp: Date.now(),
      type: MessageType.TEXT,
      reactions: {},
      read: false,
      status: 'sending',
    };

    dispatch(addOptimisticMessage(optimisticMessage));
    setMessage('');

    dispatch(
      sendNewMessage({
        conversationId: currentConversation.id,
        senderId: user.id,
        content: message.trim(),
      })
    );
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage
              ? { backgroundColor: theme.colors.primary }
              : { backgroundColor: theme.colors.grey1 },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isOwnMessage ? '#fff' : theme.colors.black },
            ]}
          >
            {item.content}
          </Text>
        </View>
        <Text style={[styles.messageTime, { color: theme.colors.grey4 }]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.grey0 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <Avatar
          size={40}
          rounded
          source={otherUser?.avatar ? { uri: otherUser.avatar } : undefined}
          title={otherUser?.name?.charAt(0) || 'U'}
          containerStyle={{ backgroundColor: theme.colors.primary }}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: theme.colors.black }]}>
            {otherUser?.name || 'User'}
          </Text>
          <Text style={[styles.headerStatus, { color: theme.colors.grey5 }]}>Online</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.grey5} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={currentConversation?.messages || []}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.grey0 }]}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle-outline" size={28} color={theme.colors.grey5} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: theme.colors.black, backgroundColor: theme.colors.background }]}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.grey3}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim()}
          style={[
            styles.sendButton,
            { backgroundColor: message.trim() ? theme.colors.primary : theme.colors.grey2 },
          ]}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerStatus: {
    fontSize: 12,
  },
  moreButton: {
    padding: 5,
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '75%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  attachButton: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
