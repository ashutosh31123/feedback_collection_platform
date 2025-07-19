# Feedback Collection Platform

A comprehensive feedback collection platform built with Next.js and TailwindCSS that allows admins to create custom forms and collect responses from users.

## 🚀 Features

### 🔐 Admin Panel
- **Authentication**: Login and registration system for admins
- **Form Creation**: Create custom feedback forms with 3-5 questions
- **Question Types**: Support for text input and multiple-choice questions
- **Form Management**: Edit, delete, and manage existing forms
- **Shareable Links**: Generate public URLs for forms

### 📊 Dashboard
- **Response Overview**: View all form responses in a tabular format
- **Statistics**: Basic summary stats and analytics
- **CSV Export**: Export all responses as CSV files
- **Real-time Updates**: See responses as they come in

### 📄 Public Forms
- **Dynamic Rendering**: Forms are rendered based on admin configuration
- **Validation**: Client-side validation for all form fields
- **Mobile Responsive**: Works perfectly on all devices
- **User-friendly**: Clean, intuitive interface for respondents

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: TailwindCSS 4
- **Authentication**: localStorage-based (demo)
- **Storage**: localStorage (demo) - ready for database integration
- **Deployment**: Ready for Vercel, Netlify, or any Next.js hosting

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/ashutosh31123/feedback_collection_platform.git
cd feedback_collection_nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### For Admins

1. **Register/Login**: 
   - Visit `/admin/register` to create an account
   - Or use demo credentials: `admin@example.com` / `password`

2. **Create Forms**:
   - Click "Create New Form" in the dashboard
   - Add a title and 3-5 questions
   - Choose between text input or multiple-choice questions
   - Save the form

3. **Share Forms**:
   - Copy the generated form link
   - Share with your audience

4. **View Responses**:
   - Click "View Responses" to see detailed analytics
   - Export data as CSV for further analysis

### For Respondents

1. **Access Forms**: Use the shared form link
2. **Fill Out**: Answer all required questions
3. **Submit**: Click submit to send your response

## 🔧 Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login
│   │   ├── register/page.tsx       # Admin registration
│   │   └── dashboard/
│   │       ├── page.tsx            # Main dashboard
│   │       └── responses/page.tsx  # Response analytics
│   ├── api/
│   │   ├── forms/route.ts          # Form API endpoints
│   │   └── responses/route.ts      # Response API endpoints
│   ├── form/[formId]/page.tsx      # Public form page
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Landing page
└── components/                     # Reusable components
```

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface using TailwindCSS
- **Responsive**: Mobile-first design that works on all devices
- **Loading States**: Smooth loading animations and feedback
- **Error Handling**: User-friendly error messages
- **Accessibility**: Proper ARIA labels and keyboard navigation
