import { Search, X } from 'lucide-react';

export type RiskFilter = 'all' | 'high' | 'medium' | 'low';
export type StatusFilter = 'all' | 'pending' | 'reviewed';

export interface AlertFilters {
  search: string;
  risk: RiskFilter;
  status: StatusFilter;
  flaggedOnly: boolean;
  type: string; // 'all' | specific tx type
}

export const DEFAULT_FILTERS: AlertFilters = {
  search: '',
  risk: 'all',
  status: 'all',
  flaggedOnly: false,
  type: 'all',
};

interface AlertsFilterBarProps {
  filters: AlertFilters;
  onChange: (f: AlertFilters) => void;
  onReset: () => void;
  txTypes: string[];
  resultCount: number;
  totalCount: number;
}

export default function AlertsFilterBar({
  filters,
  onChange,
  onReset,
  txTypes,
  resultCount,
  totalCount,
}: AlertsFilterBarProps) {
  const update = <K extends keyof AlertFilters>(key: K, value: AlertFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const hasActiveFilters =
    filters.search ||
    filters.risk !== 'all' ||
    filters.status !== 'all' ||
    filters.flaggedOnly ||
    filters.type !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 card-shadow space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Search by sender, receiver or transaction ID…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Risk */}
        <Select
          label="Risk"
          value={filters.risk}
          onChange={(v) => update('risk', v as RiskFilter)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'high', label: 'High (≥80)' },
            { value: 'medium', label: 'Medium (60–79)' },
            { value: 'low', label: 'Low (<60)' },
          ]}
        />

        {/* Status */}
        <Select
          label="Status"
          value={filters.status}
          onChange={(v) => update('status', v as StatusFilter)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'reviewed', label: 'Reviewed' },
          ]}
        />

        {/* Type */}
        <Select
          label="Type"
          value={filters.type}
          onChange={(v) => update('type', v)}
          options={[
            { value: 'all', label: 'All types' },
            ...txTypes.map((t) => ({ value: t, label: t.replace(/_/g, ' ') })),
          ]}
        />

        {/* Flagged toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 select-none">
          <input
            type="checkbox"
            checked={filters.flaggedOnly}
            onChange={(e) => update('flaggedOnly', e.target.checked)}
            className="w-4 h-4 accent-blue-700 cursor-pointer"
          />
          <span className="font-medium">Flagged only</span>
        </label>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      <div className="text-xs text-slate-500 flex items-center justify-between">
        <span>
          Showing <span className="font-semibold text-slate-900">{resultCount}</span> of {totalCount} transactions
        </span>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-medium cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
