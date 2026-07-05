import React, { useRef } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { Button } from '@/components/ui/button';
import {
  Play, 
  RotateCcw, 
  Send, 
  Loader2,
  ZoomIn,
  ZoomOut,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SupportedLanguage } from '@/types/codingPractice';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  isRunning: boolean;
  language?: SupportedLanguage;
  onLanguageChange?: (language: SupportedLanguage) => void;
  supportedLanguages?: SupportedLanguage[];
}

const LANGUAGE_INFO: Record<SupportedLanguage, { label: string; monacoLang: string }> = {
  javascript: { label: 'JavaScript', monacoLang: 'javascript' },
  python: { label: 'Python', monacoLang: 'python' },
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRun,
  onSubmit,
  onReset,
  isRunning,
  language = 'javascript',
  onLanguageChange,
  supportedLanguages = ['javascript'],
}) => {
  const { isDarkMode } = useDarkMode();
  const editorRef = useRef<any>(null);
  const [fontSize, setFontSize] = React.useState(14);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure JavaScript/TypeScript defaults
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    // Add keyboard shortcuts
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => onRun(),
    });

    editor.addAction({
      id: 'submit-code',
      label: 'Submit Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter],
      run: () => onSubmit(),
    });
  };

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const changeFontSize = (delta: number) => {
    setFontSize(prev => Math.min(24, Math.max(10, prev + delta)));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-background/95 relative z-10">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          {supportedLanguages.length > 1 && onLanguageChange ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1">
                  <span className="text-sm font-medium">
                    {LANGUAGE_INFO[language]?.label || language}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {supportedLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => onLanguageChange(lang)}
                    className={language === lang ? 'bg-accent' : ''}
                  >
                    {LANGUAGE_INFO[lang]?.label || lang}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              {LANGUAGE_INFO[language]?.label || language}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Font Controls Group */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-md p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeFontSize(-2)}
              disabled={fontSize <= 10}
              className="h-6 w-6 p-0"
              title={`Decrease font size (${fontSize}px)`}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeFontSize(2)}
              disabled={fontSize >= 24}
              className="h-6 w-6 p-0"
              title={`Increase font size (${fontSize}px)`}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={isRunning}
            className="h-8"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRun}
            disabled={isRunning}
            className="h-8"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Run
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onSubmit}
            disabled={isRunning}
            className="h-8 bg-green-600 hover:bg-green-700"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Submit
          </Button>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          options={{
            fontSize,
            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'line',
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        />
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="flex items-center justify-end gap-4 px-3 py-1.5 border-t text-xs text-muted-foreground bg-muted/30">
        <span>
          <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Ctrl</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Enter</kbd>
          {' Run'}
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Ctrl</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Shift</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Enter</kbd>
          {' Submit'}
        </span>
      </div>
    </div>
  );
};

export default CodeEditor;
