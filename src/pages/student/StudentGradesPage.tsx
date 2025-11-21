import { useState, useEffect } from "react";
import {
    TrendingUp,
    Award,
    BookOpen,
    AlertCircle,
    Download,
    Calendar,
} from "lucide-react";
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
import {
    enrollmentsService,
    studentsService,
    gradesService,
} from "@/services/api";
import { useAuthStore } from "@/store/auth";
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface Grade {
    id: string;
    componentId: string;
    componentName: string;
    score: number;
    maxScore: number;
    weight: number;
}

interface CourseGrade {
    enrollmentId: string;
    sectionId: string;
    courseCode: string;
    courseNameAr: string;
    courseNameEn: string;
    credits: number;
    termId: string;
    termName: string;
    termStatus: "ACTIVE" | "INACTIVE" | "COMPLETED";
    facultyName: string;
    grades: Grade[];
    totalScore: number;
    percentage: number;
    letterGrade: string;
    gradePoint: number;
    isPublished: boolean;
}

interface TermGrades {
    termId: string;
    termName: string;
    termStatus: "ACTIVE" | "INACTIVE" | "COMPLETED";
    courses: CourseGrade[];
    gpa: number;
    credits: number;
}

export default function StudentGradesPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState<any>(null);
    const [allGrades, setAllGrades] = useState<TermGrades[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<
        "current" | "all" | string
    >("current");
    const [filteredGrades, setFilteredGrades] = useState<TermGrades[]>([]);

    useEffect(() => {
        fetchStudentGrades();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [selectedFilter, allGrades]);

    const fetchStudentGrades = async () => {
        try {
            setLoading(true);
            console.log("📚 Fetching student grades for user:", user?.id);

            // Fetch student profile
            const profileResponse = await studentsService.getByUserId(
                user?.id || ""
            );
            if (!profileResponse.success) {
                throw new Error("Failed to fetch student profile");
            }
            setStudentData(profileResponse.data);
            console.log("👤 Student data:", profileResponse.data);

            // Fetch real grades from backend
            const gradesResponse = await gradesService.getMyGrades();

            if (!gradesResponse.success) {
                throw new Error("Failed to fetch grades");
            }

            console.log("📊 Grades data:", gradesResponse.data);

            // Process grades by term
            const gradesData = processRealGradesData(gradesResponse.data);
            setAllGrades(gradesData);
        } catch (error) {
            console.error("❌ Error fetching grades:", error);
        } finally {
            setLoading(false);
        }
    };

    const processRealGradesData = (gradesData: any[]): TermGrades[] => {
        const termMap = new Map<string, TermGrades>();

        gradesData.forEach((gradeData) => {
            const termId = gradeData.termId;

            if (!termMap.has(termId)) {
                termMap.set(termId, {
                    termId: termId,
                    termName: gradeData.termName,
                    termStatus: gradeData.termStatus,
                    courses: [],
                    gpa: 0,
                    credits: 0,
                });
            }

            const courseGrade: CourseGrade = {
                enrollmentId: gradeData.enrollmentId,
                sectionId: gradeData.sectionId,
                courseCode: gradeData.courseCode,
                courseNameAr: gradeData.courseNameAr,
                courseNameEn: gradeData.courseNameEn,
                credits: gradeData.credits,
                termId: gradeData.termId,
                termName: gradeData.termName,
                termStatus: gradeData.termStatus,
                facultyName: gradeData.facultyName,
                grades: gradeData.grades,
                totalScore: gradeData.totalScore,
                percentage: gradeData.percentage,
                letterGrade: gradeData.letterGrade,
                gradePoint: gradeData.gradePoint,
                isPublished: gradeData.isPublished,
            };

            termMap.get(termId)!.courses.push(courseGrade);
        });

        // Calculate GPA for each term
        const termsArray = Array.from(termMap.values());
        termsArray.forEach((term) => {
            const totalPoints = term.courses.reduce(
                (sum, c) => sum + c.gradePoint * c.credits,
                0
            );
            const totalCredits = term.courses.reduce(
                (sum, c) => sum + c.credits,
                0
            );
            term.gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
            term.credits = totalCredits;
        });

        // Sort by term (active first, then by name)
        return termsArray.sort((a, b) => {
            if (a.termStatus === "ACTIVE" && b.termStatus !== "ACTIVE")
                return -1;
            if (a.termStatus !== "ACTIVE" && b.termStatus === "ACTIVE")
                return 1;
            return b.termName.localeCompare(a.termName);
        });
    };

    const processGradesData = (enrollments: any[]): TermGrades[] => {
        const termMap = new Map<string, TermGrades>();

        enrollments.forEach((enrollment) => {
            const term = enrollment.section.term;
            const course = enrollment.section.course;
            const faculty = enrollment.section.faculty;

            if (!termMap.has(term.id)) {
                termMap.set(term.id, {
                    termId: term.id,
                    termName: term.name,
                    termStatus: term.status,
                    courses: [],
                    gpa: 0,
                    credits: 0,
                });
            }

            // Mock grades for demonstration - In production, fetch from grades API
            const mockGrades: Grade[] = [
                {
                    id: "1",
                    componentId: "c1",
                    componentName: "الواجبات",
                    score: 18,
                    maxScore: 20,
                    weight: 20,
                },
                {
                    id: "2",
                    componentId: "c2",
                    componentName: "الاختبار النصفي",
                    score: 28,
                    maxScore: 30,
                    weight: 30,
                },
                {
                    id: "3",
                    componentId: "c3",
                    componentName: "الاختبار النهائي",
                    score: 44,
                    maxScore: 50,
                    weight: 50,
                },
            ];

            const totalScore = mockGrades.reduce((sum, g) => sum + g.score, 0);
            const maxTotalScore = mockGrades.reduce(
                (sum, g) => sum + g.maxScore,
                0
            );
            const percentage = (totalScore / maxTotalScore) * 100;
            const { letterGrade, gradePoint } =
                calculateLetterGrade(percentage);

            const courseGrade: CourseGrade = {
                enrollmentId: enrollment.id,
                sectionId: enrollment.section.id,
                courseCode: course.code,
                courseNameAr: course.nameAr,
                courseNameEn: course.nameEn,
                credits: course.credits,
                termId: term.id,
                termName: term.name,
                termStatus: term.status,
                facultyName: faculty.nameAr,
                grades: mockGrades,
                totalScore,
                percentage,
                letterGrade,
                gradePoint,
                isPublished: true, // Mock value
            };

            termMap.get(term.id)!.courses.push(courseGrade);
        });

        // Calculate GPA for each term
        const termsArray = Array.from(termMap.values());
        termsArray.forEach((term) => {
            const totalPoints = term.courses.reduce(
                (sum, c) => sum + c.gradePoint * c.credits,
                0
            );
            const totalCredits = term.courses.reduce(
                (sum, c) => sum + c.credits,
                0
            );
            term.gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
            term.credits = totalCredits;
        });

        // Sort by term (active first, then by name)
        return termsArray.sort((a, b) => {
            if (a.termStatus === "ACTIVE" && b.termStatus !== "ACTIVE")
                return -1;
            if (a.termStatus !== "ACTIVE" && b.termStatus === "ACTIVE")
                return 1;
            return b.termName.localeCompare(a.termName);
        });
    };

    const calculateLetterGrade = (
        percentage: number
    ): { letterGrade: string; gradePoint: number } => {
        if (percentage >= 95) return { letterGrade: "A+", gradePoint: 4.0 };
        if (percentage >= 90) return { letterGrade: "A", gradePoint: 3.75 };
        if (percentage >= 85) return { letterGrade: "B+", gradePoint: 3.5 };
        if (percentage >= 80) return { letterGrade: "B", gradePoint: 3.0 };
        if (percentage >= 75) return { letterGrade: "C+", gradePoint: 2.5 };
        if (percentage >= 70) return { letterGrade: "C", gradePoint: 2.0 };
        if (percentage >= 65) return { letterGrade: "D+", gradePoint: 1.5 };
        if (percentage >= 60) return { letterGrade: "D", gradePoint: 1.0 };
        return { letterGrade: "F", gradePoint: 0.0 };
    };

    const applyFilter = () => {
        if (selectedFilter === "current") {
            setFilteredGrades(
                allGrades.filter((term) => term.termStatus === "ACTIVE")
            );
        } else if (selectedFilter === "all") {
            setFilteredGrades(allGrades);
        } else {
            // Specific term selected
            setFilteredGrades(
                allGrades.filter((term) => term.termId === selectedFilter)
            );
        }
    };

    const calculateCumulativeGPA = () => {
        const totalPoints = allGrades.reduce(
            (sum, term) =>
                sum +
                term.courses.reduce(
                    (tSum, course) => tSum + course.gradePoint * course.credits,
                    0
                ),
            0
        );
        const totalCredits = allGrades.reduce(
            (sum, term) => sum + term.credits,
            0
        );
        return totalCredits > 0 ? totalPoints / totalCredits : 0;
    };

    const calculateTotalCredits = () => {
        return allGrades.reduce((sum, term) => sum + term.credits, 0);
    };

    const getAcademicStanding = (gpa: number) => {
        if (gpa >= 3.67)
            return {
                label: "ممتاز",
                color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            };
        if (gpa >= 3.0)
            return {
                label: "جيد جداً",
                color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            };
        if (gpa >= 2.33)
            return {
                label: "جيد",
                color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            };
        if (gpa >= 2.0)
            return {
                label: "مقبول",
                color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
            };
        return {
            label: "راسب",
            color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
    };

    const getGradeColor = (letterGrade: string) => {
        if (letterGrade.startsWith("A"))
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        if (letterGrade.startsWith("B"))
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        if (letterGrade.startsWith("C"))
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        if (letterGrade.startsWith("D"))
            return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    };

    const getGPATrendData = () => {
        return allGrades.map((term) => ({
            name: term.termName,
            gpa: parseFloat(term.gpa.toFixed(2)),
        }));
    };

    const getGradeDistributionData = () => {
        const distribution: Record<string, number> = {};
        allGrades.forEach((term) => {
            term.courses.forEach((course) => {
                distribution[course.letterGrade] =
                    (distribution[course.letterGrade] || 0) + 1;
            });
        });
        return Object.entries(distribution).map(([grade, count]) => ({
            name: grade,
            value: count,
        }));
    };

    const getBestCourses = () => {
        const allCourses: CourseGrade[] = [];
        allGrades.forEach((term) => allCourses.push(...term.courses));
        return allCourses
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 3);
    };

    const getWeakCourses = () => {
        const allCourses: CourseGrade[] = [];
        allGrades.forEach((term) => allCourses.push(...term.courses));
        return allCourses
            .filter((c) => c.gradePoint < 2.5)
            .sort((a, b) => a.percentage - b.percentage);
    };

    const COLORS = [
        "#10b981",
        "#3b82f6",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
    ];

    const cumulativeGPA = calculateCumulativeGPA();
    const totalCredits = calculateTotalCredits();
    const standing = getAcademicStanding(cumulativeGPA);
    const currentTerm = allGrades.find((t) => t.termStatus === "ACTIVE");

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            جاري تحميل الدرجات...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            📊 درجاتي الأكاديمية
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            متابعة الأداء الأكاديمي والتقديرات
                        </p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 me-2" />
                        تحميل كشف الدرجات
                    </Button>
                </div>

                {/* Filter Controls */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Button
                                variant={
                                    selectedFilter === "current"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setSelectedFilter("current")}
                                className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                الفصل الحالي
                            </Button>
                            <Button
                                variant={
                                    selectedFilter === "all"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setSelectedFilter("all")}
                                className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                جميع السنوات
                            </Button>
                            <div className="flex-1"></div>
                            <select
                                value={selectedFilter}
                                onChange={(e) =>
                                    setSelectedFilter(e.target.value)
                                }
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                <option value="current">الفصل الحالي</option>
                                <option value="all">جميع الفصول</option>
                                {allGrades.map((term) => (
                                    <option
                                        key={term.termId}
                                        value={term.termId}>
                                        {term.termName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                المعدل الفصلي
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">
                                {currentTerm
                                    ? currentTerm.gpa.toFixed(2)
                                    : "0.00"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                الفصل الحالي
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                المعدل التراكمي
                            </CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {cumulativeGPA.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                من 4.00
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                الساعات المكتسبة
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {totalCredits}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                من{" "}
                                {studentData?.batch?.curriculum?.totalCredits ||
                                    132}{" "}
                                ساعة
                            </p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{
                                        width: `${
                                            (totalCredits /
                                                (studentData?.batch?.curriculum
                                                    ?.totalCredits || 132)) *
                                            100
                                        }%`,
                                    }}></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                التقدير الأكاديمي
                            </CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge
                                className={`text-lg px-3 py-1 ${standing.color}`}>
                                {standing.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-2">
                                {filteredGrades.reduce(
                                    (sum, t) => sum + t.courses.length,
                                    0
                                )}{" "}
                                مادة مسجلة
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* GPA Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>تطور المعدل التراكمي</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={getGPATrendData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 4]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="gpa"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        name="المعدل"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Grade Distribution Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>توزيع التقديرات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={getGradeDistributionData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) =>
                                            `${entry.name}: ${entry.value}`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value">
                                        {getGradeDistributionData().map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
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
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Academic Insights */}
                {selectedFilter === "all" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Best Courses */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-green-600" />
                                    أفضل المواد
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {getBestCourses().map((course) => (
                                        <div
                                            key={course.enrollmentId}
                                            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div>
                                                <p className="font-medium">
                                                    {course.courseNameAr}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {course.courseCode}
                                                </p>
                                            </div>
                                            <Badge
                                                className={getGradeColor(
                                                    course.letterGrade
                                                )}>
                                                {course.letterGrade}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Weak Courses */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                    مواد تحتاج تحسين
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {getWeakCourses().length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">
                                        🎉 ممتاز! جميع المواد بمستوى جيد
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {getWeakCourses()
                                            .slice(0, 3)
                                            .map((course) => (
                                                <div
                                                    key={course.enrollmentId}
                                                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                course.courseNameAr
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            يمكن تحسين الأداء
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        className={getGradeColor(
                                                            course.letterGrade
                                                        )}>
                                                        {course.letterGrade}
                                                    </Badge>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Detailed Grades Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>الدرجات التفصيلية</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredGrades.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    لا توجد درجات
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    لم يتم نشر الدرجات للفصل المحدد بعد
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredGrades.map((term) => (
                                    <div
                                        key={term.termId}
                                        className="border rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center gap-3">
                                            <span className="font-semibold text-lg">
                                                {term.termName}
                                            </span>
                                            {term.termStatus === "ACTIVE" && (
                                                <Badge variant="default">
                                                    الفصل الحالي
                                                </Badge>
                                            )}
                                            <div className="flex-1"></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                المعدل: {term.gpa.toFixed(2)} |{" "}
                                                {term.courses.length} مادة
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            رمز المادة
                                                        </TableHead>
                                                        <TableHead>
                                                            اسم المادة
                                                        </TableHead>
                                                        <TableHead>
                                                            الساعات
                                                        </TableHead>
                                                        <TableHead>
                                                            الدرجة النهائية
                                                        </TableHead>
                                                        <TableHead>
                                                            النسبة
                                                        </TableHead>
                                                        <TableHead>
                                                            التقدير
                                                        </TableHead>
                                                        <TableHead>
                                                            الحالة
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {term.courses.map(
                                                        (course) => (
                                                            <TableRow
                                                                key={
                                                                    course.enrollmentId
                                                                }>
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        course.courseCode
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        course.courseNameAr
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        course.credits
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {course.totalScore.toFixed(
                                                                        1
                                                                    )}{" "}
                                                                    /{" "}
                                                                    {course.grades.reduce(
                                                                        (
                                                                            sum,
                                                                            g
                                                                        ) =>
                                                                            sum +
                                                                            g.maxScore,
                                                                        0
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {course.percentage.toFixed(
                                                                        1
                                                                    )}
                                                                    %
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        className={getGradeColor(
                                                                            course.letterGrade
                                                                        )}>
                                                                        {
                                                                            course.letterGrade
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {course.isPublished ? (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-green-600">
                                                                            منشور
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-gray-600">
                                                                            قيد
                                                                            الانتظار
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
