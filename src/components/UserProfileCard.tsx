"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

interface UserProfileCardProps {
  user: User | null;
  isEditing?: boolean;
  onSave?: (userData: Partial<User>) => void;
  onCreateUser?: (userData: { username: string; email: string }) => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  isEditing = false,
  onSave,
  onCreateUser
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: ''
  });

  const handleSave = () => {
    if (onSave && user) {
      onSave({
        email: formData.email,
        bio: formData.bio
      });
      setEditMode(false);
    }
  };

  const handleCreateUser = () => {
    if (onCreateUser && newUserData.username.trim()) {
      onCreateUser(newUserData);
      setShowCreateDialog(false);
      setNewUserData({ username: '', email: '' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Guest/No User State
  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-2xl font-bold text-white">
            ?
          </div>
          <h3 className="text-xl font-semibold">Welcome, Guest!</h3>
          <p className="text-muted-foreground">Create a profile to save and share your images</p>
        </CardHeader>
        <CardContent>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Create Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Your Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label htmlFor="username" className="text-sm font-medium">
                    Username *
                  </label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium">
                    Email (optional)
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateUser}
                    disabled={!newUserData.username.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Create Profile
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <img
          src={user.avatar}
          alt={`${user.username}'s avatar`}
          className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-gradient-to-br from-purple-400 to-blue-400"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/629fa4b5-899a-441d-a179-51a044403b26.png}`;
          }}
        />
        
        {editMode ? (
          <div className="space-y-3">
            <Input
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="text-center font-semibold"
              disabled
            />
            <Input
              placeholder="Email (optional)"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold">{user.username}</h3>
            {user.email && (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            )}
          </>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-primary">{user.totalImages}</div>
            <div className="text-sm text-muted-foreground">Images</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="text-2xl font-bold text-red-500">{user.totalLikes}</div>
            <div className="text-sm text-muted-foreground">Likes</div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          {editMode ? (
            <Textarea
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="resize-none"
              rows={3}
            />
          ) : (
            <p className="text-sm text-muted-foreground min-h-[60px] p-3 rounded-md bg-muted">
              {user.bio || 'No bio yet. Click edit to add one!'}
            </p>
          )}
        </div>

        {/* Member Since */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Member since:</span>
          <Badge variant="secondary">{formatDate(user.createdAt)}</Badge>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="pt-2">
            {editMode ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      username: user.username,
                      email: user.email,
                      bio: user.bio
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setEditMode(true)}
                variant="outline"
                className="w-full"
              >
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;