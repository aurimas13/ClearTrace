import type { TypologyMeta } from '../services/typology';

interface TypologyChipsProps {
  typologies: TypologyMeta[];
  size?: 'sm' | 'xs';
}

export default function TypologyChips({ typologies, size = 'sm' }: TypologyChipsProps) {
  if (typologies.length === 0) return null;
  const padding = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <div className="inline-flex flex-wrap gap-1">
      {typologies.map((t) => (
        <span
          key={t.id}
          title={t.description}
          className={`inline-flex items-center gap-1 rounded font-semibold border ${t.classes} ${padding}`}
        >
          {size === 'xs' ? t.short : t.label}
        </span>
      ))}
    </div>
  );
}
