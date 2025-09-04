-- Create storage bucket for CSV files
INSERT INTO storage.buckets (id, name, public) VALUES ('csv-files', 'csv-files', false);

-- Create datasets table to store metadata about uploaded datasets
CREATE TABLE public.datasets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    columns JSONB NOT NULL DEFAULT '[]',
    row_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data_rows table to store the actual CSV data
CREATE TABLE public.data_rows (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
    row_data JSONB NOT NULL,
    row_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboards table to store dashboard configurations
CREATE TABLE public.dashboards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tool_type TEXT NOT NULL DEFAULT 'tableau',
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE SET NULL,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for datasets
CREATE POLICY "Users can view their own datasets" 
ON public.datasets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own datasets" 
ON public.datasets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets" 
ON public.datasets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets" 
ON public.datasets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for data_rows
CREATE POLICY "Users can view data from their datasets" 
ON public.data_rows 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.datasets 
    WHERE datasets.id = data_rows.dataset_id 
    AND datasets.user_id = auth.uid()
));

CREATE POLICY "Users can insert data to their datasets" 
ON public.data_rows 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.datasets 
    WHERE datasets.id = data_rows.dataset_id 
    AND datasets.user_id = auth.uid()
));

CREATE POLICY "Users can delete data from their datasets" 
ON public.data_rows 
FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.datasets 
    WHERE datasets.id = data_rows.dataset_id 
    AND datasets.user_id = auth.uid()
));

-- Create RLS policies for dashboards
CREATE POLICY "Users can view their own dashboards" 
ON public.dashboards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboards" 
ON public.dashboards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards" 
ON public.dashboards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards" 
ON public.dashboards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage policies for CSV files
CREATE POLICY "Users can view their own CSV files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'csv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own CSV files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'csv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own CSV files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'csv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX idx_datasets_user_id ON public.datasets(user_id);
CREATE INDEX idx_data_rows_dataset_id ON public.data_rows(dataset_id);
CREATE INDEX idx_data_rows_row_number ON public.data_rows(dataset_id, row_number);
CREATE INDEX idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX idx_dashboards_dataset_id ON public.dashboards(dataset_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_datasets_updated_at
    BEFORE UPDATE ON public.datasets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at
    BEFORE UPDATE ON public.dashboards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();