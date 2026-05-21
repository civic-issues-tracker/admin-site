export type IssuePriority = 'High' | 'Medium' | 'Low';
export type IssueStatus =
  | 'submitted'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'pending_admin'
  | 'escalated';

export interface OrganizationAdminIssue {
  id: string;
  issue_number: string;
  description: string;
  category_name?: string;
  subcategory_name?: string;
  resident_name?: string;
  priority: IssuePriority;
  status: IssueStatus;
  assigned_to_org_admin?: string | null;
  assigned_admin_name?: string | null;
  reopen_reason?: string | null;
  location_address: string;
  location_lat?: number | null;
  location_long?: number | null;
  created_at: string;
  images?: { id: string; image: string; created_at: string }[];
  internal_notes?: string;
  status_history?: { old: string; new: string; date: string; note?: string }[];
}

export interface OrganizationAdminTicket {
  id: string;
  issueNumber: string;
  title: string;
  location: string;
  priority: IssuePriority;
  status: IssueStatus;
  assignedAdminName?: string;
  reopenReason?: string;
  assignedUnit?: string;
  summary?: string;
  timeAgo?: string;
  reporter?: string;
  reporterPhone?: string;
  category?: string;
  resolutionDate?: string;
  lat?: number;
  lng?: number;
  createdAt?: string;
  internalNotes?: string;
  images?: { id: string; image: string; created_at: string }[];
}

export interface OrganizationAdminMessage {
  id: string;
  from: 'dispatch' | 'organization_admin';
  text: string;
  at: string;
}

export interface OrganizationAdminConversation {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  active?: boolean;
  online?: boolean;
  messages: OrganizationAdminMessage[];
}

const buildTitleFromDescription = (description: string) => {
  const cleaned = description.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Reported issue';
  const sentence = cleaned.split(/[.!?]/)[0]?.trim() ?? cleaned;
  return sentence.length > 64 ? `${sentence.slice(0, 61)}...` : sentence;
};

export const organizationAdminIssues: OrganizationAdminIssue[] = [
  {
    id: '9f8a7d06-3e4c-4ff0-a6e6-5a1b6f2c9b21',
    issue_number: 'CIV-4921ABCD',
    description:
      'Deep pothole in the right lane going northbound. Several cars hit it and it grows after rain.',
    category_name: 'Roads & Infrastructure',
    resident_name: 'Sarah Jenkins',
    priority: 'High',
    status: 'submitted',
    location_address: '1400 North Ave, District 4',
    created_at: '2024-10-18T10:30:00Z',
  },
  {
    id: 'b4e7d4b5-7f55-4eb5-9c45-1c2dd75d0c1f',
    issue_number: 'CIV-4918EFGH',
    description: 'Offensive graffiti on the south entrance wall of Centennial Park.',
    category_name: 'Vandalism',
    resident_name: 'Marcus Reed',
    priority: 'Medium',
    status: 'in_progress',
    location_address: 'Centennial Park, South Entrance',
    created_at: '2024-10-18T07:10:00Z',
  },
  {
    id: '67b2d7a0-6cb1-4c34-9cf9-cc5a8a10a17a',
    issue_number: 'CIV-4915IJKL',
    description: 'Broken streetlight at the intersection; area gets dark at night.',
    category_name: 'Lighting',
    resident_name: 'Paula Brown',
    priority: 'Medium',
    status: 'submitted',
    location_address: 'Corner of 5th St and Elm St',
    created_at: '2024-10-17T09:05:00Z',
  },
  {
    id: 'a7e10ef2-9b73-4cb6-81cf-63cdd9f1aa6e',
    issue_number: 'CIV-4902MNOP',
    description: 'Illegal dumping in the alley; debris blocks access for deliveries.',
    category_name: 'Sanitation',
    resident_name: 'Public Works Crew 3',
    priority: 'Low',
    status: 'resolved',
    location_address: 'Alley behind 890 West Blvd',
    created_at: '2024-10-15T15:40:00Z',
  },
];

