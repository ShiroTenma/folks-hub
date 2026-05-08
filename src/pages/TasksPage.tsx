import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useTasks, type TaskStatus } from '@/hooks/useTasks';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { type Task } from '@/lib/supabase';
import { CheckSquare, Layout } from 'lucide-react';
import { PriorityMatrix } from '@/components/tasks/PriorityMatrix';
import { cn } from '@/lib/utils';

export function TasksPage() {
  useDocumentTitle('Tasks');
  const {
    tasks, profiles, taskTags, isLoading, handleUpdateTaskStatus, handleDeleteTask, handleSaveTask
  } = useTasks();

  const [activeDivision, setActiveDivision] = React.useState<string>('all');
  const [viewMode, setViewMode] = React.useState<'board' | 'matrix'>('board');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = React.useState<TaskStatus>('todo');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const filteredTasks = tasks.filter(t => activeDivision === 'all' || t.division === activeDivision);

  const handleOpenAddDialog = (status: TaskStatus = 'todo') => {
    setEditingTask(null);
    setInitialStatus(status);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const onSave = async (formData: any) => {
    setIsSubmitting(true);
    const success = await handleSaveTask(formData, editingTask?.id);
    setIsSubmitting(false);
    return success;
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-white shadow-xl shadow-black/10 border border-white/10">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-heading font-black text-[#1c1c1c] tracking-tight italic">Strategy <span className="not-italic text-[#535366]">Board</span></h1>
          </div>
          <div className="flex items-center gap-4 text-[#535366]/60 bg-white/50 border border-[#dcd7cf] w-fit px-5 py-2.5 rounded-2xl backdrop-blur-sm">
            <Layout className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Operational Pipeline & Milestones</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-[#dcd7cf] shadow-xl shadow-black/5">
          <button 
            onClick={() => setViewMode('board')}
            className={cn(
              "px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'board' ? "bg-[#1c1c1c] text-white shadow-lg" : "text-[#535366] hover:bg-[#f4f2ef]"
            )}
          >Kanban View</button>
          <button 
            onClick={() => setViewMode('matrix')}
            className={cn(
              "px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              viewMode === 'matrix' ? "bg-[#1c1c1c] text-white shadow-lg" : "text-[#535366] hover:bg-[#f4f2ef]"
            )}
          >Priority Matrix</button>
        </div>
      </div>

      <TaskFilters 
        activeDivision={activeDivision}
        onDivisionChange={setActiveDivision}
        onAddTask={() => handleOpenAddDialog()}
      />

      {viewMode === 'board' ? (
        <TaskBoard 
          tasks={filteredTasks}
          profiles={profiles}
          isLoading={isLoading}
          onEdit={handleOpenEditDialog}
          onDelete={handleDeleteTask}
          onStatusUpdate={handleUpdateTaskStatus}
          onAddTask={handleOpenAddDialog}
        />
      ) : (
        <PriorityMatrix 
          tasks={filteredTasks}
          onTaskClick={handleOpenEditDialog}
        />
      )}

      <TaskFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        profiles={profiles}
        taskTags={taskTags}
        isSubmitting={isSubmitting}
        onSave={onSave}
        initialStatus={initialStatus}
      />
    </div>
  );
}
