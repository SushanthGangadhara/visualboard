import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  ArrowLeft,
  Download,
  Share2,
  Plus,
  TrendingUp
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useDatasets, Dataset, DataRow } from "@/hooks/useDatasets";
import { useToast } from "@/components/ui/use-toast";

interface DashboardBuilderProps {
  selectedTool: string;
  dataset: Dataset;
  onBack: () => void;
}

export function DashboardBuilder({ selectedTool, dataset, onBack }: DashboardBuilderProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { getDatasetData } = useDatasets();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const rows = await getDatasetData(dataset.id);
        setDataRows(rows.map(row => ({
          ...row,
          row_data: typeof row.row_data === 'object' && row.row_data !== null 
            ? row.row_data as Record<string, string>
            : {}
        })));
      } catch (error) {
        console.error('Error loading dataset data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dataset.id, getDatasetData]);

  const getToolConfig = () => {
    switch (selectedTool) {
      case "tableau":
        return {
          name: "Tableau Style",
          color: "hsl(217, 91%, 60%)",
          gradient: "from-blue-600 to-blue-800"
        };
      case "powerbi":
        return {
          name: "Power BI Style", 
          color: "hsl(45, 93%, 47%)",
          gradient: "from-yellow-600 to-orange-600"
        };
      case "custom":
        return {
          name: "Custom Analytics",
          color: "hsl(186, 100%, 42%)",
          gradient: "from-teal-600 to-teal-800"
        };
      default:
        return {
          name: "Dashboard Builder",
          color: "hsl(217, 91%, 60%)",
          gradient: "from-blue-600 to-blue-800"
        };
    }
  };

  const toolConfig = getToolConfig();

  // Prepare chart data from real dataset
  const prepareChartData = () => {
    if (dataRows.length === 0 || dataset.columns.length === 0) {
      return { barData: [], lineData: [], pieData: [] };
    }

    // Get numeric columns for visualization
    const numericColumns = dataset.columns.filter(col => {
      const sampleValue = dataRows[0]?.row_data?.[col];
      return sampleValue && !isNaN(Number(sampleValue));
    });

    const categoryColumns = dataset.columns.filter(col => {
      const sampleValue = dataRows[0]?.row_data?.[col];
      return sampleValue && isNaN(Number(sampleValue));
    });

    // Bar chart data - aggregate by first category column
    const barData = categoryColumns.length > 0 && numericColumns.length > 0 
      ? Object.entries(
          dataRows.reduce((acc, row) => {
            const category = row.row_data[categoryColumns[0]] || 'Unknown';
            const value = Number(row.row_data[numericColumns[0]]) || 0;
            acc[category] = (acc[category] || 0) + value;
            return acc;
          }, {} as Record<string, number>)
        )
        .slice(0, 10) // Limit to 10 categories
        .map(([name, value]) => ({ name, value }))
      : [];

    // Line chart data - use first 20 rows
    const lineData = numericColumns.length >= 2 
      ? dataRows.slice(0, 20).map((row, index) => ({
          x: index + 1,
          y: Number(row.row_data[numericColumns[0]]) || 0,
          z: Number(row.row_data[numericColumns[1]]) || 0
        }))
      : [];

    // Pie chart data - same as bar but limited to 5
    const pieData = barData.slice(0, 5);

    return { barData, lineData, pieData };
  };

  const { barData, lineData, pieData } = prepareChartData();

  const COLORS = ['hsl(217, 91%, 60%)', 'hsl(186, 100%, 42%)', 'hsl(25, 95%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      {/* Header */}
      <header className={`bg-gradient-to-r ${toolConfig.gradient} shadow-dashboard`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-white hover:bg-white/20 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">{toolConfig.name}</h1>
                <p className="text-white/80">Dataset: {dataset.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="data">Data Explorer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Dataset Overview */}
            <Card className="gradient-card border-border/50 shadow-dashboard">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Dataset Overview
                </CardTitle>
                <CardDescription>
                  {dataset.name} - {dataset.row_count.toLocaleString()} rows, {dataset.columns.length} columns
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              {barData.length > 0 && (
                <Card className="gradient-card border-border/50 shadow-dashboard">
                  <CardHeader>
                    <CardTitle className="text-foreground">Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                        <YAxis stroke="hsl(var(--foreground))" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar dataKey="value" fill={toolConfig.color} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Line Chart */}
              {lineData.length > 0 && (
                <Card className="gradient-card border-border/50 shadow-dashboard">
                  <CardHeader>
                    <CardTitle className="text-foreground">Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="x" stroke="hsl(var(--foreground))" />
                        <YAxis stroke="hsl(var(--foreground))" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Line type="monotone" dataKey="y" stroke={toolConfig.color} strokeWidth={2} />
                        <Line type="monotone" dataKey="z" stroke="hsl(186, 100%, 42%)" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Pie Chart */}
              {pieData.length > 0 && (
                <Card className="gradient-card border-border/50 shadow-dashboard lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-foreground">Composition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={(entry) => entry.name}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Data Summary */}
              <Card className="gradient-card border-border/50 shadow-dashboard">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{dataset.row_count.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Records</div>
                    </div>
                    <div className="text-center p-4 bg-accent/10 rounded-lg">
                      <div className="text-2xl font-bold text-accent">{dataset.columns.length}</div>
                      <div className="text-sm text-muted-foreground">Columns</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Available Columns:</h4>
                    <div className="flex flex-wrap gap-1">
                      {dataset.columns.slice(0, 8).map(column => (
                        <Badge key={column} variant="outline" className="text-xs">
                          {column}
                        </Badge>
                      ))}
                      {dataset.columns.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{dataset.columns.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="gradient-card border-border/50 shadow-dashboard">
              <CardHeader>
                <CardTitle className="text-foreground">Raw Data Explorer</CardTitle>
                <CardDescription>
                  Showing first 100 rows of {dataset.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {dataset.columns.map(column => (
                          <th key={column} className="text-left p-2 font-medium text-foreground">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataRows.slice(0, 20).map((row, index) => (
                        <tr key={row.id} className="border-b border-border/50 hover:bg-accent/5">
                          {dataset.columns.map(column => (
                            <td key={column} className="p-2 text-muted-foreground">
                              {row.row_data[column] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dataRows.length > 20 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Showing 20 of {dataRows.length} rows
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="gradient-card border-border/50 shadow-dashboard">
              <CardHeader>
                <CardTitle className="text-foreground">Dashboard Settings</CardTitle>
                <CardDescription>Customize your dashboard appearance and export options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3 text-foreground">Export Options</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">Export as PDF</Button>
                    <Button variant="outline">Export as PNG</Button>
                    <Button variant="outline">Export Data (CSV)</Button>
                    <Button variant="outline">Schedule Reports</Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 text-foreground">Dataset Info</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {dataset.name}</p>
                    <p><span className="font-medium">File:</span> {dataset.filename}</p>
                    <p><span className="font-medium">Uploaded:</span> {new Date(dataset.created_at).toLocaleDateString()}</p>
                    <p><span className="font-medium">Rows:</span> {dataset.row_count.toLocaleString()}</p>
                    <p><span className="font-medium">Columns:</span> {dataset.columns.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}