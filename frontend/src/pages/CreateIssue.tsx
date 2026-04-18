import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { issuesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Upload, MapPin, AlertCircle } from 'lucide-react';
import type { CreateIssueInput } from '../types';

const CreateIssue: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Redirect volunteers to dashboard
  useEffect(() => {
    if (user && user.role !== 'citizen') {
      toast.error('Only citizens can report issues');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateIssueInput>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Current Location',
          });
          toast.success('Location captured!');
        },
        () => {
          toast.error('Could not get your location');
          setUseCurrentLocation(false);
        }
      );
    } else {
      toast.error('Geolocation not supported');
      setUseCurrentLocation(false);
    }
  };

  const onSubmit = async (data: CreateIssueInput) => {
    setLoading(true);
    try {
      const issueData = {
        ...data,
        images,
      };

      const issue = await issuesApi.create(issueData);
      toast.success('Issue reported successfully! AI is generating suggestions...');
      navigate(`/issues/${issue.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Report New Issue</h1>
        <p className="text-gray-600 mt-1">
          Describe the issue and our AI will suggest the best course of action
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Description */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Description *
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={5}
            className="input resize-none"
            placeholder="Describe the issue in detail. Include when it started, severity, and any other relevant information..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Category and Urgency */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select {...register('category')} className="input">
              <option value="">Auto-detect (recommended)</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="sanitation">Sanitation</option>
              <option value="utilities">Utilities</option>
              <option value="safety">Safety</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
            <select {...register('urgency')} className="input">
              <option value="">Auto-detect (recommended)</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="btn btn-secondary flex items-center gap-2 text-sm"
            >
              <MapPin size={16} />
              Use Current Location
            </button>
          </div>

          <input
            {...register('location.address')}
            type="text"
            className="input mb-2"
            placeholder="Enter address (e.g., Main Street, Lucknow, UP)"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              {...register('location.latitude', { valueAsNumber: true })}
              type="number"
              step="any"
              className="input"
              placeholder="Latitude"
              disabled={useCurrentLocation}
            />
            <input
              {...register('location.longitude', { valueAsNumber: true })}
              type="number"
              step="any"
              className="input"
              placeholder="Longitude"
              disabled={useCurrentLocation}
            />
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-sm text-gray-600 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="btn btn-secondary mt-4 inline-block cursor-pointer"
            >
              Select Images
            </label>
          </div>
          {images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{images.length} file(s) selected</p>
              <div className="flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {image.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">What happens next?</p>
            <p>
              Our AI will analyze your issue and generate intelligent recommendations on the best
              course of action, including relevant authorities to contact and suggested next steps.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-lg">
          {loading ? 'Submitting...' : 'Report Issue'}
        </button>
      </form>
    </div>
  );
};

export default CreateIssue;
