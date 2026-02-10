import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Button, Divider } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { createGroup, clearError } from '../../store/groupsSlice';
import { GroupType, GroupPrivacy } from '../../types';

const groupTypes = [
  { value: GroupType.BATCH, label: 'Batch Group', icon: 'school' },
  { value: GroupType.INTEREST, label: 'Interest Group', icon: 'heart' },
  { value: GroupType.LOCATION, label: 'Location Group', icon: 'location' },
];

const privacyOptions = [
  { value: GroupPrivacy.PUBLIC, label: 'Public', description: 'Anyone can join' },
  { value: GroupPrivacy.PRIVATE, label: 'Private', description: 'Admin approval required' },
];

export default function CreateGroupScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { isLoading, error } = useSelector((state: RootState) => state.groups);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<GroupType>(GroupType.INTEREST);
  const [selectedPrivacy, setSelectedPrivacy] = useState<GroupPrivacy>(GroupPrivacy.PUBLIC);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a group description');
      return;
    }

    const result = await dispatch(createGroup({
      name: name.trim(),
      description: description.trim(),
      type: selectedType,
      privacy: selectedPrivacy,
    }));

    if (createGroup.fulfilled.match(result)) {
      Alert.alert('Success', 'Group created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/groups') }
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={theme.colors.black} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.black }]}>Create Group</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Group Name *</Text>
          <TextInput
            style={[styles.input, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
            placeholder="Enter group name"
            placeholderTextColor={theme.colors.grey4}
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Description *</Text>
          <TextInput
            style={[styles.textArea, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
            placeholder="Describe the purpose of your group"
            placeholderTextColor={theme.colors.grey4}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={[styles.charCount, { color: theme.colors.grey4 }]}>
            {description.length}/500
          </Text>
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Group Type</Text>
          {groupTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeOption,
                { backgroundColor: theme.colors.grey0 },
                selectedType === type.value && { borderColor: theme.colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={selectedType === type.value ? theme.colors.primary : theme.colors.grey4}
              />
              <Text
                style={[
                  styles.typeLabel,
                  { color: selectedType === type.value ? theme.colors.primary : theme.colors.black },
                ]}
              >
                {type.label}
              </Text>
              {selectedType === type.value && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Privacy Setting</Text>
          {privacyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.privacyOption,
                { backgroundColor: theme.colors.grey0 },
                selectedPrivacy === option.value && { borderColor: theme.colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setSelectedPrivacy(option.value)}
            >
              <View style={styles.privacyInfo}>
                <Text
                  style={[
                    styles.privacyLabel,
                    { color: selectedPrivacy === option.value ? theme.colors.primary : theme.colors.black },
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={[styles.privacyDescription, { color: theme.colors.grey5 }]}>
                  {option.description}
                </Text>
              </View>
              {selectedPrivacy === option.value && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
        )}

        <Button
          title="Create Group"
          onPress={handleCreate}
          loading={isLoading}
          disabled={!name.trim() || !description.trim()}
          buttonStyle={{ backgroundColor: theme.colors.primary, marginTop: 30, marginBottom: 40 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 5,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  typeLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  privacyDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  error: {
    textAlign: 'center',
    marginTop: 10,
  },
});
