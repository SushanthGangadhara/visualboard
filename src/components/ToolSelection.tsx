import { ToolCard } from "./ToolCard";
import { Upload, Database, BarChart } from "lucide-react";
import heroImage from "@/assets/dashboard-hero.jpg";

interface ToolSelectionProps {
  onToolSelect: (tool: string) => void;
}

export function ToolSelection({ onToolSelect }: ToolSelectionProps) {
  const tools = [
    {
      id: "tableau",
      title: "Tableau Style",
      description: "Advanced data visualization with drag-and-drop interface, perfect for complex analytics and interactive dashboards.",
      features: [
        "Interactive drag-and-drop builder",
        "Advanced chart types and calculations", 
        "Real-time collaboration tools",
        "Custom color palettes and themes"
      ],
      image: heroImage
    },
    {
      id: "powerbi",
      title: "Power BI Style", 
      description: "Business-focused reporting with seamless integration capabilities and automated insights for enterprise users.",
      features: [
        "Automated insights and AI features",
        "Enterprise integration options",
        "Custom report templates",
        "Advanced data modeling tools"
      ],
      image: heroImage
    },
    {
      id: "custom",
      title: "Custom Analytics",
      description: "Build your own unique analytics platform with customizable components and flexible visualization options.",
      features: [
        "Fully customizable interface",
        "Component-based architecture", 
        "Custom visualization library",
        "Flexible data source connections"
      ],
      image: heroImage
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Data Analytics
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Dashboard Builder
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Transform your data into powerful insights with our professional-grade dashboard tools. 
              Choose your preferred analytics style and start building beautiful visualizations.
            </p>
            <div className="flex items-center justify-center gap-6 text-blue-200">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                <span className="text-sm">Multiple Data Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                <span className="text-sm">Interactive Charts</span>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span className="text-sm">Easy Import</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Analytics Platform
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the dashboard style that best fits your workflow and analytical needs. 
            Each option provides unique features and visualization capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              title={tool.title}
              description={tool.description}
              features={tool.features}
              image={tool.image}
              onSelect={() => onToolSelect(tool.id)}
              variant={tool.id as "tableau" | "powerbi" | "custom"}
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-card rounded-lg shadow-dashboard">
            <div className="text-2xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">Chart Types</div>
          </div>
          <div className="text-center p-6 bg-card rounded-lg shadow-dashboard">
            <div className="text-2xl font-bold text-chart-2">50+</div>
            <div className="text-sm text-muted-foreground">Data Sources</div>
          </div>
          <div className="text-center p-6 bg-card rounded-lg shadow-dashboard">
            <div className="text-2xl font-bold text-accent">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center p-6 bg-card rounded-lg shadow-dashboard">
            <div className="text-2xl font-bold text-chart-4">24/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}