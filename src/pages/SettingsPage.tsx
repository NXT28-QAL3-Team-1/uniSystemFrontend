import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    Database,
    Bell,
    Shield,
    Mail,
    Globe,
    Users,
    Calendar,
    FileText,
    Download,
    Upload,
    Trash2,
    RefreshCw,
    Save,
    Lock,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { backupService } from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface SystemSettings {
    // General Settings
    universityName: string;
    universityNameEn: string;
    universityLogo: string;
    academicYear: string;
    defaultLanguage: string;
    timezone: string;

    // Registration Settings
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
    minPasswordLength: number;
    maxLoginAttempts: number;
    sessionTimeout: number;

    // Academic Settings
    maxCreditsPerTerm: number;
    minCreditsForFullTime: number;
    passingGrade: number;
    gradingScale: string;
    attendanceRequired: boolean;
    minAttendancePercentage: number;

    // Notification Settings
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    notifyOnEnrollment: boolean;
    notifyOnGradePosted: boolean;
    notifyOnDropDeadline: boolean;

    // System Settings
    maintenanceMode: boolean;
    allowDataExport: boolean;
    enableAuditLog: boolean;
    autoBackup: boolean;
    backupFrequency: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SystemSettings>({
        universityName: "جامعة الملك سعود",
        universityNameEn: "King Saud University",
        universityLogo: "",
        academicYear: "2024-2025",
        defaultLanguage: "ar",
        timezone: "Asia/Riyadh",
        allowSelfRegistration: false,
        requireEmailVerification: true,
        minPasswordLength: 8,
        maxLoginAttempts: 5,
        sessionTimeout: 30,
        maxCreditsPerTerm: 18,
        minCreditsForFullTime: 12,
        passingGrade: 60,
        gradingScale: "percentage",
        attendanceRequired: true,
        minAttendancePercentage: 75,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notifyOnEnrollment: true,
        notifyOnGradePosted: true,
        notifyOnDropDeadline: true,
        maintenanceMode: false,
        allowDataExport: true,
        enableAuditLog: true,
        autoBackup: true,
        backupFrequency: "daily",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalFaculty: 0,
        totalCourses: 0,
        activeTerms: 0,
        databaseSize: "0 MB",
        lastBackup: "لم يتم عمل نسخة احتياطية",
    });

    useEffect(() => {
        // Load settings from API
        loadSettings();
        loadStats();
    }, []);

    const loadSettings = async () => {
        try {
            // TODO: Replace with actual API call
            // const response = await api.get("/settings");
            // setSettings(response.data);
            console.log("Settings loaded");
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    };

    const loadStats = async () => {
        try {
            const [backupStats, systemStats] = await Promise.all([
                backupService.getBackupStats(),
                backupService.getSystemStats(),
            ]);

            setStats({
                totalUsers: systemStats.data.totalUsers,
                totalStudents: systemStats.data.totalStudents,
                totalFaculty: systemStats.data.totalFaculty,
                totalCourses: systemStats.data.totalCourses,
                activeTerms: systemStats.data.activeTerms,
                databaseSize: backupStats.data.databaseSize,
                lastBackup: backupStats.data.lastBackup,
            });
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            // TODO: Replace with actual API call
            // await api.put("/settings", settings);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSaveMessage({ type: "success", text: "تم حفظ الإعدادات بنجاح" });
        } catch (error) {
            console.error("Error saving settings:", error);
            setSaveMessage({ type: "error", text: "فشل حفظ الإعدادات" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBackupDatabase = async () => {
        try {
            const result = await backupService.createBackup();
            if (result.success) {
                // Download the backup file automatically
                const response = await backupService.downloadBackup(
                    result.data.filename
                );

                // Create download link
                const blob = new Blob([response.data], {
                    type: "application/sql",
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = result.data.filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                alert(
                    `تم إنشاء النسخة الاحتياطية وتحميلها بنجاح: ${result.data.filename}`
                );
                loadStats();
            }
        } catch (error) {
            console.error("Error backing up database:", error);
            alert("فشل إنشاء النسخة الاحتياطية");
        }
    };

    const handleRestoreDatabase = async () => {
        // Create file input element
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".sql";

        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];

            if (!file) {
                return;
            }

            if (
                !confirm(
                    `هل أنت متأكد من استعادة قاعدة البيانات من الملف: ${file.name}؟ سيتم استبدال جميع البيانات الحالية.`
                )
            ) {
                return;
            }

            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await backupService.uploadAndRestore(formData);

                if (response.success) {
                    alert("تم استعادة قاعدة البيانات بنجاح");
                    loadStats();
                }
            } catch (error) {
                console.error("Error restoring database:", error);
                alert("فشلت عملية الاستعادة");
            }
        };

        input.click();
    };

    const handleClearCache = async () => {
        try {
            const result = await backupService.clearCache();
            if (result.success) {
                alert(result.message || "تم مسح ذاكرة التخزين المؤقت بنجاح");
            }
        } catch (error) {
            console.error("Error clearing cache:", error);
            alert("فشل مسح ذاكرة التخزين المؤقت");
        }
    };

    const handleExportData = async (type: string) => {
        try {
            const response = await backupService.exportData(type);

            // Create download link
            const blob = new Blob([JSON.stringify(response.data, null, 2)], {
                type: "application/json",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${type}-export-${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert(`تم تصدير ${type} بنجاح`);
        } catch (error) {
            console.error("Error exporting data:", error);
            alert("فشل تصدير البيانات");
        }
    };

    const handleDeleteAllData = async () => {
        const confirmation = prompt(
            'هذا الإجراء خطير جداً! سيتم حذف جميع البيانات ماعدا حساب الأدمن.\n\nاكتب "حذف" للتأكيد:'
        );

        if (confirmation !== "حذف") {
            alert("تم إلغاء العملية");
            return;
        }

        if (!confirm("هل أنت متأكد تماماً؟ لا يمكن التراجع عن هذا الإجراء!")) {
            alert("تم إلغاء العملية");
            return;
        }

        try {
            const result = await backupService.deleteAllData();
            if (result.success) {
                alert("تم حذف جميع البيانات بنجاح (ماعدا حساب الأدمن)");
                loadStats();
            }
        } catch (error) {
            console.error("Error deleting all data:", error);
            alert("فشل حذف البيانات");
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-6 space-y-6" dir="rtl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Settings className="h-8 w-8" />
                            إعدادات النظام
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            إدارة إعدادات النظام والتفضيلات
                        </p>
                    </div>
                    <Button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        size="lg">
                        <Save className="h-4 w-4 ml-2" />
                        {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                </div>

                {saveMessage && (
                    <Alert
                        variant={
                            saveMessage.type === "error"
                                ? "destructive"
                                : "default"
                        }>
                        {saveMessage.type === "success" ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{saveMessage.text}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="general">
                            <Globe className="h-4 w-4 ml-2" />
                            عام
                        </TabsTrigger>
                        <TabsTrigger value="academic">
                            <Calendar className="h-4 w-4 ml-2" />
                            أكاديمي
                        </TabsTrigger>
                        <TabsTrigger value="security">
                            <Shield className="h-4 w-4 ml-2" />
                            الأمان
                        </TabsTrigger>
                        <TabsTrigger value="notifications">
                            <Bell className="h-4 w-4 ml-2" />
                            الإشعارات
                        </TabsTrigger>
                        <TabsTrigger value="database">
                            <Database className="h-4 w-4 ml-2" />
                            قاعدة البيانات
                        </TabsTrigger>
                        <TabsTrigger value="system">
                            <Settings className="h-4 w-4 ml-2" />
                            النظام
                        </TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>الإعدادات العامة</CardTitle>
                                <CardDescription>
                                    إعدادات الجامعة الأساسية والواجهة
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="universityName">
                                            اسم الجامعة (عربي)
                                        </Label>
                                        <Input
                                            id="universityName"
                                            value={settings.universityName}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    universityName:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="universityNameEn">
                                            اسم الجامعة (English)
                                        </Label>
                                        <Input
                                            id="universityNameEn"
                                            value={settings.universityNameEn}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    universityNameEn:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="academicYear">
                                            السنة الأكاديمية
                                        </Label>
                                        <Input
                                            id="academicYear"
                                            value={settings.academicYear}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    academicYear:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="defaultLanguage">
                                            اللغة الافتراضية
                                        </Label>
                                        <Select
                                            value={settings.defaultLanguage}
                                            onValueChange={(value) =>
                                                setSettings({
                                                    ...settings,
                                                    defaultLanguage: value,
                                                })
                                            }>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ar">
                                                    العربية
                                                </SelectItem>
                                                <SelectItem value="en">
                                                    English
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timezone">
                                        المنطقة الزمنية
                                    </Label>
                                    <Select
                                        value={settings.timezone}
                                        onValueChange={(value) =>
                                            setSettings({
                                                ...settings,
                                                timezone: value,
                                            })
                                        }>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Asia/Riyadh">
                                                الرياض (GMT+3)
                                            </SelectItem>
                                            <SelectItem value="Asia/Dubai">
                                                دبي (GMT+4)
                                            </SelectItem>
                                            <SelectItem value="Asia/Cairo">
                                                القاهرة (GMT+2)
                                            </SelectItem>
                                            <SelectItem value="UTC">
                                                UTC (GMT+0)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>إحصائيات النظام</CardTitle>
                                <CardDescription>
                                    معلومات عامة عن النظام
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="flex flex-col items-center p-4 border rounded-lg">
                                        <Users className="h-8 w-8 mb-2 text-primary" />
                                        <div className="text-2xl font-bold">
                                            {stats.totalUsers}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            إجمالي المستخدمين
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center p-4 border rounded-lg">
                                        <Users className="h-8 w-8 mb-2 text-blue-500" />
                                        <div className="text-2xl font-bold">
                                            {stats.totalStudents}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            الطلاب
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center p-4 border rounded-lg">
                                        <Users className="h-8 w-8 mb-2 text-green-500" />
                                        <div className="text-2xl font-bold">
                                            {stats.totalFaculty}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            أعضاء هيئة التدريس
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center p-4 border rounded-lg">
                                        <FileText className="h-8 w-8 mb-2 text-orange-500" />
                                        <div className="text-2xl font-bold">
                                            {stats.totalCourses}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            المقررات
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Academic Settings */}
                    <TabsContent value="academic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>الإعدادات الأكاديمية</CardTitle>
                                <CardDescription>
                                    إعدادات التسجيل والساعات المعتمدة والتقديرات
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxCredits">
                                            الحد الأقصى للساعات المعتمدة
                                        </Label>
                                        <Input
                                            id="maxCredits"
                                            type="number"
                                            value={settings.maxCreditsPerTerm}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    maxCreditsPerTerm: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="minCredits">
                                            الحد الأدنى للتفرغ الكامل
                                        </Label>
                                        <Input
                                            id="minCredits"
                                            type="number"
                                            value={
                                                settings.minCreditsForFullTime
                                            }
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    minCreditsForFullTime:
                                                        parseInt(
                                                            e.target.value
                                                        ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="passingGrade">
                                            درجة النجاح
                                        </Label>
                                        <Input
                                            id="passingGrade"
                                            type="number"
                                            value={settings.passingGrade}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    passingGrade: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gradingScale">
                                            نظام التقدير
                                        </Label>
                                        <Select
                                            value={settings.gradingScale}
                                            onValueChange={(value) =>
                                                setSettings({
                                                    ...settings,
                                                    gradingScale: value,
                                                })
                                            }>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">
                                                    نسبة مئوية (0-100)
                                                </SelectItem>
                                                <SelectItem value="gpa">
                                                    GPA (0-4)
                                                </SelectItem>
                                                <SelectItem value="letters">
                                                    حروف (A-F)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>الحضور إلزامي</Label>
                                            <p className="text-sm text-muted-foreground">
                                                تفعيل متطلبات الحضور للطلاب
                                            </p>
                                        </div>
                                        <Switch
                                            checked={
                                                settings.attendanceRequired
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    attendanceRequired: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    {settings.attendanceRequired && (
                                        <div className="space-y-2 mr-6">
                                            <Label htmlFor="minAttendance">
                                                الحد الأدنى لنسبة الحضور (%)
                                            </Label>
                                            <Input
                                                id="minAttendance"
                                                type="number"
                                                value={
                                                    settings.minAttendancePercentage
                                                }
                                                onChange={(e) =>
                                                    setSettings({
                                                        ...settings,
                                                        minAttendancePercentage:
                                                            parseInt(
                                                                e.target.value
                                                            ),
                                                    })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>إعدادات الأمان</CardTitle>
                                <CardDescription>
                                    إدارة الأمان والمصادقة والجلسات
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>
                                                السماح بالتسجيل الذاتي
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                السماح للمستخدمين بإنشاء حسابات
                                                جديدة
                                            </p>
                                        </div>
                                        <Switch
                                            checked={
                                                settings.allowSelfRegistration
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    allowSelfRegistration:
                                                        checked,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>
                                                التحقق من البريد الإلكتروني
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                طلب التحقق من البريد الإلكتروني
                                                للحسابات الجديدة
                                            </p>
                                        </div>
                                        <Switch
                                            checked={
                                                settings.requireEmailVerification
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    requireEmailVerification:
                                                        checked,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="minPassword">
                                            الحد الأدنى لطول كلمة المرور
                                        </Label>
                                        <Input
                                            id="minPassword"
                                            type="number"
                                            value={settings.minPasswordLength}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    minPasswordLength: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxAttempts">
                                            الحد الأقصى لمحاولات تسجيل الدخول
                                        </Label>
                                        <Input
                                            id="maxAttempts"
                                            type="number"
                                            value={settings.maxLoginAttempts}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    maxLoginAttempts: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sessionTimeout">
                                        مهلة الجلسة (بالدقائق)
                                    </Label>
                                    <Input
                                        id="sessionTimeout"
                                        type="number"
                                        value={settings.sessionTimeout}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                sessionTimeout: parseInt(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        سيتم تسجيل خروج المستخدمين تلقائيًا بعد
                                        هذه المدة من عدم النشاط
                                    </p>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>تفعيل سجل التدقيق</Label>
                                        <p className="text-sm text-muted-foreground">
                                            تسجيل جميع العمليات المهمة في النظام
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.enableAuditLog}
                                        onCheckedChange={(checked) =>
                                            setSettings({
                                                ...settings,
                                                enableAuditLog: checked,
                                            })
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>إعدادات الإشعارات</CardTitle>
                                <CardDescription>
                                    إدارة إشعارات النظام وتنبيهات المستخدمين
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                إشعارات البريد الإلكتروني
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                إرسال إشعارات عبر البريد
                                                الإلكتروني
                                            </p>
                                        </div>
                                        <Switch
                                            checked={
                                                settings.emailNotifications
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    emailNotifications: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>
                                                إشعارات الرسائل النصية
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                إرسال إشعارات عبر SMS
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.smsNotifications}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    smsNotifications: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>إشعارات الدفع</Label>
                                            <p className="text-sm text-muted-foreground">
                                                إرسال إشعارات فورية في المتصفح
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.pushNotifications}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    pushNotifications: checked,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <h3 className="font-semibold">
                                        أنواع الإشعارات
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        اختر الأحداث التي سيتم إرسال إشعارات
                                        بشأنها
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>إشعار عند التسجيل في مادة</Label>
                                        <Switch
                                            checked={
                                                settings.notifyOnEnrollment
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifyOnEnrollment: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>إشعار عند نشر الدرجات</Label>
                                        <Switch
                                            checked={
                                                settings.notifyOnGradePosted
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifyOnGradePosted:
                                                        checked,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>
                                            إشعار قبل انتهاء فترة الحذف
                                        </Label>
                                        <Switch
                                            checked={
                                                settings.notifyOnDropDeadline
                                            }
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    notifyOnDropDeadline:
                                                        checked,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Database Settings */}
                    <TabsContent value="database" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>معلومات قاعدة البيانات</CardTitle>
                                <CardDescription>
                                    حالة قاعدة البيانات والنسخ الاحتياطية
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            حجم قاعدة البيانات
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {stats.databaseSize}
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            الفصول النشطة
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {stats.activeTerms}
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            آخر نسخة احتياطية
                                        </div>
                                        <div className="text-sm font-medium">
                                            {stats.lastBackup}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>
                                                النسخ الاحتياطي التلقائي
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                إنشاء نسخ احتياطية تلقائية من
                                                قاعدة البيانات
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.autoBackup}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    autoBackup: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    {settings.autoBackup && (
                                        <div className="space-y-2 mr-6">
                                            <Label htmlFor="backupFrequency">
                                                تكرار النسخ الاحتياطي
                                            </Label>
                                            <Select
                                                value={settings.backupFrequency}
                                                onValueChange={(value) =>
                                                    setSettings({
                                                        ...settings,
                                                        backupFrequency: value,
                                                    })
                                                }>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hourly">
                                                        كل ساعة
                                                    </SelectItem>
                                                    <SelectItem value="daily">
                                                        يومي
                                                    </SelectItem>
                                                    <SelectItem value="weekly">
                                                        أسبوعي
                                                    </SelectItem>
                                                    <SelectItem value="monthly">
                                                        شهري
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <h3 className="font-semibold">
                                        العمليات على قاعدة البيانات
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            onClick={handleBackupDatabase}
                                            variant="outline">
                                            <Download className="h-4 w-4 ml-2" />
                                            إنشاء نسخة احتياطية
                                        </Button>
                                        <Button
                                            onClick={handleRestoreDatabase}
                                            variant="outline">
                                            <Upload className="h-4 w-4 ml-2" />
                                            استعادة نسخة احتياطية
                                        </Button>
                                        <Button
                                            onClick={handleClearCache}
                                            variant="outline">
                                            <RefreshCw className="h-4 w-4 ml-2" />
                                            مسح ذاكرة التخزين المؤقت
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>تصدير البيانات</CardTitle>
                                <CardDescription>
                                    تصدير البيانات بتنسيقات مختلفة
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="space-y-0.5">
                                        <Label>السماح بتصدير البيانات</Label>
                                        <p className="text-sm text-muted-foreground">
                                            تمكين تصدير البيانات للمستخدمين
                                            المصرح لهم
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.allowDataExport}
                                        onCheckedChange={(checked) =>
                                            setSettings({
                                                ...settings,
                                                allowDataExport: checked,
                                            })
                                        }
                                    />
                                </div>

                                {settings.allowDataExport && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="space-y-3">
                                            <h4 className="font-medium">
                                                تصدير التقارير
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    onClick={() =>
                                                        handleExportData(
                                                            "students"
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm">
                                                    <Download className="h-4 w-4 ml-2" />
                                                    تصدير الطلاب
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleExportData(
                                                            "faculty"
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm">
                                                    <Download className="h-4 w-4 ml-2" />
                                                    تصدير أعضاء هيئة التدريس
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleExportData(
                                                            "courses"
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm">
                                                    <Download className="h-4 w-4 ml-2" />
                                                    تصدير المقررات
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleExportData(
                                                            "grades"
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm">
                                                    <Download className="h-4 w-4 ml-2" />
                                                    تصدير الدرجات
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleExportData(
                                                            "attendance"
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm">
                                                    <Download className="h-4 w-4 ml-2" />
                                                    تصدير سجلات الحضور
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* System Settings */}
                    <TabsContent value="system" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>إعدادات النظام المتقدمة</CardTitle>
                                <CardDescription>
                                    إدارة حالة النظام والصيانة
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        تحذير: الإعدادات في هذا القسم قد تؤثر
                                        على عمل النظام بالكامل. استخدمها بحذر.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                        <div className="space-y-0.5">
                                            <Label className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                وضع الصيانة
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                تعطيل الوصول إلى النظام مؤقتًا
                                                للصيانة
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings.maintenanceMode}
                                            onCheckedChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    maintenanceMode: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    {settings.maintenanceMode && (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                وضع الصيانة مفعل. المستخدمون
                                                العاديون لا يمكنهم الوصول إلى
                                                النظام حاليًا.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <h3 className="font-semibold">
                                        معلومات النظام
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                إصدار النظام:
                                            </span>
                                            <Badge variant="outline">
                                                v2.0.0
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                تاريخ آخر تحديث:
                                            </span>
                                            <span>2025-11-15</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                حالة النظام:
                                            </span>
                                            <Badge
                                                variant="default"
                                                className="bg-green-500">
                                                نشط
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                وقت التشغيل:
                                            </span>
                                            <span>45 يوم، 12 ساعة</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive">
                                    منطقة الخطر
                                </CardTitle>
                                <CardDescription>
                                    عمليات لا يمكن التراجع عنها. تأكد من معرفتك
                                    بما تفعله.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={handleDeleteAllData}>
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    حذف جميع البيانات
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    سيتم حذف جميع البيانات من قاعدة البيانات
                                    بشكل دائم (ماعدا حساب الأدمن)
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
