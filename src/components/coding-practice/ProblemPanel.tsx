import React, { useState } from 'react';
import { Problem, Difficulty } from '@/types/codingPractice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  ChevronDown, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ProblemPanelProps {
  problem: Problem | null;
  viewedHints: number[];
  onViewHint: (hintId: number) => void;
}

const getDifficultyColor = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'Medium':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'Hard':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

export const ProblemPanel: React.FC<ProblemPanelProps> = ({
  problem,
  viewedHints,
  onViewHint,
}) => {
  const [expandedHints, setExpandedHints] = useState<number[]>([]);

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Problem Selected
        </h3>
        <p className="text-muted-foreground">
          Select a problem from the list to start coding!
        </p>
      </div>
    );
  }

  const toggleHint = (hintId: number) => {
    if (expandedHints.includes(hintId)) {
      setExpandedHints(prev => prev.filter(id => id !== hintId));
    } else {
      setExpandedHints(prev => [...prev, hintId]);
      if (!viewedHints.includes(hintId)) {
        onViewHint(hintId);
      }
    }
  };

  return (
    <div className="h-full overflow-auto p-4">
      {/* Problem Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold text-foreground">{problem.title}</h1>
          <Badge className={getDifficultyColor(problem.difficulty)}>
            {problem.difficulty}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {problem.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="hints">
            Hints ({viewedHints.length}/{problem.hints.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4 space-y-4">
          {/* Problem Description */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-foreground/90">
              {problem.description}
            </p>
          </div>

          {/* Examples */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {problem.examples.map((example, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Example {index + 1}:
                  </p>
                  <div className="bg-muted/50 rounded-md p-3 font-mono text-sm">
                    <p>
                      <span className="text-blue-500">Input:</span>{' '}
                      {example.input}
                    </p>
                    <p>
                      <span className="text-green-500">Output:</span>{' '}
                      {example.output}
                    </p>
                    {example.explanation && (
                      <p className="mt-2 text-muted-foreground">
                        <span className="text-yellow-500">Explanation:</span>{' '}
                        {example.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Constraints */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Constraints</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {problem.constraints.map((constraint, index) => (
                  <li 
                    key={index} 
                    className="text-sm text-muted-foreground font-mono flex items-start gap-2"
                  >
                    <span className="text-primary">•</span>
                    <code>{constraint}</code>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hints" className="mt-4 space-y-3">
          {problem.hints.map((hint) => {
            const isViewed = viewedHints.includes(hint.id);
            const isExpanded = expandedHints.includes(hint.id);

            return (
              <Collapsible
                key={hint.id}
                open={isExpanded}
                onOpenChange={() => toggleHint(hint.id)}
              >
                <Card className={isViewed ? 'border-primary/30' : ''}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className={`w-4 h-4 ${isViewed ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                          <span className="font-medium text-sm">
                            Hint {hint.id}
                          </span>
                          {!isViewed && (
                            <Badge variant="outline" className="text-xs">
                              -{hint.xpCost} XP
                            </Badge>
                          )}
                          {isViewed && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-3">
                      <p className="text-sm text-foreground/90">{hint.text}</p>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}

          {viewedHints.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span>
                Hints used: {viewedHints.length} (-
                {problem.hints
                  .filter(h => viewedHints.includes(h.id))
                  .reduce((sum, h) => sum + h.xpCost, 0)} XP)
              </span>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProblemPanel;
