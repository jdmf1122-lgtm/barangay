import React from 'react';
import { CaseStatus, PriorityLevel } from '../../types';

interface StatusBadgeProps {
  status: CaseStatus | string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', id }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  }[size];

  const getStyle = () => {
    switch (status) {
      case 'Resolved':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Closed':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'Under Investigation':
      case 'Under Initial Assessment':
      case 'Action In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pending':
      case 'Awaiting Documents':
      case 'Awaiting Respondent':
      case 'Awaiting Complainant':
      case 'Awaiting Agency Action':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'For DILG Monitoring':
        return 'bg-purple-100 text-purple-900 border-purple-300';

      case 'Referred to LGU':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'For Barangay Action':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'New':
      case 'Received':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      case 'Overdue':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-full border whitespace-nowrap ${sizeClasses} ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75" />
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel; id?: string }> = ({ priority, id }) => {
  const getStyle = () => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'High':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStyle()}`}
    >
      {priority}
    </span>
  );
};

export const OfficialBadge: React.FC<{ officialType?: string; id?: string }> = ({ officialType, id }) => {
  return (
    <span
      id={id}
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5" />
      {officialType || 'Official Involved'}
    </span>
  );
};
