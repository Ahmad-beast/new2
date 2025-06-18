import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Headphones, 
  Mic, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Star,
  Zap,
  Volume2,
  Users,
  Globe,
  Award,
  TrendingUp,
  Music,
  Video,
  Podcast,
  MessageSquare,
  ChevronDown,
  Waves,
  Brain,
  Rocket,
  Shield
} from 'lucide-react';

const Welcome: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "YouTube Creator",
      content: "This AI voice generator transformed my content creation process. The quality is incredible!",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
    },
    {
      name: "Ahmed Hassan",
      role: "Podcast Host",
      content: "Perfect for creating professional intros and outros. The Urdu support is amazing!",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
    },
    {
      name: "Maria Rodriguez",
      role: "Content Marketer",
      content: "Game-changer for our social media campaigns. Multiple languages, premium quality!",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
    }
  ];

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Excellence",
      description: "Advanced ElevenLabs technology for human-like voice synthesis",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Multilingual Support",
      description: "English, Urdu, Hindi, and more languages supported",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Generate professional voices in seconds, not hours",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Premium Quality",
      description: "Studio-grade audio quality for professional use",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const useCases = [
    { icon: <Video className="h-6 w-6" />, name: "YouTube Videos", users: "50K+", color: "bg-red-500" },
    { icon: <Music className="h-6 w-6" />, name: "TikTok Content", users: "30K+", color: "bg-pink-500" },
    { icon: <Podcast className="h-6 w-6" />, name: "Podcasts", users: "15K+", color: "bg-green-500" },
    { icon: <MessageSquare className="h-6 w-6" />, name: "Commercials", users: "8K+", color: "bg-blue-500" }
  ];

  const stats = [
    { number: "100K+", label: "Voices Generated", icon: <Volume2 className="h-6 w-6" /> },
    { number: "25K+", label: "Happy Creators", icon: <Users className="h-6 w-6" /> },
    { number: "15+", label: "Voice Models", icon: <Mic className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime", icon: <Award className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-16 sm:pb-24">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Floating Icon */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 rounded-full transform group-hover:scale-110 transition-transform duration-300">
                <Headphones className="h-10 w-10 sm:h-12 lg:h-16 sm:w-12 lg:w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 animate-bounce">
                <Sparkles className="h-4 w-4 text-yellow-800" />
              </div>
            </div>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
              AI Voice Magic
            </span>
            <br />
            <span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              Unleashed
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your content with <span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text font-semibold">premium AI voices</span> powered by ElevenLabs. 
            Perfect for <span className="text-red-400 font-semibold">YouTube</span>, 
            <span className="text-pink-400 font-semibold"> TikTok</span>, 
            <span className="text-blue-400 font-semibold"> Podcasts</span>, and beyond.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16 sm:mb-20">
            <Link
              to="/login"
              className="group relative inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25 text-lg sm:text-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center">
                <Rocket className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                Start Creating Free
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
            
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 border-2 border-purple-400 text-purple-400 font-bold rounded-2xl hover:bg-purple-400 hover:text-white transition-all transform hover:scale-105 backdrop-blur-sm bg-white/10 text-lg sm:text-xl"
            >
              <Star className="h-6 w-6 mr-3" />
              View Pricing
            </Link>
          </div>

          {/* Demo Video Section */}
          <div className="relative max-w-5xl mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700 flex items-center justify-center shadow-2xl overflow-hidden">
              {/* Animated waves background */}
              <div className="absolute inset-0 opacity-20">
                <Waves className="h-full w-full text-purple-500 animate-pulse" />
              </div>
              
              <div className="relative text-center z-10">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 rounded-full mb-6 mx-auto w-fit shadow-2xl transform group-hover:scale-110 transition-transform cursor-pointer">
                  <Play className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                </div>
                <p className="text-gray-300 font-semibold text-xl sm:text-2xl mb-2">
                  Watch AI Voice Magic in Action
                </p>
                <p className="text-gray-500 text-sm sm:text-base">
                  See how creators are transforming their content
                </p>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-4 left-4 bg-green-500 rounded-full p-2 animate-bounce">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div className="absolute bottom-4 right-4 bg-yellow-500 rounded-full p-2 animate-pulse">
                <Star className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative bg-black/20 backdrop-blur-sm border-y border-gray-800 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm sm:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Why Choose 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> AI Voice Magic</span>?
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              Professional-grade voice synthesis that brings your content to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-800 hover:border-purple-500 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="relative bg-gradient-to-r from-purple-900/50 to-pink-900/50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Perfect For Every Creator
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of creators already using AI Voice Magic
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="group bg-gray-900/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-gray-700 hover:border-purple-500 text-center transition-all transform hover:scale-105 hover:shadow-xl"
              >
                <div className={`${useCase.color} w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <div className="text-white">
                    {useCase.icon}
                  </div>
                </div>
                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-purple-400 transition-colors">
                  {useCase.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {useCase.users} creators
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-16">
            What Creators Are Saying
          </h2>
          
          <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-gray-800">
            <div className="absolute top-4 left-4 text-purple-400 opacity-50">
              <MessageSquare className="h-8 w-8" />
            </div>
            
            <div className="transition-all duration-500">
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full border-2 border-purple-500"
                />
                <div className="text-left">
                  <div className="font-bold text-white text-lg">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-purple-400">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20 sm:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Transform Your Content?
          </h2>
          <p className="text-xl sm:text-2xl text-blue-100 mb-12">
            Join the AI voice revolution and create content that captivates
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/login"
              className="group inline-flex items-center px-10 py-5 bg-white text-purple-600 font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-2xl transform hover:scale-105 text-xl"
            >
              <Sparkles className="h-6 w-6 mr-3 group-hover:animate-spin" />
              Start Creating Free
              <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
            
            <Link
              to="/pricing"
              className="inline-flex items-center px-10 py-5 border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-purple-600 transition-all transform hover:scale-105 text-xl"
            >
              <TrendingUp className="h-6 w-6 mr-3" />
              View All Plans
            </Link>
          </div>
          
          <p className="text-blue-100 text-sm mt-8 opacity-75">
            No credit card required • Start with 5 free generations • Upgrade anytime
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-purple-400" />
      </div>
    </div>
  );
};

export default Welcome;
