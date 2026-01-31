import React, { useState, useEffect } from 'react';
import { AIGeneration } from '../../types';
import * as adminApi from '../../services/adminApi';

const AIGenerator: React.FC = () => {
  const [mode, setMode] = useState<'ebook' | 'chapter' | 'outline' | 'improve'>('ebook');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<AIGeneration[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Ebook form
  const [ebookForm, setEbookForm] = useState({
    title: '',
    topic: '',
    chapters: 10,
    style: 'Professional and engaging',
    target_audience: 'General readers',
  });

  // Chapter form
  const [chapterForm, setChapterForm] = useState({
    topic: '',
    style: 'Professional and engaging',
    word_count: 800,
  });

  // Outline form
  const [outlineForm, setOutlineForm] = useState({
    title: '',
    topic: '',
    chapters: 10,
    style: 'Professional self-help',
  });

  // Improve form
  const [improveForm, setImproveForm] = useState({
    content: '',
    instruction: '',
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await adminApi.getAIGenerations();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load AI history:', error);
    }
  };

  const handleGenerateEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await adminApi.generateEbook(ebookForm);
      setResult(data);
      loadHistory();
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await adminApi.generateChapter(chapterForm);
      setResult(data);
      loadHistory();
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await adminApi.generateOutline(outlineForm);
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await adminApi.improveContent(improveForm);
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-stone-200 w-fit">
        {[
          { id: 'ebook', label: 'Full Ebook', icon: '📚' },
          { id: 'chapter', label: 'Chapter', icon: '📄' },
          { id: 'outline', label: 'Outline', icon: '📋' },
          { id: 'improve', label: 'Improve', icon: '✨' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setMode(tab.id as any); setResult(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === tab.id ? 'bg-blue-600 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-800 mb-4">
            {mode === 'ebook' && '📚 Generate Full Ebook'}
            {mode === 'chapter' && '📄 Generate Chapter'}
            {mode === 'outline' && '📋 Generate Outline'}
            {mode === 'improve' && '✨ Improve Content'}
          </h3>

          {mode === 'ebook' && (
            <form onSubmit={handleGenerateEbook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={ebookForm.title}
                  onChange={(e) => setEbookForm({ ...ebookForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Topic *</label>
                <textarea
                  value={ebookForm.topic}
                  onChange={(e) => setEbookForm({ ...ebookForm, topic: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the main topic and themes of your ebook..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Chapters</label>
                  <input
                    type="number"
                    value={ebookForm.chapters}
                    onChange={(e) => setEbookForm({ ...ebookForm, chapters: parseInt(e.target.value) })}
                    min={1}
                    max={30}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Style</label>
                  <input
                    type="text"
                    value={ebookForm.style}
                    onChange={(e) => setEbookForm({ ...ebookForm, style: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={ebookForm.target_audience}
                  onChange={(e) => setEbookForm({ ...ebookForm, target_audience: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Ebook'}
              </button>
            </form>
          )}

          {mode === 'chapter' && (
            <form onSubmit={handleGenerateChapter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Topic *</label>
                <textarea
                  value={chapterForm.topic}
                  onChange={(e) => setChapterForm({ ...chapterForm, topic: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Style</label>
                  <input
                    type="text"
                    value={chapterForm.style}
                    onChange={(e) => setChapterForm({ ...chapterForm, style: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Word Count</label>
                  <input
                    type="number"
                    value={chapterForm.word_count}
                    onChange={(e) => setChapterForm({ ...chapterForm, word_count: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Chapter'}
              </button>
            </form>
          )}

          {mode === 'outline' && (
            <form onSubmit={handleGenerateOutline} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={outlineForm.title}
                  onChange={(e) => setOutlineForm({ ...outlineForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Topic *</label>
                <textarea
                  value={outlineForm.topic}
                  onChange={(e) => setOutlineForm({ ...outlineForm, topic: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Chapters</label>
                  <input
                    type="number"
                    value={outlineForm.chapters}
                    onChange={(e) => setOutlineForm({ ...outlineForm, chapters: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Style</label>
                  <input
                    type="text"
                    value={outlineForm.style}
                    onChange={(e) => setOutlineForm({ ...outlineForm, style: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Outline'}
              </button>
            </form>
          )}

          {mode === 'improve' && (
            <form onSubmit={handleImprove} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Content to Improve *</label>
                <textarea
                  value={improveForm.content}
                  onChange={(e) => setImproveForm({ ...improveForm, content: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Instruction (optional)</label>
                <input
                  type="text"
                  value={improveForm.instruction}
                  onChange={(e) => setImproveForm({ ...improveForm, instruction: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Make it more formal, Add examples..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Improving...' : 'Improve Content'}
              </button>
            </form>
          )}
        </div>

        {/* Result */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Result</h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-stone-500">AI is generating content...</p>
              <p className="text-stone-400 text-sm">This may take a few moments</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {result.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{result.error}</p>
                </div>
              ) : (
                <>
                  {result.success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-700">Generation successful!</p>
                    </div>
                  )}
                  {result.internal_ebook_id && (
                    <p className="text-sm text-stone-600">Internal Ebook ID: {result.internal_ebook_id}</p>
                  )}
                  {result.chapters_generated !== undefined && (
                    <p className="text-sm text-stone-600">Chapters generated: {result.chapters_generated}</p>
                  )}
                  {result.content && (
                    <div className="bg-stone-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-stone-700 whitespace-pre-wrap">{result.content}</pre>
                    </div>
                  )}
                  {result.improved && (
                    <div className="bg-stone-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-xs text-stone-500 mb-2">Improved ({result.word_count} words):</p>
                      <pre className="text-sm text-stone-700 whitespace-pre-wrap">{result.improved}</pre>
                    </div>
                  )}
                  {result.outline && (
                    <div className="bg-stone-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-stone-700 whitespace-pre-wrap">
                        {typeof result.outline === 'string' ? result.outline : JSON.stringify(result.outline, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!loading && !result && !showHistory && (
            <div className="flex items-center justify-center h-64 text-stone-400">
              <p>Generation results will appear here</p>
            </div>
          )}

          {showHistory && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-stone-400 text-center py-8">No generation history</p>
              ) : (
                history.map(gen => (
                  <div key={gen.id} className="bg-stone-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-stone-600 capitalize">{gen.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        gen.status === 'completed' ? 'bg-green-100 text-green-600' :
                        gen.status === 'failed' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {gen.status}
                      </span>
                    </div>
                    <p className="text-sm text-stone-700 line-clamp-2">{gen.prompt.substring(0, 100)}...</p>
                    <p className="text-xs text-stone-400 mt-1">{new Date(gen.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;
