import React, { useRef } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  RotateCcw, 
  Send, 
  Settings,
  Loader2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  isRunning: boolean;
  language?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRun,
  onSubmit,
  onReset,
  isRunning,
  language = 'javascript',
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
      <div className="flex items-center justify-between p-2 border-b bg-background/95">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            JavaScript
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => changeFontSize(2)}>
                Increase Font Size
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeFontSize(-2)}>
                Decrease Font Size
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-muted-foreground">
                Font Size: {fontSize}px
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
