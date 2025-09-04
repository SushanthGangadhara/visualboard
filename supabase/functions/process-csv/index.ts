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

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Set auth for this request
    supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    const { datasetName, filePath } = await req.json();

    console.log('Processing CSV:', { datasetName, filePath });

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('csv-files')
      .download(filePath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw downloadError;
    }

    // Convert file to text
    const csvText = await fileData.text();
    console.log('CSV text length:', csvText.length);

    // Parse CSV
    const { headers, rows } = parseCSV(csvText);
    console.log('Parsed CSV:', { headerCount: headers.length, rowCount: rows.length });

    // Get user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user');
    }

    // Create dataset record
    const { data: dataset, error: datasetError } = await supabase
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
      const { error: rowsError } = await supabase
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
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred processing the CSV file'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});