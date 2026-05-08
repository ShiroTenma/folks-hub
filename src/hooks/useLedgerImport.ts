import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export type Step = 'upload' | 'mapping' | 'preview' | 'importing';

export const LEDGER_FIELDS = [
  { key: 'date', label: 'Date' },
  { key: 'item_name', label: 'Item/Description' },
  { key: 'type', label: 'Type (income/expense)' },
  { key: 'amount', label: 'Amount' },
  { key: 'event_type', label: 'Event Type' },
  { key: 'division_target', label: 'Division Target' },
  { key: 'from_entity', label: 'From Entity' },
  { key: 'to_entity', label: 'To Entity' },
  { key: 'payment_type', label: 'Payment Type' },
];

export function useLedgerImport(onImportComplete: () => void) {
  const { user, profile } = useAuthStore();
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

  const isMappingComplete = () => ['date', 'item_name', 'type', 'amount'].every(f => mapping[f]);

  const getMappedData = () => {
    return rawData.map(row => {
      const mappedRow: any = {};
      LEDGER_FIELDS.forEach(f => {
        const val = row[mapping[f.key]];
        if (f.key === 'amount') mappedRow[f.key] = Number(val?.toString().replace(/[^0-9.-]+/g, "")) || 0;
        else if (f.key === 'date') mappedRow[f.key] = val ? new Date(val).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        else mappedRow[f.key] = val || '';
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
    const autoApprove = (profile?.access_level === 'super_admin' || profile?.access_level === 'admin' || profile?.role === 'super_admin' || profile?.role === 'admin') || profile?.division === 'BPH';

    for (const item of mappedData) {
      try {
        const debt_amount = item.type?.toLowerCase() === 'expense' ? item.amount : 0;
        const credit_amount = item.type?.toLowerCase() === 'income' ? item.amount : 0;

        const { error } = await supabase.from('transactions').insert({
          ...item,
          description: item.item_name,
          category: item.division_target,
          status: autoApprove ? 'approved' : 'pending',
          approved_by: autoApprove ? user?.id : null,
          debt_amount,
          credit_amount,
          created_at: new Date().toISOString()
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
    reset, processFile, setMapping, isMappingComplete, getMappedData, startImport
  };
}
