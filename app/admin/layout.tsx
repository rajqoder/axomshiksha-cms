import { AdminSidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div id="admin-layout" className="fixed inset-0 top-[64px] flex overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 p-8 bg-gray-50 dark:bg-black/20 overflow-y-auto h-full">
                {children}
            </main>
        </div>
    );
}
