import { type Report } from '../features/report/components/IssueMapPicker';
import { type ReportFormData } from '../features/dashboard-admin/type';

export const mockReports: (Report | ReportFormData)[] = [
  { 
    id: '1', 
    location_lat: 9.0212, 
    location_long: 38.7525, 
    location_address: 'Bole Medhanealem',
    category: 'Water',
    subcategory: 'Leakage',
    title: 'Water Leakage', 
    status: 'submitted', 
    created_at: '2026-03-01T12:00:00Z'
  },
  { 
    id: '2', 
    location_lat: 9.0300, 
    location_long: 38.7400, 
    location_address: 'Addis Ababa',
    category: 'Roads',
    subcategory: 'Pothole',
    title: 'Pothole', 
    status: 'submitted', 
    created_at: '2026-04-01T15:30:00Z'
  },
  { 
    id: '4', 
    location_lat: 9.0350, 
    location_long: 38.7520, 
    location_address: 'Addis Ababa',
    category: 'Waste',
    subcategory: 'Collection',
    title: 'Waste 4 Kilo', 
    status: 'submitted', 
    created_at: '2026-02-13T10:15:00Z' 
  },
  { 
    id: '3', 
    location_lat: 9.0100, 
    location_long: 38.7600, 
    location_address: 'Addis Ababa',
    category: 'Light',
    subcategory: 'Fixed',
    title: 'Fixed Light', 
    status: 'resolved',
    created_at: '2026-01-15T09:45:00Z' 
  },
  { 
    id: '5', 
    location_lat: 9.0120, 
    location_long: 38.7350, 
    location_address: 'Addis Ababa',
    category: 'Drainage',
    subcategory: 'Clogged',
    title: 'Drainage Mexico', 
    status: 'submitted', 
    created_at: '2026-05-01T10:00:00Z' 
  },
  { 
    id: '6', 
    location_lat: 9.0280, 
    location_long: 38.7890, 
    location_address: 'Addis Ababa',
    category: 'Infrastructure',
    subcategory: 'Sidewalk',
    title: 'Sidewalk Megenagna', 
    status: 'submitted', 
    created_at: '2026-05-02T14:30:00Z' 
  },
  { 
    id: '7', 
    location_lat: 8.9850, 
    location_long: 38.7550, 
    location_address: 'Addis Ababa',
    category: 'Light',
    subcategory: 'Fixed',
    title: 'Street Light Saris', 
    status: 'submitted', 
    created_at: '2026-05-03T09:15:00Z' 
  },
  { 
    id: '8', 
    location_lat: 9.0520, 
    location_long: 38.7210, 
    location_address: 'Addis Ababa',
    category: 'Roads',
    subcategory: 'Pothole',
    title: 'Pothole Gullele', 
    status: 'submitted', 
    created_at: '2026-05-04T16:45:00Z' 
  },
  { 
    id: '9', 
    location_lat: 9.0050, 
    location_long: 38.7680, 
    location_address: 'Addis Ababa',
    category: 'Infrastructure',
    subcategory: 'Damaged Pipe',
    title: 'Damaged PipeGerji', 
    status: 'submitted', 
    created_at: '2026-05-05T11:20:00Z' 
  },
  { 
    id: '10', 
    location_lat: 9.0200, 
    location_long: 38.7450, 
    location_address: 'Addis Ababa',
    category: 'Infrastructure',
    subcategory: 'Manhole',
    title: 'Manhole Stadium', 
    status: 'submitted', 
    created_at: '2026-05-06T13:45:00Z' 
  },
  { 
    id: '11', 
    location_lat: 9.0450, 
    location_long: 38.7620, 
    location_address: 'Addis Ababa',
    category: 'Waste',
    subcategory: 'Dumping',
    title: 'Dumping Shola', 
    status: 'submitted', 
    created_at: '2026-05-07T09:30:00Z' 
  },
];