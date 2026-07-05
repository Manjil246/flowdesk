import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CopyableIdProps = {
  id: string;
  label?: string;
  className?: string;
};

export default function CopyableId({ id, label, className }: CopyableIdProps) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success(label ? `${label} copied` : "ID copied");
    } catch {
      toast.error("Could not copy ID");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      title={`Copy ${label ?? "ID"}: ${id}`}
      className={cn(
        "group inline-flex max-w-full items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left",
        className,
      )}
    >
      <span className="truncate">{id}</span>
      <Copy className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
