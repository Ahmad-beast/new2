import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Headphones, Mic, Sparkles, ArrowRight, Check, Users, TrendingUp, Volume2, Star } from 'lucide-react';

const Welcome: React.FC = () => {
  // Mock statistics data
  const stats = [
    {
      icon: <Users className="h-8 w-8 sm:h-10 lg:h-12 sm:w-10 lg:w-12 text-blue-600" />,
      number: "15,847",
      label: "Happy Customers",
      growth: "+23%",
      color: "text-blue-600"
    },
    {
      icon: <TrendingUp className="h-8 w-8 sm:h-10 lg:h-12 sm:w-10 lg:w-12 text-green-600" />,
      number: "89,234",
      label: "Orders Completed",
      growth: "+45%",
      color: "text-green-600"
    },
    {
      icon: <Volume2 className="h-8 w-8 sm:h-10 lg:h-12 sm:w-10 lg:w-12 text-purple-600" />,
      number: "2.4M+",
      label: "Voices Generated",
      growth: "+67%",
      color: "text-purple-600"
    },
    {
      icon: <Star className="h-8 w-8 sm:h-10 lg:h-12 sm:w-10 lg:w-12 text-yellow-600" />,
      number: "4.9/5",
      label: "Customer Rating",
      growth: "98% satisfaction",
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 rounded-full">
                <Headphones className="h-8 w-8 sm:h-10 lg:h-12 sm:w-10 lg:w-12 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Voice Magic
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-0">
            Transform your content with premium AI voices powered by ElevenLabs. 
            Perfect for <span className="font-semibold text-red-500">YouTube</span>, 
            <span className="font-semibold text-pink-500"> TikTok</span>, 
            <span className="font-semibold text-blue-500"> Podcasts</span>, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4 sm:px-0">
            <Link
              to="/login"
              className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Start Free
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm sm:text-base"
            >
              View Pricing
            </Link>
          </div>

          {/* Business Statistics Section */}
          <div className="relative max-w-6xl mx-auto px-4 sm:px-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-4 sm:py-6">
                <h3 className="text-lg sm:text-xl font-bold text-white text-center">
                  Trusted by Thousands of Creators Worldwide
                </h3>
                <p className="text-blue-100 text-sm sm:text-base text-center mt-1">
                  Join our growing community of content creators
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center group hover:transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-full group-hover:shadow-lg transition-shadow">
                        {stat.icon}
                      </div>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.color}`}>
                        {stat.number}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">
                        {stat.label}
                      </div>
                      <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold">
                        {stat.growth}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                      Ready to join our success story?
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Start creating amazing voice content today
                    </p>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm sm:text-base whitespace-nowrap"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Choose AI Voice Generator?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xs sm:max-w-2xl mx-auto px-4 sm:px-0">
              Professional-grade voice synthesis for content creators and businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />,
                title: 'Premium Voice Quality',
                description: 'ElevenLabs-powered AI voices that sound completely natural and professional'
              },
              {
                icon: <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />,
                title: 'Multiple Voice Models',
                description: 'Choose from various voice styles and personalities to match your content'
              },
              {
                icon: <Play className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />,
                title: 'Instant Generation',
                description: 'Generate high-quality voice content in seconds, not hours'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow"
              >
                <div className="mb-3 sm:mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Perfect For Every Creator
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: 'YouTube Videos', color: 'bg-red-500' },
              { name: 'TikTok Content', color: 'bg-pink-500' },
              { name: 'Podcast Intros', color: 'bg-green-500' },
              { name: 'YouTube Shorts', color: 'bg-blue-500' }
            ].map((useCase, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-600 text-center hover:shadow-lg transition-shadow"
              >
                <div className={`${useCase.color} w-8 h-8 sm:w-12 sm:h-12 rounded-lg mx-auto mb-3 sm:mb-4 flex items-center justify-center`}>
                  <Check className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  {useCase.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Transform Your Content?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">
            Join thousands of creators using AI Voice Generator
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-sm sm:text-base"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
