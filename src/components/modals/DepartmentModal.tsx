import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const departmentSchema = z.object({
    code: z
        .string()
        .min(1, "كود القسم مطلوب")
        .min(2, "كود القسم يجب أن يكون على الأقل حرفين")
        .max(20, "كود القسم طويل جداً")
        .regex(/^[A-Z0-9]+$/, "كود القسم يجب أن يكون أحرف كبيرة وأرقام فقط")
        .transform((val) => val.toUpperCase()),
    nameEn: z
        .string()
        .min(1, "الاسم بالإنجليزية مطلوب")
        .min(2, "الاسم بالإنجليزية يجب أن يكون على الأقل حرفين"),
    nameAr: z
        .string()
        .min(1, "الاسم بالعربية مطلوب")
        .min(2, "الاسم بالعربية يجب أن يكون على الأقل حرفين"),
    collegeId: z.string().min(1, "الكلية مطلوبة"),
    minGpa: z.number().min(0).max(4).optional(),
    capacity: z.number().int().positive().optional(),
    selectionYear: z.number().int().min(1).max(6).optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DepartmentFormData) => Promise<void>;
    department?: {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
        collegeId: string;
        minGpa?: number;
        capacity?: number;
        selectionYear?: number;
    };
    colleges: { id: string; nameAr: string; nameEn: string }[];
}

export default function DepartmentModal({
    isOpen,
    onClose,
    onSubmit,
    department,
    colleges,
}: DepartmentModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<DepartmentFormData>({
        resolver: zodResolver(departmentSchema),
        defaultValues: department || {
            code: "",
            nameEn: "",
            nameAr: "",
            collegeId: "",
            minGpa: 0,
            capacity: 100,
            selectionYear: 2,
        },
    });

    useEffect(() => {
        if (department) {
            reset(department);
        } else {
            reset({
                code: "",
                nameEn: "",
                nameAr: "",
                collegeId: "",
                minGpa: 0,
                capacity: 100,
                selectionYear: 2,
            });
        }
    }, [department, reset, isOpen]);

    const onSubmitForm = async (data: DepartmentFormData) => {
        try {
            await onSubmit(data);
            reset();
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {department ? "تعديل القسم" : "إضافة قسم جديد"}
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
                        <Label htmlFor="code">كود القسم *</Label>
                        <Input
                            id="code"
                            {...register("code")}
                            disabled={!!department}
                            placeholder="CS"
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
                            placeholder="Computer Science"
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
                            placeholder="علوم الحاسب"
                        />
                        {errors.nameAr && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.nameAr.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="collegeId">الكلية *</Label>
                        <select
                            id="collegeId"
                            {...register("collegeId")}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                            <option value="">اختر الكلية</option>
                            {colleges.map((college) => (
                                <option key={college.id} value={college.id}>
                                    {college.nameAr}
                                </option>
                            ))}
                        </select>
                        {errors.collegeId && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.collegeId.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="minGpa">الحد الأدنى للمعدل</Label>
                            <Input
                                id="minGpa"
                                type="number"
                                step="0.1"
                                {...register("minGpa", { valueAsNumber: true })}
                                placeholder="0.0"
                                className={errors.minGpa ? "border-red-500" : ""}
                            />
                            {errors.minGpa && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.minGpa.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="capacity">السعة الاستيعابية</Label>
                            <Input
                                id="capacity"
                                type="number"
                                {...register("capacity", { valueAsNumber: true })}
                                placeholder="100"
                                className={errors.capacity ? "border-red-500" : ""}
                            />
                            {errors.capacity && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.capacity.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="selectionYear">سنة الاختيار</Label>
                            <Input
                                id="selectionYear"
                                type="number"
                                {...register("selectionYear", { valueAsNumber: true })}
                                placeholder="2"
                                className={errors.selectionYear ? "border-red-500" : ""}
                            />
                            {errors.selectionYear && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.selectionYear.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "جاري الحفظ..."
                                : department
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
