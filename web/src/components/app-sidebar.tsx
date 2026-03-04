"use client";

import Image from "next/image";
import {
  AlignLeft,
  User,
  PanelLeft,
} from "lucide-react";

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

const mainNav = [
  { label: "Library", icon: AlignLeft, active: true },
  // { label: "Discover", icon: Compass },
  // { label: "Spaces", icon: Monitor },
  // { label: "Finance", icon: TrendingUp },
  // { label: "More", icon: MoreHorizontal },
];

const bottomNav = [
  // { label: "Notifications", icon: Bell },
  { label: "Account", icon: User },
  // { label: "Upgrade", icon: ArrowUpRight },
  // { label: "Install", icon: Download },
];

function SidebarToggle() {
  const { toggleSidebar } = useSidebar();
  return (
    <SidebarMenuButton onClick={toggleSidebar} tooltip="Toggle sidebar">
      <PanelLeft />
      <span>Collapse</span>
    </SidebarMenuButton>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={item.active}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span
                      className={
                        item.active ? "underline underline-offset-4" : ""
                      }
                    >
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton tooltip={item.label}>
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
