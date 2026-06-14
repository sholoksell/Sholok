import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { reviewApi, Review, ReviewStats } from '@/services/reviewService';
import {
  Star,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const [reviewsData, statsData] = await Promise.all([
        reviewApi.getAll(params),
        reviewApi.getStats(),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearch = () => fetchData();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await reviewApi.updateStatus(id, status);
      toast.success(`Review ${status}`);
      fetchData();
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewApi.delete(id);
      toast.success('Review deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return toast.error('Select reviews first');
    try {
      if (action === 'delete') {
        await reviewApi.bulkDelete(selectedIds);
        toast.success(`${selectedIds.length} reviews deleted`);
      } else {
        await reviewApi.bulkUpdateStatus(selectedIds, action);
        toast.success(`${selectedIds.length} reviews ${action}`);
      }
      setSelectedIds([]);
      fetchData();
    } catch {
      toast.error('Bulk action failed');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === reviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reviews.map(r => r._id));
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
    };
    const { variant, icon: Icon } = map[status] || map.pending;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
        <p className="text-muted-foreground">Manage product reviews from customers</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, product, or comment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction('approved')}>
            <ThumbsUp className="w-4 h-4 mr-1" /> Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction('rejected')}>
            <ThumbsDown className="w-4 h-4 mr-1" /> Reject
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No reviews found</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b">
                <Checkbox
                  checked={selectedIds.length === reviews.length && reviews.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>
              {reviews.map((review) => (
                <div key={review._id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={selectedIds.includes(review._id)}
                    onCheckedChange={() => toggleSelect(review._id)}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {review.productId?.thumbnail && (
                          <img
                            src={review.productId.thumbnail}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{review.productId?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-muted-foreground">
                            by {review.customerId?.name || 'Unknown'} ({review.customerId?.email || ''})
                          </p>
                        </div>
                      </div>
                      {statusBadge(review.status)}
                    </div>
                    <div className="flex items-center gap-3">
                      {renderStars(review.rating)}
                      {review.title && <span className="font-medium">{review.title}</span>}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex-1" />
                      {review.status !== 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          onClick={() => handleStatusChange(review._id, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      )}
                      {review.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600"
                          onClick={() => handleStatusChange(review._id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(review._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
