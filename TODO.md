# Refactor UI to Design System - Progress Tracker

## Steps (Approved Plan):

### 1. [x] Update src/index.css
   - Add all JSON colors as CSS vars (convert hex to hsl)
   - Add spacing, radius, shadows vars
   - Import fonts (Playfair Display, Inter)
   - Add layout/animation vars

### 2. [x] Update tailwind.config.ts
   - Extend theme.colors with JSON palette
   - Add spacing scale from JSON
   - Extend borderRadius, boxShadow, fontFamily, fontSize
   - Add grid config

### 3. [x] Update src/components/ui/button.tsx
### 4. [x] Update src/components/ui/card.tsx
### 5. [x] Update src/components/ui/input.tsx

### 6. [x] Refactor src/pages/Index.tsx
   - Hero: use new vars, spacing.section=100px, hero font sizes
   - Cards: new radius/shadow/spacing, grid gap=24px
   - Typography: heading/body fonts, weights
   - Containers: max-w-containerWidth=1200px
   - Hovers/transitions from JSON animation

### 7. [x] Test & Cleanup
   - Restart dev server
   - Check responsive/mobile
   - Ensure no layout breaks

**Current Progress: Starting step 1**

