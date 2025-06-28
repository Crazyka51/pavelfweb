'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamicky importujeme celý CKEditor s React
const DynamicCKEditor = dynamic(
  () => import('./CKEditorComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-48 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Načítání editoru...</div>
      </div>
    )
  }
)

interface CKEditorWrapperProps {
  data: string
  onChange: (data: string) => void
  placeholder?: string
}

export default function CKEditorWrapper({ data, onChange, placeholder }: CKEditorWrapperProps) {
  const [isClient, setIsClient] = React.useState(false)
  const [editorError, setEditorError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-48 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Načítání editoru...</div>
      </div>
    )
  }

  if (editorError) {
    return (
      <div className="h-48 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p>Chyba editoru: {editorError}</p>
          <button 
            onClick={() => {
              setEditorError(null)
              window.location.reload()
            }}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Obnovit stránku
          </button>
        </div>
      </div>
    )
  }

  return (
    <DynamicCKEditor
      data={data}
      onChange={onChange}
      placeholder={placeholder}
      onError={setEditorError}
    />
  )
}
    return (
      <div className="h-48 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p>Chyba editoru: {editorError}</p>
          <button 
            onClick={() => {
              setEditorError(null)
              window.location.reload()
            }}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Obnovit stránku
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <CKEditor
        editor={ClassicEditor}
        data={data || ''}
        config={{
          placeholder: placeholder || 'Začněte psát obsah článku...',
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            'link',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'imageUpload',
            'blockQuote',
            'insertTable',
            '|',
            'undo',
            'redo'
          ],
          heading: {
            options: [
              { model: 'paragraph', title: 'Odstavec', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Nadpis 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Nadpis 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Nadpis 3', class: 'ck-heading_heading3' }
            ]
          },
          image: {
            toolbar: [
              'imageStyle:inline',
              'imageStyle:block',
              'imageStyle:side',
              '|',
              'toggleImageCaption',
              'imageTextAlternative'
            ]
          },
          table: {
            contentToolbar: [
              'tableColumn',
              'tableRow',
              'mergeTableCells'
            ]
          },
          link: {
            decorators: {
              openInNewTab: {
                mode: 'manual',
                label: 'Otevřít v novém okně',
                attributes: {
                  target: '_blank',
                  rel: 'noopener noreferrer'
                }
              }
            }
          }
        }}
        onChange={(event, editor) => {
          try {
            const data = editor.getData()
            onChange(data)
          } catch (error) {
            console.error('CKEditor error:', error)
            setEditorError('Chyba při editaci obsahu')
          }
        }}
        onError={(error, { willEditorRestart }) => {
          console.error('CKEditor error:', error)
          if (willEditorRestart) {
            setEditorError('Editor se restartuje...')
          } else {
            setEditorError('Neočekávaná chyba editoru')
          }
        }}
      />
    </div>
  )
}
