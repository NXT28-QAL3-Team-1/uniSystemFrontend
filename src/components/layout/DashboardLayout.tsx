import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ '--sidebar-offset': '0px' } as React.CSSProperties}>
            <Sidebar />
            <Header />
            <main 
                className="mt-16 p-4 sm:p-6 lg:p-6 transition-all duration-300"
                style={{ marginInlineEnd: '0', paddingInlineEnd: '1.5rem' }}>
                <div className="max-w-full overflow-x-hidden lg:mr-64">
                    {children}
                </div>
            </main>
        </div>
    );
}
