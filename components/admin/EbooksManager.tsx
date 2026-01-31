import React, { useState, useEffect } from 'react';
import * as adminApi from '../../services/adminApi';

interface Ebook {
  id: string;
  title: string;
  author: string;
  price: number;
  total_chapters: number;
  total_reads: number;
  unique_readers: number;
  total_sessions: number;
  created_at: string;
}

const EbooksManager: React.FC = () => {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEbooks();
  }, []);

  const loadEbooks = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getEbooks();
      setEbooks(data);
    } catch (error) {
      console.error('Failed to load ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-stone-800">{ebooks.length}</p>
          <p className="text-sm text-stone-500">Total Ebooks</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-blue-600">{ebooks.reduce((acc, e) => acc + (e.total_reads || 0), 0)}</p>
          <p className="text-sm text-stone-500">Total Reads</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-green-600">{ebooks.reduce((acc, e) => acc + (e.unique_readers || 0), 0)}</p>
          <p className="text-sm text-stone-500">Unique Readers</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-purple-600">{ebooks.reduce((acc, e) => acc + (e.total_chapters || 0), 0)}</p>
          <p className="text-sm text-stone-500">Total Chapters</p>
        </div>
      </div>

      {/* Ebooks List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : ebooks.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-stone-400">No ebooks found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Chapters</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Reads</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Readers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {ebooks.map(ebook => (
                <tr key={ebook.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-800">{ebook.title}</p>
                    <p className="text-xs text-stone-400">{ebook.id}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">{ebook.author}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{ebook.total_chapters}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-blue-600">{ebook.total_reads || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-green-600">{ebook.unique_readers || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-400">
                    {new Date(ebook.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-sm">
          <strong>Note:</strong> To add or edit public ebooks, use the database seed file or implement a dedicated content management interface. 
          Internal ebooks can be created in the "Internal Ebooks" section for drafts and private content.
        </p>
      </div>
    </div>
  );
};

export default EbooksManager;
