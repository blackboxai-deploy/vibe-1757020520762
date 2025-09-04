import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = "1:1", quality = "standard" } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Enhanced prompt with quality and style instructions
    const enhancedPrompt = `${prompt}, high quality, detailed, professional photography, ${quality === "high" ? "ultra-detailed, 8K resolution" : "sharp details"}`;

    // Call Replicate API via custom endpoint
    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'customerId': 'cus_ShmBTC3SL8jglG',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
      },
      body: JSON.stringify({
        model: 'replicate/black-forest-labs/flux-1.1-pro',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error:', errorText);
      return NextResponse.json(
        { error: 'Image generation failed', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract image URL from response
    const imageUrl = data.choices?.[0]?.message?.content;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    // Create image metadata
    const imageData = {
      id: Date.now().toString(),
      url: imageUrl,
      prompt: prompt,
      enhancedPrompt: enhancedPrompt,
      aspectRatio,
      quality,
      createdAt: new Date().toISOString(),
      isPublic: false
    };

    return NextResponse.json({
      success: true,
      image: imageData,
      message: 'Image generated successfully'
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Image generation API',
    endpoints: {
      POST: 'Generate new image with prompt'
    }
  });
}