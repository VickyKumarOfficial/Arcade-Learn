import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CareerOption } from "@/types";
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  ExternalLink, 
  Star,
  Users,
  Briefcase
} from "lucide-react";

interface CareerCardProps {
  career: CareerOption;
  matchingTags?: string[];
  similarity?: number;
}

export const CareerCard = ({ career, matchingTags = [], similarity }: CareerCardProps) => {
  const handleLearnMore = () => {
    // For now, we can scroll to careers section or navigate to careers page
    // In the future, this could open a detailed career modal
    console.log(`Learn more about ${career.title}`);
  };

  const getSalaryRange = (salaryString: string) => {
    // Extract the salary range for display
    return salaryString;
  };

  return (
    <Card className="h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {career.title}
              </CardTitle>
              {similarity && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {(similarity * 100).toFixed(0)}% match
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-semibold">{getSalaryRange(career.averageSalary)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {career.description}
        </p>

        {/* Matching Tags - Show which tags matched */}
        {matchingTags.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
              Skills You'll Learn
            </h4>
            <div className="flex flex-wrap gap-1">
              {matchingTags.map((tag, index) => (
                <Badge 
                  key={index} 
                  className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Required Skills */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
            Required Skills
          </h4>
          <div className="flex flex-wrap gap-1">
            {career.requiredSkills.slice(0, 4).map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {skill}
              </Badge>
            ))}
            {career.requiredSkills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{career.requiredSkills.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Top Companies */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
            Top Companies
          </h4>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {career.companies.slice(0, 3).join(', ')}
              {career.companies.length > 3 && ` +${career.companies.length - 3} more`}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            onClick={handleLearnMore}
            variant="outline"
            className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 dark:group-hover:bg-blue-900/20 dark:group-hover:border-blue-600 transition-all"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerCard;