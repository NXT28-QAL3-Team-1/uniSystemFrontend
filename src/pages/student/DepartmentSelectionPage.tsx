import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    GraduationCap,
    Users,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Info,
} from "lucide-react";
import { departmentSelectionService } from "@/services/api";

interface DepartmentEligibility {
    departmentId: string;
    departmentCode: string;
    departmentNameAr: string;
    departmentNameEn: string;
    collegeNameAr: string;
    minGpa: number;
    capacity: number;
    enrolledCount: number;
    availableSeats: number;
    isEligible: boolean;
    eligibilityReasons: {
        hasMinimumGPA: boolean;
        hasAvailableSeats: boolean;
        isCorrectYear: boolean;
        hasNoExistingDepartment: boolean;
        hasNoPendingApplication: boolean;
        isGoodAcademicStanding: boolean;
    };
}

interface ApplicationData {
    id: string;
    departmentId: string;
    departmentNameAr: string;
    departmentCode: string;
    status: string;
    studentGpa: number;
    statement?: string;
    submittedAt: string;
    processedAt?: string;
    rejectionReason?: string;
}

export default function DepartmentSelectionPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState<DepartmentEligibility[]>([]);
    const [application, setApplication] = useState<ApplicationData | null>(
        null
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] =
        useState<DepartmentEligibility | null>(null);
    const [statement, setStatement] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log("📚 Fetching department selection data...");

            const [deptsResponse, appResponse] = await Promise.all([
                departmentSelectionService.getAvailableDepartments(),
                departmentSelectionService.getMyApplication(),
            ]);

            if (deptsResponse.success) {
                setDepartments(deptsResponse.data);
                console.log(
                    "✅ Departments loaded:",
                    deptsResponse.data.length
                );
            }

            if (appResponse.success && appResponse.data) {
                setApplication(appResponse.data);
                console.log("📋 Current application:", appResponse.data);
            } else {
                setApplication(null);
            }
        } catch (error) {
            console.error("❌ Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (department: DepartmentEligibility) => {
        setSelectedDepartment(department);
        setStatement("");
        setIsDialogOpen(true);
    };

    const handleSubmitApplication = async () => {
        if (!selectedDepartment) return;

        try {
            setSubmitting(true);
            console.log(
                "📤 Submitting application to:",
                selectedDepartment.departmentNameAr
            );

            const response = await departmentSelectionService.applyToDepartment(
                {
                    departmentId: selectedDepartment.departmentId,
                    statement: statement || undefined,
                }
            );

            if (response.success) {
                alert("✅ تم إرسال طلبك بنجاح! سيتم مراجعته من قبل الإدارة.");
                setIsDialogOpen(false);
                setSelectedDepartment(null);
                setStatement("");
                fetchData(); // Refresh data
            }
        } catch (error: unknown) {
            console.error("❌ Error submitting application:", error);
            const errorObj = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                errorObj?.response?.data?.message || "فشل إرسال الطلب";
            alert("❌ " + message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleWithdrawApplication = async () => {
        if (!application) return;

        const confirmed = window.confirm("هل أنت متأكد من سحب طلبك؟");
        if (!confirmed) return;

        try {
            console.log("🗑️ Withdrawing application:", application.id);
            const response =
                await departmentSelectionService.withdrawApplication(
                    application.id
                );

            if (response.success) {
                alert("✅ تم سحب طلبك بنجاح");
                fetchData();
            }
        } catch (error) {
            console.error("❌ Error withdrawing application:", error);
            alert("❌ فشل سحب الطلب");
        }
    };

    const getApplicationStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case "APPROVED":
                return (
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        موافق عليه
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 ml-1" />
                        مرفوض
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                        <Clock className="w-3 h-3 ml-1" />
                        قيد المراجعة
                    </Badge>
                );
            case "WITHDRAWN":
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-100 dark:bg-gray-800">
                        تم السحب
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getEligibilityMessages = (dept: DepartmentEligibility) => {
        const messages: string[] = [];
        if (!dept.eligibilityReasons.hasMinimumGPA) {
            messages.push(`المعدل المطلوب: ${dept.minGpa}`);
        }
        if (!dept.eligibilityReasons.hasAvailableSeats) {
            messages.push("لا توجد مقاعد متاحة");
        }
        if (!dept.eligibilityReasons.isCorrectYear) {
            messages.push("ليس في السنة المناسبة");
        }
        if (!dept.eligibilityReasons.hasNoExistingDepartment) {
            messages.push("لديك قسم معين بالفعل");
        }
        if (!dept.eligibilityReasons.hasNoPendingApplication) {
            messages.push("لديك طلب قيد المراجعة");
        }
        if (!dept.eligibilityReasons.isGoodAcademicStanding) {
            messages.push("الوضع الأكاديمي لا يسمح");
        }
        return messages;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            جاري تحميل التخصصات...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        🎓 اختيار التخصص
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        اختر التخصص المناسب بناءً على معدلك التراكمي واهتماماتك
                    </p>
                </div>

                {/* Current Application Status */}
                {application && (
                    <Alert
                        className={
                            application.status === "APPROVED"
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : application.status === "REJECTED"
                                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                        }>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">
                                        طلبك لقسم {application.departmentNameAr}{" "}
                                        ({application.departmentCode})
                                    </p>
                                    <p className="text-sm mt-1">
                                        الحالة:{" "}
                                        {getApplicationStatusBadge(
                                            application.status
                                        )}
                                    </p>
                                    {application.rejectionReason && (
                                        <p className="text-sm mt-1 text-red-600">
                                            سبب الرفض:{" "}
                                            {application.rejectionReason}
                                        </p>
                                    )}
                                </div>
                                {application.status === "PENDING" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleWithdrawApplication}>
                                        سحب الطلب
                                    </Button>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Available Departments */}
                <div className="grid gap-4 md:grid-cols-2">
                    {departments.map((department) => {
                        const eligibilityMessages =
                            getEligibilityMessages(department);
                        return (
                            <Card
                                key={department.departmentId}
                                className={`${
                                    !department.isEligible ? "opacity-60" : ""
                                } transition-all hover:shadow-lg`}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">
                                                {department.departmentNameAr}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {department.departmentCode} •{" "}
                                                {department.collegeNameAr}
                                            </p>
                                        </div>
                                        {department.isEligible ? (
                                            <Badge
                                                variant="outline"
                                                className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                                                مؤهل
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">
                                                غير مؤهل
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {!department.isEligible &&
                                        eligibilityMessages.length > 0 && (
                                            <Alert
                                                variant="destructive"
                                                className="text-xs">
                                                <AlertCircle className="h-3 w-3" />
                                                <AlertDescription>
                                                    <ul className="space-y-1">
                                                        {eligibilityMessages.map(
                                                            (msg, idx) => (
                                                                <li key={idx}>
                                                                    • {msg}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                    {/* Requirements */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                الحد الأدنى
                                            </p>
                                            <p className="font-medium text-sm">
                                                {department.minGpa.toFixed(1)}
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                المقاعد المتاحة
                                            </p>
                                            <p className="font-medium text-sm">
                                                {department.availableSeats} /{" "}
                                                {department.capacity}
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <GraduationCap className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto mb-1" />
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                الطلاب المسجلون
                                            </p>
                                            <p className="font-medium text-sm">
                                                {department.enrolledCount}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        disabled={
                                            !department.isEligible ||
                                            (application !== null &&
                                                application.status ===
                                                    "PENDING") ||
                                            submitting
                                        }
                                        onClick={() => handleApply(department)}>
                                        {department.isEligible
                                            ? application?.status === "PENDING"
                                                ? "لديك طلب معلق"
                                                : "تقديم طلب"
                                            : "غير مؤهل"}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Info Box */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                                    معلومات هامة عن اختيار التخصص
                                </h3>
                                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                                    <li>
                                        • يتم اختيار التخصص بعد إتمام متطلبات
                                        السنة التحضيرية بنجاح
                                    </li>
                                    <li>
                                        • يجب أن يكون معدلك التراكمي أعلى من
                                        الحد الأدنى المطلوب
                                    </li>
                                    <li>
                                        • المقاعد محدودة والقبول يتم حسب
                                        الأولوية
                                    </li>
                                    <li>
                                        • يتم مراجعة الطلبات خلال 5-7 أيام عمل
                                        من تاريخ التقديم
                                    </li>
                                    <li>
                                        • يمكنك تقديم طلب واحد فقط في كل فصل
                                        دراسي
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Application Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>تقديم طلب اختيار تخصص</DialogTitle>
                        <DialogDescription>
                            {selectedDepartment?.departmentNameAr} (
                            {selectedDepartment?.departmentCode})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    الحد الأدنى المطلوب:
                                </span>
                                <span className="font-medium">
                                    {selectedDepartment?.minGpa.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    المقاعد المتاحة:
                                </span>
                                <span className="font-medium">
                                    {selectedDepartment?.availableSeats}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="statement">
                                لماذا تريد الالتحاق بهذا القسم؟ (اختياري)
                            </Label>
                            <Textarea
                                id="statement"
                                placeholder="اكتب سبب اهتمامك بهذا التخصص..."
                                value={statement}
                                onChange={(e) => setStatement(e.target.value)}
                                rows={4}
                                maxLength={1000}
                            />
                            <p className="text-xs text-gray-500">
                                {statement.length} / 1000 حرف
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={submitting}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleSubmitApplication}
                            disabled={submitting}>
                            {submitting ? "جاري الإرسال..." : "تقديم الطلب"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
