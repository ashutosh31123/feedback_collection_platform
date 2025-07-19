'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Form {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
  responses: Response[];
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice';
  options?: string[];
}

interface Response {
  id: string;
  formId: string;
  answers: Answer[];
  submittedAt: string;
}

interface Answer {
  questionId: string;
  value: string;
}

export default function AdminDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
      return;
    }

    // Load forms from localStorage
    const savedForms = JSON.parse(localStorage.getItem('forms') || '[]');
    setForms(savedForms);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  const createNewForm = () => {
    const newForm: Form = {
      id: Date.now().toString(),
      title: '',
      questions: [
        {
          id: '1',
          text: '',
          type: 'text'
        }
      ],
      createdAt: new Date().toISOString(),
      responses: []
    };
    setSelectedForm(newForm);
    setShowCreateForm(true);
  };

  const saveForm = (form: Form) => {
    const updatedForms = forms.filter(f => f.id !== form.id);
    updatedForms.push(form);
    setForms(updatedForms);
    localStorage.setItem('forms', JSON.stringify(updatedForms));
    setShowCreateForm(false);
    setSelectedForm(null);
  };

  const deleteForm = (formId: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      const updatedForms = forms.filter(f => f.id !== formId);
      setForms(updatedForms);
      localStorage.setItem('forms', JSON.stringify(updatedForms));
    }
  };

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
  };

  const exportResponses = (form: Form) => {
    if (form.responses.length === 0) {
      alert('No responses to export');
      return;
    }

    const csvContent = generateCSV(form);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title}-responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (form: Form): string => {
    const headers = ['Response ID', 'Submitted At', ...form.questions.map(q => q.text)];
    const rows = form.responses.map(response => {
      const row = [response.id, new Date(response.submittedAt).toLocaleString()];
      form.questions.forEach(question => {
        const answer = response.answers.find(a => a.questionId === question.id);
        row.push(answer ? answer.value : '');
      });
      return row;
    });

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={createNewForm}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                ✨ Create New Form
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showCreateForm && selectedForm ? (
          <CreateFormForm
            form={selectedForm}
            onSave={saveForm}
            onCancel={() => {
              setShowCreateForm(false);
              setSelectedForm(null);
            }}
          />
        ) : (
          <div className="px-4 py-6 sm:px-0">
            <div className="grid gap-6">
              {forms.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">No forms created yet</h3>
                  <p className="text-gray-600 mb-6">Create your first feedback form to get started</p>
                  <button
                    onClick={createNewForm}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    ✨ Create Your First Form
                  </button>
                </div>
              ) : (
                forms.map((form) => (
                  <FormCard
                    key={form.id}
                    form={form}
                    onEdit={() => {
                      setSelectedForm(form);
                      setShowCreateForm(true);
                    }}
                    onDelete={() => deleteForm(form.id)}
                    onCopyLink={() => copyFormLink(form.id)}
                    onExport={() => exportResponses(form)}
                                         onViewResponses={() => {
                       router.push(`/admin/dashboard/responses?formId=${form.id}`);
                     }}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FormCard({ form, onEdit, onDelete, onCopyLink, onExport, onViewResponses }: {
  form: Form;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onExport: () => void;
  onViewResponses: () => void;
}) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{form.title}</h3>
            <p className="mt-1 text-sm text-gray-500">
              Created {new Date(form.createdAt).toLocaleDateString()}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {form.questions.length} questions • {form.responses.length} responses
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onViewResponses}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-md transform hover:scale-105 transition-all duration-200"
            >
              📊 View Responses
            </button>
            <button
              onClick={onEdit}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-md transform hover:scale-105 transition-all duration-200"
            >
              ✏️ Edit
            </button>
            <button
              onClick={onCopyLink}
              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-md transform hover:scale-105 transition-all duration-200"
            >
              🔗 Copy Link
            </button>
            <button
              onClick={onExport}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-md transform hover:scale-105 transition-all duration-200"
            >
              📥 Export CSV
            </button>
            <button
              onClick={onDelete}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-md transform hover:scale-105 transition-all duration-200"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateFormForm({ form, onSave, onCancel }: {
  form: Form;
  onSave: (form: Form) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Form>(form);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      type: 'text'
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const removeQuestion = (questionId: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId)
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q => {
        if (q.id === questionId) {
          const updatedQuestion = { ...q, ...updates };
          // If changing to multiple-choice and no options exist, add default options
          if (updatedQuestion.type === 'multiple-choice' && !updatedQuestion.options) {
            updatedQuestion.options = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
          }
          return updatedQuestion;
        }
        return q;
      })
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() === '') {
      alert('Please enter a form title');
      return;
    }
    if (formData.questions.some(q => q.text.trim() === '')) {
      alert('Please fill in all question texts');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 shadow-xl rounded-xl p-8 border-2 border-blue-100">
      <h2 className="text-3xl font-bold mb-8 text-blue-800 text-center">✨ Create New Form</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-bold text-blue-700 mb-3">
            📝 Form Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-lg font-medium shadow-sm transition-all duration-200"
            placeholder="Enter form title"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-lg font-bold text-green-700">
              ❓ Questions
            </label>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              ➕ Add Question
            </button>
          </div>

          <div className="space-y-4">
            {formData.questions.map((question, index) => (
              <div key={question.id} className="border-2 border-indigo-200 rounded-xl p-6 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-bold text-indigo-700">❓ Question {index + 1}</h4>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md transform hover:scale-105 transition-all duration-200"
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 bg-white text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm transition-all duration-200"
                    placeholder="Enter question text"
                    required
                  />

                  <div>
                    <label className="block text-base font-bold text-purple-700 mb-2">
                      🎯 Question Type
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(question.id, { type: e.target.value as 'text' | 'multiple-choice' })}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white text-gray-900 text-base font-medium shadow-sm transition-all duration-200"
                    >
                      <option value="text">Text Input</option>
                      <option value="multiple-choice">Multiple Choice</option>
                    </select>
                  </div>

                  {question.type === 'multiple-choice' && (
                    <div>
                      <label className="block text-base font-bold text-orange-700 mb-3">
                        📋 Multiple Choice Options
                      </label>
                      <div className="space-y-3">
                        {(question.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4']).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-3">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(question.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'])];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(question.id, { options: newOptions });
                              }}
                              className="flex-1 px-3 py-2 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 bg-white text-gray-900 text-sm font-medium shadow-sm transition-all duration-200"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            {(question.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4']).length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = [...(question.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'])];
                                  newOptions.splice(optionIndex, 1);
                                  updateQuestion(question.id, { options: newOptions });
                                }}
                                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-2 py-2 rounded-lg text-xs font-bold shadow-md transform hover:scale-105 transition-all duration-200"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const currentOptions = question.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
                            const newOptionNumber = currentOptions.length + 1;
                            updateQuestion(question.id, { options: [...currentOptions, `Option ${newOptionNumber}`] });
                          }}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transform hover:scale-105 transition-all duration-200"
                        >
                          ➕ Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            ❌ Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            💾 Save Form
          </button>
        </div>
      </form>
    </div>
  );
} 