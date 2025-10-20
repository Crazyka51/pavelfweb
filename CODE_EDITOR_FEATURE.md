# Code Editor - Feature Summary

## Overview
A new code/text editor has been added to the admin panel, allowing administrators to edit text content directly from component source files.

## What Was Added

### 1. API Endpoint (`/app/api/admin/code-editor/route.ts`)
- **GET**: Lists all component files in `app/components/`
- **POST**: Reads or writes file content
- **Security**: 
  - Authentication required (using `requireAuth`)
  - Path validation to prevent traversal attacks
  - Restricted to `app/components/` directory only

### 2. Admin Component (`/app/admin/components/CodeEditor.tsx`)
- File browser with search functionality
- Text editor with line numbers and character count
- Real-time save status indicator
- Warning banner about careful editing
- Responsive design for all screen sizes

### 3. Integration
- Added "Editor kódu" menu item to admin navigation
- Integrated into existing admin layout
- Uses existing authentication and authorization system

## Security Features

✅ **Authentication**: Only logged-in admins can access
✅ **Path Validation**: Prevents path traversal attacks
✅ **Directory Restriction**: Limited to `app/components/` only
✅ **Authorization**: Uses `authorizedFetch` for all API calls

## Usage Instructions

1. Log in to admin panel
2. Click "Editor kódu" in the sidebar
3. Select a file from the list
4. Edit text content (titles, descriptions, etc.)
5. Click "Uložit" (Save) to save changes

## Important Notes

⚠️ **Warning**: This editor provides direct access to source code files. Users should:
- Only edit text content (strings, titles, descriptions)
- Avoid changing code structure (JSX, functions, imports)
- Be careful as errors can break the website
- Consider making backups before major changes

## Files Modified

1. `app/admin/page.tsx` - Added code-editor section type and render case
2. `app/admin/components/AdminLayout.tsx` - Added code editor menu item
3. `prisma/schema.prisma` - Added SiteContent model (for future use)

## Files Created

1. `app/api/admin/code-editor/route.ts` - API endpoint
2. `app/admin/components/CodeEditor.tsx` - React component
3. `app/admin/CODE_EDITOR.md` - Feature documentation

## Technical Details

- **Frontend**: React with TypeScript
- **Backend**: Next.js API routes
- **File System**: Node.js `fs.promises`
- **Security**: Path validation and authentication
- **UI Components**: Shadcn/ui components (Card, Button, Alert, Input)

## Future Enhancements

Potential improvements for future iterations:
- Syntax highlighting in the editor
- Auto-formatting code
- Git history integration
- Diff view for changes
- Support for multiple directories
- Preview mode before saving
- Undo/redo functionality
- Monaco editor integration

## Security Scan Results

✅ **CodeQL Security Scan**: No vulnerabilities detected
✅ **Code Review**: All security issues addressed
✅ **Authentication**: Properly implemented
✅ **Path Traversal**: Protected against attacks

## Czech/English Translation

| Czech | English |
|-------|---------|
| Editor kódu | Code Editor |
| Komponenty | Components |
| Hledat soubor... | Search file... |
| Vyberte soubor | Select a file |
| Uložit | Save |
| Ukládání... | Saving... |
| Neuložené změny | Unsaved changes |
| Soubor byl úspěšně uložen! | File saved successfully! |

## Support

For issues or questions about this feature, please refer to:
- `/app/admin/CODE_EDITOR.md` - Detailed documentation in Czech
- This README - Technical overview
- Code comments in the implementation files
