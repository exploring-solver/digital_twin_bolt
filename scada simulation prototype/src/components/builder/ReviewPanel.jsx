export const ReviewPanel = ({ twinConfig }) => {
  const getTwinIcon = (type) => {
    const icons = {
      crane: '🏗️',
      building: '🏢',
      factory: '🏭',
      vehicle: '🚛'
    };
    return icons[type] || '📊';
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Review & Create</h3>
      
      <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
        <div className="flex items-start space-x-4 mb-6">
          <div className="text-6xl">{getTwinIcon(twinConfig.type)}</div>
          <div className="flex-1">
            <h4 className="text-2xl font-bold text-white mb-2">{twinConfig.name}</h4>
            <p className="text-gray-400 mb-4">{twinConfig.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full capitalize">
                {twinConfig.type}
              </span>
              <span className="text-gray-400">
                {twinConfig.modelUrl ? 'Custom 3D Model' : 'Default Model'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold text-white mb-3">Configuration</h5>
            <div className="space-y-2">
              {Object.entries(twinConfig.config || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                  </span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="font-semibold text-white mb-3">What's Next?</h5>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span>Digital twin will be created</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span>Default sensors will be configured</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span>Real-time monitoring will start</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span>You can customize sensors later</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <h6 className="font-medium text-blue-400 mb-1">Pro Tip</h6>
              <p className="text-sm text-blue-300">
                After creation, you can drag and drop sensors in the 3D view to customize their positions, 
                set up custom alerts, and integrate with your existing monitoring systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};