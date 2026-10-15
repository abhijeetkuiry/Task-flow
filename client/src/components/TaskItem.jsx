import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  Flag,
  Trash2,
  Edit3,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  onUpdateStatus,
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCompleted = task.status === 'COMPLETED';

  // Compute due date label and urgency
  const getDueInfo = (dateString) => {
    if (!dateString) return null;
    const due = new Date(dateString);
    const now = new Date();
    
    // Normalize to date-only for comparison
    const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffDays = Math.round((dueDateOnly - todayDateOnly) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `${Math.abs(diffDays)}d overdue`,
        isOverdue: true,
        isToday: false,
      };
    }
    if (diffDays === 0) {
      return { label: 'Due today', isOverdue: false, isToday: true };
    }
    if (diffDays === 1) {
      return { label: 'Due tomorrow', isOverdue: false, isToday: false };
    }
    return {
      label: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isOverdue: false,
      isToday: false,
    };
  };

  const dueInfo = getDueInfo(task.dueDate);

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(task.id);
  };

  return (
    <div
      className={`task-card-item ${isCompleted ? 'completed' : ''} ${
        isDeleting ? 'deleting' : ''
      }`}
      id={`task-item-${task.id}`}
    >
      <div className="task-main-row">
        {/* Animated Checkbox */}
        <button
          type="button"
          className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
          onClick={() => onToggle(task.id)}
          title={isCompleted ? 'Mark as active' : 'Mark as complete'}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && <Check size={14} className="checkbox-check-icon" />}
        </button>

        {/* Task Content */}
        <div className="task-content-area">
          <div className="task-title-row">
            <span
              className={`task-title-text ${isCompleted ? 'strike' : ''}`}
              onClick={() => onToggle(task.id)}
            >
              {task.title}
            </span>

            {/* Quick Status Select */}
            <div className="status-selector-wrap">
              <select
                className={`status-chip ${task.status.toLowerCase()}`}
                value={task.status}
                onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                title="Change task status"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Badges row: Priority, Due Date, Project, Note preview */}
          <div className="task-meta-row">
            {/* Priority Badge */}
            <span className={`priority-badge ${task.priority.toLowerCase()}`}>
              <Flag size={11} />
              <span>{task.priority}</span>
            </span>

            {/* Due Date Badge */}
            {dueInfo && (
              <span
                className={`due-badge ${
                  !isCompleted && dueInfo.isOverdue
                    ? 'overdue'
                    : !isCompleted && dueInfo.isToday
                    ? 'today'
                    : ''
                }`}
              >
                {!isCompleted && dueInfo.isOverdue ? (
                  <AlertTriangle size={11} />
                ) : (
                  <Calendar size={11} />
                )}
                <span>{dueInfo.label}</span>
              </span>
            )}

            {/* Project Tag if attached */}
            {task.project?.name && (
              <span className="project-badge">
                {task.project.name}
              </span>
            )}

            {/* Notes Toggle Button if description exists */}
            {task.description && (
              <button
                type="button"
                className="btn-notes-preview"
                onClick={() => setShowNotes(!showNotes)}
                title="Show notes"
              >
                <AlignLeft size={11} />
                <span>Notes</span>
                {showNotes ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            )}
          </div>

          {/* Collapsible Description/Notes */}
          {showNotes && task.description && (
            <div className="task-description-box">
              <p>{task.description}</p>
            </div>
          )}
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="task-actions-group">
          <button
            type="button"
            className="btn-action edit"
            onClick={() => onEdit(task)}
            title="Edit task details"
          >
            <Edit3 size={15} />
          </button>
          <button
            type="button"
            className="btn-action delete"
            onClick={handleDelete}
            title="Delete task from Atlas"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
