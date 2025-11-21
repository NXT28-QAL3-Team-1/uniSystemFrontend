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
    batchesService,
    departmentsService,
    curriculumService,
} from "@/services/api";

const batchSchema = z.object({
    name: z.string().min(1, "Batch name is required"),
    year: z.number().min(2020, "Invalid year"),
    departmentId: z.string().min(1, "Department is required"),
    curriculumId: z.string().min(1, "Curriculum is required"),
    maxCredits: z.number().min(1, "Max credits must be at least 1"),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface BatchModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    batch?: {
        id: string;
        name: string;
        year: number;
        departmentId: string;
        curriculumId: string;
        maxCredits: number;
    };
}

export default function BatchModal({
    open,
    onClose,
    onSuccess,
    batch,
}: BatchModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<
        { id: string; nameAr: string }[]
    >([]);
    const [curriculums, setCurriculums] = useState<
        { id: string; name: string }[]
    >([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<BatchFormData>({
        resolver: zodResolver(batchSchema),
        defaultValues: batch || {
            year: new Date().getFullYear(),
            maxCredits: 18,
        },
    });

    const selectedDepartmentId = watch("departmentId");

    useEffect(() => {
        if (open) {
            fetchDepartments();
            if (batch) {
                reset(batch);
            } else {
                reset({
                    name: "",
                    year: new Date().getFullYear(),
                    departmentId: "",
                    curriculumId: "",
                    maxCredits: 18,
                });
            }
        }
    }, [open, batch, reset]);

    useEffect(() => {
        if (selectedDepartmentId) {
            fetchCurriculums(selectedDepartmentId);
        }
    }, [selectedDepartmentId]);

    const fetchDepartments = async () => {
        try {
            const response = await departmentsService.getAll();
            if (response.success && response.data) {
                setDepartments(response.data.departments || []);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
        }
    };

    const fetchCurriculums = async (departmentId: string) => {
        try {
            const response = await curriculumService.getAll({
                specializationId: departmentId,
            });
            if (response.success && response.data) {
                setCurriculums(response.data.curricula || []);
            }
        } catch (error) {
            console.error("Error fetching curriculums:", error);
            setCurriculums([]);
        }
    };

    const onSubmit = async (data: BatchFormData) => {
        try {
            setLoading(true);
            if (batch) {
                await batchesService.update(batch.id, data);
            } else {
                await batchesService.create(data);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving batch:", error);
            alert("Failed to save batch");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {batch ? t("batches.edit") : t("batches.create")}
                    </DialogTitle>
                    <DialogClose onClick={onClose} />
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogBody className="space-y-4">
                        <div>
                            <Label htmlFor="name">{t("batches.name")}</Label>
                            <Input id="name" {...register("name")} />
                            {errors.name && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="year">{t("batches.year")}</Label>
                            <Input
                                id="year"
                                type="number"
                                {...register("year", { valueAsNumber: true })}
                            />
                            {errors.year && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.year.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="departmentId">
                                {t("batches.department")}
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
                            {errors.departmentId && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.departmentId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="curriculumId">
                                {t("batches.curriculum")}
                            </Label>
                            <select
                                id="curriculumId"
                                {...register("curriculumId")}
                                disabled={!selectedDepartmentId}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">اختر الخطة الدراسية</option>
                                {(curriculums || []).map((curr) => (
                                    <option key={curr.id} value={curr.id}>
                                        {curr.name}
                                    </option>
                                ))}
                            </select>
                            {errors.curriculumId && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.curriculumId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="maxCredits">
                                {t("batches.maxCredits")}
                            </Label>
                            <Input
                                id="maxCredits"
                                type="number"
                                {...register("maxCredits", {
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.maxCredits && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.maxCredits.message}
                                </p>
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
