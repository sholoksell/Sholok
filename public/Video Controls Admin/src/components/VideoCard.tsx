import { Link } from "react-router-dom";
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import type { Video } from "@/data/mockData";
import { videoApi } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/data/mockData";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";

interface VideoCardProps {
  video: Video;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, data: { title: string; description: string; category: string; titleBn?: string; titleEn?: string; descriptionBn?: string; descriptionEn?: string }) => void;
}

export const VideoCard = ({ video, onDelete, onEdit }: VideoCardProps) => {
  const { language, t } = useLanguage();
  const displayTitle = getLocalizedField(video as any, "title", language);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(video.title);
  const [editDescription, setEditDescription] = useState("");
  const [editTitleBn, setEditTitleBn] = useState((video as any).titleBn || "");
  const [editTitleEn, setEditTitleEn] = useState((video as any).titleEn || "");
  const [editDescriptionBn, setEditDescriptionBn] = useState((video as any).descriptionBn || "");
  const [editDescriptionEn, setEditDescriptionEn] = useState((video as any).descriptionEn || "");
  const [editCategory, setEditCategory] = useState(video.category || "Other");
  const [editLoading, setEditLoading] = useState(false);

  return (
    <div className="group block animate-fade-in">
      <Link to={`/watch/${video.id}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-elegant transition-smooth group-hover:shadow-glow group-hover:scale-[1.02]">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt={displayTitle} loading="lazy" className="w-full h-full object-cover transition-smooth group-hover:scale-105" />
          ) : (
            <video src={videoApi.getStreamUrl(video.id)} muted preload="metadata" className="w-full h-full object-cover transition-smooth group-hover:scale-105" />
          )}
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs font-semibold bg-black/85 text-white rounded">
            {video.duration}
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
        </div>
      </Link>
      <div className="flex gap-3 mt-3">
        <Link to={`/watch/${video.id}`}>
          <div className="w-9 h-9 rounded-full gradient-primary grid place-items-center text-sm shrink-0">
            {video.channelAvatar}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video.id}`}>
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-smooth">
              {displayTitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">{video.channel}</p>
            <p className="text-xs text-muted-foreground">{video.views} • {video.uploaded}</p>
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 transition-smooth p-1 -mt-1 h-fit text-muted-foreground hover:text-foreground"
              onClick={(e) => e.preventDefault()}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setEditTitle(video.title);
                  setEditTitleBn((video as any).titleBn || "");
                  setEditTitleEn((video as any).titleEn || "");
                  setEditDescriptionBn((video as any).descriptionBn || "");
                  setEditDescriptionEn((video as any).descriptionEn || "");
                  setEditCategory(video.category || "Other");
                  setShowEditDialog(true);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                {t("edit_video")}
              </DropdownMenuItem>
            )}
            {onEdit && onDelete && <DropdownMenuSeparator />}
            {onDelete && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Video
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("edit_video")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Video title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Video description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title-bn">{t("title_bn")}</Label>
              <Input
                id="edit-title-bn"
                value={editTitleBn}
                onChange={(e) => setEditTitleBn(e.target.value)}
                className="font-bengali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title-en">{t("title_en")}</Label>
              <Input
                id="edit-title-en"
                value={editTitleEn}
                onChange={(e) => setEditTitleEn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description-bn">{t("description_bn")}</Label>
              <Textarea
                id="edit-description-bn"
                value={editDescriptionBn}
                onChange={(e) => setEditDescriptionBn(e.target.value)}
                rows={3}
                className="font-bengali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description-en">{t("description_en")}</Label>
              <Textarea
                id="edit-description-en"
                value={editDescriptionEn}
                onChange={(e) => setEditDescriptionEn(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>{t("cancel")}</Button>
            <Button
              disabled={!editTitle.trim() || editLoading}
              onClick={async () => {
                setEditLoading(true);
                await onEdit?.(video.id, {
                  title: editTitle.trim(),
                  description: editDescription,
                  category: editCategory,
                  titleBn: editTitleBn.trim(),
                  titleEn: editTitleEn.trim(),
                  descriptionBn: editDescriptionBn.trim(),
                  descriptionEn: editDescriptionEn.trim(),
                });
                setEditLoading(false);
                setShowEditDialog(false);
              }}
            >
              {editLoading ? "Saving..." : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_video")}</AlertDialogTitle>
            <AlertDialogDescription>
              "{displayTitle}" will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete?.(video.id)}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
