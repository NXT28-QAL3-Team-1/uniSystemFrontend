import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    Eye,
    TrendingUp,
    FileText,
} from "lucide-react";
import { departmentSelectionService } from "@/services/api";

interface ApplicationData {
    id: string;
    studentId: string;
    studentCode: string;
    studentNameAr: string;
    studentNameEn: string;
    departmentId: string;
    departmentNameAr: string;
    departmentCode: string;
    status: string;
    studentGpa: number;
    statement?: string;
    submittedAt: string;
    processedAt?: string;
    processedBy?: string;
    rejectionReason?: string;
}

interface Statistics {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export default function DepartmentApplicationsPage() {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [statistics, setStatistics] = useState<Statistics>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const [selectedApplication, setSelectedApplication] =
        useState<ApplicationData | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
    const [processAction, setProcessAction] = useState<"APPROVED" | "REJECTED">(
        "APPROVED"
    );
    const [rejectionReason, setRejectionReason] = useState("");

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            console.log("📚 Fetching department applications...");

            const [appsResponse, statsResponse] = await Promise.all([
                departmentSelectionService.getAllApplications({
                    status: statusFilter === "all" ? undefined : statusFilter,
                }),
                departmentSelectionService.getStatistics(),
            ]);

            if (appsResponse.success) {
                setApplications(appsResponse.data);
                console.log(
                    "✅ Applications loaded:",
                    appsResponse.data.length
                );
            }

