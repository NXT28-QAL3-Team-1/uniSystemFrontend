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
    sectionsService,
    coursesService,
    termsService,
    facultyService,
} from "@/services/api";

const sectionSchema = z.object({
    code: z.string().min(1, "Section code is required"),
    courseId: z.string().min(1, "Course is required"),
    termId: z.string().min(1, "Term is required"),
    facultyId: z.string().min(1, "Faculty is required"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
});

type SectionFormData = z.infer<typeof sectionSchema>;

interface SectionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    section?: {
        id: string;
        code: string;
        courseId: string;
        termId: string;
        facultyId: string;
        capacity: number;
    };
}

export default function SectionModal({
    open,
    onClose,
    onSuccess,
    section,
}: SectionModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<
        { id: string; code: string; nameAr: string }[]
    >([]);
    const [terms, setTerms] = useState<{ id: string; name: string }[]>([]);
    const [faculty, setFaculty] = useState<{ id: string; nameAr: string }[]>(
        []
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<SectionFormData>({
        resolver: zodResolver(sectionSchema),
        defaultValues: section || { capacity: 30 },
    });

    useEffect(() => {
        if (open) {
            fetchCourses();
            fetchTerms();
            fetchFaculty();
            if (section) {
                reset(section);
            } else {
                reset({
                    code: "",
                    courseId: "",
                    termId: "",
                    facultyId: "",
                    capacity: 30,
                });
            }
        }
    }, [open, section, reset]);

    const fetchCourses = async () => {
        try {
            const response = await coursesService.getAll({ limit: 1000 });
            if (response.success) {
                setCourses(response.data.courses);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const fetchTerms = async () => {
        try {
            const response = await termsService.getAll();
            if (response.success) {
                setTerms(response.data.terms);
            }
        } catch (error) {
            console.error("Error fetching terms:", error);
        }
    };

    const fetchFaculty = async () => {
        try {
            const response = await facultyService.getAll({ limit: 1000 });
            if (response.success) {
                setFaculty(response.data.faculty);
            }
        } catch (error) {
            console.error("Error fetching faculty:", error);
        }
    };

    const onSubmit = async (data: SectionFormData) => {
        try {
            setLoading(true);
            if (section) {
                await sectionsService.update(section.id, data);
            } else {
                await sectionsService.create(data);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving section:", error);
            alert("Failed to save section");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {section ? t("sections.edit") : t("sections.create")}
                    </DialogTitle>
                    <DialogClose onClick={onClose} />
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogBody className="space-y-4">
                        <div>
                            <Label htmlFor="courseId">
                                {t("sections.course")}
                            </Label>
                            <select
                                id="courseId"
                                {...register("courseId")}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">اختر المقرر</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.nameAr}
                                    </option>
                                ))}
                            </select>
                            {errors.courseId && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.courseId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="termId">{t("sections.term")}</Label>
                            <select
                                id="termId"
                                {...register("termId")}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">اختر الفصل الدراسي</option>
                                {terms.map((term) => (
                                    <option key={term.id} value={term.id}>
                                        {term.name}
                                    </option>
                                ))}
                            </select>
                            {errors.termId && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.termId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="code">
                                {t("sections.sectionCode")}
                            </Label>
                            <Input
                                id="code"
                                {...register("code")}
                                placeholder="e.g., CS101-01"
                            />
                            {errors.code && (
                                <p className="text-sm text-red-600">
                                    {errors.code.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="facultyId">
                                {t("sections.faculty")}
                            </Label>
                            <select
                                id="facultyId"
                                {...register("facultyId")}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">اختر عضو هيئة التدريس</option>
                                {faculty.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.nameAr}
                                    </option>
                                ))}
                            </select>
                            {errors.facultyId && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.facultyId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="capacity">
                                {t("sections.capacity")}
                            </Label>
                            <Input
                                id="capacity"
                                type="number"
                                {...register("capacity", {
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.capacity && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.capacity.message}
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
