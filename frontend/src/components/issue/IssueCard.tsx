import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Calendar, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';
import type { Issue } from '../../types';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getUrgencyVariant = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Link to={`/issues/${issue.id}`}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(issue.status)}>
              {issue.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant={getUrgencyVariant(issue.urgency)}>
              {issue.urgency.toUpperCase()}
            </Badge>
          </div>
          <span className="text-xs text-gray-500 capitalize">{issue.category}</span>
        </div>

        <p className="text-gray-900 font-medium mb-3 line-clamp-2">{issue.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          {issue.location?.address && (
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span className="truncate">{issue.location.address}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar size={16} />
            <span>{format(new Date(issue.createdAt), 'MMM dd, yyyy')}</span>
          </div>

          {issue.suggestions && issue.suggestions.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-primary-600">
              <AlertCircle size={16} />
              <span>{issue.suggestions.length} AI Suggestions</span>
            </div>
          )}
        </div>

        {issue.user && (
          <div className="mt-2 text-xs text-gray-500">
            Reported by: {issue.user.name}
          </div>
        )}
      </div>
    </Link>
  );
};

export default IssueCard;