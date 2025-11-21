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
    DialogClose,
    DialogBody,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    studentsService,
    batchesService,
    departmentsService,
} from "@/services/api";

const studentSchema = z.object({
    studentCode: z
        .string()
        .regex(/^[0-9]{8}$/, "Student code must be exactly 8 digits"),
    nameEn: z.string().min(1, "English name is required"),
    nameAr: z.string().min(1, "Arabic name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    nationalId: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", ""]).optional(),
    batchId: z.string().min(1, "Batch is required"),
    departmentId: z.string().optional(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain uppercase, lowercase, and number"
        ),
    admissionDate: z.string().min(1, "Admission date is required"),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student?: {
        id: string;
        studentCode: string;
        nameEn: string;
        nameAr: string;
        email: string;
        phone?: string;
        nationalId?: string;
        dateOfBirth?: string;
        gender?: "MALE" | "FEMALE";
        batchId: string;
        departmentId?: string;
        admissionDate?: string;
    };
}

export default function StudentModal({
    open,
    onClose,
    onSuccess,
    student,
}: StudentModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
    const [departments, setDepartments] = useState<
        { id: string; nameEn: string; nameAr: string }[]
    >([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
        defaultValues: student || {},
    });

    useEffect(() => {
        if (open) {
            fetchBatches();
            fetchDepartments();
            if (student) {
                reset({
                    ...student,
                    dateOfBirth: student.dateOfBirth
                        ? new Date(student.dateOfBirth)
                              .toISOString()
                              .split("T")[0]
                        : "",
                    admissionDate: student.admissionDate
                        ? new Date(student.admissionDate)
                              .toISOString()
                              .split("T")[0]
                        : "",
                });
            } else {
                reset({
                    studentCode: "",
                    nameEn: "",
                    nameAr: "",
                    email: "",
                    phone: "",
                    nationalId: "",
                    dateOfBirth: "",
                    gender: "",
                    batchId: "",
                    departmentId: "",
                    password: "",
                    admissionDate: new Date().toISOString().split("T")[0],
                });
            }
        }
    }, [open, student, reset]);

    const fetchBatches = async () => {
        try {
            const response = await batchesService.getAll();
            if (Array.isArray(response)) {
                setBatches(response);
            } else if (response.success && response.data) {
                setBatches(
                    Array.isArray(response.data)
                        ? response.data
                        : response.data.batches || []
                );
            } else {
                setBatches([]);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
            setBatches([]);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await departmentsService.getAll();
            if (Array.isArray(response)) {
                setDepartments(response);
            } else if (response.success && response.data) {
                setDepartments(
                    Array.isArray(response.data) ? response.data : []
                );
            } else {
                setDepartments([]);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
        }
    };

    const onSubmit = async (data: StudentFormData) => {
        try {
            setLoading(true);
            const submitData = {
                ...data,
                gender: data.gender || undefined,
                departmentId: data.departmentId || undefined,
                nationalId: data.nationalId || undefined,
                phone: data.phone || undefined,
                dateOfBirth: data.dateOfBirth || undefined,
            };

            if (student) {
                await studentsService.update(student.id, submitData);
            } else {
                await studentsService.create(submitData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving student:", error);
            alert("Failed to save student");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {student ? t("students.edit") : t("students.create")}
                    </DialogTitle>
                    <DialogClose onClick={onClose} />
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogBody className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="studentCode">
                                    {t("students.studentCode")} *
                                </Label>
                                <Input
                                    id="studentCode"
                                    {...register("studentCode")}
                                    disabled={!!student}
                                />
                                {errors.studentCode && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.studentCode.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="email">
                                    {t("students.email")} *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    disabled={!!student}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="nameEn">
                                    {t("students.nameEn")} *
                                </Label>
                                <Input id="nameEn" {...register("nameEn")} />
                                {errors.nameEn && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.nameEn.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="nameAr">
                                    {t("students.nameAr")} *
                                </Label>
                                <Input id="nameAr" {...register("nameAr")} />
                                {errors.nameAr && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.nameAr.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">
                                    {t("students.phone")}
                                </Label>
                                <Input id="phone" {...register("phone")} />
                            </div>

                            <div>
                                <Label htmlFor="nationalId">
                                    {t("students.nationalId")}
                                </Label>
                                <Input
                                    id="nationalId"
                                    {...register("nationalId")}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dateOfBirth">
                                    {t("students.dateOfBirth")}
                                </Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    lang="en"
                                    {...register("dateOfBirth")}
                                />
                            </div>

                            <div>
                                <Label htmlFor="gender">
                                    {t("students.gender")}
                                </Label>
                                <select
                                    id="gender"
                                    {...register("gender")}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="">اختر الجنس</option>
                                    <option value="MALE">ذكر</option>
                                    <option value="FEMALE">أنثى</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="batchId">
                                    {t("students.batch")} *
                                </Label>
                                <select
                                    id="batchId"
                                    {...register("batchId")}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="">اختر الدفعة</option>
                                    {(batches || []).map((batch) => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.batchId && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.batchId.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="departmentId">
                                    {t("students.department")}
                                </Label>
                                <select
                                    id="departmentId"
                                    {...register("departmentId")}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="">اختر القسم</option>
                                    {(departments || []).map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.nameAr}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="admissionDate">
                                    {t("students.admissionDate")} *
                                </Label>
                                <Input
                                    id="admissionDate"
                                    type="date"
                                    lang="en"
                                    {...register("admissionDate")}
                                />
                                {errors.admissionDate && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.admissionDate.message}
                                    </p>
                                )}
                            </div>

                            {!student && (
                                <div>
                                    <Label htmlFor="password">
                                        {t("common.password")} *
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        {...register("password")}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}>
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
