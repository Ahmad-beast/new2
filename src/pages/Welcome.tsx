import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Mic, 
  Globe, 
  Zap, 
  Heart, 
  ArrowRight, 
  Check, 
  Star,
  MessageCircle,
  ChevronRight,
  Download,
  Volume2,
  Clock
} from 'lucide-react';

const Welcome: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Volume2 className="h-8 w-8 text-blue-600" />,
      title: "High-Quality Voices",
      description: "Premium AI voices powered by ElevenLabs technology for natural, human-like speech"
    },
    {
      icon: <Globe className="h-8 w-8 text-green-600" />,
      title: "Multilingual",
      description: "Support for English, Urdu, Hindi, Arabic, and 50+ languages with native accents"
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: "Fast Generation",
      description: "Generate studio-quality voices in under 10 seconds with our optimized pipeline"
    },
    {
      icon: <Heart className="h-8 w-8 text-pink-600" />,
      title: "Emotion Control",
      description: "Fine-tune voice emotion, pitch, speed, and style for perfect content matching"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Enter Text",
      description: "Type or paste your content in any supported language"
    },
    {
      number: "02", 
      title: "Select Voice",
      description: "Choose from our library of premium AI voice models"
    },
    {
      number: "03",
      title: "Generate & Download",
      description: "Get your high-quality audio file in seconds"
    }
  ];

  const plans = [
    {
      name: "Free Trial",
      price: "Free",
      duration: "Forever",
      features: [
        "5 voice generations",
        "Basic voice models",
        "Standard quality",
        "Community support"
      ],
      popular: false,
      badge: "Start Free"
    },
    {
      name: "7-Day Plan",
      price: "Rs. 200",
      duration: "7 Days",
      features: [
        "20 voice generations",
        "All voice models",
        "Premium quality",
        "Priority support",
        "Multiple formats"
      ],
      popular: true,
      badge: "Most Popular"
    },
    {
      name: "15-Day Plan", 
      price: "Rs. 350",
      duration: "15 Days",
      features: [
        "29 voice generations",
        "Advanced customization",
        "Batch processing",
        "API access",
        "Priority queue"
      ],
      popular: false,
      badge: null
    },
    {
      name: "30-Day Unlimited",
      price: "Rs. 499", 
      duration: "30 Days",
      features: [
        "Unlimited generations",
        "All premium features",
        "Custom voice training",
        "Dedicated support",
        "Commercial license"
      ],
      popular: false,
      badge: "Best Value"
    }
  ];

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/923064482383', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        {/* Subtle wave pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            <path 
              d="M0,400 C300,300 600,500 1200,400 L1200,800 L0,800 Z" 
              fill="url(#wave-gradient)"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-lg">
                  <Mic className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Turn Text into{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Realistic Voice
              </span>{' '}
              with AI
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Instant, natural-sounding voice generation in multiple styles and languages.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/login"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Free
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all text-lg"
              >
                View Pricing
              </Link>
            </div>

            {/* Demo Video Placeholder */}
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border border-gray-200 flex items-center justify-center shadow-xl group cursor-pointer hover:shadow-2xl transition-shadow">
                <div className="text-center">
                  <div className="bg-white p-6 rounded-full mb-4 mx-auto w-fit shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-12 w-12 text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-medium text-lg">
                    Watch AI Voice Generation Demo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Every Creator
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create professional voice content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to create amazing voice content
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="relative text-center">
                  {/* Step number */}
                  <div className="relative mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-white font-bold text-lg">{step.number}</span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="hidden lg:block absolute -right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-gray-600">
              Flexible pricing for creators of all sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl border-2 p-8 transition-all transform hover:scale-105 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-semibold ${
                    plan.popular 
                      ? 'bg-blue-600 text-white' 
                      : plan.badge === 'Start Free'
                      ? 'bg-green-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.duration !== 'Forever' && (
                      <span className="text-gray-600 text-lg">
                        /{plan.duration}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Free Trial' ? '/login' : '/pricing'}
                  className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.name === 'Free Trial' ? 'Start Free' : 'Choose Plan'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  AI Voice Generator
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Powered by ElevenLabs AI technology for premium voice generation.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Product
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Support
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/help" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>

            {/* WhatsApp Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Get Help
              </h3>
              <button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp Support
              </button>
              <p className="text-gray-500 text-xs mt-2">
                Available 9 AM - 6 PM PKT
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              © 2025 AI Voice Generator. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
