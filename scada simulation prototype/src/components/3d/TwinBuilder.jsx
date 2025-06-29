import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TemplateSelector } from './TemplateSelector';
import { ConfigurationPanel } from './ConfigurationPanel';
import { ModelUploader } from './ModelUploader';

export const TwinBuilder = ({ tenant, onTwinCreate, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [twinConfig, setTwinConfig] = useState({
    name: '',
    type: '',
    description: '',
    config: {},
    modelUrl: ''
  });

  const steps = [
    { id: 1, title: 'Select Template', component: 'template' },
    { id: 2, title: 'Configure Twin', component: 'config' },
    { id: 3, title: 'Upload Model', component: 'model' },
    { id: 4, title: 'Review & Create', component: 'review' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    try {
      await onTwinCreate(twinConfig);
    } catch (error) {
      console.error('Failed to create twin:', error);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return twinConfig.type !== '';
      case 2: return twinConfig.name !== '';
      case 3: return true; // Model is optional
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                  }
                `}>
                  {step.id}
                </div>
                <div className="ml-3 text-white">
                  <div className="text-sm font-medium">{step.title}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    ml-8 w-20 h-0.5 
                    ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-700'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 mb-6"
        >
          {currentStep === 1 && (
            <TemplateSelector
              selectedType={twinConfig.type}
              onSelect={(type) => setTwinConfig(prev => ({ ...prev, type }))}
            />
          )}

          {currentStep === 2 && (
            <ConfigurationPanel
              twinConfig={twinConfig}
              onChange={setTwinConfig}
            />
          )}

          {currentStep === 3 && (
            <ModelUploader
              onModelUpload={(modelUrl) => 
                setTwinConfig(prev => ({ ...prev, modelUrl }))
              }
            />
          )}

          {currentStep === 4 && (
            <ReviewPanel twinConfig={twinConfig} />
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <div>
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="ml-4 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          
          <div>
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`
                  px-6 py-2 rounded-lg transition-colors
                  ${isStepValid()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Digital Twin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};