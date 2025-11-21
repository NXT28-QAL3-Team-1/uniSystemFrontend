import { useState, useRef, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { studentsService, batchesService } from "@/services/api";
import { Upload, Download, AlertCircle } from "lucide-react";

interface ImportStudentsModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportStudentsModal({
    open,
    onClose,
    onSuccess,
}: ImportStudentsModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [batchId, setBatchId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
    const [importResult, setImportResult] = useState<{
        success: number;
        failed: number;
        errors: any[];
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            fetchBatches();
            setFile(null);
            setBatchId("");
            setImportResult(null);
        }
    }, [open]);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setImportResult(null);
        }
    };

    const handleImport = async () => {
        if (!file || !batchId) {
            alert("Please select a file and batch");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("batchId", batchId);

            const response = await studentsService.import(formData);

            if (response.success) {
                setImportResult(response.data);
                if (response.data.failed === 0) {
                    setTimeout(() => {
                        onSuccess();
                        onClose();
                    }, 2000);
                }
            }
        } catch (error) {
            console.error("Error importing students:", error);
            alert("Failed to import students");
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent =
            "studentCode,nameEn,nameAr,email,phone,nationalId,dateOfBirth,gender\n" +
            "20240001,John Doe,جون دو,john@example.com,+966501234567,1234567890,2000-01-15,MALE\n" +
            "20240002,Jane Smith,جين سميث,jane@example.com,+966509876543,0987654321,2001-03-20,FEMALE";

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "students_template.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("students.import")}</DialogTitle>
                    <DialogClose onClick={onClose} />
                </DialogHeader>
                <DialogBody className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    CSV File Format
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                    Your CSV file should contain the following
                                    columns:
                                </p>
                                <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                                    <li>studentCode (required, 8 digits)</li>
                                    <li>nameEn (required)</li>
                                    <li>nameAr (required)</li>
                                    <li>email (required)</li>
                                    <li>phone (optional)</li>
                                    <li>nationalId (optional)</li>
                                    <li>dateOfBirth (optional, YYYY-MM-DD)</li>
                                    <li>gender (optional, MALE or FEMALE)</li>
                                </ul>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadTemplate}
                                    className="mt-3">
                                    <Download className="w-4 h-4 me-2" />
                                    Download Template
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="batch">{t("students.batch")} *</Label>
                        <select
                            id="batch"
                            value={batchId}
                            onChange={(e) => setBatchId(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="">اختر الدفعة</option>
                            {batches.map((batch) => (
                                <option key={batch.id} value={batch.id}>
                                    {batch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label>CSV File *</Label>
                        <div className="mt-2 space-y-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full">
                                <Upload className="w-4 h-4 me-2" />
                                {file ? file.name : "Choose CSV File"}
                            </Button>
                        </div>
                    </div>

                    {importResult && (
                        <div
                            className={`p-4 rounded-lg ${
                                importResult.failed === 0
                                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                    : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                            }`}>
                            <h4 className="font-medium mb-2">
                                Import Results:
                            </h4>
                            <div className="space-y-1 text-sm">
                                <p className="text-green-600 dark:text-green-400">
                                    ✓ Successfully imported:{" "}
                                    {importResult.success} students
                                </p>
                                {importResult.failed > 0 && (
                                    <>
                                        <p className="text-red-600 dark:text-red-400">
                                            ✗ Failed: {importResult.failed}{" "}
                                            students
                                        </p>
                                        <div className="mt-2 max-h-40 overflow-y-auto">
                                            <p className="font-medium mb-1">
                                                Errors:
                                            </p>
                                            {importResult.errors.map(
                                                (err, idx) => (
                                                    <p
                                                        key={idx}
                                                        className="text-xs text-red-600 dark:text-red-400">
                                                        Row {err.row}:{" "}
                                                        {err.error}
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleImport}
                        disabled={loading || !file || !batchId}>
                        {loading ? t("common.loading") : "Import"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
