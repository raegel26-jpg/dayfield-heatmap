type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="text-sm text-white/50">
      <span>{current} / {total}</span>
    </div>
  );
}
