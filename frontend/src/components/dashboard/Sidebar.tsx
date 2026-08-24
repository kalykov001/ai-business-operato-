"use client";

import {
  LayoutDashboard,
  Mail,
  Calendar,
  Folder,
  Users,
  CheckSquare,
  Bot,
  Settings,
  Kanban,
NotebookPen
} from "lucide-react";
import Link from "next/link";

type MenuItem = {
  label: string;
  icon: React.ElementType;
  path: string;
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Gmail", icon: Mail, path: "/gmail" },
  { label: "Calendar", icon: Calendar, path: "/calendar" },
  { label: "Drive", icon: Folder, path: "/drive" },
  { label: "CRM", icon: Users, path: "/crm" },
  { label: "Tasks", icon: CheckSquare, path: "/tasks" },
  { label: "Notes", icon: NotebookPen, path: "/notes" },
];

export default function Sidebar() {

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.path}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="my-4 border-t" />

        <Link
  href="/ai"
  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
>
  <Bot className="h-4 w-4" />
  AI Assistant
</Link>
      </nav>

      {/* Settings */}
      <div className="border-t p-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
