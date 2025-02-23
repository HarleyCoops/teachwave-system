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

## Scalable Content Wrapper

The platform uses a scalable approach to handle hundreds of case studies efficiently:

### Content Management Structure

```typescript
interface CaseStudyContent {
  id: number;
  title: string;
  keyConceptTitle: string;
  keyConceptContent: string;
  formulas: Array<{latex: string, explanation: string}>;
  practiceQuestion: string;
  solution: {
    parts: Array<{
      title: string;
      steps: Array<{text: string, latex?: string}>
    }>;
  };
  christiansThoughts: string;
}
```

### Components

1. **CaseStudyContent Component**
   - Single component handling all case studies
   - Takes case study ID as prop
   - Renders content with consistent structure
   - Handles LaTeX parsing and display

2. **TeX Parser Utility**
   ```typescript
   // src/lib/tex-parser.ts
   export function parseTexFile(content: string): CaseStudyContent {
     // Parses LaTeX sections into structured content
     // Handles math blocks, text content, and formatting
   }
   ```

3. **Centralized Metadata**
   ```typescript
   // src/data/case-studies.ts
   export const CASE_STUDIES = [
     {
       id: 1,
       title: "Portfolio Performance Measurement",
       description: "...",
       status: "available",
       isFree: true,
       category: "Portfolio Management"
     }
   ]
   ```

### Benefits

- **Maintainability**: Single component handles all case study rendering
- **Consistency**: Uniform structure and styling across all content
- **Scalability**: Easy addition of new case studies
- **Future-proofing**: Structure supports potential CMS integration
- **Performance**: Content loaded on demand
- **Organization**: Clear separation of content and presentation

### Usage

1. Store LaTeX content in `Content` directory
2. Add metadata to case studies configuration
3. Content automatically parsed and rendered through CaseStudyContent component
4. Access control handled through metadata (free vs premium)

## Current Status

- [x] Basic authentication flow
- [x] Case study navigation
- [x] KaTeX math rendering
- [x] Protected routes
- [x] Stripe subscription integration
- [x] Customer portal access
- [ ] LaTeX parser for content
- [ ] Progress tracking
- [ ] User dashboard
- [ ] Additional case studies

## Subscription System

The platform uses Stripe for subscription management:

### Features
- Secure payment processing with Stripe Checkout
- Customer portal for subscription management
- Webhook integration for real-time subscription updates
- Free preview content available
- Premium content access control

### Setup Requirements
1. Stripe Account Configuration:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRICE_ID=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. Supabase Edge Functions:
   - `stripe_webhook`: Handles subscription events
     * URL: https://sxekxuboywmrzhzgpaei.supabase.co/functions/v1/stripe_webhook
   - `create_checkout_session`: Creates Stripe Checkout sessions
     * URL: https://sxekxuboywmrzhzgpaei.supabase.co/functions/v1/create_checkout_session
   - `create_portal_session`: Manages customer portal access
     * URL: https://sxekxuboywmrzhzgpaei.supabase.co/functions/v1/create_portal_session

3. Database Tables:
   ```sql
   profiles (
     id uuid references auth.users,
     stripe_customer_id text,
     subscription_status text,
     subscription_tier text,
     subscription_end_date timestamptz
   )
   ```

### Deployment

1. Deploy Edge Functions:
   ```bash
   # Deploy webhook function
   supabase functions deploy stripe_webhook --project-ref sxekxuboywmrzhzgpaei --no-verify-jwt

   # Deploy checkout session function
   supabase functions deploy create_checkout_session --project-ref sxekxuboywmrzhzgpaei --no-verify-jwt

   # Deploy portal session function
   supabase functions deploy create_portal_session --project-ref sxekxuboywmrzhzgpaei --no-verify-jwt
   ```

2. Set Environment Variables:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. Configure Stripe Webhooks:
   - Endpoint: `https://sxekxuboywmrzhzgpaei.supabase.co/functions/v1/stripe_webhook`
   - Events:
     * customer.subscription.created
     * customer.subscription.updated
     * customer.subscription.deleted
     * invoice.paid
     * invoice.payment_failed

## Post Purchase Behavior

After a successful purchase through Stripe, the user's status is updated in the Supabase profiles table. The system uses the following fields to determine access:

- subscription_tier: Set to "premium" after purchase
- subscription_status: Set to "active" after purchase
- stripe_customer_id: Stored for reference

The frontend checks these fields to determine what content to show the user. When subscription_tier is "premium", all premium content is automatically unlocked. This is a one-time purchase, so there is no expiration date or renewal process.

## License

[License details to be added]

## Contributors

- justCalculations Team
