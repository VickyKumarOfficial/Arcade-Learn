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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-border/70 bg-background/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-gradient-to-r from-background via-background to-muted/20 px-4 py-4 sm:px-5">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            Monaco + Piston
          </p>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Code Runner Studio
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Updated editor shell with tighter panel sizing so the workspace fits cleanly inside the practice layout.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {supportedLanguages.length > 1 && onLanguageChange ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1.5 rounded-full px-4">
                  <span className="text-sm font-medium">
                    {LANGUAGE_INFO[language]?.label || language}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
            <div className="rounded-full border bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground">
              {LANGUAGE_INFO[language]?.label || language}
            </div>
          )}

          <div className="flex items-center gap-1 rounded-full border bg-muted/30 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeFontSize(-2)}
              disabled={fontSize <= 10}
              className="h-8 w-8 rounded-full p-0"
              title={`Decrease font size (${fontSize}px)`}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeFontSize(2)}
              disabled={fontSize >= 24}
              className="h-8 w-8 rounded-full p-0"
              title={`Increase font size (${fontSize}px)`}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={isRunning}
              className="h-10 rounded-full px-4"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRun}
              disabled={isRunning}
              className="h-10 rounded-full px-4"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-1.5" />
              )}
              Run
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onSubmit}
              disabled={isRunning}
              className="h-10 rounded-full bg-green-600 px-4 hover:bg-green-700"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1.5" />
              )}
              Submit
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 p-4 sm:p-5">
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/70 bg-background">
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
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground sm:px-5">
        <span>
          <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">Ctrl</kbd>
          {' + '}
          <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">Enter</kbd>
          {' Run'}
        </span>
        <span>
          <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">Ctrl</kbd>
          {' + '}
          <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">Shift</kbd>
          {' + '}
          <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">Enter</kbd>
          {' Submit'}
        </span>
      </div>
    </div>
  );
};

export default CodeEditor;
