import { Profile, VerificationStatus, PrivacyLevel } from '../../types';

const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William',
  'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Mia', 'Henry', 'Harper', 'Alexander', 'Evelyn',
  'Michael', 'Abigail', 'Daniel', 'Emily', 'Matthew', 'Elizabeth', 'Jackson', 'Sofia', 'David', 'Avery',
  'Sebastian', 'Ella', 'Joseph', 'Madison', 'Samuel', 'Scarlett', 'Carter', 'Victoria', 'Owen', 'Grace',
  'Wyatt', 'Chloe', 'Jack', 'Penelope', 'Luke', 'Layla', 'Jayden', 'Riley', 'Dylan', 'Zoey',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
];

const companies = [
  'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'IBM', 'Oracle', 'Salesforce',
  'Adobe', 'Intel', 'Cisco', 'Dell', 'HP', 'SAP', 'VMware', 'Twitter', 'Uber', 'Lyft',
  'Airbnb', 'Spotify', 'Slack', 'Zoom', 'Shopify', 'Square', 'PayPal', 'eBay', 'LinkedIn', 'GitHub',
  'Dropbox', 'Box', 'Atlassian', 'ServiceNow', 'Workday', 'Snowflake', 'Databricks', 'Stripe', 'Coinbase', 'DoorDash',
  'Goldman Sachs', 'Morgan Stanley', 'JPMorgan Chase', 'Bank of America', 'Citigroup', 'Wells Fargo', 'McKinsey', 'BCG', 'Bain', 'Deloitte',
];

const jobTitles = [
  'Software Engineer', 'Senior Software Engineer', 'Staff Software Engineer', 'Engineering Manager', 'Director of Engineering',
  'Product Manager', 'Senior Product Manager', 'Product Director', 'VP of Product', 'Chief Product Officer',
  'Data Scientist', 'Senior Data Scientist', 'ML Engineer', 'AI Researcher', 'Data Engineer',
  'UX Designer', 'Senior UX Designer', 'Design Lead', 'Creative Director', 'Design Manager',
  'Business Analyst', 'Strategy Consultant', 'Management Consultant', 'Operations Manager', 'VP of Operations',
  'Marketing Manager', 'Content Strategist', 'Brand Manager', 'Growth Manager', 'CMO',
  'Sales Engineer', 'Account Executive', 'Sales Manager', 'VP of Sales', 'Chief Revenue Officer',
  'DevOps Engineer', 'Site Reliability Engineer', 'Infrastructure Engineer', 'Security Engineer', 'Solutions Architect',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'QA Engineer',
  'Research Scientist', 'Technical Writer', 'Developer Advocate', 'Startup Founder', 'Entrepreneur',
];

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Consulting', 'E-commerce', 'Media', 'Telecommunications',
  'Automotive', 'Aerospace', 'Energy', 'Real Estate', 'Retail', 'Manufacturing', 'Biotechnology',
];

const departments = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Business Administration', 'Economics',
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Psychology', 'Political Science', 'English Literature',
  'History', 'Philosophy', 'Sociology', 'Architecture', 'Civil Engineering', 'Chemical Engineering',
];

const degrees = [
  'Bachelor of Science', 'Bachelor of Arts', 'Master of Science', 'Master of Business Administration',
  'Master of Engineering', 'Doctor of Philosophy', 'Juris Doctor', 'Doctor of Medicine',
];

const skills = [
  'JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'React', 'Node.js', 'Angular', 'Vue.js', 'Swift',
  'Kotlin', 'Go', 'Rust', 'Ruby', 'PHP', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps', 'Git', 'Agile', 'Scrum',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Analysis', 'Statistics', 'R',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Data Visualization', 'Tableau', 'Power BI',
  'UI/UX Design', 'Figma', 'Sketch', 'Adobe Creative Suite', 'Photoshop', 'Illustrator',
  'Project Management', 'Product Strategy', 'Market Research', 'Business Strategy', 'Financial Analysis',
  'Public Speaking', 'Technical Writing', 'Leadership', 'Team Management', 'Problem Solving',
];

