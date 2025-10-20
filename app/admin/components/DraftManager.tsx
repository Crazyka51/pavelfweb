'use client';

import { useState } from 'react';
import { FileText, Clock, Download, Trash2, X } from 'lucide-react';

interface DraftData {
  title: string
  content: string
  excerpt: string
  category: string
  tags: string
  published: boolean
  imageUrl: string
  timestamp: string
  articleId: string
}

interface DraftManagerProps {
  onLoadDraft: (draft: DraftData) => void
  onClose: () => void
}

export default function DraftManager({ onLoadDraft, onClose }: DraftManagerProps) {
  const [drafts, setDrafts] = useState<DraftData[]>(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const savedDraft = localStorage.getItem('article_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        return [draft];
      }
    } catch (error) {
    }
    return [];
  });

  const handleLoadDraft = (draft: DraftData) => {
    onLoadDraft(draft);
    onClose();
  };

  const handleDeleteDraft = (index: number) => {
    if (confirm('Opravdu chcete smazat tento koncept?')) {
      const newDrafts = drafts.filter((_, i) => i !== index);
      setDrafts(newDrafts);
      
      // Pro jednoduchost zatím pouze localStorage draft
      if (newDrafts.length === 0) {
        localStorage.removeItem('article_draft');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPreviewText = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Uložené koncepty</h2>
            <p className="text-sm text-gray-600">Načtěte rozpracovaný článek</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {drafts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné koncepty</h3>
              <p className="text-gray-600">
                Zatím nejsou uloženy žádné koncepty článků.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {draft.title || 'Bez názvu'}
                      </h3>
                      
                      {draft.content && (
                        <p className="text-sm text-gray-600 mb-2">
                          {getPreviewText(draft.content)}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(draft.timestamp)}</span>
                        </div>
                        
                        {draft.category && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {draft.category}
                          </span>
                        )}
                        
                        <span className={`px-2 py-1 rounded-full ${
                          draft.published 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {draft.published ? 'Publikován' : 'Koncept'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleLoadDraft(draft)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Načíst
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDraft(index)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