            if (statsResponse.success) {
                setStatistics(statsResponse.data);
                console.log("📊 Statistics loaded:", statsResponse.data);
            }
        } catch (error) {
            console.error("❌ Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewDetails = (application: ApplicationData) => {
        setSelectedApplication(application);
        setIsDetailDialogOpen(true);
    };

    const handleProcessClick = (
        application: ApplicationData,
        action: "APPROVED" | "REJECTED"
    ) => {
        setSelectedApplication(application);
        setProcessAction(action);
        setRejectionReason("");
        setIsProcessDialogOpen(true);
    };

    const handleProcessApplication = async () => {
        if (!selectedApplication) return;

        if (processAction === "REJECTED" && !rejectionReason.trim()) {
            alert("❌ يجب كتابة سبب الرفض");
            return;
        }

        try {
            setProcessing(true);
            console.log(
                `🔄 Processing application ${selectedApplication.id} as ${processAction}`
            );

            const response =
                await departmentSelectionService.processApplication(
                    selectedApplication.id,
                    {
                        status: processAction,
                        rejectionReason:
                            processAction === "REJECTED"
                                ? rejectionReason
                                : undefined,
                    }
                );

            if (response.success) {
                alert(
                    processAction === "APPROVED"
                        ? "✅ تمت الموافقة على الطلب بنجاح"
                        : "✅ تم رفض الطلب بنجاح"
                );
                setIsProcessDialogOpen(false);
                setSelectedApplication(null);
                setRejectionReason("");
                fetchData(); // Refresh data
            }
        } catch (error: unknown) {
            console.error("❌ Error processing application:", error);
            const errorObj = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                errorObj?.response?.data?.message || "فشل معالجة الطلب";
            alert("❌ " + message);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
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

    const filteredApplications = applications.filter((app) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                app.studentCode.toLowerCase().includes(query) ||
                app.studentNameAr.toLowerCase().includes(query) ||
                app.studentNameEn.toLowerCase().includes(query) ||
                app.departmentNameAr.toLowerCase().includes(query)
            );
        }
        return true;
    });

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            جاري تحميل الطلبات...
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
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        📋 طلبات اختيار التخصصات
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        إدارة ومراجعة طلبات الطلاب لاختيار التخصصات
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        إجمالي الطلبات
                                    </p>
                                    <p className="text-2xl font-bold mt-1">
                                        {statistics.total}
                                    </p>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        قيد المراجعة
                                    </p>
                                    <p className="text-2xl font-bold mt-1 text-yellow-600">
                                        {statistics.pending}
                                    </p>
                                </div>
                                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        موافق عليها
                                    </p>
                                    <p className="text-2xl font-bold mt-1 text-green-600">
                                        {statistics.approved}
                                    </p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        مرفوضة
                                    </p>
                                    <p className="text-2xl font-bold mt-1 text-red-600">
                                        {statistics.rejected}
                                    </p>
                                </div>
                                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="ابحث بالاسم أو الرقم الجامعي أو القسم..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pr-10"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-600" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option value="all">جميع الحالات</option>
                                    <option value="PENDING">
                                        قيد المراجعة
                                    </option>
                                    <option value="APPROVED">
                                        موافق عليها
                                    </option>
                                    <option value="REJECTED">مرفوضة</option>
                                    <option value="WITHDRAWN">تم السحب</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            الطلبات ({filteredApplications.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredApplications.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">لا توجد طلبات</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-sm font-medium">
                                                الرقم الجامعي
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">
                                                اسم الطالب
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">
                                                القسم المطلوب
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">
                                                المعدل
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">
                                                الحالة
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">
                                                تاريخ التقديم
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">
                                                الإجراءات
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredApplications.map((app) => (
                                            <tr
                                                key={app.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-4 py-3 text-sm">
                                                    {app.studentCode}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {app.studentNameAr}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {app.departmentNameAr}
                                                    <span className="text-gray-500 text-xs mr-1">
                                                        ({app.departmentCode})
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3 text-blue-600" />
                                                        {app.studentGpa.toFixed(
                                                            2
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(app.status)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(
                                                        app.submittedAt
                                                    ).toLocaleDateString(
                                                        "ar-EG"
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    app
                                                                )
                                                            }>
                                                            <Eye className="w-3 h-3 ml-1" />
                                                            عرض
                                                        </Button>
                                                        {app.status ===
                                                            "PENDING" && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                    onClick={() =>
                                                                        handleProcessClick(
                                                                            app,
                                                                            "APPROVED"
                                                                        )
                                                                    }>
                                                                    <CheckCircle className="w-3 h-3 ml-1" />
                                                                    موافقة
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        handleProcessClick(
                                                                            app,
                                                                            "REJECTED"
                                                                        )
                                                                    }>
                                                                    <XCircle className="w-3 h-3 ml-1" />
                                                                    رفض
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Details Dialog */}
            <Dialog
                open={isDetailDialogOpen}
                onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>تفاصيل الطلب</DialogTitle>
                    </DialogHeader>
                    {selectedApplication && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">
                                        الرقم الجامعي
                                    </Label>
                                    <p className="font-medium">
                                        {selectedApplication.studentCode}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">
                                        المعدل التراكمي
                                    </Label>
                                    <p className="font-medium">
                                        {selectedApplication.studentGpa.toFixed(
                                            2
                                        )}{" "}
                                        / 4.0
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-600">
                                    اسم الطالب
                                </Label>
                                <p className="font-medium">
                                    {selectedApplication.studentNameAr}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {selectedApplication.studentNameEn}
                                </p>
                            </div>

                            <div>
                                <Label className="text-gray-600">
                                    القسم المطلوب
                                </Label>
                                <p className="font-medium">
                                    {selectedApplication.departmentNameAr} (
                                    {selectedApplication.departmentCode})
                                </p>
                            </div>

                            <div>
                                <Label className="text-gray-600">الحالة</Label>
                                <div className="mt-1">
                                    {getStatusBadge(selectedApplication.status)}
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-600">
                                    تاريخ التقديم
                                </Label>
                                <p className="font-medium">
                                    {new Date(
                                        selectedApplication.submittedAt
                                    ).toLocaleDateString("ar-EG", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>

                            {selectedApplication.statement && (
                                <div>
                                    <Label className="text-gray-600">
                                        سبب اختيار القسم
                                    </Label>
                                    <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                                        {selectedApplication.statement}
                                    </p>
                                </div>
                            )}

                            {selectedApplication.processedAt && (
                                <div>
                                    <Label className="text-gray-600">
                                        تاريخ المعالجة
                                    </Label>
                                    <p className="font-medium">
                                        {new Date(
                                            selectedApplication.processedAt
                                        ).toLocaleDateString("ar-EG", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            )}

                            {selectedApplication.rejectionReason && (
                                <div>
                                    <Label className="text-red-600">
                                        سبب الرفض
                                    </Label>
                                    <p className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600">
                                        {selectedApplication.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDetailDialogOpen(false)}>
                            إغلاق
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Process Dialog */}
            <Dialog
                open={isProcessDialogOpen}
                onOpenChange={setIsProcessDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {processAction === "APPROVED"
                                ? "الموافقة على الطلب"
                                : "رفض الطلب"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedApplication?.studentNameAr} -{" "}
                            {selectedApplication?.departmentNameAr}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {processAction === "APPROVED" ? (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm text-green-800 dark:text-green-300">
                                    ⚠️ عند الموافقة، سيتم تعيين الطالب في قسم{" "}
                                    <strong>
                                        {selectedApplication?.departmentNameAr}
                                    </strong>{" "}
                                    ولن يتمكن من التقديم لقسم آخر.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="rejectionReason">
                                    سبب الرفض{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="rejectionReason"
                                    placeholder="اكتب سبب رفض الطلب (على الأقل 10 أحرف)..."
                                    value={rejectionReason}
                                    onChange={(e) =>
                                        setRejectionReason(e.target.value)
                                    }
                                    rows={4}
                                    className={
                                        rejectionReason &&
                                        rejectionReason.length < 10
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {rejectionReason &&
                                    rejectionReason.length < 10 && (
                                        <p className="text-xs text-red-500">
                                            يجب أن يكون السبب 10 أحرف على الأقل
                                        </p>
                                    )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsProcessDialogOpen(false)}
                            disabled={processing}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleProcessApplication}
                            disabled={
                                processing ||
                                (processAction === "REJECTED" &&
                                    rejectionReason.length < 10)
                            }
                            className={
                                processAction === "APPROVED"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                            }>
                            {processing
                                ? "جاري المعالجة..."
                                : processAction === "APPROVED"
                                ? "تأكيد الموافقة"
                                : "تأكيد الرفض"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
