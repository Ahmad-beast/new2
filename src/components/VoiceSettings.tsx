import React, { useState, useEffect } from 'react';
import { Settings, Volume2, Sliders, RotateCcw, Save, Info } from 'lucide-react';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: VoiceSettings) => void;
  currentSettings: VoiceSettings;
  voiceName?: string;
}

const VoiceSettingsModal: React.FC<VoiceSettingsProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
  currentSettings,
  voiceName = 'Selected Voice'
}) => {
  const [settings, setSettings] = useState<VoiceSettings>(currentSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSettings(currentSettings);
    setHasChanges(false);
  }, [currentSettings, isOpen]);

  const handleSettingChange = (key: keyof VoiceSettings, value: number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSettingsChange(settings);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: VoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0,
      use_speaker_boost: true
    };
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const handleCancel = () => {
    setSettings(currentSettings);
    setHasChanges(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Voice Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {voiceName}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Settings Controls */}
          <div className="space-y-6">
            {/* Stability */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stability
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {settings.stability.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.stability}
                onChange={(e) => handleSettingChange('stability', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>More Variable</span>
                <span>More Stable</span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Higher values make the voice more consistent but less expressive. Lower values add more variation but may sound less natural.
                  </p>
                </div>
              </div>
            </div>

            {/* Similarity Boost */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Similarity Boost
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {settings.similarity_boost.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.similarity_boost}
                onChange={(e) => handleSettingChange('similarity_boost', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Less Similar</span>
                <span>More Similar</span>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Enhances similarity to the original voice. Higher values make the voice sound more like the original speaker.
                  </p>
                </div>
              </div>
            </div>

            {/* Style */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Style Exaggeration
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {settings.style.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.style}
                onChange={(e) => handleSettingChange('style', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Natural</span>
                <span>Exaggerated</span>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Controls how much the AI should exaggerate the speaking style. Higher values create more dramatic delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Speaker Boost */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Speaker Boost
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.use_speaker_boost ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleSettingChange('use_speaker_boost', !settings.use_speaker_boost)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.use_speaker_boost ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.use_speaker_boost ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Enhances the clarity and presence of the voice. Recommended for most use cases to improve audio quality.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Presets
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSettings({ stability: 0.3, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true });
                  setHasChanges(true);
                }}
                className="px-3 py-2 text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
              >
                🎭 Expressive
              </button>
              <button
                onClick={() => {
                  setSettings({ stability: 0.7, similarity_boost: 0.9, style: 0, use_speaker_boost: true });
                  setHasChanges(true);
                }}
                className="px-3 py-2 text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
              >
                📚 Narration
              </button>
              <button
                onClick={() => {
                  setSettings({ stability: 0.4, similarity_boost: 0.7, style: 0.3, use_speaker_boost: true });
                  setHasChanges(true);
                }}
                className="px-3 py-2 text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
              >
                🎪 Animated
              </button>
              <button
                onClick={() => {
                  setSettings({ stability: 0.8, similarity_boost: 0.8, style: 0, use_speaker_boost: true });
                  setHasChanges(true);
                }}
                className="px-3 py-2 text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
              >
                💼 Professional
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset to Default</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettingsModal;
