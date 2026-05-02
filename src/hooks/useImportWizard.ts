import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export type Step = 'upload' | 'mapping' | 'preview' | 'importing';

export const REQUIRED_FIELDS = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'student_id', label: 'Student ID' },
  { key: 'division', label: 'Division' },
  { key: 'contact', label: 'Contact/Email' },
  { key: 'batch', label: 'Batch/Year' },
];

export function useImportWizard(onImportComplete: () => void) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const reset = () => {
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setMapping({});
    setIsProcessing(false);
    setImportResult(null);
  };

  const processFile = (file: File) => {
    setFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setRawData(results.data);
            setHeaders(Object.keys(results.data[0] || {}));
            setStep('mapping');
            setIsProcessing(false);
          },
          error: (error) => {
            toast.error('Failed to parse CSV: ' + error.message);
            setIsProcessing(false);
          }
        });
      } else if (['xlsx', 'xls'].includes(extension || '')) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        if (json.length > 0) {
          setRawData(json);
          setHeaders(Object.keys(json[0] as object));
          setStep('mapping');
        } else {
          toast.error('File is empty');
        }
        setIsProcessing(false);
      } else {
        toast.error('Unsupported format');
        setIsProcessing(false);
      }
    };

    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsBinaryString(file);
  };

  const handleMappingChange = (fieldKey: string, headerValue: string) => {
    setMapping(prev => ({ ...prev, [fieldKey]: headerValue }));
  };

  const isMappingComplete = () => REQUIRED_FIELDS.every(f => mapping[f.key]);

  const getMappedData = () => {
    return rawData.map(row => {
      const mappedRow: any = {};
      REQUIRED_FIELDS.forEach(f => {
        mappedRow[f.key] = row[mapping[f.key]];
      });
      return mappedRow;
    });
  };

  const startImport = async () => {
    setStep('importing');
    setIsProcessing(true);
    
    const mappedData = getMappedData();
    let success = 0;
    let failed = 0;

    for (const item of mappedData) {
      try {
        const { error } = await supabase.from('profiles').insert({
          id: crypto.randomUUID(),
          full_name: item.full_name,
          student_id: item.student_id?.toString(),
          division: item.division,
          contact: item.contact,
          batch: item.batch?.toString(),
          role: 'member',
          status: 'active'
        });

        if (error) throw error;
        success++;
      } catch (err) {
        failed++;
      }
    }

    setImportResult({ success, failed });
    setIsProcessing(false);
    onImportComplete();
  };

  return {
    step, setStep, file, rawData, headers, mapping, isProcessing, importResult,
    reset, processFile, handleMappingChange, isMappingComplete, getMappedData, startImport
  };
}
