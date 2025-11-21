import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

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
                    title="Bold"
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("italic")}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Italic"
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
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
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