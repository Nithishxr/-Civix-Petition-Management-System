export interface Petition {
  id: string;
  title: string;
  category: string;
  location: string;
  signatures: number;
  target: number;
  status: "active" | "under-review" | "closed";
  createdAt: string;
  updatedAt: string;
  description: string;
  comments: Comment[];
  officialResponse?: string;
  resolutionDate?: string;
  signatureHistory: { date: string; count: number }[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  isOfficial?: boolean;
}

export interface Poll {
  id: string;
  title: string;
  location: string;
  totalVotes: number;
  options: { label: string; votes: number }[];
  status: "active" | "closed";
  createdAt: string;
}

export const petitions: Petition[] = [
  {
    id: "PET-001",
    title: "Improve Street Lighting in Downtown",
    category: "Infrastructure",
    location: "Downtown District",
    signatures: 1842,
    target: 2000,
    status: "active",
    createdAt: "2026-01-05",
    updatedAt: "2026-02-15",
    description: "Citizens are requesting improved street lighting across the downtown area to enhance safety and reduce crime rates during nighttime hours. Multiple incidents have been reported in poorly lit areas.",
    comments: [
      { id: "c1", author: "Maria Chen", text: "I walk home from work at night and feel unsafe due to poor lighting.", date: "2026-01-10" },
      { id: "c2", author: "James Wilson", text: "Our neighborhood watch has identified 12 dark spots that need attention.", date: "2026-01-15" },
      { id: "c3", author: "City Works Dept", text: "We have scheduled an assessment for February.", date: "2026-02-01", isOfficial: true },
    ],
    signatureHistory: [
      { date: "Jan", count: 250 }, { date: "Feb", count: 680 }, { date: "Mar", count: 980 },
      { date: "Apr", count: 1200 }, { date: "May", count: 1500 }, { date: "Jun", count: 1842 },
    ],
  },
  {
    id: "PET-002",
    title: "Build a Community Park in Eastside",
    category: "Environment",
    location: "Eastside Borough",
    signatures: 3200,
    target: 3000,
    status: "under-review",
    createdAt: "2025-11-20",
    updatedAt: "2026-02-10",
    description: "A petition to establish a new community park with green spaces, playground equipment, and walking trails in the Eastside Borough area.",
    comments: [
      { id: "c4", author: "Sarah Park", text: "Our children need a safe place to play outdoors.", date: "2025-12-01" },
      { id: "c5", author: "Parks Committee", text: "Proposal under review. Budget assessment in progress.", date: "2026-01-20", isOfficial: true },
    ],
    signatureHistory: [
      { date: "Nov", count: 500 }, { date: "Dec", count: 1200 }, { date: "Jan", count: 2400 },
      { date: "Feb", count: 3200 },
    ],
  },
  {
    id: "PET-003",
    title: "Expand Public School Capacity",
    category: "Education",
    location: "Northville",
    signatures: 2780,
    target: 5000,
    status: "active",
    createdAt: "2026-01-15",
    updatedAt: "2026-02-12",
    description: "Parents and educators are calling for expanded capacity in public schools to address overcrowding and improve educational outcomes.",
    comments: [
      { id: "c6", author: "Linda Torres", text: "My child's class has 38 students. This is unacceptable.", date: "2026-01-20" },
    ],
    signatureHistory: [
      { date: "Jan", count: 800 }, { date: "Feb", count: 1600 }, { date: "Mar", count: 2200 },
      { date: "Apr", count: 2780 },
    ],
  },
  {
    id: "PET-004",
    title: "Renovate Central Hospital Wing",
    category: "Healthcare",
    location: "Central City",
    signatures: 4500,
    target: 4000,
    status: "under-review",
    createdAt: "2025-10-01",
    updatedAt: "2026-02-08",
    description: "The east wing of Central Hospital is outdated and needs urgent renovation to meet modern healthcare standards.",
    comments: [
      { id: "c7", author: "Dr. Robert Kim", text: "Equipment from the 1990s is still in use. Patient safety is at risk.", date: "2025-10-15" },
      { id: "c8", author: "Health Dept", text: "Funds allocated. Renovation timeline being finalized.", date: "2026-01-30", isOfficial: true },
    ],
    signatureHistory: [
      { date: "Oct", count: 1000 }, { date: "Nov", count: 2200 }, { date: "Dec", count: 3400 },
      { date: "Jan", count: 4100 }, { date: "Feb", count: 4500 },
    ],
  },
  {
    id: "PET-005",
    title: "Affordable Housing Initiative",
    category: "Housing",
    location: "Westside",
    signatures: 5100,
    target: 5000,
    status: "active",
    createdAt: "2025-09-01",
    updatedAt: "2026-02-14",
    description: "A citizen-driven initiative demanding affordable housing solutions for low and middle-income families in the Westside area.",
    comments: [
      { id: "c9", author: "Tom Harris", text: "Rent has increased 40% in the last two years.", date: "2025-09-15" },
    ],
    signatureHistory: [
      { date: "Sep", count: 600 }, { date: "Oct", count: 1400 }, { date: "Nov", count: 2500 },
      { date: "Dec", count: 3600 }, { date: "Jan", count: 4500 }, { date: "Feb", count: 5100 },
    ],
  },
  {
    id: "PET-006",
    title: "Traffic Calming Measures on Oak Street",
    category: "Infrastructure",
    location: "Oak District",
    signatures: 890,
    target: 1500,
    status: "active",
    createdAt: "2026-02-01",
    updatedAt: "2026-02-16",
    description: "Residents are requesting speed bumps, crosswalks, and reduced speed limits on Oak Street due to frequent accidents.",
    comments: [],
    signatureHistory: [
      { date: "Feb", count: 890 },
    ],
  },
  {
    id: "PET-007",
    title: "Clean Water Supply for Rural Areas",
    category: "Environment",
    location: "Rural South",
    signatures: 1200,
    target: 2000,
    status: "closed",
    createdAt: "2025-06-01",
    updatedAt: "2025-12-20",
    description: "A petition that successfully brought attention to contaminated water supplies in rural southern areas.",
    officialResponse: "Water treatment facility approved and construction began in November 2025.",
    resolutionDate: "2025-12-20",
    comments: [
      { id: "c10", author: "Water Authority", text: "Issue resolved. New facility operational by Q2 2026.", date: "2025-12-20", isOfficial: true },
    ],
    signatureHistory: [
      { date: "Jun", count: 300 }, { date: "Jul", count: 600 }, { date: "Aug", count: 900 },
      { date: "Sep", count: 1100 }, { date: "Oct", count: 1200 },
    ],
  },
  {
    id: "PET-008",
    title: "Free Public WiFi in Libraries",
    category: "Education",
    location: "City-wide",
    signatures: 670,
    target: 1000,
    status: "active",
    createdAt: "2026-02-05",
    updatedAt: "2026-02-15",
    description: "Students and citizens requesting free high-speed WiFi in all public libraries across the city.",
    comments: [],
    signatureHistory: [
      { date: "Feb", count: 670 },
    ],
  },
];

export const polls: Poll[] = [
  {
    id: "POLL-001",
    title: "Preferred Location for New Community Center",
    location: "Downtown District",
    totalVotes: 3420,
    options: [
      { label: "Central Park Area", votes: 1450 },
      { label: "Old Factory Site", votes: 980 },
      { label: "Riverside Plot", votes: 720 },
      { label: "Municipal Grounds", votes: 270 },
    ],
    status: "active",
    createdAt: "2026-01-10",
  },
  {
    id: "POLL-002",
    title: "Budget Priority for 2026",
    location: "City-wide",
    totalVotes: 8750,
    options: [
      { label: "Education", votes: 3200 },
      { label: "Healthcare", votes: 2800 },
      { label: "Infrastructure", votes: 1900 },
      { label: "Environment", votes: 850 },
    ],
    status: "active",
    createdAt: "2026-01-20",
  },
  {
    id: "POLL-003",
    title: "Public Transport Expansion Route",
    location: "Eastside Borough",
    totalVotes: 2100,
    options: [
      { label: "Route A - Via Highway", votes: 890 },
      { label: "Route B - Via Suburbs", votes: 750 },
      { label: "Route C - Express Line", votes: 460 },
    ],
    status: "closed",
    createdAt: "2025-12-01",
  },
];

export const categories = ["Infrastructure", "Environment", "Education", "Healthcare", "Housing"];
export const locations = ["Downtown District", "Eastside Borough", "Northville", "Central City", "Westside", "Oak District", "Rural South", "City-wide"];

export const monthlyPetitionTrend = [
  { month: "Sep", count: 3 },
  { month: "Oct", count: 5 },
  { month: "Nov", count: 4 },
  { month: "Dec", count: 2 },
  { month: "Jan", count: 6 },
  { month: "Feb", count: 8 },
];

export const categoryDistribution = [
  { category: "Infrastructure", count: 12 },
  { category: "Environment", count: 9 },
  { category: "Education", count: 7 },
  { category: "Healthcare", count: 6 },
  { category: "Housing", count: 5 },
];

export const locationEngagement = [
  { location: "Downtown", engagement: 78 },
  { location: "Eastside", engagement: 65 },
  { location: "Northville", engagement: 52 },
  { location: "Central City", engagement: 71 },
  { location: "Westside", engagement: 84 },
  { location: "Rural South", engagement: 38 },
];
