import { useState, useEffect } from "react";
import { X, UserCog, Building2, BookPlus, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
    studentsService,
    departmentsService,
    sectionsService,
    termsService,
    enrollmentsService,
} from "@/services/api";

interface Department {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
}

interface Term {
    id: string;
    name: string;
    type: string;
    status: string;
}

interface Section {
    id: string;
    code: string;
    course: {
        code: string;
        nameAr: string;
        nameEn: string;
    };
}

interface StudentData {
    id: string;
    studentCode: string;
    nameAr: string;
    nameEn: string;
    phone?: string;
    nationalId?: string;
    dateOfBirth?: string;
    gender?: string;
    status: string;
    department?: {
        id: string;
        code: string;
        nameAr: string;
    };
}

interface ValidationResult {
    valid: boolean;
    errors?: string[];
}

interface AdminStudentManagementModalProps {
    studentId: string | null;
    studentData: StudentData | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminStudentManagementModal({
    studentId,
    studentData,
    open,
    onClose,
    onSuccess,
}: AdminStudentManagementModalProps) {
    const [activeTab, setActiveTab] = useState("department");
    const [loading, setLoading] = useState(false);

    // Department Change
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");

    // Course Enrollment
    const [terms, setTerms] = useState<Term[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedTerm, setSelectedTerm] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [enrollmentValidation, setEnrollmentValidation] =
        useState<ValidationResult | null>(null);

    // Status Update
    const [status, setStatus] = useState("");

    // Personal Info Update
    const [formData, setFormData] = useState({
        nameEn: "",
        nameAr: "",
        phone: "",
        nationalId: "",
        dateOfBirth: "",
        gender: "",
    });

    useEffect(() => {
        if (open && studentId) {
            fetchDepartments();
            fetchTerms();
        }
    }, [open, studentId]);

    useEffect(() => {
        if (studentData) {
            setFormData({
                nameEn: studentData.nameEn || "",
                nameAr: studentData.nameAr || "",
                phone: studentData.phone || "",
                nationalId: studentData.nationalId || "",
                dateOfBirth: studentData.dateOfBirth
                    ? new Date(studentData.dateOfBirth)
                          .toISOString()
                          .split("T")[0]
                    : "",
                gender: studentData.gender || "",
            });
            setStatus(studentData.status || "ACTIVE");
            setSelectedDepartment(studentData.department?.id || "");
        }
    }, [studentData]);

    useEffect(() => {
        if (selectedTerm) {
            fetchSections(selectedTerm);
        }
    }, [selectedTerm]);

    const fetchDepartments = async () => {
        try {
            const response = await departmentsService.getAll();
            console.log("📚 Departments response:", response);

            // Extract departments array from nested structure
            let data: Department[] = [];
            if (response?.success && response?.data?.departments) {
                data = response.data.departments;
            } else if (response?.data?.departments) {
                data = response.data.departments;
            } else if (Array.isArray(response?.data)) {
                data = response.data;
            } else if (Array.isArray(response)) {
                data = response;
            }

            console.log("📚 Departments data:", data);
            setDepartments(data);
        } catch (error) {
            console.error("❌ Error fetching departments:", error);
            setDepartments([]);
        }
    };

    const fetchTerms = async () => {
        try {
            const response = await termsService.getAll();
            console.log("📅 Terms response:", response);

            // Extract terms array from nested structure
            let data: Term[] = [];
            if (response?.success && response?.data?.terms) {
                data = response.data.terms;
            } else if (response?.data?.terms) {
                data = response.data.terms;
            } else if (Array.isArray(response?.data)) {
                data = response.data;
            } else if (Array.isArray(response)) {
                data = response;
            }

            console.log("📅 Terms data:", data);
            const activeTerms = data.filter(
                (t: Term) => t.status === "ACTIVE" || t.status === "UPCOMING"
            );
            console.log("📅 Active terms:", activeTerms);
            setTerms(activeTerms);
            if (activeTerms.length > 0) {
                setSelectedTerm(activeTerms[0].id);
            }
        } catch (error) {
            console.error("❌ Error fetching terms:", error);
            setTerms([]);
        }
    };

    const fetchSections = async (termId: string) => {
        try {
            const response = await sectionsService.getAll({ termId });
            console.log("📖 Sections response:", response);

            // Extract sections array from nested structure
            let data: Section[] = [];
            if (response?.success && response?.data?.sections) {
                data = response.data.sections;
            } else if (response?.data?.sections) {
                data = response.data.sections;
            } else if (Array.isArray(response?.data)) {
                data = response.data;
            } else if (Array.isArray(response)) {
                data = response;
            }

            console.log("📖 Sections data:", data);
            setSections(data);
        } catch (error) {
            console.error("❌ Error fetching sections:", error);
            setSections([]);
        }
    };

    const handleDepartmentChange = async () => {
        if (!studentId || !selectedDepartment) {
            alert("الرجاء اختيار قسم");
            return;
        }

        try {
            setLoading(true);
            await studentsService.assignDepartment(
                studentId,
                selectedDepartment
            );
            alert("تم تغيير القسم بنجاح");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error changing department:", error);
            const errorMessage =
                error instanceof Error && "response" in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message
                    : undefined;
            alert(errorMessage || "فشل تغيير القسم");
        } finally {
            setLoading(false);
        }
    };

    const validateEnrollment = async () => {
        if (!studentId || !selectedSection) return;

        try {
            const response = await enrollmentsService.validateEnrollment({
                studentId,
                sectionId: selectedSection,
            });
            setEnrollmentValidation(response.data || response);
        } catch (error) {
            console.error("Error validating enrollment:", error);
            setEnrollmentValidation({
                valid: false,
                errors: ["فشل التحقق من صحة التسجيل"],
            });
        }
    };

    const handleEnrollStudent = async () => {
        if (!studentId || !selectedSection) {
            alert("الرجاء اختيار مادة");
            return;
        }

        try {
            setLoading(true);
            await enrollmentsService.enrollStudent({
                studentId,
                sectionId: selectedSection,
                bypassValidation: true, // Admin can enroll anytime
            });
            alert("تم تسجيل الطالب في المادة بنجاح");
            onSuccess();
            setEnrollmentValidation(null);
        } catch (error) {
            console.error("Error enrolling student:", error);
            const errorMessage =
                error instanceof Error && "response" in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message
                    : undefined;
            alert(errorMessage || "فشل تسجيل الطالب في المادة");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!studentId || !status) {
            alert("الرجاء اختيار حالة");
            return;
        }

        try {
            setLoading(true);
            await studentsService.update(studentId, { status });
            alert("تم تحديث حالة الطالب بنجاح");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating status:", error);
            const errorMessage =
                error instanceof Error && "response" in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message
                    : undefined;
            alert(errorMessage || "فشل تحديث حالة الطالب");
        } finally {
            setLoading(false);
        }
    };

    const handlePersonalInfoUpdate = async () => {
        if (!studentId) return;

        try {
            setLoading(true);
            await studentsService.update(studentId, {
                ...formData,
                departmentId: selectedDepartment || null,
            });
            alert("تم تحديث بيانات الطالب بنجاح");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating student info:", error);
            const errorMessage =
                error instanceof Error && "response" in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message
                    : undefined;
            alert(errorMessage || "فشل تحديث بيانات الطالب");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSection) {
            // For admin, validation is just a warning, not blocking
            validateEnrollment();
        } else {
            setEnrollmentValidation(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSection]);

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="text-2xl font-bold flex items-center gap-2">
                            <UserCog className="w-6 h-6" />
                            إدارة الطالب
                        </span>
                        <button
                            onClick={onClose}
                            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
                            <X className="h-4 w-4" />
                            <span className="sr-only">إغلاق</span>
                        </button>
                    </DialogTitle>
                </DialogHeader>

                {studentData && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            الطالب المختار
                        </p>
                        <p className="font-semibold">
                            {studentData.nameAr} ({studentData.studentCode})
                        </p>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="department">
                            تغيير القسم
                        </TabsTrigger>
                        <TabsTrigger value="enroll">تسجيل مادة</TabsTrigger>
                        <TabsTrigger value="status">تغيير الحالة</TabsTrigger>
                        <TabsTrigger value="info">تعديل البيانات</TabsTrigger>
                    </TabsList>

                    {/* Change Department */}
                    <TabsContent value="department" className="space-y-4 mt-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm text-blue-900 dark:text-blue-300">
                                        <p className="font-medium mb-1">
                                            القسم الحالي:{" "}
                                            {studentData?.department?.nameAr ||
                                                "لم يتم تحديد القسم بعد"}
                                        </p>
                                        <p className="text-xs">
                                            يمكنك تغيير قسم الطالب من هنا. سيتم
                                            تحديث الخطة الدراسية تلقائياً.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>القسم الجديد</Label>
                                    <Select
                                        value={selectedDepartment}
                                        onValueChange={setSelectedDepartment}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر القسم" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem
                                                    key={dept.id}
                                                    value={dept.id}>
                                                    {dept.nameAr} ({dept.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    onClick={handleDepartmentChange}
                                    disabled={
                                        loading ||
                                        !selectedDepartment ||
                                        selectedDepartment ===
                                            studentData?.department?.id
                                    }
                                    className="w-full">
                                    {loading ? "جاري الحفظ..." : "تغيير القسم"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Enroll in Course */}
                    <TabsContent value="enroll" className="space-y-4 mt-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <BookPlus className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div className="text-sm text-green-900 dark:text-green-300">
                                        <p className="font-medium mb-1">
                                            تسجيل الطالب في مادة جديدة
                                        </p>
                                        <p className="text-xs">
                                            سيتم التحقق من المتطلبات السابقة
                                            والتعارضات الزمنية تلقائياً.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>الفصل الدراسي</Label>
                                    <Select
                                        value={selectedTerm}
                                        onValueChange={setSelectedTerm}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الفصل" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {terms.map((term) => (
                                                <SelectItem
                                                    key={term.id}
                                                    value={term.id}>
                                                    {term.name} ({term.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>المادة (الشعبة)</Label>
                                    <Select
                                        value={selectedSection}
                                        onValueChange={setSelectedSection}
                                        disabled={!selectedTerm}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر المادة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((section) => (
                                                <SelectItem
                                                    key={section.id}
                                                    value={section.id}>
                                                    {section.course.nameAr} (
                                                    {section.course.code}) -
                                                    شعبة {section.code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {enrollmentValidation && (
                                    <div
                                        className={`p-4 rounded-lg ${
                                            enrollmentValidation.valid
                                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                        }`}>
                                        {enrollmentValidation.valid ? (
                                            <div className="flex items-center gap-2 text-green-900 dark:text-green-300">
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span>
                                                    التسجيل ممكن - لا توجد مشاكل
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-red-900 dark:text-red-300 font-medium">
                                                    <AlertCircle className="w-5 h-5" />
                                                    <span>
                                                        تحذيرات التسجيل (يمكنك
                                                        التجاوز كمسؤول)
                                                    </span>
                                                </div>
                                                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-400 space-y-1 mr-6">
                                                    {enrollmentValidation.errors?.map(
                                                        (
                                                            error: string,
                                                            idx: number
                                                        ) => (
                                                            <li key={idx}>
                                                                {error}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 font-medium">
                                                    ⚠️ بصفتك مسؤول، يمكنك متابعة
                                                    التسجيل بغض النظر عن
                                                    التحذيرات
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Button
                                    onClick={handleEnrollStudent}
                                    disabled={loading || !selectedSection}
                                    className="w-full">
                                    {loading
                                        ? "جاري التسجيل..."
                                        : "تسجيل الطالب (كمسؤول)"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Change Status */}
                    <TabsContent value="status" className="space-y-4 mt-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>حالة الطالب</Label>
                                    <Select
                                        value={status}
                                        onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">
                                                نشط
                                            </SelectItem>
                                            <SelectItem value="DEFERRED">
                                                مؤجل
                                            </SelectItem>
                                            <SelectItem value="DISMISSED">
                                                مفصول
                                            </SelectItem>
                                            <SelectItem value="GRADUATED">
                                                متخرج
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-900 dark:text-yellow-300">
                                    <p className="font-medium mb-1">تنبيه:</p>
                                    <p className="text-xs">
                                        تغيير حالة الطالب قد يؤثر على إمكانية
                                        التسجيل والوصول للنظام.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleStatusUpdate}
                                    disabled={
                                        loading ||
                                        status === studentData?.status
                                    }
                                    className="w-full">
                                    {loading ? "جاري الحفظ..." : "تحديث الحالة"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Edit Personal Info */}
                    <TabsContent value="info" className="space-y-4 mt-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>الاسم بالعربية</Label>
                                        <Input
                                            value={formData.nameAr}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    nameAr: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الاسم بالإنجليزية</Label>
                                        <Input
                                            value={formData.nameEn}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    nameEn: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>رقم الهاتف</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phone: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الرقم القومي</Label>
                                        <Input
                                            value={formData.nationalId}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    nationalId: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>تاريخ الميلاد</Label>
                                        <Input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    dateOfBirth: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>النوع</Label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    gender: value,
                                                })
                                            }>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر النوع" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MALE">
                                                    ذكر
                                                </SelectItem>
                                                <SelectItem value="FEMALE">
                                                    أنثى
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePersonalInfoUpdate}
                                    disabled={loading}
                                    className="w-full">
                                    {loading
                                        ? "جاري الحفظ..."
                                        : "حفظ التغييرات"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
