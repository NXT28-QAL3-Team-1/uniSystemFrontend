import { useState, useEffect } from "react";
import { Plus, Calendar, CheckCircle, XCircle, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { sectionsService } from "@/services/api";
import AddScheduleModal from "@/components/modals/AddScheduleModal";

interface Section {
    id: string;
    code: string;
    capacity: number;
    course: {
        code: string;
        nameAr: string;
    };
    term: {
        name: string;
        type: string;
    };
    faculty: {
        nameAr: string;
    } | null;
    schedules?: {
        id: string;
        day: string;
        startTime: string;
        endTime: string;
        room: string | null;
    }[];
}

const daysMap: Record<string, string> = {
    "0": "الأحد",
    "1": "الاثنين",
    "2": "الثلاثاء",
    "3": "الأربعاء",
    "4": "الخميس",
    "5": "الجمعة",
    "6": "السبت",
};

export default function SchedulesManagementPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<Section | null>(
        null
    );

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const response = await sectionsService.getAll({ limit: 1000 });
            if (response.success) {
                setSections(response.data.sections || []);
            }
        } catch (error) {
            console.error("Error fetching sections:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSchedule = async (
        sectionId: string,
        scheduleId: string
    ) => {
        if (!confirm("هل أنت متأكد من حذف هذا الموعد؟")) return;

        try {
            await sectionsService.deleteSchedule(sectionId, scheduleId);
            await fetchSections();
        } catch (error) {
            console.error("Error deleting schedule:", error);
            alert("فشل حذف الموعد");
        }
    };

    const filteredSections = sections.filter(
        (section) =>
            section.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.course.code
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            section.course.nameAr.includes(searchTerm)
    );

    const sectionsWithSchedules = filteredSections.filter(
        (s) => s.schedules && s.schedules.length > 0
    );
    const sectionsWithoutSchedules = filteredSections.filter(
        (s) => !s.schedules || s.schedules.length === 0
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            إدارة المواعيد
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            إضافة وإدارة مواعيد الشعب الدراسية
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                إجمالي الشعب
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {filteredSections.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                في الفصل الدراسي
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                لها مواعيد
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {sectionsWithSchedules.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {sectionsWithSchedules.length > 0
                                    ? `${(
                                          (sectionsWithSchedules.length /
                                              filteredSections.length) *
                                          100
                                      ).toFixed(0)}% من الشعب`
                                    : "لا توجد شعب بمواعيد"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                بدون مواعيد
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {sectionsWithoutSchedules.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                تحتاج إلى إضافة مواعيد
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>البحث والتصفية</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="ابحث عن شعبة أو مادة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md"
                        />
                    </CardContent>
                </Card>

                {/* Sections Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>الشعب والمواعيد</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                جاري التحميل...
                            </div>
                        ) : filteredSections.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                لا توجد شعب
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>رمز الشعبة</TableHead>
                                        <TableHead>المادة</TableHead>
                                        <TableHead>الفصل الدراسي</TableHead>
                                        <TableHead>المدرس</TableHead>
                                        <TableHead>المواعيد</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead className="text-end">
                                            إجراءات
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSections.map((section) => (
                                        <TableRow key={section.id}>
                                            <TableCell className="font-medium">
                                                {section.code}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {section.course.nameAr}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {section.course.code}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {section.term.name}
                                            </TableCell>
                                            <TableCell>
                                                {section.faculty?.nameAr ||
                                                    "غير محدد"}
                                            </TableCell>
                                            <TableCell>
                                                {section.schedules &&
                                                section.schedules.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {section.schedules.map(
                                                            (schedule) => (
                                                                <div
                                                                    key={
                                                                        schedule.id
                                                                    }
                                                                    className="flex items-center gap-2 text-sm">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-xs">
                                                                        {
                                                                            daysMap[
                                                                                schedule
                                                                                    .day
                                                                            ]
                                                                        }
                                                                    </Badge>
                                                                    <span className="font-mono text-xs">
                                                                        {
                                                                            schedule.startTime
                                                                        }
                                                                        -
                                                                        {
                                                                            schedule.endTime
                                                                        }
                                                                    </span>
                                                                    {schedule.room && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            (
                                                                            {
                                                                                schedule.room
                                                                            }
                                                                            )
                                                                        </span>
                                                                    )}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() =>
                                                                            handleDeleteSchedule(
                                                                                section.id,
                                                                                schedule.id
                                                                            )
                                                                        }>
                                                                        <Trash2 className="h-3 w-3 text-red-600" />
                                                                    </Button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        لا توجد مواعيد
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {section.schedules &&
                                                section.schedules.length > 0 ? (
                                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                                        <CheckCircle className="w-3 h-3 ml-1" />
                                                        مكتمل
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-800 border-red-200">
                                                        <XCircle className="w-3 h-3 ml-1" />
                                                        ناقص
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedSection(
                                                            section
                                                        );
                                                        setModalOpen(true);
                                                    }}>
                                                    <Plus className="w-4 h-4 ml-1" />
                                                    إضافة موعد
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AddScheduleModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedSection(null);
                }}
                onSuccess={fetchSections}
                section={selectedSection}
            />
        </DashboardLayout>
    );
}
