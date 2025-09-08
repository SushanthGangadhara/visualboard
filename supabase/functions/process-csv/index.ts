import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVRow {
  [key: string]: string;
}

function parseCSV(csvText: string): { headers: string[], rows: CSVRow[] } {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) throw new Error('Empty CSV file');

  // Handle CSV with proper parsing for quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length > 0 && values[0] !== '') { // Skip empty rows
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }

  return { headers, rows };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create client with service role for storage access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create client with anon key for user auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from auth header first
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { datasetName, filePath } = await req.json();

    console.log('Processing CSV:', { datasetName, filePath });

    // Download the file from storage using admin client
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('csv-files')
      .download(filePath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw downloadError;
    }

    if (!fileData || fileData.size === 0) {
      throw new Error('File is empty or could not be downloaded');
    }

    // Convert file to text
    const csvText = await fileData.text();
    console.log('CSV text length:', csvText.length);

    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV file appears to be empty');
    }

    // Parse CSV
    const { headers, rows } = parseCSV(csvText);
    console.log('Parsed CSV:', { headerCount: headers.length, rowCount: rows.length });

    // User is already validated above

    // Create dataset record using admin client for better permissions
    const { data: dataset, error: datasetError } = await supabaseAdmin
      .from('datasets')
      .insert({
        user_id: user.id,
        name: datasetName,
        filename: filePath.split('/').pop() || 'unknown.csv',
        file_path: filePath,
        columns: headers,
        row_count: rows.length
      })
      .select()
      .single();

    if (datasetError) {
      console.error('Dataset creation error:', datasetError);
      throw datasetError;
    }

    console.log('Created dataset:', dataset);

    // Insert data rows in batches
    const batchSize = 100;
    const dataRows = rows.map((row, index) => ({
      dataset_id: dataset.id,
      row_data: row,
      row_number: index + 1
    }));

    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      const { error: rowsError } = await supabaseAdmin
        .from('data_rows')
        .insert(batch);

      if (rowsError) {
        console.error('Rows insertion error:', rowsError);
        throw rowsError;
      }
    }

    console.log('Successfully inserted all data rows');

    return new Response(
      JSON.stringify({
        success: true,
        dataset: {
          id: dataset.id,
          name: dataset.name,
          columns: headers,
          rowCount: rows.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing CSV:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred processing the CSV file';
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});