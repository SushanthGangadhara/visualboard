import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Upload, 
  Database, 
  Settings,
  Download,
  Share2,
  Plus
} from "lucide-react";

interface DashboardBuilderProps {
  selectedTool: string;
  onBack: () => void;
}

export function DashboardBuilder({ selectedTool, onBack }: DashboardBuilderProps) {
  const [activeTab, setActiveTab] = useState("data");

  const getToolConfig = () => {
    switch (selectedTool) {
      case "tableau":
        return {
          name: "Tableau Style",
          color: "chart-1",
          gradient: "from-blue-600 to-blue-800"
        };
      case "powerbi":
        return {
          name: "Power BI Style", 
          color: "warning",
          gradient: "from-yellow-600 to-orange-600"
        };
      case "custom":
        return {
          name: "Custom Analytics",
          color: "chart-2",
          gradient: "from-teal-600 to-teal-800"
        };
      default:
        return {
          name: "Dashboard Builder",
          color: "primary",
          gradient: "from-blue-600 to-blue-800"
        };
    }
  };

  const toolConfig = getToolConfig();

  const sampleCharts = [
    { id: 1, name: "Revenue Trends", type: "line", data: "Monthly revenue data" },
    { id: 2, name: "Market Share", type: "pie", data: "Product category breakdown" },
    { id: 3, name: "Performance Metrics", type: "bar", data: "KPI dashboard" },
    { id: 4, name: "Geographic Sales", type: "map", data: "Sales by region" }
  ];

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      {/* Header */}
      <div className={`bg-gradient-to-r ${toolConfig.gradient} shadow-dashboard`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
                ← Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">{toolConfig.name}</h1>
                <p className="text-blue-100">Dashboard Builder</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="data">Data Sources</TabsTrigger>
            <TabsTrigger value="builder">Dashboard Builder</TabsTrigger>
            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Connect Your Data</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col space-y-2">
                  <Upload className="w-8 h-8" />
                  <span>Upload CSV</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col space-y-2">
                  <Database className="w-8 h-8" />
                  <span>Connect Database</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col space-y-2">
                  <Settings className="w-8 h-8" />
                  <span>API Connection</span>
                </Button>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Sample Datasets</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Sales Performance</div>
                        <div className="text-sm text-muted-foreground">1.2M records • Updated daily</div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </Card>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Customer Analytics</div>
                        <div className="text-sm text-muted-foreground">850K records • Updated hourly</div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Chart Components</h4>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Bar Chart
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <LineChart className="w-4 h-4 mr-2" />
                      Line Chart
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <PieChart className="w-4 h-4 mr-2" />
                      Pie Chart
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Canvas */}
              <div className="lg:col-span-3">
                <Card className="p-6 min-h-[600px] bg-gradient-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Dashboard Canvas</h3>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Widget
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 h-full">
                    {sampleCharts.map((chart) => (
                      <Card key={chart.id} className="p-4 border-dashed border-2 hover:border-primary transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{chart.name}</h4>
                          <Badge variant="outline">{chart.type}</Badge>
                        </div>
                        <div className="h-32 bg-muted rounded flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-sm">{chart.data}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleCharts.map((chart) => (
                <Card key={chart.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{chart.name}</h4>
                    <Badge>{chart.type}</Badge>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Interactive {chart.type} visualization</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                    <Button variant="outline" size="sm" className="flex-1">Clone</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Dashboard Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Theme & Appearance</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary">
                      <div className="h-12 bg-gradient-primary rounded mb-2" />
                      <div className="text-sm font-medium">Professional Blue</div>
                    </Card>
                    <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary">
                      <div className="h-12 bg-gradient-to-r from-green-500 to-green-700 rounded mb-2" />
                      <div className="text-sm font-medium">Success Green</div>
                    </Card>
                    <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary">
                      <div className="h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded mb-2" />
                      <div className="text-sm font-medium">Enterprise Purple</div>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Export Options</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button variant="outline">Export as PDF</Button>
                    <Button variant="outline">Export as PNG</Button>
                    <Button variant="outline">Export Data (CSV)</Button>
                    <Button variant="outline">Schedule Reports</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}