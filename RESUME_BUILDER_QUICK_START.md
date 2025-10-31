# Resume Builder - Quick Start Guide

## 🎯 How to Use

### **Step 1: Navigate to Resume Page**
```
URL: http://localhost:8080/resume
```

### **Step 2: Click "Start Building Resume"**
Located in the right card titled "Build Professional Resume"

### **Step 3: Fill Out Your Resume**

#### **Profile Section (Always visible)**
- Full Name
- Professional Summary
- Email
- Phone
- Website/LinkedIn
- Location

#### **Work Experience (Add Multiple)**
- Company
- Job Title
- Date (e.g., "Jan 2020 - Present")
- Description (bullet points, one per line)
- Click "+ Add Experience" for more entries
- Click trash icon to delete

#### **Education (Add Multiple)**
- School/University
- Degree & Major
- GPA
- Date
- Additional Info (optional)
- Click "+ Add Education" for more entries

#### **Projects (Add Multiple)**
- Project Name
- Date
- Description (bullet points)
- Click "+ Add Project" for more entries

#### **Skills**
- Skills list (bullet points)
- Tip: Group by category
  - "Frontend: React, Vue, Angular"
  - "Backend: Node.js, Python, Java"

### **Step 4: Preview Updates in Real-Time**
- Right side shows live preview
- Changes appear instantly as you type
- Zoom in/out with +/- buttons

### **Step 5: Save or Export**
- **Save Resume**: Saves to database (requires login)
- **Export JSON**: Downloads JSON file

---

## 🎨 UI Layout

```
┌────────────────────────────────────────────────────────────┐
│  ← Back to Resume Parser      RESUME BUILDER              │
├─────────────────────────────┬──────────────────────────────┤
│                             │                              │
│  📝 FORMS (Left, Scroll)    │  👁️ PREVIEW (Right, Sticky)  │
│                             │                              │
│  ┌─────────────────────┐    │  ┌──────────────────────┐   │
│  │ Profile             │    │  │  [-] 75% [+]         │   │
│  │ • Name              │    │  │  💾 Save  📥 Export   │   │
│  │ • Email             │    │  ├──────────────────────┤   │
│  │ • Phone             │    │  │                      │   │
│  │ • Summary           │    │  │  JOHN DOE            │   │
│  └─────────────────────┘    │  │  ─────────────────   │   │
│                             │  │  john@email.com      │   │
│  ┌─────────────────────┐    │  │  (123) 456-7890      │   │
│  │ Work Experience     │    │  │                      │   │
│  │ + Add Experience    │    │  │  WORK EXPERIENCE     │   │
│  │ ┌─────────────────┐ │    │  │  ─────────────       │   │
│  │ │ Company      [x]│ │    │  │  Google              │   │
│  │ │ Job Title       │ │    │  │  Software Engineer   │   │
│  │ │ Date            │ │    │  │  • Led team of 5...  │   │
│  │ │ Description     │ │    │  │                      │   │
│  │ └─────────────────┘ │    │  │  EDUCATION           │   │
│  └─────────────────────┘    │  │  ─────────────       │   │
│                             │  │  Stanford University │   │
│  ┌─────────────────────┐    │  │  BS Computer Sci     │   │
│  │ Education           │    │  │  GPA: 3.8            │   │
│  │ + Add Education     │    │  │                      │   │
│  └─────────────────────┘    │  └──────────────────────┘   │
│                             │                              │
│  ... (Projects, Skills)     │   (Live Preview Updates)    │
│                             │                              │
└─────────────────────────────┴──────────────────────────────┘
```

---

## 🎯 Key Features

### ✨ Real-Time Preview
- Type in any field → Preview updates instantly
- No "Save Draft" needed
- Professional resume layout

### 🎨 Professional Design
- Clean, modern interface
- Theme color accents (blue)
- Section headings with decorative lines
- Proper spacing and typography

### 📱 Responsive
- Desktop: Side-by-side layout
- Mobile: Stacked layout (forms on top)

### 💾 Save & Export
- **Save**: Stores in Supabase database
- **Export JSON**: Downloads resume data
- **Future**: PDF export coming soon

---

## 🔍 Example Content

### Profile:
```
Name: John Doe
Email: john.doe@email.com
Phone: (123) 456-7890
Location: San Francisco, CA
Website: linkedin.com/in/johndoe
Summary: Passionate software engineer with 5+ years building scalable applications
```

### Work Experience:
```
Company: Google
Job Title: Senior Software Engineer
Date: Jan 2020 - Present
Description:
Led a cross-functional team of 5 engineers
Developed search features used by 1M+ daily users
Improved performance by 40% through optimization
```

### Education:
```
School: Stanford University
Degree: Bachelor of Science in Computer Science
GPA: 3.8
Date: May 2019
Additional: Dean's List, ACM Member, CS Teaching Assistant
```

### Projects:
```
Project: E-Commerce Platform
Date: Summer 2023
Description:
Built full-stack platform with React, Node.js, MongoDB
Integrated Stripe for payments
Deployed on AWS with CI/CD pipeline
```

### Skills:
```
Frontend: React, TypeScript, Tailwind CSS, Next.js
Backend: Node.js, Python, Express, FastAPI
Database: PostgreSQL, MongoDB, Redis
Cloud: AWS, Docker, Kubernetes
Tools: Git, VS Code, Figma
```

---

## 🎯 Tips for Best Results

1. **Be Specific**: Use concrete numbers and metrics
   - ❌ "Improved performance"
   - ✅ "Improved performance by 40%"

2. **Use Action Verbs**: Led, Built, Designed, Implemented
   - ❌ "Was responsible for..."
   - ✅ "Led a team of 5 engineers..."

3. **One Bullet Per Line**: Press Enter after each point
   ```
   Led development of search feature
   Mentored 3 junior developers
   Reduced load time by 50%
   ```

4. **Keep It Concise**: 1-2 pages is ideal
   - Profile: 2-3 sentences
   - Each bullet: 1-2 lines
   - Focus on recent/relevant experience

5. **Proofread**: Check for typos and formatting
   - Use spell check
   - Consistent date formats
   - Proper capitalization

---

## 🚀 Workflow Example

```
1. Start Building
   ↓
2. Fill Profile (name, email, summary)
   ↓
3. Add Work Experience
   - Add Company #1 (most recent)
   - Add Company #2
   - Add Company #3
   ↓
4. Add Education
   - Add University #1
   - Add Certifications
   ↓
5. Add Projects (2-3 impressive ones)
   ↓
6. Add Skills (grouped by category)
   ↓
7. Review Preview
   - Check formatting
   - Verify all sections
   - Adjust zoom if needed
   ↓
8. Save Resume (if authenticated)
   ↓
9. Export JSON (backup)
```

---

## 📊 Preview Controls

```
┌────────────────────────────────────┐
│  [-] 75% [+]  │  💾 Save  │ 📥 JSON │
└────────────────────────────────────┘
```

- **[-]**: Zoom out (minimum 50%)
- **[+]**: Zoom in (maximum 120%)
- **💾 Save Resume**: Save to database
- **📥 Export JSON**: Download JSON file

---

## 🎉 You're Ready!

Navigate to `/resume` and click **"Start Building Resume"** to begin creating your professional resume!

**Have fun building! 🚀**
