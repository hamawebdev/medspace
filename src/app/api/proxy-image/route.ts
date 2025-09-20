// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Missing image URL', { status: 400 });
    }

    // Only proxy images from our API domain
    if (!imageUrl.includes('med-cortex.com/api/v1/media/')) {
      return new NextResponse('Invalid image URL', { status: 400 });
    }

    // Get auth token from multiple sources
    let authToken = null;

    // 1. Try from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
    }

    // 2. Try from custom header (sent by frontend)
    if (!authToken) {
      authToken = request.headers.get('x-auth-token');
    }

    // 3. Try from cookies (if available)
    if (!authToken) {
      try {
        const cookieStore = cookies();
        authToken = cookieStore.get('auth_token')?.value;
      } catch (e) {
        // Cookies might not be available in all contexts
      }
    }



    // Prepare headers for the upstream request
    const headers: HeadersInit = {
      'Accept': 'image/*',
      'User-Agent': 'MedSpace-Web-Client/1.0',
      'X-Client-Version': '1.0.0',
      'X-Requested-With': 'XMLHttpRequest',
    };

    // Add authorization if we have a token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Fetch the image from the API
    const response = await fetch(imageUrl, {
      headers,
      method: 'GET',
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return new NextResponse(`Failed to fetch image: ${response.status} ${response.statusText}`, {
        status: response.status
      });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Auth-Token',
      },
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
