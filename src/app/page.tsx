"use client";

import React, { useState, useEffect } from 'react';
import PromptInput from '@/components/PromptInput';
import ImageGrid from '@/components/ImageGrid';
import UserProfileCard from '@/components/UserProfileCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ImageData {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
  likes?: number;
  isPublic?: boolean;
  aspectRatio?: string;
  quality?: string;
  userId?: string;
  username?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  totalImages: number;
  totalLikes: number;
  createdAt: string;
}

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userImages, setUserImages] = useState<ImageData[]>([]);
  const [communityImages, setCommunityImages] = useState<ImageData[]>([]);
  const [generatedImage, setGeneratedImage] = useState<ImageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    }
    
    // Load community images
    fetchCommunityImages();
  }, []);

  // Load user images when user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserImages();
    }
  }, [currentUser]);

  const fetchUserImages = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/images?userId=${currentUser.id}&type=user`);
      const data = await response.json();
      if (data.success) {
        setUserImages(data.images);
      }
    } catch (error) {
      console.error('Error fetching user images:', error);
    }
  };

  const fetchCommunityImages = async () => {
    try {
      const response = await fetch('/api/images?type=community');
      const data = await response.json();
      if (data.success) {
        setCommunityImages(data.images);
      }
    } catch (error) {
      console.error('Error fetching community images:', error);
    }
  };

  const handleGenerate = async (data: { prompt: string; aspectRatio: string; quality: string }) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: data.prompt,
          aspectRatio: data.aspectRatio,
          quality: data.quality,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed');
      }

      if (result.success && result.image) {
        const imageData = {
          ...result.image,
          userId: currentUser?.id || 'anonymous',
          username: currentUser?.username || 'Anonymous'
        };
        
        setGeneratedImage(imageData);

        // Save to user's collection if they have a profile
        if (currentUser) {
          await fetch('/api/images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(imageData),
          });
          
          // Refresh user images
          await fetchUserImages();
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateUser = async (userData: { username: string; email: string }) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentUser(result.user);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
      } else {
        setError(result.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Create user error:', error);
      setError('Failed to create profile');
    }
  };

  const handleUpdateUser = async (updates: Partial<User>) => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          updates,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentUser(result.user);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const handleImageAction = async (imageId: string, action: string) => {
    try {
      const response = await fetch('/api/images', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          action,
          userId: currentUser?.id,
        }),
      });

      if (response.ok) {
        // Refresh both user and community images
        await fetchUserImages();
        await fetchCommunityImages();
      }
    } catch (error) {
      console.error('Image action error:', error);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images?imageId=${imageId}&userId=${currentUser?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUserImages();
        await fetchCommunityImages();
      }
    } catch (error) {
      console.error('Delete image error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Image Generator
              </h1>
              <p className="text-muted-foreground text-sm">Create stunning images with AI</p>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="flex items-center space-x-2">
                  <img
                    src={currentUser.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/877fbbc9-8b2a-4a40-853d-175e275852f6.png
                        currentUser.username.charAt(0).toUpperCase()
                      )}`;
                    }}
                  />
                  <span className="text-sm font-medium">{currentUser.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - User Profile */}
          <div className="lg:col-span-1">
            <UserProfileCard
              user={currentUser}
              isEditing={true}
              onCreateUser={handleCreateUser}
              onSave={handleUpdateUser}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section - Prominent Prompt Input */}
            <section className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tight">
                  Create Amazing Images with AI
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Describe your vision and watch it come to life with cutting-edge AI technology
                </p>
              </div>

              <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />

              {/* Error Display */}
              {error && (
                <Card className="border-destructive bg-destructive/5">
                  <CardContent className="pt-6">
                    <p className="text-destructive text-center">{error}</p>
                  </CardContent>
                </Card>
              )}

              {/* Generated Image Preview */}
              {generatedImage && (
                <Card className="mx-auto max-w-2xl">
                  <CardHeader>
                    <CardTitle>Your Generated Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <img
                        src={generatedImage.url}
                        alt={generatedImage.prompt}
                        className="w-full rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground text-left">
                        <strong>Prompt:</strong> {generatedImage.prompt}
                      </p>
                      {currentUser && (
                        <Button
                          onClick={() => handleImageAction(generatedImage.id, 'togglePublic')}
                          variant="outline"
                          className="w-full"
                        >
                          {generatedImage.isPublic ? 'Make Private' : 'Share with Community'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            <Separator />

            {/* Image Galleries */}
            <section>
              <Tabs defaultValue="community" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="community">Community Gallery</TabsTrigger>
                  <TabsTrigger value="my-images" disabled={!currentUser}>
                    My Images {currentUser ? `(${userImages.length})` : ''}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="community" className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Community Creations</h3>
                    <p className="text-muted-foreground">
                      Discover amazing images created by our community
                    </p>
                  </div>
                  <ImageGrid
                    images={communityImages}
                    showCommunityInfo={true}
                    onLike={(imageId) => handleImageAction(imageId, 'like')}
                  />
                </TabsContent>

                <TabsContent value="my-images" className="space-y-6">
                  {currentUser ? (
                    <>
                      <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2">Your Gallery</h3>
                        <p className="text-muted-foreground">
                          Manage and share your generated images
                        </p>
                      </div>
                      <ImageGrid
                        images={userImages}
                        showActions={true}
                        currentUserId={currentUser.id}
                        onTogglePublic={(imageId) => handleImageAction(imageId, 'togglePublic')}
                        onDelete={handleDeleteImage}
                      />
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        Create a profile to save your images
                      </h3>
                      <p className="text-muted-foreground">
                        Sign up to keep track of your creations and share them with the community
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 AI Image Generator. Create, Share, Inspire.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}