'use client';

import React, { useState, useEffect, useRef } from 'react';
import './admin.css';
import RichTextEditor from './RichTextEditor';
import ArticlePreview from './ArticlePreview';
import { ArticleItem, ArticleSection, ArticleFAQ, ArticleCitation } from '@/data/articlesData';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'edit-article'>('articles');

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [isNewArticle, setIsNewArticle] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [editorViewMode, setEditorViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check login status on mount
  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          loadArticles();
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

  const handleEditArticle = (art: ArticleItem) => {
    setSelectedArticle(JSON.parse(JSON.stringify(art)));
    setKeywordsInput((art.keywords || []).join('، '));
    setIsNewArticle(false);
    setActiveTab('edit-article');
    setSaveMessage('');
  };

  const handleDuplicateArticle = (art: ArticleItem) => {
    const cloned: ArticleItem = JSON.parse(JSON.stringify(art));
    cloned.id = ''; // Empty ID to trigger new creation
    cloned.title = `${art.title} (نسخه شبیه‌سازی شده)`;
    cloned.seoTitle = art.seoTitle ? `${art.seoTitle} - کپی` : '';
    cloned.slug = `${art.slug}-copy`;
    setSelectedArticle(cloned);
    setKeywordsInput((cloned.keywords || []).join('، '));
    setIsNewArticle(true);
    setActiveTab('edit-article');
    setSaveMessage(
      '📋 این مقاله از روی نسخه موجود کپی شده است. عنوان یا نامک را تغییر دهید و ذخیره نمایید.'
    );
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
      image: '/assets/article-implant-care.webp',
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
        setSaveMessage('✅ تغییرات با موفقیت در کد و دیتای سایت ذخیره شد!');
        setSelectedArticle(data.article);
        setIsNewArticle(false);
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
    setSelectedArticle({
      ...selectedArticle,
      sections: [...selectedArticle.sections, newSec],
    });
  };

  const handleRemoveSection = (idx: number) => {
    if (!selectedArticle) return;
    const updated = selectedArticle.sections.filter((_, i) => i !== idx);
    setSelectedArticle({ ...selectedArticle, sections: updated });
  };

  const handleUpdateSection = (idx: number, field: keyof ArticleSection, val: string) => {
    if (!selectedArticle) return;
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
    setSelectedArticle({ ...selectedArticle, sections: updated });
  };

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

  // Filter articles for list view
  const filteredArticles = articles.filter(
    art =>
      (art.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-wrapper admin-login-container">
        <div className="admin-login-card">
          <div style={{ fontSize: '38px', marginBottom: '12px' }}>🔒</div>
          <h1 className="admin-login-title">ورود به پنل مدیریت کلینیک</h1>
          <p className="admin-login-subtitle">
            برای ویرایش مستقیم متون، جداول، مقالات و مشاهده پیش‌نمایش گرافیکی، رمز عبور را وارد
            کنید.
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
  return (
    <div className="admin-wrapper">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="admin-nav-brand">
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>
            پنل مدیریت کلینیک دندانپزشکی قلی‌پور
          </h2>
          <span className="admin-nav-badge">ادمین فعال</span>
        </div>
        <div className="admin-nav-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '14px', color: '#1c83aa', textDecoration: 'none', fontWeight: 600 }}
          >
            مشاهده سایت ↗
          </a>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '6px 14px',
              border: '1px solid #d8eef5',
              background: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#5a7d8c',
            }}
          >
            خروج
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main-container">
        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            📚 لیست مقالات ({articles.length})
          </button>
          {selectedArticle && (
            <button
              className={`admin-tab-btn ${activeTab === 'edit-article' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit-article')}
            >
              ✍️ {isNewArticle ? 'افزودن / شبیه‌سازی مقاله' : 'ویرایش مقاله'} (
              {selectedArticle.title.substring(0, 25)}...)
            </button>
          )}
        </div>

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
                <p style={{ fontSize: '13px', color: '#5a7d8c', marginTop: '4px' }}>
                  می‌توانید هر مقاله را ویرایش کنید، یک کپی شبیه‌سازی شده از آن بسازید، یا مقاله
                  جدید ایجاد نمایید.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="admin-btn-primary"
                  style={{ width: 'auto' }}
                  onClick={handleCreateNewArticle}
                >
                  + افزودن مقاله خام جدید
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                className="admin-input"
                placeholder="🔍 جستجو در عنوان، دسته‌بندی یا نامک مقاله..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ maxWidth: '400px' }}
              />
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>شناسه</th>
                    <th>عنوان مقاله</th>
                    <th>دسته‌بندی</th>
                    <th>تاریخ</th>
                    <th>بخش‌ها</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map(art => (
                    <tr key={art.id}>
                      <td style={{ fontWeight: 700 }}>{art.id}</td>
                      <td style={{ fontWeight: 600, maxWidth: '320px' }}>
                        <div>{art.title}</div>
                        <div style={{ fontSize: '12px', color: '#5a7d8c', marginTop: '2px' }}>
                          /articles/{art.slug}
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge">{art.category}</span>
                      </td>
                      <td style={{ color: '#5a7d8c' }}>{art.date}</td>
                      <td>{art.sections?.length || 0} بخش</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => handleEditArticle(art)}
                            style={{ color: '#1c83aa', borderColor: '#1c83aa' }}
                            title="ویرایش مقاله"
                          >
                            ✏️ ویرایش
                          </button>
                          <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => handleDuplicateArticle(art)}
                            style={{
                              color: '#059669',
                              borderColor: '#059669',
                              background: '#ecfdf5',
                            }}
                            title="شبیه‌سازی و ایجاد یک مقاله دقیقاً مشابه"
                          >
                            📋 کپی/شبیه‌سازی
                          </button>
                          <a
                            href={`/articles/${art.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="toolbar-btn"
                            style={{ textDecoration: 'none' }}
                          >
                            مشاهده
                          </a>
                          <button
                            type="button"
                            className="toolbar-btn"
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
            {/* Header Actions & Mode Toggle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px',
                background: '#fff',
                padding: '16px 24px',
                borderRadius: '16px',
                border: '1px solid #d8eef5',
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                  {isNewArticle ? '✨ ساخت مقاله جدید / شبیه‌سازی شده' : 'ویرایش بصری مقاله'}
                </h3>
                <span style={{ fontSize: '13px', color: '#5a7d8c' }}>
                  آدرس در سایت: /articles/{selectedArticle.slug}
                </span>
              </div>

              {/* View Mode Toggle */}
              <div className="admin-mode-pill">
                <button
                  type="button"
                  className={`admin-mode-btn ${editorViewMode === 'split' ? 'active' : ''}`}
                  onClick={() => setEditorViewMode('split')}
                  title="نمایش همزمان ویرایشگر و پیش‌نمایش گرافیکی"
                >
                  🌗 نمای دوطرفه (ویرایش + زنده)
                </button>
                <button
                  type="button"
                  className={`admin-mode-btn ${editorViewMode === 'editor' ? 'active' : ''}`}
                  onClick={() => setEditorViewMode('editor')}
                  title="تنها فرم ویرایش"
                >
                  📝 فقط فرم ویرایش
                </button>
                <button
                  type="button"
                  className={`admin-mode-btn ${editorViewMode === 'preview' ? 'active' : ''}`}
                  onClick={() => setEditorViewMode('preview')}
                  title="تنها خروجی نهایی گرافیکی"
                >
                  👁️ فقط پیش‌نمایش
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {saveMessage && (
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{saveMessage}</span>
                )}
                <button
                  type="button"
                  className="toolbar-btn"
                  onClick={() => setActiveTab('articles')}
                >
                  بازگشت به لیست
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  style={{ width: 'auto' }}
                  onClick={handleSaveArticle}
                  disabled={isSaving}
                >
                  {isSaving ? 'در حال ذخیره‌سازی...' : '💾 ذخیره در سایت'}
                </button>
              </div>
            </div>

            {/* Layout based on View Mode */}
            <div className={editorViewMode === 'split' ? 'admin-editor-layout-split' : ''}>
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
                        <label>عنوان اصلی مقاله</label>
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
                        <label>دسته‌بندی کلینیک</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={selectedArticle.category}
                          onChange={e =>
                            setSelectedArticle(prev =>
                              prev ? { ...prev, category: e.target.value } : null
                            )
                          }
                        />
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
                      <label>خلاصه مقدماتی و لید مقاله (Summary)</label>
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
                      <label>چکیده و نکات کلیدی اجرایی (TL;DR کادر طلایی)</label>
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
                        <label>آدرس تصویر (URL یا مسیر محلی)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                          >
                            {isUploadingImage ? '...' : '📁 آپلود'}
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
                        <label>متن جایگزین تصویر (Alt Text برای سئو)</label>
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
                        <label>زیرنویس و توضیح تصویر (Caption)</label>
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
                    {selectedArticle.image && (
                      <div style={{ marginTop: '12px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedArticle.image}
                          alt="پیش‌نمایش تصویر"
                          style={{
                            maxHeight: '120px',
                            borderRadius: '8px',
                            border: '1px solid #d8eef5',
                          }}
                        />
                      </div>
                    )}
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
                          ۳. بخش‌های بدنه مقاله ({selectedArticle.sections.length} بخش)
                        </h4>
                        <p style={{ fontSize: '13px', color: '#5a7d8c', marginTop: '2px' }}>
                          امکان درج جداول مقایسه‌ای، لیست‌های عددی و گلوله‌ای و نکات بالینی.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="toolbar-btn"
                        onClick={handleAddSection}
                        style={{ background: '#e3f9ff', color: '#1c83aa', borderColor: '#1c83aa' }}
                      >
                        + افزودن بخش جدید
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
                          <span style={{ fontWeight: 700, fontSize: '14px', color: '#1c434f' }}>
                            بخش {sIdx + 1}: {sec.title || 'بدون عنوان'}
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="toolbar-btn"
                              disabled={sIdx === 0}
                              onClick={() => handleMoveSection(sIdx, 'up')}
                              title="انتقال به بالا"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="toolbar-btn"
                              disabled={sIdx === selectedArticle.sections.length - 1}
                              onClick={() => handleMoveSection(sIdx, 'down')}
                              title="انتقال به پایین"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSection(sIdx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#e11d48',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                              }}
                            >
                              حذف بخش ✕
                            </button>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '12px',
                            marginBottom: '12px',
                          }}
                        >
                          <div className="admin-input-group" style={{ marginBottom: 0 }}>
                            <label>عنوان بخش</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={sec.title}
                              onChange={e => handleUpdateSection(sIdx, 'title', e.target.value)}
                            />
                          </div>
                          <div className="admin-input-group" style={{ marginBottom: 0 }}>
                            <label>شناسه لنگر (Anchor ID برای فهرست)</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={sec.id}
                              onChange={e => handleUpdateSection(sIdx, 'id', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="admin-input-group">
                          <label>متن بدنه، جداول و لیست‌ها</label>
                          <RichTextEditor
                            value={sec.body}
                            onChange={val => handleUpdateSection(sIdx, 'body', val)}
                          />
                        </div>

                        <div className="admin-input-group">
                          <label>نکته بالینی پزشک (کادر کتیبه‌ای توصیه دکتر)</label>
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
                        className="toolbar-btn"
                        onClick={handleAddFaq}
                        style={{ background: '#e3f9ff', color: '#1c83aa', borderColor: '#1c83aa' }}
                      >
                        + افزودن پرسش و پاسخ
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
                            onClick={() => handleRemoveFaq(fIdx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#e11d48',
                              cursor: 'pointer',
                            }}
                          >
                            حذف ✕
                          </button>
                        </div>
                        <div className="admin-input-group">
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
                        className="toolbar-btn"
                        onClick={handleAddCitation}
                        style={{ background: '#e3f9ff', color: '#1c83aa', borderColor: '#1c83aa' }}
                      >
                        + افزودن رفرنس علمی
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
                            onClick={() => handleRemoveCitation(cIdx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#e11d48',
                              cursor: 'pointer',
                            }}
                          >
                            حذف ✕
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
                            <label style={{ fontSize: '12px' }}>عنوان مقاله یا دستورالعمل</label>
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
      </main>
    </div>
  );
}
