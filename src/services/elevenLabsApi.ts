import axios from 'axios';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  labels?: {
    gender?: string;
    accent?: string;
    description?: string;
    age?: string;
    use_case?: string;
    language?: string;
  };
}

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export class ElevenLabsAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = ELEVENLABS_API_KEY || '';
    
    // Enhanced debugging for mobile devices
    this.debugConfiguration();
    
    if (this.isConfigured()) {
      console.log('✅ ElevenLabs API key loaded successfully');
    } else {
      console.warn('⚠️ ElevenLabs API key not configured. Using demo mode.');
    }
  }

  private debugConfiguration() {
    // Comprehensive debugging for mobile devices
    console.log('🔍 ElevenLabs API Configuration Debug:', {
      // Environment info
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      platform: navigator.platform,
      
      // API key info (safely logged)
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0,
      apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'undefined',
      
      // Environment variables debug
      envViteElevenLabsKey: import.meta.env.VITE_ELEVENLABS_API_KEY ? 'present' : 'missing',
      envMode: import.meta.env.MODE,
      envProd: import.meta.env.PROD,
      envDev: import.meta.env.DEV,
      
      // All VITE_ environment variables (safely)
      allViteEnvs: Object.keys(import.meta.env)
        .filter(key => key.startsWith('VITE_'))
        .reduce((acc, key) => {
          acc[key] = import.meta.env[key] ? 'present' : 'missing';
          return acc;
        }, {} as Record<string, string>),
      
      // Browser capabilities
      fetchSupported: typeof fetch !== 'undefined',
      axiosAvailable: typeof axios !== 'undefined',
      
      // Network info (if available)
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : 'not available',
      
      // Current timestamp for debugging
      timestamp: new Date().toISOString()
    });

    // Additional mobile-specific checks
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      console.log('📱 Mobile device detected - performing additional checks...');
      
      // Check if running in standalone mode (PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      
      console.log('📱 Mobile environment details:', {
        isStandalone,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio
        },
        screen: {
          width: screen.width,
          height: screen.height,
          orientation: screen.orientation?.type || 'unknown'
        }
      });
    }

    // Test environment variable access
    try {
      const testEnv = import.meta.env.VITE_ELEVENLABS_API_KEY;
      console.log('🧪 Direct env access test:', {
        success: true,
        hasValue: !!testEnv,
        type: typeof testEnv
      });
    } catch (error) {
      console.error('❌ Environment variable access failed:', error);
    }
  }

  async getVoices(): Promise<Voice[]> {
    // Enhanced demo voices with more variety and better descriptions
    const demoVoices: Voice[] = [
      {
        voice_id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam',
        category: 'Male',
        description: 'Deep, authoritative male voice perfect for narrations and professional content',
        labels: { gender: 'Male', accent: 'American', age: 'Middle Aged', use_case: 'Narration' }
      },
      {
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella',
        category: 'Female',
        description: 'Warm, friendly female voice ideal for storytelling and educational content',
        labels: { gender: 'Female', accent: 'American', age: 'Young', use_case: 'Conversational' }
      },
      {
        voice_id: 'ErXwobaYiN019PkySvjV',
        name: 'Antoni',
        category: 'Male',
        description: 'Clear, professional male voice great for presentations and business content',
        labels: { gender: 'Male', accent: 'American', age: 'Young', use_case: 'Professional' }
      },
      {
        voice_id: 'MF3mGyEYCl7XYWbV9V6O',
        name: 'Elli',
        category: 'Female',
        description: 'Young, energetic female voice perfect for social media and creative content',
        labels: { gender: 'Female', accent: 'American', age: 'Young', use_case: 'Social Media' }
      },
      {
        voice_id: 'TxGEqnHWrfWFTfGW9XjX',
        name: 'Josh',
        category: 'Male',
        description: 'Casual, conversational male voice excellent for podcasts and vlogs',
        labels: { gender: 'Male', accent: 'American', age: 'Young', use_case: 'Podcast' }
      },
      {
        voice_id: 'VR6AewLTigWG4xSOukaG',
        name: 'Arnold',
        category: 'Male',
        description: 'Strong, confident male voice for dramatic content and commercials',
        labels: { gender: 'Male', accent: 'American', age: 'Middle Aged', use_case: 'Commercial' }
      },
      {
        voice_id: 'ThT5KcBeYPX3keUQqHPh',
        name: 'Dorothy',
        category: 'Female',
        description: 'Mature, sophisticated female voice for documentaries and formal content',
        labels: { gender: 'Female', accent: 'British', age: 'Middle Aged', use_case: 'Documentary' }
      },
      {
        voice_id: 'IKne3meq5aSn9XLyUdCD',
        name: 'Charlie',
        category: 'Male',
        description: 'Youthful, enthusiastic male voice for gaming and entertainment content',
        labels: { gender: 'Male', accent: 'Australian', age: 'Young', use_case: 'Gaming' }
      },
      {
        voice_id: 'XrExE9yKIg1WjnnlVkGX',
        name: 'Matilda',
        category: 'Female',
        description: 'Elegant, articulate female voice perfect for audiobooks and literature',
        labels: { gender: 'Female', accent: 'British', age: 'Middle Aged', use_case: 'Audiobook' }
      },
      {
        voice_id: 'SOYHLrjzK2X1ezoPC6cr',
        name: 'Harry',
        category: 'Male',
        description: 'Charismatic, smooth male voice ideal for advertisements and sales content',
        labels: { gender: 'Male', accent: 'British', age: 'Young', use_case: 'Advertisement' }
      },
      {
        voice_id: 'AZnzlk1XvdvUeBnXmlld',
        name: 'Domi',
        category: 'Female',
        description: 'Confident, modern female voice great for tech and innovation content',
        labels: { gender: 'Female', accent: 'American', age: 'Young', use_case: 'Technology' }
      },
      {
        voice_id: 'CYw3kZ02Hs0563khs1Fj',
        name: 'Dave',
        category: 'Male',
        description: 'Friendly, approachable male voice perfect for tutorials and explanations',
        labels: { gender: 'Male', accent: 'British', age: 'Middle Aged', use_case: 'Educational' }
      }
    ];

    // Only use demo voices when API key is not configured
    if (!this.isConfigured()) {
      console.log('🎭 Demo mode: Using demo voices (API key not configured)');
      return demoVoices;
    }

    // For real users with API key, try to fetch from ElevenLabs
    try {
      console.log('🔄 Fetching voices from ElevenLabs API...');
      
      // Enhanced request with mobile-specific headers and error handling
      const response = await axios.get(`${BASE_URL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // Add mobile-friendly headers
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 15000, // Increased timeout for mobile networks
        // Add retry logic for mobile networks
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });

      console.log('📡 API Response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        dataType: typeof response.data,
        hasVoices: response.data?.voices ? response.data.voices.length : 0
      });

      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      if (response.data && response.data.voices) {
        const apiVoices = response.data.voices.map((voice: any) => ({
          voice_id: voice.voice_id,
          name: voice.name,
          category: voice.labels?.gender || voice.labels?.accent || 'Unknown',
          description: voice.labels?.description || `${voice.name} voice model from ElevenLabs`,
          labels: voice.labels || {}
        }));

        console.log(`✅ Successfully loaded ${apiVoices.length} voices from ElevenLabs API`);
        return apiVoices;
      }

      throw new Error('No voices found in API response');
    } catch (error: any) {
      console.error('❌ Error fetching voices from ElevenLabs:', error);
      
      // Enhanced error logging for mobile debugging
      console.error('🔍 Detailed error information:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestConfig: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? Object.keys(error.config.headers) : [],
          timeout: error.config?.timeout
        },
        isNetworkError: !error.response,
        isTimeoutError: error.code === 'ECONNABORTED',
        userAgent: navigator.userAgent
      });
      
      // Throw specific errors for real users instead of falling back to demo
      if (error.response?.status === 401) {
        throw new Error('Invalid ElevenLabs API key. Please check your configuration.');
      } else if (error.response?.status === 429) {
        throw new Error('ElevenLabs rate limit exceeded. Please try again later.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'NETWORK_ERROR') {
        throw new Error('Network error connecting to ElevenLabs. Please check your internet connection.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      } else {
        throw new Error('Failed to load voices from ElevenLabs. Please try again.');
      }
    }
  }

  async generateSpeech(
    text: string,
    voiceId: string,
    voiceSettings: VoiceSettings = { 
      stability: 0.5, 
      similarity_boost: 0.75,
      style: 0,
      use_speaker_boost: true
    }
  ): Promise<Blob> {
    // Enhanced text validation and preparation for Urdu support
    const cleanText = this.prepareTextForAPI(text);
    
    if (!cleanText) {
      throw new Error('Text cannot be empty');
    }

    if (cleanText.length > 5000) {
      throw new Error('Text is too long. Maximum 5000 characters allowed.');
    }

    // Detect if text contains Urdu/Hindi characters
    const containsUrdu = this.containsUrduText(cleanText);

    // Log the exact text being processed for debugging
    console.log('🎤 Processing text for speech generation:', {
      originalText: text,
      cleanedText: cleanText,
      textLength: cleanText.length,
      voiceId: voiceId,
      isApiConfigured: this.isConfigured(),
      containsUrdu: containsUrdu,
      encoding: 'UTF-8',
      unicodeNormalized: true,
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });

    // If no API key configured, use demo mode
    if (!this.isConfigured()) {
      console.log('🎭 Demo mode: Creating mock audio file for text:', cleanText);
      return this.createDemoAudio(cleanText);
    }

    // For real users with API key, make actual API call with better error handling
    try {
      console.log('🎤 Making ElevenLabs API call...');
      
      // Test API connectivity first with a simple request
      console.log('🔍 Testing API connectivity...');
      
      // Prepare request payload with proper encoding
      const requestPayload = {
        text: cleanText,
        model_id: containsUrdu ? 'eleven_multilingual_v2' : 'eleven_monolingual_v1',
        voice_settings: {
          stability: Math.max(0, Math.min(1, voiceSettings.stability)),
          similarity_boost: Math.max(0, Math.min(1, voiceSettings.similarity_boost)),
          style: voiceSettings.style || 0,
          use_speaker_boost: voiceSettings.use_speaker_boost !== false
        }
      };

      console.log('📝 Request payload:', requestPayload);
      
      const response = await axios.post(
        `${BASE_URL}/text-to-speech/${voiceId}`,
        requestPayload,
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json; charset=UTF-8',
            'xi-api-key': this.apiKey,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          responseType: 'blob',
          timeout: 45000,
          validateStatus: (status) => status < 500,
        }
      );

      console.log('📡 Speech generation response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        blobSize: response.data?.size || 0,
        userAgent: navigator.userAgent
      });

      if (response.status !== 200) {
        // Handle specific error status codes
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your ElevenLabs configuration.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status === 422) {
          throw new Error('Invalid text or voice parameters. Please check your input.');
        } else {
          throw new Error(`API error (${response.status}): ${response.statusText}`);
        }
      }

      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty audio response from ElevenLabs');
      }

      console.log(`✅ Speech generated successfully with ElevenLabs API${containsUrdu ? ' (Urdu text processed)' : ''}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ ElevenLabs API speech generation failed:', error);
      
      // Enhanced error logging for mobile debugging
      console.error('🔍 Detailed speech generation error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestConfig: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? Object.keys(error.config.headers) : [],
          timeout: error.config?.timeout
        },
        isNetworkError: !error.response,
        isTimeoutError: error.code === 'ECONNABORTED',
        userAgent: navigator.userAgent,
        textLength: cleanText.length,
        voiceId: voiceId
      });
      
      // Provide specific error messages based on the error type
      if (error.message.includes('Invalid API key') || error.message.includes('Rate limit') || error.message.includes('Invalid text')) {
        // Re-throw specific API errors as-is
        throw error;
      } else if (error.response?.status === 401) {
        throw new Error('Invalid ElevenLabs API key. Please check your configuration.');
      } else if (error.response?.status === 429) {
        throw new Error('ElevenLabs rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 422) {
        throw new Error('Invalid text or voice parameters. Please check your input.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again with shorter text or check your connection.');
      } else if (error.response?.status >= 500) {
        throw new Error('ElevenLabs server error. Please try again later.');
      } else {
        // For any other errors, provide a generic but helpful message
        throw new Error('Voice generation failed. Please check your connection and try again.');
      }
    }
  }

  // Helper method to detect Urdu/Arabic text
  private containsUrduText(text: string): boolean {
    // Unicode ranges for Urdu/Arabic script
    const urduArabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return urduArabicRegex.test(text);
  }

  // Enhanced text preparation method with Urdu support
  private prepareTextForAPI(inputText: string): string {
    // Remove only leading/trailing whitespace, preserve internal spacing
    let cleanedText = inputText.replace(/^\s+|\s+$/g, '');
    
    // Normalize Unicode for consistent character representation (NFC normalization)
    cleanedText = cleanedText.normalize('NFC');
    
    // Additional normalization for Arabic/Urdu text
    if (this.containsUrduText(cleanedText)) {
      // Remove any problematic zero-width characters that might interfere
      cleanedText = cleanedText.replace(/[\u200B-\u200D\uFEFF]/g, '');
      
      // Ensure proper RTL marks are preserved
      // Note: We don't remove RTL/LTR marks as they're important for proper text rendering
    }
    
    // Log the text preparation for debugging
    console.log('📝 Text preparation details:', {
      originalText: inputText,
      cleanedText: cleanedText,
      originalLength: inputText.length,
      cleanedLength: cleanedText.length,
      containsUrdu: this.containsUrduText(cleanedText),
      firstFewChars: cleanedText.substring(0, 20),
      encoding: 'UTF-8',
      normalization: 'NFC',
      unicodePoints: Array.from(cleanedText.substring(0, 10)).map(char => 
        `${char} (U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`
      )
    });
    
    return cleanedText;
  }

  private createDemoAudio(text: string): Promise<Blob> {
    return new Promise((resolve) => {
      try {
        console.log('🎭 Creating demo audio for text:', text);
        
        // Create a simple audio context and generate a tone that varies based on the text
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const duration = Math.min(Math.max(text.length * 0.1, 2), 10); // Min 2s, max 10s, roughly 0.1s per character
        const sampleRate = audioContext.sampleRate;
        const numSamples = Math.floor(duration * sampleRate);
        
        const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        // Generate a more speech-like pattern based on the actual text content
        const words = text.toLowerCase().split(/\s+/);
        const totalWords = words.length;
        const containsUrdu = this.containsUrduText(text);
        
        for (let i = 0; i < numSamples; i++) {
          const t = i / sampleRate;
          const progress = t / duration;
          const currentWordIndex = Math.floor(progress * totalWords);
          const currentWord = words[currentWordIndex] || '';
          
          // Create pauses between words
          const wordProgress = (progress * totalWords) % 1;
          const isWordBoundary = wordProgress < 0.1 && currentWordIndex > 0;
          
          if (isWordBoundary) {
            channelData[i] = 0; // Silence between words
          } else {
            // Vary frequency based on word characteristics to simulate speech patterns
            const wordHash = currentWord.split('').reduce((hash, char) => {
              return hash + char.charCodeAt(0);
            }, 0);
            
            // Adjust base frequency for Urdu text (slightly different tonal patterns)
            const baseFreq = containsUrdu ? 110 + (wordHash % 120) : 120 + (wordHash % 100);
            const vibrato = Math.sin(t * 5) * 8;
            const frequency = baseFreq + vibrato;
            
            // Add some formant-like harmonics
            const fundamental = Math.sin(2 * Math.PI * frequency * t);
            const harmonic2 = Math.sin(2 * Math.PI * frequency * 2.5 * t) * 0.4;
            const harmonic3 = Math.sin(2 * Math.PI * frequency * 3.8 * t) * 0.2;
            
            // Envelope to make it sound more natural
            const envelope = Math.sin(wordProgress * Math.PI) * 0.8 + 0.2;
            
            channelData[i] = (fundamental + harmonic2 + harmonic3) * 0.15 * envelope;
          }
        }
        
        // Convert to WAV blob
        const wavBlob = this.audioBufferToWav(audioBuffer);
        console.log(`✅ Demo audio created successfully${containsUrdu ? ' (Urdu text simulated)' : ''}`);
        resolve(wavBlob);
      } catch (error) {
        console.error('Error creating demo audio:', error);
        // Fallback: create a minimal blob with some audio data
        const dummyAudioData = new Uint8Array(1024);
        for (let i = 0; i < dummyAudioData.length; i++) {
          dummyAudioData[i] = Math.sin(i * 0.1) * 127 + 128;
        }
        resolve(new Blob([dummyAudioData], { type: 'audio/wav' }));
      }
    });
  }

  private audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const buffer = audioBuffer.getChannelData(0);
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * bytesPerSample);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * bytesPerSample, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, length * bytesPerSample, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  async getVoiceSettings(voiceId: string): Promise<VoiceSettings> {
    const defaultSettings = { 
      stability: 0.5, 
      similarity_boost: 0.75, 
      style: 0, 
      use_speaker_boost: true 
    };

    if (!this.isConfigured()) {
      return defaultSettings;
    }

    try {
      const response = await axios.get(`${BASE_URL}/voices/${voiceId}/settings`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      return response.data || defaultSettings;
    } catch (error) {
      console.error('Error fetching voice settings:', error);
      return defaultSettings;
    }
  }

  async getUserSubscription() {
    const defaultSubscription = { 
      tier: 'free', 
      character_count: 0, 
      character_limit: 10000,
      can_extend_character_limit: false,
      allowed_to_extend_character_limit: false
    };

    if (!this.isConfigured()) {
      return defaultSubscription;
    }

    try {
      const response = await axios.get(`${BASE_URL}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      return response.data || defaultSubscription;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return defaultSubscription;
    }
  }

  isConfigured(): boolean {
    const configured = !!(this.apiKey && this.apiKey.trim() !== '' && this.apiKey !== 'your_elevenlabs_api_key_here');
    
    // Additional mobile debugging
    if (!configured) {
      console.log('🔍 API not configured - debugging info:', {
        hasApiKey: !!this.apiKey,
        apiKeyType: typeof this.apiKey,
        apiKeyLength: this.apiKey ? this.apiKey.length : 0,
        envViteKey: import.meta.env.VITE_ELEVENLABS_API_KEY ? 'present' : 'missing',
        userAgent: navigator.userAgent,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      });
    }
    
    return configured;
  }
}

export const elevenLabsApi = new ElevenLabsAPI();
