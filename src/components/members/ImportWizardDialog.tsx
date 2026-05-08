import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle2, ArrowRight, ArrowLeft, Table as TableIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLedgerImport, LEDGER_FIELDS } from '@/hooks/useLedgerImport';

interface LedgerImportWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

const STEP_LABELS = ['UPLOAD', 'MAPPING', 'PREVIEW', 'SYNC'];
const STEP_KEYS = ['upload', 'mapping', 'preview', 'importing'];

export function LedgerImportWizard({ isOpen, onOpenChange, onImportComplete }: LedgerImportWizardProps) {
  const {
    step, setStep, file, rawData, headers, mapping, isProcessing, importResult,
    reset, processFile, setMapping, isMappingComplete, getMappedData, startImport
  } = useLedgerImport(onImportComplete);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isProcessing) onOpenChange(open); if (!open) reset(); }}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] overflow-hidden flex flex-col p-0 rounded-3xl border-none shadow-2xl bg-white">

        {/* Header */}
        <div className="bg-[#1c1c1c] px-5 pt-5 pb-9 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <DialogTitle className="text-lg font-black tracking-tight italic flex items-center gap-2 leading-none">
                <TableIcon className="h-4 w-4 text-white/40 not-italic shrink-0" />
                DATA <span className="not-italic text-[#535366] ml-1">INGESTION</span>
              </DialogTitle>
              <DialogDescription className="text-white/40 font-black uppercase text-[8px] tracking-[0.25em] mt-1">
                Ledger Synchronization
              </DialogDescription>
            </div>
            {/* Step indicators */}
            <div className="flex items-center gap-2 pt-0.5">
              {STEP_LABELS.map((label, i) => {
                const isActive = STEP_KEYS[i] === step;
                return (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className={cn("h-1 w-8 rounded-full transition-all duration-500", isActive ? "bg-white" : "bg-white/15")} />
                    <span className={cn("text-[7px] font-black tracking-widest", isActive ? "text-white" : "text-white/20")}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 -mt-5 bg-white rounded-t-3xl relative z-20 max-h-[62vh]">

          {/* Upload step */}
          {step === 'upload' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-10 border-2 border-dashed border-[#dcd7cf] rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-[#1c1c1c] hover:bg-[#f4f2ef]/40 transition-all cursor-pointer group"
              >
                <div className="h-14 w-14 rounded-2xl bg-[#f4f2ef] flex items-center justify-center text-[#dcd7cf] group-hover:bg-[#1c1c1c] group-hover:text-white transition-all duration-300 shadow-md">
                  <Upload className="h-7 w-7" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-black text-[#1c1c1c] tracking-tight uppercase">Drop Source File</p>
                  <p className="text-[9px] font-black text-[#535366]/40 uppercase tracking-[0.2em]">XLSX, XLS or CSV · Max 10MB</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} accept=".csv,.xlsx,.xls" className="hidden" />
              </div>
            </div>
          )}

          {/* Mapping step */}
          {step === 'mapping' && (
            <div className="space-y-4 py-2">
              <div className="bg-[#f4f2ef] px-4 py-3 rounded-xl flex items-center gap-3 border border-[#dcd7cf]/50">
                <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-[#1c1c1c] shadow-sm shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#1c1c1c] uppercase tracking-widest truncate max-w-[180px]">{file?.name}</p>
                  <p className="text-[9px] font-black text-[#535366]/40 uppercase tracking-[0.15em]">{rawData.length} records found</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 px-1 text-[8px] font-black uppercase tracking-[0.25em] text-[#535366]/30">
                  <div className="w-1/2">Field</div>
                  <div className="w-1/2">Column</div>
                </div>
                {LEDGER_FIELDS.map(f => (
                  <div key={f.key} className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border-2 border-[#f4f2ef] hover:border-[#1c1c1c] transition-all group">
                    <div className="w-1/2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#dcd7cf] group-hover:bg-[#1c1c1c] transition-colors shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#1c1c1c] truncate">
                        {f.label} {['date', 'item_name', 'type', 'amount'].includes(f.key) && <span className="text-rose-500">*</span>}
                      </span>
                    </div>
                    <div className="w-1/2">
                      <Select value={mapping[f.key] || ""} onValueChange={v => setMapping(prev => ({ ...prev, [f.key]: v }))}>
                        <SelectTrigger className="bg-[#f4f2ef] border-none rounded-xl h-9 font-bold text-[10px] focus:ring-2 focus:ring-[#1c1c1c]">
                          <SelectValue placeholder="Map column..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#dcd7cf] shadow-xl">
                          {headers.map(h => <SelectItem key={h} value={h} className="text-xs font-bold py-2">{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview step */}
          {step === 'preview' && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-[#1c1c1c] tracking-[0.25em]">Data Verification</h3>
                  <p className="text-[9px] font-black text-[#535366]/40 uppercase tracking-widest">Pre-processed ledger entries</p>
                </div>
                <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] px-3 py-1 rounded-lg shadow-sm tracking-widest">VERIFIED</Badge>
              </div>
              <div className="rounded-xl border-2 border-[#f4f2ef] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1c1c1c] border-none hover:bg-[#1c1c1c]">
                      {LEDGER_FIELDS.slice(0, 5).map(f => (
                        <TableHead key={f.key} className="text-[8px] font-black uppercase text-white/50 py-3 text-center">{f.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getMappedData().slice(0, 5).map((row, i) => (
                      <TableRow key={i} className="border-[#f4f2ef] hover:bg-[#f4f2ef]/50">
                        {LEDGER_FIELDS.slice(0, 5).map(f => (
                          <TableCell key={f.key} className="text-[10px] font-bold text-[#1c1c1c] py-3 text-center">
                            {f.key === 'amount' ? `Rp ${row[f.key].toLocaleString()}` : row[f.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Importing step */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-10 gap-6">
              {!importResult ? (
                <>
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-[#f4f2ef] border-t-[#1c1c1c] animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TableIcon className="h-6 w-6 text-[#1c1c1c]" />
                    </div>
                  </div>
                  <div className="text-center space-y-1.5">
                    <p className="text-lg font-black text-[#1c1c1c] tracking-tighter uppercase">Synchronizing</p>
                    <p className="text-[9px] font-black text-[#535366]/40 uppercase tracking-[0.25em] animate-pulse">Finalizing ledger persistence...</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 animate-bounce">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-2xl font-black text-[#1c1c1c] tracking-tighter italic">PROTOCOL <span className="not-italic text-[#535366]">SUCCESS</span></p>
                    <div className="flex items-center gap-3 justify-center">
                      <Badge className="bg-emerald-100 text-emerald-700 border-none font-black px-3 py-1.5 rounded-lg text-[10px]">{importResult.success} Ingested</Badge>
                      <Badge className="bg-rose-100 text-rose-700 border-none font-black px-3 py-1.5 rounded-lg text-[10px]">{importResult.failed} Failed</Badge>
                    </div>
                  </div>
                  <Button onClick={() => { onOpenChange(false); reset(); }} className="h-11 px-8 bg-[#1c1c1c] text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                    Close Wizard
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'importing' && (
          <div className="px-5 py-4 bg-[#f4f2ef]/50 border-t border-[#dcd7cf] flex items-center justify-between shrink-0">
            <div>
              {step !== 'upload' && (
                <Button variant="ghost" onClick={() => setStep(step === 'mapping' ? 'upload' : 'mapping')} className="h-9 px-4 font-black text-[9px] uppercase tracking-widest text-[#535366] hover:bg-[#1c1c1c] hover:text-white rounded-xl transition-all">
                  <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back
                </Button>
              )}
            </div>
            <div>
              {step === 'mapping' && (
                <Button onClick={() => setStep('preview')} disabled={!isMappingComplete()} className="h-9 px-6 bg-[#1c1c1c] text-white font-black uppercase text-[9px] tracking-[0.25em] rounded-xl shadow-md disabled:opacity-30 transition-all hover:scale-105 active:scale-95">
                  Verify <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Button>
              )}
              {step === 'preview' && (
                <Button onClick={startImport} className="h-9 px-6 bg-emerald-600 text-white font-black uppercase text-[9px] tracking-[0.25em] rounded-xl shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                  Import <CheckCircle2 className="h-3.5 w-3.5 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { LedgerImportWizard as ImportWizardDialog };