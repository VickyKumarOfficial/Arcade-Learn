import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { faqs } from "@/data/faqs";
import { motion, AnimatePresence } from "framer-motion";

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

  const truncateText = (text: string, maxLength: number = 180) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength);
  };

  const needsReadMore = (text: string, maxLength: number = 180) => {
    return text.length > maxLength;
  };

  const handleReadMore = (faqId: string) => {
    navigate(`/faqs#${faqId}`);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-normal">
            Frequently Asked
            <span className="text-primary"> Questions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get answers to common questions about ArcadeLearn and start your learning journey today.
          </p>
        </motion.div>

        <div className="space-y-4">
          {homeFaqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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

              <AnimatePresence>
                {openItems.includes(faq.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <div className="relative">
                        {needsReadMore(faq.answer) ? (
                          <div className="relative">
                            <div className="relative overflow-hidden">
                              <p className="text-muted-foreground leading-relaxed">
                                {truncateText(faq.answer)}
                              </p>
                              {/* Blur overlay covering only the last 2-3 lines */}
                              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none"></div>
                            </div>
                            {/* Read More button positioned just below the blur area */}
                            <div className="mt-2 flex justify-start">
                              <Button
                                variant="link"
                                className="p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/faqs')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
