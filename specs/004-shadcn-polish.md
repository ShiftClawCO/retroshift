# Spec 004: UI Polish with shadcn/ui

## Overview
Ensure all components use shadcn/ui for consistent, professional UI.

## Current State
- Some custom Tailwind components
- Basic shadcn/ui setup exists

## Target State
- All UI using shadcn/ui components
- Consistent design language
- Accessible components
- Dark mode support

## Requirements

### 1. Verify shadcn/ui Setup
```bash
npx shadcn-ui@latest init  # If not already done
```

### 2. Add Missing Components
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add separator
```

### 3. Component Audit & Updates

**Header.tsx:**
- Use `DropdownMenu` for user menu
- Use `Avatar` for user image
- Use `Button` variants consistently

**Dashboard page:**
- Use `Card` for retro cards
- Use `Badge` for status indicators
- Use `Skeleton` for loading states

**Create Retro Dialog:**
- Convert to `Dialog` component
- Use `Form` with validation
- Use `Select` for format picker

**Entries/Feedback:**
- Use `Card` for each entry
- Use `Button` variants for vote buttons

**Tables (signups, etc.):**
- Use `Table` component
- Add sorting headers
- Pagination with `Button`

### 4. Toast Notifications

Replace any alert() or console messages with toast:
```typescript
import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast();

toast({
  title: "Retro created!",
  description: "Share the link with your team.",
});
```

Add `<Toaster />` to layout.

### 5. Loading States

Use `Skeleton` for all loading states:
```typescript
import { Skeleton } from "@/components/ui/skeleton";

function RetroCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-[150px]" />
      </CardContent>
    </Card>
  );
}
```

### 6. Empty States

Create consistent empty states:
```typescript
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-center max-w-sm mt-1">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

### 7. Form Validation

Use react-hook-form with shadcn Form:
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  format: z.enum(["start-stop-continue", "mad-sad-glad", "liked-learned-lacked"]),
});
```

### 8. Responsive Design Check

Ensure all pages work on:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

Use shadcn's responsive utilities and test each page.

### 9. Dark Mode

Verify dark mode works everywhere:
- Check contrast ratios
- Verify all custom colors use CSS variables
- Test theme toggle

### 10. Accessibility

- All buttons have aria-labels where needed
- Focus states visible
- Keyboard navigation works
- Screen reader friendly

## Files to Modify
- `src/components/Header.tsx`
- `src/components/RetroCard.tsx` (or create)
- `src/components/CreateRetroDialog.tsx` (or create)
- `src/components/VoteButtons.tsx`
- `src/components/AISummary.tsx`
- `src/app/my-retros/page.tsx`
- `src/app/dashboard/[code]/page.tsx`
- `src/app/pricing/page.tsx`
- `src/app/layout.tsx` (add Toaster)

## Acceptance Criteria
- [ ] All interactive elements use shadcn components
- [ ] Consistent spacing and typography
- [ ] Loading skeletons on all data fetches
- [ ] Toast notifications for user feedback
- [ ] Empty states for no-data scenarios
- [ ] Works on mobile
- [ ] Dark mode fully functional
- [ ] No accessibility warnings
