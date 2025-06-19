import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  Search, 
  Filter,
  Crown,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Info,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { elevenLabsApi } from '../services/elevenLabsApi';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  labels?: {
    gender?: string;
    accent?: string;
    description?: string;
    age?: string;
    use_case?: string;
    language?: string;
  };
}

interface BroadcastMessage {
  id: string;
  title: string;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const Dashboard: React.FC = () => {
  const { user, userProfile, getRemainingVoices, getVoiceLimit, incrementVoiceGeneration, isAccountActive } = useAuth();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState<BroadcastMessage | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    loadVoices();
    loadBroadcastMessage();
    
    // Network status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, []);

  const loadVoices = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading voices...');
      const voicesData = await elevenLabsApi.getVoices();
      console.log(`✅ Loaded ${voicesData.length} voices`);
      setVoices(voicesData);
      
      if (voicesData.length > 0 && !selectedVoice) {
        setSelectedVoice(voicesData[0]);
      }
    } catch (error: any) {
      console.error('❌ Error loading voices:', error);
      toast.error(error.message || 'Failed to load voices');
    } finally {
      setLoading(false);
    }
  };

  const loadBroadcastMessage = async () => {
    try {
      const messagesQuery = query(
        collection(db, 'broadcastMessages'),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      if (!messagesSnapshot.empty) {
        const messageDoc = messagesSnapshot.docs[0];
        const messageData = messageDoc.data();
        
        const message: BroadcastMessage = {
          id: messageDoc.id,
          title: messageData.title,
          description: messageData.description,
          active: messageData.active,
          createdAt: messageData.createdAt?.toDate() || new Date(),
          updatedAt: messageData.updatedAt?.toDate() || new Date(),
          createdBy: messageData.createdBy || 'admin'
        };
        
        setBroadcastMessage(message);
        
        // Check if user has seen this message today
        const today = new Date().toDateString();
        const lastSeenKey = `broadcast_seen_${message.id}`;
        const lastSeen = localStorage.getItem(lastSeenKey);
        
        if (lastSeen !== today) {
          setShowBroadcastModal(true);
        }
      }
    } catch (error) {
      console.error('Error loading broadcast message:', error);
    }
  };

  const handleCloseBroadcastModal = (dontShowToday = false) => {
    if (dontShowToday && broadcastMessage) {
      const today = new Date().toDateString();
      const lastSeenKey = `broadcast_seen_${broadcastMessage.id}`;
      localStorage.setItem(lastSeenKey, today);
    }
    setShowBroadcastModal(false);
  };

  const handleGenerateVoice = async () => {
    if (!selectedVoice || !text.trim()) {
      toast.error('Please select a voice and enter some text');
      return;
    }

    if (!isOnline) {
      toast.error('You are offline. Please check your internet connection.');
      return;
    }

    if (!isAccountActive()) {
      toast.error('Your account has been deactivated. Please contact support.');
      return;
    }

    // Check if user can generate more voices
    const canGenerate = await incrementVoiceGeneration();
    if (!canGenerate) {
      const remaining = getRemainingVoices();
      if (remaining === 0) {
        toast.error('You have reached your voice generation limit. Please upgrade your plan.');
        return;
      }
    }

    setIsGenerating(true);
    const loadingToast = toast.loading('Generating voice...');

    try {
      console.log('🎤 Starting voice generation:', {
        voiceId: selectedVoice.voice_id,
        voiceName: selectedVoice.name,
        textLength: text.length,
        textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        userPlan: userProfile?.accountStatus || 'free',
        remainingVoices: getRemainingVoices(),
        isOnline,
        isMobile,
        userAgent: navigator.userAgent
      });

      const audioBlob = await elevenLabsApi.generateSpeech(
        text,
        selectedVoice.voice_id,
        { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true }
      );

      // Create audio URL
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Log voice generation to Firestore
      try {
        await addDoc(collection(db, 'voiceGenerations'), {
          uid: user?.uid,
          userEmail: user?.email,
          displayName: userProfile?.displayName || user?.displayName || 'User',
          accountStatus: userProfile?.accountStatus || 'free',
          plan: userProfile?.plan || 'Free',
          voiceId: selectedVoice.voice_id,
          voiceName: selectedVoice.name,
          textLength: text.length,
          textPreview: text.substring(0, 100),
          generatedAt: new Date(),
          isApiGenerated: elevenLabsApi.isConfigured(),
          audioSize: audioBlob.size
        });
      } catch (logError) {
        console.error('Error logging voice generation:', logError);
        // Don't show error to user as the voice was generated successfully
      }

      toast.success('Voice generated successfully!', { id: loadingToast });
      console.log('✅ Voice generation completed successfully');
    } catch (error: any) {
      console.error('❌ Voice generation failed:', error);
      toast.error(error.message || 'Voice generation failed. Please try again.', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioUrl) return;

    if (audioElement && !audioElement.paused) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      if (audioElement) {
        audioElement.play();
      } else {
        const audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => setIsPlaying(false));
        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          toast.error('Error playing audio');
          setIsPlaying(false);
        });
        audio.play();
        setAudioElement(audio);
      }
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice-${selectedVoice?.name || 'generated'}-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audio downloaded successfully!');
  };

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voice.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (voice.description && voice.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterCategory === 'all') return matchesSearch;
    if (filterCategory === 'male') return matchesSearch && voice.labels?.gender?.toLowerCase() === 'male';
    if (filterCategory === 'female') return matchesSearch && voice.labels?.gender?.toLowerCase() === 'female';
    if (filterCategory === 'american') return matchesSearch && voice.labels?.accent?.toLowerCase().includes('american');
    if (filterCategory === 'british') return matchesSearch && voice.labels?.accent?.toLowerCase().includes('british');
    if (filterCategory === 'hindi-urdu') return matchesSearch && (
      voice.labels?.language?.toLowerCase().includes('hindi') ||
      voice.labels?.language?.toLowerCase().includes('urdu') ||
      voice.name.toLowerCase().includes('hindi') ||
      voice.name.toLowerCase().includes('urdu')
    );
    
    return matchesSearch;
  });

  const remainingVoices = getRemainingVoices();
  const voiceLimit = getVoiceLimit();
  const isUnlimited = voiceLimit >= 999999;

  // Debug information for mobile troubleshooting
  const debugInfo = {
    environment: {
      mobile: isMobile,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      network: isOnline ? 'online' : 'offline',
      mode: import.meta.env.MODE,
      prod: import.meta.env.PROD
    },
    apiConfiguration: {
      configured: elevenLabsApi.isConfigured(),
      envVarPresent: !!import.meta.env.VITE_ELEVENLABS_API_KEY,
      envVarType: typeof import.meta.env.VITE_ELEVENLABS_API_KEY
    },
    browserSupport: {
      fetchAPI: typeof fetch !== 'undefined',
      audioContext: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined'
    },
    screenInfo: {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      screen: `${screen.width}x${screen.height}`
    },
    networkInfo: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt
    } : null
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading voices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {userProfile?.displayName || user?.displayName || 'User'}!
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {userProfile?.accountStatus === 'pro' && (
                  <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                    <Crown className="h-3 w-3 mr-1" />
                    PRO
                  </span>
                )}
                
                {/* Network Status Badge */}
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  isOnline 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                  {isOnline ? 'online' : 'offline'}
                </span>

                {/* Mobile Device Badge */}
                {isMobile && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium rounded-full">
                    <Smartphone className="h-3 w-3 mr-1" />
                    Mobile
                  </span>
                )}

                {/* Debug Button for Mobile */}
                {isMobile && (
                  <button
                    onClick={() => setShowDebugModal(true)}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Debug
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate premium AI voices for your content</p>
            </div>
          </div>
        </div>

        {/* Plan Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Current Plan: {userProfile?.accountStatus === 'pro' ? userProfile.plan || 'Pro' : 'Free Starter'}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                {userProfile?.planExpiry && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.ceil((userProfile.planExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-center sm:text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isUnlimited ? '∞' : remainingVoices}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                    {isUnlimited ? 'unlimited' : `/ ${voiceLimit} voices`}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isUnlimited ? 'Unlimited generations' : 'Remaining this period'}
                </p>
              </div>
              
              {userProfile?.accountStatus !== 'pro' && (
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account Status Warning */}
        {!isAccountActive() && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-700 dark:text-red-300 font-medium">
                Your account has been deactivated. Please contact support to reactivate your account.
              </p>
            </div>
          </div>
        )}

        {/* Offline Warning */}
        {!isOnline && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                You are currently offline. Voice generation requires an internet connection.
              </p>
            </div>
          </div>
        )}

        {/* Voice Generator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Mic className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Voice Generator
              </h2>
              {isMobile && (
                <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                  Mobile
                </span>
              )}
            </div>

            {/* Voice Selection */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                Select Voice Model ({filteredVoices.length} available)
              </h3>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search voices by name, accent, or use case..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm min-w-[120px]"
                  >
                    <option value="all">All Voices</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="american">American</option>
                    <option value="british">British</option>
                    <option value="hindi-urdu">Hindi/Urdu</option>
                  </select>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['All Voices', 'Male', 'Female', 'American', 'British'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterCategory(filter.toLowerCase().replace(' ', '-'))}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      filterCategory === filter.toLowerCase().replace(' ', '-')
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
                <button
                  onClick={() => setFilterCategory('hindi-urdu')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center space-x-1 ${
                    filterCategory === 'hindi-urdu'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>🇮🇳</span>
                  <span>🇵🇰</span>
                  <span>Hindi/Urdu</span>
                </button>
              </div>

              {/* Voice Selection */}
              {filteredVoices.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredVoices.map((voice) => (
                    <div
                      key={voice.voice_id}
                      onClick={() => setSelectedVoice(voice)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedVoice?.voice_id === voice.voice_id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Volume2 className="h-4 w-4 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {voice.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {voice.labels?.gender && `${voice.labels.gender} • `}
                              {voice.labels?.accent && `${voice.labels.accent} • `}
                              {voice.labels?.language || 'en'}
                            </p>
                          </div>
                        </div>
                        {selectedVoice?.voice_id === voice.voice_id && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      {voice.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-7">
                          {voice.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No voices found matching your criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter Text to Convert
                </label>
                <button
                  onClick={() => setText('')}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to convert to speech..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={4}
                maxLength={5000}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {text.length}/5000 characters
                </p>
                {text.length > 4500 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Approaching character limit
                  </p>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateVoice}
              disabled={isGenerating || !selectedVoice || !text.trim() || !isOnline || !isAccountActive() || remainingVoices === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Voice...
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Generate Voice
                </>
              )}
            </button>

            {/* Generation Limit Warning */}
            {remainingVoices <= 2 && remainingVoices > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    You have {remainingVoices} voice generation{remainingVoices !== 1 ? 's' : ''} remaining.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                Generated Audio
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Voice: {selectedVoice?.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Debug Modal for Mobile */}
        {showDebugModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Mobile Debug Info
                  </h3>
                  <button
                    onClick={() => setShowDebugModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Environment</h4>
                    <div className="space-y-1 text-gray-600 dark:text-gray-400">
                      <p><strong>Mobile:</strong> {debugInfo.environment.mobile ? 'Yes' : 'No'}</p>
                      <p><strong>Platform:</strong> {debugInfo.environment.platform}</p>
                      <p><strong>Network:</strong> {debugInfo.environment.network}</p>
                      <p><strong>Mode:</strong> {debugInfo.environment.mode}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">API Configuration</h4>
                    <div className="space-y-1 text-gray-600 dark:text-gray-400">
                      <p><strong>API Configured:</strong> {debugInfo.apiConfiguration.configured ? 'Yes' : 'No'}</p>
                      <p><strong>Env Var Present:</strong> {debugInfo.apiConfiguration.envVarPresent ? 'Yes' : 'No'}</p>
                      <p><strong>Env Var Type:</strong> {debugInfo.apiConfiguration.envVarType}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Browser Support</h4>
                    <div className="space-y-1 text-gray-600 dark:text-gray-400">
                      <p><strong>Fetch API:</strong> {debugInfo.browserSupport.fetchAPI ? 'Yes' : 'No'}</p>
                      <p><strong>Audio Context:</strong> {debugInfo.browserSupport.audioContext ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Screen Info</h4>
                    <div className="space-y-1 text-gray-600 dark:text-gray-400">
                      <p><strong>Viewport:</strong> {debugInfo.screenInfo.viewport}</p>
                      <p><strong>Device Pixel Ratio:</strong> {debugInfo.screenInfo.devicePixelRatio}</p>
                    </div>
                  </div>

                  {debugInfo.networkInfo && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Network Info</h4>
                      <div className="space-y-1 text-gray-600 dark:text-gray-400">
                        <p><strong>Type:</strong> {debugInfo.networkInfo.effectiveType}</p>
                        <p><strong>Speed:</strong> {debugInfo.networkInfo.downlink} Mbps</p>
                        <p><strong>Latency:</strong> {debugInfo.networkInfo.rtt} ms</p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowDebugModal(false)}
                  className="w-full mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Broadcast Message Modal */}
        {showBroadcastModal && broadcastMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {broadcastMessage.title}
                  </h3>
                  <button
                    onClick={() => handleCloseBroadcastModal()}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {broadcastMessage.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleCloseBroadcastModal(true)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                  >
                    Don't show today
                  </button>
                  <button
                    onClick={() => handleCloseBroadcastModal()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
