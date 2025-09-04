"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface PromptInputProps {
  onGenerate: (data: { prompt: string; aspectRatio: string; quality: string }) => void;
  isGenerating: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('standard');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const promptSuggestions = [
    "A serene mountain landscape at golden hour",
    "Futuristic cityscape with neon lights",
    "Adorable robot character in a garden",
    "Abstract geometric art with vibrant colors",
    "Cozy coffee shop interior with warm lighting",
    "Majestic dragon flying over ancient castle"
  ];

  const styleModifiers = [
    "photorealistic",
    "digital art",
    "oil painting",
    "watercolor",
    "minimalist",
    "cyberpunk",
    "fantasy",
    "vintage"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate({ prompt: prompt.trim(), aspectRatio, quality });
    }
  };

  const addSuggestion = (suggestion: string) => {
    if (prompt) {
      setPrompt(prev => prev + ', ' + suggestion);
    } else {
      setPrompt(suggestion);
    }
    textareaRef.current?.focus();
  };

  const addStyleModifier = (modifier: string) => {
    if (!prompt.toLowerCase().includes(modifier.toLowerCase())) {
      if (prompt) {
        setPrompt(prev => prev + ', ' + modifier);
      } else {
        setPrompt(modifier);
      }
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Prompt Input */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10" />
        <div className="relative p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-lg font-semibold text-foreground">
                Describe your image
              </label>
              <Textarea
                ref={textareaRef}
                id="prompt"
                placeholder="Enter a detailed description of the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] text-lg resize-none border-2 focus:border-primary/50 transition-colors"
                disabled={isGenerating}
              />
              <p className="text-sm text-muted-foreground">
                Be specific and descriptive for better results. Current length: {prompt.length} characters
              </p>
            </div>

            {/* Generation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Aspect Ratio</label>
                <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="4:3">Standard (4:3)</SelectItem>
                    <SelectItem value="3:2">Photo (3:2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quality</label>
                <Select value={quality} onValueChange={setQuality} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  type="submit" 
                  className="w-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold"
                  disabled={!prompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Image'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>

      {/* Prompt Suggestions */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Prompt Ideas</h3>
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((suggestion, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
              onClick={() => addSuggestion(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Style Modifiers */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Style Modifiers</h3>
        <div className="flex flex-wrap gap-2">
          {styleModifiers.map((modifier, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
              onClick={() => addStyleModifier(modifier)}
            >
              {modifier}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptInput;