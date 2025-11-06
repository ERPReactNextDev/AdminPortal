"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "../components/nav-main"
import { NavProjects } from "../components/nav-projects"
import { NavSecondary } from "../components/nav-secondary"
import { NavUser } from "../components/nav-user"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userId: string | null
}

export function AppSidebar({ userId, ...props }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userDetails, setUserDetails] = React.useState({
    UserId: "",
    Firstname: "",
    Lastname: "",
    Email: "",
    profilePicture: "",
    ReferenceID: "",
  })

  // Fetch user details
  React.useEffect(() => {
    if (!userId) return
    const fetchUserDetails = async () => {
      try {
        const res = await fetch(`/api/user?id=${encodeURIComponent(userId)}`)
        if (!res.ok) throw new Error("Failed to fetch user details")
        const data = await res.json()
        setUserDetails({
          UserId: data._id || userId,
          Firstname: data.Firstname || "Leroux",
          Lastname: data.Lastname || "Xchire",
          Email: data.Email || "example@email.com",
          profilePicture: data.profilePicture || "/avatars/default.jpg",
          ReferenceID: data.ReferenceID || "N/A",
        })
      } catch (err) {
        console.error(err)
      }
    }
    fetchUserDetails()
  }, [userId])

  // Original static sidebar data
  const appendUserId = (url: string) => {
    if (!userId) return url
    return url.includes("?") ? `${url}&userId=${userId}` : `${url}?userId=${userId}`
  }

  const data = {
    user: {
      name: `${userDetails.Firstname} ${userDetails.Lastname}`,
      email: userDetails.Email,
      avatar: userDetails.profilePicture,
    },
    navMain: [
      {
        title: "Applications",
        url: "#",
        icon: SquareTerminal,
        isActive: pathname?.startsWith("/application"),
        items: [{ title: "Modules", url: appendUserId("/application/modules") }],
      },
      {
        title: "CloudFlare",
        url: "#",
        icon: Bot,
        isActive: pathname?.startsWith("/cloudflare"),
        items: [
          { title: "DNS", url: appendUserId("/cloudflare/dns") },
        ],
      },
      {
        title: "User Accounts",
        url: "#",
        icon: BookOpen,
        isActive: pathname?.startsWith("/admin"),
        items: [
          { title: "Roles", url: appendUserId("/admin/roles") },
          { title: "Sessions", url: appendUserId("/admin/sessions") },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        isActive: pathname?.startsWith("/settings"),
        items: [{ title: "General", url: appendUserId("/settings/general") }],
      },
    ],
    navSecondary: [
      { title: "Support", url: appendUserId("/support"), icon: LifeBuoy, isActive: pathname?.startsWith("/support") },
      { title: "Feedback", url: appendUserId("/feedback"), icon: Send, isActive: pathname?.startsWith("/feedback") },
    ],
    projects: [
      { name: "Taskflow Sales Management System", url: appendUserId("/taskflow"), icon: Frame },
      { name: "Ecodesk Ticketing System", url: appendUserId("/ecodesk"), icon: PieChart },
      { name: "Acculog HR Attendance System", url: appendUserId("/acculog"), icon: Frame },
      { name: "IT Ticketing System", url: appendUserId("/it-ticketing"), icon: Frame },
      { name: "IT Asset Management System", url: appendUserId("/it-asset"), icon: Frame },
      { name: "Linker X Sharing Links Platform", url: appendUserId("/linker-x"), icon: Frame },
      { name: "Shifts Room Reservation System", url: appendUserId("/shifts-room"), icon: Frame },
    ],
  }

  const goToPage = (url: string) => {
    if (!userId) return
    router.push(`${url}?userId=${userId}`)
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a onClick={() => goToPage("/dashboard")}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/xchire-logo.png" alt="Xchire Logo" className="w-4 h-4 object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">IT Portal</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={data.navMain.map((item) => ({
            ...item,
            onClick: () => goToPage(item.items?.[0]?.url || item.url), // click sa parent => first child o url
          }))}
        />
        <NavProjects
          projects={data.projects.map((p) => ({
            ...p,
            onClick: () => goToPage(p.url),
          }))}
        />
        <NavSecondary
          items={data.navSecondary.map((item) => ({
            ...item,
            onClick: () => goToPage(item.url),
          }))}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            id: userDetails.UserId || undefined,
            name: `${userDetails.Firstname} ${userDetails.Lastname}`,
            email: userDetails.Email,
            avatar: userDetails.profilePicture,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
