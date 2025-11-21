import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <FileQuestion className="w-24 h-24 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
                <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                    404
                </h1>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    الصفحة غير موجودة
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
                </p>
                <Link to="/dashboard">
                    <Button>العودة للرئيسية</Button>
                </Link>
            </div>
        </div>
    );
}