const cities = [
  { city: 'San Francisco', state: 'CA', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { city: 'New York', state: 'NY', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { city: 'Seattle', state: 'WA', country: 'USA', lat: 47.6062, lng: -122.3321 },
  { city: 'Boston', state: 'MA', country: 'USA', lat: 42.3601, lng: -71.0589 },
  { city: 'Austin', state: 'TX', country: 'USA', lat: 30.2672, lng: -97.7431 },
  { city: 'Los Angeles', state: 'CA', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', state: 'IL', country: 'USA', lat: 41.8781, lng: -87.6298 },
  { city: 'Denver', state: 'CO', country: 'USA', lat: 39.7392, lng: -104.9903 },
  { city: 'Portland', state: 'OR', country: 'USA', lat: 45.5155, lng: -122.6789 },
  { city: 'Miami', state: 'FL', country: 'USA', lat: 25.7617, lng: -80.1918 },
  { city: 'Atlanta', state: 'GA', country: 'USA', lat: 33.7490, lng: -84.3880 },
  { city: 'Washington', state: 'DC', country: 'USA', lat: 38.9072, lng: -77.0369 },
];

const bios = [
  'Passionate about building scalable systems and solving complex problems.',
  'Love working at the intersection of technology and business.',
  'Experienced leader focused on building high-performing teams.',
  'Dedicated to creating impactful products that users love.',
  'Always learning and exploring new technologies.',
  'Advocate for diversity and inclusion in tech.',
  'Believer in the power of data-driven decision making.',
  'Enthusiastic about open source and community building.',
  'Focused on creating meaningful user experiences.',
  'Committed to continuous improvement and innovation.',
];

const generateRandomSkills = (): string[] => {
  const numSkills = Math.floor(Math.random() * 8) + 3;
  const shuffled = [...skills].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numSkills);
};

const generateProfile = (index: number): Profile => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const location = cities[Math.floor(Math.random() * cities.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
  const industry = industries[Math.floor(Math.random() * industries.length)];
  const department = departments[Math.floor(Math.random() * departments.length)];
  const degree = degrees[Math.floor(Math.random() * degrees.length)];
  const graduationYear = 2004 + Math.floor(Math.random() * 21);
  const bio = bios[Math.floor(Math.random() * bios.length)];
  
  return {
    id: `alumni_${index}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    name: `${firstName} ${lastName}`,
    avatar: `https://i.pravatar.cc/150?img=${index}`,
    verificationStatus: Math.random() > 0.3 ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
    jobTitle,
    company,
    industry,
    graduationYear,
    degree,
    department,
    bio,
    skills: generateRandomSkills(),
    location: {
      city: location.city,
      state: location.state,
      country: location.country,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng,
      },
    },
    privacySettings: {
      emailVisibility: PrivacyLevel.CONNECTIONS_ONLY,
      phoneVisibility: PrivacyLevel.PRIVATE,
      locationVisibility: PrivacyLevel.PUBLIC,
      whoCanConnect: PrivacyLevel.PUBLIC,
      whoCanMessage: PrivacyLevel.CONNECTIONS_ONLY,
    },
    phone: Math.random() > 0.5 ? `+1-555-${Math.floor(Math.random() * 9000 + 1000)}` : undefined,
  };
};

export const mockProfiles: Profile[] = Array.from({ length: 60 }, (_, i) => generateProfile(i));

export const currentUserProfile: Profile = {
  id: 'current_user',
  email: 'john.doe@example.com',
  name: 'John Doe',
  avatar: 'https://i.pravatar.cc/150?img=60',
  verificationStatus: VerificationStatus.VERIFIED,
  jobTitle: 'Senior Software Engineer',
  company: 'Google',
  industry: 'Technology',
  graduationYear: 2015,
  degree: 'Bachelor of Science',
  department: 'Computer Science',
  bio: 'Passionate about building scalable systems and mentoring junior developers.',
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Python', 'Machine Learning'],
  location: {
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },
  privacySettings: {
    emailVisibility: PrivacyLevel.CONNECTIONS_ONLY,
    phoneVisibility: PrivacyLevel.PRIVATE,
    locationVisibility: PrivacyLevel.PUBLIC,
    whoCanConnect: PrivacyLevel.PUBLIC,
    whoCanMessage: PrivacyLevel.CONNECTIONS_ONLY,
  },
  phone: '+1-555-1234',
};
