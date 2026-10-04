'use client';

import React, { useState, useEffect } from 'react';
import './admin.css';
import RichTextEditor from './RichTextEditor';
import { ArticleItem } from '@/data/articlesData';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'edit-article'>('articles');

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Check login status on mount
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => res.json())
      .then((data) => {
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
    setActiveTab('edit-article');
    setSaveMessage('');
  };

  const handleCreateNewArticle = () => {
    const newArt: ArticleItem = {
      id: String(Date.now()),
      title: 'مقاله جدید',
      slug: `article-${Date.now()}`,
      category: 'عمومی و پیشگیری',
      date: '۱۴۰۵',
      readTime: '۵ دقیقه',
      author: 'دکتر مهدی محمدنژاد',
      summary: '',
      tldr: '',
      keywords: [],
      sections: [
        {
          id: 'intro',
          title: 'مقدمه',
          body: '',
          doctorComment: '',
        },
      ],
      faqs: [],
      content: [],
    };
    setSelectedArticle(newArt);
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
        body: JSON.stringify(selectedArticle),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage('✅ تغییرات با موفقیت در کد و سایت ذخیره شد!');
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

  // Section handling
  const handleAddSection = () => {
    if (!selectedArticle) return;
    const newSec = {
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

  const handleUpdateSection = (idx: number, field: string, val: string) => {
    if (!selectedArticle) return;
    const updated = [...selectedArticle.sections];
    updated[idx] = { ...updated[idx], [field]: val };
    setSelectedArticle({ ...selectedArticle, sections: updated });
  };

  // FAQ handling
  const handleAddFaq = () => {
    if (!selectedArticle) return;
    const newFaq = { question: '', answer: '' };
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

  const handleUpdateFaq = (idx: number, field: 'question' | 'answer', val: string) => {
    if (!selectedArticle) return;
    const updated = [...(selectedArticle.faqs || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setSelectedArticle({ ...selectedArticle, faqs: updated });
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-wrapper admin-login-container">
        <div className="admin-login-card">
          <div style={{ fontSize: '38px', marginBottom: '12px' }}>🔒</div>
          <h1 className="admin-login-title">ورود به پنل مدیریت کلینیک</h1>
          <p className="admin-login-subtitle">
            برای ویرایش مستقیم متون، جداول و مقالات سایت رمز عبور را وارد کنید.
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
                onChange={(e) => setPassword(e.target.value)}
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
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>پنل مدیریت کلینیک دندانپزشکی قلی‌پور</h2>
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
              ✍️ ویرایش مقاله ({selectedArticle.title.substring(0, 25)}...)
            </button>
          )}
        </div>

        {/* TAB 1: Articles List */}
        {activeTab === 'articles' && (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>مقالات منتشر شده در سایت</h3>
                <p style={{ fontSize: '13px', color: '#5a7d8c', marginTop: '4px' }}>
                  روی دکمه ویرایش هر مقاله کلیک کنید تا متون، جداول و بالت‌های آن را به صورت بصری ویرایش نمایید.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-primary"
                style={{ width: 'auto' }}
                onClick={handleCreateNewArticle}
              >
                + افزودن مقاله جدید
              </button>
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
                  {articles.map((art) => (
                    <tr key={art.id}>
                      <td style={{ fontWeight: 700 }}>{art.id}</td>
                      <td style={{ fontWeight: 600 }}>{art.title}</td>
                      <td>
                        <span className="admin-badge">{art.category}</span>
                      </td>
                      <td style={{ color: '#5a7d8c' }}>{art.date}</td>
                      <td>{art.sections?.length || 0} بخش</td>
                      <td>
                        <button
                          type="button"
                          className="toolbar-btn"
                          onClick={() => handleEditArticle(art)}
                          style={{ color: '#1c83aa', borderColor: '#1c83aa' }}
                        >
                          ✏️ ویرایش
                        </button>
                        <a
                          href={`/articles/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="toolbar-btn"
                          style={{ marginRight: '6px', textDecoration: 'none' }}
                        >
                          مشاهده
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Edit Selected Article */}
        {activeTab === 'edit-article' && selectedArticle && (
          <div>
            {/* Header Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                background: '#fff',
                padding: '16px 24px',
                borderRadius: '16px',
                border: '1px solid #d8eef5',
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>ویرایش بصری مقاله</h3>
                <span style={{ fontSize: '13px', color: '#5a7d8c' }}>
                  نامک در سایت: /articles/{selectedArticle.slug}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {saveMessage && (
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{saveMessage}</span>
                )}
                <button
                  type="button"
                  className="admin-btn-primary"
                  style={{ width: 'auto' }}
                  onClick={handleSaveArticle}
                  disabled={isSaving}
                >
                  {isSaving ? 'در حال ذخیره‌سازی...' : '💾 ذخیره تغییرات'}
                </button>
              </div>
            </div>

            {/* General Info */}
            <div className="admin-card">
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>مشخصات عمومی</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="admin-input-group">
                  <label>عنوان اصلی مقاله</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={selectedArticle.title}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, title: e.target.value })}
                  />
                </div>
                <div className="admin-input-group">
                  <label>عنوان سئو و تب مرورگر (کوتاه)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={selectedArticle.seoTitle || ''}
                    placeholder="مثال: مراقبت‌های بعد از ایمپلنت دندان"
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, seoTitle: e.target.value })}
                  />
                </div>
                <div className="admin-input-group">
                  <label>دسته‌بندی کلینیک</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={selectedArticle.category}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, category: e.target.value })}
                  />
                </div>
                <div className="admin-input-group">
                  <label>نامک (Slug آدرس صفحه)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={selectedArticle.slug}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-input-group" style={{ marginTop: '12px' }}>
                <label>چکیده و خلاصه اجرایی (TL;DR)</label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={selectedArticle.tldr || ''}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, tldr: e.target.value })}
                />
              </div>
            </div>

            {/* Sections & Visual Editor */}
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>بخش‌های بدنه مقاله (با امکان درج جدول و بالت)</h4>
                  <p style={{ fontSize: '13px', color: '#5a7d8c', marginTop: '2px' }}>
                    می‌توانید با دکمه‌های نوار ابزار جدول، لیست گلوله‌ای یا باکس نکته را به سادگی درج کنید.
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>بخش {sIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sIdx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#e11d48',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      حذف بخش ✕
                    </button>
                  </div>

                  <div className="admin-input-group">
                    <label>عنوان بخش</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={sec.title}
                      onChange={(e) => handleUpdateSection(sIdx, 'title', e.target.value)}
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>متن بدنه، جداول و لیست‌ها</label>
                    <RichTextEditor
                      value={sec.body}
                      onChange={(val) => handleUpdateSection(sIdx, 'body', val)}
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>نکته بالینی پزشک (کادر توصیه متخصص)</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="توصیه کلینیکی پزشک..."
                      value={sec.doctorComment || ''}
                      onChange={(e) => handleUpdateSection(sIdx, 'doctorComment', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* FAQs */}
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>سوالات متداول (FAQ)</h4>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13.5px' }}>پرسش {fIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(fIdx)}
                      style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer' }}
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
                      onChange={(e) => handleUpdateFaq(fIdx, 'question', e.target.value)}
                    />
                  </div>
                  <div className="admin-input-group">
                    <textarea
                      className="admin-input"
                      rows={2}
                      placeholder="پاسخ دکتر..."
                      value={faq.answer}
                      onChange={(e) => handleUpdateFaq(fIdx, 'answer', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
