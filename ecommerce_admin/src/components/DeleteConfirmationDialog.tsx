import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

export default function DeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Are You Sure! Want to Delete ?",
    description = "Do you really want to delete these records? You can't view this in your list anymore if you delete!"
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-card border-border flex flex-col items-center text-center sm:text-center">
                <DialogHeader className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
                        <Trash2 className="w-8 h-8 text-destructive" strokeWidth={1.5} />
                    </div>
                    <DialogTitle className="text-xl font-bold text-foreground">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <p className="text-muted-foreground text-center mb-6">
                    {description}
                </p>

                <div className="flex justify-center gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    >
                        No, Keep It
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                    >
                        Yes, Delete It
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
