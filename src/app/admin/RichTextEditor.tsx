import React, { useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export interface RichTextEditorRef {
  insertText: (before: string, after?: string, defaultText?: string) => void;
  insertBold: () => void;
  insertTable: () => void;
  insertBulletList: () => void;
  insertNumberedList: () => void;
  insertCallout: () => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  focus: () => void;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

interface TextHistoryEntry {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(function RichTextEditor(
  { value, onChange, placeholder = 'متن بخش را در این قسمت بنویسید...', onFocus, onHistoryChange },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<TextHistoryEntry[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const lastKnownValueRef = useRef<string>(value || '');
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const savedScrollTopRef = useRef<number | null>(null);

  const notifyHistoryChange = useCallback(() => {
    if (onHistoryChange) {
      const canU = typingDebounceRef.current !== null || historyIndexRef.current > 0;
      const canR = historyIndexRef.current < historyRef.current.length - 1;
      onHistoryChange(canU, canR);
    }
  }, [onHistoryChange]);

  // External prop synchronization:
  // Only resets history if the external prop differs from our local text,
  // preventing typing cascades.
  useEffect(() => {
    if (value === lastKnownValueRef.current) {
      return;
    }
    const initialVal = value || '';
    lastKnownValueRef.current = initialVal;
    historyRef.current = [
      {
        value: initialVal,
        selectionStart: initialVal.length,
        selectionEnd: initialVal.length,
      },
    ];
    historyIndexRef.current = 0;
  }, [value]);

  // Restore scroll position inside textarea after DOM updates
  useIsomorphicLayoutEffect(() => {
    if (savedScrollTopRef.current !== null && textareaRef.current) {
      textareaRef.current.scrollTop = savedScrollTopRef.current;
      savedScrollTopRef.current = null;
    }
  }, [value]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
    };
  }, []);

  const commitSnapshot = (newValue: string, selStart?: number, selEnd?: number) => {
    const textarea = textareaRef.current;
    const start = selStart ?? textarea?.selectionStart ?? newValue.length;
    const end = selEnd ?? textarea?.selectionEnd ?? newValue.length;

    const currentEntry = historyRef.current[historyIndexRef.current];
    if (currentEntry && currentEntry.value === newValue) {
      return;
    }

    // Truncate any redo branch ahead of current index
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);

    newHistory.push({
      value: newValue,
      selectionStart: start,
      selectionEnd: end,
    });

    // Maintain a maximum buffer size of 80 snapshots
    if (newHistory.length > 80) {
      newHistory.shift();
    }

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  };

  const undo = (): boolean => {
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
      const textarea = textareaRef.current;
      if (textarea && textarea.value !== historyRef.current[historyIndexRef.current]?.value) {
        commitSnapshot(textarea.value, textarea.selectionStart, textarea.selectionEnd);
      }
    }

    if (historyIndexRef.current <= 0) {
      return false;
    }

    const prevScrollTop = textareaRef.current?.scrollTop ?? 0;
    savedScrollTopRef.current = prevScrollTop;

    historyIndexRef.current -= 1;
    const target = historyRef.current[historyIndexRef.current];

    lastKnownValueRef.current = target.value;
    onChange(target.value);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(target.selectionStart, target.selectionEnd);
        textarea.scrollTop = prevScrollTop;
      }
      notifyHistoryChange();
    });

    return true;
  };

  const redo = (): boolean => {
    if (historyIndexRef.current >= historyRef.current.length - 1) {
      return false;
    }

    const prevScrollTop = textareaRef.current?.scrollTop ?? 0;
    savedScrollTopRef.current = prevScrollTop;

    historyIndexRef.current += 1;
    const target = historyRef.current[historyIndexRef.current];

    lastKnownValueRef.current = target.value;
    onChange(target.value);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(target.selectionStart, target.selectionEnd);
        textarea.scrollTop = prevScrollTop;
      }
      notifyHistoryChange();
    });

    return true;
  };

  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const prevScrollTop = textarea.scrollTop;
    savedScrollTopRef.current = prevScrollTop;

    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    commitSnapshot(textarea.value, textarea.selectionStart, textarea.selectionEnd);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultText;
    const replacement = `${before}${selectedText}${after}`;

    const newValue =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    const targetStart = start + before.length;
    const targetEnd = start + before.length + selectedText.length;

    lastKnownValueRef.current = newValue;
    onChange(newValue);
    commitSnapshot(newValue, targetStart, targetEnd);
    notifyHistoryChange();

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.setSelectionRange(targetStart, targetEnd);
        textareaRef.current.scrollTop = prevScrollTop;
      }
    });
  };

  const insertBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const prevScrollTop = textarea.scrollTop;
    savedScrollTopRef.current = prevScrollTop;

    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    commitSnapshot(textarea.value, textarea.selectionStart, textarea.selectionEnd);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    if (!selectedText) {
      const placeholder = 'متن برجسته';
      const replacement = `**${placeholder}**`;
      const newValue = text.substring(0, start) + replacement + text.substring(end);
      const selStart = start + 2;
      const selEnd = selStart + placeholder.length;

      lastKnownValueRef.current = newValue;
      onChange(newValue);
      commitSnapshot(newValue, selStart, selEnd);
      notifyHistoryChange();

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus({ preventScroll: true });
          textareaRef.current.setSelectionRange(selStart, selEnd);
          textareaRef.current.scrollTop = prevScrollTop;
        }
      });
      return;
    }

    const toggleBoldLine = (line: string): string => {
      if (!line.trim()) return line;

      // Ordered list item (e.g. "۱. متن" or "1. text" or "۱- متن" or "۱) متن")
      const orderedMatch = line.match(/^(\s*[0-9۰-۹]+[\.\-\)]\s+)(.*)$/);
      if (orderedMatch) {
        const marker = orderedMatch[1];
        const content = orderedMatch[2];
        if (content.startsWith('**') && content.endsWith('**') && content.length >= 4) {
          return marker + content.slice(2, -2);
        }
        return `${marker}**${content}**`;
      }

      // Bullet list item (e.g. "- متن" or "* متن" or "• متن")
      const bulletMatch = line.match(/^(\s*[\-\*•]\s+)(.*)$/);
      if (bulletMatch) {
        const marker = bulletMatch[1];
        const content = bulletMatch[2];
        if (content.startsWith('**') && content.endsWith('**') && content.length >= 4) {
          return marker + content.slice(2, -2);
        }
        return `${marker}**${content}**`;
      }

      // Regular line
      if (line.startsWith('**') && line.endsWith('**') && line.length >= 4) {
        return line.slice(2, -2);
      }
      return `**${line}**`;
    };

    let replacement: string;
    if (selectedText.includes('\n')) {
      // Multi-line selection: bold each item/line individually
      const lines = selectedText.split('\n');
      replacement = lines.map(toggleBoldLine).join('\n');
    } else {
      // Single-line selection: check if entire list item was selected
      const orderedMatch = selectedText.match(/^(\s*[0-9۰-۹]+[\.\-\)]\s+)(.*)$/);
      const bulletMatch = selectedText.match(/^(\s*[\-\*•]\s+)(.*)$/);

      if (orderedMatch) {
        const marker = orderedMatch[1];
        const content = orderedMatch[2];
        if (content.startsWith('**') && content.endsWith('**') && content.length >= 4) {
          replacement = marker + content.slice(2, -2);
        } else {
          replacement = `${marker}**${content}**`;
        }
      } else if (bulletMatch) {
        const marker = bulletMatch[1];
        const content = bulletMatch[2];
        if (content.startsWith('**') && content.endsWith('**') && content.length >= 4) {
          replacement = marker + content.slice(2, -2);
        } else {
          replacement = `${marker}**${content}**`;
        }
      } else if (
        selectedText.startsWith('**') &&
        selectedText.endsWith('**') &&
        selectedText.length >= 4
      ) {
        replacement = selectedText.slice(2, -2);
      } else {
        replacement = `**${selectedText}**`;
      }
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    const newSelStart = start;
    const newSelEnd = start + replacement.length;

    lastKnownValueRef.current = newValue;
    onChange(newValue);
    commitSnapshot(newValue, newSelStart, newSelEnd);
    notifyHistoryChange();

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.setSelectionRange(newSelStart, newSelEnd);
        textareaRef.current.scrollTop = prevScrollTop;
      }
    });
  };

  const insertTable = () => {
    const tableTemplate = `\n| عنوان ستون ۱ | عنوان ستون ۲ | عنوان ستون ۳ |\n| :--- | :--- | :--- |\n| سطر اول، مقدار ۱ | سطر اول، مقدار ۲ | سطر اول، مقدار ۳ |\n| سطر دوم، مقدار ۱ | سطر دوم، مقدار ۲ | سطر دوم، مقدار ۳ |\n\n`;
    insertText(tableTemplate, '');
  };

  const toPersianDigits = (num: number): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, d => persianDigits[parseInt(d, 10)]);
  };

  const insertBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const prevScrollTop = textarea.scrollTop;
    savedScrollTopRef.current = prevScrollTop;

    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    commitSnapshot(textarea.value, textarea.selectionStart, textarea.selectionEnd);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const prefix = start === 0 || text[start - 1] === '\n' ? '' : '\n';
    const itemText = selectedText || 'مورد جدید';
    const replacement = `${prefix}- ${itemText}\n`;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    const newCursor = start + prefix.length + 2;
    const newCursorEnd = newCursor + itemText.length;

    lastKnownValueRef.current = newValue;
    onChange(newValue);
    commitSnapshot(newValue, newCursor, newCursorEnd);
    notifyHistoryChange();

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.setSelectionRange(newCursor, newCursorEnd);
        textareaRef.current.scrollTop = prevScrollTop;
      }
    });
  };

  const insertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const prevScrollTop = textarea.scrollTop;
    savedScrollTopRef.current = prevScrollTop;

    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    commitSnapshot(textarea.value, textarea.selectionStart, textarea.selectionEnd);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const textBefore = text.substring(0, start);
    const linesBefore = textBefore.split('\n');

    let nextNum = 1;
    for (let i = linesBefore.length - 1; i >= 0; i--) {
      const line = linesBefore[i].trim();
      if (!line) {
        if (i === linesBefore.length - 1) continue;
        break;
      }
      const match = line.match(/^(?:\*\*\s*)?([0-9۰-۹]+)[\.\-\)]/);
      if (match) {
        const rawDigits = match[1].replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
        const parsed = parseInt(rawDigits, 10);
        if (!isNaN(parsed)) {
          nextNum = parsed + 1;
        }
        break;
      } else {
        break;
      }
    }

    const numStr = toPersianDigits(nextNum);
    const prefix = start === 0 || text[start - 1] === '\n' ? '' : '\n';
    const itemText = selectedText || `مورد ${numStr}`;
    const replacement = `${prefix}${numStr}. ${itemText}\n`;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    const contentStart = start + prefix.length + numStr.length + 2;
    const contentEnd = contentStart + itemText.length;

    lastKnownValueRef.current = newValue;
    onChange(newValue);
    commitSnapshot(newValue, contentStart, contentEnd);
    notifyHistoryChange();

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.setSelectionRange(contentStart, contentEnd);
        textareaRef.current.scrollTop = prevScrollTop;
      }
    });
  };

  const insertCallout = () => {
    insertText('\n> **نکته کلینیکی مهم:** ', '\n');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const selStart = e.target.selectionStart;
    const selEnd = e.target.selectionEnd;

    lastKnownValueRef.current = newVal;
    onChange(newVal);

    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }

    typingDebounceRef.current = setTimeout(() => {
      commitSnapshot(newVal, selStart, selEnd);
      typingDebounceRef.current = null;
      notifyHistoryChange();
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    const isZKey =
      e.code === 'KeyZ' || e.key.toLowerCase() === 'z' || e.key === 'ظ' || e.key === 'ئ';

    const isYKey =
      e.code === 'KeyY' || e.key.toLowerCase() === 'y' || e.key === 'غ' || e.key === 'ي';

    const isBKey = e.code === 'KeyB' || e.key.toLowerCase() === 'b' || e.key === 'ذ';

    if (isCtrlOrMeta && isZKey) {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }

    if (isCtrlOrMeta && isYKey) {
      e.preventDefault();
      e.stopPropagation();
      redo();
      return;
    }

    if (isCtrlOrMeta && isBKey) {
      e.preventDefault();
      e.stopPropagation();
      insertBold();
      return;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
      commitSnapshot(e.target.value, e.target.selectionStart, e.target.selectionEnd);
      notifyHistoryChange();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    commitSnapshot(
      e.currentTarget.value,
      e.currentTarget.selectionStart,
      e.currentTarget.selectionEnd
    );
  };

  useImperativeHandle(ref, () => ({
    insertText,
    insertBold,
    insertTable,
    insertBulletList,
    insertNumberedList,
    insertCallout,
    undo,
    redo,
    canUndo: () => {
      const hasPending = typingDebounceRef.current !== null;
      return hasPending || historyIndexRef.current > 0;
    },
    canRedo: () => historyIndexRef.current < historyRef.current.length - 1,
    focus: () => {
      textareaRef.current?.focus({ preventScroll: true });
    },
  }));

  return (
    <div className="rich-editor-container">
      <textarea
        ref={textareaRef}
        className="rich-editor-textarea"
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onPaste={handlePaste}
        onFocus={onFocus}
        placeholder={placeholder}
        rows={10}
      />
    </div>
  );
});

export default RichTextEditor;
