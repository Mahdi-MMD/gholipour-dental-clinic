'use client';

import React, { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'متن بخش را در این قسمت بنویسید...',
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultText;
    const replacement = `${before}${selectedText}${after}`;

    const newValue =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 10);
  };

  const insertTable = () => {
    const tableTemplate = `\n| عنوان ستون ۱ | عنوان ستون ۲ | عنوان ستون ۳ |\n| :--- | :--- | :--- |\n| سطر اول، مقدار ۱ | سطر اول، مقدار ۲ | سطر اول، مقدار ۳ |\n| سطر دوم، مقدار ۱ | سطر دوم، مقدار ۲ | سطر دوم، مقدار ۳ |\n\n`;
    insertText(tableTemplate, '');
  };

  const insertBulletList = () => {
    insertText('\n- مورد اول\n- مورد دوم\n- مورد سوم\n', '');
  };

  const insertNumberedList = () => {
    insertText('\n۱. مرحله اول\n۲. مرحله دوم\n۳. مرحله سوم\n', '');
  };

  const insertCallout = () => {
    insertText('\n> **نکته کلینیکی مهم:** ', '\n');
  };

  return (
    <div className="rich-editor-container">
      {/* Visual Toolbar */}
      <div className="rich-editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            title="تیتر ۳ (زیرعنوان)"
            onClick={() => insertText('### ', '', 'عنوان بخش')}
          >
            H3
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="تیتر ۴"
            onClick={() => insertText('#### ', '', 'عنوان فرعی')}
          >
            H4
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            title="برجسته (Bold)"
            onClick={() => insertText('**', '**', 'متن برجسته')}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="مورب (Italic)"
            onClick={() => insertText('*', '*', 'متن مورب')}
          >
            <em>I</em>
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            title="لیست بالت‌دار (Bullet list)"
            onClick={insertBulletList}
          >
            • لیست گلوله‌ای
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="لیست شماره‌دار (Numbered list)"
            onClick={insertNumberedList}
          >
            ۱. لیست عددی
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn highlight-btn"
            title="درج جدول مقایسه‌ای / مشخصات"
            onClick={insertTable}
          >
            📊 درج جدول (Table)
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="باکس پیام یا نکته پزشکی"
            onClick={insertCallout}
          >
            💡 کادر نکته
          </button>
        </div>
      </div>

      {/* Editor Textarea */}
      <textarea
        ref={textareaRef}
        className="rich-editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
      />
    </div>
  );
}
