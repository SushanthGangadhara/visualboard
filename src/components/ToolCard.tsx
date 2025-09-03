import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Database, TrendingUp } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  features: string[];
  image: string;
  onSelect: () => void;
  variant: "tableau" | "powerbi" | "custom";
}

export function ToolCard({ title, description, features, image, onSelect, variant }: ToolCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "tableau":
        return "border-chart-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900";
      case "powerbi":
        return "border-warning bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950 dark:to-orange-900";
      case "custom":
        return "border-chart-2 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900";
      default:
        return "border-border";
    }
  };

  return (
    <Card className={`p-6 transition-all duration-300 hover:shadow-dashboard-xl group cursor-pointer ${getVariantStyles()}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-lg bg-white/80 dark:bg-black/20">
            {variant === "tableau" && <BarChart3 className="w-8 h-8 text-chart-1" />}
            {variant === "powerbi" && <Database className="w-8 h-8 text-warning" />}
            {variant === "custom" && <TrendingUp className="w-8 h-8 text-chart-2" />}
          </div>
          <Badge variant="secondary" className="text-xs font-medium">
            Popular
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Key Features:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button 
          onClick={onSelect}
          className="w-full group-hover:scale-105 transition-all duration-200"
          size="sm"
        >
          Choose {title}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}