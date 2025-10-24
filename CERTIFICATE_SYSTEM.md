# Certificate System Implementation Guide

## Overview
Automatic certificate generation system for course completion with professional PDF certificates.

## System Architecture

### 1. Database Schema (WordPress)
**User Meta Keys:**
- `bb_course_{course_id}_progress` - JSON with completed lessons array
- `bb_course_{course_id}_completed_at` - Completion date
- `bb_certificates` - Array of certificate IDs for user

**Custom Post Type: `bb_certificate`**
- post_title: Certificate #{id} - {Course Name}
- post_status: publish
- ACF Fields:
  - certificate_number: Unique ID (e.g., BB-{YEAR}-{ID})
  - user_id: WordPress user ID
  - course_id: Course post ID
  - user_name: Full name on certificate
  - completion_date: Date course was completed
  - generated_date: When certificate was created
  - certificate_hash: Verification hash

### 2. WordPress Plugin Updates (v4.3.0)

**New REST API Endpoints:**

```php
// Course Progress Endpoints
GET    /wp-json/blackboard/v1/users/{user_id}/progress/{course_id}
POST   /wp-json/blackboard/v1/users/{user_id}/progress/{course_id}

// Certificate Endpoints
POST   /wp-json/blackboard/v1/certificates/generate
GET    /wp-json/blackboard/v1/certificates/{certificate_id}
GET    /wp-json/blackboard/v1/certificates/{certificate_id}/pdf
GET    /wp-json/blackboard/v1/users/{user_id}/certificates
```

**Progress Endpoint Logic:**
```php
// GET Progress
- Fetch user meta: bb_course_{course_id}_progress
- Return: { completedLessons: [0, 1, 2], completedAt: "2024-01-01", certificateGenerated: true }

// POST Progress
- Update user meta with new lesson completion
- Check if all lessons complete
- If complete: auto-trigger certificate generation
- Return updated progress
```

**Certificate Generation Logic:**
```php
// POST Generate Certificate
1. Verify course is 100% complete
2. Check if certificate already exists
3. Create bb_certificate post with unique ID
4. Store certificate metadata
5. Return certificate object with download URL
```

### 3. Next.js Components

**3.1 Progress Hook** (`/lib/hooks/use-course-progress.ts`)
```typescript
export function useCourseProgress(courseId: number) {
  const [progress, setProgress] = useState({
    completedLessons: [],
    completedAt: null,
    certificateGenerated: false
  })

  const markLessonComplete = async (lessonIndex: number) => {
    // Call API to mark lesson complete
    // Auto-check if all complete -> generate certificate
  }

  const generateCertificate = async () => {
    // Call certificate generation API
  }

  return { progress, markLessonComplete, generateCertificate }
}
```

**3.2 Certificate Completion Card** (`/components/certificates/certificate-completion-card.tsx`)
```typescript
// Shows at bottom of course learn page
// Features:
- Course completion progress (5/8 lessons complete)
- "Mark Complete" buttons for each lesson
- Certificate preview when eligible
- "Generate Certificate" button
- Download PDF when ready
```

**3.3 Certificate PDF Component** (`/components/certificates/certificate-pdf.tsx`)
```typescript
// Uses react-pdf or similar
// Professional certificate design with:
- BlackBoard branding
- Course name
- Student name
- Completion date
- Certificate number
- Verification QR code
- Official signatures/seals
```

### 4. UI Flow

**Course Learn Page:**
1. User watches lessons
2. At bottom of page: Certificate Completion section
3. Shows list of all lessons with checkboxes
4. User clicks "Complete" for each lesson
5. Progress bar updates (e.g., "6/8 Complete")
6. When 100% complete:
   - "🎉 Congratulations! Course Complete!" message
   - "Generate Certificate" button appears
7. Click "Generate Certificate"
   - API creates certificate
   - Shows success message
   - "Download PDF" button appears
8. Certificate also appears in Account > Certificates

**Account > Certificates Tab:**
- Grid of all earned certificates
- Each card shows:
  - Course name
  - Completion date
  - Certificate number
  - Download PDF button
  - Preview thumbnail
- Filter by date/course
- Search functionality

### 5. Certificate PDF Design

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│        [BlackBoard Logo]                │
│                                         │
│      CERTIFICATE OF COMPLETION          │
│                                         │
│        This certifies that              │
│                                         │
│          [Student Name]                 │
│                                         │
│    has successfully completed the       │
│                                         │
│         [Course Name]                   │
│                                         │
│      on [Completion Date]               │
│                                         │
│  Certificate #: BB-2024-00123           │
│                                         │
│  [QR Code]        [Signature]           │
│                                         │
└─────────────────────────────────────────┘
```

**Design Elements:**
- A4 size (210mm x 297mm)
- Professional fonts (serif for headings)
- Gold/Yellow accents (#ffed00)
- Border design
- Watermark/background pattern
- QR code for verification
- Digital signature

### 6. Implementation Steps

**Phase 1: WordPress Plugin (Backend)**
1. Add progress tracking user meta functions
2. Create REST API endpoints
3. Add certificate CPT
4. Implement PDF generation with WP libraries
5. Add verification system

**Phase 2: Next.js API Routes**
1. Create `/api/courses/progress` route
2. Create `/api/certificates/generate` route
3. Create `/api/certificates/[id]/pdf` route

**Phase 3: UI Components**
1. Build progress tracking hook
2. Create certificate completion card
3. Add to course learn page
4. Update account certificates tab
5. Style and test

**Phase 4: PDF Generation**
1. Design certificate template
2. Implement PDF rendering
3. Add download functionality
4. Test printing quality

**Phase 5: Testing & Polish**
1. Test full flow
2. Add animations/transitions
3. Error handling
4. Loading states
5. Mobile responsive

### 7. File Structure

```
WordPress Plugin:
/wp-content/plugins/blackboard-nextjs-sync/
  includes/
    class-certificate-manager.php
    class-progress-tracker.php
  templates/
    certificate-pdf.php

Next.js:
/app/api/
  courses/progress/route.ts
  certificates/generate/route.ts
  certificates/[id]/pdf/route.ts
/lib/
  hooks/use-course-progress.ts
  certificates/pdf-generator.ts
/components/certificates/
  certificate-completion-card.tsx
  certificate-pdf-preview.tsx
  lesson-completion-list.tsx
/app/courses/[slug]/learn/
  - Add certificate card at bottom
```

### 8. Security Considerations

- Verify user owns certificate before download
- Hash verification for authenticity
- Rate limit certificate generation
- Validate course completion before issuing
- Secure PDF storage/access

### 9. Future Enhancements

- Email certificate on completion
- Social sharing (LinkedIn, Twitter)
- Certificate expiration dates
- Recertification tracking
- Batch certificate download
- Certificate templates per course
- Multi-language certificates
- Digital badges/wallet integration

## Next Steps

1. Review this design
2. Provide example certificate PDFs
3. Confirm WordPress plugin update approach
4. Implement WordPress endpoints first
5. Build Next.js components
6. Test and iterate
