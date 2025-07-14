import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { LinkPreview, LinkPreviewRequest } from "@shared/schema";

interface CacheControlsProps {
  preview: LinkPreview | null;
  onPreviewUpdated: (preview: LinkPreview) => void;
  currentUrl: string;
}

export function CacheControls({ preview, onPreviewUpdated, currentUrl }: CacheControlsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: async (data: LinkPreviewRequest) => {
      const response = await apiRequest('POST', '/api/preview', data);
      return response.json();
    },
    onSuccess: (updatedPreview: LinkPreview) => {
      onPreviewUpdated(updatedPreview);
      toast({
        title: "Preview refreshed!",
        description: "The preview has been updated with the latest content.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Refresh failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    if (!currentUrl) return;
    refreshMutation.mutate({ 
      url: currentUrl, 
      forceRefresh: true 
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!preview) return null;

  const isOld = preview.createdAt && 
    (new Date().getTime() - new Date(preview.createdAt).getTime()) > (24 * 60 * 60 * 1000); // 24 hours

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Cached {getTimeAgo(new Date(preview.createdAt!))}</span>
          </div>
          
          {isOld && (
            <Badge variant="secondary" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              May be outdated
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshMutation.isPending || !currentUrl}
          className="text-gray-500 hover:text-primary"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      {isOld && (
        <div className="mt-2 text-xs text-gray-500">
          This preview is more than 24 hours old. Content may have changed since then.
        </div>
      )}
    </div>
  );
}