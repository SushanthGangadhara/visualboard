import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Dataset {
  id: string;
  name: string;
  filename: string;
  file_path: string;
  columns: string[];
  row_count: number;
  created_at: string;
  updated_at: string;
}

export interface DataRow {
  id: string;
  dataset_id: string;
  row_data: Record<string, string>;
  row_number: number;
}

export function useDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDatasets((data || []).map(dataset => ({
        ...dataset,
        columns: Array.isArray(dataset.columns) 
          ? dataset.columns.filter((col): col is string => typeof col === 'string')
          : []
      })));
    } catch (error: any) {
      console.error('Error fetching datasets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load datasets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadCSV = async (file: File, datasetName: string) => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please log in to upload datasets');
      }

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('csv-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Process CSV through edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await supabase.functions.invoke('process-csv', {
        body: {
          datasetName,
          filePath
        }
      });

      if (response.error) throw response.error;

      toast({
        title: 'Success',
        description: 'CSV file uploaded and processed successfully',
      });

      // Refresh datasets list
      await fetchDatasets();
      
      return response.data.dataset;
    } catch (error: any) {
      console.error('Error uploading CSV:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload CSV file',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDatasetData = async (datasetId: string, limit = 100) => {
    try {
      const { data, error } = await supabase
        .from('data_rows')
        .select('*')
        .eq('dataset_id', datasetId)
        .order('row_number')
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching dataset data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dataset data',
        variant: 'destructive',
      });
      return [];
    }
  };

  const deleteDataset = async (datasetId: string) => {
    try {
      const { error } = await supabase
        .from('datasets')
        .delete()
        .eq('id', datasetId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Dataset deleted successfully',
      });

      await fetchDatasets();
    } catch (error: any) {
      console.error('Error deleting dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete dataset',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return {
    datasets,
    loading,
    uploadCSV,
    getDatasetData,
    deleteDataset,
    refreshDatasets: fetchDatasets,
  };
}