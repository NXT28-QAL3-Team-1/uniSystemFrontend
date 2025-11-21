import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { departmentsService, coursesService } from "@/services/api";
import { Navigate } from "react-router-dom";

interface Stats {
    departments: number;
    courses: number;
    students: number;
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<Stats>({
        departments: 0,
        courses: 0,
        students: 0,
    });
    const [loading, setLoading] = useState(true);

    // Redirect students to their specific dashboard
    if (user?.role === "STUDENT") {
        return <Navigate to="/student/dashboard" replace />;
    }

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [departmentsRes, coursesRes] = await Promise.all([
                departmentsService.getAll(),
                coursesService.getAll(),
            ]);

            const departments =
                departmentsRes?.data?.departments ||
                departmentsRes?.departments ||
                [];
            const courses =
                coursesRes?.data?.courses || coursesRes?.courses || [];

            setStats({
                departments: departments.length,
                courses: courses.length,
                students: 0, // TODO: Add students count when students module is ready
            });
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t("dashboard.title")}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        مرحباً، {user?.email}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        كلية علوم الحاسب - College of Computer Science
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                الأقسام
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? "..." : stats.departments}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                المواد
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? "..." : stats.courses}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                الطلاب
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? "..." : stats.students}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
