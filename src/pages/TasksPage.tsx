import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useTasks, type TaskStatus } from '@/hooks/useTasks';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { type Task } from '@/lib/supabase';

export function TasksPage() {
  useDocumentTitle('Tasks');
  const {
    tasks,
    profiles,
    isLoading,
    handleUpdateTaskStatus,
    handleDeleteTask,
    handleSaveTask
  } = useTasks();

  const [activeDivision, setActiveDivision] = React.useState<string>('all');
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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-indigo-600 rounded-full" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Strategy Board</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] pl-4">Operational Pipeline & Milestones</p>
        </div>
      </div>

      <TaskFilters 
        activeDivision={activeDivision}
        onDivisionChange={setActiveDivision}
        onAddTask={() => handleOpenAddDialog()}
      />

      <TaskBoard 
        tasks={filteredTasks}
        profiles={profiles}
        isLoading={isLoading}
        onEdit={handleOpenEditDialog}
        onDelete={handleDeleteTask}
        onStatusUpdate={handleUpdateTaskStatus}
        onAddTask={handleOpenAddDialog}
      />

      <TaskFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        profiles={profiles}
        isSubmitting={isSubmitting}
        onSave={onSave}
        initialStatus={initialStatus}
      />
    </div>
  );
}
