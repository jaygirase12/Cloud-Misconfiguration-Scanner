import React from 'react';
import { CheckStatus, Severity } from '../scanner/types';

interface SeverityBadgeProps {
  severity?: Severity;
  status?: CheckStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  status,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  }[size];

  if (status) {
    if (status === 'PASS') {
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          PASS
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-bold rounded-md bg-rose-950/60 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
        FAIL
      </span>
    );
  }

  switch (severity) {
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold rounded-md bg-purple-950/60 text-purple-300 border border-purple-500/40 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold rounded-md bg-rose-950/60 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/30 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          MEDIUM
        </span>
      );
    case 'LOW':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold rounded-md bg-blue-950/60 text-blue-300 border border-blue-500/30 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          LOW
        </span>
      );
    case 'INFO':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold rounded-md bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          INFO
        </span>
      );
  }
};
