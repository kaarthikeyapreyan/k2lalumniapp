import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, Avatar, Button, Badge, Divider, Card } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import * as jobService from '../../mock/services/jobService';
import { Job, JobType, JobApplication } from '../../types';

const jobTypeLabels: Record<JobType, string> = {
  [JobType.FULL_TIME]: 'Full-time',
  [JobType.PART_TIME]: 'Part-time',
  [JobType.CONTRACT]: 'Contract',
  [JobType.INTERNSHIP]: 'Internship',
  [JobType.FREELANCE]: 'Freelance',
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    setIsLoading(true);
    try {
      const jobData = await jobService.getJobById(id);
      setJob(jobData);
      setIsSaved(jobService.isJobSaved(id));
      const applications = await jobService.getMyApplications();
      const existingApp = applications.find(app => app.jobId === id);
      setApplication(existingApp || null);
    } catch (error) {
      console.error('Failed to load job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async () => {
    try {
      if (isSaved) {
        await jobService.unsaveJob(id);
        setIsSaved(false);
      } else {
        await jobService.saveJob(id);
        setIsSaved(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleApply = async () => {
    if (application) {
      Alert.alert('Already Applied', 'You have already applied for this position.');
      return;
    }

    Alert.alert(
      'Apply for this Job',
      'This will submit your profile and resume to the employer. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            try {
              const newApplication = await jobService.applyToJob(id, {
                coverLetter: 'I am interested in this position and would love to discuss further.',
              });
              setApplication(newApplication);
              Alert.alert('Success', 'Your application has been submitted!');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const formatSalary = (job: Job) => {
    if (!job.salaryRange) return 'Salary not specified';
    const { min, max, currency } = job.salaryRange;
    if (job.jobType === JobType.CONTRACT) {
      return `${currency === 'USD' ? '$' : currency}${min}-${max}/hr`;
    }
    return `${currency === 'USD' ? '$' : currency}${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K/year`;
  };

  if (!job && isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.grey5, textAlign: 'center', marginTop: 100 }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.grey5, textAlign: 'center', marginTop: 100 }}>
          Job not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSaveJob}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? theme.colors.primary : theme.colors.black}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadJob} />}
      >
        <View style={styles.content}>
          <View style={styles.jobHeader}>
            <View style={styles.companyLogo}>
              <Avatar
                size={60}
                rounded
                title={job.company.charAt(0)}
                containerStyle={{ backgroundColor: theme.colors.primary }}
              />
            </View>
            <View style={styles.jobTitleSection}>
              <Text style={[styles.jobTitle, { color: theme.colors.black }]}>
                {job.title}
              </Text>
              <Text style={[styles.company, { color: theme.colors.grey5 }]}>
                {job.company}
              </Text>
            </View>
          </View>

          <View style={styles.badges}>
            <Badge
              value={jobTypeLabels[job.jobType]}
              badgeStyle={{ backgroundColor: theme.colors.primary, paddingHorizontal: 10 }}
            />
            <View
              style={[
                styles.outlinedBadge,
                { borderColor: theme.colors.grey3, marginLeft: 5 },
              ]}
            >
              <Text style={{ fontSize: 12, color: theme.colors.grey5 }}>
                {job.experienceLevel}
              </Text>
            </View>
            {job.location.remote && (
              <Badge
                value="Remote"
                status="success"
                badgeStyle={{ marginLeft: 5 }}
              />
            )}
          </View>

          <Divider style={{ marginVertical: 20 }} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.infoLabel, { color: theme.colors.black }]}>Salary</Text>
              <Text style={[styles.infoValue, { color: theme.colors.grey5 }]}>
                {formatSalary(job)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.infoLabel, { color: theme.colors.black }]}>Location</Text>
              <Text style={[styles.infoValue, { color: theme.colors.grey5 }]}>
                {job.location.remote ? 'Remote' : `${job.location.city}, ${job.location.country}`}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="business-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.infoLabel, { color: theme.colors.black }]}>Industry</Text>
              <Text style={[styles.infoValue, { color: theme.colors.grey5 }]}>
                {job.industry}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.infoLabel, { color: theme.colors.black }]}>Applicants</Text>
              <Text style={[styles.infoValue, { color: theme.colors.grey5 }]}>
                {job.applicationCount}
              </Text>
            </View>
          </View>

          <Divider style={{ marginVertical: 20 }} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
              Job Description
            </Text>
            <Text style={[styles.description, { color: theme.colors.grey5 }]}>
              {job.description}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
              Requirements
            </Text>
            {job.requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={[styles.requirementText, { color: theme.colors.grey5 }]}>
                  {req}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
              Skills Required
            </Text>
            <View style={styles.skillsContainer}>
              {job.skills.map((skill, index) => (
                <View
                  key={index}
                  style={[styles.skillBadge, { backgroundColor: theme.colors.grey0 }]}
                >
                  <Text style={[styles.skillText, { color: theme.colors.black }]}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {job.poster && (
            <>
              <Divider style={{ marginVertical: 20 }} />
              <Card containerStyle={[styles.posterCard, { backgroundColor: theme.colors.grey0 }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.black, marginBottom: 12 }]}>
                  Posted By
                </Text>
                <View style={styles.posterRow}>
                  <Avatar
                    size={50}
                    rounded
                    source={job.poster.avatar ? { uri: job.poster.avatar } : undefined}
                    title={job.poster.name.charAt(0)}
                    containerStyle={{ backgroundColor: theme.colors.primary }}
                  />
                  <View style={styles.posterInfo}>
                    <Text style={[styles.posterName, { color: theme.colors.black }]}>
                      {job.poster.name}
                    </Text>
                    <Text style={[styles.posterRole, { color: theme.colors.grey5 }]}>
                      {job.poster.jobTitle} at {job.poster.company}
                    </Text>
                  </View>
                </View>
              </Card>
            </>
          )}

          {application ? (
            <View style={styles.applicationBanner}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <View style={styles.applicationInfo}>
                <Text style={[styles.applicationText, { color: theme.colors.black }]}>
                  Application Submitted
                </Text>
                <Text style={[styles.applicationStatus, { color: theme.colors.grey5 }]}>
                  Status: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Text>
              </View>
            </View>
          ) : (
            <Button
              title="Apply Now"
              onPress={handleApply}
              buttonStyle={{ backgroundColor: theme.colors.primary, marginTop: 30, marginBottom: 40 }}
              icon={<Ionicons name="paper-plane-outline" size={20} color="#fff" style={{ marginRight: 8 }} />}
            />
          )}
        </View>
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
  content: {
    padding: 20,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLogo: {
    marginRight: 16,
  },
  jobTitleSection: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  company: {
    fontSize: 16,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  outlinedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  posterCard: {
    borderRadius: 12,
    marginHorizontal: 0,
    marginBottom: 20,
  },
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posterInfo: {
    marginLeft: 12,
    flex: 1,
  },
  posterName: {
    fontSize: 16,
    fontWeight: '600',
  },
  posterRole: {
    fontSize: 14,
    marginTop: 2,
  },
  applicationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  applicationInfo: {
    marginLeft: 12,
  },
  applicationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applicationStatus: {
    fontSize: 14,
    marginTop: 2,
  },
});
