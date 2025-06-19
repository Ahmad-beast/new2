import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Play, 
  Download, 
  Volume2, 
  Settings, 
  CreditCard, 
  AlertCircle, 
  Loader, 
  Pause,
  RotateCcw,
  Info,
  Crown,
  ChevronDown,
  X,
  Clock,
  Zap,
  UserX,
  MessageCircle,
  Search,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Bug
} from 'lucide-react';
import { elevenLabsApi } from '../services/elevenLabsApi';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  labels?: {
    gender?: string;
    accent?: string;
    age?: string;
    use_case?: string;
    language?: string;
  };
}

const Dashboard: React.FC = () => {
  const { user, userProfile, updateUserProfile, incrementVoiceGeneration, getRemainingVoices, getVoiceLimit, checkPlanExpiry, isAccountActive } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [voiceFilter, setVoiceFilter] = useState('all');
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDebugModal, setShowDebugModal] = useState(false);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detect if text contains Urdu/Hindi characters
  const containsUrduHindi = (text: string): boolean => {
    // Unicode ranges for Urdu/Arabic and Hindi/Devanagari scripts
    const urduArabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hindiDevanagariRegex = /[\u0900-\u097F]/;
    return urduArabicRegex.test(text) || hindiDevanagariRegex.test(text);
  };

  const detectTextLanguage = (text: string): 'urdu' | 'hindi' | 'english' => {
    const urduArabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hindiDevanagariRegex = /[\u0900-\u097F]/;
    
    if (urduArabicRegex.test(text)) return 'urdu';
    if (hindiDevanagariRegex.test(text)) return 'hindi';
    return 'english';
  };

  // Mobile device detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    loadVoices();
    // Check plan expiry on component mount
    checkPlanExpiry();
  }, []);

  // Check if account is active and show modal if not
  useEffect(() => {
    if (userProfile && !isAccountActive()) {
      setShowDeactivatedModal(true);
    }
  }, [userProfile, isAccountActive]);

  const loadVoices = async () => {
    try {
      console.log('🔄 Loading voices...');
      const voicesData = await elevenLabsApi.getVoices();
      setVoices(voicesData);
      if (voicesData.length > 0) {
        setSelectedVoice(voicesData[0]);
        console.log(`✅ Loaded ${voicesData.length} voices`);
      }
    } catch (error: any) {
      console.error('❌ Error loading voices:', error);
      toast.error(error.message || 'Failed to load voices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logVoiceGeneration = async (voiceData: any) => {
    try {
      // Log voice generation to admin panel
      await addDoc(collection(db, 'voiceGenerations'), {
        uid: user?.uid,
        userEmail: user?.email,
        displayName: userProfile?.displayName,
        accountStatus: userProfile?.accountStatus || 'free',
        plan: userProfile?.plan || 'Free',
        voiceId: selectedVoice?.voice_id,
        voiceName: selectedVoice?.name,
        textLength: text.trim().length,
        textPreview: text.trim().substring(0, 100),
        generatedAt: new Date(),
        timestamp: Date.now(),
        isApiGenerated: elevenLabsApi.isConfigured(),
        audioSize: voiceData?.size || 0
      });
      
      console.log('✅ Voice generation logged to admin panel');
    } catch (error) {
      console.error('❌ Error logging voice generation:', error);
      // Don't show error to user as this is background logging
    }
  };

  const generateVoice = async () => {
    // Check if account is active first
    if (!isAccountActive()) {
      setShowDeactivatedModal(true);
      return;
    }

    // Check network status
    if (!isOnline) {
      toast.error('You are offline. Please check your internet connection.');
      return;
    }

    // Validate inputs
    if (!text.trim()) {
      toast.error('Please enter some text to convert to speech');
      return;
    }

    if (!selectedVoice) {
      toast.error('Please select a voice model');
      return;
    }

    if (!userProfile) {
      toast.error('User profile not loaded');
      return;
    }

    // Check if user can generate more voices
    const canGenerate = await incrementVoiceGeneration();
    if (!canGenerate) {
      const remaining = getRemainingVoices();
      if (remaining === 0) {
        if (userProfile.accountStatus === 'pro') {
          toast.error(`You have reached your plan limit. Please upgrade to a higher plan.`);
        } else {
          toast.error('You have reached your free generation limit. Please upgrade your plan.');
        }
        setShowUpgradeModal(true);
        return;
      }
    }

    // Log the exact text being sent for debugging
    const textToGenerate = text.trim();
    console.log('🎤 Starting voice generation with:', {
      text: textToGenerate,
      textLength: textToGenerate.length,
      selectedVoice: selectedVoice.name,
      voiceId: selectedVoice.voice_id,
      userVoicesGenerated: userProfile.voicesGenerated,
      userPlan: userProfile.plan,
      accountStatus: userProfile.accountStatus,
      remainingVoices: getRemainingVoices(),
      isAccountActive: isAccountActive(),
      isMobile: isMobile,
      isOnline: isOnline
    });

    setIsGenerating(true);
    const loadingToast = toast.loading('Generating voice... This may take a few seconds');

    try {
      console.log(`🎤 Generating speech for voice: ${selectedVoice.name} with text: "${textToGenerate}"`);
      
      // Pass the exact text from the input field to the API
      const audioBlob = await elevenLabsApi.generateSpeech(textToGenerate, selectedVoice.voice_id);
      
      // Clean up previous audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const newAudioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(newAudioUrl);

      // Log voice generation for admin tracking
      await logVoiceGeneration(audioBlob);

      toast.success(`Voice generated successfully! ${getRemainingVoices()} voices remaining.`, { id: loadingToast });
      console.log('✅ Voice generation completed successfully');
    } catch (error: any) {
      console.error('❌ Voice generation error:', error);
      
      // Revert the voice count increment on error
      if (userProfile.voicesGenerated && userProfile.voicesGenerated > 0) {
        await updateUserProfile({ voicesGenerated: userProfile.voicesGenerated - 1 });
      }
      
      // Show specific error message from the API
      toast.error(error.message || 'Voice generation failed. Please try again.', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    // Include the actual text in the filename for better organization
    const safeText = text.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `voice-${selectedVoice?.name || 'generated'}-${safeText}-${Date.now()}.${audioUrl.includes('wav') ? 'wav' : 'mp3'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audio downloaded successfully!');
  };

  const togglePlayPause = () => {
    if (!audioUrl) return;

    if (!audioElement) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('error', () => {
        toast.error('Error playing audio');
        setIsPlaying(false);
      });
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const resetAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    navigate('/pricing');
  };

  const clearText = () => {
    setText('');
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/923064482383', '_blank');
  };

  const filteredVoices = voices.filter(voice => {
    // First filter by search query
    const matchesSearch = voiceSearchQuery === '' || 
      voice.name.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
      voice.category.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
      voice.description.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
      voice.labels?.accent?.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
      voice.labels?.use_case?.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
      voice.labels?.language?.toLowerCase().includes(voiceSearchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then filter by category
    if (voiceFilter === 'all') return true;
    if (voiceFilter === 'male') return voice.category.toLowerCase().includes('male') && !voice.category.toLowerCase().includes('female');
    if (voiceFilter === 'female') return voice.category.toLowerCase().includes('female');
    if (voiceFilter === 'american') return voice.labels?.accent?.toLowerCase().includes('american');
    if (voiceFilter === 'british') return voice.labels?.accent?.toLowerCase().includes('british');
    if (voiceFilter === 'hindi-urdu') return voice.labels?.language?.toLowerCase().includes('hindi') || 
                                                  voice.labels?.language?.toLowerCase().includes('urdu') || 
                                                  voice.name.toLowerCase().includes('hindi') || 
                                                  voice.name.toLowerCase().includes('urdu');
    return true;
  });

  const formatPlanExpiry = () => {
    if (!userProfile?.planExpiry) return null;
    const now = new Date();
    const expiry = userProfile.planExpiry;
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  // Debug Modal Component
  const DebugModal = () => {
    const debugInfo = {
      environment: {
        mobile: isMobile,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        network: isOnline ? 'online' : 'offline',
        mode: import.meta.env.MODE,
        production: import.meta.env.PROD
      },
      apiConfiguration: {
        configured: elevenLabsApi.isConfigured(),
        envVarPresent: import.meta.env.VITE_ELEVENLABS_API_KEY ? 'Yes' : 'No',
        envVarType: typeof import.meta.env.VITE_ELEVENLABS_API_KEY
      },
      browserSupport: {
        fetchAPI: typeof fetch !== 'undefined' ? 'Yes' : 'No',
        audioContext: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined' ? 'Yes' : 'No'
      },
      networkInfo: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null,
      screenInfo: {
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Mobile Debug Info
              </h3>
              <button
                onClick={() => setShowDebugModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Environment */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Environment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mobile:</span>
                    <span className="font-mono">{debugInfo.environment.mobile ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                    <span className="font-mono">{debugInfo.environment.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Network:</span>
                    <span className="font-mono">{debugInfo.environment.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                    <span className="font-mono">{debugInfo.environment.mode}</span>
                  </div>
                </div>
              </div>

              {/* API Configuration */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">API Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">API Configured:</span>
                    <span className={`font-mono ${debugInfo.apiConfiguration.configured ? 'text-green-600' : 'text-red-600'}`}>
                      {debugInfo.apiConfiguration.configured ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Env Var Present:</span>
                    <span className={`font-mono ${debugInfo.apiConfiguration.envVarPresent === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                      {debugInfo.apiConfiguration.envVarPresent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Env Var Type:</span>
                    <span className="font-mono">{debugInfo.apiConfiguration.envVarType}</span>
                  </div>
                </div>
              </div>

              {/* Browser Support */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Browser Support</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fetch API:</span>
                    <span className={`font-mono ${debugInfo.browserSupport.fetchAPI === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                      {debugInfo.browserSupport.fetchAPI}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Audio Context:</span>
                    <span className={`font-mono ${debugInfo.browserSupport.audioContext === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                      {debugInfo.browserSupport.audioContext}
                    </span>
                  </div>
                </div>
              </div>

              {/* Network Info */}
              {debugInfo.networkInfo && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Network Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Connection Type:</span>
                      <span className="font-mono">{debugInfo.networkInfo.effectiveType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Downlink:</span>
                      <span className="font-mono">{debugInfo.networkInfo.downlink} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">RTT:</span>
                      <span className="font-mono">{debugInfo.networkInfo.rtt} ms</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Screen Info */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Screen Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Viewport:</span>
                    <span className="font-mono">{debugInfo.screenInfo.viewport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Device Pixel Ratio:</span>
                    <span className="font-mono">{debugInfo.screenInfo.devicePixelRatio}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDebugModal(false)}
              className="mt-6 w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load user profile</p>
        </div>
      </div>
    );
  }

  const remainingVoices = getRemainingVoices();
  const voiceLimit = getVoiceLimit();
  const voicesUsed = userProfile.voicesGenerated || 0;
  const usagePercentage = voiceLimit === 999999 ? 0 : (voicesUsed / voiceLimit) * 100;
  const isApiConfigured = elevenLabsApi.isConfigured();
  const isPro = userProfile.accountStatus === 'pro';
  const isUnlimited = voiceLimit === 999999;
  const accountActive = isAccountActive();
  const detectedLanguage = detectTextLanguage(text);
  const isUrduHindiText = containsUrduHindi(text);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mr-0 sm:mr-3 mb-2 sm:mb-0">
                  Welcome back, {userProfile.displayName}!
                </h1>
                {isPro && (
                  <div className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 sm:px-3 py-1 rounded-full w-fit">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="text-xs sm:text-sm font-bold">PRO</span>
                  </div>
                )}
                {!accountActive && (
                  <div className="flex items-center bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full w-fit ml-0 sm:ml-2 mt-2 sm:mt-0">
                    <UserX className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="text-xs sm:text-sm font-bold">DEACTIVATED</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {accountActive ? 'Generate premium AI voices for your content' : 'Your account has been deactivated. Please contact support.'}
              </p>
              {userProfile.plan && accountActive && (
                <div className="flex flex-col sm:flex-row sm:items-center mt-2 space-y-1 sm:space-y-0 sm:space-x-4">
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                    Current Plan: {userProfile.plan}
                  </p>
                  {userProfile.planExpiry && (
                    <div className="flex items-center text-xs sm:text-sm">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-500" />
                      <span className="text-orange-600 dark:text-orange-400">
                        {formatPlanExpiry()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-left sm:text-right flex items-center space-x-2">
              {/* Network Status Indicator */}
              <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                isOnline 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                <span>{isOnline ? 'online' : 'offline'}</span>
              </div>

              {/* Mobile Debug Button */}
              {isMobile && (
                <button
                  onClick={() => setShowDebugModal(true)}
                  className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <Bug className="h-3 w-3 mr-1" />
                  Debug
                </button>
              )}

              <div className={`px-3 sm:px-4 py-2 rounded-lg ${
                !accountActive
                  ? 'bg-red-500 text-white'
                  : isPro 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                  : 'bg-blue-50 dark:bg-blue-900'
              }`}>
                <p className={`text-xs sm:text-sm font-medium ${
                  !accountActive
                    ? 'text-white'
                    : isPro 
                    ? 'text-white'
                    : 'text-blue-700 dark:text-blue-300'
                }`}>
                  {!accountActive ? 'Account Deactivated' : isPro ? `${userProfile.plan} Plan` : 'Free Plan'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Deactivated Warning */}
        {!accountActive && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start space-x-3">
              <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Account Deactivated
                </h3>
                <p className="text-sm sm:text-base text-red-700 dark:text-red-300 mb-4">
                  Your account has been temporarily deactivated. You cannot generate voices or access premium features until your account is reactivated.
                </p>
                <button
                  onClick={handleContactSupport}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Status Banner */}
        {!isApiConfigured && accountActive && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                  Demo Mode: Add your ElevenLabs API key for real voice generation
                </p>
              </div>
              <button
                onClick={() => setShowApiInfo(true)}
                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 text-xs sm:text-sm font-medium"
              >
                Learn More
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Voice Generator */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
                <Mic className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                Voice Generator
                {isMobile && (
                  <span className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                    Mobile
                  </span>
                )}
              </h2>

              {/* Enhanced Voice Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Voice Model ({filteredVoices.length} available)
                </label>
                
                {/* Voice Search Bar */}
                <div className="relative mb-3 sm:mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search voices by name, accent, or use case..."
                    value={voiceSearchQuery}
                    onChange={(e) => setVoiceSearchQuery(e.target.value)}
                    disabled={!accountActive}
                    className="pl-10 w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  />
                  {voiceSearchQuery && (
                    <button
                      onClick={() => setVoiceSearchQuery('')}
                      disabled={!accountActive}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {/* Voice Filter */}
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                  {[
                    { key: 'all', label: 'All Voices' },
                    { key: 'male', label: 'Male' },
                    { key: 'female', label: 'Female' },
                    { key: 'american', label: 'American' },
                    { key: 'british', label: 'British' },
                    { key: 'hindi-urdu', label: '🇮🇳🇵🇰 Hindi/Urdu' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setVoiceFilter(filter.key)}
                      disabled={!accountActive}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        voiceFilter === filter.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Voice Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => accountActive && setShowVoiceDropdown(!showVoiceDropdown)}
                    disabled={!accountActive}
                    className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {selectedVoice?.name || 'Select a voice'}
                        </p>
                        {selectedVoice && (
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                            {selectedVoice.category} • {selectedVoice.labels?.accent || 'Unknown accent'}
                            {selectedVoice.labels?.language && ` • ${selectedVoice.labels.language}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${showVoiceDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showVoiceDropdown && accountActive && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 sm:max-h-64 overflow-y-auto">
                      {filteredVoices.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <p className="text-sm">No voices found matching your search</p>
                          <button
                            onClick={() => {
                              setVoiceSearchQuery('');
                              setVoiceFilter('all');
                            }}
                            className="text-blue-600 dark:text-blue-400 text-xs mt-1 hover:underline"
                          >
                            Clear filters
                          </button>
                        </div>
                      ) : (
                        filteredVoices.map((voice) => (
                          <button
                            key={voice.voice_id}
                            onClick={() => {
                              setSelectedVoice(voice);
                              setShowVoiceDropdown(false);
                            }}
                            className={`w-full p-3 sm:p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                              selectedVoice?.voice_id === voice.voice_id
                                ? 'bg-blue-50 dark:bg-blue-900'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{voice.name}</p>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {voice.category} • {voice.labels?.accent || 'Unknown accent'}
                                  {voice.labels?.age && ` • ${voice.labels.age}`}
                                  {voice.labels?.language && ` • ${voice.labels.language}`}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                                  {voice.description}
                                </p>
                              </div>
                              {voice.labels?.use_case && (
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded ml-2 flex-shrink-0">
                                  {voice.labels.use_case}
                                </span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Text Input */}
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter Text to Convert
                    {isUrduHindiText && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {detectedLanguage === 'urdu' ? '🇵🇰 Urdu Detected' : '🇮🇳 Hindi Detected'}
                      </span>
                    )}
                  </label>
                  <button
                    onClick={clearText}
                    disabled={!accountActive}
                    className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  disabled={!accountActive}
                  dir={isUrduHindiText ? (detectedLanguage === 'urdu' ? 'rtl' : 'ltr') : 'ltr'}
                  style={{
                    fontFamily: isUrduHindiText 
                      ? detectedLanguage === 'urdu' 
                        ? "'Noto Nastaliq Urdu', 'Amiri', serif" 
                        : "'Noto Sans Devanagari', sans-serif"
                      : 'inherit'
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={accountActive ? "Enter the text you want to convert to speech... (Max 5000 characters)" : "Account deactivated - Cannot generate voices"}
                  maxLength={5000}
                />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 space-y-1 sm:space-y-0">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {text.length}/5000 characters
                  </p>
                  {text.length > 4500 && (
                    <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">
                      Approaching character limit
                    </p>
                  )}
                </div>
                
                {/* Debug info for text input */}
                {text.trim() && accountActive && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>Preview:</strong> "{text.trim().substring(0, 100)}{text.trim().length > 100 ? '...' : ''}"
                    {isUrduHindiText && (
                      <div className="mt-1">
                        <strong>Language:</strong> {detectedLanguage === 'urdu' ? 'Urdu (اردو)' : detectedLanguage === 'hindi' ? 'Hindi (हिन्दी)' : 'English'}
                        <span className="ml-2 text-green-600 dark:text-green-400">✓ Multilingual model will be used</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={generateVoice}
                disabled={isGenerating || !text.trim() || !selectedVoice || remainingVoices === 0 || !accountActive || !isOnline}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
              >
                {!accountActive ? (
                  <>
                    <UserX className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Account Deactivated
                  </>
                ) : !isOnline ? (
                  <>
                    <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    No Internet Connection
                  </>
                ) : isGenerating ? (
                  <>
                    <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    Generating Voice...
                  </>
                ) : remainingVoices === 0 ? (
                  <>
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Limit Reached - Upgrade Plan
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Generate Voice ({remainingVoices} left)
                  </>
                )}
              </button>

              {/* Audio Player */}
              {audioUrl && accountActive && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full flex-shrink-0">
                        <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Voice Generated</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          Voice: {selectedVoice?.name} • Text: "{text.substring(0, 50)}{text.length > 50 ? '...' : ''}"
                          {isUrduHindiText && (
                            <span className="ml-2 text-green-600 dark:text-green-400">
                              ({detectedLanguage === 'urdu' ? 'Urdu' : 'Hindi'})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button
                        onClick={togglePlayPause}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                      >
                        {isPlaying ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </button>
                      <button
                        onClick={resetAudio}
                        className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
                      >
                        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={downloadAudio}
                        className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 sm:space-x-2 flex-1 sm:flex-initial justify-center"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">Download</span>
                      </button>
                    </div>
                  </div>
                  <audio controls className="w-full" src={audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Usage Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Usage Statistics</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Voice Generations</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {voicesUsed}/{isUnlimited ? '∞' : voiceLimit}
                    </span>
                  </div>
                  
                  {!isUnlimited && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          !accountActive
                            ? 'bg-red-500'
                            : usagePercentage >= 100 
                            ? 'bg-red-500' 
                            : usagePercentage >= 80 
                            ? 'bg-yellow-500' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {isUnlimited && accountActive ? (
                    <div className="text-center py-2">
                      <div className="flex items-center justify-center text-green-600 dark:text-green-400">
                        <Zap className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Unlimited Generations</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        {accountActive ? `${remainingVoices} remaining` : 'Account deactivated'}
                      </span>
                      {!accountActive ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          No access
                        </span>
                      ) : usagePercentage >= 100 && (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          Limit reached
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Plan</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      !accountActive
                        ? 'bg-red-500 text-white'
                        : isPro
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {!accountActive ? 'Deactivated' : isPro ? userProfile.plan || 'Premium' : 'Free'}
                    </span>
                    {accountActive && !isPro && (
                      <button 
                        onClick={() => setShowUpgradeModal(true)}
                        className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                  
                  {isPro && userProfile.planExpiry && accountActive && (
                    <div className="mt-2 flex items-center text-xs text-orange-600 dark:text-orange-400">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatPlanExpiry()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Actions</h3>
              
              <div className="space-y-2 sm:space-y-3">
                {!accountActive ? (
                  <button 
                    onClick={handleContactSupport}
                    className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-red-50 dark:bg-red-900 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    <span className="text-red-700 dark:text-red-300 text-sm sm:text-base">
                      Contact Support
                    </span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                        {isPro ? 'Upgrade Plan' : 'View Plans'}
                      </span>
                    </button>
                    
                    <button className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Voice Settings</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Upgrade CTA or Support CTA */}
            {!accountActive ? (
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 sm:p-6 text-white">
                <h3 className="text-base sm:text-lg font-bold mb-2">
                  Account Deactivated
                </h3>
                <p className="text-red-100 text-xs sm:text-sm mb-3 sm:mb-4">
                  Your account has been deactivated. Please contact our support team to resolve this issue and regain access to your account.
                </p>
                <button 
                  onClick={handleContactSupport}
                  className="bg-white text-red-600 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Contact Support
                </button>
              </div>
            ) : ((!isPro || remainingVoices === 0) && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
                <h3 className="text-base sm:text-lg font-bold mb-2">
                  {remainingVoices === 0 ? 'Limit Reached!' : 'Unlock Premium Features'}
                </h3>
                <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4">
                  {remainingVoices === 0 
                    ? 'Upgrade to continue generating voices with unlimited access'
                    : 'Get unlimited voice generations and access to premium voice models'
                  }
                </p>
                <button 
                  onClick={handleUpgrade}
                  className="bg-white text-blue-600 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  {remainingVoices === 0 ? 'Upgrade Now' : 'View Plans'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Account Deactivated Modal */}
        {showDeactivatedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Account Deactivated
                </h3>
                <button
                  onClick={() => setShowDeactivatedModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <UserX className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    Your account has been deactivated
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please contact support to resolve this issue
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                You cannot access voice generation features while your account is deactivated. Our support team can help you understand the reason and guide you through the reactivation process.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleContactSupport}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base flex items-center justify-center"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </button>
                <button
                  onClick={() => setShowDeactivatedModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {remainingVoices === 0 ? 'Voice Limit Reached' : 'Upgrade Required'}
                </h3>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                {remainingVoices === 0 
                  ? `You've used all ${voicesUsed} voices in your ${isPro ? userProfile.plan : 'free'} plan. Upgrade to continue creating amazing voice content!`
                  : "Upgrade to get more voice generations and access to premium features!"
                }
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleUpgrade}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  View Pricing Plans
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Info Modal */}
        {showApiInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-lg mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">ElevenLabs API Setup</h3>
                <button
                  onClick={() => setShowApiInfo(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <p>To use real ElevenLabs voices:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Sign up at <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">elevenlabs.io</a></li>
                  <li>Get your API key from your profile settings</li>
                  <li>Add it to your .env file as VITE_ELEVENLABS_API_KEY</li>
                  <li>Restart the development server</li>
                </ol>
                <p className="text-yellow-600 dark:text-yellow-400">
                  Currently using demo mode with synthetic audio generation.
                </p>
              </div>
              <button
                onClick={() => setShowApiInfo(false)}
                className="mt-4 w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Debug Modal */}
        {showDebugModal && <DebugModal />}
      </div>
    </div>
  );
};

export default Dashboard;
