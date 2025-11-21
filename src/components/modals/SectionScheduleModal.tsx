import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

interface Schedule {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    room: string | null;
}

interface SectionScheduleModalProps {
    open: boolean;
    onClose: () => void;
    section: {
        code: string;
        course: {
            code: string;
            nameAr: string;
        };
        schedules: Schedule[];
    } | null;
}

const daysMap: Record<string, string> = {
    "0": "الأحد",
    "1": "الاثنين",
    "2": "الثلاثاء",
    "3": "الأربعاء",
    "4": "الخميس",
    "5": "الجمعة",
    "6": "السبت",
    SUNDAY: "الأحد",
    MONDAY: "الاثنين",
    TUESDAY: "الثلاثاء",
    WEDNESDAY: "الأربعاء",
    THURSDAY: "الخميس",
    FRIDAY: "الجمعة",
    SATURDAY: "السبت",
};

export default function SectionScheduleModal({
    open,
    onClose,
    section,
}: SectionScheduleModalProps) {
    if (!section) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        جدول الشعبة
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Section Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    الشعبة
                                </p>
                                <p className="font-bold text-lg">
                                    {section.code}
                                </p>
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-muted-foreground">
                                    المادة
                                </p>
                                <p className="font-medium">
                                    {section.course.nameAr}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {section.course.code}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule List */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            المواعيد ({section.schedules?.length || 0})
                        </h3>

                        {!section.schedules ||
                        section.schedules.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>لا توجد مواعيد محددة لهذه الشعبة</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {section.schedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Day */}
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200">
                                                        {daysMap[
                                                            schedule.day
                                                        ] || schedule.day}
                                                    </Badge>
                                                </div>

                                                {/* Time */}
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-mono">
                                                        {schedule.startTime} -{" "}
                                                        {schedule.endTime}
                                                    </span>
                                                </div>

                                                {/* Room */}
                                                {schedule.room && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>
                                                            {schedule.room}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
