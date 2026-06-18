import { useState } from 'react';
import { useCategoryStore, Category } from '@/store/categoryStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export default function DeleteCategoryDialog({ open, onOpenChange, category }: Props) {
  const { categories, deleteCategory, updateCategory } = useCategoryStore();
  const [action, setAction] = useState<'move' | 'delete'>('move');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');

  if (!category) return null;

  const childCategories = categories.filter((c) => c.parentId === category.id);
  const availableParents = categories.filter(
    (c) => c.id !== category.id && !childCategories.some((child) => child.id === c.id)
  );

  const handleConfirm = async () => {
    try {
      if (action === 'move' && targetCategoryId) {
        // Move children to new parent first, then delete the (now empty) category
        for (const child of childCategories) {
          await updateCategory(child.id, {
            parentId: targetCategoryId === 'root' ? null : targetCategoryId,
          });
        }
        await deleteCategory(category.id);
        toast.success('Category deleted, children moved');
      } else if (action === 'delete') {
        // Backend recursively deletes the whole subtree atomically.
        // It will reject (400) if ANY descendant still has products,
        // so no partial deletion can happen.
        await deleteCategory(category.id);
        toast.success('Category and subcategories deleted');
      }
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to delete category. You must move or delete products first.';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <DialogTitle className="text-foreground">Delete Category</DialogTitle>
              <DialogDescription>
                This category has {childCategories.length} subcategories
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            "{category.name}" has subcategories. Choose what to do with them:
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors">
              <input
                type="radio"
                name="action"
                value="move"
                checked={action === 'move'}
                onChange={() => setAction('move')}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-foreground">Move to another category</p>
                <p className="text-sm text-muted-foreground">
                  Subcategories will be moved to the selected parent
                </p>
              </div>
            </label>

            {action === 'move' && (
              <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select new parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">No Parent (Root)</SelectItem>
                  {availableParents.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-destructive cursor-pointer transition-colors">
              <input
                type="radio"
                name="action"
                value="delete"
                checked={action === 'delete'}
                onChange={() => setAction('delete')}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-foreground">Delete all subcategories</p>
                <p className="text-sm text-destructive">
                  Warning: This will permanently delete all subcategories
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={action === 'move' && !targetCategoryId}
            className={action === 'delete' ? 'bg-destructive hover:bg-destructive/90' : 'gradient-primary'}
          >
            {action === 'delete' ? 'Delete All' : 'Move & Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
