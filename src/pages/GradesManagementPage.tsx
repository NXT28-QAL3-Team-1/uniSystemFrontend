import { useState, useEffect } from "react";
import { Save, Send } from "lucide-react";
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
import { sectionsService, termsService } from "@/services/api";

interface Term {
    id: string;
    name: string;
}

interface Section {
    id: string;
    code: string;
    course: {
        nameAr: string;
        credits: number;
    };
}

interface Student {
    id: string;
    studentCode: string;
    nameAr: string;
    enrollmentId: string;
    grades?: {
        midterm?: number;
        final?: number;
        assignments?: number;
        quizzes?: number;
        total?: number;
        letterGrade?: string;
    };
}

interface GradeComponent {
    id: string;
    name: string;
    maxScore: number;
    weight: number;
}

export default function GradesPage() {
    const [terms, setTerms] = useState<Term[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedTerm, setSelectedTerm] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [gradeComponents] = useState<GradeComponent[]>([
        { id: "midterm", name: "الاختبار النصفي", maxScore: 30, weight: 30 },
        { id: "final", name: "الاختبار النهائي", maxScore: 40, weight: 40 },
        { id: "assignments", name: "الواجبات", maxScore: 20, weight: 20 },
        { id: "quizzes", name: "الاختبارات القصيرة", maxScore: 10, weight: 10 },
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const response = await termsService.getAll();
                if (response.success) {
                    setTerms(response.data.terms);
                }
            } catch (error) {
                console.error("Error fetching terms:", error);
            }
        };
        fetchTerms();
    }, []);

    useEffect(() => {
        if (!selectedTerm) return;

        const fetchSections = async () => {
            try {
                const response = await sectionsService.getAll({
                    termId: selectedTerm,
                });
                if (response.success) {
                    setSections(response.data.sections);
                }
            } catch (error) {
                console.error("Error fetching sections:", error);
            }
        };

        fetchSections();
    }, [selectedTerm]);

    useEffect(() => {
        if (!selectedSection) return;

        const fetchStudents = async () => {
            try {
                // Mock data - would fetch actual enrollments
                setStudents([
                    {
                        id: "s1",
                        studentCode: "2021001",
                        nameAr: "أحمد محمد",
                        enrollmentId: "e1",
                        grades: {
                            midterm: 28,
                            final: 36,
                            assignments: 18,
                            quizzes: 9,
                            total: 91,
                            letterGrade: "A",
                        },
                    },
                    {
                        id: "s2",
                        studentCode: "2021002",
                        nameAr: "فاطمة علي",
                        enrollmentId: "e2",
                        grades: {
                            midterm: 25,
                            final: 32,
                            assignments: 17,
                            quizzes: 8,
                            total: 82,
                            letterGrade: "B",
                        },
                    },
                    {
                        id: "s3",
                        studentCode: "2021003",
                        nameAr: "محمد حسن",
                        enrollmentId: "e3",
                    },
                ]);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        fetchStudents();
    }, [selectedSection]);

    const handleGradeChange = (
        enrollmentId: string,
        component: string,
        value: string
    ) => {
        const numValue = parseFloat(value) || 0;
        setStudents((prev) =>
            prev.map((student) => {
                if (student.enrollmentId === enrollmentId) {
                    const updatedGrades = {
                        ...student.grades,
                        [component]: numValue,
                    };

                    // Calculate total
                    const total =
                        (updatedGrades.midterm || 0) +
                        (updatedGrades.final || 0) +
                        (updatedGrades.assignments || 0) +
                        (updatedGrades.quizzes || 0);

                    updatedGrades.total = total;
                    updatedGrades.letterGrade = getLetterGrade(total);

                    return { ...student, grades: updatedGrades };
                }
                return student;
            })
        );
    };

    const getLetterGrade = (score: number): string => {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "F";
    };

    const handleSaveGrades = async () => {
        try {
            setLoading(true);
            // Would save grades to backend
            alert("تم حفظ الدرجات بنجاح");
        } catch (error) {
            console.error("Error saving grades:", error);
            alert("حدث خطأ أثناء حفظ الدرجات");
        } finally {
            setLoading(false);
        }
    };

    const handlePublishGrades = async () => {
        try {
            setLoading(true);
            // Would publish grades to students
            alert("تم نشر الدرجات بنجاح");
        } catch (error) {
            console.error("Error publishing grades:", error);
            alert("حدث خطأ أثناء نشر الدرجات");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            إدارة الدرجات
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                            إدخال ونشر درجات الطلاب
                        </p>
                    </div>
                    {selectedSection && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={handleSaveGrades}
                                disabled={loading}
                                className="flex-1 sm:flex-none">
                                <Save className="w-4 h-4 me-2" />
                                حفظ
                            </Button>
                            <Button
                                onClick={handlePublishGrades}
                                disabled={loading}
                                className="flex-1 sm:flex-none">
                                <Send className="w-4 h-4 me-2" />
                                نشر الدرجات
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>الفصل الدراسي</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <select
                                value={selectedTerm}
                                onChange={(e) =>
                                    setSelectedTerm(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                <option value="">اختر الفصل</option>
                                {terms.map((term) => (
                                    <option key={term.id} value={term.id}>
                                        {term.name}
                                    </option>
                                ))}
                            </select>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>الشعبة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <select
                                value={selectedSection}
                                onChange={(e) =>
                                    setSelectedSection(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                disabled={!selectedTerm}>
                                <option value="">اختر الشعبة</option>
                                {sections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        {section.course.nameAr} - {section.code}
                                    </option>
                                ))}
                            </select>
                        </CardContent>
                    </Card>
                </div>

                {/* Grade Components */}
                {selectedSection && (
                    <Card>
                        <CardHeader>
                            <CardTitle>مكونات الدرجة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {gradeComponents.map((comp) => (
                                    <div
                                        key={comp.id}
                                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <p className="text-sm font-semibold">
                                            {comp.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {comp.maxScore} درجة ({comp.weight}
                                            %)
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Grades Table */}
                {selectedSection && (
                    <Card>
                        <CardHeader>
                            <CardTitle>درجات الطلاب</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {students.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    لا يوجد طلاب مسجلين في هذه الشعبة
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>#</TableHead>
                                                <TableHead>
                                                    الرقم الجامعي
                                                </TableHead>
                                                <TableHead>الاسم</TableHead>
                                                <TableHead>النصفي</TableHead>
                                                <TableHead>النهائي</TableHead>
                                                <TableHead>الواجبات</TableHead>
                                                <TableHead>
                                                    الاختبارات
                                                </TableHead>
                                                <TableHead>المجموع</TableHead>
                                                <TableHead>التقدير</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.map((student, index) => (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.studentCode}
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.nameAr}
                                                    </TableCell>
                                                    <TableCell>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="30"
                                                            value={
                                                                student.grades
                                                                    ?.midterm ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleGradeChange(
                                                                    student.enrollmentId,
                                                                    "midterm",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="40"
                                                            value={
                                                                student.grades
                                                                    ?.final ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleGradeChange(
                                                                    student.enrollmentId,
                                                                    "final",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="20"
                                                            value={
                                                                student.grades
                                                                    ?.assignments ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleGradeChange(
                                                                    student.enrollmentId,
                                                                    "assignments",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            value={
                                                                student.grades
                                                                    ?.quizzes ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleGradeChange(
                                                                    student.enrollmentId,
                                                                    "quizzes",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold">
                                                            {student.grades
                                                                ?.total || 0}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.grades
                                                            ?.letterGrade && (
                                                            <Badge
                                                                variant={
                                                                    student
                                                                        .grades
                                                                        .letterGrade ===
                                                                    "A"
                                                                        ? "default"
                                                                        : student
                                                                              .grades
                                                                              .letterGrade ===
                                                                          "F"
                                                                        ? "destructive"
                                                                        : "secondary"
                                                                }>
                                                                {
                                                                    student
                                                                        .grades
                                                                        .letterGrade
                                                                }
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
