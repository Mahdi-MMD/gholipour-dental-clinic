'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { LockKeyhole } from 'lucide-react';
import './admin.css';
import RichTextEditor, { RichTextEditorRef } from './RichTextEditor';
import ArticlePreview from './ArticlePreview';
import GalleryPreview from './GalleryPreview';
import ReservationsManager from './ReservationsManager';
import { ArticleItem, ArticleSection, ArticleFAQ, ArticleCitation } from '@/data/articlesData';
import {
  GalleryItem,
  GALLERY_CATEGORIES,
  DEFAULT_TREATMENT_STAGES,
  TreatmentStage,
  isGalleryItemMatchingCategory,
} from '@/data/galleryData';
import { ReservationItem } from '@/types/reservation';

function PreviewLocateBtn({
  targetId,
  title = 'مشاهده در پیش‌نمایش زنده',
  onLocate,
}: {
  targetId: string;
  title?: string;
  onLocate: (targetId: string) => void;
}) {
  return (
    <button
      type="button"
      className="admin-field-locate-btn"
      onClick={() => onLocate(targetId)}
      title={title}
      aria-label={title}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  );
}

const toPersianDigits = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, d => persianDigits[parseInt(d, 10)]);
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<
    'portal' | 'articles' | 'edit-article' | 'gallery' | 'edit-gallery' | 'reservations'
  >('portal');

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [isNewArticle, setIsNewArticle] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [editorViewMode, setEditorViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Gallery States
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [gallerySearchQuery, setGallerySearchQuery] = useState('');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('all');
  const [galleryTypeFilter, setGalleryTypeFilter] = useState<'all' | 'before-after' | 'stages'>(
    'all'
  );
  const [galleryDateSortOrder, setGalleryDateSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isNewGalleryItem, setIsNewGalleryItem] = useState(false);
  const [galleryViewMode, setGalleryViewMode] = useState<'edit' | 'preview'>('edit');
  const [galleryTagsInput, setGalleryTagsInput] = useState('');
  const [isUploadingGalleryImg, setIsUploadingGalleryImg] = useState<string | null>(null); // e.g. 'before' | 'after' | `stage-${index}`
  const [gallerySaveMessage, setGallerySaveMessage] = useState('');

  // Undo / Redo History Stacks
  const [undoStack, setUndoStack] = useState<ArticleItem[]>([]);
  const [redoStack, setRedoStack] = useState<ArticleItem[]>([]);
  const [editorCanUndo, setEditorCanUndo] = useState(false);
  const [editorCanRedo, setEditorCanRedo] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const editorRefs = useRef<Record<number, RichTextEditorRef | null>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Save Success Toast Popup State
  const [showSaveToast, setShowSaveToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSaveToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setShowSaveToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowSaveToast(false);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Check login status on mount
  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          loadArticles();
          loadGalleryItems();
          loadReservations();
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        loadArticles();
        loadGalleryItems();
        loadReservations();
      } else {
        setLoginError(data.message || 'رمز عبور نامعتبر است');
      }
    } catch {
      setLoginError('خطا در برقراری ارتباط با سرور');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  const loadArticles = async () => {
    try {
      const res = await fetch('/api/admin/articles');
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadGalleryItems = async () => {
    try {
      const res = await fetch('/api/admin/gallery');
      const data = await res.json();
      if (data.success) {
        setGalleryItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load gallery items:', err);
    }
  };

  const loadReservations = async () => {
    try {
      const res = await fetch('/api/admin/reservations');
      const data = await res.json();
      if (data.success && Array.isArray(data.reservations)) {
        setReservations(data.reservations);
      }
    } catch (err) {
      console.error('Failed to load reservations:', err);
    }
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Push snapshot to undo stack
  const pushUndoSnapshot = useCallback((articleToSave: ArticleItem) => {
    setUndoStack(u => [...u.slice(-40), JSON.parse(JSON.stringify(articleToSave))]);
    setRedoStack([]); // Clear redo stack on new action
  }, []);

  const updateArticleWithHistory = useCallback(
    (newArticle: ArticleItem) => {
      setSelectedArticle(prev => {
        if (prev) {
          pushUndoSnapshot(prev);
        }
        return newArticle;
      });
    },
    [pushUndoSnapshot]
  );

  const handleUndo = useCallback(() => {
    // 1. Delegate to active text editor buffer if it has undo history
    const activeEditor = editorRefs.current[activeSectionIndex];
    if (activeEditor && activeEditor.canUndo()) {
      activeEditor.undo();
      setEditorCanUndo(activeEditor.canUndo());
      setEditorCanRedo(activeEditor.canRedo());
      return;
    }

    // 2. Fallback to top-level article undo
    if (undoStack.length === 0 || !selectedArticle) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(u => u.slice(0, -1));
    setRedoStack(r => [...r, JSON.parse(JSON.stringify(selectedArticle))]);
    setSelectedArticle(previous);
  }, [activeSectionIndex, undoStack, selectedArticle]);

  const handleRedo = useCallback(() => {
    // 1. Delegate to active text editor buffer if it has redo history
    const activeEditor = editorRefs.current[activeSectionIndex];
    if (activeEditor && activeEditor.canRedo()) {
      activeEditor.redo();
      setEditorCanUndo(activeEditor.canUndo());
      setEditorCanRedo(activeEditor.canRedo());
      return;
    }

    // 2. Fallback to top-level article redo
    if (redoStack.length === 0 || !selectedArticle) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(r => r.slice(0, -1));
    setUndoStack(u => [...u, JSON.parse(JSON.stringify(selectedArticle))]);
    setSelectedArticle(next);
  }, [activeSectionIndex, redoStack, selectedArticle]);

  // Synchronize ribbon undo/redo state when active section changes
  useEffect(() => {
    const activeEditor = editorRefs.current[activeSectionIndex];
    if (activeEditor) {
      setEditorCanUndo(activeEditor.canUndo());
      setEditorCanRedo(activeEditor.canRedo());
    } else {
      setEditorCanUndo(false);
      setEditorCanRedo(false);
    }
  }, [activeSectionIndex]);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y) supporting both English & Persian keyboard layouts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'edit-article') return;

      const isZKey =
        e.code === 'KeyZ' || e.key.toLowerCase() === 'z' || e.key === 'ظ' || e.key === 'ئ';

      const isYKey =
        e.code === 'KeyY' || e.key.toLowerCase() === 'y' || e.key === 'غ' || e.key === 'ي';

      if ((e.ctrlKey || e.metaKey) && isZKey) {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && isYKey) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, handleUndo, handleRedo]);

  const handleEditArticle = (art: ArticleItem) => {
    setSelectedArticle(JSON.parse(JSON.stringify(art)));
    setKeywordsInput((art.keywords || []).join('، '));
    setIsNewArticle(false);
    setActiveTab('edit-article');
    setSaveMessage('');
    setUndoStack([]);
    setRedoStack([]);
    setEditorCanUndo(false);
    setEditorCanRedo(false);
    setActiveSectionIndex(0);
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!window.confirm(`آیا از حذف مقاله «${title}» اطمینان دارید؟`)) return;

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        alert('مقاله با موفقیت حذف گردید.');
        await loadArticles();
      } else {
        alert('خطا در حذف: ' + data.message);
      }
    } catch {
      alert('خطا در ارتباط با سرور');
    }
  };

  const handleCreateNewArticle = () => {
    const newArt: ArticleItem = {
      id: '',
      title: 'مقاله جدید کلینیک',
      slug: `article-${Date.now()}`,
      seoTitle: '',
      category: 'عمومی و پیشگیری',
      date: '۱۴۰۵',
      readTime: '۵ دقیقه',
      author: 'دکتر مهدی محمدنژاد',
      summary: '',
      tldr: '',
      keywords: ['دندانپزشکی', 'کلینیک قلی پور'],
      image: '',
      imageAlt: '',
      imageCaption: '',
      sections: [
        {
          id: 'intro',
          title: 'مقدمه و توضیحات اولیه',
          body: 'توضیحات این بخش را با نوار ابزار بالا بنویسید...',
          doctorComment: '',
        },
      ],
      faqs: [],
      citations: [],
      content: [],
    };
    setSelectedArticle(newArt);
    setKeywordsInput('دندانپزشکی، کلینیک قلی پور');
    setIsNewArticle(true);
    setActiveTab('edit-article');
    setSaveMessage('');
    setUndoStack([]);
    setRedoStack([]);
    setEditorCanUndo(false);
    setEditorCanRedo(false);
    setActiveSectionIndex(0);
  };

  const handleSaveArticle = async () => {
    if (!selectedArticle) return;
    setIsSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: selectedArticle, isNew: isNewArticle }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage('با موفقیت ذخیره شد!');
        setSelectedArticle(data.article);
        setIsNewArticle(false);
        triggerSaveToast();
        await loadArticles();
      } else {
        setSaveMessage('❌ خطا: ' + data.message);
      }
    } catch (err) {
      setSaveMessage('❌ خطا در ارسال داده‌ها به سرور');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedArticle) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingImage(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSelectedArticle({
          ...selectedArticle,
          image: data.url,
        });
      } else {
        alert('خطا در آپلود: ' + data.message);
      }
    } catch {
      alert('خطا در برقراری ارتباط با سرور آپلود');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Section handling
  const handleAddSection = () => {
    if (!selectedArticle) return;
    const newSec: ArticleSection = {
      id: `sec-${Date.now()}`,
      title: 'بخش جدید',
      body: '',
      doctorComment: '',
    };
    updateArticleWithHistory({
      ...selectedArticle,
      sections: [...selectedArticle.sections, newSec],
    });
    setActiveSectionIndex(selectedArticle.sections.length);
  };

  const handleRemoveSection = (idx: number) => {
    if (!selectedArticle) return;
    const updated = selectedArticle.sections.filter((_, i) => i !== idx);
    updateArticleWithHistory({ ...selectedArticle, sections: updated });
    if (activeSectionIndex >= updated.length) {
      setActiveSectionIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleUpdateSection = (idx: number, field: keyof ArticleSection, val: string) => {
    if (!selectedArticle) return;

    // For non-body fields (title, doctor comment, anchor id), preserve article history snapshots
    if (field !== 'body') {
      if (!typingTimeoutRef.current) {
        pushUndoSnapshot(selectedArticle);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
      }, 800);
    }

    const updated = [...selectedArticle.sections];
    updated[idx] = { ...updated[idx], [field]: val };
    setSelectedArticle({ ...selectedArticle, sections: updated });
  };

  const handleMoveSection = (idx: number, dir: 'up' | 'down') => {
    if (!selectedArticle) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= selectedArticle.sections.length) return;
    const updated = [...selectedArticle.sections];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    updateArticleWithHistory({ ...selectedArticle, sections: updated });
    setActiveSectionIndex(newIdx);
  };

  // Top Ribbon Formatting Helpers
  const triggerRibbonAction = (action: (ref: RichTextEditorRef) => void) => {
    const targetRef = editorRefs.current[activeSectionIndex];
    if (targetRef) {
      action(targetRef);
      setEditorCanUndo(targetRef.canUndo());
      setEditorCanRedo(targetRef.canRedo());
    } else {
      // If no active section ref, fallback to first available
      const firstRef = Object.values(editorRefs.current).find(Boolean);
      if (firstRef) {
        action(firstRef);
        setEditorCanUndo(firstRef.canUndo());
        setEditorCanRedo(firstRef.canRedo());
      }
    }
  };

  const handleEditorHistoryChange = useCallback(
    (sIdx: number, canU: boolean, canR: boolean) => {
      if (sIdx === activeSectionIndex) {
        setEditorCanUndo(canU);
        setEditorCanRedo(canR);
      }
    },
    [activeSectionIndex]
  );

  const scrollToPreviewElement = useCallback(
    (targetId: string) => {
      if (editorViewMode === 'editor') {
        setEditorViewMode('split');
      }

      setTimeout(
        () => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('preview-section-highlight');
            setTimeout(() => {
              el.classList.remove('preview-section-highlight');
            }, 2200);
          }
        },
        editorViewMode === 'editor' ? 140 : 20
      );
    },
    [editorViewMode]
  );

  // FAQ handling
  const handleAddFaq = () => {
    if (!selectedArticle) return;
    const newFaq: ArticleFAQ = { question: '', answer: '' };
    setSelectedArticle({
      ...selectedArticle,
      faqs: [...(selectedArticle.faqs || []), newFaq],
    });
  };

  const handleRemoveFaq = (idx: number) => {
    if (!selectedArticle) return;
    const updated = (selectedArticle.faqs || []).filter((_, i) => i !== idx);
    setSelectedArticle({ ...selectedArticle, faqs: updated });
  };

  const handleUpdateFaq = (idx: number, field: keyof ArticleFAQ, val: string) => {
    if (!selectedArticle) return;
    const updated = [...(selectedArticle.faqs || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setSelectedArticle({ ...selectedArticle, faqs: updated });
  };

  // Citation handling
  const handleAddCitation = () => {
    if (!selectedArticle) return;
    const newCitation: ArticleCitation = {
      title: '',
      source: '',
      url: '',
      doi: '',
    };
    setSelectedArticle({
      ...selectedArticle,
      citations: [...(selectedArticle.citations || []), newCitation],
    });
  };

  const handleRemoveCitation = (idx: number) => {
    if (!selectedArticle) return;
    const updated = (selectedArticle.citations || []).filter((_, i) => i !== idx);
    setSelectedArticle({ ...selectedArticle, citations: updated });
  };

  const handleUpdateCitation = (idx: number, field: keyof ArticleCitation, val: string) => {
    if (!selectedArticle) return;
    const updated = [...(selectedArticle.citations || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setSelectedArticle({ ...selectedArticle, citations: updated });
  };

  // Helper to parse Persian date strings like "۸ مهر ۱۴۰۵" into comparable timestamps
  const parsePersianDate = (dateStr?: string): number => {
    if (!dateStr) return 0;
    const persianMonths: Record<string, number> = {
      فروردین: 1,
      اردیبهشت: 2,
      خرداد: 3,
      تیر: 4,
      مرداد: 5,
      شهریور: 6,
      مهر: 7,
      آبان: 8,
      آذر: 9,
      دی: 10,
      بهمن: 11,
      اسفند: 12,
    };
    const normalizeDigits = (str: string) =>
      str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());

    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 3) {
      const day = parseInt(normalizeDigits(parts[0]), 10) || 1;
      const month = persianMonths[parts[1]] || 1;
      const year = parseInt(normalizeDigits(parts[2]), 10) || 1400;
      return year * 10000 + month * 100 + day;
    }

    // Support YYYY/MM/DD or YYYY-MM-DD
    const slashParts = dateStr.trim().split(/[/\\-]/);
    if (slashParts.length === 3) {
      const p0 = parseInt(normalizeDigits(slashParts[0]), 10) || 0;
      const p1 = parseInt(normalizeDigits(slashParts[1]), 10) || 1;
      const p2 = parseInt(normalizeDigits(slashParts[2]), 10) || 1;
      if (p0 > 1000) {
        // year/month/day
        return p0 * 10000 + p1 * 100 + p2;
      }
      // day/month/year
      return p2 * 10000 + p1 * 100 + p0;
    }

    return 0;
  };

  const handleToggleDateSort = () => {
    setDateSortOrder(prev => {
      if (prev === 'desc') return 'asc';
      return 'desc';
    });
  };

  const handleToggleGalleryDateSort = () => {
    setGalleryDateSortOrder(prev => {
      if (prev === 'desc') return 'asc';
      return 'desc';
    });
  };

  // Filter and sort articles for list view
  const filteredArticles = articles
    .filter(
      art =>
        (art.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (art.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (art.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!dateSortOrder) return 0;
      const dateA = parsePersianDate(a.date);
      const dateB = parsePersianDate(b.date);
      if (dateSortOrder === 'asc') {
        return dateA - dateB;
      }
      return dateB - dateA;
    });

  // Filter and sort gallery items
  const filteredGalleryItems = galleryItems
    .filter(item => {
      const isStages =
        item.type === 'stages' || (item.stages && item.stages.length > 0 && !item.beforeImg);
      const itemType = isStages ? 'stages' : 'before-after';

      if (galleryTypeFilter !== 'all' && itemType !== galleryTypeFilter) {
        return false;
      }

      const matchesSearch =
        (item.title || '').toLowerCase().includes(gallerySearchQuery.toLowerCase()) ||
        (item.categoryLabel || '').toLowerCase().includes(gallerySearchQuery.toLowerCase()) ||
        (item.subCategoryLabel || '').toLowerCase().includes(gallerySearchQuery.toLowerCase()) ||
        (item.tags || []).some(t => t.toLowerCase().includes(gallerySearchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (galleryCategoryFilter === 'all') return true;
      return isGalleryItemMatchingCategory(item, galleryCategoryFilter);
    })
    .sort((a, b) => {
      if (!galleryDateSortOrder) return 0;
      const dateA = parsePersianDate(a.date);
      const dateB = parsePersianDate(b.date);
      if (galleryDateSortOrder === 'asc') {
        return dateA - dateB;
      }
      return dateB - dateA;
    });

  // Toggle item type directly from list
  const handleToggleGalleryItemType = async (item: GalleryItem) => {
    const currentIsStages =
      item.type === 'stages' || (item.stages && item.stages.length > 0 && !item.beforeImg);
    const newType: 'before-after' | 'stages' = currentIsStages ? 'before-after' : 'stages';
    const updated: GalleryItem = { ...item, type: newType };

    if (newType === 'stages' && (!updated.stages || updated.stages.length === 0)) {
      updated.stages = [
        {
          stepNumber: 1,
          title: 'مرحله ۱: نمای اولیه قبل درمان',
          image: item.beforeImg || '',
          description: '',
        },
        {
          stepNumber: 2,
          title: 'مرحله ۲: پایان درمان و نتیجه نهایی',
          image: item.afterImg || '',
          description: '',
        },
      ];
    }

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: updated, isNew: false }),
      });
      const data = await res.json();
      if (data.success) {
        setGalleryItems(prev => prev.map(i => (i.id === item.id ? data.item : i)));
      } else {
        alert('خطا در تغییر نوع نمایش: ' + data.message);
      }
    } catch {
      alert('خطا در برقراری ارتباط با سرور.');
    }
  };

  // Gallery Handlers
  const handleEditGalleryItem = (item: GalleryItem) => {
    const cloned: GalleryItem = JSON.parse(JSON.stringify(item));
    // Determine type if missing
    if (!cloned.type) {
      cloned.type = 'before-after';
    }
    // Ensure default 2 stages if stages is empty
    if (!cloned.stages || cloned.stages.length === 0) {
      cloned.stages = [
        {
          stepNumber: 1,
          title: 'مرحله ۱: نمای اولیه قبل درمان',
          image: '',
          description: '',
        },
        {
          stepNumber: 2,
          title: 'مرحله ۲: پایان درمان و نتیجه نهایی',
          image: '',
          description: '',
        },
      ];
    }
    setSelectedGalleryItem(cloned);
    setGalleryTagsInput((cloned.tags || []).join('، '));
    setIsNewGalleryItem(false);
    setGalleryViewMode('edit');
    setGallerySaveMessage('');
    setActiveTab('edit-gallery');
  };

  const handleCreateNewGalleryItem = () => {
    const newItemType: 'before-after' | 'stages' =
      galleryTypeFilter === 'stages' ? 'stages' : 'before-after';
    const newItem: GalleryItem = {
      id: `gallery-${Date.now()}`,
      title: 'نمونه کار جدید',
      type: newItemType,
      category: 'composite',
      categoryLabel: 'لمینت و کامپوزیت',
      subCategoryLabel: 'طراحی لبخند',
      tags: ['لمینت و کامپوزیت', 'زیبایی'],
      beforeImg: '',
      afterImg: '',
      description: 'توضیحات مربوط به نحوه درمان و نتایج به‌دست‌آمده را اینجا بنویسید...',
      duration: '۱ الی ۲ جلسه',
      doctor: 'کلینیک دندانپزشکی قلی‌پور',
      sessions: '۱ جلسه',
      date: new Date().toLocaleDateString('fa-IR-u-nu-latn'),
      stages: [
        {
          stepNumber: 1,
          title: 'عکس یک',
          image: '',
          description: '',
        },
        {
          stepNumber: 2,
          title: 'عکس دو',
          image: '',
          description: '',
        },
      ],
    };
    setSelectedGalleryItem(newItem);
    setGalleryTagsInput('لمینت و کامپوزیت، زیبایی');
    setIsNewGalleryItem(true);
    setGalleryViewMode('edit');
    setGallerySaveMessage('');
    setActiveTab('edit-gallery');
  };

  const handleSaveGalleryItem = async () => {
    if (!selectedGalleryItem) return;
    setIsSaving(true);
    setGallerySaveMessage('');

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: selectedGalleryItem, isNew: isNewGalleryItem }),
      });
      const data = await res.json();
      if (data.success) {
        setGallerySaveMessage('با موفقیت ذخیره شد!');
        setSelectedGalleryItem(data.item);
        setIsNewGalleryItem(false);
        triggerSaveToast();
        await loadGalleryItems();
      } else {
        setGallerySaveMessage('❌ خطا: ' + data.message);
      }
    } catch (err) {
      setGallerySaveMessage('❌ خطا در ارسال داده‌ها به سرور');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string, title: string) => {
    if (!window.confirm(`آیا از حذف نمونه کار «${title}» اطمینان دارید؟`)) return;

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        alert('نمونه کار با موفقیت حذف شد.');
        await loadGalleryItems();
      } else {
        alert('خطا در حذف: ' + data.message);
      }
    } catch {
      alert('خطا در برقراری ارتباط با سرور.');
    }
  };

  // Upload image for gallery (before, after, or stage-X)
  const handleUploadGalleryImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'before' | 'after' | number
  ) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedGalleryItem) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const uploadTargetKey = typeof target === 'number' ? `stage-${target}` : target;
    setIsUploadingGalleryImg(uploadTargetKey);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        if (target === 'before') {
          setSelectedGalleryItem({ ...selectedGalleryItem, beforeImg: data.url });
        } else if (target === 'after') {
          setSelectedGalleryItem({ ...selectedGalleryItem, afterImg: data.url });
        } else if (typeof target === 'number') {
          const updatedStages = [...(selectedGalleryItem.stages || [])];
          if (updatedStages[target]) {
            updatedStages[target] = { ...updatedStages[target], image: data.url };
            setSelectedGalleryItem({ ...selectedGalleryItem, stages: updatedStages });
          }
        }
      } else {
        alert('خطا در آپلود: ' + data.message);
      }
    } catch {
      alert('خطا در بارگذاری تصویر');
    } finally {
      setIsUploadingGalleryImg(null);
    }
  };

  // Stage Manipulation
  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (!selectedGalleryItem || !selectedGalleryItem.stages) return;
    const stages = [...selectedGalleryItem.stages];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stages.length) return;

    const temp = stages[index];
    stages[index] = stages[targetIdx];
    stages[targetIdx] = temp;

    // Recalculate step numbers
    stages.forEach((st, idx) => {
      st.stepNumber = idx + 1;
    });

    setSelectedGalleryItem({ ...selectedGalleryItem, stages });
  };

  const handleAddStage = () => {
    if (!selectedGalleryItem) return;
    const stages = [...(selectedGalleryItem.stages || [])];
    const persianWords = ['یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده'];
    const nextStep = stages.length + 1;
    const word = persianWords[nextStep - 1] || toPersianDigits(nextStep);
    const newStage: TreatmentStage = {
      stepNumber: nextStep,
      title: `عکس ${word}`,
      image: '',
      description: '',
    };
    stages.push(newStage);
    setSelectedGalleryItem({ ...selectedGalleryItem, stages });
  };

  const handleRemoveStage = (index: number) => {
    if (!selectedGalleryItem || !selectedGalleryItem.stages) return;
    if (selectedGalleryItem.stages.length <= 2) {
      alert('برای جریان کار/مراحل درمان، حداقل ۲ مرحله الزامی است.');
      return;
    }
    const stages = selectedGalleryItem.stages.filter((_, idx) => idx !== index);
    stages.forEach((st, idx) => {
      st.stepNumber = idx + 1;
    });
    setSelectedGalleryItem({ ...selectedGalleryItem, stages });
  };

  const handleUpdateStage = (index: number, field: keyof TreatmentStage, value: any) => {
    if (!selectedGalleryItem || !selectedGalleryItem.stages) return;
    const stages = [...selectedGalleryItem.stages];
    if (stages[index]) {
      stages[index] = { ...stages[index], [field]: value };
      setSelectedGalleryItem({ ...selectedGalleryItem, stages });
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-wrapper admin-login-container">
        <div className="admin-bg-layer" aria-hidden="true" />
        <div className="admin-login-card">
          <div className="admin-login-lock-container">
            <LockKeyhole className="admin-login-lock-icon" size={38} strokeWidth={2.2} />
          </div>
          <h1 className="admin-login-title">ورود به پنل مدیریت کلینیک</h1>
          <p className="admin-login-subtitle">
            <span className="admin-login-subtitle-desktop">
              برای مدیریت و ویرایش مقالات، گالری، نوبتها و پیش نمایش گرافیکی، لطفا رمز عبور را وارد کنید
            </span>
            <span className="admin-login-subtitle-mobile">
              برای مدیریت و ویرایش مقالات، گالری و نوبتها، لطفا رمز عبور را وارد کنید.
            </span>
          </p>

          <form onSubmit={handleLogin}>
            <div className="admin-input-group">
              <label htmlFor="admin-pwd">رمز عبور مدیریت</label>
              <input
                id="admin-pwd"
                type="password"
                className="admin-input"
                placeholder="رمز عبور..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            {loginError && (
              <div style={{ color: '#e11d48', fontSize: '13.5px', marginBottom: '16px' }}>
                {loginError}
              </div>
            )}

            <button type="submit" className="admin-btn-primary">
              ورود به داشبورد
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const isSectionLanding = ['portal', 'articles', 'gallery', 'reservations'].includes(activeTab);

  return (
    <div className={`admin-wrapper ${!isSectionLanding ? 'admin-wrapper-plain' : ''}`}>
      {isSectionLanding && <div className="admin-bg-layer" aria-hidden="true" />}
      {/* Global Save Success Toast Popup */}
      {showSaveToast && (
        <div className="admin-save-toast-popup" role="alert" aria-live="assertive">
          <span className="admin-save-toast-emoji">✅</span>
          <span className="admin-save-toast-text desktop">با موفقیت ذخیره شد!</span>
          <span className="admin-save-toast-text mobile">ذخیره شد!</span>
          <button
            type="button"
            className="admin-save-toast-close"
            onClick={() => setShowSaveToast(false)}
            aria-label="بستن پیام"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navbar / Office Ribbon Toolbar */}
      {activeTab === 'edit-article' && selectedArticle ? (
        <header className="admin-ribbon-container">
          {/* Top Bar: Title, Slug, History (Undo/Redo), Save & Back */}
          <div className="admin-ribbon-topbar">
            <div className="admin-ribbon-title-box">
              <span style={{ fontSize: '20px' }}>📄</span>
              <div>
                <h2 className="admin-ribbon-title">
                  {selectedArticle.title || 'مقاله بدون عنوان'}
                </h2>
                {saveMessage && (
                  <div style={{ marginTop: '2px' }}>
                    <span className="admin-ribbon-save-status">{saveMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions: Undo, Redo, Save, Back */}
            <div className="admin-ribbon-actions">
              <div className="ribbon-group" style={{ direction: 'ltr' }}>
                <button
                  type="button"
                  className="ribbon-btn ribbon-history-btn"
                  onClick={handleUndo}
                  disabled={!editorCanUndo && undoStack.length === 0}
                  title="واگرد / بازگشت (Ctrl+Z)"
                  aria-label="Undo"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 14 4 9 9 4" />
                    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="ribbon-btn ribbon-history-btn"
                  onClick={handleRedo}
                  disabled={!editorCanRedo && redoStack.length === 0}
                  title="ازنو / پیش‌روی (Ctrl+Y)"
                  aria-label="Redo"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 14 20 9 15 4" />
                    <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                  </svg>
                </button>
              </div>

              <div className="ribbon-divider" />

              <button
                type="button"
                className="ribbon-btn"
                onClick={() => setActiveTab('articles')}
                title="بازگشت به لیست مقالات"
                aria-label="بازگشت به لیست مقالات"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className="ribbon-btn-text">بازگشت به لیست</span>
              </button>

              {/* Mobile Only: Single Toggle Button (Pen/Pencil Icon). On = Editing, Off = Preview */}
              <button
                type="button"
                className={`ribbon-btn mobile-mode-toggle-btn ${editorViewMode === 'preview' ? 'mobile-mode-preview' : 'mobile-mode-edit active'}`}
                onClick={() => {
                  setEditorViewMode(prev => (prev === 'preview' ? 'editor' : 'preview'));
                }}
                title={
                  editorViewMode === 'preview'
                    ? 'حالت فعلی: پیش‌نمایش | کلیک برای ورود به حالت ویرایش (مداد روشن)'
                    : 'حالت فعلی: ویرایش متون | کلیک برای مشاهده پیش‌نمایش نهایی (مداد خاموش)'
                }
                aria-label={
                  editorViewMode === 'preview' ? 'تغییر به حالت ویرایش' : 'تغییر به حالت پیش‌نمایش'
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </button>

              <button
                type="button"
                className="admin-btn-primary ribbon-save-btn"
                onClick={handleSaveArticle}
                disabled={isSaving}
                title="ذخیره تغییرات در سایت"
                aria-label="ذخیره مقاله"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span className="ribbon-btn-text">
                  {isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره در سایت'}
                </span>
              </button>
            </div>
          </div>

          {/* Lower Ribbon: Word/Office Formatting Tools & Mode Switcher */}
          <div className="admin-ribbon-commandbar">
            {/* Formatting Group */}
            <div className="ribbon-group">
              <button
                type="button"
                className="ribbon-btn"
                title="تیتر ۳ (H3)"
                onClick={() => triggerRibbonAction(r => r.insertText('### ', '', 'عنوان بخش'))}
                aria-label="تیتر ۳"
              >
                <strong style={{ fontSize: '13.5px', fontFamily: 'sans-serif' }}>H3</strong>
              </button>
              <button
                type="button"
                className="ribbon-btn"
                title="تیتر ۴ (H4)"
                onClick={() => triggerRibbonAction(r => r.insertText('#### ', '', 'عنوان فرعی'))}
                aria-label="تیتر ۴"
              >
                <strong style={{ fontSize: '13.5px', fontFamily: 'sans-serif' }}>H4</strong>
              </button>
              <button
                type="button"
                className="ribbon-btn"
                title="متن برجسته (Bold / Ctrl+B)"
                onClick={() => triggerRibbonAction(r => r.insertBold())}
                aria-label="بولد"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                  <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                </svg>
              </button>
            </div>

            <div className="ribbon-divider" />

            {/* Lists Group */}
            <div className="ribbon-group">
              <button
                type="button"
                className="ribbon-btn"
                title="لیست گلوله‌ای (Bullet list)"
                onClick={() => triggerRibbonAction(r => r.insertBulletList())}
                aria-label="لیست گلوله‌ای"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="9" y1="6" x2="20" y2="6" />
                  <line x1="9" y1="12" x2="20" y2="12" />
                  <line x1="9" y1="18" x2="20" y2="18" />
                  <circle cx="4" cy="6" r="2" fill="currentColor" />
                  <circle cx="4" cy="12" r="2" fill="currentColor" />
                  <circle cx="4" cy="18" r="2" fill="currentColor" />
                </svg>
                <span className="ribbon-btn-text">لیست گلوله‌ای</span>
              </button>
              <button
                type="button"
                className="ribbon-btn"
                title="لیست عددی ترتیبی (Numbered list)"
                onClick={() => triggerRibbonAction(r => r.insertNumberedList())}
                aria-label="لیست عددی"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="10" y1="6" x2="21" y2="6" />
                  <line x1="10" y1="12" x2="21" y2="12" />
                  <line x1="10" y1="18" x2="21" y2="18" />
                  <path d="M4 6h1v4" />
                  <path d="M4 10h2" />
                  <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                </svg>
                <span className="ribbon-btn-text">لیست عددی</span>
              </button>
            </div>

            <div className="ribbon-divider" />

            {/* Inserts Group: Table & Note/Callout */}
            <div className="ribbon-group">
              <button
                type="button"
                className="ribbon-btn"
                title="درج جدول مقایسه‌ای"
                onClick={() => triggerRibbonAction(r => r.insertTable())}
                aria-label="درج جدول"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                  <path d="M9 3v18" />
                  <path d="M15 3v18" />
                </svg>
                <span className="ribbon-btn-text">جدول</span>
              </button>
              <button
                type="button"
                className="ribbon-btn"
                title="درج کادر نکته بالینی"
                onClick={() => triggerRibbonAction(r => r.insertCallout())}
                aria-label="کادر نکته"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                </svg>
                <span className="ribbon-btn-text">کادر نکته</span>
              </button>
            </div>

            <div className="ribbon-divider desktop-only-divider" />

            {/* View Mode Toggle Pill (Desktop Only) */}
            <div className="admin-mode-pill desktop-only-view-pill">
              <button
                type="button"
                className={`admin-mode-btn ${editorViewMode === 'split' ? 'active' : ''}`}
                onClick={() => setEditorViewMode('split')}
                title="نمایش همزمان ویرایشگر و پیش‌نمایش گرافیکی"
                aria-label="نمای دوطرفه"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="7" height="16" rx="1.5" />
                  <rect x="14" y="4" width="7" height="16" rx="1.5" />
                  <line x1="10.5" y1="12" x2="13.5" y2="12" />
                </svg>
                <span>نمای دوطرفه</span>
              </button>
              <button
                type="button"
                className={`admin-mode-btn ${editorViewMode === 'editor' ? 'active' : ''}`}
                onClick={() => setEditorViewMode('editor')}
                title="تنها فرم ویرایش متون و جداول"
                aria-label="فرم ویرایش"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                <span>فرم ویرایش</span>
              </button>
              <button
                type="button"
                className={`admin-mode-btn ${editorViewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setEditorViewMode('preview')}
                title="تنها خروجی نهایی گرافیکی مقاله"
                aria-label="پیش‌نمایش"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>پیش‌نمایش</span>
              </button>
            </div>
          </div>
        </header>
      ) : activeTab === 'edit-gallery' && selectedGalleryItem ? (
        <header className="admin-ribbon-container">
          <div className="admin-ribbon-topbar">
            <div className="admin-ribbon-title-box">
              <span style={{ fontSize: '20px' }}>🖼️</span>
              <div>
                <h2 className="admin-ribbon-title">
                  {selectedGalleryItem.title || 'نمونه کار بدون عنوان'}
                </h2>
                {gallerySaveMessage && (
                  <div style={{ marginTop: '2px' }}>
                    <span className="admin-ribbon-save-status">{gallerySaveMessage}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-ribbon-actions">
              <button
                type="button"
                className="ribbon-btn"
                onClick={() => setActiveTab('gallery')}
                title="بازگشت به لیست نمونه‌کارها"
                aria-label="بازگشت به لیست نمونه‌کارها"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className="ribbon-btn-text">بازگشت به گالری</span>
              </button>

              <div className="admin-mode-pill" style={{ margin: '0 4px' }}>
                <button
                  type="button"
                  className={`admin-mode-btn ${galleryViewMode === 'edit' ? 'active' : ''}`}
                  onClick={() => setGalleryViewMode('edit')}
                  title="حالت ویرایش اطلاعات و تصاویر"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                  <span>حالت ویرایش</span>
                </button>
                <button
                  type="button"
                  className={`admin-mode-btn ${galleryViewMode === 'preview' ? 'active' : ''}`}
                  onClick={() => setGalleryViewMode('preview')}
                  title="پیش‌نمایش زنده در قالب سایت"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>پیش‌نمایش زنده</span>
                </button>
              </div>

              <button
                type="button"
                className="admin-btn-primary ribbon-save-btn"
                onClick={handleSaveGalleryItem}
                disabled={isSaving}
                title="ذخیره نمونه کار در سایت"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span className="ribbon-btn-text">
                  {isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره در سایت'}
                </span>
              </button>
            </div>
          </div>
        </header>
      ) : (
        <header className="admin-navbar">
          <div className="admin-nav-brand">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-nav-logo-link"
              title="مشاهده سایت کلینیک دندانپزشکی قلی‌پور"
            >
              <Image
                src="/assets/logo.webp"
                alt="کلینیک دندانپزشکی قلی‌پور"
                className="logo-img"
                width={130}
                height={42}
                priority
              />
            </a>
            <div className="admin-brand-divider" />
            <h2 style={{ fontSize: '16.5px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="admin-nav-title-desktop" style={{ color: '#016f92' }}>پنل مدیریت کلینیک</span>
              <span className="admin-nav-title-mobile" style={{ display: 'none' }}>
                پنل مدیریت
              </span>
            </h2>
          </div>
          <div className="admin-nav-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-site-link">
              مشاهده سایت
            </a>
            <button type="button" onClick={handleLogout} className="admin-logout-btn">
              خروج
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={`admin-main-container ${activeTab === 'edit-article' ? 'admin-main-container-edit' : ''}`}
      >
        {/* Navigation Tabs (Shown in list mode when inside articles) */}
        {activeTab === 'articles' && (
          <div
            className="admin-tabs"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="admin-tab-btn"
                onClick={() => setActiveTab('portal')}
                title="بازگشت به منوی اصلی بخش‌های مدیریت"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1.5px solid #d8eef5',
                  color: '#1c434f',
                  padding: '8px 16px',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>بازگشت به پیشخوان اصلی</span>
              </button>
              <button className="admin-tab-btn active" onClick={() => setActiveTab('articles')}>
                📚 مدیریت مقالات ({articles.length})
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Shown in list mode when inside gallery) */}
        {activeTab === 'gallery' && (
          <div
            className="admin-tabs"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="admin-tab-btn"
                onClick={() => setActiveTab('portal')}
                title="بازگشت به منوی اصلی بخش‌های مدیریت"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1.5px solid #d8eef5',
                  color: '#1c434f',
                  padding: '8px 16px',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>بازگشت به پیشخوان اصلی</span>
              </button>
              <button className="admin-tab-btn active" onClick={() => setActiveTab('gallery')}>
                🖼️ مدیریت گالری و نمونه‌کارها ({galleryItems.length})
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Shown in reservations mode) */}
        {activeTab === 'reservations' && (
          <div
            className="admin-tabs"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="admin-tab-btn"
                onClick={() => setActiveTab('portal')}
                title="بازگشت به منوی اصلی بخش‌های مدیریت"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  border: '1.5px solid #d8eef5',
                  color: '#1c434f',
                  padding: '8px 16px',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>بازگشت به پیشخوان اصلی</span>
              </button>
              <button className="admin-tab-btn active" onClick={() => setActiveTab('reservations')}>
                📋 مدیریت نوبت‌دهی و رزروها ({reservations.length})
              </button>
            </div>
          </div>
        )}

        {/* SECTION HUB: 3 Options Dashboard */}
        {activeTab === 'portal' && (
          <div className="admin-portal-container">
            <div className="admin-portal-hero">
              <h2 className="admin-portal-title">بخش مدیریت کلینیک دندانپزشکی</h2>
              <p className="admin-portal-subtitle">
                لطفاً یکی از بخش‌های زیر را جهت مدیریت محتوا، رسانه‌ها و خدمات انتخاب کنید.
              </p>
            </div>

            <div className="admin-portal-grid">
              {/* Option 1: Articles (Active) */}
              <div
                className="admin-portal-card interactive"
                onClick={() => setActiveTab('articles')}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab('articles');
                  }
                }}
              >
                <div className="admin-portal-card-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1c83aa"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <line x1="9" y1="7" x2="15" y2="7" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                  </svg>
                  <h3 className="admin-portal-card-title">مدیریت مقالات</h3>
                </div>

                <p className="admin-portal-card-desc">
                  مشاهده، ویرایش زنده با پیش‌نمایش گرافیکی، ایجاد مقالات علمی جدید و کنترل سئو و
                  مراجع علمی وب‌سایت کلینیک.
                </p>

                <div className="admin-portal-card-footer">
                  <span style={{ fontSize: '13px', color: '#5a7d8c', fontWeight: 600 }}>
                    {toPersianDigits(articles.length)} مقاله ثبت‌شده
                  </span>
                  <span className="admin-portal-card-btn">
                    <span>ورود به بخش</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Option 2: Gallery (Active) */}
              <div
                className="admin-portal-card interactive"
                onClick={() => setActiveTab('gallery')}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab('gallery');
                  }
                }}
              >
                <div className="admin-portal-card-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1c83aa"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <h3 className="admin-portal-card-title">مدیریت گالری تصاویر</h3>
                </div>

                <p className="admin-portal-card-desc">
                  افزودن و ویرایش تصاویر نمونه‌کارها، مقایسه‌های قبل و بعد از درمان (Before/After)،
                  مراحل کار و جریان درمان با بهینه‌سازی خودکار تصاویر.
                </p>

                <div className="admin-portal-card-footer">
                  <span style={{ fontSize: '13px', color: '#5a7d8c', fontWeight: 600 }}>
                    {toPersianDigits(galleryItems.length)} نمونه‌کار ثبت‌شده
                  </span>
                  <span className="admin-portal-card-btn">
                    <span>ورود به بخش</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Option 3: User Reservations (Active) */}
              <div
                className="admin-portal-card interactive"
                onClick={() => setActiveTab('reservations')}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab('reservations');
                  }
                }}
              >
                <div className="admin-portal-card-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1c83aa"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
                  </svg>
                  <h3 className="admin-portal-card-title">مدیریت نوبت‌دهی و رزروها</h3>
                </div>

                <p className="admin-portal-card-desc">
                  بررسی درخواست‌های نوبت‌دهی آنلاین بیماران، تعیین وضعیت رزروها، هماهنگی مشاوره‌ها و
                  ارتباط مستقیم با مراجعه‌کنندگان.
                </p>

                <div className="admin-portal-card-footer">
                  <span style={{ fontSize: '13px', color: '#5a7d8c', fontWeight: 600 }}>
                    {toPersianDigits(reservations.length)} درخواست ثبت‌شده
                    {reservations.filter(r => !r.isConfirmed).length > 0 && (
                      <span style={{ color: '#d97706', marginRight: '6px' }}>
                        ({toPersianDigits(reservations.filter(r => !r.isConfirmed).length)} جدید)
                      </span>
                    )}
                  </span>
                  <span className="admin-portal-card-btn">
                    <span>ورود به بخش</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: Articles List */}
        {activeTab === 'articles' && (
          <div className="admin-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>مقالات منتشر شده در سایت</h3>
                <p
                  className="admin-article-list-subtitle-desktop"
                  style={{ fontSize: '13px', color: '#5a7d8c', marginTop: '4px' }}
                >
                  مدیریت، ویرایش و انتشار مقالات تخصصی کلینیک دندانپزشکی قلی‌پور.
                </p>
                <p
                  className="admin-article-list-subtitle-mobile"
                  style={{ fontSize: '13px', color: '#5a7d8c', marginTop: '4px' }}
                >
                  مدیریت، ویرایش و انتشار مقالات تخصصی
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="admin-btn-primary admin-create-article-btn"
                  style={{ width: 'auto' }}
                  onClick={handleCreateNewArticle}
                >
                  + افزودن مقاله جدید
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                className="admin-input"
                placeholder="جستجو در مقالات..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ maxWidth: '400px' }}
              />
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-col-hide-mobile">شناسه</th>
                    <th>عنوان مقاله</th>
                    <th className="admin-col-hide-mobile">دسته‌بندی</th>
                    <th>
                      <button
                        type="button"
                        onClick={handleToggleDateSort}
                        className="admin-table-sort-btn"
                        title={
                          dateSortOrder === 'desc'
                            ? 'مرتب‌سازی تاریخ: جدیدترین به قدیمی‌ترین (کلیک برای صعودی)'
                            : dateSortOrder === 'asc'
                              ? 'مرتب‌سازی تاریخ: قدیمی‌ترین به جدیدترین (کلیک برای نزولی)'
                              : 'مرتب‌سازی بر اساس تاریخ (کلیک کنید)'
                        }
                      >
                        <span>تاریخ</span>
                        <span className="admin-sort-arrows" aria-hidden="true">
                          <svg
                            className={`admin-sort-arrow-up ${dateSortOrder === 'asc' ? 'active' : ''}`}
                            width="9"
                            height="9"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 4l-8 8h16z" />
                          </svg>
                          <svg
                            className={`admin-sort-arrow-down ${dateSortOrder === 'desc' ? 'active' : ''}`}
                            width="9"
                            height="9"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 20l8-8H4z" />
                          </svg>
                        </span>
                      </button>
                    </th>
                    <th className="admin-col-hide-mobile">بخش‌ها</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map(art => (
                    <tr key={art.id}>
                      <td className="admin-col-hide-mobile" style={{ fontWeight: 700 }}>
                        {art.id}
                      </td>
                      <td style={{ fontWeight: 600, maxWidth: '320px' }}>
                        {/* Desktop View: Title text + URL link underneath */}
                        <div className="admin-article-title-desktop">
                          <div>{art.title}</div>
                          <div>
                            <a
                              href={`/articles/${art.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-article-slug-link"
                              title={`مشاهده مقاله «${art.title}» در تب جدید`}
                            >
                              articles/{art.slug}/
                            </a>
                          </div>
                        </div>

                        {/* Mobile View: SEO Article Name directly clickable, opening article in new tab without URL */}
                        <div className="admin-article-title-mobile">
                          <a
                            href={`/articles/${art.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-article-title-link-mobile"
                            title={`مشاهده مقاله «${art.title}» در تب جدید`}
                          >
                            {art.title}
                          </a>
                        </div>
                      </td>
                      <td className="admin-col-hide-mobile">
                        <span className="admin-badge">{art.category}</span>
                      </td>
                      <td style={{ color: '#5a7d8c', whiteSpace: 'nowrap' }}>{art.date}</td>
                      <td className="admin-col-hide-mobile" style={{ direction: 'rtl' }}>
                        {toPersianDigits(art.sections?.length || 0)} بخش
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                          }}
                        >
                          {/* Desktop action buttons */}
                          <button
                            type="button"
                            className="toolbar-btn admin-action-btn-desktop"
                            onClick={() => handleEditArticle(art)}
                            style={{ color: '#1c83aa', borderColor: '#1c83aa' }}
                            title="ویرایش مقاله"
                          >
                            ✏️ ویرایش
                          </button>
                          <a
                            href={`/articles/${art.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="toolbar-btn admin-view-btn-desktop"
                            style={{ textDecoration: 'none' }}
                          >
                            مشاهده
                          </a>
                          <button
                            type="button"
                            className="toolbar-btn admin-action-btn-desktop"
                            onClick={() => handleDeleteArticle(art.id, art.title)}
                            style={{
                              color: '#e11d48',
                              borderColor: '#fecdd3',
                              background: '#fff1f2',
                            }}
                            title="حذف مقاله"
                          >
                            🗑️
                          </button>

                          {/* Mobile action buttons: clean pencil and trash icons without box, outline, or subtitle */}
                          <div className="admin-actions-mobile">
                            <button
                              type="button"
                              className="admin-mobile-icon-btn admin-mobile-edit-btn"
                              onClick={() => handleEditArticle(art)}
                              title="ویرایش مقاله"
                              aria-label="ویرایش مقاله"
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="admin-mobile-icon-btn admin-mobile-delete-btn"
                              onClick={() => handleDeleteArticle(art.id, art.title)}
                              title="حذف مقاله"
                              aria-label="حذف مقاله"
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredArticles.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ textAlign: 'center', padding: '32px', color: '#5a7d8c' }}
                      >
                        مقاله‌ای مطابق با جستجوی شما یافت نشد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Edit Selected Article */}
        {activeTab === 'edit-article' && selectedArticle && (
          <div>
            {/* Layout based on View Mode */}
            <div
              className={`admin-editor-layout ${
                editorViewMode === 'split'
                  ? 'admin-editor-layout-split is-split-mode'
                  : editorViewMode === 'editor'
                    ? 'is-editor-mode'
                    : 'is-preview-mode'
              }`}
            >
              {/* Left/Right Column: Form Editor */}
              {(editorViewMode === 'split' || editorViewMode === 'editor') && (
                <div className="admin-editor-form-col">
                  {/* General Info Card */}
                  <div className="admin-card">
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                      ۱. هویت و مشخصات مقاله
                    </h4>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '14px',
                      }}
                    >
                      <div className="admin-input-group">
                        <div className="admin-field-header">
                          <label>عنوان اصلی مقاله</label>
                          <PreviewLocateBtn
                            targetId="preview-article-title"
                            onLocate={scrollToPreviewElement}
                          />
                        </div>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedArticle.title}
                          onChange={e =>
                            setSelectedArticle(prev =>
                              prev ? { ...prev, title: e.target.value } : null
                            )
                          }
                        />
                      </div>
                      <div className="admin-input-group">
                        <label>عنوان سئو و تب مرورگر (کوتاه)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedArticle.seoTitle || ''}
                          placeholder="مثال: مراقبت‌های بعد از ایمپلنت دندان"
                          onChange={e =>
                            setSelectedArticle(prev =>
                              prev ? { ...prev, seoTitle: e.target.value } : null
                            )
                          }
                        />
                      </div>
                      <div className="admin-input-group">
                        <div className="admin-field-header">
                          <label>دسته‌بندی کلینیک</label>
                          <PreviewLocateBtn
                            targetId="preview-article-category"
                            onLocate={scrollToPreviewElement}
                          />
                        </div>
                        <input
                          type="text"
                          className="admin-input"
                          list="clinic-categories"
                          value={selectedArticle.category}
                          onChange={e =>
                            setSelectedArticle(prev =>
                              prev ? { ...prev, category: e.target.value } : null
                            )
                          }
                        />
                        <datalist id="clinic-categories">
                          <option value="ایمپلنت و جراحی" />
                          <option value="دندانپزشکی کودکان" />
                          <option value="ارتودنسی" />
                          <option value="زیبایی و طراحی لبخند" />
                          <option value="بهداشت و سلامت لثه" />
                          <option value="رژیم غذایی و سلامت دهان" />
                          <option value="سلامت عمومی و پیشگیری" />
                        </datalist>
                      </div>
                      <div className="admin-input-group">
                        <label>نامک آدرس (Slug انگلیسی)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedArticle.slug}
                          onChange={e =>
                            setSelectedArticle(prev =>
                              prev ? { ...prev, slug: e.target.value } : null
                            )
                          }
                        />
                      </div>
                      <div className="admin-input-group">
                        <label>نویسنده و بازبین علمی</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedArticle.author || ''}
                          onChange={e =>
                            setSelectedArticle(prev =>
                              prev ? { ...prev, author: e.target.value } : null
                            )
                          }
                        />
                      </div>
                      <div className="admin-input-group">
                        <label>تاریخ انتشار (شمسی)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedArticle.date || ''}
                          onChange={e =>
                            setSelectedArticle(prev =>
                              prev ? { ...prev, date: e.target.value } : null
                            )
                          }
                        />
                      </div>
                      <div className="admin-input-group">
                        <label>زمان تقریبی مطالعه</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedArticle.readTime || ''}
                          placeholder="مثال: ۷ دقیقه"
                          onChange={e =>
                            setSelectedArticle(prev =>
                              prev ? { ...prev, readTime: e.target.value } : null
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Summary Lead */}
                    <div className="admin-input-group" style={{ marginTop: '12px' }}>
                      <div className="admin-field-header">
                        <label>خلاصه مقدماتی و لید مقاله (Summary)</label>
                        <PreviewLocateBtn
                          targetId="preview-article-summary"
                          onLocate={scrollToPreviewElement}
                        />
                      </div>
                      <textarea
                        className="admin-input"
                        rows={2}
                        placeholder="چکیده کوتاه اولیه که در ابتدای مقاله و توضیحات متا نمایش داده می‌شود..."
                        value={selectedArticle.summary || ''}
                        onChange={e =>
                          setSelectedArticle(prev =>
                            prev ? { ...prev, summary: e.target.value } : null
                          )
                        }
                      />
                    </div>

                    {/* TL;DR */}
                    <div className="admin-input-group" style={{ marginTop: '12px' }}>
                      <div className="admin-field-header">
                        <label>چکیده و نکات کلیدی اجرایی (TL;DR کادر طلایی)</label>
                        <PreviewLocateBtn
                          targetId="preview-article-tldr"
                          onLocate={scrollToPreviewElement}
                        />
                      </div>
                      <textarea
                        className="admin-input"
                        rows={2}
                        value={selectedArticle.tldr || ''}
                        onChange={e =>
                          setSelectedArticle(prev =>
                            prev ? { ...prev, tldr: e.target.value } : null
                          )
                        }
                      />
                    </div>

                    {/* Keywords */}
                    <div className="admin-input-group" style={{ marginTop: '12px' }}>
                      <label>کلمات کلیدی سئو (با کاما یا ویرگول جدا کنید)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="مثال: ایمپلنت دندان، دندانپزشکی، مراقبت ها"
                        value={keywordsInput}
                        onChange={e => {
                          const val = e.target.value;
                          setKeywordsInput(val);
                          const kwList = val
                            .split(/[،,]/)
                            .map(k => k.trim())
                            .filter(Boolean);
                          setSelectedArticle({ ...selectedArticle, keywords: kwList });
                        }}
                      />
                    </div>
                  </div>

                  {/* Featured Image Card */}
                  <div className="admin-card">
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                      ۲. تصویر شاخص مقاله (Hero Banner)
                    </h4>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '14px',
                      }}
                    >
                      <div className="admin-input-group">
                        <div className="admin-field-header">
                          <label>آدرس تصویر (URL یا مسیر محلی)</label>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                          <input
                            type="text"
                            className="admin-input"
                            value={selectedArticle.image || ''}
                            onChange={e =>
                              setSelectedArticle({ ...selectedArticle, image: e.target.value })
                            }
                          />
                          <button
                            type="button"
                            className="admin-file-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            title="آپلود تصویر شاخص"
                            aria-label="آپلود تصویر"
                          >
                            {isUploadingImage ? (
                              <span style={{ fontSize: '13px' }}>...</span>
                            ) : (
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                              </svg>
                            )}
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                          />
                        </div>
                      </div>
                      <div className="admin-input-group">
                        <div className="admin-field-header">
                          <label>متن جایگزین تصویر (Alt Text برای سئو)</label>
                        </div>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedArticle.imageAlt || ''}
                          onChange={e =>
                            setSelectedArticle({ ...selectedArticle, imageAlt: e.target.value })
                          }
                        />
                      </div>
                      <div className="admin-input-group">
                        <div className="admin-field-header">
                          <label>زیرنویس و توضیح تصویر (Caption)</label>
                          <PreviewLocateBtn
                            targetId="preview-image-caption"
                            onLocate={scrollToPreviewElement}
                          />
                        </div>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedArticle.imageCaption || ''}
                          onChange={e =>
                            setSelectedArticle({ ...selectedArticle, imageCaption: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sections Card */}
                  <div className="admin-card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700 }}>
                          ۳. بخش‌های بدنه مقاله ({toPersianDigits(selectedArticle.sections.length)}{' '}
                          بخش)
                        </h4>
                        <p style={{ fontSize: '13px', color: '#5a7d8c', marginTop: '2px' }}>
                          امکان درج جداول مقایسه‌ای، لیست‌های عددی و گلوله‌ای و نکات بالینی.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="card-add-icon-btn"
                        onClick={handleAddSection}
                        title="افزودن بخش جدید"
                        aria-label="افزودن بخش جدید"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M9 3a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 3v4.5h4.5A1.5 1.5 0 0 1 21 9v3a1.5 1.5 0 0 1-1.5 1.5H15V18a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 18v-4.5H4.5A1.5 1.5 0 0 1 3 12V9a1.5 1.5 0 0 1 1.5-1.5H9V3z" />
                        </svg>
                      </button>
                    </div>

                    {selectedArticle.sections.map((sec, sIdx) => (
                      <div key={sec.id || sIdx} className="admin-item-block">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: '#e3f9ff',
                                color: '#1c83aa',
                                fontWeight: 800,
                                fontSize: '13px',
                              }}
                            >
                              {sIdx + 1}
                            </span>
                            {editorViewMode !== 'split' && (
                              <span style={{ fontWeight: 700, fontSize: '14px', color: '#1c434f' }}>
                                {sec.title || 'بدون عنوان'}
                              </span>
                            )}
                          </div>
                          <div className="item-actions-group">
                            <button
                              type="button"
                              className="item-action-btn"
                              disabled={sIdx === 0}
                              onClick={() => handleMoveSection(sIdx, 'up')}
                              title="انتقال بخش به بالا"
                              aria-label="انتقال بخش به بالا"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="18 15 12 9 6 15" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="item-action-btn"
                              disabled={sIdx === selectedArticle.sections.length - 1}
                              onClick={() => handleMoveSection(sIdx, 'down')}
                              title="انتقال بخش به پایین"
                              aria-label="انتقال بخش به پایین"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="item-action-btn item-action-delete"
                              onClick={() => handleRemoveSection(sIdx)}
                              title="حذف این بخش"
                              aria-label="حذف این بخش"
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Title and Anchor ID: Stacked into separate rows in split mode or mobile to prevent narrow squeezed inputs */}
                        <div
                          className="admin-section-meta-row"
                          style={{
                            display: editorViewMode === 'split' ? 'flex' : 'grid',
                            flexDirection: editorViewMode === 'split' ? 'column' : undefined,
                            gridTemplateColumns: editorViewMode === 'split' ? undefined : '2fr 1fr',
                            gap: '12px',
                            marginBottom: '12px',
                          }}
                        >
                          <div className="admin-input-group" style={{ marginBottom: 0 }}>
                            <div className="admin-field-header">
                              <label>عنوان بخش</label>
                              <PreviewLocateBtn
                                targetId={`preview-sec-title-${sIdx}`}
                                onLocate={scrollToPreviewElement}
                              />
                            </div>
                            <input
                              type="text"
                              className="admin-input"
                              value={sec.title}
                              onChange={e => handleUpdateSection(sIdx, 'title', e.target.value)}
                            />
                          </div>
                          <div className="admin-input-group" style={{ marginBottom: 0 }}>
                            <label>
                              <span className="admin-anchor-label-desktop">
                                شناسه لنگر (Anchor ID برای فهرست)
                              </span>
                              <span
                                className="admin-anchor-label-mobile"
                                style={{ display: 'none' }}
                              >
                                شناسه فهرست
                              </span>
                            </label>
                            <input
                              type="text"
                              className="admin-input"
                              value={sec.id}
                              onChange={e => handleUpdateSection(sIdx, 'id', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="admin-input-group">
                          <div className="admin-field-header">
                            <label>متن بدنه، جداول و لیست‌ها</label>
                            <PreviewLocateBtn
                              targetId={`preview-sec-body-${sIdx}`}
                              onLocate={scrollToPreviewElement}
                            />
                          </div>
                          <RichTextEditor
                            ref={r => {
                              editorRefs.current[sIdx] = r;
                            }}
                            value={sec.body}
                            onChange={val => handleUpdateSection(sIdx, 'body', val)}
                            onFocus={() => {
                              setActiveSectionIndex(sIdx);
                              const ed = editorRefs.current[sIdx];
                              if (ed) {
                                setEditorCanUndo(ed.canUndo());
                                setEditorCanRedo(ed.canRedo());
                              }
                            }}
                            onHistoryChange={(canU, canR) =>
                              handleEditorHistoryChange(sIdx, canU, canR)
                            }
                          />
                        </div>

                        <div className="admin-input-group">
                          <div className="admin-field-header">
                            <label>نکته بالینی پزشک (کادر کتیبه‌ای توصیه دکتر)</label>
                            <PreviewLocateBtn
                              targetId={`preview-sec-comment-${sIdx}`}
                              onLocate={scrollToPreviewElement}
                            />
                          </div>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="توصیه کلینیکی پزشک با قلم دکتر مهدی محمدنژاد..."
                            value={sec.doctorComment || ''}
                            onChange={e =>
                              handleUpdateSection(sIdx, 'doctorComment', e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FAQs Card */}
                  <div className="admin-card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <h4 style={{ fontSize: '16px', fontWeight: 700 }}>
                        ۴. پرسش و پاسخ متداول بیماران ({selectedArticle.faqs?.length || 0})
                      </h4>
                      <button
                        type="button"
                        className="card-add-icon-btn"
                        onClick={handleAddFaq}
                        title="افزودن پرسش و پاسخ جدید"
                        aria-label="افزودن پرسش و پاسخ"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M9 3a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 3v4.5h4.5A1.5 1.5 0 0 1 21 9v3a1.5 1.5 0 0 1-1.5 1.5H15V18a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 18v-4.5H4.5A1.5 1.5 0 0 1 3 12V9a1.5 1.5 0 0 1 1.5-1.5H9V3z" />
                        </svg>
                      </button>
                    </div>

                    {(selectedArticle.faqs || []).map((faq, fIdx) => (
                      <div key={fIdx} className="admin-item-block">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: '13.5px' }}>
                            پرسش {fIdx + 1}
                          </span>
                          <button
                            type="button"
                            className="item-action-btn item-action-delete"
                            onClick={() => handleRemoveFaq(fIdx)}
                            title="حذف این پرسش"
                            aria-label="حذف پرسش"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                        <div className="admin-input-group">
                          <div className="admin-field-header">
                            <label style={{ fontSize: '12px' }}>پرسش بیمار</label>
                            <PreviewLocateBtn
                              targetId={`preview-faq-${fIdx}`}
                              onLocate={scrollToPreviewElement}
                            />
                          </div>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="سوال بیمار..."
                            value={faq.question}
                            onChange={e => handleUpdateFaq(fIdx, 'question', e.target.value)}
                          />
                        </div>
                        <div className="admin-input-group" style={{ marginBottom: 0 }}>
                          <textarea
                            className="admin-input"
                            rows={2}
                            placeholder="پاسخ دکتر..."
                            value={faq.answer}
                            onChange={e => handleUpdateFaq(fIdx, 'answer', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Citations Card */}
                  <div className="admin-card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <h4 style={{ fontSize: '16px', fontWeight: 700 }}>
                        ۵. منابع و ارجاعات مقالات علمی ({selectedArticle.citations?.length || 0})
                      </h4>
                      <button
                        type="button"
                        className="card-add-icon-btn"
                        onClick={handleAddCitation}
                        title="افزودن رفرنس علمی جدید"
                        aria-label="افزودن رفرنس علمی"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M9 3a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 3v4.5h4.5A1.5 1.5 0 0 1 21 9v3a1.5 1.5 0 0 1-1.5 1.5H15V18a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 18v-4.5H4.5A1.5 1.5 0 0 1 3 12V9a1.5 1.5 0 0 1 1.5-1.5H9V3z" />
                        </svg>
                      </button>
                    </div>

                    {(selectedArticle.citations || []).map((cite, cIdx) => (
                      <div key={cIdx} className="admin-item-block">
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: '13.5px' }}>
                            منبع علمی {cIdx + 1}
                          </span>
                          <button
                            type="button"
                            className="item-action-btn item-action-delete"
                            onClick={() => handleRemoveCitation(cIdx)}
                            title="حذف این منبع"
                            aria-label="حذف منبع"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '10px',
                          }}
                        >
                          <div className="admin-input-group" style={{ marginBottom: 0 }}>
                            <div className="admin-field-header">
                              <label style={{ fontSize: '12px' }}>عنوان مقاله یا دستورالعمل</label>
                              <PreviewLocateBtn
                                targetId={`preview-cite-${cIdx}`}
                                onLocate={scrollToPreviewElement}
                              />
                            </div>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="عنوان..."
                              value={cite.title}
                              onChange={e => handleUpdateCitation(cIdx, 'title', e.target.value)}
                            />
                          </div>
                          <div className="admin-input-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '12px' }}>مرجع / ژورنال (مانند JADA)</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="منبع..."
                              value={cite.source}
                              onChange={e => handleUpdateCitation(cIdx, 'source', e.target.value)}
                            />
                          </div>
                          <div className="admin-input-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '12px' }}>لینک منبع (URL)</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="https://..."
                              value={cite.url || ''}
                              onChange={e => handleUpdateCitation(cIdx, 'url', e.target.value)}
                            />
                          </div>
                          <div className="admin-input-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '12px' }}>شناسه دیجیتال (DOI)</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="10.1016/..."
                              value={cite.doi || ''}
                              onChange={e => handleUpdateCitation(cIdx, 'doi', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview Side Panel */}
              {(editorViewMode === 'split' || editorViewMode === 'preview') && (
                <div
                  className={editorViewMode === 'split' ? 'admin-preview-sticky-container' : ''}
                  style={
                    editorViewMode === 'preview' ? { maxWidth: '900px', margin: '0 auto' } : {}
                  }
                >
                  <ArticlePreview article={selectedArticle} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Gallery Items List */}
        {activeTab === 'gallery' && (
          <div className="admin-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>نمونه‌کارهای درمانی کلینیک</h3>
                <p style={{ fontSize: '13px', color: '#5a7d8c', marginTop: '4px' }}>
                  مدیریت تصاویر، مقایسه قبل و بعد و مراحل کار (جریان درمان) ثبت‌شده در گالری.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="admin-btn-primary admin-create-article-btn"
                  style={{ width: 'auto' }}
                  onClick={handleCreateNewGalleryItem}
                >
                  + افزودن نمونه‌کار جدید
                </button>
              </div>
            </div>

            {/* Gallery Filters: Search, Category & Type Filter */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '20px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', flex: '1 1 360px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="جستجو در عنوان یا دسته‌بندی نمونه‌کار..."
                    value={gallerySearchQuery}
                    onChange={e => setGallerySearchQuery(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>

                <div style={{ width: '180px' }}>
                  <select
                    className="admin-input"
                    value={galleryCategoryFilter}
                    onChange={e => setGalleryCategoryFilter(e.target.value)}
                    style={{ margin: 0 }}
                  >
                    {GALLERY_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Type Filter Pills */}
              <div className="admin-mode-pill" style={{ margin: 0 }}>
                <button
                  type="button"
                  className={`admin-mode-btn ${galleryTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setGalleryTypeFilter('all')}
                  style={{ fontSize: '12.5px', padding: '6px 12px' }}
                >
                  همه ({galleryItems.length})
                </button>
                <button
                  type="button"
                  className={`admin-mode-btn ${galleryTypeFilter === 'before-after' ? 'active' : ''}`}
                  onClick={() => setGalleryTypeFilter('before-after')}
                  style={{ fontSize: '12.5px', padding: '6px 12px' }}
                >
                  قبل و بعد ({galleryItems.filter(i => i.type !== 'stages').length})
                </button>
                <button
                  type="button"
                  className={`admin-mode-btn ${galleryTypeFilter === 'stages' ? 'active' : ''}`}
                  onClick={() => setGalleryTypeFilter('stages')}
                  style={{ fontSize: '12.5px', padding: '6px 12px' }}
                >
                  مراحل کار ({galleryItems.filter(i => i.type === 'stages').length})
                </button>
              </div>
            </div>

            {/* Gallery Items Table */}
            <div className="admin-table-container">
              <table className="admin-table admin-gallery-table">
                <thead>
                  <tr>
                    <th className="admin-gallery-col-img">تصویر</th>
                    <th className="admin-gallery-col-title">عنوان نمونه‌کار</th>
                    <th className="admin-gallery-col-cat">دسته‌بندی</th>
                    <th className="admin-gallery-col-date">
                      <button
                        type="button"
                        onClick={handleToggleGalleryDateSort}
                        className="admin-table-sort-btn"
                        style={{ margin: '0 auto', display: 'flex' }}
                        title={
                          galleryDateSortOrder === 'desc'
                            ? 'مرتب‌سازی تاریخ: جدیدترین به قدیمی‌ترین (کلیک برای صعودی)'
                            : galleryDateSortOrder === 'asc'
                              ? 'مرتب‌سازی تاریخ: قدیمی‌ترین به جدیدترین (کلیک برای نزولی)'
                              : 'مرتب‌سازی بر اساس تاریخ (کلیک کنید)'
                        }
                      >
                        <span>تاریخ</span>
                        <span className="admin-sort-arrows" aria-hidden="true">
                          <svg
                            className={`admin-sort-arrow-up ${galleryDateSortOrder === 'asc' ? 'active' : ''}`}
                            width="9"
                            height="9"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 4l-8 8h16z" />
                          </svg>
                          <svg
                            className={`admin-sort-arrow-down ${galleryDateSortOrder === 'desc' ? 'active' : ''}`}
                            width="9"
                            height="9"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 20l8-8H4z" />
                          </svg>
                        </span>
                      </button>
                    </th>
                    <th className="admin-gallery-col-actions">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGalleryItems.map(item => {
                    const isStages = item.type === 'stages';
                    const coverThumbnail = isStages
                      ? item.stages?.[0]?.image || '/assets/gallery/stage-1.webp'
                      : item.afterImg || item.beforeImg || '/assets/gallery/stage-1.webp';

                    return (
                      <tr key={item.id}>
                        <td className="admin-gallery-col-img">
                          <div
                            style={{
                              width: '54px',
                              height: '42px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              position: 'relative',
                              border: '1px solid #d8eef5',
                              background: '#e3f9ff',
                              margin: '0 auto',
                            }}
                          >
                            <img
                              src={coverThumbnail}
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        </td>
                        <td className="admin-gallery-col-title">
                          <strong
                            style={{
                              fontSize: '14px',
                              color: '#1c434f',
                              display: 'block',
                              marginBottom: '3px',
                            }}
                          >
                            {item.title}
                          </strong>
                          <span style={{ fontSize: '12px', color: '#8faab6' }}>
                            شناسه: {item.id}
                          </span>
                        </td>
                        <td className="admin-gallery-col-cat">
                          <span className="admin-badge" style={{ fontSize: '12px' }}>
                            {item.categoryLabel}
                          </span>
                          {item.subCategoryLabel && (
                            <span
                              style={{
                                fontSize: '11.5px',
                                color: '#5a7d8c',
                                display: 'block',
                                marginTop: '3px',
                              }}
                            >
                              {item.subCategoryLabel}
                            </span>
                          )}
                        </td>
                        <td
                          className="admin-gallery-col-date"
                          style={{ color: '#5a7d8c', whiteSpace: 'nowrap', fontSize: '13px' }}
                        >
                          {item.date ? toPersianDigits(item.date) : '—'}
                        </td>
                        <td className="admin-gallery-col-actions">
                          <div className="admin-table-actions">
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn-edit"
                              onClick={() => handleEditGalleryItem(item)}
                              title="ویرایش نمونه کار"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                              </svg>
                              <span>ویرایش</span>
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn-delete"
                              onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                              title="حذف نمونه کار"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              <span>حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredGalleryItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ textAlign: 'center', padding: '36px', color: '#8faab6' }}
                      >
                        نمونه‌کاری مطابق با جستجوی شما یافت نشد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Edit Gallery Item View */}
        {activeTab === 'edit-gallery' && selectedGalleryItem && (
          <div className="admin-edit-gallery-container">
            {/* View Mode: Live Preview */}
            {galleryViewMode === 'preview' ? (
              <GalleryPreview item={selectedGalleryItem} />
            ) : (
              /* View Mode: Form Edit */
              <div className="admin-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
                  {isNewGalleryItem ? 'ایجاد نمونه‌کار جدید' : 'ویرایش جزئیات نمونه‌کار'}
                </h3>
                <p style={{ fontSize: '13px', color: '#5a7d8c', marginBottom: '24px' }}>
                  نوع نمونه‌کار، تصاویر بهینه‌شده و مشخصات درمان را تنظیم کنید.
                </p>

                {/* TYPE SELECTOR: Before/After vs. Work Flow (Stages) - Only when creating a new item */}
                {isNewGalleryItem && (
                  <div className="admin-input-group">
                    <label style={{ fontWeight: 700 }}>نوع فرمت گالری</label>
                    <div className="admin-gallery-type-pill-group">
                      <button
                        type="button"
                        className={`admin-gallery-type-btn ${
                          selectedGalleryItem.type !== 'stages' ? 'active' : ''
                        }`}
                        onClick={() =>
                          setSelectedGalleryItem({ ...selectedGalleryItem, type: 'before-after' })
                        }
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="12" y1="3" x2="12" y2="21" />
                        </svg>
                        <span>مقایسه قبل و بعد (۲ تصویر)</span>
                      </button>

                      <button
                        type="button"
                        className={`admin-gallery-type-btn ${
                          selectedGalleryItem.type === 'stages' ? 'active' : ''
                        }`}
                        onClick={() => {
                          const stages =
                            selectedGalleryItem.stages && selectedGalleryItem.stages.length >= 2
                              ? selectedGalleryItem.stages
                              : [
                                  {
                                    stepNumber: 1,
                                    title: 'عکس یک',
                                    image: selectedGalleryItem.beforeImg || '',
                                    description: '',
                                  },
                                  {
                                    stepNumber: 2,
                                    title: 'عکس دو',
                                    image: selectedGalleryItem.afterImg || '',
                                    description: '',
                                  },
                                ];
                          setSelectedGalleryItem({
                            ...selectedGalleryItem,
                            type: 'stages',
                            stages,
                          });
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        <span>مراحل کار و جریان درمان (چندمرحله‌ای)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* DYNAMIC SECTION 1: Before & After View */}
                {selectedGalleryItem.type !== 'stages' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '20px',
                      marginBottom: '28px',
                      padding: '20px',
                      background: '#f8fdff',
                      borderRadius: '16px',
                      border: '1.5px solid #d4ebf2',
                    }}
                  >
                    {/* Before Image Input */}
                    <div>
                      <div className="admin-field-header">
                        <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#1c434f' }}>
                          عکس قبل (تصویر قبل از درمان)
                        </label>
                      </div>

                      {selectedGalleryItem.beforeImg ? (
                        <div className="admin-image-preview-container" style={{ height: '200px' }}>
                          <img
                            src={selectedGalleryItem.beforeImg}
                            alt="عکس قبل"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div className="admin-image-preview-overlay">
                            <label className="admin-image-overlay-btn" title="تغییر تصویر">
                              <span>تغییر تصویر</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => handleUploadGalleryImage(e, 'before')}
                              />
                            </label>
                            <button
                              type="button"
                              className="admin-image-overlay-btn delete"
                              onClick={() =>
                                setSelectedGalleryItem({ ...selectedGalleryItem, beforeImg: '' })
                              }
                              title="حذف تصویر"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="admin-image-placeholder-box" style={{ height: '200px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: '#e3f9ff',
                              color: '#1c83aa',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#1c434f' }}>
                            {isUploadingGalleryImg === 'before'
                              ? 'در حال آپلود و بهینه‌سازی...'
                              : 'عکس قبل'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#8faab6' }}>
                            کلیک کنید تا تصویر انتخاب و خودکار به WebP تبدیل شود
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => handleUploadGalleryImage(e, 'before')}
                          />
                        </label>
                      )}
                    </div>

                    {/* After Image Input */}
                    <div>
                      <div className="admin-field-header">
                        <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#1c434f' }}>
                          عکس بعد (تصویر بعد از درمان)
                        </label>
                      </div>

                      {selectedGalleryItem.afterImg ? (
                        <div className="admin-image-preview-container" style={{ height: '200px' }}>
                          <img
                            src={selectedGalleryItem.afterImg}
                            alt="عکس بعد"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div className="admin-image-preview-overlay">
                            <label className="admin-image-overlay-btn" title="تغییر تصویر">
                              <span>تغییر تصویر</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => handleUploadGalleryImage(e, 'after')}
                              />
                            </label>
                            <button
                              type="button"
                              className="admin-image-overlay-btn delete"
                              onClick={() =>
                                setSelectedGalleryItem({ ...selectedGalleryItem, afterImg: '' })
                              }
                              title="حذف تصویر"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="admin-image-placeholder-box" style={{ height: '200px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: '#e3f9ff',
                              color: '#1c83aa',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#1c434f' }}>
                            {isUploadingGalleryImg === 'after'
                              ? 'در حال آپلود و بهینه‌سازی...'
                              : 'عکس بعد'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#8faab6' }}>
                            کلیک کنید تا تصویر انتخاب و خودکار به WebP تبدیل شود
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => handleUploadGalleryImage(e, 'after')}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* DYNAMIC SECTION 2: Work Flow / Treatment Stages View */}
                {selectedGalleryItem.type === 'stages' && (
                  <div style={{ marginBottom: '28px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: '15px',
                            fontWeight: 800,
                            color: '#1c434f',
                            display: 'block',
                          }}
                        >
                          مراحل انجام کار / جریان درمان (Work Flow)
                        </label>
                        <p style={{ fontSize: '12.5px', color: '#5a7d8c', margin: '2px 0 0 0' }}>
                          به صورت پیش‌فرض ۲ بخش تصویر قرار دارد. با دکمه «+ افزودن مرحله جدید»
                          می‌توانید تصاویر و مراحل بیشتری اضافه کنید.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="admin-btn-primary"
                        style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
                        onClick={handleAddStage}
                      >
                        + افزودن مرحله جدید
                      </button>
                    </div>

                    {(selectedGalleryItem.stages || []).map((stage, sIdx) => (
                      <div key={sIdx} className="admin-stage-item-card">
                        <div className="admin-stage-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                background: '#1c83aa',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 800,
                              }}
                            >
                              {sIdx + 1}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: '#1c434f' }}>
                              {stage.title || `مرحله ${sIdx + 1}`}
                            </span>
                          </div>

                          <div className="admin-stage-reorder-actions">
                            {/* Move Up */}
                            <button
                              type="button"
                              className="admin-stage-icon-btn"
                              disabled={sIdx === 0}
                              onClick={() => handleMoveStage(sIdx, 'up')}
                              title="انتقال به مرحله قبل (بالا)"
                              aria-label="انتقال به بالا"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="18 15 12 9 6 15" />
                              </svg>
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              className="admin-stage-icon-btn"
                              disabled={sIdx === (selectedGalleryItem.stages?.length || 1) - 1}
                              onClick={() => handleMoveStage(sIdx, 'down')}
                              title="انتقال به مرحله بعد (پایین)"
                              aria-label="انتقال به پایین"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>

                            {/* Delete Stage */}
                            <button
                              type="button"
                              className="admin-stage-icon-btn delete"
                              disabled={(selectedGalleryItem.stages?.length || 0) <= 2}
                              onClick={() => handleRemoveStage(sIdx)}
                              title="حذف این مرحله (حداقل ۲ مرحله نیاز است)"
                              aria-label="حذف مرحله"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Stage Content Inputs */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '16px',
                            alignItems: 'start',
                          }}
                        >
                          <div>
                            <label
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'block',
                                marginBottom: '6px',
                              }}
                            >
                              عنوان تصویر / مرحله
                            </label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder={`عکس ${['یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده'][sIdx] || sIdx + 1}: تراش و پاکسازی...`}
                              value={stage.title}
                              onChange={e => handleUpdateStage(sIdx, 'title', e.target.value)}
                            />

                            <label
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'block',
                                marginBottom: '6px',
                              }}
                            >
                              توضیحات بالینی و تکنیک درمان
                            </label>
                            <textarea
                              className="admin-input"
                              style={{ minHeight: '80px', resize: 'vertical' }}
                              placeholder="توضیح دهید در این مرحله چه اقداماتی انجام شد..."
                              value={stage.description}
                              onChange={e => handleUpdateStage(sIdx, 'description', e.target.value)}
                            />
                          </div>

                          <div>
                            <label
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'block',
                                marginBottom: '6px',
                              }}
                            >
                              بارگذاری تصویر (
                              {`عکس ${['یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده'][sIdx] || sIdx + 1}`}
                              )
                            </label>

                            {stage.image ? (
                              <div
                                className="admin-image-preview-container"
                                style={{ height: '150px' }}
                              >
                                <img
                                  src={stage.image}
                                  alt={stage.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div className="admin-image-preview-overlay">
                                  <label className="admin-image-overlay-btn" title="تغییر تصویر">
                                    <span>تغییر تصویر</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      onChange={e => handleUploadGalleryImage(e, sIdx)}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    className="admin-image-overlay-btn delete"
                                    onClick={() => handleUpdateStage(sIdx, 'image', '')}
                                    title="حذف تصویر"
                                  >
                                    حذف
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label
                                className="admin-image-placeholder-box"
                                style={{ height: '150px' }}
                              >
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: '#e3f9ff',
                                    color: '#1c83aa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                  </svg>
                                </div>
                                <span
                                  style={{ fontSize: '13px', fontWeight: 700, color: '#1c434f' }}
                                >
                                  {isUploadingGalleryImg === `stage-${sIdx}`
                                    ? 'در حال آپلود...'
                                    : `عکس ${['یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده'][sIdx] || sIdx + 1}`}
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                  کلیک جهت بارگذاری تصویر
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={e => handleUploadGalleryImage(e, sIdx)}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* COMMON METADATA INPUTS */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div className="admin-input-group">
                    <label>عنوان نمونه‌کار (کامل)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={selectedGalleryItem.title}
                      placeholder="مثال: اصلاح طرح لبخند با کامپوزیت و لمینت"
                      onChange={e =>
                        setSelectedGalleryItem({ ...selectedGalleryItem, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>دسته‌بندی درمانی</label>
                    <select
                      className="admin-input"
                      value={selectedGalleryItem.categoryLabel}
                      onChange={e => {
                        const val = e.target.value;
                        const matchCat = GALLERY_CATEGORIES.find(c => c.label === val);
                        setSelectedGalleryItem({
                          ...selectedGalleryItem,
                          categoryLabel: val,
                          category: (matchCat?.id as any) || selectedGalleryItem.category,
                        });
                      }}
                    >
                      {GALLERY_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.label}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-input-group">
                    <label>زیر عنوان / تکنیک درمان (Subcategory)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={selectedGalleryItem.subCategoryLabel}
                      placeholder="مثال: طراحی لبخند دیجیتال"
                      onChange={e =>
                        setSelectedGalleryItem({
                          ...selectedGalleryItem,
                          subCategoryLabel: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>پزشک معالج / مرکز</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={selectedGalleryItem.doctor || ''}
                      placeholder="کلینیک دندانپزشکی قلی‌پور"
                      onChange={e =>
                        setSelectedGalleryItem({ ...selectedGalleryItem, doctor: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>تاریخ ثبت نمونه‌کار</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={selectedGalleryItem.date || ''}
                      placeholder="مثال: ۱۴۰۳/۰۸/۱۵"
                      onChange={e =>
                        setSelectedGalleryItem({ ...selectedGalleryItem, date: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>طول دوره درمان</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={selectedGalleryItem.duration || ''}
                      placeholder="مثال: ۲ جلسه (۲ هفته)"
                      onChange={e =>
                        setSelectedGalleryItem({ ...selectedGalleryItem, duration: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>تعداد جلسات</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={selectedGalleryItem.sessions || ''}
                      placeholder="مثال: ۲ جلسه"
                      onChange={e =>
                        setSelectedGalleryItem({ ...selectedGalleryItem, sessions: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="admin-input-group">
                  <label>کلمات کلیدی و برچسب‌ها (با ویرگول یا کاما جدا کنید)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={galleryTagsInput}
                    placeholder="کامپوزیت، لمینت، اصلاح طرح لبخند"
                    onChange={e => {
                      setGalleryTagsInput(e.target.value);
                      const tags = e.target.value
                        .split(/[،,]/)
                        .map(t => t.trim())
                        .filter(Boolean);
                      setSelectedGalleryItem({ ...selectedGalleryItem, tags });
                    }}
                  />
                </div>

                <div className="admin-input-group">
                  <label>توضیحات پرونده بالینی و رضایت بیمار</label>
                  <textarea
                    className="admin-input"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    value={selectedGalleryItem.description || ''}
                    placeholder="توضیحات فرآیند درمان، علل مراجعه، اقدامات و نتیجه نهایی..."
                    onChange={e =>
                      setSelectedGalleryItem({
                        ...selectedGalleryItem,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    style={{ width: 'auto' }}
                    onClick={handleSaveGalleryItem}
                    disabled={isSaving}
                  >
                    {isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره نمونه کار در سایت'}
                  </button>
                  <button
                    type="button"
                    className="ribbon-btn"
                    onClick={() => setActiveTab('gallery')}
                  >
                    انصراف و بازگشت
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Reservations Manager */}
        {activeTab === 'reservations' && (
          <ReservationsManager
            reservations={reservations}
            setReservations={setReservations}
            onRefresh={loadReservations}
            onTriggerToast={triggerSaveToast}
          />
        )}
      </main>
    </div>
  );
}
