'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback } from 'react'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading2, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from 'lucide-react'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // Oprava SSR hydration warning
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Začněte psát obsah článku...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] p-4 border border-gray-300 rounded-lg bg-white',
      },
    },
  })

  const addImage = useCallback(() => {
    const url = window.prompt('Zadejte URL obrázku:', 'https://')
    
    if (url && url.startsWith('http')) {
      const alt = window.prompt('Alternativní text pro obrázek (pro SEO):', '') || 'Obrázek'
      editor?.chain().focus().setImage({ src: url, alt }).run()
    } else if (url) {
      alert('Zadejte prosím platnou URL začínající http:// nebo https://')
    }
  }, [editor])

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('Zadejte URL odkazu:', previousUrl || 'https://')

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    if (url.startsWith('http')) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run()
    } else {
      alert('Zadejte prosím platnou URL začínající http:// nebo https://')
    }
  }, [editor])

  if (!editor) {
    return (
      <div className="h-48 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Načítání editoru...</div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Tučně"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Kurzíva"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Nadpis H2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Seznam s odrážkami"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Číslovaný seznam"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Citát"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Zarovnat vlevo"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Zarovnat na střed"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Zarovnat vpravo"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('link') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Vložit odkaz"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200 text-gray-700"
          title="Vložit obrázek"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zpět"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Vpřed"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="min-h-[300px] bg-white">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
