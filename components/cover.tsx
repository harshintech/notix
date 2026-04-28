"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { ImageIcon, X } from "lucide-react";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useEdgeStore } from "@/lib/edgestore";
import { Skeleton } from "./ui/skeleton";

interface CoverImageProps {
  url?: string;
  preview: boolean;
}

const Cover = ({ url, preview }: CoverImageProps) => {
  const params = useParams();
  const { edgestore } = useEdgeStore();
  const coverImage = useCoverImage();
  const removeCoverImage = useMutation(api.documents.removeCoverImage);

  const [position, setPosition] = React.useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = React.useState(false);

  const startRef = React.useRef({ x: 0, y: 0 });
  const initialRef = React.useRef({ x: 50, y: 50 });
  const holdTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // 🔥 REMOVE IMAGE
  const onRemove = async () => {
    if (url) {
      await edgestore.publicImages.delete({ url });
    }
    removeCoverImage({
      id: params.documentId as Id<"documents">,
    });
  };

  // 🔥 POINTER DOWN (hold start)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    holdTimeout.current = setTimeout(() => {
      setIsDragging(true);
      startRef.current = { x: e.clientX, y: e.clientY };
      initialRef.current = position;
    }, 150);
  };

  // 🔥 POINTER UP / LEAVE
  const stopDragging = () => {
    setIsDragging(false);
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
  };

  // 🔥 POINTER MOVE
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // if (preview) return;
    if (!isDragging) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    const rect = e.currentTarget.getBoundingClientRect();

    const percentX = (dx / rect.width) * 100;
    const percentY = (dy / rect.height) * 100;

    setPosition({
      x: Math.max(0, Math.min(100, initialRef.current.x - percentX)),
      y: Math.max(0, Math.min(100, initialRef.current.y - percentY)),
    });
  };

  return (
    <div
      className={cn(
        "relative w-full h-[45vh] group overflow-hidden touch-none select-none hold:cursor-grab active:cursor-grabbing",
        !url && "h-[12vh]",
        url && "bg-muted",
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
      onPointerMove={handlePointerMove}
    >
      {!!url && (
        <Image
          src={url}
          fill
          draggable={false}
          alt="Cover"
          className="object-cover transition-none"
          style={{
            objectPosition: `${position.x}% ${position.y}%`,
          }}
        />
      )}

      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={() => coverImage.onReplace(url)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>

          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cover;

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="w-full h-[12vh]" />;
};
