import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Database, LogOut } from "lucide-react";
import { ToolCard } from "./ToolCard";
import { CSVUpload } from "@/components/CSVUpload";
import { DatasetList } from "@/components/DatasetList";
import { useAuth } from "@/hooks/useAuth";
import { useDatasets, Dataset } from "@/hooks/useDatasets";
import { useToast } from "@/components/ui/use-toast";
import heroImage from "@/assets/dashboard-hero.jpg";

interface ToolSelectionProps {
  onToolSelect: (tool: string, dataset?: Dataset) => void;
}

export function ToolSelection({ onToolSelect }: ToolSelectionProps) {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToolSelect = (toolId: string) => {
    if (!selectedDataset) {
      toast({
        title: 'Select a dataset',
        description: 'Please select a dataset first before choosing a visualization style.',
        variant: 'destructive',
      });
      return;
    }
    onToolSelect(toolId, selectedDataset);
  };

  const handleUploadSuccess = (datasetId: string) => {
    // The dataset list will automatically refresh
  };

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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">VisualBoard</h1>
                <p className="text-sm text-muted-foreground">Transform your data into insights</p>
              </div>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="data" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="data" className="text-sm">
              Data Management
            </TabsTrigger>
            <TabsTrigger value="visualize" className="text-sm">
              Create Visualization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CSVUpload onUploadSuccess={handleUploadSuccess} />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Datasets</h3>
                <DatasetList 
                  onSelectDataset={setSelectedDataset}
                  selectedDatasetId={selectedDataset?.id}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualize" className="space-y-6">
            {selectedDataset ? (
              <div className="space-y-6">
                <div className="bg-card/50 rounded-lg p-4 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Selected Dataset: {selectedDataset.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{selectedDataset.row_count.toLocaleString()} rows</span>
                    <span>{selectedDataset.columns.length} columns</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Choose Visualization Style
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        title={tool.title}
                        description={tool.description}
                        features={tool.features}
                        image={tool.image}
                        variant={tool.id as any}
                        onSelect={() => handleToolSelect(tool.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Select a Dataset First
                </h3>
                <p className="text-muted-foreground mb-6">
                  Go to Data Management tab to upload or select a dataset before creating visualizations
                </p>
                <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="data"]')?.click()}>
                  Go to Data Management
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}