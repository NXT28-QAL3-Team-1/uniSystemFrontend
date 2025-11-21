import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import {
    LayoutDashboard,
    Building,
    BookOpen,
    GraduationCap,
    FileText,
    Users,
    UserCog,
    Settings,
    Calendar,
    UserPlus,
    CalendarDays,
    ClipboardList,
    Eye,
    FolderOpen,
    School,
    Clock,
} from "lucide-react";

interface NavItem {
    icon: React.ElementType;
    label: string;
    path: string;
    roles?: string[]; // Optional: which roles can see this item
}

export default function Sidebar() {
    const { t } = useTranslation();
    const location = useLocation();
    const { user } = useAuthStore();

    const navItems: NavItem[] = [
        {
            icon: LayoutDashboard,
            label: t("nav.dashboard"),
            path: "/dashboard",
            roles: ["SUPER_ADMIN", "ADMIN", "FACULTY"],
        },
        // Student-only pages
        {
            icon: LayoutDashboard,
            label: "لوحة التحكم",
            path: "/student/dashboard",
            roles: ["STUDENT"],
        },
        {
            icon: Calendar,
            label: "التسجيل",
            path: "/student/registration",
            roles: ["STUDENT"],
        },
        {
            icon: BookOpen,
            label: "موادي الدراسية",
            path: "/student/subjects",
            roles: ["STUDENT"],
        },
        {
            icon: GraduationCap,
            label: "الدرجات",
            path: "/student/grades",
            roles: ["STUDENT"],
        },
        {
            icon: CalendarDays,
            label: "جدولي الدراسي",
            path: "/student/schedule",
            roles: ["STUDENT"],
        },
        {
            icon: Eye,
            label: "الحضور والغياب",
            path: "/student/attendance",
            roles: ["STUDENT"],
        },
        {
            icon: FolderOpen,
            label: "طلباتي",
            path: "/student/requests",
            roles: ["STUDENT"],
        },
        {
            icon: School,
            label: "اختيار التخصص",
            path: "/student/department-selection",
            roles: ["STUDENT"],
        },
        {
            icon: Settings,
            label: "الإعدادات",
            path: "/student/settings",
            roles: ["STUDENT"],
        },
        // Admin and Faculty pages
        {
            icon: FileText,
            label: t("nav.reports"),
            path: "/reports",
            roles: ["SUPER_ADMIN", "ADMIN", "FACULTY", "TA"],
        },
        {
            icon: ClipboardList,
            label: "طلبات التخصصات",
            path: "/department-applications",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        // Admin-only pages
        {
            icon: Building,
            label: t("nav.departments"),
            path: "/departments",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: BookOpen,
            label: t("nav.courses"),
            path: "/courses",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: FileText,
            label: t("nav.curriculum"),
            path: "/curriculum",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: Users,
            label: t("nav.students"),
            path: "/students",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: UserPlus,
            label: t("nav.batches"),
            path: "/batches",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: Calendar,
            label: t("nav.terms"),
            path: "/terms",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: CalendarDays,
            label: t("nav.sections"),
            path: "/sections",
            roles: ["SUPER_ADMIN", "ADMIN", "FACULTY"],
        },
        {
            icon: Clock,
            label: "إدارة المواعيد",
            path: "/schedules",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: UserCog,
            label: t("nav.faculty"),
            path: "/faculty",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
        {
            icon: Settings,
            label: t("nav.settings"),
            path: "/settings",
            roles: ["SUPER_ADMIN", "ADMIN"],
        },
    ];

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter((item) => {
        if (!item.roles) return true; // No role restriction
        return item.roles.includes(user?.role || "");
    });

    return (
        <aside className="fixed inset-y-0 start-0 z-50 w-64 bg-white dark:bg-gray-800 border-e border-gray-200 dark:border-gray-700 transition-transform">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    جامعتي
                </h1>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
                {filteredNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}>
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
