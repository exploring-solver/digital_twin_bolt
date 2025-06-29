import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export const ModelUploader = ({ onModelUpload }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedModel, setUploadedModel] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.glb', '.gltf', '.obj', '.fbx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      alert('Please select a valid 3D model file (.glb, .gltf, .obj, .fbx)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // In a real implementation, this would upload to your storage service
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockModelUrl = `/models/${file.name}`;
      setUploadedModel({
        name: file.name,
        size: file.size,
        url: mockModelUrl
      });
      
      onModelUpload(mockModelUrl);
      setIsUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Upload 3D Model</h3>
      
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
            ${isUploading 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf,.obj,.fbx"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          {!isUploading && !uploadedModel && (
            <div>
              <div className="text-6xl mb-4">📁</div>
              <h4 className="text-xl font-semibold text-white mb-2">
                Upload 3D Model
              </h4>
              <p className="text-gray-400 mb-4">
                Drag and drop your 3D model file here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: .glb, .gltf, .obj, .fbx (Max 50MB)
              </p>
            </div>
          )}
          
          {isUploading && (
            <div>
              <div className="text-6xl mb-4">⏳</div>
              <h4 className="text-xl font-semibold text-white mb-4">
                Uploading Model...
              </h4>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="text-sm text-gray-400">{uploadProgress}% complete</p>
            </div>
          )}
          
          {uploadedModel && (
            <div>
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-xl font-semibold text-green-400 mb-2">
                Model Uploaded Successfully
              </h4>
              <p className="text-gray-400 mb-2">{uploadedModel.name}</p>
              <p className="text-sm text-gray-500">
                Size: {formatFileSize(uploadedModel.size)}
              </p>
            </div>
          )}
        </div>

        {/* Model Preview Options */}
        {uploadedModel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
          >
            <h4 className="text-lg font-semibold text-white mb-4">Model Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Scale Factor
                </label>
                <input
                  type="number"
                  defaultValue={1}
                  step={0.1}
                  min={0.1}
                  max={10}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rotation (Y-axis)
                </label>
                <input
                  type="number"
                  defaultValue={0}
                  min={0}
                  max={360}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Upload Different Model
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Preview Model
              </button>
            </div>
          </motion.div>
        )}

        {/* Skip Option */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Don't have a 3D model? You can skip this step and use our default representations.
          </p>
          <button
            onClick={() => onModelUpload(null)}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Skip and Use Default Model
          </button>
        </div>
      </div>
    </div>
  );
};
