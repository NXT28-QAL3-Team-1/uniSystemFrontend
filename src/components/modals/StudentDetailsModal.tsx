import { useEffect, useState } from "react";
import {
    X,
    User,
    Mail,
    Phone,
    Calendar,
    GraduationCap,
    BookOpen,
    Award,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { studentsService } from "@/services/api";

interface StudentDetailsModalProps {
    studentId: string | null;
    open: boolean;
    onClose: () => void;
}

interface StudentDetails {
    id: string;
    studentCode: string;
    nameEn: string;
    nameAr: string;
    email: string;
    phone?: string;
    nationalId?: string;
    dateOfBirth?: string;
    gender?: string;
    admissionDate: string;
    status: string;
    batch: {
        id: string;
        name: string;
        year: number;
        curriculum: {
            id: string;
            name: string;
            totalCredits: number;
        };
    };
    department?: {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
    };
    academicStanding?: {
        cgpa: number;
        totalCredits: number;
        standing: string;
    };
}

export default function StudentDetailsModal({
    studentId,
    open,
    onClose,
}: StudentDetailsModalProps) {
    const [student, setStudent] = useState<StudentDetails | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchStudentDetails = async () => {
        if (!studentId) return;

        try {
            setLoading(true);
            const response = await studentsService.getById(studentId);
            if (response.success) {
                setStudent(response.data);
            }
        } catch (error) {
            console.error("Error fetching student details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && studentId) {
            fetchStudentDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, studentId]);

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            "default" | "secondary" | "destructive" | "outline"
        > = {
            ACTIVE: "default",
            DEFERRED: "secondary",
            DISMISSED: "destructive",
            GRADUATED: "outline",
        };
        const labels: Record<string, string> = {
            ACTIVE: "نشط",
            DEFERRED: "مؤجل",
            DISMISSED: "مفصول",
            GRADUATED: "متخرج",
        };
        return (
            <Badge variant={variants[status] || "default"}>
                {labels[status] || status}
            </Badge>
        );
    };

    const getStandingBadge = (standing: string) => {
        const variants: Record<
            string,
            "default" | "secondary" | "destructive" | "outline"
        > = {
            GOOD_STANDING: "default",
            ACADEMIC_WARNING: "secondary",
            ACADEMIC_PROBATION: "destructive",
            ACADEMIC_DISMISSAL: "destructive",
            NOT_CALCULATED: "outline",
        };
        const labels: Record<string, string> = {
            GOOD_STANDING: "وضع أكاديمي جيد",
            ACADEMIC_WARNING: "إنذار أكاديمي",
            ACADEMIC_PROBATION: "مراقبة أكاديمية",
            ACADEMIC_DISMISSAL: "فصل أكاديمي",
            NOT_CALCULATED: "غير محسوب",
        };
        return (
            <Badge variant={variants[standing] || "outline"}>
                {labels[standing] || standing}
            </Badge>
        );
    };

    const formatDate = (date?: string) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                            تفاصيل الطالب
                        </span>
                        <button
                            onClick={onClose}
                            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
                            <X className="h-4 w-4" />
                            <span className="sr-only">إغلاق</span>
                        </button>
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">
                        جاري التحميل...
                    </div>
                ) : student ? (
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    المعلومات الشخصية
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            الاسم بالعربية
                                        </label>
                                        <p className="text-base font-semibold">
                                            {student.nameAr}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            الاسم بالإنجليزية
                                        </label>
                                        <p className="text-base font-semibold">
                                            {student.nameEn}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            الرقم الجامعي
                                        </label>
                                        <p className="text-base font-semibold">
                                            {student.studentCode}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            الرقم القومي
                                        </label>
                                        <p className="text-base">
                                            {student.nationalId || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            النوع
                                        </label>
                                        <p className="text-base">
                                            {student.gender === "MALE"
                                                ? "ذكر"
                                                : student.gender === "FEMALE"
                                                ? "أنثى"
                                                : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            تاريخ الميلاد
                                        </label>
                                        <p className="text-base">
                                            {formatDate(student.dateOfBirth)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="w-5 h-5" />
                                    معلومات الاتصال
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                البريد الإلكتروني
                                            </label>
                                            <p className="text-base">
                                                {student.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                رقم الهاتف
                                            </label>
                                            <p className="text-base">
                                                {student.phone || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5" />
                                    المعلومات الأكاديمية
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            الحالة
                                        </label>
                                        <div className="mt-1">
                                            {getStatusBadge(student.status)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            تاريخ القبول
                                        </label>
                                        <p className="text-base flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            {formatDate(student.admissionDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            الدفعة
                                        </label>
                                        <p className="text-base font-semibold">
                                            {student.batch.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            سنة الدفعة
                                        </label>
                                        <p className="text-base">
                                            {student.batch.year}
                                        </p>
                                    </div>
                                    {student.department && (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">
                                                    القسم
                                                </label>
                                                <p className="text-base font-semibold">
                                                    {student.department.nameAr}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">
                                                    كود القسم
                                                </label>
                                                <p className="text-base">
                                                    {student.department.code}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Curriculum Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    الخطة الدراسية
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            اسم الخطة
                                        </label>
                                        <p className="text-base font-semibold">
                                            {student.batch.curriculum.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            إجمالي الساعات المطلوبة
                                        </label>
                                        <p className="text-base font-semibold">
                                            {
                                                student.batch.curriculum
                                                    .totalCredits
                                            }{" "}
                                            ساعة
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Standing */}
                        {student.academicStanding && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="w-5 h-5" />
                                        الأداء الأكاديمي
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                المعدل التراكمي (CGPA)
                                            </label>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {student.academicStanding.cgpa >
                                                0
                                                    ? student.academicStanding.cgpa.toFixed(
                                                          2
                                                      )
                                                    : "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                الساعات المكتسبة
                                            </label>
                                            <p className="text-2xl font-bold text-green-600">
                                                {
                                                    student.academicStanding
                                                        .totalCredits
                                                }{" "}
                                                ساعة
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">
                                                الوضع الأكاديمي
                                            </label>
                                            <div className="mt-2">
                                                {getStandingBadge(
                                                    student.academicStanding
                                                        .standing
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">
                                                نسبة الإنجاز:
                                            </span>
                                            <span className="font-semibold">
                                                {(
                                                    (student.academicStanding
                                                        .totalCredits /
                                                        student.batch.curriculum
                                                            .totalCredits) *
                                                    100
                                                ).toFixed(1)}
                                                %
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{
                                                    width: `${Math.min(
                                                        (student
                                                            .academicStanding
                                                            .totalCredits /
                                                            student.batch
                                                                .curriculum
                                                                .totalCredits) *
                                                            100,
                                                        100
                                                    )}%`,
                                                }}></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        لم يتم العثور على بيانات الطالب
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
