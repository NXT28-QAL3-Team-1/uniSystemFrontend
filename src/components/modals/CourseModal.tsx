import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const courseSchema = z.object({
    code: z
        .string()
        .min(1, "كود المادة مطلوب")
        .min(2, "كود المادة يجب أن يكون على الأقل حرفين")
        .max(20, "كود المادة طويل جداً")
        .regex(/^[A-Z0-9]+$/, "كود المادة يجب أن يكون أحرف كبيرة وأرقام فقط")
        .transform((val) => val.toUpperCase()),
    nameEn: z
        .string()
        .min(1, "الاسم بالإنجليزية مطلوب")
        .min(2, "الاسم بالإنجليزية يجب أن يكون على الأقل حرفين"),
    nameAr: z
        .string()
        .min(1, "الاسم بالعربية مطلوب")
        .min(2, "الاسم بالعربية يجب أن يكون على الأقل حرفين"),
    credits: z
        .number()
        .min(1, "عدد الساعات المعتمدة مطلوب")
        .max(6, "عدد الساعات المعتمدة يجب أن يكون بين 1 و 6"),
    type: z.enum(["CORE", "ELECTIVE", "GENERAL"]),
    departmentId: z.string().nullable().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CourseFormData) => Promise<void>;
    course?: {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
        credits: number;
        type: "CORE" | "ELECTIVE" | "GENERAL";
        departmentId: string | null;
    };
    departments: { id: string; nameAr: string; nameEn: string }[];
}

export default function CourseModal({
    isOpen,
    onClose,
    onSubmit,
    course,
    departments,
}: CourseModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
        defaultValues: course || {
            code: "",
            nameEn: "",
            nameAr: "",
            credits: 3,
            type: "CORE",
            departmentId: "",
        },
    });

    useEffect(() => {
        if (course) {
            reset(course);
        } else {
            reset({
                code: "",
                nameEn: "",
                nameAr: "",
                credits: 3,
                type: "CORE",
                departmentId: "",
            });
        }
    }, [course, reset, isOpen]);

    const onSubmitForm = async (data: CourseFormData) => {
        try {
            await onSubmit(data);
            reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            // Don't close modal on error so user can fix the issue
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {course ? "تعديل المادة" : "إضافة مادة جديدة"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmitForm)}
                    className="space-y-4">
                    <div>
                        <Label htmlFor="code">كود المادة *</Label>
                        <Input
                            id="code"
                            {...register("code")}
                            disabled={!!course}
                            placeholder="CS101"
                        />
                        {errors.code && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.code.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="nameEn">الاسم بالإنجليزية *</Label>
                        <Input
                            id="nameEn"
                            {...register("nameEn")}
                            placeholder="Introduction to Programming"
                        />
                        {errors.nameEn && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.nameEn.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                        <Input
                            id="nameAr"
                            {...register("nameAr")}
                            placeholder="مقدمة في البرمجة"
                        />
                        {errors.nameAr && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.nameAr.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="credits">الساعات المعتمدة *</Label>
                        <Input
                            id="credits"
                            type="number"
                            {...register("credits", { valueAsNumber: true })}
                            min="1"
                            max="6"
                        />
                        {errors.credits && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.credits.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="type">نوع المادة *</Label>
                        <select
                            id="type"
                            {...register("type")}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                            <option value="CORE">أساسية (Core)</option>
                            <option value="ELECTIVE">
                                اختيارية (Elective)
                            </option>
                            <option value="GENERAL">عامة (General)</option>
                        </select>
                        {errors.type && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.type.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="departmentId">القسم (اختياري)</Label>
                        <select
                            id="departmentId"
                            {...register("departmentId")}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                            <option value="">
                                مادة عامة (متاحة لجميع الأقسام)
                            </option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.nameAr}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ℹ️ المواد العامة يمكن لجميع الطلاب التسجيل بها بغض
                            النظر عن القسم
                        </p>
                        {errors.departmentId && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.departmentId.message}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "جاري الحفظ..."
                                : course
                                ? "تحديث"
                                : "إضافة"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}>
                            إلغاء
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
