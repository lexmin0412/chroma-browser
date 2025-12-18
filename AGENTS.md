# Vector DB Browser

## Why AGENTS.md?

This file is specifically designed for AI coding agents, while README.md targets human users:

- **README.md**: For human users, focusing on quick start, project introduction, and contribution guidelines
- **AGENTS.md**: For automated coding agents, containing build steps, test commands, code standards, and development workflows
- Keep README.md concise, concentrate agent-specific instructions in this file
- Recommended for any project using or building with AI agents to adopt this format

## Project Overview

Chroma Browser is a web-based management interface for Chroma DB vector databases. It provides a user-friendly GUI for managing collections, adding/querying records, and monitoring vector database operations.

**Tech Stack:**

- Frontend: Next.js 16 with React 19 and TypeScript
- UI: Tailwind CSS for styling
- State Management: React hooks and context
- Database: MySQL + Prisma ORM
- Build Tool: Turbopack
- Package Manager: pnpm

## Dev Environment Tips

- **Project Structure:**

  ```
  app/
  ├── api/              # API routes for Chroma operations
  ├── collections/[id]/  # Collection detail pages (拆分后的组件)
  ├── components/        # Shared React components
  ├── utils/            # Utility functions and services
  └── prisma/          # Database schema and migrations
  ```

- **Development Commands:**

  ```bash
  # Install dependencies
  pnpm install

  # Start development server
  pnpm dev

  # Type checking
  pnpm type-check

  # Linting
  pnpm lint

  # Build for production
  pnpm build

  # Database operations
  pnpm db:migrate    # Run database migrations
  pnpm db:studio     # Open Prisma Studio
  ```

- **Component Development:**
  - Components follow functional component pattern with TypeScript interfaces
  - Use `export default` for default exports
  - Place page-specific components in the same directory (e.g., `app/collections/[id]/collection/`)
  - Shared components go to `app/components/`

### Component Directory Standards

#### 1. Directory Hierarchy and Grouping

```
app/
├── collections/           # All reusable UI components
│   ├── components/          # Page-level components
│       ├── query-records/  # Specific business components
├── components/
|   ├── ui/              # shadcn components
|   ├── shared/              # Non-functional components reused across multiple pages, such as custom dropdown options
|   ├── features/              # Functional components reused across multiple pages, such as product cards
```

#### 2. Naming Conventions

- **Directories**: Use kebab-case (e.g., `query-records`)
- **Files**: Use kebab-case (e.g., `add-records.tsx`)

## Testing Instructions

Waiting for completion.

## Code Standards

- **TypeScript:**

  - Strict mode enabled
  - Use interfaces for component props
  - Avoid `any` types
  - Use proper type assertions sparingly

- **React:**

  - Functional components only (no class components)
  - Use React hooks appropriately
  - Follow React best practices for performance
  - Use `React.memo` for expensive components

- **Styling:**

  - Use Tailwind CSS classes
  - Follow component-first approach
  - Use dark mode variants: `dark:`
  - Consistent spacing and color schemes

- **File Naming:**

  - Components: PascalCase (e.g., `AddRecordsTab.tsx`)
  - Utilities: camelCase (e.g., `chromaService.ts`)
  - Hooks: camelCase with `use` prefix (e.g., `useChromaService.ts`)

- **Error Handling:**
  - Use try-catch for async operations
  - Provide user-friendly error messages
  - Log errors for debugging
  - Use consistent error display patterns

## PR Instructions

- **PR Title Format:**

  ```
  [component] brief description
  [feature] add new functionality
  [fix] resolve issue description
  [refactor] improve code organization
  ```

- **Before Submitting:**

  1. Run `pnpm type-check` to ensure no TypeScript errors
  2. Run `pnpm lint` to ensure code quality
  3. Run `pnpm test` to ensure all tests pass
  4. Update documentation if API changes were made
  5. Ensure components are properly exported if new ones were added

- **Commit Messages:**

  ```
  type(scope): description

  Examples:
  feat(query): add vector similarity search
  fix(ui): resolve responsive layout issue
  refactor(components): split large component into smaller pieces
  docs(readme): update installation instructions
  ```

## Security Considerations

- **Input Validation:**

  - Validate all user inputs before processing
  - Sanitize data before database operations
  - Use proper TypeScript typing to prevent runtime errors

- **API Security:**

  - Validate API request parameters
  - Implement proper error responses
  - Rate limiting considerations for production

- **Database Operations:**
  - Validate Chroma DB connection strings
  - Handle database connection errors gracefully
  - Never expose sensitive connection data in client-side code

## Deployment

- **Build Process:**

  ```bash
  # Build for production
  pnpm build

  # Start production server
  pnpm start

  # Static export (if configured)
  pnpm export
  ```

- **Environment Variables:**
  ```env
  NODE_ENV=production
  NEXT_PUBLIC_CHROMA_URL=your-chroma-db-url
  DATABASE_URL=your-database-url
  ```

## Migration Guide

When making significant changes:

- **Database Schema Changes:**

  ```bash
  # Create new migration
  pnpm prisma migrate dev --name <migration_name>

  # Deploy migration to production
  pnpm prisma migrate deploy
  ```

- **Component Refactoring:**
  - Follow the established pattern (see recent refactoring of `query.tsx`)
  - Create focused, single-responsibility components
  - Maintain backward compatibility when possible
  - Update tests accordingly

## FAQ

**Q1: Are there required fields in AGENTS.md?**
A: No, it's just Markdown. Agents will parse by headings and content.

**Q2: How to handle conflicting instructions?**
A: The principle of proximity applies: the AGENTS.md closest to the edited file takes effect; Chat Prompt has the highest priority.

**Q3: Will agents automatically execute test commands listed in AGENTS.md?**
A: Yes - agents will try to execute them and fix any failures encountered.

**Q4: Can this be updated later?**
A: Absolutely! Treat it as living documentation.

**Q5: How to migrate existing documentation?**
A: Rename the old file to AGENTS.md and create a symlink for compatibility if needed:

```bash
mv AGENT.md AGENTS.md && ln -s AGENTS.md AGENT.md
```

**Q6: How to configure in Aider?**

```yaml
# .aider.conf.yml
read: AGENTS.md
```

**Q7: How to configure in Gemini CLI?**

```json
// .gemini/settings.json
{ "contextFileName": "AGENTS.md" }
```

## About

This AGENTS.md follows the standard established by multiple AI coding tools and platforms. It's maintained to provide consistent guidance for automated development across different AI agents and tools.

For more information about the AGENTS.md standard and supported tools, visit: https://agents.md
