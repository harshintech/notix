"use client";

import { useCoverImage } from "@/hooks/use-cover-image";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { SingleImageDropzone } from "../upload/single-image";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { UploaderProvider, type UploadFn } from "../upload/uploader-provider";

export const CoverImageModal = () => {
  const params = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const coverImage = useCoverImage();
  const { edgestore } = useEdgeStore();
  const update = useMutation(api.documents.update);

  const onClose = () => {
    setFile(null);
    setIsSubmitting(false);
    coverImage.onClose();
  };

  const rawId = params.documentId;

  const documentId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : undefined;

  const uploadFn: UploadFn = React.useCallback(
    async ({ file, onProgressChange, signal }) => {
      try {
        setIsSubmitting(true);

        const res = await edgestore.publicImages.upload({
          file,
          options: {
            replaceTargetUrl: coverImage.url,
          },
        });

        // 🚨 VALIDATION (IMPORTANT)
        if (!documentId) {
          throw new Error("Document ID is missing");
        }

        await update({
          id: documentId as Id<"documents">,
          coverImage: res.url,
        });

        onClose();
        return res;
      } catch (error) {
        console.error(error);
        setIsSubmitting(false);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [edgestore, update, documentId, coverImage.url],
  );

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Cover Image
          </DialogTitle>
        </DialogHeader>
        <UploaderProvider uploadFn={uploadFn} autoUpload>
          <SingleImageDropzone
            className="w-full outline-none"
            disabled={isSubmitting}
            width={320}
            height={200}
          />
        </UploaderProvider>
      </DialogContent>
    </Dialog>
  );
};
