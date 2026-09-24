'use client'

import { useEffect, useState } from 'react'
import {
  EditorContent,
  useEditor,
} from '@tiptap/react'

import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your blog content here...',
}: RichTextEditorProps) {
  const [mounted, setMounted] =
    useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,

      Underline,

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),

      TextAlign.configure({
        types: [
          'heading',
          'paragraph',
        ],
      }),

      Placeholder.configure({
        placeholder,
      }),
    ],

    content: value,

    immediatelyRender: false,

    editorProps: {
      attributes: {
        class:
          'tiptap min-h-[420px] w-full px-4 py-3 focus:outline-none',
      },
    },

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!editor) {
      return
    }

    if (value === editor.getHTML()) {
      return
    }

    if (!value) {
      editor.commands.clearContent()
      return
    }

    editor.commands.setContent(value)
  }, [editor, value])

  if (!mounted || !editor) {
    return (
      <div className="min-h-[470px] animate-pulse rounded-lg border border-gray-300 bg-gray-50" />
    )
  }

  const setLink = () => {
    const previousUrl =
      editor.getAttributes('link').href

    const url = window.prompt(
      'Enter URL',
      previousUrl || 'https://'
    )

    if (url === null) {
      return
    }

    if (url === '') {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run()

      return
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run()
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        {/* Undo */}
        <button
          type="button"
          title="Undo"
          onClick={() =>
            editor
              .chain()
              .focus()
              .undo()
              .run()
          }
          disabled={
            !editor.can().chain().focus().undo().run()
          }
          className="rounded px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↶
        </button>

        {/* Redo */}
        <button
          type="button"
          title="Redo"
          onClick={() =>
            editor
              .chain()
              .focus()
              .redo()
              .run()
          }
          disabled={
            !editor.can().chain().focus().redo().run()
          }
          className="rounded px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↷
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        {/* Heading 1 */}
        <button
          type="button"
          title="Heading 1"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 1,
              })
              .run()
          }
          className={`rounded px-2.5 py-1.5 text-sm font-bold hover:bg-gray-200 ${
            editor.isActive('heading', {
              level: 1,
            })
              ? 'bg-gray-300'
              : ''
          }`}
        >
          H1
        </button>

        {/* Heading 2 */}
        <button
          type="button"
          title="Heading 2"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
          className={`rounded px-2.5 py-1.5 text-sm font-bold hover:bg-gray-200 ${
            editor.isActive('heading', {
              level: 2,
            })
              ? 'bg-gray-300'
              : ''
          }`}
        >
          H2
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          title="Heading 3"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run()
          }
          className={`rounded px-2.5 py-1.5 text-sm font-bold hover:bg-gray-200 ${
            editor.isActive('heading', {
              level: 3,
            })
              ? 'bg-gray-300'
              : ''
          }`}
        >
          H3
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        {/* Bold */}
        <button
          type="button"
          title="Bold"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={`rounded px-3 py-1.5 text-sm font-bold hover:bg-gray-200 ${
            editor.isActive('bold')
              ? 'bg-gray-300'
              : ''
          }`}
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          title="Italic"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={`rounded px-3 py-1.5 text-sm italic hover:bg-gray-200 ${
            editor.isActive('italic')
              ? 'bg-gray-300'
              : ''
          }`}
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          title="Underline"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleUnderline()
              .run()
          }
          className={`rounded px-3 py-1.5 text-sm underline hover:bg-gray-200 ${
            editor.isActive('underline')
              ? 'bg-gray-300'
              : ''
          }`}
        >
          U
        </button>

        {/* Strike */}
        <button
          type="button"
          title="Strike"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
          className={`rounded px-3 py-1.5 text-sm line-through hover:bg-gray-200 ${
            editor.isActive('strike')
              ? 'bg-gray-300'
              : ''
          }`}
        >
          S
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        {/* Bullet List */}
        <button
          type="button"
          title="Bullet List"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          className={`rounded px-3 py-1.5 text-sm hover:bg-gray-200 ${
            editor.isActive('bulletList')
              ? 'bg-gray-300'
              : ''
          }`}
        >
          • List
        </button>

        {/* Ordered List */}
        <button
          type="button"
          title="Numbered List"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
          className={`rounded px-3 py-1.5 text-sm hover:bg-gray-200 ${
            editor.isActive('orderedList')
              ? 'bg-gray-300'
              : ''
          }`}
        >
          1. List
        </button>

        {/* Blockquote */}
        <button
          type="button"
          title="Blockquote"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
          className={`rounded px-3 py-1.5 text-sm hover:bg-gray-200 ${
            editor.isActive('blockquote')
              ? 'bg-gray-300'
              : ''
          }`}
        >
          Quote
        </button>

        {/* Code Block */}
        <button
          type="button"
          title="Code Block"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleCodeBlock()
              .run()
          }
          className={`rounded px-3 py-1.5 text-sm hover:bg-gray-200 ${
            editor.isActive('codeBlock')
              ? 'bg-gray-300'
              : ''
          }`}
        >
          Code
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        {/* Link */}
        <button
          type="button"
          title="Add Link"
          onClick={setLink}
          className={`rounded px-3 py-1.5 text-sm hover:bg-gray-200 ${
            editor.isActive('link')
              ? 'bg-gray-300'
              : ''
          }`}
        >
          Link
        </button>

        {/* Align Left */}
        <button
          type="button"
          title="Align Left"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign('left')
              .run()
          }
          className={`rounded px-2.5 py-1.5 text-sm hover:bg-gray-200 ${
            editor.isActive({
              textAlign: 'left',
            })
              ? 'bg-gray-300'
              : ''
          }`}
        >
          L
        </button>

        {/* Align Center */}
        <button
          type="button"
          title="Align Center"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign('center')
              .run()
          }
          className={`rounded px-2.5 py-1.5 text-sm hover:bg-gray-200 ${
            editor.isActive({
              textAlign: 'center',
            })
              ? 'bg-gray-300'
              : ''
          }`}
        >
          C
        </button>

        {/* Align Right */}
        <button
          type="button"
          title="Align Right"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign('right')
              .run()
          }
          className={`rounded px-2.5 py-1.5 text-sm hover:bg-gray-200 ${
            editor.isActive({
              textAlign: 'right',
            })
              ? 'bg-gray-300'
              : ''
          }`}
        >
          R
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        {/* Clear Formatting */}
        <button
          type="button"
          title="Clear Formatting"
          onClick={() =>
            editor
              .chain()
              .focus()
              .clearNodes()
              .unsetAllMarks()
              .run()
          }
          className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
        >
          Clear
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}