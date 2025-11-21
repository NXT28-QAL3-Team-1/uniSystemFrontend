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
import { termsService, batchesService } from "@/services/api";

const termSchema = z.object({
    batchId: z.string().min(1, "Batch is required"),
    name: z.string().min(1, "Term name is required"),
    type: z.enum(["FALL", "SPRING", "SUMMER"]),
    status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    registrationStart: z.string().min(1, "Registration start is required"),
    registrationEnd: z.string().min(1, "Registration end is required"),
});

type TermFormData = z.infer<typeof termSchema>;

interface TermModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    term?: {
        id: string;
        batchId: string;
        name: string;
        type: "FALL" | "SPRING" | "SUMMER";
        status: "ACTIVE" | "INACTIVE" | "COMPLETED";
        startDate: string;
        endDate: string;
        registrationStart: string;
        registrationEnd: string;
    };
}

export default function TermModal({
    open,
    onClose,
    onSuccess,
    term,
}: TermModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState<Array<{ id: string; name: string }>>(
        []
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TermFormData>({
        resolver: zodResolver(termSchema),
        defaultValues: term || {},
    });

    useEffect(() => {
        if (open) {
            // Fetch batches
            fetchBatches();

            if (term) {
                // Convert dates to YYYY-MM-DD format
                reset({
                    ...term,
                    startDate: term.startDate.split("T")[0],
                    endDate: term.endDate.split("T")[0],
                    registrationStart: term.registrationStart.split("T")[0],
                    registrationEnd: term.registrationEnd.split("T")[0],
                });
            } else {
                reset({
                    batchId: "",
                    name: "",
                    type: "FALL",
                    status: "INACTIVE",
                    startDate: "",
                    endDate: "",
                    registrationStart: "",
                    registrationEnd: "",
                });
            }
        }
    }, [open, term, reset]);

    const fetchBatches = async () => {
        try {
            const response = await batchesService.getAll();
            if (response.success) {
                setBatches(response.data.batches);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const onSubmit = async (data: TermFormData) => {
        try {
            setLoading(true);
            // Convert dates to ISO-8601 DateTime format
            const formattedData = {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
                registrationStart: new Date(
                    data.registrationStart
                ).toISOString(),
                registrationEnd: new Date(data.registrationEnd).toISOString(),
            };
            if (term) {
                await termsService.update(term.id, formattedData);
            } else {
                await termsService.create(formattedData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving term:", error);
            alert("Failed to save term");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {term ? t("terms.edit") : t("terms.create")}
                    </DialogTitle>
                    <DialogClose onClick={onClose} />
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogBody className="space-y-4">
                        <div>
                            <Label htmlFor="batchId">الدفعة</Label>
                            <select
                                id="batchId"
                                {...register("batchId")}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">اختر الدفعة</option>
                                {batches.map((batch) => (
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
                            <Label htmlFor="name">{t("terms.name")}</Label>
                            <Input id="name" {...register("name")} />
                            {errors.name && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="type">{t("terms.type")}</Label>
                            <select
                                id="type"
                                {...register("type")}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="FALL">
                                    {t("terms.types.FALL")}
                                </option>
                                <option value="SPRING">
                                    {t("terms.types.SPRING")}
                                </option>
                                <option value="SUMMER">
                                    {t("terms.types.SUMMER")}
                                </option>
                            </select>
                            {errors.type && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.type.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="status">الحالة</Label>
                            <select
                                id="status"
                                {...register("status")}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="ACTIVE">فعال</option>
                                <option value="INACTIVE">غير فعال</option>
                                <option value="COMPLETED">مكتمل</option>
                            </select>
                            {errors.status && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.status.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startDate">
                                    {t("terms.startDate")}
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    lang="en"
                                    {...register("startDate")}
                                />
                                {errors.startDate && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.startDate.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="endDate">
                                    {t("terms.endDate")}
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    lang="en"
                                    {...register("endDate")}
                                />
                                {errors.endDate && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.endDate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="registrationStart">
                                    {t("terms.registrationStart")}
                                </Label>
                                <Input
                                    id="registrationStart"
                                    type="date"
                                    lang="en"
                                    {...register("registrationStart")}
                                />
                                {errors.registrationStart && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.registrationStart.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="registrationEnd">
                                    {t("terms.registrationEnd")}
                                </Label>
                                <Input
                                    id="registrationEnd"
                                    type="date"
                                    lang="en"
                                    {...register("registrationEnd")}
                                />
                                {errors.registrationEnd && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.registrationEnd.message}
                                    </p>
                                )}
                            </div>
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
