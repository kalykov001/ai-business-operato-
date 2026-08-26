"use client";

import {
  Calendar,
  CheckSquare,
  Folder,
  LayoutDashboard,
  Mail,
  Users,
  Bot,
  Settings,
  NotebookPen,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Gmail",
    icon: Mail,
    path: "/gmail",
  },
  {
    title: "Calendar",
    icon: Calendar,
    path: "/calendar",
  },
  {
    title: "Drive",
    icon: Folder,
    path: "/drive",
  },
  {
    title: "CRM",
    icon: Users,
    path: "/crm",
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    path: "/tasks",
  },
  {
    title: "Notes",
    icon: NotebookPen,
    path: "/notes",
  },
];

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="
        border-r
        border-sidebar-border
        bg-sidebar
        text-sidebar-foreground
      "
    >
      {/* =========================================
          HEADER
      ========================================= */}

      <SidebarHeader
        className="
          border-b
          border-sidebar-border
          bg-sidebar
          px-4
          py-5
        "
      >
        <div className="flex items-center gap-3">
          {/* Logo */}

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-sidebar-border
              bg-sidebar-primary/10
              shadow-[0_0_25px_rgba(37,99,235,0.08)]
            "
          >
            <img
              src="/operatorAI.png"
              alt="OperatorAI"
              className="h-7 w-7 object-contain"
            />
          </div>

          {/* Brand */}

          <div className="flex min-w-0 flex-col">
            <span
              className="
                truncate
                text-[15px]
                font-bold
                tracking-tight
                text-sidebar-foreground
              "
            >
              OperatorAI
            </span>

            <span
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.16em]
                text-sidebar-primary
              "
            >
              Business Operator
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* =========================================
          CONTENT
      ========================================= */}

      <SidebarContent
        className="
          bg-sidebar
          px-3
          py-5
        "
      >
        {/* Workspace */}

        <SidebarGroup>
          <SidebarGroupLabel
            className="
              mb-2
              px-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-muted-foreground
            "
          >
            Workspace
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainItems.map((item) => {
                const Icon = item.icon;

                const isActive =
                  item.path === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.path);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={() => router.push(item.path)}
                      className={`
                        group
                        relative
                        h-11
                        rounded-xl
                        px-3
                        transition-all
                        duration-200

                        ${
                          isActive
                            ? `
                              bg-sidebar-accent
                              text-sidebar-accent-foreground
                              shadow-sm
                            `
                            : `
                              text-muted-foreground
                              hover:bg-sidebar-accent
                              hover:text-sidebar-accent-foreground
                            `
                        }
                      `}
                    >
                      {/* Active indicator */}

                      {isActive && (
                        <span
                          className="
                            absolute
                            left-0
                            top-1/2
                            h-6
                            w-[3px]
                            -translate-y-1/2
                            rounded-r-full
                            bg-sidebar-primary
                          "
                        />
                      )}

                      <Icon
                        className={`
                          h-[18px]
                          w-[18px]
                          shrink-0
                          transition-colors

                          ${
                            isActive
                              ? "text-sidebar-primary"
                              : "text-muted-foreground group-hover:text-sidebar-primary"
                          }
                        `}
                      />

                      <span className="text-[13px] font-medium">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* =========================================
            AI ASSISTANT
        ========================================= */}

        <SidebarGroup className="mt-7">
          <SidebarGroupLabel
            className="
              mb-2
              px-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-muted-foreground
            "
          >
            Intelligence
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="AI Assistant"
                  onClick={() => router.push("/ai")}
                  className={`
                    h-auto
                    min-h-[58px]
                    rounded-xl
                    border
                    px-3
                    py-3
                    transition-all
                    duration-200

                    ${
                      pathname.startsWith("/ai")
                        ? `
                          border-sidebar-primary/30
                          bg-sidebar-primary/10
                          text-sidebar-accent-foreground
                          shadow-[0_0_25px_rgba(37,99,235,0.08)]
                        `
                        : `
                          border-sidebar-border
                          bg-sidebar-accent/50
                          text-muted-foreground
                          hover:border-sidebar-primary/25
                          hover:bg-sidebar-accent
                          hover:text-sidebar-accent-foreground
                        `
                    }
                  `}
                >
                  {/* AI Icon */}

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-sidebar-primary/10
                    "
                  >
                    <Bot
                      className="
                        h-[18px]
                        w-[18px]
                        text-sidebar-primary
                      "
                    />
                  </div>

                  {/* Text */}

                  <div className="flex min-w-0 flex-col items-start">
                    <span className="text-[13px] font-semibold">
                      AI Assistant
                    </span>

                    <span
                      className="
                        mt-0.5
                        truncate
                        text-[10px]
                        text-muted-foreground
                      "
                    >
                      Ask anything
                    </span>
                  </div>

                  {/* Online */}

                  <span
                    className="
                      ml-auto
                      h-2
                      w-2
                      shrink-0
                      rounded-full
                      bg-emerald-500
                      shadow-[0_0_8px_rgba(16,185,129,0.6)]
                    "
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* =========================================
          FOOTER
      ========================================= */}

      <SidebarFooter
        className="
          border-t
          border-sidebar-border
          bg-sidebar
          p-3
        "
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              onClick={() => router.push("/settings")}
              className="
                group
                h-11
                rounded-xl
                px-3
                text-muted-foreground
                transition-all
                duration-200
                hover:bg-sidebar-accent
                hover:text-sidebar-accent-foreground
              "
            >
     
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}