import React from 'react';
import { CheckCircle, Lightbulb, TrendingUp } from 'lucide-react';
import Badge from '../common/Badge';
import type { Suggestion } from '../../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onSelect?: (suggestionId: string) => void;
  selectable?: boolean;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  suggestion, 
  onSelect,
  selectable = false 
}) => {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'contact_authority':
        return '📞';
      case 'assign_volunteer':
        return '🤝';
      case 'share_resource':
        return '📢';
      case 'escalate':
        return '⚡';
      default:
        return '💡';
    }
  };

  return (
    <div className={`card ${suggestion.selected ? 'border-2 border-primary-500' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getActionIcon(suggestion.actionType)}</span>
          <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
        </div>
        {suggestion.selected && (
          <Badge variant="success">Selected</Badge>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3 text-sm">
        <div className="flex items-center gap-1">
          <TrendingUp size={16} className="text-blue-600" />
          <span className="text-gray-600">
            Priority: <strong className="text-gray-900">{suggestion.priority}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-gray-600">
            Confidence: <strong className="text-gray-900">{Math.round(suggestion.confidence * 100)}%</strong>
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{suggestion.description}</p>

      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb size={16} className="text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Why this works:</p>
            <p className="text-sm text-gray-600">{suggestion.explanation}</p>
          </div>
        </div>
      </div>

      {/* Display metadata if available */}
      {suggestion.metadata?.authority && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Contact Information:</p>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Authority:</strong> {suggestion.metadata.authority.name}</p>
            <p><strong>Department:</strong> {suggestion.metadata.authority.department}</p>
            <p><strong>Contact:</strong> {suggestion.metadata.authority.contact}</p>
          </div>
        </div>
      )}

      {suggestion.metadata?.message_draft && (
        <div className="bg-green-50 p-3 rounded-lg mb-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Suggested Message:</p>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {suggestion.metadata.message_draft}
          </p>
        </div>
      )}

      {suggestion.metadata?.resources && (
        <div className="bg-purple-50 p-3 rounded-lg mb-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Resources:</p>
          <ul className="text-sm text-gray-700 list-disc list-inside">
            {suggestion.metadata.resources.map((resource: string, index: number) => (
              <li key={index}>{resource}</li>
            ))}
          </ul>
        </div>
      )}

      {selectable && !suggestion.selected && onSelect && (
        <button
          onClick={() => onSelect(suggestion.id)}
          className="btn btn-primary w-full mt-4"
        >
          Select This Suggestion
        </button>
      )}
    </div>
  );
};

export default SuggestionCard;