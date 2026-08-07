import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MessageCircleQuestion, Send, LogIn } from 'lucide-react';

const truncateName = (name) => {
  if (!name) return 'Customer';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ProductQA({ productId }) {
  const { customer } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api.get(`/questions/product/${productId}`)
      .then((res) => setQuestions(res.data || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/questions', { product_id: productId, question: question.trim() });
      toast.success('Your question has been submitted. We will answer it soon!');
      setQuestion('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ask a Question form */}
      <div className="border rounded-xl p-5 bg-muted/20">
        <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
          <MessageCircleQuestion className="h-5 w-5 text-primary" />
          Ask a Question
        </h3>
        {customer ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question about this product..."
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{question.length}/500</span>
              <button
                type="submit"
                disabled={submitting || !question.trim()}
                className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Question'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3 text-sm text-muted-foreground py-2">
            <LogIn className="h-4 w-4 shrink-0" />
            <span>Please <a href="/login" className="text-primary font-medium underline underline-offset-2">log in</a> to ask a question about this product.</span>
          </div>
        )}
      </div>

      {/* Q&A List */}
      <div>
        <h3 className="font-semibold text-base mb-4">
          Customer Questions &amp; Answers
          {questions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({questions.length})</span>
          )}
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-xl p-4 space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mt-2" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border rounded-xl bg-muted/10">
            <MessageCircleQuestion className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">No questions answered yet</p>
            <p className="text-xs mt-1">Be the first to ask a question about this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="border rounded-xl overflow-hidden">
                {/* Question */}
                <div className="px-4 py-3 bg-muted/20 flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">Q</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {truncateName(q.customer_name)} &bull; {formatDate(q.created_at)}
                    </p>
                  </div>
                </div>
                {/* Answer */}
                <div className="px-4 py-3 flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">A</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{q.answer}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(q.updated_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
