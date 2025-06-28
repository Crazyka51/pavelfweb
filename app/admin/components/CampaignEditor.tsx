'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, Send, Mail, Settings, X } from 'lucide-react'
import TiptapEditor from './TiptapEditor'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  createdAt: string
  updatedAt: string
}

interface CampaignEditorProps {
  template?: EmailTemplate | null
  onSave: (template: EmailTemplate) => void
  onCancel: () => void
  onSendCampaign: (template: EmailTemplate, recipients: string[]) => void
  subscriberCount: number
  token: string
}

export default function CampaignEditor({ 
  template, 
  onSave, 
  onCancel, 
  onSendCampaign, 
  subscriberCount,
  token 
}: CampaignEditorProps) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (template) {
      setName(template.name)
      setSubject(template.subject)
      setHtmlContent(template.htmlContent)
    } else {
      // Default template
      setName('Nová kampaň')
      setSubject('Novinky z Prahy 4')
      setHtmlContent(`
        <h2>Vážení čtenáři,</h2>
        
        <p>Rádi bychom vás informovali o aktuálním dění v Praze 4.</p>
        
        <h3>Hlavní témata:</h3>
        <ul>
          <li>Téma 1</li>
          <li>Téma 2</li>
          <li>Téma 3</li>
        </ul>
        
        <p>Více informací najdete na našem webu.</p>
        
        <p>S pozdravem,<br>Pavel Fišer</p>
      `)
    }
  }, [template])

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !htmlContent.trim()) {
      alert('Vyplňte všechna povinná pole!')
      return
    }

    setIsSaving(true)
    
    const templateData: EmailTemplate = {
      id: template?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      subject: subject.trim(),
      htmlContent: htmlContent.trim(),
      textContent: htmlContent.replace(/<[^>]*>/g, ''), // Simple HTML to text conversion
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await onSave(templateData)
    setIsSaving(false)
  }

  const handleSendCampaign = async () => {
    if (!name.trim() || !subject.trim() || !htmlContent.trim()) {
      alert('Vyplňte všechna povinná pole před odesláním!')
      return
    }

    const confirmed = confirm(
      `Opravdu chcete odeslat newsletter "${subject}" všem ${subscriberCount} odběratelům?`
    )
    
    if (!confirmed) return

    setIsSending(true)
    
    const templateData: EmailTemplate = {
      id: template?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      subject: subject.trim(),
      htmlContent: htmlContent.trim(),
      textContent: htmlContent.replace(/<[^>]*>/g, ''),
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      await onSendCampaign(templateData, []) // Empty array means send to all subscribers
      alert('Newsletter byl úspěšně odeslán!')
      onCancel()
    } catch (error) {
      alert('Chyba při odesílání newsletteru. Zkuste to prosím později.')
    } finally {
      setIsSending(false)
    }
  }

  const generatePreviewHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email-container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
            text-align: center;
          }
          .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 30px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          .unsubscribe {
            color: #6b7280;
            text-decoration: none;
          }
          h2 { color: #1f2937; }
          h3 { color: #374151; }
          a { color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1 style="color: #2563eb; margin: 0;">Pavel Fišer - Praha 4</h1>
            <p style="margin: 5px 0 0 0; color: #6b7280;">Radní pro místní rozvoj</p>
          </div>
          
          ${htmlContent}
          
          <div class="footer">
            <p>Tento e-mail byl odeslán z adresy no-reply@pavelfiser.cz</p>
            <p><a href="#" class="unsubscribe">Odhlásit se z odběru</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Preview header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-semibold text-gray-900">Náhled e-mailu</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPreview(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Zpět k editaci
                </button>
                <button
                  onClick={handleSendCampaign}
                  disabled={isSending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'Odesílání...' : `Odeslat (${subscriberCount})`}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Preview content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-4 pb-4 border-b">
              <p><strong>Předmět:</strong> {subject}</p>
              <p><strong>Odesílatel:</strong> Pavel Fišer &lt;no-reply@pavelfiser.cz&gt;</p>
              <p><strong>Příjemci:</strong> {subscriberCount} odběratelů</p>
            </div>
            <iframe
              srcDoc={generatePreviewHTML()}
              className="w-full h-96 border border-gray-200 rounded"
              title="Email Preview"
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Editor header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {template ? 'Upravit šablonu' : 'Nová e-mailová kampaň'}
              </h1>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Zrušit
              </button>
              
              <button
                onClick={() => setIsPreview(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Náhled
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving || !name.trim() || !subject.trim() || !htmlContent.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Ukládání...' : 'Uložit'}
              </button>
              
              <button
                onClick={handleSendCampaign}
                disabled={isSending || !name.trim() || !subject.trim() || !htmlContent.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Odesílání...' : `Odeslat (${subscriberCount})`}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template name */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Název šablony *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Zadejte název šablony..."
                required
              />
            </div>

            {/* Subject */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Předmět e-mailu *
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Zadejte předmět e-mailu..."
                required
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Obsah e-mailu *
              </label>
              
              <TiptapEditor
                content={htmlContent}
                onChange={setHtmlContent}
                placeholder="Začněte psát obsah e-mailu..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informace o kampani</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Odběratelé:</span>
                  <span className="text-sm font-medium">{subscriberCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Typ:</span>
                  <span className="text-sm font-medium">Newsletter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stav:</span>
                  <span className="text-sm font-medium text-yellow-600">Koncept</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tipy pro newsletter</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Používejte krátký a výstižný předmět</li>
                <li>• Strukturujte obsah s nadpisy</li>
                <li>• Přidejte relevantní odkazy</li>
                <li>• Nezapomeňte na osobní podpis</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
