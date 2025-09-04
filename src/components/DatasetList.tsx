import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Trash2, Calendar } from 'lucide-react';
import { useDatasets, Dataset } from '@/hooks/useDatasets';

interface DatasetListProps {
  onSelectDataset?: (dataset: Dataset) => void;
  selectedDatasetId?: string;
}

export function DatasetList({ onSelectDataset, selectedDatasetId }: DatasetListProps) {
  const { datasets, loading, deleteDataset } = useDatasets();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="gradient-card border-border/50 shadow-dashboard">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <Card className="gradient-card border-border/50 shadow-dashboard">
        <CardContent className="p-8 text-center">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No datasets yet</h3>
          <p className="text-muted-foreground">
            Upload your first CSV file to get started with data visualization
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {datasets.map((dataset) => (
        <Card 
          key={dataset.id}
          className={`gradient-card border-border/50 shadow-dashboard cursor-pointer transition-all hover:shadow-dashboard-xl ${
            selectedDatasetId === dataset.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelectDataset?.(dataset)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  {dataset.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {formatDate(dataset.created_at)}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteDataset(dataset.id);
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {dataset.row_count.toLocaleString()} rows
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {dataset.columns.length} columns
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Filename: {dataset.filename}
                </p>
              </div>
            </div>
            
            {dataset.columns.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Columns:</p>
                <div className="flex flex-wrap gap-1">
                  {dataset.columns.slice(0, 5).map((column) => (
                    <Badge key={column} variant="outline" className="text-xs">
                      {column}
                    </Badge>
                  ))}
                  {dataset.columns.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{dataset.columns.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}