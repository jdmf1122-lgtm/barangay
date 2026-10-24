import { Case, User, AuditLog, NotificationItem } from '../types';

export const MDRRMO_FIXED_USER: User & { passcode: string } = {
  id: 'USR-MDRRMO-ROXAS-FIXED',
  name: 'MDRRMO Roxas Operations & Command Center',
  role: 'MDRRMO_ADMIN',
  agencyType: 'MDRRMO',
  agencyName: 'MDRRMO Roxas Emergency Operations Center',
  position: 'MDRRMO Operations Head / Municipal Disaster Risk Officer',
  badgeOrIdNumber: 'MDRRMO-ROXAS-01',
  email: 'mdrrmoroxas@gmail.com',
  passcode: 'mdrrmo2026',
  avatarUrl: '/mdrrmo_logo.png'
};

export const LGU_FIXED_USER: User & { passcode: string } = {
  id: 'USR-LGU-ROXAS-FIXED',
  name: 'Municipal Government of Roxas (LGU Admin)',
  role: 'LGU_ADMINISTRATOR',
  agencyType: 'LGU',
  agencyName: 'Municipal Government of Roxas (LGU Admin)',
  position: 'Municipal Administrator / Executive Desk',
  badgeOrIdNumber: 'LGU-ROXAS-ADMIN',
  email: 'lguroxas@gmail.com',
  passcode: 'lguroxas2026',
  avatarUrl: '/lgu_logo.png'
};

export const SEED_USERS: User[] = [
  MDRRMO_FIXED_USER,
  LGU_FIXED_USER
];

export const SEED_CASES: Case[] = [];

export const SEED_AUDIT_LOGS: AuditLog[] = [];

export const SEED_NOTIFICATIONS: NotificationItem[] = [];
