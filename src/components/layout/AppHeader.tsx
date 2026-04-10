import { Bell, Menu } from "lucide-react";

interface AppHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function AppHeader({ title, onMenuClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 shadow-sm lg:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-foreground lg:text-xl">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Bot status */}
        <div className="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:flex">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-primary" />
          Bot Active
        </div>

        {/* Notification bell */}
        <button className="relative rounded-full p-2 text-muted-foreground hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          AD
        </div>
      </div>
    </header>
  );
}
