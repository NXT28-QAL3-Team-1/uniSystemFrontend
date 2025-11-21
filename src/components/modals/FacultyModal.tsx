import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { facultyService } from "@/services/api";

const facultySchema = z.object({
    staffCode: z.string().min(1, "Staff code is required"),
    nameEn: z.string().min(1, "English name is required"),
    nameAr: z.string().min(1, "Arabic name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    type: z.enum(["FACULTY", "TA"]),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FacultyFormData = z.infer<typeof facultySchema>;

interface FacultyModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    faculty?: {
        id: string;
        staffCode: string;
        nameEn: string;
        nameAr: string;
        user: {
            email: string;
        };
        phone?: string;
        type: "FACULTY" | "TA";
    };
}

export default function FacultyModal({
    open,
    onClose,
    onSuccess,
    faculty,
}: FacultyModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FacultyFormData>({
        resolver: zodResolver(facultySchema),
    });

    useEffect(() => {
        if (open) {
            if (faculty) {
                reset({
                    staffCode: faculty.staffCode,
                    nameEn: faculty.nameEn,
                    nameAr: faculty.nameAr,
                    email: faculty.user.email,
                    phone: faculty.phone,
                    type: faculty.type,
                    password: "",
                });
            } else {
                reset({
                    staffCode: "",
                    nameEn: "",
                    nameAr: "",
                    email: "",
                    phone: "",
                    type: "FACULTY",
                    password: "",
                });
            }
        }
    }, [open, faculty, reset]);

    const onSubmit = async (data: FacultyFormData) => {
        try {
            setLoading(true);

            if (faculty) {
                // Update
                await facultyService.update(faculty.id, {
                    nameEn: data.nameEn,
                    nameAr: data.nameAr,
                    phone: data.phone,
                    type: data.type,
                });
            } else {
                // Create
                await facultyService.create(data);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving faculty:", error);
            alert("حدث خطأ أثناء حفظ البيانات");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {faculty ? t("faculty.edit") : t("faculty.create")}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="staffCode">الرقم الوظيفي</Label>
                            <Input
                                id="staffCode"
                                {...register("staffCode")}
                                disabled={!!faculty}
                                className={
                                    errors.staffCode ? "border-red-500" : ""
                                }
                            />
                            {errors.staffCode && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.staffCode.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="type">النوع</Label>
                            <select
                                {...register("type")}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="FACULTY">عضو هيئة تدريس</option>
                                <option value="TA">معيد</option>
                            </select>
                            {errors.type && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.type.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="nameAr">الاسم بالعربية</Label>
                            <Input
                                id="nameAr"
                                {...register("nameAr")}
                                className={
                                    errors.nameAr ? "border-red-500" : ""
                                }
                            />
                            {errors.nameAr && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.nameAr.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                            <Input
                                id="nameEn"
                                {...register("nameEn")}
                                className={
                                    errors.nameEn ? "border-red-500" : ""
                                }
                            />
                            {errors.nameEn && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.nameEn.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                disabled={!!faculty}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="phone">رقم الهاتف</Label>
                            <Input
                                id="phone"
                                {...register("phone")}
                                className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {!faculty && (
                        <div>
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                className={
                                    errors.password ? "border-red-500" : ""
                                }
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}>
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? t("common.loading") : t("common.save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
