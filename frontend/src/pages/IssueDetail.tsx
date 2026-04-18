import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SuggestionCard from '../components/issue/SuggestionCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { format } from 'date-fns';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Issue } from '../types';

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadIssue();
    }
  }, [id]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      const data = await issuesApi.getById(id!);
      setIssue(data);
    } catch (error) {
      toast.error('Failed to load issue');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshIssue = async () => {
    setRefreshing(true);
    await loadIssue();
    setRefreshing(false);
    toast.success('Issue refreshed');
  };

  const handleSelectSuggestion = async (suggestionId: string) => {
    try {
      await issuesApi.selectSuggestion(id!, suggestionId);
      toast.success('Suggestion selected! Issue marked as in progress.');
      await loadIssue();
    } catch (error) {
      toast.error('Failed to select suggestion');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await issuesApi.updateStatus(id!, newStatus);
      toast.success('Status updated successfully');
      await loadIssue();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleMarkAsFixed = async () => {
    try {
      await issuesApi.updateStatus(id!, 'resolved');
      toast.success('Issue marked as resolved!');
      await loadIssue();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark as fixed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!issue) {
    return <div>Issue not found</div>;
  }

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

  const isOwner = user?.id === issue.userId;
  const canUpdateStatus = isOwner || user?.role === 'volunteer' || user?.role === 'admin';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={getStatusVariant(issue.status)}>
                {issue.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant={getUrgencyVariant(issue.urgency)}>
                {issue.urgency.toUpperCase()} URGENCY
              </Badge>
              <span className="text-sm text-gray-600 capitalize">{issue.category}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Issue Details</h1>
          </div>

          <div className="flex gap-2">
            {(user?.role === 'volunteer' || user?.role === 'admin') && issue.status !== 'resolved' && issue.status !== 'closed' && (
              <button
                onClick={handleMarkAsFixed}
                className="btn btn-primary flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Mark as Fixed
              </button>
            )}
            <button
              onClick={refreshIssue}
              disabled={refreshing}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{issue.description}</p>

            {issue.metadata?.ai_summary && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-1">AI Summary:</p>
                <p className="text-sm text-blue-800">{issue.metadata.ai_summary}</p>
              </div>
            )}
          </div>

          {/* Images */}
          {issue.images && issue.images.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={20} />
                <h2 className="text-xl font-semibold">Images</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {issue.images.map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5000/${image}`}
                    alt={`Issue ${index + 1}`}
                    className="rounded-lg w-full h-48 object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              AI-Generated Suggestions
              {issue.suggestions && issue.suggestions.length > 0 && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({issue.suggestions.length} recommendations)
                </span>
              )}
            </h2>

            {!issue.suggestions || issue.suggestions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <LoadingSpinner size="md" className="mb-4" />
                <p className="text-gray-600">
                  AI is analyzing your issue and generating suggestions...
                </p>
                <p className="text-sm text-gray-500 mt-2">This usually takes 5-10 seconds</p>
                <button onClick={refreshIssue} className="btn btn-secondary mt-4">
                  Check Again
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {issue.suggestions
                  .sort((a, b) => a.priority - b.priority)
                  .map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onSelect={isOwner ? handleSelectSuggestion : undefined}
                      selectable={isOwner && issue.status === 'open'}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Issue Info */}
          <div className="card">
            <h3 className="font-semibold mb-4">Issue Information</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-medium">
                    {format(new Date(issue.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Reported by</p>
                  <p className="text-sm font-medium">{issue.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{issue.user?.email}</p>
                </div>
              </div>

              {issue.location && (
                <div className="flex items-start gap-2">
                  <MapPin size={20} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-sm font-medium">{issue.location.address || 'Unknown'}</p>
                    {issue.location.latitude && issue.location.longitude && (
                      <p className="text-xs text-gray-500">
                        {issue.location.latitude.toFixed(4)}, {issue.location.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          {canUpdateStatus && (
            <div className="card">
              <h3 className="font-semibold mb-4">Update Status</h3>
              <select
                value={issue.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {isOwner 
                  ? 'Update the status as you progress with resolving this issue'
                  : 'Volunteers can update status to help track issue resolution'}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="btn btn-secondary w-full text-sm"
              >
                Print Issue
              </button>
              <button
                onClick={() => {
                  const text = `Issue: ${issue.description}\nLocation: ${issue.location?.address}\nStatus: ${issue.status}`;
                  navigator.clipboard.writeText(text);
                  toast.success('Copied to clipboard');
                }}
                className="btn btn-secondary w-full text-sm"
              >
                Copy Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;