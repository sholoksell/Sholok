import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/portal/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, Volume2, BookOpen, Loader2, Languages as LanguagesIcon, AlertCircle } from 'lucide-react';

// Supported languages: code, English name, native name, flag
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'bn', name: 'Bangla', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
];

// Languages for which dictionaryapi.dev provides full definitions
const DEF_SUPPORTED = ['en', 'hi', 'es', 'fr', 'ja', 'ru', 'de', 'it', 'ko', 'ar', 'tr'];

interface Meaning {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
  synonyms: string[];
  antonyms: string[];
}

interface Result {
  word: string;
  sourceLang: string;
  phonetic?: string;
  audio?: string;
  meanings: Meaning[];
  translations: { code: string; text: string }[];
}

// Translate `text` from `source` language to `target` using the free Google endpoint
async function translate(text: string, source: string, target: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('translate failed');
  const data = await res.json();
  return (data[0] as any[]).map((seg) => seg[0]).join('');
}

// Fetch dictionary definitions for a supported language
async function fetchDefinitions(word: string, lang: string): Promise<Partial<Result> | null> {
  if (!DEF_SUPPORTED.includes(lang)) return null;
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${lang}/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return null;
    const entry = data[0];
    const phoneticObj = (entry.phonetics || []).find((p: any) => p.audio) || {};
    const meanings: Meaning[] = (entry.meanings || []).map((m: any) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: (m.definitions || []).slice(0, 3).map((d: any) => ({ definition: d.definition, example: d.example })),
      synonyms: (m.synonyms || []).slice(0, 8),
      antonyms: (m.antonyms || []).slice(0, 8),
    }));
    return {
      phonetic: entry.phonetic || phoneticObj.text,
      audio: phoneticObj.audio,
      meanings,
    };
  } catch {
    return null;
  }
}

const Dictionary = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(['serendipity', 'ভালোবাসা', 'wisdom', 'स्वतंत्रता']);

  // Keep the list of speech-synthesis voices loaded (they load asynchronously)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Speak text with the browser's TTS, picking the best matching voice for the language
  const speakWithSynthesis = (text: string, lang: string): boolean => {
    if (!('speechSynthesis' in window)) return false;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const prefix = lang === 'bn' ? 'bn' : lang;
      u.lang = lang === 'bn' ? 'bn-BD' : lang;
      const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
      const match =
        voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en')); // last-resort: read with an English voice
      if (match) u.voice = match;
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
      return true;
    } catch {
      return false;
    }
  };

  // Pronounce a word: use the real audio file if we have one (best quality),
  // otherwise fall back to the browser's speech synthesis.
  const pronounce = (text: string, lang: string, audioUrl?: string) => {
    if (audioUrl) {
      const url = audioUrl.startsWith('//') ? `https:${audioUrl}` : audioUrl;
      try {
        const audio = new Audio(url);
        audio.play().catch(() => speakWithSynthesis(text, lang));
        return;
      } catch { /* fall through */ }
    }
    speakWithSynthesis(text, lang);
  };

  const handleSearch = async (term?: string, lang?: string) => {
    const word = (term ?? searchTerm).trim();
    const src = lang ?? sourceLang;
    if (!word) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Run definitions + all translations in parallel
      const targets = LANGUAGES.filter((l) => l.code !== src);
      const [defs, ...translations] = await Promise.all([
        fetchDefinitions(word, src),
        ...targets.map((l) =>
          translate(word, src, l.code)
            .then((text) => ({ code: l.code, text }))
            .catch(() => ({ code: l.code, text: '—' }))
        ),
      ]);

      const hasAnything = defs || translations.some((tr) => tr.text && tr.text !== '—');
      if (!hasAnything) {
        setError(`No results found for "${word}".`);
        setLoading(false);
        return;
      }

      setResult({
        word,
        sourceLang: src,
        phonetic: defs?.phonetic,
        audio: defs?.audio,
        meanings: defs?.meanings ?? [],
        translations,
      });

      setRecent((prev) => [word, ...prev.filter((w) => w !== word)].slice(0, 6));
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const langOf = (code: string) => LANGUAGES.find((l) => l.code === code);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <LanguagesIcon className="h-7 w-7 text-primary" />
            {t('dictionary')}
          </h1>
          <p className="text-muted-foreground">
            Definitions, meanings, pronunciation & translations across {LANGUAGES.length} languages
          </p>
        </div>

        {/* Search Box */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.flag} {l.native}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter a word to look up..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={() => handleSearch()} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('search')}
              </Button>
            </div>

            {/* Recent Searches */}
            {recent.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recent.map((word) => (
                    <Badge
                      key={word}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => {
                        setSearchTerm(word);
                        handleSearch(word);
                      }}
                    >
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p>Looking up "{searchTerm}"...</p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="border-destructive/40">
            <CardContent className="py-8 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Word header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">{result.word}</CardTitle>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="secondary">
                        {langOf(result.sourceLang)?.flag} {langOf(result.sourceLang)?.native}
                      </Badge>
                      {result.phonetic && (
                        <span className="text-muted-foreground">{result.phonetic}</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Pronounce"
                        onClick={() => pronounce(result.word, result.sourceLang, result.audio)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Translations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LanguagesIcon className="h-5 w-5 text-primary" /> Translations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.translations.map((tr) => (
                    <div
                      key={tr.code}
                      className="flex items-center justify-between gap-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {langOf(tr.code)?.flag} {langOf(tr.code)?.native}
                        </p>
                        <p className="font-medium truncate">{tr.text}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        title="Pronounce"
                        onClick={() => pronounce(tr.text, tr.code)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Definitions / Meanings */}
            {result.meanings.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('definition')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {result.meanings.map((m, i) => (
                    <div key={i}>
                      <Badge className="mb-3">{m.partOfSpeech}</Badge>
                      <div className="space-y-3">
                        {m.definitions.map((d, j) => (
                          <div key={j}>
                            <p className="leading-relaxed">
                              <span className="text-muted-foreground mr-2">{j + 1}.</span>
                              {d.definition}
                            </p>
                            {d.example && (
                              <div className="flex gap-2 items-start mt-1 ml-6">
                                <BookOpen className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                                <p className="text-muted-foreground italic">{d.example}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {m.synonyms.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Synonyms</p>
                          <div className="flex flex-wrap gap-2">
                            {m.synonyms.map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="cursor-pointer hover:bg-secondary/80"
                                onClick={() => { setSearchTerm(s); handleSearch(s, result.sourceLang); }}
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {m.antonyms.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Antonyms</p>
                          <div className="flex flex-wrap gap-2">
                            {m.antonyms.map((a) => (
                              <Badge key={a} variant="outline" className="cursor-pointer hover:bg-muted"
                                onClick={() => { setSearchTerm(a); handleSearch(a, result.sourceLang); }}>
                                {a}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-6 text-muted-foreground text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Detailed definitions aren't available for {langOf(result.sourceLang)?.native}. Translations are shown above.
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle>Multilingual Dictionary</CardTitle>
              <CardDescription>
                Search a word in any language to see its meaning and translations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <Badge key={l.code} variant="outline">{l.flag} {l.native}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dictionary;
