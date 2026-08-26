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
  NotebookPen,
  X,
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

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed left-0 top-0 z-50
        flex h-screen w-64 flex-col
        border-r bg-background
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <span className="font-semibold">
          Operator AI
        </span>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

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
   
      </div>
    </aside>
  );
}