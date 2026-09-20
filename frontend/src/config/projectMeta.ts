import { ProjectInfo } from '../types';

export const projectMeta: ProjectInfo = {
  formalTitle: '1NF–4NF Normalization Visualizer & Analyzer',
  productTitle: 'Normalization Lab',
  course: 'Database Management Systems (DBMS)',
  assignedTopic: '1NF, 2NF, 3NF, and 4NF Normalization Analysis & Visualization',
  tagline: 'An interactive educational laboratory for learning keys, dependencies, normalization violations, and decomposition step-by-step.',
  version: '1.0.0',
  guide: {
    name: 'Dr. Swaminathan A',
    designation: 'Assistant Professor',
    department: 'Department of Computer Science and Engineering',
    institution: 'School of Computer Science and Engineering',
    photoUrl: '/team/dr_swaminathan.png',
  },
  teamMembers: [
    {
      name: 'Raj Mishra',
      registerNumber: '25BCE1565',
      role: 'Full Stack Architecture & DBMS Engine Lead',
      photoUrl: '/team/raj_mishra.jpg',
    },
    {
      name: 'Kunal Anil Deshmukh',
      registerNumber: '25BCE1586',
      role: 'Frontend Engineering & Interactive Visualizations',
      photoUrl: '/team/kunal_deshmukh.png',
    },
  ],
};

export interface NavItem {
  label: string;
  path: string;
  badge?: string;
}

export const navigationItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Analyzer', path: '/analyzer' },
  { label: 'Closure Lab', path: '/closure' },
  { label: 'Keys Lab', path: '/keys' },
  { label: 'Normalize', path: '/normalize', badge: 'Lab' },
  { label: 'Learn', path: '/learn', badge: 'Syllabus' },
  { label: 'Help', path: '/help' },
  { label: 'History', path: '/history' },
  { label: 'Developed By', path: '/developed-by' },
];
