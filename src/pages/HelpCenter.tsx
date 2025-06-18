import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  HelpCircle, 
  Book, 
  Settings, 
  CreditCard, 
  Mic, 
  Clock,
  CheckCircle,
  MessageCircle
} from 'lucide-react';

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('getting-started');

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Book className="h-5 w-5" />,
      articles: [
        {
          title: 'How to create your first voice',
          content: 'Learn how to generate your first AI voice in just a few simple steps.',
          steps: [
            'Sign up for a free account',
            'Navigate to the Dashboard',
            'Enter your text in the text area',
            'Select a voice model from the dropdown',
            'Click "Generate Voice" button',
            'Download or play your generated audio'
          ]
        },
        {
          title: 'Understanding voice models',
          content: 'Explore the different voice models available and their characteristics.',
          steps: [
            'Browse available voices in the voice selector',
            'Listen to voice previews when available',
            'Consider gender, accent, and age for your content',
            'Test different voices for your specific use case'
          ]
        },
        {
          title: 'Account setup and verification',
          content: 'Complete guide to setting up your account and getting verified.',
          steps: [
            'Create account with email and password',
            'Verify your email address',
            'Complete your profile information',
            'Start with free voice generations'
          ]
        }
      ]
    },
    {
      id: 'voice-generation',
      title: 'Voice Generation',
      icon: <Mic className="h-5 w-5" />,
      articles: [
        {
          title: 'Best practices for text input',
          content: 'Tips to get the best results from your voice generation.',
          steps: [
            'Use clear, well-punctuated text',
            'Avoid special characters and symbols',
            'Keep sentences at reasonable length',
            'Use proper grammar and spelling',
            'Consider adding pauses with commas and periods'
          ]
        },
        {
          title: 'Voice quality optimization',
          content: 'How to improve the quality of your generated voices.',
          steps: [
            'Choose the right voice for your content type',
            'Adjust voice settings if available',
            'Use appropriate text formatting',
            'Test different voice models for comparison'
          ]
        },
        {
          title: 'Supported file formats',
          content: 'Understanding the audio formats available for download.',
          steps: [
            'MP3 format for general use',
            'WAV format for high quality',
            'Compatible with all major audio players',
            'Optimized for web and mobile playback'
          ]
        }
      ]
    },
    {
      id: 'plans-billing',
      title: 'Plans & Billing',
      icon: <CreditCard className="h-5 w-5" />,
      articles: [
        {
          title: 'Understanding subscription plans',
          content: 'Compare different plans and their features.',
          steps: [
            'Free Plan: 5 voice generations',
            '1 Day Plan (Rs. 99): 10 voices',
            '7 Days Plan (Rs. 200): 20 voices',
            '15 Days Plan (Rs. 350): 29 voices',
            '30 Days Plan (Rs. 499): Unlimited voices'
          ]
        },
        {
          title: 'How to upgrade your plan',
          content: 'Step-by-step guide to upgrading your subscription.',
          steps: [
            'Go to Pricing page',
            'Select your desired plan',
            'Complete JazzCash payment',
            'Submit transaction ID',
            'Wait for admin approval',
            'Enjoy your upgraded features'
          ]
        },
        {
          title: 'Payment methods and process',
          content: 'Available payment options and how to pay.',
          steps: [
            'JazzCash mobile wallet supported',
            'Send payment to: 0306-4482383',
            'Account holder: Muhammad Zubair',
            'Submit transaction ID for verification',
            'Admin approval within 24 hours'
          ]
        }
      ]
    },
    {
      id: 'account-settings',
      title: 'Account & Settings',
      icon: <Settings className="h-5 w-5" />,
      articles: [
        {
          title: 'Managing your profile',
          content: 'How to update your account information.',
          steps: [
            'Access your dashboard',
            'Update display name and preferences',
            'Change password if needed',
            'Manage notification settings'
          ]
        },
        {
          title: 'Usage tracking and limits',
          content: 'Understanding your voice generation usage.',
          steps: [
            'View usage statistics in dashboard',
            'Track remaining voice generations',
            'Monitor plan expiry dates',
            'Upgrade when limits are reached'
          ]
        },
        {
          title: 'Account security',
          content: 'Keeping your account safe and secure.',
          steps: [
            'Use strong, unique passwords',
            'Enable two-factor authentication',
            'Log out from shared devices',
            'Report suspicious activity'
          ]
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <HelpCircle className="h-5 w-5" />,
      articles: [
        {
          title: 'Voice generation not working',
          content: 'Common issues and solutions for voice generation problems.',
          steps: [
            'Check your internet connection',
            'Verify you have remaining voice credits',
            'Try refreshing the page',
            'Clear browser cache and cookies',
            'Contact support if issue persists'
          ]
        },
        {
          title: 'Audio playback issues',
          content: 'Fixing problems with audio playback and downloads.',
          steps: [
            'Ensure browser supports audio playback',
            'Check device volume settings',
            'Try different browser or device',
            'Download file and play locally',
            'Update your browser to latest version'
          ]
        },
        {
          title: 'Payment verification delays',
          content: 'What to do if your payment is not verified quickly.',
          steps: [
            'Ensure correct transaction ID was submitted',
            'Check payment was sent to correct number',
            'Wait up to 24 hours for verification',
            'Contact admin if delay exceeds 24 hours',
            'Keep payment receipt for reference'
          ]
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/923064482383', '_blank');
  };

  const faqs = [
    {
      question: 'How long does voice generation take?',
      answer: 'Most voice generations complete within 10-30 seconds, depending on text length and server load.'
    },
    {
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'We offer refunds within 7 days of purchase if you haven\'t used more than 50% of your voice credits.'
    },
    {
      question: 'How do I upgrade my plan?',
      answer: 'Visit the Pricing page, select your desired plan, complete the payment, and submit your transaction ID for verification.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption and never store your generated audio files permanently on our servers.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of AI Voice Generator
          </p>
        </div>

        {/* Quick Answers Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Answers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 sm:pl-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 rounded-r-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Hours Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
            Support Hours
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Monday - Friday</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">9:00 AM - 6:00 PM PKT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Saturday</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">10:00 AM - 4:00 PM PKT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Sunday</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Closed</span>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm sm:text-base text-green-700 dark:text-green-300 font-medium">
                  We're currently online
                </span>
              </div>
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                Average response time: Under 2 hours
              </p>
            </div>
          </div>
        </div>

        {/* What can we help you with? Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            What can we help you with?
          </h2>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Help Categories */}
          <div className="space-y-4 sm:space-y-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600 dark:text-blue-400">
                      {category.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      {category.title}
                    </h3>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                      {category.articles.length}
                    </span>
                  </div>
                  {expandedCategory === category.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {expandedCategory === category.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="space-y-4 sm:space-y-6">
                      {category.articles.map((article, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 pl-4 sm:pl-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-700 rounded-r-lg"
                        >
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {article.title}
                          </h4>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                            {article.content}
                          </p>
                          <div className="space-y-2">
                            {article.steps.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-start space-x-2 sm:space-x-3">
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                  {stepIndex + 1}
                                </span>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Support Button */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 sm:p-8 text-white mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Need Immediate Help?
            </h2>
            <p className="text-green-100 mb-4 sm:mb-6 text-sm sm:text-base">
              Chat with our support team directly on WhatsApp for instant assistance
            </p>
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Chat on WhatsApp
            </button>
            <p className="text-green-100 text-xs sm:text-sm mt-3">
              Available during support hours • Usually responds within minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
