"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface SimpleArticleEditorProps {
  content: string
  onContentChange: (content: string) => void
  placeholder?: string
}

export function SimpleArticleEditor({ content, onContentChange, placeholder }: SimpleArticleEditorProps) {
  const [currentContent, setCurrentContent] = useState(content)

  useEffect(() => {
    setCurrentContent(content)
  }, [content])

  const handleImageInsert = useCallback(() => {
    const url = prompt("URL obrázku:", "https://")
    if (url && url.startsWith("http")) {
      setCurrentContent((prev) => prev + `\n\n[OBRÁZEK: ${url}]\n\n`)
    }
  }, [])

  const handleLinkInsert = useCallback(() => {
    const url = prompt("URL odkazu:", "https://")
    const text = prompt("Text odkazu:", "")
    if (url && text) {
      setCurrentContent((prev) => prev + ` [ODKAZ: ${text} - ${url}] `)
    }
  }, [])

  const handleConvertToWeb = useCallback(() => {
    const paragraphs = currentContent.split("\n\n").filter((p) => p.trim())
    const formatted = paragraphs
      .map((paragraph) => {
        let p = paragraph.trim()

        // Převod speciálních značek
        p = p.replace(
          /\[OBRÁZEK: ([^\]]+)\]/g,
          '<img src="$1" alt="Obrázek" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />',
        )
        p = p.replace(/\[ODKAZ: ([^-]+) - ([^\]]+)\]/g, '<a href="$2" target="_blank">$1</a>')

        // Detekce nadpisů (řádky začínající velkým písmenem a kratší než 60 znaků)
        if (p.length < 60 && p.match(/^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/)) {
          return `<h2>${p}</h2>`
        }

        // Obyčejné odstavce
        return `<p>${p}</p>`
      })
      .join("\n")

    onContentChange(formatted)
  }, [currentContent, onContentChange])

  const handleClearContent = useCallback(() => {
    if (confirm("Vymazat celý obsah?")) {
      setCurrentContent("")
      onContentChange("")
    }
  }, [onContentChange])

  return (
    <div className="space-y-4">
      <div className="border border-green-300 rounded-lg p-3 bg-green-50">
        <div className="flex items-start space-x-2">
          <span className="text-green-600 text-lg">✅</span>
          <div>
            <p className="text-sm text-green-800 font-medium">Jednoduchý editor</p>
            <p className="text-xs text-green-700 mt-1">Pište normálně jako v Word. Formátování se přidá automaticky.</p>
          </div>
        </div>
      </div>

      {/* Jednoduché formátovací tlačítka */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
        <Button
          type="button"
          onClick={handleImageInsert}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          📷 Přidat obrázek
        </Button>
        <Button
          type="button"
          onClick={handleLinkInsert}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          🔗 Přidat odkaz
        </Button>
        <Button
          type="button"
          onClick={handleConvertToWeb}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        >
          ✨ Převést na web
        </Button>
        <Button
          type="button"
          onClick={handleClearContent}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          🗑️ Vymazat
        </Button>
      </div>

      <Textarea
        value={currentContent}
        onChange={(e) => setCurrentContent(e.target.value)}
        className="w-full min-h-[400px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base leading-relaxed"
        placeholder={
          placeholder ||
          `Začněte psát článek...\n\nPište normálně jako v textovém editoru. Například:\n\nNadpis článku\n\nToto je první odstavec článku. Pište normálně, formátování se přidá automaticky.\n\nToto je druhý odstavec. Pro přidání obrázku nebo odkazu použijte tlačítka výše.\n\nPo napsání článku klikněte na 'Převést na web' a text se automaticky naformátuje pro zobrazení na webu.`
        }
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          lineHeight: "1.6",
        }}
      />

      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="font-medium text-blue-800 mb-2">💡 Jak psát články:</p>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• Pište normálně, každý odstavec oddělte prázdným řádkem</li>
          <li>• Krátké řádky (do 60 znaků) se stanou nadpisy</li>
          <li>• Pro obrázky a odkazy použijte tlačítka</li>
          <li>• Na konci klikněte "Převést na web"</li>
          <li>• Použijte "Náhled" pro kontrolu výsledku</li>
        </ul>
      </div>
    </div>
  )
}
