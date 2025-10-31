import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowLeftRight } from "lucide-react";

interface ResumePDFViewerProps {
  fileUrl: string;
}

export const ResumePDFViewer = ({ fileUrl }: ResumePDFViewerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-600" />
            Original Resume
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="gap-2"
          >
            {isVisible ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide PDF
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show PDF
              </>
            )}
          </Button>
        </div>
        
        {isVisible && (
          <div className="w-full aspect-[8.5/11] bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
            <iframe
              src={`${fileUrl}#navpanes=0&toolbar=0`}
              className="w-full h-full border-0"
              title="Resume PDF Preview"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
