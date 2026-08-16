"use client";

import { FormEvent, useState } from 'react';
import { Bot, LockKeyhole, Send, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { Prediction } from '@/types/api';

const SUGGESTIONS = [
  'Why is the model leaning this way?',
  'What are the main risks in this prediction?',
  'What should I watch before kickoff?',
];

export function MatchAssistant({ prediction }: { prediction: Prediction }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function ask(value: string) {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    setQuestion(trimmed);
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.post<{ data: { answer: string } }>(`/predictions/match/${prediction.match._id}/assistant`, { question: trimmed });
      setAnswer(response.data.data.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The assistant is temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <Card className="border-primary/25 bg-primary/[0.04]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary"><Bot className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Match Assistant</span></div>
            <h2 className="mt-2 font-display text-xl font-bold uppercase tracking-tight">Ask Football AI</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Ask about this model’s reasoning using the fixture data, form, markets, and confidence signals.</p>
          </div>
          {prediction.tier === 'vip' ? <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary"><LockKeyhole className="h-3 w-3" />VIP</span> : null}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => void ask(suggestion)} className="rounded-full border border-border bg-surface/70 px-3 py-2 text-xs text-muted transition-colors hover:border-primary/50 hover:text-foreground">{suggestion}</button>)}
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a follow-up question…" maxLength={500} className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none" />
          <Button type="submit" disabled={isLoading || !question.trim()} aria-label="Ask Football AI"><Send className="h-4 w-4" />{isLoading ? 'Thinking…' : 'Ask'}</Button>
        </form>
        {error ? <p className="mt-3 text-xs text-danger">{error}</p> : null}
        {answer ? <div className="mt-5 rounded-lg border border-primary/20 bg-background/60 p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Sparkles className="h-3.5 w-3.5" />AI response</div><p className="mt-2 text-sm leading-6 text-foreground/90">{answer}</p></div> : null}
        <p className="mt-4 text-[11px] leading-5 text-muted">AI responses explain the stored model context and can be wrong. They are not betting advice or a guarantee.</p>
      </CardContent>
    </Card>
  );
}
