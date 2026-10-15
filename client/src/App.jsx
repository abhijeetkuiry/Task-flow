import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { taskApi } from './services/api';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import TaskInput from './components/TaskInput';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import EditTaskModal from './components/EditTaskModal';
import Toast from './components/Toast';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Modal state
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Check MongoDB Atlas status
  const checkHealth = useCallback(async () => {
    try {
      const res = await taskApi.checkHealth();
      setDbStatus(res);
    } catch (err) {
      setDbStatus({ status: 'error', message: err.message });
    }
  }, []);

  // Fetch stats from backend
  const loadStats = useCallback(async () => {
    try {
      const res = await taskApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch tasks with current query filters
  const loadTasks = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    try {
      const params = {
        sort,
      };

      if (filter === 'TODO') params.status = 'TODO';
      else if (filter === 'IN_PROGRESS') params.status = 'IN_PROGRESS';
      else if (filter === 'COMPLETED') params.status = 'COMPLETED';
      else if (filter === 'URGENT') params.priority = 'URGENT';

      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await taskApi.getTasks(params);
      if (res.success) {
        setTasks(res.data || []);
      }
    } catch (err) {
      showToast(`Error fetching tasks: ${err.message}`, 'error');
    } finally {
      if (showLoadingSpinner) setIsLoading(false);
    }
  }, [filter, search, sort, showToast]);

  // Initial load
  useEffect(() => {
    checkHealth();
    loadStats();
    loadTasks(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload tasks when filter/search/sort change
  useEffect(() => {
    loadTasks(false);
  }, [filter, search, sort, loadTasks]);

  // Manual refresh button
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([checkHealth(), loadStats(), loadTasks(false)]);
    setIsRefreshing(false);
    showToast('Synced with MongoDB Atlas', 'info');
  };

  // Add Task
  const handleAddTask = async (newTaskData) => {
    setIsCreating(true);
    try {
      const res = await taskApi.createTask(newTaskData);
      if (res.success && res.data) {
        // Prepend new task immediately
        setTasks((prev) => [res.data, ...prev]);
        loadStats();
        showToast('Task saved to MongoDB Atlas', 'success');
      }
    } catch (err) {
      showToast(`Failed to add task: ${err.message}`, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (id) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );

    try {
      const res = await taskApi.toggleTask(id);
      if (res.success && res.data) {
        setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
        loadStats();
      }
    } catch (err) {
      // Revert on failure
      setTasks(previousTasks);
      showToast(`Failed to toggle task: ${err.message}`, 'error');
    }
  };

  // Quick update status dropdown
  const handleUpdateStatus = async (id, newStatus) => {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await taskApi.updateTask(id, { status: newStatus });
      if (res.success && res.data) {
        setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
        loadStats();
      }
    } catch (err) {
      setTasks(previousTasks);
      showToast(`Status update failed: ${err.message}`, 'error');
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await taskApi.deleteTask(id);
      if (res.success) {
        loadStats();
        showToast('Task deleted from Atlas', 'info');
      }
    } catch (err) {
      setTasks(previousTasks);
      showToast(`Failed to delete: ${err.message}`, 'error');
    }
  };

  // Clear all completed tasks
  const handleClearCompleted = async () => {
    setIsClearing(true);
    try {
      const res = await taskApi.clearCompleted();
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.status !== 'COMPLETED'));
        loadStats();
        showToast(`Cleared ${res.count} completed task(s)`, 'success');
      }
    } catch (err) {
      showToast(`Error clearing tasks: ${err.message}`, 'error');
    } finally {
      setIsClearing(false);
    }
  };

  // Edit Modal Handlers
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveEdit = async (id, updatedData) => {
    setIsSavingEdit(true);
    try {
      const res = await taskApi.updateTask(id, updatedData);
      if (res.success && res.data) {
        setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
        loadStats();
        handleCloseEdit();
        showToast('Task updated successfully', 'success');
      }
    } catch (err) {
      showToast(`Failed to save task: ${err.message}`, 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const counts = useMemo(() => {
    return {
      total: stats?.total ?? tasks.length,
      todo: stats?.todo ?? tasks.filter((t) => t.status === 'TODO').length,
      inProgress: stats?.inProgress ?? tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      completed: stats?.completed ?? tasks.filter((t) => t.status === 'COMPLETED').length,
      urgent: stats?.urgent ?? tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'COMPLETED').length,
    };
  }, [stats, tasks]);

  return (
    <div className="app-wrapper">
      {/* App Header with MongoDB Atlas Status */}
      <Header
        dbStatus={dbStatus}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Stats Dashboard */}
      <StatsOverview
        stats={stats}
        currentFilter={filter}
        onSelectFilter={setFilter}
      />

      {/* Task Creation Bar */}
      <TaskInput
        onAddTask={handleAddTask}
        isCreating={isCreating}
      />

      {/* Filters, Search & Sort */}
      <TaskFilters
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        counts={counts}
        onClearCompleted={handleClearCompleted}
        isClearing={isClearing}
      />

      {/* Main Task List */}
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
        onEdit={handleOpenEdit}
        onUpdateStatus={handleUpdateStatus}
        filter={filter}
        search={search}
        onResetFilters={() => {
          setFilter('ALL');
          setSearch('');
        }}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={isModalOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
