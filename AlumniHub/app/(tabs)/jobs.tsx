import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Card, Badge, Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { JobFilterOptions, JobType, ExperienceLevel } from '../../types';
import * as jobService from '../../mock/services/jobService';
import { Job } from '../../types';

const jobTypeColors: Record<JobType, string> = {
  [JobType.FULL_TIME]: '#10B981',
  [JobType.PART_TIME]: '#3B82F6',
  [JobType.CONTRACT]: '#F59E0B',
  [JobType.INTERNSHIP]: '#8B5CF6',
  [JobType.FREELANCE]: '#EC4899',
};

const jobTypeLabels: Record<JobType, string> = {
  [JobType.FULL_TIME]: 'Full-time',
  [JobType.PART_TIME]: 'Part-time',
  [JobType.CONTRACT]: 'Contract',
  [JobType.INTERNSHIP]: 'Internship',
  [JobType.FREELANCE]: 'Freelance',
};

export default function JobsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'saved' | 'applications'>('browse');
  const [myApplications, setMyApplications] = useState<any[]>([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const [allJobs, saved, applications] = await Promise.all([
        jobService.getJobs(),
        jobService.getSavedJobs(),
        jobService.getMyApplications(),
      ]);
      setJobs(allJobs);
      setSavedJobs(saved.map(sj => sj.jobId));
      setMyApplications(applications);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      if (savedJobs.includes(jobId)) {
        await jobService.unsaveJob(jobId);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        await jobService.saveJob(jobId);
        setSavedJobs(prev => [...prev, jobId]);
      }
    } catch (error) {
      console.error('Failed to save/unsave job:', error);
    }
  };

  const formatSalary = (job: Job) => {
    if (!job.salaryRange) return 'Salary not specified';
    const { min, max, currency } = job.salaryRange;
    if (job.jobType === JobType.CONTRACT) {
      return `${currency === 'USD' ? '$' : currency}${min}-${max}/hr`;
    }
    return `${currency === 'USD' ? '$' : currency}${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K/year`;
  };

  const getDisplayedJobs = () => {
    switch (activeTab) {
      case 'saved':
        return jobs.filter(job => savedJobs.includes(job.id));
      case 'applications':
        return jobs.filter(job => myApplications.some(app => app.jobId === job.id));
      default:
        return jobs;
    }
  };

  const renderJobCard = ({ item }: { item: Job }) => {
    const isSaved = savedJobs.includes(item.id);
    const application = myApplications.find(app => app.jobId === item.id);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/jobs/${item.id}` as any)}
      >
        <Card containerStyle={[styles.card, { backgroundColor: theme.colors.grey0 }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: jobTypeColors[item.jobType] }]}>
              <Text style={styles.typeText}>{jobTypeLabels[item.jobType]}</Text>
            </View>
            <TouchableOpacity onPress={() => handleSaveJob(item.id)}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={isSaved ? theme.colors.primary : theme.colors.grey4}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.jobTitle, { color: theme.colors.black }]} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={[styles.company, { color: theme.colors.grey5 }]}>
            {item.company}
          </Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={16} color={theme.colors.grey5} />
              <Text style={[styles.detailText, { color: theme.colors.grey5 }]}>
                {formatSalary(item)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color={theme.colors.grey5} />
              <Text style={[styles.detailText, { color: theme.colors.grey5 }]}>
                {item.location.remote ? 'Remote' : item.location.city || item.location.country}
              </Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="briefcase-outline" size={16} color={theme.colors.grey5} />
              <Text style={[styles.detailText, { color: theme.colors.grey5 }]}>
                {item.industry}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="trending-up-outline" size={16} color={theme.colors.grey5} />
              <Text style={[styles.detailText, { color: theme.colors.grey5 }]}>
                {item.experienceLevel}
              </Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.skillsContainer}>
            {item.skills.slice(0, 5).map((skill, index) => (
              <View
                key={index}
                style={[styles.skillBadge, { backgroundColor: theme.colors.grey1 }]}
              >
                <Text style={[styles.skillText, { color: theme.colors.grey5 }]}>
                  {skill}
                </Text>
              </View>
            ))}
            {item.skills.length > 5 && (
              <View style={[styles.skillBadge, { backgroundColor: theme.colors.grey1 }]}>
                <Text style={[styles.skillText, { color: theme.colors.grey5 }]}>
                  +{item.skills.length - 5}
                </Text>
              </View>
            )}
          </ScrollView>

          {application && (
            <View style={styles.applicationStatus}>
              <Badge
                value={`Applied - ${application.status}`}
                status={application.status === 'rejected' ? 'error' : application.status === 'accepted' ? 'success' : 'warning'}
              />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={[styles.postedDate, { color: theme.colors.grey4 }]}>
              Posted {new Date(item.postedAt).toLocaleDateString()}
            </Text>
            <Text style={[styles.applications, { color: theme.colors.grey4 }]}>
              {item.applicationCount} applications
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.black }]}>Jobs & Careers</Text>
        <TouchableOpacity onPress={() => router.push('/jobs/create' as any)}>
          <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'browse' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('browse')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'browse' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            Browse
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'saved' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('saved')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'saved' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            Saved ({savedJobs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'applications' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('applications')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'applications' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            Applied
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getDisplayedJobs()}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadJobs} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color={theme.colors.grey3} />
            <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
              {activeTab === 'browse' && 'No jobs found'}
              {activeTab === 'saved' && 'No saved jobs'}
              {activeTab === 'applications' && 'No applications yet'}
            </Text>
          </View>
        }
      />
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  company: {
    fontSize: 16,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  skillsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  skillText: {
    fontSize: 12,
  },
  applicationStatus: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  postedDate: {
    fontSize: 12,
  },
  applications: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
});
