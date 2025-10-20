import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAuth } from "@/lib/auth-utils";

// List all component files
export const GET = requireAuth(async () => {
  try {
    const componentsDir = path.join(process.cwd(), "app", "components");
    
    // Read all files in the components directory
    const files = await fs.readdir(componentsDir);
    const componentFiles = files.filter(
      (file) => file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".jsx") || file.endsWith(".js")
    );

    const filesWithContent = await Promise.all(
      componentFiles.map(async (file) => {
        const filePath = path.join(componentsDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: `app/components/${file}`,
          size: stats.size,
          modified: stats.mtime,
        };
      })
    );

    return NextResponse.json({
      success: true,
      files: filesWithContent,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error listing component files:", error);
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list component files",
      },
      { status: 500 }
    );
  }
});

// Get file content or save file
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { filePath, action } = body;

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: "File path is required" },
        { status: 400 }
      );
    }

    // Security check: ensure the file is within app/components
    if (!filePath.startsWith("app/components/")) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 403 }
      );
    }

    const fullPath = path.join(process.cwd(), filePath);
    const componentsDir = path.join(process.cwd(), "app", "components");
    
    // Additional security: ensure resolved path is within components directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedComponentsDir = path.resolve(componentsDir);
    
    if (!resolvedPath.startsWith(resolvedComponentsDir)) {
      return NextResponse.json(
        { success: false, error: "Invalid file path - path traversal detected" },
        { status: 403 }
      );
    }

    if (action === "read") {
      // Read file content
      const content = await fs.readFile(fullPath, "utf-8");
      return NextResponse.json({
        success: true,
        content,
        filePath,
      });
    } else if (action === "write") {
      // Write file content
      const { content } = body;
      if (content === undefined) {
        return NextResponse.json(
          { success: false, error: "Content is required for write action" },
          { status: 400 }
        );
      }
      
      await fs.writeFile(fullPath, content, "utf-8");
      return NextResponse.json({
        success: true,
        message: "File saved successfully",
        filePath,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error in code editor API:", error);
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Operation failed",
      },
      { status: 500 }
    );
  }
});