export const resolvedOrganizationAdminIssues: OrganizationAdminIssue[] = [
  {
    id: '65c7b1d2-2b9a-4c46-80be-3d28c4a1a2e2',
    issue_number: 'CIV-4895QRST',
    description: 'Pothole on Main St repaired and patched.',
    category_name: 'Roads & Infrastructure',
    resident_name: 'Dispatch Center',
    priority: 'High',
    status: 'resolved',
    location_address: 'Main St',
    created_at: '2024-10-15T08:10:00Z',
  },
  {
    id: '31f860d2-2e68-45cb-9f1c-fc851d9f2b0f',
    issue_number: 'CIV-4892UVWX',
    description: 'Graffiti removed at Central Park entrance.',
    category_name: 'Vandalism',
    resident_name: 'City Clean-Up',
    priority: 'Medium',
    status: 'resolved',
    location_address: 'Central Park',
    created_at: '2024-10-14T11:45:00Z',
  },
  {
    id: '19de2f06-7fda-4dd5-9691-8a4ec3d6a3a9',
    issue_number: 'CIV-4888YZ12',
    description: 'Streetlight bulb replaced at 5th & Elm.',
    category_name: 'Lighting',
    resident_name: 'Ops Supervisor',
    priority: 'Medium',
    status: 'resolved',
    location_address: '5th & Elm',
    created_at: '2024-10-12T17:25:00Z',
  },
  {
    id: '7a9f7a3e-5a3e-4c3b-8e9c-8f6dc9ebc0a7',
    issue_number: 'CIV-4881AB34',
    description: 'Illegal dumping cleared from West Blvd alley.',
    category_name: 'Sanitation',
    resident_name: 'Cleanup Team',
    priority: 'Low',
    status: 'resolved',
    location_address: 'West Blvd Alley',
    created_at: '2024-10-10T10:00:00Z',
  },
];

const buildTimeAgo = (isoDate?: string) => {
  if (!isoDate) return undefined;
  const ms = Date.now() - new Date(isoDate).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 'just now';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

export const toOrganizationAdminTicket = (issue: OrganizationAdminIssue): OrganizationAdminTicket => ({
  id: issue.id,
  issueNumber: issue.issue_number,
  title: buildTitleFromDescription(issue.description),
  location: issue.location_address,
  priority: issue.priority,
  status: issue.status,
  assignedAdminName: issue.assigned_admin_name ?? undefined,
  reopenReason: issue.reopen_reason ?? undefined,
  summary: issue.description,
  reporter: issue.resident_name,
  category: issue.category_name,
  timeAgo: buildTimeAgo(issue.created_at),
  createdAt: issue.created_at,
  lat: issue.location_lat ?? undefined,
  lng: issue.location_long ?? undefined,
  internalNotes: issue.internal_notes,
  images: issue.images,
});

export const chatThreads: OrganizationAdminConversation[] = [
  {
    id: 'dispatch',
    name: 'Dispatch Center',
    preview: 'Unit 4 is en route to ISS-4921...',
    time: '10:42 AM',
    unread: 1,
    active: true,
    online: true,
    messages: [
      {
        id: 'm1',
        from: 'dispatch',
        at: '10:30 AM',
        text:
          'Organization admin, we have a new high-priority ticket (ISS-4921) regarding a deep pothole on North Ave.',
      },
      {
        id: 'm2',
        from: 'organization_admin',
        at: '10:32 AM',
        text:
          'Copy that, Dispatch. I am finishing up at Centennial Park and will head over there in about 15 minutes.',
      },
      {
        id: 'm3',
        from: 'dispatch',
        at: '10:35 AM',
        text:
          'Understood. Unit 4 is in the vicinity and can dispatch them to bring traffic cones to secure the lane until you arrive.',
      },
      {
        id: 'm4',
        from: 'organization_admin',
        at: '10:38 AM',
        text: 'Yes, please confirm ETA for Unit 4 to ISS-4921. Traffic is building up on North Ave.',
      },
    ],
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins (ISS-4921)',
    preview: 'Thank you for the quick response',
    time: '09:15 AM',
    unread: 0,
    active: false,
    messages: [
      {
        id: 's1',
        from: 'dispatch',
        at: '09:00 AM',
        text: 'Thanks for reporting this. A field unit has been assigned.',
      },
      {
        id: 's2',
        from: 'organization_admin',
        at: '09:15 AM',
        text: 'Thank you for the quick response.',
      },
    ],
  },
  {
    id: 'crew3',
    name: 'Public Works Crew 3',
    preview: 'We cleared the alleyway dumping.',
    time: 'Yesterday',
    unread: 0,
    active: false,
    messages: [
      {
        id: 'c1',
        from: 'dispatch',
        at: 'Yesterday',
        text: 'Please confirm completion status for ISS-4902.',
      },
      {
        id: 'c2',
        from: 'organization_admin',
        at: 'Yesterday',
        text: 'We cleared the alleyway dumping.',
      },
    ],
  },
  {
    id: 'city-alerts',
    name: 'City Hall Alerts',
    preview: 'Weather advisory: Heavy rain expected',
    time: 'Yesterday',
    unread: 0,
    active: false,
    messages: [
      {
        id: 'a1',
        from: 'dispatch',
        at: 'Yesterday',
        text: 'Weather advisory: Heavy rain expected from 18:00 to 23:00.',
      },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Reed (ISS-4918)',
    preview: 'Can you give me an update on this?',
    time: 'Mon',
    unread: 0,
    active: false,
    messages: [
      {
        id: 'r1',
        from: 'dispatch',
        at: 'Mon',
        text: 'Can you give me an update on this?',
      },
    ],
  },
];