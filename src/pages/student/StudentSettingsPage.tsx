import { useState, useEffect } from "react";
import {
    User,
    Lock,
    Bell,
    Palette,
    Shield,
    Save,
    Eye,
    EyeOff,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studentsService, authService } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

interface StudentData {
    id: string;
    studentCode: string;
    nameAr: string;
    nameEn: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE";
    nationalId?: string;
    department?: {
        nameAr: string;
        nameEn: string;
    };
    batch?: {
        name: string;
    };
    status: string;
    enrollmentDate: string;
}

interface ProfileFormData {
    nameAr: string;
    nameEn: string;
    phone: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE" | "";
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function StudentSettingsPage() {
    const { user } = useAuthStore();
    const { theme, setTheme } = useThemeStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [activeTab, setActiveTab] = useState("profile");

    // Profile form state
    const [profileForm, setProfileForm] = useState<ProfileFormData>({
        nameAr: "",
        nameEn: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
    });
    const [profileChanged, setProfileChanged] = useState(false);

    // Password form state
    const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Preferences state
    const [notifications, setNotifications] = useState({
        emailGrades: true,
        emailMaterials: true,
        emailSchedule: true,
        emailAnnouncements: true,
        inAppAlerts: true,
        sound: false,
    });

    const [privacy, setPrivacy] = useState({
        profileVisibility: "department",
        showEmail: false,
        showPhone: false,
        allowFacultyContact: true,
    });

    useEffect(() => {
        fetchStudentData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            console.log("🔧 Fetching student settings for user:", user?.id);

            const response = await studentsService.getByUserId(user?.id || "");
            if (response.success) {
                const data = response.data;
                setStudentData(data);

                // Populate profile form
                setProfileForm({
                    nameAr: data.nameAr || "",
                    nameEn: data.nameEn || "",
                    phone: data.phone || "",
                    dateOfBirth: data.dateOfBirth
                        ? data.dateOfBirth.split("T")[0]
                        : "",
                    gender: data.gender || "",
                });

                console.log("✅ Student data loaded:", data);
            }
        } catch (error) {
            console.error("❌ Error fetching student data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (
        field: keyof ProfileFormData,
        value: string
    ) => {
        setProfileForm((prev) => ({ ...prev, [field]: value }));
        setProfileChanged(true);
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            console.log("💾 Saving profile data:", profileForm);
            console.log("📝 Student ID:", studentData?.id);

            const payload: {
                nameAr: string;
                nameEn: string;
                phone?: string;
                dateOfBirth?: string;
                gender?: string;
            } = {
                nameAr: profileForm.nameAr,
                nameEn: profileForm.nameEn,
            };

            // Only include optional fields if they have values
            if (profileForm.phone) payload.phone = profileForm.phone;
            if (profileForm.dateOfBirth)
                payload.dateOfBirth = profileForm.dateOfBirth;
            if (profileForm.gender) payload.gender = profileForm.gender;

            console.log("📤 Sending payload:", payload);

            const response = await studentsService.update(
                studentData?.id || "",
                payload
            );

            if (response.success) {
                alert("✅ تم حفظ التغييرات بنجاح");
                setProfileChanged(false);
                fetchStudentData();
            }
        } catch (error: unknown) {
            console.error("❌ Error saving profile:", error);
            const errorObj = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                errorObj?.response?.data?.message || "فشل حفظ التغييرات";
            alert("❌ " + message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelProfile = () => {
        if (studentData) {
            setProfileForm({
                nameAr: studentData.nameAr || "",
                nameEn: studentData.nameEn || "",
                phone: studentData.phone || "",
                dateOfBirth: studentData.dateOfBirth
                    ? studentData.dateOfBirth.split("T")[0]
                    : "",
                gender: studentData.gender || "",
            });
            setProfileChanged(false);
        }
    };

    const handleChangePassword = async () => {
        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {
            alert("❌ الرجاء ملء جميع الحقول");
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            alert("❌ كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("❌ كلمة المرور الجديدة غير متطابقة");
            return;
        }

        try {
            setSaving(true);
            console.log("🔒 Changing password...");

            const response = await authService.changePassword(
                passwordForm.currentPassword,
                passwordForm.newPassword
            );

            if (response.success) {
                // Reset form
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                alert("✅ تم تغيير كلمة المرور بنجاح");
            }
        } catch (error: unknown) {
            console.error("❌ Error changing password:", error);
            const errorObj = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                errorObj?.response?.data?.message || "فشل تغيير كلمة المرور";
            alert("❌ " + message);
        } finally {
            setSaving(false);
        }
    };

    const handleThemeChange = (newTheme: "light" | "dark") => {
        setTheme(newTheme);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            جاري تحميل الإعدادات...
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
                        ⚙️ الإعدادات
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        إدارة الملف الشخصي والتفضيلات
                    </p>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger
                            value="profile"
                            className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            الملف الشخصي
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            الأمان
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            الإشعارات
                        </TabsTrigger>
                        <TabsTrigger
                            value="display"
                            className="flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            العرض
                        </TabsTrigger>
                        <TabsTrigger
                            value="privacy"
                            className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            الخصوصية
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>المعلومات الشخصية</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="nameAr">
                                            الاسم بالعربية *
                                        </Label>
                                        <Input
                                            id="nameAr"
                                            value={profileForm.nameAr}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "nameAr",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="nameEn">
                                            الاسم بالإنجليزية *
                                        </Label>
                                        <Input
                                            id="nameEn"
                                            value={profileForm.nameEn}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "nameEn",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">
                                            رقم الهاتف
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "phone",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="+966XXXXXXXXX"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dateOfBirth">
                                            تاريخ الميلاد
                                        </Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={profileForm.dateOfBirth}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "dateOfBirth",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="gender">الجنس</Label>
                                        <select
                                            id="gender"
                                            value={profileForm.gender}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "gender",
                                                    e.target.value
                                                )
                                            }
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            <option value="">اختر</option>
                                            <option value="MALE">ذكر</option>
                                            <option value="FEMALE">أنثى</option>
                                        </select>
                                    </div>
                                </div>

                                {profileChanged && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={saving}>
                                            <Save className="w-4 h-4 me-2" />
                                            حفظ التغييرات
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleCancelProfile}>
                                            إلغاء
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Read-Only Academic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>المعلومات الأكاديمية</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>الرقم الجامعي</Label>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                            {studentData?.studentCode}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>البريد الإلكتروني</Label>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                            {studentData?.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>القسم</Label>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                            {studentData?.department?.nameAr ||
                                                "غير محدد"}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>الدفعة</Label>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                            {studentData?.batch?.name ||
                                                "غير محدد"}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>الحالة الأكاديمية</Label>
                                        <Badge className="mt-2">
                                            {studentData?.status}
                                        </Badge>
                                    </div>
                                    {studentData?.nationalId && (
                                        <div>
                                            <Label>رقم الهوية</Label>
                                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                                {studentData.nationalId}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>تغيير كلمة المرور</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="currentPassword">
                                        كلمة المرور الحالية *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={
                                                showPasswords.current
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={passwordForm.currentPassword}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    currentPassword:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords({
                                                    ...showPasswords,
                                                    current:
                                                        !showPasswords.current,
                                                })
                                            }
                                            className="absolute left-3 top-1/2 -translate-y-1/2">
                                            {showPasswords.current ? (
                                                <EyeOff className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="newPassword">
                                        كلمة المرور الجديدة * (8 أحرف على الأقل)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={
                                                showPasswords.new
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={passwordForm.newPassword}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    newPassword: e.target.value,
                                                })
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords({
                                                    ...showPasswords,
                                                    new: !showPasswords.new,
                                                })
                                            }
                                            className="absolute left-3 top-1/2 -translate-y-1/2">
                                            {showPasswords.new ? (
                                                <EyeOff className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword">
                                        تأكيد كلمة المرور *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={
                                                showPasswords.confirm
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    confirmPassword:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords({
                                                    ...showPasswords,
                                                    confirm:
                                                        !showPasswords.confirm,
                                                })
                                            }
                                            className="absolute left-3 top-1/2 -translate-y-1/2">
                                            {showPasswords.confirm ? (
                                                <EyeOff className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleChangePassword}
                                    disabled={saving}>
                                    <Lock className="w-4 h-4 me-2" />
                                    تغيير كلمة المرور
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>إشعارات البريد الإلكتروني</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries({
                                    emailGrades: "إعلانات الدرجات",
                                    emailMaterials: "تحميل المواد الدراسية",
                                    emailSchedule: "تغييرات الجدول",
                                    emailAnnouncements: "الإعلانات العامة",
                                }).map(([key, label]) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between">
                                        <span>{label}</span>
                                        <input
                                            type="checkbox"
                                            checked={
                                                notifications[
                                                    key as keyof typeof notifications
                                                ]
                                            }
                                            onChange={(e) =>
                                                setNotifications({
                                                    ...notifications,
                                                    [key]: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4"
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>إشعارات التطبيق</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span>التنبيهات الفورية</span>
                                    <input
                                        type="checkbox"
                                        checked={notifications.inAppAlerts}
                                        onChange={(e) =>
                                            setNotifications({
                                                ...notifications,
                                                inAppAlerts: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>الأصوات</span>
                                    <input
                                        type="checkbox"
                                        checked={notifications.sound}
                                        onChange={(e) =>
                                            setNotifications({
                                                ...notifications,
                                                sound: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Display Tab */}
                    <TabsContent value="display" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>المظهر</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>الوضع</Label>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {[
                                            { value: "light", label: "فاتح" },
                                            { value: "dark", label: "داكن" },
                                        ].map((option) => (
                                            <Button
                                                key={option.value}
                                                variant={
                                                    theme === option.value
                                                        ? "default"
                                                        : "outline"
                                                }
                                                onClick={() =>
                                                    handleThemeChange(
                                                        option.value as
                                                            | "light"
                                                            | "dark"
                                                    )
                                                }
                                                className="w-full">
                                                {option.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Privacy Tab */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>إعدادات الخصوصية</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>ظهور الملف الشخصي</Label>
                                    <select
                                        value={privacy.profileVisibility}
                                        onChange={(e) =>
                                            setPrivacy({
                                                ...privacy,
                                                profileVisibility:
                                                    e.target.value,
                                            })
                                        }
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                                        <option value="public">
                                            عام (جميع الطلاب)
                                        </option>
                                        <option value="department">
                                            القسم فقط
                                        </option>
                                        <option value="private">
                                            خاص (أنا فقط)
                                        </option>
                                    </select>
                                </div>

                                <div className="space-y-3 mt-4">
                                    <div className="flex items-center justify-between">
                                        <span>
                                            إظهار البريد الإلكتروني للطلاب
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={privacy.showEmail}
                                            onChange={(e) =>
                                                setPrivacy({
                                                    ...privacy,
                                                    showEmail: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>إظهار رقم الهاتف للطلاب</span>
                                        <input
                                            type="checkbox"
                                            checked={privacy.showPhone}
                                            onChange={(e) =>
                                                setPrivacy({
                                                    ...privacy,
                                                    showPhone: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>السماح للمدرسين بالتواصل</span>
                                        <input
                                            type="checkbox"
                                            checked={
                                                privacy.allowFacultyContact
                                            }
                                            onChange={(e) =>
                                                setPrivacy({
                                                    ...privacy,
                                                    allowFacultyContact:
                                                        e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
