import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma-client';
import { authenticateAdmin } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/texts - Get all editable texts or filter by component
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const component = searchParams.get('component');
    const lang = searchParams.get('lang') || 'cs';

    const where: any = { lang };
    if (component) {
      where.component = component;
    }

    const texts = await prisma.editableText.findMany({
      where,
      orderBy: [
        { component: 'asc' },
        { textKey: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: texts
    });
  } catch (error) {
    console.error('Error fetching editable texts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch editable texts'
    }, { status: 500 });
  }
}

/**
 * POST /api/texts - Create a new editable text (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { component, textKey, value, lang = 'cs' } = body;

    // Validation
    if (!component || !textKey || !value) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: component, textKey, value'
      }, { status: 400 });
    }

    // Check if text already exists
    const existing = await prisma.editableText.findUnique({
      where: {
        component_textKey_lang: {
          component,
          textKey,
          lang
        }
      }
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Text with this component, textKey and lang already exists'
      }, { status: 400 });
    }

    const text = await prisma.editableText.create({
      data: {
        component,
        textKey,
        value,
        lang
      }
    });

    return NextResponse.json({
      success: true,
      data: text
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating editable text:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create editable text'
    }, { status: 500 });
  }
}

/**
 * PUT /api/texts - Update an editable text (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, value } = body;

    if (!id || !value) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: id, value'
      }, { status: 400 });
    }

    const text = await prisma.editableText.update({
      where: { id },
      data: { value }
    });

    return NextResponse.json({
      success: true,
      data: text
    });
  } catch (error) {
    console.error('Error updating editable text:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update editable text'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/texts - Delete an editable text (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: id'
      }, { status: 400 });
    }

    await prisma.editableText.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Text deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting editable text:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete editable text'
    }, { status: 500 });
  }
}
