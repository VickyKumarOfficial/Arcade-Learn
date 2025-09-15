import { Button } from "@/components/ui/button";
import { ArrowUp, Github, Twitter, Linkedin, Mail, Heart, Code, BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const footerLinks = {
    product: [
      { label: 'Roadmaps', path: '/roadmaps' },
      { label: 'Careers', path: '/careers' },
      { label: 'FAQs', path: '/faqs' }
    ],
    resources: [
      { label: 'Documentation', path: '#' },
      { label: 'Community', path: '#' },
      { label: 'Blog', path: '#' },
      { label: 'Support', path: '#' }
    ],
    company: [
      { label: 'About Us', path: '#' },
      { label: 'Privacy Policy', path: '#' },
      { label: 'Terms of Service', path: '#' },
      { label: 'Contact', path: '#' }
    ]
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 dark:opacity-10"></div>
      
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-800 rounded-lg flex items-center justify-center">
                <img src="/favicon.png" alt="Arcade Learn Logo" className="h-8 w-8 object-contain mix-blend-luminosity brightness-1000" />
              </div>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Arcade
                </span>
                <span className="text-white ml-1">Learn</span>
              </span>
            </div>
            <p className="text-gray-300 dark:text-gray-400 mb-6 leading-relaxed">
              Empowering developers through curated learning roadmaps and hands-on projects. 
              Transform your career with structured, gamified learning experiences.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 p-0 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200"
                onClick={() => window.open('#', '_blank')}
              >
                <Github className="h-4 w-4 text-white" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 p-0 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200"
                onClick={() => window.open('#', '_blank')}
              >
                <Twitter className="h-4 w-4 text-white" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 p-0 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200"
                onClick={() => window.open('#', '_blank')}
              >
                <Linkedin className="h-4 w-4 text-white" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 p-0 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200"
                onClick={() => window.open('mailto:contact@arcadelearn.com', '_blank')}
              >
                <Mail className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-left hover:translate-x-1 transform transition-transform"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Code className="h-5 w-5 mr-2 text-blue-400" />
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-left hover:translate-x-1 transform transition-transform"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-left hover:translate-x-1 transform transition-transform"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 mb-12">
          <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-300 dark:text-gray-400">
                Get the latest updates on new roadmaps, features, and learning resources.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-8">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-64"
              />
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-300 dark:text-gray-400 text-sm text-center md:text-left">
              <p className="flex items-center justify-center md:justify-start">
                © {currentYear} ArcadeLearn. Made with 
                <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" />
                for developers worldwide.
              </p>
            </div>
            
            {/* Back to Top Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-200 group"
            >
              <ArrowUp className="h-4 w-4 mr-2 group-hover:-translate-y-1 transition-transform" />
              Back to Top
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;