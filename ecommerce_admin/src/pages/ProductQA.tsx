import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  MessageSquareDot,
} from 'lucide-react';

interface Question {
  id: number;
  product_id: number;
  customer_id: number;
  question: string;
  answer: string | null;
  answered_by: number | null;
  status: 'pending' | 'answered' | 'rejected';
  is_public: number;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
}

const API_BASE = '/admin-api/questions';

const getToken = () => localStorage.getItem('admin_token') || '';

const apiFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || 'Request failed');
    return data;
  });

const statusBadge = (status: string) => {
  const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
    pending: { variant: 'secondary', icon: Clock },
    answered: { variant: 'default', icon: CheckCircle },
    rejected: { variant: 'destructive', icon: XCircle },
  };
  const { variant, icon: Icon } = map[status] || map.pending;
  return (
    <Badge variant={variant} className="gap-1 capitalize">
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  );
};

export default function ProductQA() {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Answer dialog state
  const [answerDialog, setAnswerDialog] = useState<{ open: boolean; question: Question | null }>({ open: false, question: null });
  const [answerText, setAnswerText] = useState('');
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const data: Question[] = await apiFetch(`${API_BASE}/admin?${params}`);
      setQuestions(data);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [statusFilter]);

  const openAnswerDialog = (q: Question) => {
    setAnswerDialog({ open: true, question: q });
    setAnswerText(q.answer || '');
  };

  const closeAnswerDialog = () => {
    setAnswerDialog({ open: false, question: null });
    setAnswerText('');
  };

  const handleAnswer = async () => {
    if (!answerDialog.question || !answerText.trim()) return;
    setAnswerSubmitting(true);
    try {
      await apiFetch(`${API_BASE}/${answerDialog.question.id}/answer`, {
        method: 'PATCH',
        body: JSON.stringify({ answer: answerText.trim() }),
      });
      toast.success('Answer saved');
      closeAnswerDialog();
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save answer');
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiFetch(`${API_BASE}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success(`Status updated to ${status}`);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this question?')) return;
    try {
      await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      toast.success('Question deleted');
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareDot className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{t('productQA')}</h1>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all')}</SelectItem>
            <SelectItem value="pending">{t('pending')}</SelectItem>
            <SelectItem value="answered">{t('answeredStatus')}</SelectItem>
            <SelectItem value="rejected">{t('rejected')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('questions')} ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquareDot className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>{t('noQuestionsFound')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">{t('product')}</th>
                    <th className="px-4 py-3 font-medium">{t('customer')}</th>
                    <th className="px-4 py-3 font-medium">{t('question')}</th>
                    <th className="px-4 py-3 font-medium">{t('answer')}</th>
                    <th className="px-4 py-3 font-medium">{t('status')}</th>
                    <th className="px-4 py-3 font-medium">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 max-w-[150px]">
                        <p className="truncate text-xs font-medium">{q.product_name || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium">{q.customer_name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{q.customer_email || ''}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="text-xs line-clamp-3">{q.question}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[220px]">
                        {q.answer ? (
                          <p className="text-xs line-clamp-3 text-green-700">{q.answer}</p>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">{t('noAnswerYet')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{statusBadge(q.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2"
                            onClick={() => openAnswerDialog(q)}
                          >
                            {q.answer ? t('editAnswer') : t('answer')}
                          </Button>
                          {q.status !== 'answered' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2 text-green-700 border-green-300 hover:bg-green-50"
                              onClick={() => handleStatusChange(q.id, 'answered')}
                            >
                              {t('approve')}
                            </Button>
                          )}
                          {q.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2 text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleStatusChange(q.id, 'rejected')}
                            >
                              {t('reject')}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(q.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer Dialog */}
      {answerDialog.open && answerDialog.question && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 space-y-4">
            <h2 className="text-lg font-semibold">{t('answerQuestion')}</h2>
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{t('question')}:</span>
              <p className="mt-1">{answerDialog.question.question}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('yourAnswer')}</label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={5}
                placeholder={t('typeAnswerHere')}
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeAnswerDialog} disabled={answerSubmitting}>
                {t('cancel')}
              </Button>
              <Button onClick={handleAnswer} disabled={answerSubmitting || !answerText.trim()}>
                {answerSubmitting ? t('saving') : t('saveAnswer')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
