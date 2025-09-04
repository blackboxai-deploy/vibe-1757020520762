import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (in production, use a database)
let userImages: any[] = [];
let communityImages: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const imageData = await request.json();
    
    // Add to user's personal collection
    const newImage = {
      ...imageData,
      id: imageData.id || Date.now().toString(),
      userId: imageData.userId || 'anonymous',
      createdAt: imageData.createdAt || new Date().toISOString(),
      likes: 0,
      isPublic: imageData.isPublic || false
    };

    userImages.push(newImage);
    
    // If marked as public, add to community gallery
    if (newImage.isPublic) {
      communityImages.push(newImage);
    }

    return NextResponse.json({
      success: true,
      image: newImage,
      message: 'Image saved successfully'
    });

  } catch (error) {
    console.error('Save image error:', error);
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'user';
    
    if (type === 'community') {
      // Return public community images, sorted by likes and recent
      const sortedImages = communityImages
        .sort((a, b) => {
          // Sort by likes first, then by creation date
          if (b.likes !== a.likes) {
            return b.likes - a.likes;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
      return NextResponse.json({
        success: true,
        images: sortedImages,
        total: sortedImages.length
      });
    } else {
      // Return user's personal images
      const filteredImages = userImages.filter(img => 
        userId ? img.userId === userId : true
      );
      
      return NextResponse.json({
        success: true,
        images: filteredImages,
        total: filteredImages.length
      });
    }

  } catch (error) {
    console.error('Get images error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { imageId, action, userId } = await request.json();
    
    if (action === 'like') {
      // Find and update image likes
      const imageIndex = communityImages.findIndex(img => img.id === imageId);
      if (imageIndex !== -1) {
        communityImages[imageIndex].likes += 1;
        
        // Also update in userImages if it exists there
        const userImageIndex = userImages.findIndex(img => img.id === imageId);
        if (userImageIndex !== -1) {
          userImages[userImageIndex].likes += 1;
        }
        
        return NextResponse.json({
          success: true,
          likes: communityImages[imageIndex].likes
        });
      }
    } else if (action === 'togglePublic') {
      // Toggle public status
      const imageIndex = userImages.findIndex(img => 
        img.id === imageId && img.userId === userId
      );
      
      if (imageIndex !== -1) {
        userImages[imageIndex].isPublic = !userImages[imageIndex].isPublic;
        
        if (userImages[imageIndex].isPublic) {
          // Add to community gallery
          const existingCommunityIndex = communityImages.findIndex(img => img.id === imageId);
          if (existingCommunityIndex === -1) {
            communityImages.push(userImages[imageIndex]);
          }
        } else {
          // Remove from community gallery
          communityImages = communityImages.filter(img => img.id !== imageId);
        }
        
        return NextResponse.json({
          success: true,
          isPublic: userImages[imageIndex].isPublic
        });
      }
    }

    return NextResponse.json(
      { error: 'Image not found or action not supported' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Update image error:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const userId = searchParams.get('userId');
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Remove from user images
    userImages = userImages.filter(img => 
      !(img.id === imageId && img.userId === userId)
    );
    
    // Remove from community images
    communityImages = communityImages.filter(img => img.id !== imageId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}