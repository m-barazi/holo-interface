import * as RadixSlider from '@radix-ui/react-slider';

export function Slider({
  value,
  onValueChange,
  label,
  display,
}: {
  value: number;
  onValueChange: (v: number) => void;
  label: string;
  display?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-txt-secondary">
        {label}: {display ?? `${Math.round(value * 100)}%`}
      </span>
      <RadixSlider.Root
        value={[value]}
        max={1}
        step={0.01}
        onValueChange={(v) => onValueChange(v[0] ?? 0)}
        className="flex h-5 items-center"
      >
        <RadixSlider.Track className="h-1 flex-1 rounded bg-white/10">
          <RadixSlider.Range className="h-full rounded bg-accent-cyan" />
        </RadixSlider.Track>
        <RadixSlider.Thumb className="block h-4 w-4 rounded-full bg-accent-cyan shadow-[0_0_16px_rgba(34,211,238,0.6)]" />
      </RadixSlider.Root>
    </div>
  );
}