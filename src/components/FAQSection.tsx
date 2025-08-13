import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { faqs } from "@/data/faqs";

const FAQSection = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const navigate = useNavigate();
  
  // Show only first 6 FAQs on home page
  const homeFaqs = faqs.slice(0, 6);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength);
  };

  const needsReadMore = (text: string, maxLength: number = 150) => {
    return text.length > maxLength;
  };

  const handleReadMore = (faqId: string) => {
    navigate(`/faqs#${faqId}`);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-normal">
            Frequently Asked
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Questions</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Get answers to common questions about SkillPath and start your learning journey today.
          </p>
        </div>

        <div className="space-y-4">
          {homeFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => toggleItem(faq.id)}
              >
                <span className="font-semibold text-gray-900 dark:text-white text-lg">
                  {faq.question}
                </span>
                {openItems.includes(faq.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                )}
              </button>
              
              {openItems.includes(faq.id) && (
                <div className="px-6 pb-4">
                  <div className="relative">
                    {needsReadMore(faq.answer) ? (
                      <div className="relative">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {truncateText(faq.answer)}
                        </p>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-800 to-transparent pointer-events-none"></div>
                        <div className="mt-3">
                          <Button
                            variant="link"
                            className="p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => handleReadMore(faq.id)}
                          >
                            Read More →
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/faqs')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
