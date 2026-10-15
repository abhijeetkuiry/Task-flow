import React from 'react';
import { Search, X, ArrowUpDown, Trash2, CheckCheck } from 'lucide-react';

export default function TaskFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  counts,
  onClearCompleted,
  isClearing,
}) {
  const FILTER_TABS = [
    { id: 'ALL', label: 'All', count: counts.total },
    { id: 'TODO', label: 'Todo', count: counts.todo },
    { id: 'IN_PROGRESS', label: 'In Progress', count: counts.inProgress },
    { id: 'COMPLETED', label: 'Completed', count: counts.completed },
    { id: 'URGENT', label: 'Urgent', count: counts.urgent },
  ];

  return (
    <div className="task-filters-section">
      {/* Top row: Filter Tabs & Clear Action */}
      <div className="filters-header-row">
        <div className="filter-tabs" role="tablist">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={filter === tab.id}
              className={`filter-tab ${filter === tab.id ? 'active' : ''}`}
              onClick={() => onFilterChange(tab.id)}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="tab-count-badge">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {counts.completed > 0 && (
          <button
            type="button"
            className="btn-clear-completed"
            onClick={onClearCompleted}
            disabled={isClearing}
            title="Remove all completed tasks from MongoDB Atlas"
            id="btn-clear-completed-tasks"
          >
            <CheckCheck size={15} />
            <span>Clear Completed ({counts.completed})</span>
          </button>
        )}
      </div>

      {/* Bottom row: Search bar & Sort selector */}
      <div className="search-sort-row">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title or notes..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            id="input-search-tasks"
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="sort-box">
          <ArrowUpDown size={15} className="sort-icon" />
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort tasks by"
            id="select-sort-tasks"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="dueDate">Due Date (Soonest)</option>
            <option value="-priority">Priority (High to Low)</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
