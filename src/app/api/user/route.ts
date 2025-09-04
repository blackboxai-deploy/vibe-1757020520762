import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (in production, use a database)
let users: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { username, email } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email: email || '',
      avatar: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a89a3900-eaa9-4dc1-b914-cecaae1409ba.png}`,
      createdAt: new Date().toISOString(),
      totalImages: 0,
      totalLikes: 0,
      bio: ''
    };

    users.push(newUser);

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');

    if (userId) {
      const user = users.find(u => u.id === userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        user
      });
    }

    if (username) {
      const user = users.find(u => u.username === username);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        user
      });
    }

    // Return all users for community features
    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        totalImages: u.totalImages,
        totalLikes: u.totalLikes
      }))
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = ['bio', 'email', 'avatar'];
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        users[userIndex][key] = updates[key];
      }
    });

    users[userIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      user: users[userIndex],
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}