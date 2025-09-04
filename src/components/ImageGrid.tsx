"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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

interface ImageGridProps {
  images: ImageData[];
  showActions?: boolean;
  showCommunityInfo?: boolean;
  onLike?: (imageId: string) => void;
  onTogglePublic?: (imageId: string) => void;
  onDelete?: (imageId: string) => void;
  currentUserId?: string;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  showActions = false,
  showCommunityInfo = false,
  onLike,
  onTogglePublic,
  onDelete,
  currentUserId
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());

  const handleLike = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike && !likedImages.has(imageId)) {
      onLike(imageId);
      setLikedImages(prev => new Set(prev).add(imageId));
    }
  };

  const handleTogglePublic = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTogglePublic) {
      onTogglePublic(imageId);
    }
  };

  const handleDelete = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this image?')) {
      onDelete(imageId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncatePrompt = (prompt: string, maxLength: number = 60) => {
    return prompt.length > maxLength ? prompt.substring(0, maxLength) + '...' : prompt;
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-blue-200 rounded-lg opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No images yet</h3>
        <p className="text-muted-foreground">
          {showCommunityInfo ? 'No community images to display' : 'Generated images will appear here'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <Card 
            key={image.id} 
            className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <CardContent className="p-0">
              <Dialog>
                <DialogTrigger asChild>
                  <div onClick={() => setSelectedImage(image)}>
                    <AspectRatio ratio={1}>
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    </AspectRatio>
                  </div>
                </DialogTrigger>
              </Dialog>

              {/* Image Info Overlay */}
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {truncatePrompt(image.prompt)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{formatDate(image.createdAt)}</span>
                  {image.aspectRatio && (
                    <Badge variant="secondary" className="text-xs">
                      {image.aspectRatio}
                    </Badge>
                  )}
                </div>

                {/* Community Info */}
                {showCommunityInfo && (
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-xs text-white font-semibold">
                        {image.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium">{image.username || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-7 px-2 ${likedImages.has(image.id) ? 'text-red-500' : ''}`}
                        onClick={(e) => handleLike(image.id, e)}
                        disabled={likedImages.has(image.id)}
                      >
                        <span className="mr-1">♥</span>
                        {(image.likes || 0) + (likedImages.has(image.id) ? 1 : 0)}
                      </Button>
                    </div>
                  </div>
                )}

                {/* User Actions */}
                {showActions && image.userId === currentUserId && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleTogglePublic(image.id, e)}
                      className="flex-1 h-8 text-xs"
                    >
                      {image.isPublic ? 'Make Private' : 'Share Public'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => handleDelete(image.id, e)}
                      className="h-8 px-3 text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Generated Image</h3>
                <p className="text-muted-foreground">{selectedImage.prompt}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Created: {formatDate(selectedImage.createdAt)}</span>
                  {selectedImage.aspectRatio && (
                    <Badge variant="secondary">{selectedImage.aspectRatio}</Badge>
                  )}
                  {selectedImage.quality && (
                    <Badge variant="outline">{selectedImage.quality}</Badge>
                  )}
                </div>

                {showCommunityInfo && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-sm text-white font-semibold">
                        {selectedImage.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="font-medium">{selectedImage.username || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={(e) => handleLike(selectedImage.id, e)}
                        disabled={likedImages.has(selectedImage.id)}
                        className={likedImages.has(selectedImage.id) ? 'text-red-500' : ''}
                      >
                        <span className="mr-2">♥</span>
                        {((selectedImage.likes || 0) + (likedImages.has(selectedImage.id) ? 1 : 0)).toString()} Likes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ImageGrid;