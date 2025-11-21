import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Users,
    BookOpen,
    GraduationCap,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from "lucide-react";

interface TermStatistics {
    termId: string;
    name: string;
    type: "FALL" | "SPRING" | "SUMMER";
    totalSections: number;
    totalRegistrations: number;
    enrolledRegistrations: number;
    waitlistedRegistrations: number;
    droppedRegistrations: number;
    totalCredits: number;
    averageCreditsPerSection: number;
}

interface Section {
    id: string;
    code: string;
    capacity: number;
    enrolledCount: number;
    course: {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
        credits: number;
    };
    faculty: {
        id: string;
        nameEn: string;
        nameAr: string;
    } | null;
    schedules: {
        id: string;
        day: string;
        startTime: string;
        endTime: string;
        room: string | null;
    }[];
}

export default function TermDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState<TermStatistics | null>(null);
    const [sections, setSections] = useState<Section[]>([]);

    useEffect(() => {
        loadTermDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadTermDetails = async () => {
        try {
            setLoading(true);

            // Load term statistics
            const statsResponse = await api.get(`/terms/${id}/stats`);
            setStatistics(statsResponse.data.data);

            // Load term sections
            const sectionsResponse = await api.get(`/sections?termId=${id}`);
            setSections(sectionsResponse.data.data?.sections || []);
        } catch (error: unknown) {
            console.error("Error loading term details:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "فشل تحميل بيانات الفصل الدراسي";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getTermTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            FALL: "خريف",
            SPRING: "ربيع",
            SUMMER: "صيف",
        };
        return labels[type] || type;
    };

    const getTermTypeBadgeColor = (type: string) => {
        const colors: Record<string, string> = {
            FALL: "bg-orange-100 text-orange-800 border-orange-200",
            SPRING: "bg-green-100 text-green-800 border-green-200",
            SUMMER: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
        return colors[type] || "bg-gray-100 text-gray-800";
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<
            string,
            { label: string; className: string; icon: typeof CheckCircle }
        > = {
            OPEN: {
                label: "مفتوح",
                className: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle,
            },
            CLOSED: {
                label: "مغلق",
                className: "bg-red-100 text-red-800 border-red-200",
                icon: XCircle,
            },
            FULL: {
                label: "ممتلئ",
                className: "bg-orange-100 text-orange-800 border-orange-200",
                icon: AlertCircle,
            },
        };

        const badge = badges[status] || badges.OPEN;
        const Icon = badge.icon;

        return (
            <Badge className={badge.className}>
                <Icon className="w-3 h-3 ml-1" />
                {badge.label}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="h-12 w-64 bg-gray-200 animate-pulse rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-32 bg-gray-200 animate-pulse rounded"
                        />
                    ))}
                </div>
                <div className="h-96 bg-gray-200 animate-pulse rounded" />
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="container mx-auto p-6">
                <Button onClick={() => navigate("/terms")} variant="outline">
                    <ArrowLeft className="w-4 h-4 ml-2" />
                    العودة
                </Button>
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">
                        لم يتم العثور على بيانات الفصل الدراسي
                    </p>
                </div>
            </div>
        );
    }

    const enrollmentRate =
        statistics.totalRegistrations > 0
            ? (
                  (statistics.enrolledRegistrations /
                      statistics.totalRegistrations) *
                  100
              ).toFixed(1)
            : "0";

    const averageEnrollmentPerSection =
        statistics.totalSections > 0
            ? (
                  statistics.enrolledRegistrations / statistics.totalSections
              ).toFixed(1)
            : "0";

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => navigate("/terms")}
                        variant="outline"
                        size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            {statistics.name}
                            <Badge
                                className={getTermTypeBadgeColor(
                                    statistics.type
                                )}>
                                {getTermTypeLabel(statistics.type)}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            تفاصيل وإحصائيات الفصل الدراسي
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            إجمالي الشعب
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.totalSections}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            معدل{" "}
                            {statistics.averageCreditsPerSection.toFixed(1)}{" "}
                            ساعة لكل شعبة
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            الطلاب المسجلين
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {statistics.enrolledRegistrations}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {enrollmentRate}% من إجمالي التسجيلات
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            قائمة الانتظار
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {statistics.waitlistedRegistrations}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            في انتظار إتاحة أماكن
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            إجمالي الساعات
                        </CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.totalCredits}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            ساعة معتمدة متاحة
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Enrollment Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        توزيع التسجيلات
                    </CardTitle>
                    <CardDescription>
                        إحصائيات حالات التسجيل في الفصل الدراسي
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    المسجلين
                                </span>
                                <span className="text-2xl font-bold text-green-600">
                                    {statistics.enrolledRegistrations}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${
                                            (statistics.enrolledRegistrations /
                                                statistics.totalRegistrations) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {(
                                    (statistics.enrolledRegistrations /
                                        statistics.totalRegistrations) *
                                    100
                                ).toFixed(1)}
                                % من الإجمالي
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    قائمة الانتظار
                                </span>
                                <span className="text-2xl font-bold text-orange-600">
                                    {statistics.waitlistedRegistrations}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-orange-600 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${
                                            (statistics.waitlistedRegistrations /
                                                statistics.totalRegistrations) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {(
                                    (statistics.waitlistedRegistrations /
                                        statistics.totalRegistrations) *
                                    100
                                ).toFixed(1)}
                                % من الإجمالي
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    المنسحبين
                                </span>
                                <span className="text-2xl font-bold text-red-600">
                                    {statistics.droppedRegistrations}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-red-600 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${
                                            (statistics.droppedRegistrations /
                                                statistics.totalRegistrations) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {(
                                    (statistics.droppedRegistrations /
                                        statistics.totalRegistrations) *
                                    100
                                ).toFixed(1)}
                                % من الإجمالي
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                معدل التسجيل لكل شعبة
                            </span>
                            <span className="text-xl font-bold">
                                {averageEnrollmentPerSection} طالب
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sections Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        شعب الفصل الدراسي
                    </CardTitle>
                    <CardDescription>
                        قائمة جميع الشعب المتاحة ({sections.length} شعبة)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sections.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>لا توجد شعب مسجلة في هذا الفصل الدراسي</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>رقم الشعبة</TableHead>
                                        <TableHead>المقرر</TableHead>
                                        <TableHead>الساعات</TableHead>
                                        <TableHead>المدرس</TableHead>
                                        <TableHead>الجدول</TableHead>
                                        <TableHead>السعة</TableHead>
                                        <TableHead>المسجلين</TableHead>
                                        <TableHead>الحالة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sections.map((section) => {
                                        const enrollmentPercentage =
                                            section.capacity > 0
                                                ? (
                                                      (section.enrolledCount /
                                                          section.capacity) *
                                                      100
                                                  ).toFixed(0)
                                                : "0";

                                        const status =
                                            section.enrolledCount >=
                                            section.capacity
                                                ? "FULL"
                                                : "OPEN";

                                        const scheduleText =
                                            section.schedules.length > 0
                                                ? section.schedules
                                                      .map(
                                                          (s) =>
                                                              `${s.day} ${s.startTime}-${s.endTime}`
                                                      )
                                                      .join(", ")
                                                : "غير محدد";

                                        return (
                                            <TableRow key={section.id}>
                                                <TableCell className="font-medium">
                                                    {section.code}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                section.course
                                                                    .nameAr
                                                            }
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {
                                                                section.course
                                                                    .code
                                                            }
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {section.course.credits}
                                                </TableCell>
                                                <TableCell>
                                                    {section.faculty?.nameAr ||
                                                        "غير محدد"}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {scheduleText}
                                                </TableCell>
                                                <TableCell>
                                                    {section.capacity}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            {
                                                                section.enrolledCount
                                                            }
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            (
                                                            {
                                                                enrollmentPercentage
                                                            }
                                                            %)
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(status)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
