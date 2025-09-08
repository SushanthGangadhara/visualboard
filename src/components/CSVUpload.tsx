import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';
import { useDatasets } from '@/hooks/useDatasets';
import { useToast } from '@/hooks/use-toast';

interface CSVUploadProps {
  onUploadSuccess?: (datasetId: string) => void;
}

export function CSVUpload({ onUploadSuccess }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadCSV, loading } = useDatasets();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log('Selected file:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type);
      
      // Check if it's a CSV file
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        if (!datasetName) {
          setDatasetName(selectedFile.name.replace('.csv', ''));
        }
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please select a CSV file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !datasetName.trim()) return;

    try {
      const dataset = await uploadCSV(file, datasetName);
      setFile(null);
      setDatasetName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess?.(dataset.id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      console.log('Dropped file:', droppedFile.name, 'Size:', droppedFile.size, 'Type:', droppedFile.type);
      
      // Check if it's a CSV file
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        if (!datasetName) {
          setDatasetName(droppedFile.name.replace('.csv', ''));
        }
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please drop a CSV file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Card className="gradient-card border-border/50 shadow-dashboard">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Upload className="h-5 w-5 text-primary" />
          Upload CSV Dataset
        </CardTitle>
        <CardDescription>
          Upload a CSV file to create a new dataset for visualization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dataset-name">Dataset Name</Label>
          <Input
            id="dataset-name"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            placeholder="Enter dataset name"
          />
        </div>

        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-accent/10 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {file ? (
            <div className="flex items-center justify-center gap-2 text-foreground">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-medium">{file.name}</span>
              <span className="text-sm text-muted-foreground">
                ({Math.round(file.size / 1024)}KB)
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                Drag and drop your CSV file here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Only .csv files are supported
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || !datasetName.trim() || loading}
          className="w-full"
        >
          {loading ? 'Uploading...' : 'Upload Dataset'}
        </Button>
      </CardContent>
    </Card>
  );
}