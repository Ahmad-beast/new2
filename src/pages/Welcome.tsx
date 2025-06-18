import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Headphones, Mic, Sparkles, ArrowRight, Check, Star, Zap, Volume2, Users, Globe, Award, TrendingUp, Music, Video, Podcast, MessageSquare, ChevronDown, Waves, Brain, Rocket, Shield, Heart, Eye, Flame, Crown, Diamond, Infinity, Layers, Cpu, Wand2, Palette, Headset, Radio, Megaphone, Mic2, Speaker, AudioWaveform, Waves as SoundWaves } from 'lucide-react';

const Welcome: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "YouTube Creator • 2.5M Subscribers",
      content: "This AI voice generator completely revolutionized my content creation workflow. The quality is absolutely mind-blowing!",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      rating: 5,
      platform: "YouTube"
    },
    {
      name: "Ahmed Hassan",
      role: "Podcast Host • Top 1% Globally",
      content: "Perfect for creating professional intros and outros. The Urdu support is phenomenal - exactly what I needed!",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      rating: 5,
      platform: "Spotify"
    },
    {
      name: "Maria Rodriguez",
      role: "Content Marketer • Fortune 500",
      content: "Game-changer for our social media campaigns. Multiple languages, premium quality, lightning fast results!",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      rating: 5,
      platform: "TikTok"
    },
    {
      name: "David Kim",
      role: "Audiobook Producer",
      content: "The voice quality is so realistic, our listeners can't tell the difference. This is the future of audio content!",
      avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      rating: 5,
      platform: "Audible"
    }
  ];

  const features = [
    {
      icon: <Brain className="h-10 w-10" />,
      title: "Neural AI Excellence",
      description: "Advanced ElevenLabs neural networks for human-indistinguishable voice synthesis",
      color: "from-purple-500 via-pink-500 to-red-500",
      bgColor: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: "Global Language Support",
      description: "English, Urdu, Hindi, Arabic, Spanish, French, and 50+ languages supported",
      color: "from-blue-500 via-cyan-500 to-teal-500",
      bgColor: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Lightning Generation",
      description: "Generate studio-quality voices in under 10 seconds with our optimized pipeline",
      color: "from-yellow-500 via-orange-500 to-red-500",
      bgColor: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Enterprise Security",
      description: "Bank-grade encryption, GDPR compliant, with zero data retention policy",
      color: "from-green-500 via-emerald-500 to-teal-500",
      bgColor: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: <Wand2 className="h-10 w-10" />,
      title: "Voice Customization",
      description: "Fine-tune pitch, speed, emotion, and style for perfect voice matching",
      color: "from-indigo-500 via-purple-500 to-pink-500",
      bgColor: "from-indigo-500/20 to-purple-500/20"
    },
    {
      icon: <Infinity className="h-10 w-10" />,
      title: "Unlimited Creativity",
      description: "No limits on your imagination - create any voice for any content type",
      color: "from-rose-500 via-pink-500 to-purple-500",
      bgColor: "from-rose-500/20 to-pink-500/20"
    }
  ];

  const useCases = [
    { 
      icon: <Video className="h-8 w-8" />, 
      name: "YouTube Videos", 
      users: "125K+", 
      color: "bg-gradient-to-r from-red-500 to-red-600",
      description: "Viral content creation"
    },
    { 
      icon: <Music className="h-8 w-8" />, 
      name: "TikTok Content", 
      users: "89K+", 
      color: "bg-gradient-to-r from-pink-500 to-rose-500",
      description: "Short-form viral videos"
    },
    { 
      icon: <Podcast className="h-8 w-8" />, 
      name: "Podcasts", 
      users: "45K+", 
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      description: "Professional audio shows"
    },
    { 
      icon: <MessageSquare className="h-8 w-8" />, 
      name: "Commercials", 
      users: "32K+", 
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      description: "Brand advertisements"
    },
    { 
      icon: <Radio className="h-8 w-8" />, 
      name: "Audiobooks", 
      users: "28K+", 
      color: "bg-gradient-to-r from-purple-500 to-indigo-500",
      description: "Literary narrations"
    },
    { 
      icon: <Megaphone className="h-8 w-8" />, 
      name: "Announcements", 
      users: "19K+", 
      color: "bg-gradient-to-r from-orange-500 to-yellow-500",
      description: "Public communications"
    }
  ];

  const stats = [
    { 
      number: "2.5M+", 
      label: "Voices Generated", 
      icon: <Volume2 className="h-8 w-8" />,
      color: "from-blue-500 to-purple-500"
    },
    { 
      number: "150K+", 
      label: "Happy Creators", 
      icon: <Users className="h-8 w-8" />,
      color: "from-green-500 to-teal-500"
    },
    { 
      number: "50+", 
      label: "Voice Models", 
      icon: <Mic className="h-8 w-8" />,
      color: "from-pink-500 to-rose-500"
    },
    { 
      number: "99.99%", 
      label: "Uptime", 
      icon: <Award className="h-8 w-8" />,
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const voiceShowcase = [
    { name: "Professional", icon: <Headset className="h-6 w-6" />, color: "from-blue-500 to-indigo-500" },
    { name: "Conversational", icon: <MessageSquare className="h-6 w-6" />, color: "from-green-500 to-emerald-500" },
    { name: "Dramatic", icon: <Flame className="h-6 w-6" />, color: "from-red-500 to-pink-500" },
    { name: "Narrative", icon: <AudioWaveform className="h-6 w-6" />, color: "from-purple-500 to-violet-500" },
    { name: "Commercial", icon: <Speaker className="h-6 w-6" />, color: "from-orange-500 to-yellow-500" },
    { name: "Educational", icon: <Brain className="h-6 w-6" />, color: "from-cyan-500 to-blue-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Ultra Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            top: '-10%',
            right: '-10%'
          }}
        ></div>
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"
          style={{
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * 0.03}px)`,
            bottom: '-10%',
            left: '-10%'
          }}
        ></div>
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * -0.02}px)`,
            top: '40%',
            left: '40%'
          }}
        ></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-16 sm:pb-24">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Floating Icon with Advanced Effects */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="relative group">
              {/* Outer glow ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse scale-150"></div>
              
              {/* Middle ring */}
              <div className="absolute inset-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-50 animate-spin-slow"></div>
              
              {/* Main icon container */}
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 rounded-full transform group-hover:scale-110 transition-all duration-500 shadow-2xl">
                <Headphones className="h-12 w-12 sm:h-16 lg:h-20 sm:w-16 lg:w-20 text-white animate-pulse" />
              </div>
              
              {/* Floating sparkles */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-2 animate-bounce shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-1.5 animate-pulse">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div className="absolute top-0 left-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full p-1 animate-ping">
                <Diamond className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          
          {/* Ultra Dynamic Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-tight">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x bg-300% font-extrabold">
                AI Voice Revolution
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent blur-sm opacity-50 animate-pulse"></div>
            </span>
            <br />
            <span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
              Starts Here
            </span>
          </h1>
          
          {/* Enhanced Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-8 sm:mb-12 max-w-5xl mx-auto leading-relaxed">
            Create <span className="text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text font-bold animate-pulse">mind-blowing</span> content with 
            <span className="text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text font-bold"> premium AI voices</span> powered by ElevenLabs. 
            Perfect for <span className="text-red-400 font-bold">YouTube</span>, 
            <span className="text-pink-400 font-bold"> TikTok</span>, 
            <span className="text-blue-400 font-bold"> Podcasts</span>, 
            <span className="text-purple-400 font-bold"> Audiobooks</span>, and beyond.
          </p>

          {/* Voice Showcase Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {voiceShowcase.map((voice, index) => (
              <div
                key={index}
                className={`group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${voice.color} rounded-full text-white font-medium text-sm hover:scale-105 transition-all cursor-pointer shadow-lg hover:shadow-xl`}
              >
                {voice.icon}
                <span>{voice.name}</span>
              </div>
            ))}
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 sm:mb-20">
            <Link
              to="/login"
              className="group relative inline-flex items-center justify-center px-10 sm:px-16 py-5 sm:py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-black rounded-3xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 text-xl sm:text-2xl overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity animate-gradient-x bg-300%"></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative flex items-center">
                <Rocket className="h-7 w-7 mr-4 group-hover:animate-bounce" />
                Start Creating Magic
                <ArrowRight className="h-7 w-7 ml-4 group-hover:translate-x-3 transition-transform" />
              </div>
            </Link>
            
            <Link
              to="/pricing"
              className="group inline-flex items-center justify-center px-10 sm:px-16 py-5 sm:py-6 border-3 border-purple-400 text-purple-400 font-black rounded-3xl hover:bg-purple-400 hover:text-white transition-all transform hover:scale-105 backdrop-blur-sm bg-white/10 text-xl sm:text-2xl shadow-xl hover:shadow-purple-500/30"
            >
              <Crown className="h-7 w-7 mr-4 group-hover:animate-pulse" />
              View Premium Plans
            </Link>
          </div>

          {/* Ultra Enhanced Demo Video Section */}
          <div className="relative max-w-6xl mx-auto group">
            {/* Outer glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
            
            {/* Main container */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-3xl border-2 border-purple-500/50 flex items-center justify-center shadow-2xl overflow-hidden backdrop-blur-sm">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-x bg-300%"></div>
                <SoundWaves className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-full w-full text-purple-500/30 animate-pulse" />
              </div>
              
              {/* Content */}
              <div className="relative text-center z-10">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 sm:p-12 rounded-full mb-8 mx-auto w-fit shadow-2xl transform group-hover:scale-110 transition-transform cursor-pointer relative overflow-hidden">
                  {/* Play button shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Play className="h-16 w-16 sm:h-20 sm:w-20 text-white relative z-10" />
                </div>
                <h3 className="text-white font-bold text-2xl sm:text-3xl mb-4">
                  Experience AI Voice Magic
                </h3>
                <p className="text-gray-300 text-lg sm:text-xl mb-6">
                  Watch how creators are revolutionizing content with our AI voices
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="bg-green-500 rounded-full p-2 animate-pulse">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-yellow-500 rounded-full p-2 animate-bounce">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-blue-500 rounded-full p-2 animate-ping">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-6 left-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-3 animate-float shadow-lg">
                <Mic2 className="h-6 w-6 text-white" />
              </div>
              <div className="absolute bottom-6 right-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full p-3 animate-bounce shadow-lg">
                <Volume2 className="h-6 w-6 text-white" />
              </div>
              <div className="absolute top-1/2 right-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full p-2 animate-pulse shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="relative bg-black/30 backdrop-blur-xl border-y border-purple-500/30 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`bg-gradient-to-r ${stat.color} p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-125 transition-all duration-500 shadow-xl group-hover:shadow-2xl`}>
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                  {stat.number}
                </div>
                <div className="text-gray-300 text-lg font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ultra Enhanced Features Section */}
      <div className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8">
              Why Choose 
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x bg-300%"> AI Voice Magic</span>?
            </h2>
            <p className="text-2xl sm:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Revolutionary technology that transforms how you create content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-700 hover:border-purple-500 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 overflow-hidden"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  <div className={`bg-gradient-to-r ${feature.color} p-5 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Use Cases Section */}
      <div className="relative bg-gradient-to-r from-purple-900/50 via-pink-900/30 to-purple-900/50 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-8">
              Perfect For Every Creator
            </h2>
            <p className="text-2xl text-gray-300 mb-12">
              Join the revolution - creators worldwide are already using AI Voice Magic
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="group bg-gray-900/70 backdrop-blur-xl p-6 rounded-2xl border border-gray-700 hover:border-purple-500 text-center transition-all transform hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/30 overflow-hidden"
              >
                {/* Background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className={`${useCase.color} w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-125 transition-transform duration-500 shadow-xl`}>
                    <div className="text-white">
                      {useCase.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 group-hover:text-purple-400 transition-colors">
                    {useCase.name}
                  </h3>
                  <p className="text-purple-400 text-sm font-semibold mb-1">
                    {useCase.users} creators
                  </p>
                  <p className="text-gray-400 text-xs">
                    {useCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ultra Enhanced Testimonials Section */}
      <div className="relative py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-20">
            What Creators Are Saying
          </h2>
          
          <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 sm:p-16 border border-gray-700 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-gradient-x bg-300%"></div>
            
            {/* Quote icon */}
            <div className="absolute top-8 left-8 text-purple-400/30">
              <MessageSquare className="h-12 w-12" />
            </div>
            
            <div className="relative z-10 transition-all duration-700">
              {/* Star rating */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-2xl sm:text-3xl text-gray-300 mb-8 leading-relaxed font-medium">
                "{testimonials[currentTestimonial].content}"
              </p>
              
              <div className="flex items-center justify-center space-x-6">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-20 h-20 rounded-full border-3 border-purple-500 shadow-xl"
                />
                <div className="text-left">
                  <div className="font-bold text-white text-xl">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-purple-400 text-lg">
                    {testimonials[currentTestimonial].role}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {testimonials[currentTestimonial].platform} Creator
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation dots */}
            <div className="flex justify-center space-x-3 mt-12">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ultimate CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 via-pink-600 to-orange-600 py-24 sm:py-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 via-pink-600 to-orange-600 animate-gradient-x bg-400%"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 bg-white/20 rounded-full p-4 animate-float">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 bg-white/20 rounded-full p-4 animate-bounce">
          <Crown className="h-8 w-8 text-white" />
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8">
            Ready to Create Magic?
          </h2>
          <p className="text-2xl sm:text-3xl text-white/90 mb-16 leading-relaxed">
            Join the AI voice revolution and create content that captivates millions
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link
              to="/login"
              className="group inline-flex items-center px-12 py-6 bg-white text-purple-600 font-black rounded-3xl hover:bg-gray-100 transition-all shadow-2xl transform hover:scale-110 text-2xl overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/50 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative flex items-center">
                <Rocket className="h-8 w-8 mr-4 group-hover:animate-bounce" />
                Start Creating Free
                <ArrowRight className="h-8 w-8 ml-4 group-hover:translate-x-3 transition-transform" />
              </div>
            </Link>
            
            <Link
              to="/pricing"
              className="inline-flex items-center px-12 py-6 border-3 border-white text-white font-black rounded-3xl hover:bg-white hover:text-purple-600 transition-all transform hover:scale-110 text-2xl"
            >
              <TrendingUp className="h-8 w-8 mr-4" />
              View Premium Plans
            </Link>
          </div>
          
          <div className="mt-12 flex justify-center space-x-8 text-white/80">
            <div className="flex items-center">
              <Check className="h-6 w-6 mr-2" />
              <span className="text-lg">No credit card required</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-6 w-6 mr-2" />
              <span className="text-lg">Instant access</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              <span className="text-lg">100% secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-50">
        <div className="bg-purple-500/80 backdrop-blur-sm rounded-full p-3 shadow-xl">
          <ChevronDown className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
