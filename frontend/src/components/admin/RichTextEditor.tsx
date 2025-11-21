import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Code } from "lucide-react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Enter text..." }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    const execCommand = (command: string, value: string | null = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();

        // Get the pasted content
        const text = e.clipboardData.getData('text/plain');
        const html = e.clipboardData.getData('text/html');

        // If HTML is available and looks like HTML tags, use it
        if (html && html.includes('<')) {
            // Insert HTML directly
            document.execCommand('insertHTML', false, html);
        } else if (text && (text.includes('<p>') || text.includes('<strong>') || text.includes('<ul>'))) {
            // If plain text contains HTML tags, treat it as HTML
            document.execCommand('insertHTML', false, text);
        } else {
            // Otherwise insert as plain text
            document.execCommand('insertText', false, text);
        }

        // Trigger update
        handleInput();
    };

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                <button
                    type="button"
                    onClick={() => execCommand("bold")}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Bold (Ctrl+B)"
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("italic")}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Italic (Ctrl+I)"
                >
                    <Italic size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                    type="button"
                    onClick={() => execCommand("insertUnorderedList")}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Bullet List"
                >
                    <List size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("insertOrderedList")}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Numbered List"
                >
                    <ListOrdered size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                    type="button"
                    onClick={() => {
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                            editorRef.current?.focus();
                        }
                    }}
                    className="p-2 hover:bg-gray-200 rounded transition-colors text-xs px-3 font-medium text-gray-600"
                    title="Paste HTML is supported"
                >
                    <Code size={18} />
                    <span className="ml-1 text-xs">HTML OK</span>
                </button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                className="p-3 min-h-[120px] focus:outline-none prose prose-sm max-w-none"
                data-placeholder={placeholder}
                style={{ whiteSpace: "pre-wrap" }}
            />
            <style>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    cursor: text;
                }
            `}</style>
        </div>
    );
}