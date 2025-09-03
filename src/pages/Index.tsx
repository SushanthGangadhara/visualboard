import { useState } from "react";
import { ToolSelection } from "@/components/ToolSelection";
import { DashboardBuilder } from "@/components/DashboardBuilder";

const Index = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  const handleBack = () => {
    setSelectedTool(null);
  };

  if (selectedTool) {
    return <DashboardBuilder selectedTool={selectedTool} onBack={handleBack} />;
  }

  return <ToolSelection onToolSelect={handleToolSelect} />;
};

export default Index;