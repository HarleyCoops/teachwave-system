# justCalculations - CFA Learning Platform

A modern, interactive learning platform for CFA exam preparation, focusing on mathematical concepts and calculations through practical case studies.

## Project Overview

justCalculations provides a structured learning environment where users can:
- Study CFA concepts through practical case studies
- Practice calculations with step-by-step solutions
- Access expert insights and explanations
- Track progress across different topics

## Features

### Case Study Structure
Each case study follows a consistent three-section format:
1. **Key Concept**: Introduction to the topic with theoretical background
2. **Practice Question**: Real-world scenario with calculation requirements
3. **Solution & Explanation**: Detailed walkthrough with expert insights

### Technical Features
- **Mathematical Typesetting**: KaTeX integration for beautiful formula rendering
- **Authentication**: Secure user authentication via Supabase
- **Protected Content**: Route protection for authenticated users
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Technology Stack

- **Frontend Framework**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Supabase
- **Math Rendering**: KaTeX
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure

```
teachwave-system/
├── Content/               # LaTeX case study content
│   └── question_1.tex    # Individual case study files
├── src/
│   ├── components/       # React components
│   │   ├── Math.tsx     # KaTeX wrapper component
│   │   └── question/    # Case study components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utility functions
│   └── pages/           # Route pages
```

## Development Setup

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd teachwave-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:8080`

## Component Documentation

### Math Component
Wrapper for KaTeX rendering:
```typescript
<Math 
  math="\\text{TWR} = \\prod_{i=1}^{N} (1 + R_i)^{\\dfrac{1}{N}} - 1"
  display={true}
/>
```

### Protected Route
Route wrapper for authentication:
```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## Content Structure

Case studies are stored as LaTeX files in the `Content` directory. Each file follows a standard structure:
1. Key Concept section with theoretical background
2. Practice Question with clear requirements
3. Solution with detailed explanations
4. "Christian's Thoughts" section with expert insights

## Current Status

- [x] Basic authentication flow
- [x] Case study navigation
- [x] KaTeX math rendering
- [x] Protected routes
- [ ] LaTeX parser for content
- [ ] Progress tracking
- [ ] User dashboard
- [ ] Additional case studies

## License

[License details to be added]

## Contributors

- justCalculations Team
