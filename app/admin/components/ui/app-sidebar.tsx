// app/admin/components/ui/app-sidebar.tsx
import {
    LayoutDashboard,
    UploadCloud,
    Settings,
    LogOut,
    User,
    ChevronRight,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/app/admin/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/app/admin/components/ui/collapsible";

const menuItems = [
    {
        title: "数据分析",
        icon: LayoutDashboard,
        id: "analytics",
    },
    {
        title: "作品管理", // 建议改为管理
        icon: UploadCloud,
        id: "upload",
        items: [
            { title: "作品列表 (All Works)", id: "all-works" },
            { title: "实验库 (Tool Lab)", id: "tool-lab" },
        ],
    },
    {
        title: "首页设置",
        icon: Settings,
        id: "home-settings",
    },
];

export function AppSidebar({ activeTab, setActiveTab }: any) {
    return (
        <Sidebar variant="inset">
            <SidebarHeader className="p-4 font-bold text-xl">
                Admin Panel
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <Collapsible
                            key={item.title}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                {item.items ? (
                                    <>
                                        <CollapsibleTrigger
                                            render={
                                                <SidebarMenuButton
                                                    tooltip={item.title}
                                                >
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            }
                                        />
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items.map((sub) => (
                                                    <SidebarMenuSubItem
                                                        key={sub.id}
                                                    >
                                                        <SidebarMenuSubButton
                                                            onClick={() =>
                                                                setActiveTab(
                                                                    sub.id,
                                                                )
                                                            }
                                                            isActive={
                                                                activeTab ===
                                                                sub.id
                                                            }
                                                        >
                                                            {sub.title}
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </>
                                ) : (
                                    <SidebarMenuButton
                                        onClick={() => setActiveTab(item.id)}
                                        isActive={activeTab === item.id}
                                    >
                                        <item.icon /> <span>{item.title}</span>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        </Collapsible>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2 p-2">
                        <User className="h-8 w-8 rounded-full border p-1" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">
                                Admin User
                            </span>
                            <button
                                onClick={() => {
                                    /* logout */
                                }}
                                className="text-left text-xs text-red-500 hover:underline"
                            >
                                <LogOut className="inline h-3 w-3" /> Log out
                            </button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
