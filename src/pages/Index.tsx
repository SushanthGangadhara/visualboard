import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { ToolSelection } from "@/components/ToolSelection";
import { DashboardBuilder } from "@/components/DashboardBuilder";
import { useAuth } from "@/hooks/useAuth";
import { Dataset } from "@/hooks/useDatasets";

const Index = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const { user, loading } = useAuth();

  // Redirect to auth if not logged in
  if (loading) {
    return <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center">
      <div className="text-foreground">Loading...</div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleToolSelect = (tool: string, dataset?: Dataset) => {
    setSelectedTool(tool);
    if (dataset) {
      setSelectedDataset(dataset);
    }
  };

  const handleBack = () => {
    setSelectedTool(null);
    setSelectedDataset(null);
  };

  if (selectedTool && selectedDataset) {
    return <DashboardBuilder selectedTool={selectedTool} dataset={selectedDataset} onBack={handleBack} />;
  }

  return <ToolSelection onToolSelect={handleToolSelect} />;
};

export default Index;