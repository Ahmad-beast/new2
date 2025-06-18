import React from 'react';
import { 
  Clock,
  CheckCircle,
  MessageCircle,
  HelpCircle,
  Zap,
  Shield
} from 'lucide-react';

const Contact: React.FC = () => {
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

  const supportCategories = [
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: 'General Support',
      description: 'Questions about features, usage, or getting started'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Technical Issues',
      description: 'Voice generation problems, bugs, or technical difficulties'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Account & Billing',
      description: 'Payment issues, plan changes, or account management'
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: 'Feature Requests',
      description: 'Suggestions for new features or improvements'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Support
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Need help? We're here to assist you with any questions or issues you might have.
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            What can we help you with?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {supportCategories.map((category, index) => (
              <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-blue-600 dark:text-blue-400 mt-1">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1">
                    {category.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Support Button */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 sm:p-8 text-white">
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

export default Contact;
