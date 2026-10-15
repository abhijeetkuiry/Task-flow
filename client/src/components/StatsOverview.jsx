import React from 'react';
import { CheckCircle2, Clock, Flame, ListTodo, TrendingUp } from 'lucide-react';

export default function StatsOverview({ stats, currentFilter, onSelectFilter }) {
  const total = stats?.total || 0;
  const completed = stats?.completed || 0;
  const inProgress = stats?.inProgress || 0;
  const urgentHigh = (stats?.urgent || 0) + (stats?.high || 0);

  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="stats-dashboard" aria-label="Task statistics summary">
      <div
        className={`stat-card ${currentFilter === 'ALL' ? 'active' : ''}`}
        onClick={() => onSelectFilter('ALL')}
        role="button"
        tabIndex={0}
        title="View all tasks"
      >
        <div className="stat-card-top">
          <span className="stat-label">Total Tasks</span>
          <div className="stat-icon-wrap default">
            <ListTodo size={18} />
          </div>
        </div>
        <div className="stat-value">{total}</div>
        <div className="stat-subtext">Registered in Atlas</div>
      </div>

      <div
        className={`stat-card ${currentFilter === 'COMPLETED' ? 'active' : ''}`}
        onClick={() => onSelectFilter('COMPLETED')}
        role="button"
        tabIndex={0}
        title="View completed tasks"
      >
        <div className="stat-card-top">
          <span className="stat-label">Completed</span>
          <div className="stat-icon-wrap completed">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="stat-value-row">
          <span className="stat-value">{completed}</span>
          <span className="stat-badge-percent">{percentComplete}%</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>
      </div>

      <div
        className={`stat-card ${currentFilter === 'IN_PROGRESS' ? 'active' : ''}`}
        onClick={() => onSelectFilter('IN_PROGRESS')}
        role="button"
        tabIndex={0}
        title="View in-progress tasks"
      >
        <div className="stat-card-top">
          <span className="stat-label">In Progress</span>
          <div className="stat-icon-wrap in-progress">
            <Clock size={18} />
          </div>
        </div>
        <div className="stat-value">{inProgress}</div>
        <div className="stat-subtext">Currently active</div>
      </div>

      <div
        className={`stat-card ${currentFilter === 'URGENT' ? 'active' : ''}`}
        onClick={() => onSelectFilter('URGENT')}
        role="button"
        tabIndex={0}
        title="View urgent and high priority tasks"
      >
        <div className="stat-card-top">
          <span className="stat-label">Urgent / High</span>
          <div className="stat-icon-wrap urgent">
            <Flame size={18} />
          </div>
        </div>
        <div className="stat-value">{urgentHigh}</div>
        <div className="stat-subtext">Requires immediate attention</div>
      </div>
    </section>
  );
}
