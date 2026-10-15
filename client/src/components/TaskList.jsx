import React from 'react';
import TaskItem from './TaskItem';
import { ClipboardList, Sparkles, Plus, SearchX } from 'lucide-react';

export default function TaskList({
  tasks,
  isLoading,
  onToggle,
  onDelete,
  onEdit,
  onUpdateStatus,
  filter,
  search,
  onResetFilters,
}) {
  if (isLoading) {
    return (
      <div className="task-list-loading">
        {[1, 2, 3].map((n) => (
          <div key={n} className="task-skeleton-card">
            <div className="skeleton-checkbox"></div>
            <div className="skeleton-content">
              <div className="skeleton-line title"></div>
              <div className="skeleton-line meta"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    const isSearching = Boolean(search);
    const isFiltered = filter !== 'ALL';

    return (
      <div className="task-list-empty-state">
        <div className="empty-icon-halo">
          {isSearching ? <SearchX size={32} /> : <ClipboardList size={32} />}
        </div>
        <h3 className="empty-title">
          {isSearching
            ? 'No matching tasks found'
            : isFiltered
            ? `No ${filter.toLowerCase().replace('_', ' ')} tasks`
            : 'All caught up! No tasks in Atlas.'}
        </h3>
        <p className="empty-desc">
          {isSearching
            ? `No tasks matched your query "${search}". Try adjusting your keywords.`
            : isFiltered
            ? `You don't have any tasks categorized under ${filter.toLowerCase().replace('_', ' ')}.`
            : 'Add a new task above to organize your goals and workflow.'}
        </p>

        {(isSearching || isFiltered) && (
          <button
            type="button"
            className="empty-reset-btn"
            onClick={onResetFilters}
          >
            Reset Filters & Search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="task-list-items" role="list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}
