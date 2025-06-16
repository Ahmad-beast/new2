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
    if (this.isConfigured()) {
      console.log('✅ ElevenLabs API key loaded successfully');
    } else {
      console.warn('⚠️ ElevenLabs API key not configured. Using demo mode.');
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

    if (!this.isConfigured()) {
      console.log('🎭 Using demo voices (API key not configured)');
      return demoVoices;
    }

    try {
      console.log('🔄 Fetching voices from ElevenLabs API...');
      const response = await axios.get(`${BASE_URL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

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

      console.log('⚠️ No voices found in API response, using demo voices');
      return demoVoices;
    } catch (error: any) {
      console.error('❌ Error fetching voices from ElevenLabs:', error);
      
      if (error.response?.status === 401) {
        console.error('❌ Invalid ElevenLabs API key');
        toast?.error?.('Invalid ElevenLabs API key - Using demo voices');
      } else if (error.response?.status === 429) {
        console.error('❌ ElevenLabs rate limit exceeded');
        toast?.error?.('Rate limit exceeded - Using demo voices');
      } else if (error.code === 'ENOTFOUND' || error.code === 'NETWORK_ERROR') {
        console.error('❌ Network error connecting to ElevenLabs');
        toast?.error?.('Network error - Using demo voices');
      }
      
      // Always fallback to demo voices
      console.log('🎭 Falling back to demo voices');
      return demoVoices;
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
    // Validate and clean the input text
    const cleanText = text.trim();
    
    if (!cleanText) {
      throw new Error('Text cannot be empty');
    }

    if (cleanText.length > 5000) {
      throw new Error('Text is too long. Maximum 5000 characters allowed.');
    }

    // Log the exact text being processed for debugging
    console.log('🎤 Processing text for speech generation:', {
      originalText: text,
      cleanedText: cleanText,
      textLength: cleanText.length,
      voiceId: voiceId,
      isApiConfigured: this.isConfigured()
    });

    // If no API key configured, always use demo mode
    if (!this.isConfigured()) {
      console.log('🎭 Demo mode: Creating mock audio file for text:', cleanText);
      return this.createDemoAudio(cleanText);
    }

    // Try real API call, but fallback to demo on any error
    try {
      console.log('🎤 Attempting ElevenLabs API call...');
      console.log('📝 Request payload:', {
        text: cleanText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceSettings
      });
      
      const requestPayload = {
        text: cleanText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: Math.max(0, Math.min(1, voiceSettings.stability)),
          similarity_boost: Math.max(0, Math.min(1, voiceSettings.similarity_boost)),
          style: voiceSettings.style || 0,
          use_speaker_boost: voiceSettings.use_speaker_boost !== false
        }
      };

      const response = await axios.post(
        `${BASE_URL}/text-to-speech/${voiceId}`,
        requestPayload,
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'blob',
          timeout: 30000
        }
      );

      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty audio response from ElevenLabs');
      }

      console.log('✅ Speech generated successfully with ElevenLabs API');
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ ElevenLabs API failed, falling back to demo mode:', error.message);
      
      // Always fallback to demo mode instead of throwing errors
      console.log('🎭 Fallback: Creating demo audio for text:', cleanText);
      return this.createDemoAudio(cleanText);
    }
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
            
            const baseFreq = 120 + (wordHash % 100); // Vary base frequency per word
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
        console.log('✅ Demo audio created successfully');
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
    return !!(this.apiKey && this.apiKey.trim() !== '' && this.apiKey !== 'your_elevenlabs_api_key_here');
  }
}

export const elevenLabsApi = new ElevenLabsAPI();