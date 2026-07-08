type StatusBadgeProps = {
  children: string;
};

export function StatusBadge({ children }: StatusBadgeProps) {
  return <span className={`badge badge-${children.toLowerCase().replaceAll("_", "-")}`}>{children}</span>;
}
