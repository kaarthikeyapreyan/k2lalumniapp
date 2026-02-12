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
import * as jobService from '../../mock/services/jobService';
import { JobType, ExperienceLevel } from '../../types';

const jobTypes = jobService.getJobTypes();
const experienceLevels = jobService.getExperienceLevels();
const industries = jobService.getIndustries();
const popularSkills = jobService.getPopularSkills();

export default function CreateJobScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [selectedType, setSelectedType] = useState<JobType>(JobType.FULL_TIME);
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>(ExperienceLevel.MID);
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0]);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [location, setLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a job title');
      return;
    }
    if (!company.trim()) {
      Alert.alert('Error', 'Please enter a company name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a job description');
      return;
    }
    if (!requirements.trim()) {
      Alert.alert('Error', 'Please enter job requirements');
      return;
    }
    if (selectedSkills.length === 0) {
      Alert.alert('Error', 'Please select at least one skill');
      return;
    }

    setIsLoading(true);
    try {
      const reqList = requirements.split('\n').filter(r => r.trim());

      await jobService.createJob({
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        requirements: reqList,
        salaryRange: salaryMin && salaryMax ? {
          min: parseInt(salaryMin),
          max: parseInt(salaryMax),
          currency: 'USD',
        } : undefined,
        location: {
          city: isRemote ? undefined : location.trim() || undefined,
          country: 'USA',
          remote: isRemote,
        },
        jobType: selectedType,
        experienceLevel: selectedLevel,
        industry: selectedIndustry,
        skills: selectedSkills,
      });

      Alert.alert('Success', 'Job posted successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/jobs') }
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
        <Text style={[styles.title, { color: theme.colors.black }]}>Post a Job</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Job Title *</Text>
          <TextInput
            style={[styles.input, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
            placeholder="e.g., Senior Software Engineer"
            placeholderTextColor={theme.colors.grey4}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Company *</Text>
          <TextInput
            style={[styles.input, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
            placeholder="Company name"
            placeholderTextColor={theme.colors.grey4}
            value={company}
            onChangeText={setCompany}
          />
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Job Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {jobTypes.map((type) => (
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

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Experience Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {experienceLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: selectedLevel === level.value ? theme.colors.primary : theme.colors.grey0,
                  },
                ]}
                onPress={() => setSelectedLevel(level.value)}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    { color: selectedLevel === level.value ? '#fff' : theme.colors.black },
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Industry</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {industries.slice(0, 10).map((industry) => (
              <TouchableOpacity
                key={industry}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: selectedIndustry === industry ? theme.colors.primary : theme.colors.grey0,
                  },
                ]}
                onPress={() => setSelectedIndustry(industry)}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    { color: selectedIndustry === industry ? '#fff' : theme.colors.black },
                  ]}
                >
                  {industry}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Description *</Text>
          <TextInput
            style={[styles.textArea, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            placeholderTextColor={theme.colors.grey4}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Requirements *</Text>
          <Text style={[styles.helperText, { color: theme.colors.grey4 }]}>
            Enter each requirement on a new line
          </Text>
          <TextInput
            style={[styles.textArea, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
            placeholder="e.g.,\n5+ years of experience\nStrong JavaScript skills\nExperience with React"
            placeholderTextColor={theme.colors.grey4}
            value={requirements}
            onChangeText={setRequirements}
            multiline
            numberOfLines={5}
          />
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Salary Range (Optional)</Text>
          <View style={styles.salaryRow}>
            <TextInput
              style={[styles.salaryInput, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
              placeholder="Min"
              placeholderTextColor={theme.colors.grey4}
              value={salaryMin}
              onChangeText={setSalaryMin}
              keyboardType="number-pad"
            />
            <Text style={[styles.salarySeparator, { color: theme.colors.grey5 }]}>to</Text>
            <TextInput
              style={[styles.salaryInput, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
              placeholder="Max"
              placeholderTextColor={theme.colors.grey4}
              value={salaryMax}
              onChangeText={setSalaryMax}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: theme.colors.black }]}>Remote Position</Text>
            <Switch
              value={!!isRemote}
              onValueChange={setIsRemote}
              trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
            />
          </View>
          {!isRemote && (
            <TextInput
              style={[styles.input, { color: theme.colors.black, backgroundColor: theme.colors.grey0, marginTop: 10 }]}
              placeholder="City, State"
              placeholderTextColor={theme.colors.grey4}
              value={location}
              onChangeText={setLocation}
            />
          )}
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.black }]}>Skills Required *</Text>
          <View style={styles.skillsContainer}>
            {popularSkills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillChip,
                  {
                    backgroundColor: selectedSkills.includes(skill)
                      ? theme.colors.primary
                      : theme.colors.grey0,
                  },
                ]}
                onPress={() => toggleSkill(skill)}
              >
                <Text
                  style={[
                    styles.skillChipText,
                    {
                      color: selectedSkills.includes(skill) ? '#fff' : theme.colors.black,
                    },
                  ]}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customSkillRow}>
            <TextInput
              style={[styles.customSkillInput, { color: theme.colors.black, backgroundColor: theme.colors.grey0 }]}
              placeholder="Add custom skill"
              placeholderTextColor={theme.colors.grey4}
              value={customSkill}
              onChangeText={setCustomSkill}
              onSubmitEditing={addCustomSkill}
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={addCustomSkill}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {selectedSkills.length > 0 && (
            <Text style={[styles.selectedCount, { color: theme.colors.grey5 }]}>
              {selectedSkills.length} skills selected
            </Text>
          )}
        </View>

        <Button
          title="Post Job"
          onPress={handleCreate}
          loading={isLoading}
          disabled={!title.trim() || !company.trim() || !description.trim() || !requirements.trim() || selectedSkills.length === 0}
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
  helperText: {
    fontSize: 12,
    marginBottom: 8,
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
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salaryInput: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },
  salarySeparator: {
    marginHorizontal: 15,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipText: {
    fontSize: 14,
  },
  customSkillRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  customSkillInput: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCount: {
    marginTop: 10,
    fontSize: 14,
  },
});
