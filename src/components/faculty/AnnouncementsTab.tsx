import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Bell, Mail, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    sendNotification: boolean;
    sendEmail: boolean;
}

export default function AnnouncementsTab({ sectionId }: { sectionId: string }) {
    const { t } = useTranslation();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Announcements will be loaded from API when backend endpoint is ready
        setLoading(false);
    }, [sectionId]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: "",
        content: "",
        sendNotification: true,
        sendEmail: true,
    });

    const createAnnouncement = () => {
        if (!newAnnouncement.title || !newAnnouncement.content) {
            toast.error(t("announcementsTab.errors.enterTitleContent"));
            return;
        }

        const announcement: Announcement = {
            id: Date.now().toString(),
            ...newAnnouncement,
            date: new Date().toISOString().split("T")[0],
        };

        setAnnouncements([announcement, ...announcements]);
        setDialogOpen(false);
        setNewAnnouncement({
            title: "",
            content: "",
            sendNotification: true,
            sendEmail: true,
        });
        toast.success(t("announcementsTab.success.announcementPublished"));
    };

    const deleteAnnouncement = (id: string) => {
        setAnnouncements(announcements.filter((a) => a.id !== id));
        toast.success(t("announcementsTab.success.announcementDeleted"));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    {t("announcementsTab.title")}
                </h3>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    {t("announcementsTab.newAnnouncement")}
                </Button>
            </div>

            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-gray-500">
                            {t("announcementsTab.noAnnouncements")}
                        </CardContent>
                    </Card>
                ) : (
                    announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <CardTitle className="text-lg">
                                                {announcement.title}
                                            </CardTitle>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                📅 {announcement.date}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            deleteAnnouncement(announcement.id)
                                        }>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {announcement.content}
                                </p>
                                <div className="mt-4 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    {announcement.sendNotification && (
                                        <div className="flex items-center gap-1">
                                            <Bell className="w-4 h-4" />
                                            {t("announcementsTab.inSystem")}
                                        </div>
                                    )}
                                    {announcement.sendEmail && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            {t("announcementsTab.email")}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Announcement Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold">
                            {t("announcementsTab.createAnnouncement")}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 m-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                {t("announcementsTab.announcementTitle")}
                            </Label>
                            <Input
                                value={newAnnouncement.title}
                                onChange={(e) =>
                                    setNewAnnouncement({
                                        ...newAnnouncement,
                                        title: e.target.value,
                                    })
                                }
                                placeholder={t(
                                    "announcementsTab.announcementTitle"
                                )}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                {t("announcementsTab.content")}
                            </Label>
                            <Textarea
                                value={newAnnouncement.content}
                                onChange={(e) =>
                                    setNewAnnouncement({
                                        ...newAnnouncement,
                                        content: e.target.value,
                                    })
                                }
                                placeholder={t("announcementsTab.content")}
                                rows={8}
                                className="resize-none"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">
                                🔔 {t("announcementsTab.sendNotification")}:
                            </Label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <Checkbox
                                        checked={
                                            newAnnouncement.sendNotification
                                        }
                                        onCheckedChange={(checked) =>
                                            setNewAnnouncement({
                                                ...newAnnouncement,
                                                sendNotification:
                                                    checked as boolean,
                                            })
                                        }
                                        id="notification"
                                    />
                                    <label
                                        htmlFor="notification"
                                        className="text-sm font-medium cursor-pointer flex-1">
                                        {t("announcementsTab.sendNotification")}
                                    </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <Checkbox
                                        checked={newAnnouncement.sendEmail}
                                        onCheckedChange={(checked) =>
                                            setNewAnnouncement({
                                                ...newAnnouncement,
                                                sendEmail: checked as boolean,
                                            })
                                        }
                                        id="email"
                                    />
                                    <label
                                        htmlFor="email"
                                        className="text-sm font-medium cursor-pointer flex-1">
                                        {t("announcementsTab.sendEmail")}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            className="h-11 px-6">
                            {t("common.cancel")}
                        </Button>
                        <Button
                            onClick={createAnnouncement}
                            className="h-11 px-6">
                            <MessageSquare className="w-4 h-4 ml-2" />
                            {t("announcementsTab.publish")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
