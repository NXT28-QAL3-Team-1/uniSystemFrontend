import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import {
    FileSpreadsheet,
    FileText,
    TrendingUp,
    Users,
    BarChart3,
    Calendar,
    Award,
    AlertCircle,
    Loader2,
    BookOpen,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import {
    facultyService,
    sectionsService,
    enrollmentsService,
} from "@/services/api";
import { toast } from "sonner";

interface GradeDistribution {
    grade: string;
    count: number;
    percentage: number;
}

interface StudentData {
    studentCode: string;
    nameAr: string;
    attendance: number;
    grade: string | null;
    total: number | null;
    status: "excellent" | "good" | "warning" | "danger";
}

interface SectionData {
    id: string;
    sectionNumber: string;
    course: {
        code: string;
        nameAr: string;
        nameEn: string;
    };
    term: {
        name: string;
    };
}

const COLORS = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
];
const GRADE_COLORS: Record<string, string> = {
    "A+": "#10b981",
    A: "#22c55e",
    "B+": "#3b82f6",
    B: "#60a5fa",
    "C+": "#f59e0b",
    C: "#fbbf24",
    "D+": "#f97316",
    D: "#fb923c",
    F: "#ef4444",
};

export default function FacultyReportsPage() {
    const { t, i18n } = useTranslation();
    const { user } = useAuthStore();
    const isArabic = i18n.language === "ar";
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [facultyId, setFacultyId] = useState<string | null>(null);
    const [sections, setSections] = useState<SectionData[]>([]);
    const [selectedSection, setSelectedSection] = useState<string>("");
    const [gradesData, setGradesData] = useState<{
        distribution: GradeDistribution[];
        stats: {
            average: number;
            highest: number;
            lowest: number;
            passRate: number;
        };
    }>({
        distribution: [],
        stats: { average: 0, highest: 0, lowest: 0, passRate: 0 },
    });
    const [attendanceData, setAttendanceData] = useState<{
        byDate: any[];
        stats: {
            average: number;
            totalSessions: number;
            totalStudents: number;
        };
    }>({
        byDate: [],
        stats: { average: 0, totalSessions: 0, totalStudents: 0 },
    });
    const [studentsData, setStudentsData] = useState<StudentData[]>([]);

    // First, get the faculty ID
    useEffect(() => {
        const fetchFacultyId = async () => {
            try {
                if (!user?.id) return;

                console.log("🔍 Fetching faculty ID for user:", user.id);
                const facultyResponse = await facultyService.getAll();

                if (facultyResponse.success) {
                    const allFaculty =
                        facultyResponse.data?.faculty ||
                        facultyResponse.data ||
                        [];
                    const currentFaculty = allFaculty.find(
                        (f: any) => f.userId === user.id
                    );

                    if (currentFaculty) {
                        console.log("✅ Found faculty ID:", currentFaculty.id);
                        setFacultyId(currentFaculty.id);
                    } else {
                        console.warn("⚠️ No faculty record found for user");
                        toast.error("Faculty record not found");
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error("❌ Error fetching faculty ID:", error);
                toast.error("Failed to fetch faculty information");
                setLoading(false);
            }
        };

        fetchFacultyId();
    }, [user?.id]);

    // Load faculty sections after we have the faculty ID
    useEffect(() => {
        if (!facultyId) return;

        const loadSections = async () => {
            try {
                console.log("📚 Loading sections for faculty:", facultyId);
                const response = await facultyService.getSections(facultyId);
                if (response.success && response.data?.sections) {
                    console.log(
                        "✅ Loaded sections:",
                        response.data.sections.length
                    );
                    setSections(response.data.sections);
                    if (response.data.sections.length > 0) {
                        setSelectedSection(response.data.sections[0].id);
                    }
                }
            } catch (error: any) {
                console.error("❌ Error loading sections:", error);
                toast.error(
                    error.response?.data?.message || "Failed to load sections"
                );
            } finally {
                setLoading(false);
            }
        };

        loadSections();
    }, [facultyId]);

    // Load section data when section changes
    useEffect(() => {
        if (!selectedSection) {
            console.log("⚠️ No section selected yet");
            return;
        }

        console.log("🔄 Section changed, loading data for:", selectedSection);
        const loadSectionData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    loadGradesData(),
                    loadAttendanceData(),
                    loadStudentsData(),
                ]);
                console.log("✅ All section data loaded");
            } catch (error) {
                console.error("❌ Error loading section data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadSectionData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSection]);

    const loadGradesData = async () => {
        try {
            console.log("📊 Loading grades for section:", selectedSection);
            const response = await enrollmentsService.getBySectionId(
                selectedSection
            );
            console.log("📊 Enrollments response:", response);

            // The API returns enrollments in response.data
            const enrollments = response.data || response.enrollments || [];

            if (!enrollments || enrollments.length === 0) {
                console.warn("⚠️ No enrollments data found");
                return;
            }

            console.log("📊 Processing enrollments:", enrollments.length);
            console.log("📊 First enrollment sample:", enrollments[0]);
            console.log(
                "📊 Enrollment keys:",
                Object.keys(enrollments[0] || {})
            );

            const grades: Record<string, number> = {};
            let totalGrade = 0;
            let gradeCount = 0;
            let highest = 0;
            let lowest = 100;
            let passCount = 0;

            for (const enrollment of enrollments) {
                // Check if grades exist in different possible locations
                const finalGrade =
                    enrollment.finalGrade || enrollment.grade || null;
                console.log("📊 Checking enrollment:", {
                    enrollmentId: enrollment.id,
                    hasFinalGrade: !!finalGrade,
                    finalGrade: finalGrade,
                    hasGrade: !!enrollment.grade,
                    grade: enrollment.grade,
                });

                if (finalGrade?.letterGrade || finalGrade?.letter) {
                    const letterGrade =
                        finalGrade.letterGrade || finalGrade.letter;
                    grades[letterGrade] = (grades[letterGrade] || 0) + 1;

                    const total =
                        finalGrade.total || finalGrade.totalScore || 0;
                    if (total !== null && total > 0) {
                        totalGrade += total;
                        gradeCount++;
                        highest = Math.max(highest, total);
                        lowest = Math.min(lowest, total);

                        if (total >= 50) {
                            passCount++;
                        }
                    }
                }
            }

            console.log("📊 Grades summary:", {
                gradesCount: Object.keys(grades).length,
                grades,
                gradeCount,
                totalStudents: enrollments.length,
            });

            const totalStudents = enrollments.length;

            // If no grades found, still set the data with empty distribution
            if (Object.keys(grades).length === 0) {
                console.warn(
                    "⚠️ No grades have been entered for this section yet"
                );
                setGradesData({
                    distribution: [],
                    stats: {
                        average: 0,
                        highest: 0,
                        lowest: 0,
                        passRate: 0,
                    },
                });
                return;
            }

            const distribution = Object.entries(grades).map(
                ([grade, count]) => ({
                    grade,
                    count,
                    percentage:
                        totalStudents > 0 ? (count / totalStudents) * 100 : 0,
                })
            );

            // Sort by grade
            const gradeOrder = [
                "A+",
                "A",
                "B+",
                "B",
                "C+",
                "C",
                "D+",
                "D",
                "F",
            ];
            distribution.sort((a, b) => {
                const indexA = gradeOrder.indexOf(a.grade);
                const indexB = gradeOrder.indexOf(b.grade);
                return (
                    (indexA === -1 ? 999 : indexA) -
                    (indexB === -1 ? 999 : indexB)
                );
            });

            setGradesData({
                distribution,
                stats: {
                    average: gradeCount > 0 ? totalGrade / gradeCount : 0,
                    highest: gradeCount > 0 ? highest : 0,
                    lowest: gradeCount > 0 ? lowest : 0,
                    passRate:
                        gradeCount > 0 ? (passCount / gradeCount) * 100 : 0,
                },
            });
        } catch (error: any) {
            console.error("Error loading grades:", error);
        }
    };

    const loadAttendanceData = async () => {
        try {
            console.log("📅 Loading attendance for section:", selectedSection);
            const response = await sectionsService.getSectionAttendance(
                selectedSection
            );
            console.log("📅 Attendance response:", response);

            // The API returns data in response.data (which is an array)
            const attendanceRecords = response.data || [];
            if (!attendanceRecords || attendanceRecords.length === 0) {
                console.warn("⚠️ No attendance records found");
                return;
            }
            console.log(
                "📅 Processing attendance records:",
                attendanceRecords.length
            );

            const attendanceByDate: Record<
                string,
                { present: number; total: number }
            > = {};
            let totalPresent = 0;
            let totalRecords = 0;

            // Process all enrollment-attendance records
            for (const record of attendanceRecords) {
                // Handle multiple attendance records per enrollment
                const attendances = Array.isArray(record.attendance)
                    ? record.attendance
                    : record.attendance
                    ? [record.attendance]
                    : [];

                for (const att of attendances) {
                    const date = new Date(att.sessionDate).toLocaleDateString(
                        "ar-EG"
                    );
                    if (!attendanceByDate[date]) {
                        attendanceByDate[date] = { present: 0, total: 0 };
                    }
                    attendanceByDate[date].total++;
                    totalRecords++;

                    if (att.status === "PRESENT") {
                        attendanceByDate[date].present++;
                        totalPresent++;
                    }
                }
            }

            const byDate = Object.entries(attendanceByDate)
                .map(([date, data]) => ({
                    date,
                    attendance:
                        data.total > 0 ? (data.present / data.total) * 100 : 0,
                    present: data.present,
                    absent: data.total - data.present,
                }))
                .sort(
                    (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                );

            setAttendanceData({
                byDate,
                stats: {
                    average:
                        totalRecords > 0
                            ? (totalPresent / totalRecords) * 100
                            : 0,
                    totalSessions: Object.keys(attendanceByDate).length,
                    totalStudents: attendanceRecords.length,
                },
            });
        } catch (error: any) {
            console.error("Error loading attendance:", error);
            toast.error("Failed to load attendance data");
        }
    };

    const loadStudentsData = async () => {
        try {
            console.log("👨‍🎓 Loading students for section:", selectedSection);
            const response = await enrollmentsService.getBySectionId(
                selectedSection
            );
            console.log("👨‍🎓 Students response:", response);

            // The API returns enrollments in response.data
            const enrollments = response.data || response.enrollments || [];

            if (!enrollments || enrollments.length === 0) {
                console.warn("⚠️ No enrollment data found");
                return;
            }
            console.log("👨‍🎓 Processing students:", enrollments.length);

            const students: StudentData[] = enrollments.map(
                (enrollment: any) => {
                    const attendanceRate =
                        enrollment.attendances?.length > 0
                            ? (enrollment.attendances.filter(
                                  (a: any) => a.status === "PRESENT"
                              ).length /
                                  enrollment.attendances.length) *
                              100
                            : 0;

                    let status: "excellent" | "good" | "warning" | "danger" =
                        "good";
                    const total = enrollment.finalGrade?.total || 0;

                    if (total >= 85 && attendanceRate >= 90)
                        status = "excellent";
                    else if (total >= 70 && attendanceRate >= 75)
                        status = "good";
                    else if (total >= 50 || attendanceRate >= 60)
                        status = "warning";
                    else status = "danger";

                    return {
                        studentCode: enrollment.student.studentCode,
                        nameAr: enrollment.student.nameAr,
                        attendance: Math.round(attendanceRate),
                        grade: enrollment.finalGrade?.letterGrade || null,
                        total: enrollment.finalGrade?.total || null,
                        status,
                    };
                }
            );

            console.log("👨‍🎓 Students data to set:", students);
            console.log("👨‍🎓 Students count:", students.length);
            setStudentsData(students);
        } catch (error: any) {
            console.error("Error loading students:", error);
        }
    };

    const exportToExcel = () => {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";

        if (activeTab === "grades") {
            csvContent += "Grade,Count,Percentage\n";
            gradesData.distribution.forEach((row) => {
                csvContent += `${row.grade},${
                    row.count
                },${row.percentage.toFixed(1)}%\n`;
            });
        } else if (activeTab === "attendance") {
            csvContent += "Date,Attendance Rate,Present,Absent\n";
            attendanceData.byDate.forEach((row) => {
                csvContent += `${row.date},${row.attendance.toFixed(1)}%,${
                    row.present
                },${row.absent}\n`;
            });
        } else if (activeTab === "students") {
            csvContent += "Student Code,Name,Attendance,Grade,Total,Status\n";
            studentsData.forEach((row) => {
                csvContent += `${row.studentCode},${row.nameAr},${
                    row.attendance
                }%,${row.grade || "N/A"},${row.total || "N/A"},${row.status}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `faculty_report_${activeTab}_${
                new Date().toISOString().split("T")[0]
            }.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        window.print();
    };

    if (loading && sections.length === 0) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
                        <p className="text-gray-600 dark:text-gray-400">
                            {t(
                                "facultyReports.loadingReports",
                                "Loading reports..."
                            )}
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (sections.length === 0) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="p-8 text-center">
                        <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">
                            {t(
                                "facultyReports.noSectionsAssigned",
                                "No Sections Assigned"
                            )}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t(
                                "facultyReports.noSectionsAssignedDesc",
                                "You don't have any sections assigned yet. Please contact the administrator."
                            )}
                        </p>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            📊 {t("facultyReports.title", "Faculty Reports")}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {t(
                                "facultyReports.subtitle",
                                "View comprehensive analytics and insights for your courses"
                            )}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={exportToExcel}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loading}>
                            <FileSpreadsheet
                                className={`w-4 h-4 ${
                                    isArabic ? "ml-2" : "mr-2"
                                }`}
                            />
                            {t("facultyReports.exportCSV", "Export CSV")}
                        </Button>
                        <Button
                            onClick={exportToPDF}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}>
                            <FileText
                                className={`w-4 h-4 ${
                                    isArabic ? "ml-2" : "mr-2"
                                }`}
                            />
                            {t("facultyReports.print", "Print")}
                        </Button>
                    </div>
                </div>

                {/* Section Selector */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <select
                                value={selectedSection}
                                onChange={(e) =>
                                    setSelectedSection(e.target.value)
                                }
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500">
                                {sections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        {section.course.code} -{" "}
                                        {section.course.nameAr} (
                                        {t("facultyReports.section", "Section")}{" "}
                                        {section.sectionNumber}) -{" "}
                                        {section.term.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="z">
                    <TabsList className="grid grid-cols-4 w-full justify-start gap-2 mb-4">
                        <TabsTrigger value="overview">
                            <TrendingUp
                                className={`w-4 h-4 ${
                                    isArabic ? "ml-2" : "mr-2"
                                }`}
                            />
                            {t("facultyReports.overview", "Overview")}
                        </TabsTrigger>
                        <TabsTrigger value="grades">
                            <BarChart3
                                className={`w-4 h-4 ${
                                    isArabic ? "ml-2" : "mr-2"
                                }`}
                            />
                            {t("facultyReports.grades", "Grades")}
                        </TabsTrigger>
                        <TabsTrigger value="attendance">
                            <Calendar
                                className={`w-4 h-4 ${
                                    isArabic ? "ml-2" : "mr-2"
                                }`}
                            />
                            {t("facultyReports.attendance", "Attendance")}
                        </TabsTrigger>
                        <TabsTrigger value="students">
                            <Users
                                className={`w-4 h-4 ${
                                    isArabic ? "ml-2" : "mr-2"
                                }`}
                            />
                            {t("facultyReports.students", "Students")}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.totalStudents",
                                                    "Total Students"
                                                )}
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {studentsData.length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                            <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.averageGrade",
                                                    "Average Grade"
                                                )}
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {gradesData.stats.average.toFixed(
                                                    1
                                                )}
                                                %
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.avgAttendance",
                                                    "Avg Attendance"
                                                )}
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {attendanceData.stats.average.toFixed(
                                                    1
                                                )}
                                                %
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                            <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.passRate",
                                                    "Pass Rate"
                                                )}
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {gradesData.stats.passRate.toFixed(
                                                    1
                                                )}
                                                %
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Grade Distribution Pie Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        {t(
                                            "facultyReports.gradeDistributionChart",
                                            "Grade Distribution"
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {gradesData.distribution.length > 0 ? (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={
                                                        gradesData.distribution as any
                                                    }
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={(entry: any) =>
                                                        `${
                                                            entry.grade
                                                        }: ${entry.percentage.toFixed(
                                                            0
                                                        )}%`
                                                    }
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="count">
                                                    {gradesData.distribution.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    GRADE_COLORS[
                                                                        entry
                                                                            .grade
                                                                    ] ||
                                                                    COLORS[
                                                                        index %
                                                                            COLORS.length
                                                                    ]
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-gray-400">
                                            {t(
                                                "facultyReports.noGradeDataAvailable",
                                                "No grade data available"
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Attendance Trend */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        {t(
                                            "facultyReports.attendanceTrendChart",
                                            "Attendance Trend"
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {attendanceData.byDate.length > 0 ? (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}>
                                            <AreaChart
                                                data={attendanceData.byDate}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Area
                                                    type="monotone"
                                                    dataKey="attendance"
                                                    stroke="#8b5cf6"
                                                    fill="#8b5cf6"
                                                    fillOpacity={0.6}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-gray-400">
                                            {t(
                                                "facultyReports.noAttendanceDataAvailable",
                                                "No attendance data available"
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Student Status Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {t(
                                        "facultyReports.studentPerformanceStatus",
                                        "Student Performance Status"
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="text-sm text-green-700 dark:text-green-300 mb-1">
                                            {t(
                                                "facultyReports.statusLabels.excellent",
                                                "Excellent"
                                            )}
                                        </div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {
                                                studentsData.filter(
                                                    (s) =>
                                                        s.status === "excellent"
                                                ).length
                                            }
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                            {studentsData.length > 0
                                                ? (
                                                      (studentsData.filter(
                                                          (s) =>
                                                              s.status ===
                                                              "excellent"
                                                      ).length /
                                                          studentsData.length) *
                                                      100
                                                  ).toFixed(0)
                                                : 0}
                                            %
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                                            {t(
                                                "facultyReports.statusLabels.good",
                                                "Good"
                                            )}
                                        </div>
                                        <div className="text-3xl font-bold text-blue-600">
                                            {
                                                studentsData.filter(
                                                    (s) => s.status === "good"
                                                ).length
                                            }
                                        </div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            {studentsData.length > 0
                                                ? (
                                                      (studentsData.filter(
                                                          (s) =>
                                                              s.status ===
                                                              "good"
                                                      ).length /
                                                          studentsData.length) *
                                                      100
                                                  ).toFixed(0)
                                                : 0}
                                            %
                                        </div>
                                    </div>

                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                        <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">
                                            {t(
                                                "facultyReports.statusLabels.warning",
                                                "Warning"
                                            )}
                                        </div>
                                        <div className="text-3xl font-bold text-yellow-600">
                                            {
                                                studentsData.filter(
                                                    (s) =>
                                                        s.status === "warning"
                                                ).length
                                            }
                                        </div>
                                        <div className="text-xs text-yellow-600 mt-1">
                                            {studentsData.length > 0
                                                ? (
                                                      (studentsData.filter(
                                                          (s) =>
                                                              s.status ===
                                                              "warning"
                                                      ).length /
                                                          studentsData.length) *
                                                      100
                                                  ).toFixed(0)
                                                : 0}
                                            %
                                        </div>
                                    </div>

                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <div className="text-sm text-red-700 dark:text-red-300 mb-1">
                                            {t(
                                                "facultyReports.statusLabels.atRisk",
                                                "At Risk"
                                            )}
                                        </div>
                                        <div className="text-3xl font-bold text-red-600">
                                            {
                                                studentsData.filter(
                                                    (s) => s.status === "danger"
                                                ).length
                                            }
                                        </div>
                                        <div className="text-xs text-red-600 mt-1">
                                            {studentsData.length > 0
                                                ? (
                                                      (studentsData.filter(
                                                          (s) =>
                                                              s.status ===
                                                              "danger"
                                                      ).length /
                                                          studentsData.length) *
                                                      100
                                                  ).toFixed(0)
                                                : 0}
                                            %
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Grades Report */}
                    <TabsContent value="grades" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <TrendingUp className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.average",
                                                    "Average"
                                                )}
                                            </div>
                                            <div className="text-2xl font-bold text-blue-600">
                                                {gradesData.stats.average.toFixed(
                                                    1
                                                )}
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                            <Award className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.highest",
                                                    "Highest"
                                                )}
                                            </div>
                                            <div className="text-2xl font-bold text-purple-600">
                                                {gradesData.stats.highest.toFixed(
                                                    1
                                                )}
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                            <AlertCircle className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.lowest",
                                                    "Lowest"
                                                )}
                                            </div>
                                            <div className="text-2xl font-bold text-orange-600">
                                                {gradesData.stats.lowest.toFixed(
                                                    1
                                                )}
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                            <Award className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.passRate",
                                                    "Pass Rate"
                                                )}
                                            </div>
                                            <div className="text-2xl font-bold text-green-600">
                                                {gradesData.stats.passRate.toFixed(
                                                    1
                                                )}
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        {t(
                                            "facultyReports.gradeDistributionBarChart",
                                            "Grade Distribution (Bar Chart)"
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {gradesData.distribution.length > 0 ? (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}>
                                            <BarChart
                                                data={
                                                    gradesData.distribution as any
                                                }>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="grade" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar
                                                    dataKey="count"
                                                    fill="#3b82f6"
                                                    radius={[8, 8, 0, 0]}>
                                                    {gradesData.distribution.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    GRADE_COLORS[
                                                                        entry
                                                                            .grade
                                                                    ] ||
                                                                    COLORS[
                                                                        index %
                                                                            COLORS.length
                                                                    ]
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-gray-400">
                                            {t(
                                                "facultyReports.noDataAvailable",
                                                "No data available"
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        {t(
                                            "facultyReports.gradePercentageDistribution",
                                            "Grade Percentage Distribution"
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {gradesData.distribution.length > 0 ? (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}>
                                            <BarChart
                                                data={
                                                    gradesData.distribution as any
                                                }>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="grade" />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value: any) =>
                                                        `${value.toFixed(1)}%`
                                                    }
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="percentage"
                                                    fill="#8b5cf6"
                                                    radius={[8, 8, 0, 0]}
                                                    name="Percentage"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-gray-400">
                                            {t(
                                                "facultyReports.noDataAvailable",
                                                "No data available"
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t("facultyReports.distributionTable")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">
                                                    {t("facultyReports.grade")}
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">
                                                    {t("facultyReports.count")}
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.percentage"
                                                    )}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {gradesData.distribution.map(
                                                (item) => (
                                                    <tr
                                                        key={item.grade}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 font-medium">
                                                            {item.grade}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {item.count}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {item.percentage}%
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Attendance Report */}
                    <TabsContent value="attendance" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <Calendar className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.avgAttendance",
                                                    "Avg Attendance"
                                                )}
                                            </div>
                                            <div className="text-2xl font-bold text-blue-600">
                                                {attendanceData.stats.average.toFixed(
                                                    1
                                                )}
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                            <BookOpen className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.sessions",
                                                    "Sessions"
                                                )}
                                            </div>
                                            <div className="text-2xl font-bold text-green-600">
                                                {
                                                    attendanceData.stats
                                                        .totalSessions
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                            <Users className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.students",
                                                    "Students"
                                                )}
                                            </div>
                                            <div className="text-2xl font-bold text-purple-600">
                                                {
                                                    attendanceData.stats
                                                        .totalStudents
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    {t(
                                        "facultyReports.attendanceOverTime",
                                        "Attendance Over Time"
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {attendanceData.byDate.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height={350}>
                                        <BarChart
                                            data={attendanceData.byDate as any}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="present"
                                                fill="#10b981"
                                                name="Present"
                                                radius={[8, 8, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="absent"
                                                fill="#ef4444"
                                                name="Absent"
                                                radius={[8, 8, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-[350px] text-gray-400">
                                        {t(
                                            "facultyReports.noAttendanceDataAvailable",
                                            "No attendance data available"
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Progress Bars */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t(
                                        "facultyReports.attendanceBySession",
                                        "Attendance by Session"
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {attendanceData.byDate
                                        .slice(0, 10)
                                        .map((item) => (
                                            <div
                                                key={item.date}
                                                className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">
                                                        {item.date}
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {item.attendance.toFixed(
                                                            1
                                                        )}
                                                        % ({item.present}/
                                                        {item.present +
                                                            item.absent}
                                                        )
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-500 ${
                                                            item.attendance >=
                                                            90
                                                                ? "bg-linear-to-r from-green-500 to-emerald-500"
                                                                : item.attendance >=
                                                                  75
                                                                ? "bg-linear-to-r from-yellow-500 to-orange-500"
                                                                : "bg-linear-to-r from-red-500 to-pink-500"
                                                        }`}
                                                        style={{
                                                            width: `${item.attendance}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t(
                                        "facultyReports.attendanceDetails",
                                        "Attendance Details"
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.date",
                                                        "Date"
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.present",
                                                        "Present"
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.absent",
                                                        "Absent"
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.rate",
                                                        "Rate"
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.status",
                                                        "Status"
                                                    )}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {attendanceData.byDate.map(
                                                (item, index) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-3 font-medium">
                                                            {item.date}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-green-600 font-semibold">
                                                            {item.present}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-red-600 font-semibold">
                                                            {item.absent}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {item.attendance.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                    item.attendance >=
                                                                    90
                                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                        : item.attendance >=
                                                                          75
                                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                                }`}>
                                                                {item.attendance >=
                                                                90
                                                                    ? t(
                                                                          "facultyReports.statusLabels.excellent",
                                                                          "Excellent"
                                                                      )
                                                                    : item.attendance >=
                                                                      75
                                                                    ? t(
                                                                          "facultyReports.statusLabels.good",
                                                                          "Good"
                                                                      )
                                                                    : t(
                                                                          "facultyReports.poor",
                                                                          "Poor"
                                                                      )}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Students Report */}
                    <TabsContent value="students" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {t(
                                        "facultyReports.studentPerformanceList",
                                        "Student Performance List"
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.studentCode",
                                                        "Student Code"
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.name",
                                                        "Name"
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.total",
                                                        "Total"
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.attendance",
                                                        "Attendance"
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.grade",
                                                        "Grade"
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">
                                                    {t(
                                                        "facultyReports.status",
                                                        "Status"
                                                    )}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {studentsData.map((student) => (
                                                <tr
                                                    key={student.studentCode}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-4 py-3 font-medium">
                                                        {student.studentCode}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {student.nameAr}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {student.total?.toFixed(
                                                            1
                                                        ) || "N/A"}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`font-semibold ${
                                                                student.attendance >=
                                                                75
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }`}>
                                                            {student.attendance}
                                                            %
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-semibold">
                                                            {student.grade ||
                                                                "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                student.status ===
                                                                "excellent"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : student.status ===
                                                                      "good"
                                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                    : student.status ===
                                                                      "warning"
                                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            }`}>
                                                            {t(
                                                                `facultyReports.statusLabels.${
                                                                    student.status ===
                                                                    "danger"
                                                                        ? "atRisk"
                                                                        : student.status
                                                                }`,
                                                                student.status
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    student.status.slice(
                                                                        1
                                                                    )
                                                            )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-8 h-8 text-yellow-500" />
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.statusLabels.excellent"
                                                )}
                                            </div>
                                            <div className="text-xl font-bold">
                                                {
                                                    studentsData.filter(
                                                        (s) =>
                                                            s.status ===
                                                            "excellent"
                                                    ).length
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-8 h-8 text-blue-500" />
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.statusLabels.good"
                                                )}
                                            </div>
                                            <div className="text-xl font-bold">
                                                {
                                                    studentsData.filter(
                                                        (s) =>
                                                            s.status === "good"
                                                    ).length
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-8 h-8 text-orange-500" />
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t(
                                                    "facultyReports.statusLabels.warning"
                                                )}
                                            </div>
                                            <div className="text-xl font-bold">
                                                {
                                                    studentsData.filter(
                                                        (s) =>
                                                            s.status ===
                                                            "warning"
                                                    ).length
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="w-8 h-8 text-green-500" />
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t("facultyReports.total")}
                                            </div>
                                            <div className="text-xl font-bold">
                                                {studentsData.length}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
