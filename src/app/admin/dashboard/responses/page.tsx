'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function ResponsesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get('formId');
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
      return;
    }

    if (!formId) {
      router.push('/admin/dashboard');
      return;
    }

    // Load form data
    const forms = JSON.parse(localStorage.getItem('forms') || '[]');
    const foundForm = forms.find((f: Form) => f.id === formId);
    
    if (foundForm) {
      setForm(foundForm);
    } else {
      router.push('/admin/dashboard');
    }
    setLoading(false);
  }, [formId, router]);

  const getAnswerForQuestion = (response: Response, questionId: string): string => {
    const answer = response.answers.find(a => a.questionId === questionId);
    return answer ? answer.value : 'No answer';
  };

  const getQuestionStats = (question: Question) => {
    if (question.type === 'multiple-choice' && question.options) {
      const stats: Record<string, number> = {};
      question.options.forEach(option => {
        stats[option] = 0;
      });
      
      form!.responses.forEach(response => {
        const answer = getAnswerForQuestion(response, question.id);
        if (stats.hasOwnProperty(answer)) {
          stats[answer]++;
        }
      });
      
      return stats;
    }
    return null;
  };

  const exportToCSV = () => {
    if (!form || form.responses.length === 0) {
      alert('No responses to export');
      return;
    }

    const headers = ['Response ID', 'Submitted At', ...form.questions.map(q => q.text)];
    const rows = form.responses.map(response => {
      const row = [response.id, new Date(response.submittedAt).toLocaleString()];
      form.questions.forEach(question => {
        row.push(getAnswerForQuestion(response, question.id));
      });
      return row;
    });

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title}-responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Form Responses</h1>
              <p className="text-gray-600 mt-1">{form.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Export CSV
              </button>
              <Link
                href="/admin/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Summary Stats */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{form.responses.length}</div>
                <div className="text-sm text-blue-600">Total Responses</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{form.questions.length}</div>
                <div className="text-sm text-green-600">Questions</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {form.responses.length > 0 ? new Date(form.responses[0].submittedAt).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-sm text-purple-600">Latest Response</div>
              </div>
            </div>
          </div>

          {/* Question Statistics */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Statistics</h2>
            <div className="space-y-6">
              {form.questions.map((question, index) => {
                const stats = getQuestionStats(question);
                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      {index + 1}. {question.text}
                    </h3>
                    
                    {question.type === 'multiple-choice' && stats ? (
                      <div className="space-y-2">
                        {Object.entries(stats).map(([option, count]) => (
                          <div key={option} className="flex items-center justify-between">
                            <span className="text-gray-700">{option}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${(count / form.responses.length) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {count} ({((count / form.responses.length) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        {form.responses.length} text responses
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Responses */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Individual Responses</h2>
            
            {form.responses.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No responses yet</p>
            ) : (
              <div className="space-y-6">
                {form.responses.map((response, index) => (
                  <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-900">
                        Response #{form.responses.length - index}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(response.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {form.questions.map((question, qIndex) => (
                        <div key={question.id} className="border-l-4 border-blue-200 pl-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {qIndex + 1}. {question.text}
                          </p>
                          <p className="text-gray-900">
                            {getAnswerForQuestion(response, question.id)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 