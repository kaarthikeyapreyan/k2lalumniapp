import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Button, Divider } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import * as eventService from '../../mock/services/eventService';
import { EventType } from '../../types';

const eventTypes = eventService.getEventTypes();
const categories = eventService.getEventCategories();

export default function CreateEventScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<EventType>(EventType.NETWORKING);
  const [isVirtual, setIsVirtual] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return;
    }
    if (!locationName.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }

    setIsLoading(true);
    try {
      // Calculate dates (default to 1 week from now for demo)
      const startDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const endDate = startDate + 3 * 60 * 60 * 1000; // 3 hours duration

      await eventService.createEvent({
        title: title.trim(),
        description: description.trim(),
        type: selectedType,
        startDate,
        endDate,
        location: {
          name: locationName.trim(),
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          virtual: isVirtual,
        },
        capacity: capacity ? parseInt(capacity) : undefined,
        categories: selectedCategories,
      });

      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/events') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={theme.colors.black} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.black }]}>Create Event</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Event Title *</Text>
          <TextInput
            style={[styles.input, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
            placeholder="Enter event title"
            placeholderTextColor={theme.colors.grey4}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Description *</Text>
          <TextInput
            style={[styles.textArea, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
            placeholder="Describe your event"
            placeholderTextColor={theme.colors.grey4}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            maxLength={1000}
          />
          <Text style={[styles.charCount, { color: theme.colors.grey4 }]}>
            {description.length}/1000
          </Text>
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Event Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {eventTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: selectedType === type.value ? theme.colors.primary : theme.colors.grey0,
                  },
                ]}
                onPress={() => setSelectedType(type.value)}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    { color: selectedType === type.value ? '#fff' : theme.colors.black },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: theme.colors.black }]}>Virtual Event</Text>
            <Switch
              value={isVirtual}
              onValueChange={setIsVirtual}
              trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
            />
          </View>

          <Text style={[styles.label, { color: theme.colors.black, marginTop: 15 }]}>
            Location Name *
          </Text>
          <TextInput
            style={[styles.input, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
            placeholder={isVirtual ? 'e.g., Zoom Meeting' : 'e.g., Convention Center'}
            placeholderTextColor={theme.colors.grey4}
            value={locationName}
            onChangeText={setLocationName}
          />

          {!isVirtual && (
            <>
              <Text style={[styles.label, { color: theme.colors.black, marginTop: 10 }]}>
                Address
              </Text>
              <TextInput
                style={[styles.input, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
                placeholder="Street address"
                placeholderTextColor={theme.colors.grey4}
                value={address}
                onChangeText={setAddress}
              />
              <Text style={[styles.label, { color: theme.colors.black, marginTop: 10 }]}>
                City
              </Text>
              <TextInput
                style={[styles.input, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
                placeholder="City"
                placeholderTextColor={theme.colors.grey4}
                value={city}
                onChangeText={setCity}
              />
            </>
          )}

          <Text style={[styles.label, { color: theme.colors.black, marginTop: 15 }]}>
            Capacity (Optional)
          </Text>
          <TextInput
            style={[styles.input, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
            placeholder="Maximum number of attendees"
            placeholderTextColor={theme.colors.grey4}
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="number-pad"
          />
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>
            Categories *
          </Text>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategories.includes(category)
                      ? theme.colors.primary
                      : theme.colors.grey0,
                  },
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: selectedCategories.includes(category) ? '#fff' : theme.colors.black,
                    },
                  ]}
                >
                  {category}
                </Text>
                {selectedCategories.includes(category) && (
                  <Ionicons name="checkmark" size={14} color="#fff" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="Create Event"
          onPress={handleCreate}
          loading={isLoading}
          disabled={!title.trim() || !description.trim() || !locationName.trim() || selectedCategories.length === 0}
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
    height: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 5,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipText: {
    fontSize: 14,
  },
});
