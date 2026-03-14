"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlignLeft,
  CirclePlus,
  HardDrive,
  Blocks,
  Terminal,
  Box,
  Workflow,
  Plug,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { TaskHistory } from "@/components/task-history";

const mainNav = [
  { label: "Library", icon: AlignLeft, href: "/library" },
  { label: "Storage", icon: HardDrive, href: "/storage" },
  { label: "MCP Servers", icon: Plug, href: "/mcp" },
  { label: "Automations", icon: Workflow, href: "/automations" },
  { label: "Skills", icon: Blocks, href: "/skills" },
  { label: "Tools", icon: Box, href: "/tools" },
  { label: "CLI", icon: Terminal, href: "/cli" },
];

const bottomNav = [
  // { label: "Notifications", icon: Bell },
  { label: "Account", icon: User, href: "/account" },
  // { label: "Upgrade", icon: ArrowUpRight },
  // { label: "Install", icon: Download },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  activeSessionId?: string | null;
  onDeleteSession?: (id: string) => void;
  onNewAgent?: () => void;
  onSelectSession?: (id: string) => void;
};

export function AppSidebar({
  activeSessionId,
  onDeleteSession,
  onNewAgent,
  onSelectSession,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  const handleNewAgent = () => {
    onNewAgent?.();
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Luchor" className="overflow-visible">
              <Image
                src="/assets/logo.svg"
                alt="Luchor"
                width={20}
                height={20}
                className="!h-5 !min-h-5 !w-5 !min-w-5 shrink-0"
              />
              <span className="font-bold">Luchor</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleNewAgent} tooltip="New Agent">
                  <CirclePlus />
                  <span>New Agent</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveRoute(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <TaskHistory
          activeSessionId={activeSessionId}
          onDeleteSession={onDeleteSession}
          onSelectSession={onSelectSession}
        />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActiveRoute(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
