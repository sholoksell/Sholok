import { useState, useEffect } from 'react';
import { useProductStore, Product } from '@/store/productStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Package, Plus, Minus, AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export default function StockUpdateDialog({ open, onOpenChange, product }: Props) {
  const { updateStock } = useProductStore();
  const [quantity, setQuantity] = useState(0);
  const [adjustment, setAdjustment] = useState(0);

  useEffect(() => {
    if (product) {
      setQuantity(product.stock);
      setAdjustment(0);
    }
  }, [product]);

  if (!product) return null;

  const handleAdjust = (amount: number) => {
    const newQuantity = Math.max(0, quantity + amount);
    setQuantity(newQuantity);
    setAdjustment(adjustment + amount);
  };

  const handleSave = () => {
    updateStock(product.id, quantity);
    toast.success(`Stock updated to ${quantity}`);
    onOpenChange(false);
  };

  const isLowStock = quantity <= product.lowStockThreshold;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Package className="w-5 h-5" />
            Update Stock
          </DialogTitle>
          <DialogDescription>{product.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Stock Display */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Current Stock</p>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAdjust(-10)}
                className="h-12 w-12"
              >
                -10
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAdjust(-1)}
                className="h-12 w-12"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setAdjustment(val - product.stock);
                  setQuantity(Math.max(0, val));
                }}
                className="w-24 h-14 text-center text-2xl font-bold bg-secondary border-border"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAdjust(1)}
                className="h-12 w-12"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAdjust(10)}
                className="h-12 w-12"
              >
                +10
              </Button>
            </div>
          </div>

          {/* Adjustment Summary */}
          {adjustment !== 0 && (
            <div className={`text-center p-3 rounded-lg ${adjustment > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <p className={`text-sm font-medium ${adjustment > 0 ? 'text-success' : 'text-destructive'}`}>
                {adjustment > 0 ? '+' : ''}{adjustment} from original ({product.stock})
              </p>
            </div>
          )}

          {/* Low Stock Warning */}
          {isLowStock && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-foreground">Low Stock Alert</p>
                <p className="text-xs text-muted-foreground">
                  Stock is at or below threshold ({product.lowStockThreshold})
                </p>
              </div>
            </div>
          )}

          {/* Quick Set Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[0, 10, 50, 100].map((val) => (
              <Button
                key={val}
                variant="outline"
                onClick={() => {
                  setQuantity(val);
                  setAdjustment(val - product.stock);
                }}
                className={quantity === val ? 'border-primary' : ''}
              >
                {val}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
            Update Stock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
