import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { issuesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/issue/IssueCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Issue } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    status?: string;
    category?: string;
    urgency?: string;
  }>({});

  useEffect(() => {
    if (user) {
      loadIssues();
    }
  }, [filter, user]);

  const loadIssues = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let data;
      if (user.role === 'volunteer' || user.role === 'admin') {
        // Volunteers see ALL issues, not just their own
        data = await issuesApi.getAll({ 
          ...filter,
          limit: 100 
        });
        
        // Sort by urgency (severity) - high first
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        data.rows.sort((a, b) => {
          const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
          if (urgencyDiff !== 0) return urgencyDiff;
          // Secondary sort by date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } else {
        // Citizens see only their own reported issues
        data = await issuesApi.getAll({ 
          ...filter, 
          userId: user.id,
          limit: 50 
        });
      }
      
      setIssues(data.rows);
    } catch (error) {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'volunteer' || user?.role === 'admin' 
              ? 'Community Issues - Volunteer Dashboard' 
              : 'My Reported Issues'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'volunteer' || user?.role === 'admin'
              ? 'View all community issues sorted by severity and help resolve them'
              : 'View and manage your reported issues'}
          </p>
        </div>
        {user?.role === 'citizen' && (
          <Link to="/issues/new" className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Report New Issue
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter.status || ''}
              onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filter.category || ''}
              onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
              className="input"
            >
              <option value="">All Categories</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="sanitation">Sanitation</option>
              <option value="utilities">Utilities</option>
              <option value="safety">Safety</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select
              value={filter.urgency || ''}
              onChange={(e) => setFilter({ ...filter, urgency: e.target.value || undefined })}
              className="input"
            >
              <option value="">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilter({})}
              className="btn btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">
            {user?.role === 'volunteer' || user?.role === 'admin' 
              ? 'No issues found matching your filters'
              : 'You haven\'t reported any issues yet'}
          </p>
          {user?.role === 'citizen' && (
            <Link to="/issues/new" className="btn btn-primary">
              Report First Issue
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && issues.length > 0 && (
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary-600">{issues.length}</p>
            <p className="text-gray-600">Total Issues</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">
              {issues.filter((i) => i.status === 'open').length}
            </p>
            <p className="text-gray-600">Open</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {issues.filter((i) => i.status === 'in_progress').length}
            </p>
            <p className="text-gray-600">In Progress</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">
              {issues.filter((i) => i.status === 'resolved').length}
            </p>
            <p className="text-gray-600">Resolved</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;