import React from 'react';

interface FormattedTextProps {
  content: string;
  className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  // Function to escape HTML to prevent XSS
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Function to process and format text content
  const formatContent = (text: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    let currentIndex = 0;

    // Split by code blocks first (highest priority)
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const beforeCodeBlock = text.slice(currentIndex, match.index);
      
      // Process text before code block
      if (beforeCodeBlock.trim()) {
        elements.push(...processTextContent(beforeCodeBlock, elements.length));
      }

      // Add code block
      const language = match[1] || '';
      const code = match[2].trim();
      
      elements.push(
        <div key={`code-${elements.length}`} className="my-4 first:mt-0 last:mb-0">
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden shadow-inner">
            {language && (
              <div className="bg-slate-800/90 px-4 py-2 text-xs font-mono tracking-wide uppercase text-slate-300 border-b border-slate-700">
                {language}
              </div>
            )}
            <pre className="p-4 overflow-x-auto bg-slate-950/70">
              <code className="text-sm md:text-[0.95rem] font-mono text-slate-100 whitespace-pre">
                {code}
              </code>
            </pre>
          </div>
        </div>
      );

      currentIndex = match.index + match[0].length;
    }

    // Process remaining text after last code block
    const remainingText = text.slice(currentIndex);
    if (remainingText.trim()) {
      elements.push(...processTextContent(remainingText, elements.length));
    }

    return elements;
  };

  // Function to process regular text content (non-code blocks)
  const processTextContent = (text: string, startIndex: number): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const lines = text.split('\n');
    let currentParagraph: string[] = [];
    let listItems: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ').trim();
        if (paragraphText) {
          elements.push(
            <p key={`p-${startIndex}-${elements.length}`} className="mb-4 text-[15px] md:text-base leading-8 text-slate-100">
              {formatInlineText(paragraphText)}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (listItems && listItems.items.length > 0) {
        const ListComponent = listItems.type === 'ol' ? 'ol' : 'ul';
        const listClass = listItems.type === 'ol' 
          ? "list-decimal list-inside space-y-2 my-4 first:mt-0 last:mb-0 pl-4 text-[15px] md:text-base text-slate-100"
          : "list-disc list-inside space-y-2 my-4 first:mt-0 last:mb-0 pl-4 text-[15px] md:text-base text-slate-100";
        
        elements.push(
          <ListComponent key={`list-${startIndex}-${elements.length}`} className={listClass}>
            {listItems.items.map((item, idx) => (
              <li key={idx} className="mb-2 leading-8">
                {formatInlineText(item)}
              </li>
            ))}
          </ListComponent>
        );
        listItems = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) {
        flushParagraph();
        flushList();
        continue;
      }

      // Check for headers
      if (line.match(/^#{1,4}\s+/)) {
        flushParagraph();
        flushList();
        
        const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const text = headerMatch[2];
          const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
          const headerClasses = {
            1: "text-3xl md:text-4xl font-bold text-slate-50 mt-7 mb-5 first:mt-0",
            2: "text-2xl md:text-3xl font-bold text-slate-50 mt-7 mb-4 first:mt-0",
            3: "text-xl md:text-2xl font-bold text-slate-100 mt-6 mb-4 first:mt-0",
            4: "text-lg md:text-xl font-semibold text-slate-100 mt-6 mb-3 first:mt-0"
          };
          
          elements.push(
            <HeaderTag key={`h-${startIndex}-${elements.length}`} className={headerClasses[level as keyof typeof headerClasses]}>
              {formatInlineText(text)}
            </HeaderTag>
          );
        }
        continue;
      }

      // Check for numbered list items
      const numberedMatch = line.match(/^(\d+\.)\s+(.+)$/);
      if (numberedMatch) {
        flushParagraph();
        if (!listItems || listItems.type !== 'ol') {
          flushList();
          listItems = { type: 'ol', items: [] };
        }
        listItems.items.push(numberedMatch[2]);
        continue;
      }

      // Check for bullet list items
      const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
      if (bulletMatch) {
        flushParagraph();
        if (!listItems || listItems.type !== 'ul') {
          flushList();
          listItems = { type: 'ul', items: [] };
        }
        listItems.items.push(bulletMatch[1]);
        continue;
      }

      // Regular text line
      flushList();
      currentParagraph.push(line);
    }

    // Flush remaining content
    flushParagraph();
    flushList();

    return elements;
  };

  // Function to format inline text (bold, italic, inline code)
  const formatInlineText = (text: string): (string | JSX.Element)[] => {
    const elements: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let elementKey = 0;

    // Process inline code first (highest priority for inline elements)
    const inlineCodeRegex = /`([^`\n]+)`/g;
    let match;

    const textWithoutCode = text.replace(inlineCodeRegex, (match, code) => {
      return `__INLINE_CODE_${code}__`;
    });

    // Process bold text
    const textWithBold = textWithoutCode.replace(/\*\*([^*]+)\*\*/g, (match, text) => {
      return `__BOLD_${text}__`;
    });

    // Process italic text (avoid conflict with bold)
    const textWithItalic = textWithBold.replace(/(?<!\*)\*([^*\s][^*]*[^*\s]|\S)\*(?!\*)/g, (match, text) => {
      return `__ITALIC_${text}__`;
    });

    // Split and rebuild with JSX elements
    const tokens = textWithItalic.split(/(__(?:INLINE_CODE|BOLD|ITALIC)_[^_]+__)/);
    
    return tokens.map((token, index) => {
      if (token.startsWith('__INLINE_CODE_')) {
        const code = token.replace('__INLINE_CODE_', '').replace('__', '');
        return (
          <code key={`code-${index}`} className="bg-slate-800/90 border border-slate-700 px-2 py-1 rounded text-[0.9em] font-mono text-blue-300">
            {code}
          </code>
        );
      } else if (token.startsWith('__BOLD_')) {
        const text = token.replace('__BOLD_', '').replace('__', '');
        return (
          <strong key={`bold-${index}`} className="font-bold text-slate-50">
            {text}
          </strong>
        );
      } else if (token.startsWith('__ITALIC_')) {
        const text = token.replace('__ITALIC_', '').replace('__', '');
        return (
          <em key={`italic-${index}`} className="italic text-slate-200">
            {text}
          </em>
        );
      }
      return token;
    }).filter(item => item !== '');
  };

  const processedContent = formatContent(content);

  return (
    <div className={`max-w-none ${className}`}>
      {processedContent}
    </div>
  );
};

export default FormattedText;