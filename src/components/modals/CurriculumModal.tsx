import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const curriculumSchema = z.object({
    departmentId: z.string().min(1, "القسم مطلوب"),
    name: z
        .string()
        .min(1, "اسم الخطة مطلوب")
        .min(2, "اسم الخطة يجب أن يكون على الأقل حرفين"),
    version: z.string().min(1, "رقم الإصدار مطلوب"),
    totalCredits: z
        .number()
        .min(1, "عدد الساعات الكلي مطلوب")
        .max(200, "عدد الساعات الكلي يجب أن يكون أقل من 200"),
    effectiveFrom: z.string().min(1, "تاريخ السريان مطلوب"),
});

type CurriculumFormData = z.infer<typeof curriculumSchema>;

interface CurriculumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CurriculumFormData) => Promise<void>;
    curriculum?: {
        id: string;
        departmentId?: string;
        department?: {
            id: string;
        };
        name: string;
        version: string;
        totalCredits: number;
        effectiveFrom: string;
    };
    departments: { id: string; nameAr: string; nameEn: string }[];
}

export default function CurriculumModal({
    isOpen,
    onClose,
    onSubmit,
    curriculum,
    departments,
}: CurriculumModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CurriculumFormData>({
        resolver: zodResolver(curriculumSchema),
        defaultValues: curriculum || {
            departmentId: "",
            name: "",
            version: "1.0",
            totalCredits: 130,
            effectiveFrom: new Date().toISOString().split("T")[0],
        },
    });

    useEffect(() => {
        if (curriculum) {
            const departmentId =
                curriculum.departmentId || curriculum.department?.id || "";
            reset({
                ...curriculum,
                departmentId,
                effectiveFrom:
                    curriculum.effectiveFrom?.split("T")[0] ||
                    new Date().toISOString().split("T")[0],
            });
        } else {
            reset({
                departmentId: "",
                name: "",
                version: "1.0",
                totalCredits: 130,
                effectiveFrom: new Date().toISOString().split("T")[0],
            });
        }
    }, [curriculum, reset, isOpen]);

    const onSubmitForm = async (data: CurriculumFormData) => {
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
                        {curriculum
                            ? "تعديل خطة دراسية"
                            : "إضافة خطة دراسية جديدة"}
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
                        {/* Department */}
                        <div className="space-y-2">
                            <Label htmlFor="departmentId">القسم *</Label>
                            <select
                                id="departmentId"
                                {...register("departmentId")}
                                className={`flex h-10 w-full rounded-md border ${
                                    errors.departmentId
                                        ? "border-red-500"
                                        : "border-input"
                                } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}>
                                <option value="">اختر القسم</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.nameAr}
                                    </option>
                                ))}
                            </select>
                            {errors.departmentId && (
                                <p className="text-sm text-red-500">
                                    {errors.departmentId.message}
                                </p>
                            )}
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">اسم الخطة الدراسية *</Label>
                            <Input
                                id="name"
                                {...register("name")}
                                placeholder="خطة برنامج علوم الحاسب 2024"
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Version */}
                        <div className="space-y-2">
                            <Label htmlFor="version">رقم الإصدار *</Label>
                            <Input
                                id="version"
                                {...register("version")}
                                placeholder="1.0"
                                className={
                                    errors.version ? "border-red-500" : ""
                                }
                            />
                            {errors.version && (
                                <p className="text-sm text-red-500">
                                    {errors.version.message}
                                </p>
                            )}
                        </div>

                        {/* Total Credits */}
                        <div className="space-y-2">
                            <Label htmlFor="totalCredits">
                                عدد الساعات الكلي *
                            </Label>
                            <Input
                                id="totalCredits"
                                type="number"
                                {...register("totalCredits", {
                                    valueAsNumber: true,
                                })}
                                placeholder="130"
                                className={
                                    errors.totalCredits ? "border-red-500" : ""
                                }
                            />
                            {errors.totalCredits && (
                                <p className="text-sm text-red-500">
                                    {errors.totalCredits.message}
                                </p>
                            )}
                        </div>

                        {/* Effective From */}
                        <div className="space-y-2">
                            <Label htmlFor="effectiveFrom">
                                تاريخ السريان *
                            </Label>
                            <Input
                                id="effectiveFrom"
                                type="date"
                                lang="en"
                                {...register("effectiveFrom")}
                                className={
                                    errors.effectiveFrom ? "border-red-500" : ""
                                }
                            />
                            {errors.effectiveFrom && (
                                <p className="text-sm text-red-500">
                                    {errors.effectiveFrom.message}
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
                                : curriculum
                                ? "تحديث"
                                : "إضافة"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
