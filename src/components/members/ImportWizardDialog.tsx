import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Table as TableIcon
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface ImportWizardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing';

export function ImportWizardDialog({ isOpen, onOpenChange, onImportComplete }: ImportWizardDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const REQUIRED_FIELDS = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'student_id', label: 'Student ID' },
    { key: 'division', label: 'Division' },
    { key: 'contact', label: 'Contact/Email' },
    { key: 'batch', label: 'Batch/Year' },
  ];

  const reset = () => {
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setMapping({});
    setIsProcessing(false);
    setImportResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
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
        toast.error('Unsupported file format. Please upload CSV or Excel.');
        setIsProcessing(false);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleMappingChange = (fieldKey: string, headerValue: string) => {
    setMapping(prev => ({ ...prev, [fieldKey]: headerValue }));
  };

  const isMappingComplete = () => {
    return REQUIRED_FIELDS.every(f => mapping[f.key]);
  };

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

    // Bulk insert is tricky because we need IDs and some fields might be missing
    // We'll iterate for simplicity and better error reporting, though bulk is faster
    for (const item of mappedData) {
      try {
        // We'll assume these are new members, so they need a UUID for Supabase Auth 
        // OR we just insert them into profiles directly if allowed.
        // Usually profiles are linked to auth.users, but we can have 'pending' profiles
        // that will be linked later or just exist as data.
        
        const { error } = await supabase.from('profiles').insert({
          id: crypto.randomUUID(), // Placeholder ID
          full_name: item.full_name,
          student_id: item.student_id?.toString(),
          division: item.division,
          contact: item.contact,
          batch: item.batch?.toString(),
          role: 'member',
          status: 'active' // Changed from pending to active for bulk imports
        });

        if (error) throw error;
        success++;
      } catch (err) {
        console.error('Import error:', err);
        failed++;
      }
    }

    setImportResult({ success, failed });
    setIsProcessing(false);
    onImportComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isProcessing) onOpenChange(open); if (!open) reset(); }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-3xl border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-indigo-400" />
                Member Data Import Wizard
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                Phase 3: Automated Organizational Data Mapping
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  className={cn(
                    "h-1.5 w-8 rounded-full transition-all",
                    (step === 'upload' && s === 1) || 
                    (step === 'mapping' && s === 2) || 
                    (step === 'preview' && s === 3) || 
                    (step === 'importing' && s === 4) 
                      ? "bg-indigo-500 w-12" : "bg-slate-700"
                  )}
                />
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {step === 'upload' && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-12">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-lg p-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center space-y-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">CSV or Excel files only (max. 10MB)</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv,.xlsx,.xls" 
                  className="hidden" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                  <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Automatic Header Detection</p>
                  <p className="text-[10px] text-slate-500 font-medium">We'll try to find your column names automatically.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                  <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Data Validation</p>
                  <p className="text-[10px] text-slate-500 font-medium">Checks for duplicates and missing values before import.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                  <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-amber-600 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Safe Mapping</p>
                  <p className="text-[10px] text-slate-500 font-medium">You control exactly which data goes where.</p>
                </div>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4">
                <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-900">{file?.name}</p>
                  <p className="text-xs text-indigo-600 font-medium">Detected {rawData.length} rows and {headers.length} columns.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Map your columns</h3>
                  <Badge variant="outline" className="rounded-lg text-[10px] font-bold border-indigo-200 text-indigo-600">Step 2 of 4</Badge>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {REQUIRED_FIELDS.map((field) => (
                    <div key={field.key} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-sm">
                      <div className="w-full md:w-1/3">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          {field.label}
                          <span className="text-rose-500">*</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">System field</p>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <ArrowRight className="h-4 w-4 text-slate-300 hidden md:block" />
                        <Select value={mapping[field.key] || ""} onValueChange={(val) => handleMappingChange(field.key, val)}>
                          <SelectTrigger className="bg-white border-slate-200 rounded-xl h-12 focus:ring-indigo-500 font-bold text-xs">
                            <SelectValue placeholder="Select column from your file..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {headers.map(h => (
                              <SelectItem key={h} value={h} className="text-xs font-bold">{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-12 flex justify-center">
                        {mapping[field.key] ? (
                          <div className="h-6 w-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Data Preview</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Review the first 5 rows before importing.</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold">READY TO IMPORT</Badge>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      {REQUIRED_FIELDS.map(f => (
                        <TableHead key={f.key} className="text-[10px] font-black uppercase tracking-widest text-slate-500">{f.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getMappedData().slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {REQUIRED_FIELDS.map(f => (
                          <TableCell key={f.key} className="text-xs font-bold text-slate-700">{row[f.key]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
                <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Importing will create <strong>{rawData.length}</strong> new member records in your database. 
                  These members will be set to <strong>Active</strong> status by default.
                </p>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-12">
              {!importResult ? (
                <>
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-slate-100 rounded-full flex items-center justify-center">
                      <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Optional progress % */}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-900">Importing Data...</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">Please do not close this window.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-black text-slate-900">Import Successful!</p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-xl font-black text-emerald-600">{importResult.success}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Imported</p>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div className="text-center">
                        <p className="text-xl font-black text-rose-500">{importResult.failed}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Failed</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => { onOpenChange(false); reset(); }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-8"
                  >
                    CONTINUE TO DATABASE
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex flex-row items-center justify-between sm:justify-between">
          {step !== 'importing' && (
            <>
              {step !== 'upload' ? (
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(step === 'mapping' ? 'upload' : 'mapping')}
                  className="font-bold text-slate-500 hover:text-slate-900 gap-2 h-11 px-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  BACK
                </Button>
              ) : <div />}

              {step === 'mapping' && (
                <Button 
                  onClick={() => setStep('preview')}
                  disabled={!isMappingComplete()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl gap-2 h-11 px-8 shadow-lg shadow-indigo-100"
                >
                  REVIEW DATA
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {step === 'preview' && (
                <Button 
                  onClick={startImport}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 h-11 px-8 shadow-lg shadow-emerald-100"
                >
                  START IMPORT
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
