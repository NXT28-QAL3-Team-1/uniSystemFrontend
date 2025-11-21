import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const collegeSchema = z.object({
    code: z.string()
        .min(1, "كود الكلية مطلوب")
        .min(2, "كود الكلية يجب أن يكون على الأقل حرفين")
        .max(20, "كود الكلية طويل جداً")
        .regex(/^[A-Z0-9]+$/, "كود الكلية يجب أن يكون أحرف كبيرة وأرقام فقط")
        .transform(val => val.toUpperCase()),
    nameEn: z.string()
        .min(1, "الاسم بالإنجليزية مطلوب")
        .min(2, "الاسم بالإنجليزية يجب أن يكون على الأقل حرفين"),
    nameAr: z.string()
        .min(1, "الاسم بالعربية مطلوب")
        .min(2, "الاسم بالعربية يجب أن يكون على الأقل حرفين"),
    description: z.string().optional(),
});

type CollegeFormData = z.infer<typeof collegeSchema>;

interface CollegeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CollegeFormData) => Promise<void>;
    college?: {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
        description?: string;
    };
}

export default function CollegeModal({
    isOpen,
    onClose,
    onSubmit,
    college,
}: CollegeModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CollegeFormData>({
        resolver: zodResolver(collegeSchema),
        defaultValues: college || {
            code: "",
            nameEn: "",
            nameAr: "",
            description: "",
        },
    });

    useEffect(() => {
        if (college) {
            reset(college);
        } else {
            reset({
                code: "",
                nameEn: "",
                nameAr: "",
                description: "",
            });
        }
    }, [college, reset, isOpen]);

    const onSubmitForm = async (data: CollegeFormData) => {
        try {
            await onSubmit(data);
            reset();
            onClose();
        } catch {
            // Error is handled in the parent component
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {college ? "تعديل كلية" : "إضافة كلية جديدة"}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        disabled={isSubmitting}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmitForm)} className="p-6">
                    <div className="space-y-4">
                        {/* Code */}
                        <div className="space-y-2">
                            <Label htmlFor="code">كود الكلية *</Label>
                            <Input
                                id="code"
                                {...register("code")}
                                placeholder="CS"
                                className={errors.code ? "border-red-500" : ""}
                            />
                            {errors.code && (
                                <p className="text-sm text-red-500">
                                    {errors.code.message}
                                </p>
                            )}
                        </div>

                        {/* Name in Arabic */}
                        <div className="space-y-2">
                            <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                            <Input
                                id="nameAr"
                                {...register("nameAr")}
                                placeholder="كلية علوم الحاسب"
                                className={
                                    errors.nameAr ? "border-red-500" : ""
                                }
                            />
                            {errors.nameAr && (
                                <p className="text-sm text-red-500">
                                    {errors.nameAr.message}
                                </p>
                            )}
                        </div>

                        {/* Name in English */}
                        <div className="space-y-2">
                            <Label htmlFor="nameEn">الاسم بالإنجليزية *</Label>
                            <Input
                                id="nameEn"
                                {...register("nameEn")}
                                placeholder="College of Computer Science"
                                className={
                                    errors.nameEn ? "border-red-500" : ""
                                }
                            />
                            {errors.nameEn && (
                                <p className="text-sm text-red-500">
                                    {errors.nameEn.message}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">الوصف (اختياري)</Label>
                            <textarea
                                id="description"
                                {...register("description")}
                                placeholder="وصف الكلية..."
                                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "جاري الحفظ..."
                                : college
                                ? "تحديث"
                                : "إضافة"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
