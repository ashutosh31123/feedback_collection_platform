'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function PublicForm() {
  const params = useParams();
  const formId = params.formId as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load form data from localStorage
    const forms = JSON.parse(localStorage.getItem('forms') || '[]');
    const foundForm = forms.find((f: Form) => f.id === formId);
    
    if (foundForm) {
      setForm(foundForm);
      // Initialize answers object
      const initialAnswers: Record<string, string> = {};
      foundForm.questions.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setAnswers(initialAnswers);
    } else {
      setError('Form not found');
    }
    setLoading(false);
  }, [formId]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate that all questions are answered
      const unansweredQuestions = form!.questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
      
      if (unansweredQuestions.length > 0) {
        alert('Please answer all questions before submitting.');
        setSubmitting(false);
        return;
      }

      // Create response object
      const response: Response = {
        id: Date.now().toString(),
        formId: form!.id,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value: value.trim()
        })),
        submittedAt: new Date().toISOString()
      };

      // Save response to localStorage
      const forms = JSON.parse(localStorage.getItem('forms') || '[]');
      const updatedForms = forms.map((f: Form) => {
        if (f.id === formId) {
          return {
            ...f,
            responses: [...f.responses, response]
          };
        }
        return f;
      });

      localStorage.setItem('forms', JSON.stringify(updatedForms));
      setSubmitted(true);

    } catch (err) {
      setError('An error occurred while submitting your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Form Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6">Your response has been submitted successfully.</p>
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
            <p className="text-gray-600 mb-8">
              Please fill out the form below. All fields are required.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {form.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                  <label className="block text-lg font-medium text-gray-900 mb-4">
                    {index + 1}. {question.text}
                  </label>

                  {question.type === 'text' ? (
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your answer..."
                      rows={4}
                      required
                    />
                  ) : (
                    <div className="space-y-3">
                      {question.options?.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            required
                          />
                          <span className="ml-3 text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Response'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 