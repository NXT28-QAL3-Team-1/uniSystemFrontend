import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { coursesService, departmentsService } from "@/services/api";
import CourseModal from "@/components/modals/CourseModal";

interface Course {
    id: string;
    code: string;
    nameEn: string;
    nameAr: string;
    credits: number;
    type: "CORE" | "ELECTIVE" | "GENERAL";
    departmentId: string | null;
    createdAt: string;
}

export default function CoursesPage() {
    const { t } = useTranslation();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
    const [departments, setDepartments] = useState<any[]>([]);

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await departmentsService.getAll();
            if (response.success) {
                setDepartments(response.data.departments);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await coursesService.getAll({ limit: 1000 });
            if (response.success) {
                setCourses(response.data.courses);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("courses.deleteConfirm"))) return;

        try {
            await coursesService.delete(id);
            fetchCourses();
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("فشل حذف المادة");
        }
    };

    const handleCreate = () => {
        setSelectedCourse(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (course: Course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: any) => {
        try {
            console.log("Submitting course data:", data);
            if (selectedCourse) {
                await coursesService.update(selectedCourse.id, data);
            } else {
                await coursesService.create(data);
            }
            await fetchCourses();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Error saving course:", error);
            console.error("Error response:", error.response?.data);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "حدث خطأ غير متوقع";
            alert(`فشل حفظ المادة: ${errorMessage}`);
            // Don't throw - let modal handle it
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {t("courses.title")}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            إدارة المواد الدراسية
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 me-2" />
                        {t("courses.create")}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("courses.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.loading")}
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t("common.noData")}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t("courses.code")}
                                        </TableHead>
                                        <TableHead>
                                            {t("courses.nameAr")}
                                        </TableHead>
                                        <TableHead>
                                            {t("courses.nameEn")}
                                        </TableHead>
                                        <TableHead>
                                            {t("courses.credits")}
                                        </TableHead>
                                        <TableHead>
                                            {t("courses.type")}
                                        </TableHead>
                                        <TableHead className="text-end">
                                            {t("common.actions")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-medium">
                                                {course.code}
                                            </TableCell>
                                            <TableCell>
                                                {course.nameAr}
                                            </TableCell>
                                            <TableCell>
                                                {course.nameEn}
                                            </TableCell>
                                            <TableCell>
                                                {course.credits}
                                            </TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                    {t(
                                                        `courses.types.${course.type}`
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleEdit(course)
                                                        }>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(
                                                                course.id
                                                            )
                                                        }>
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <CourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                course={selectedCourse}
                departments={departments}
            />
        </DashboardLayout>
    );
}
