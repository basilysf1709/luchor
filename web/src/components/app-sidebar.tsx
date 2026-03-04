"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlignLeft,
  User,
  PanelLeft,
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

const mainNav = [
  { label: "Library", icon: AlignLeft, href: "/" },
  // { label: "Discover", icon: Compass },
  // { label: "Spaces", icon: Monitor },
  // { label: "Finance", icon: TrendingUp },
  // { label: "More", icon: MoreHorizontal },
];

const bottomNav = [
  // { label: "Notifications", icon: Bell },
  { label: "Account", icon: User, href: "/account" },
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
  const pathname = usePathname();

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
          <SidebarMenuItem>
            <SidebarToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
