"use client";

import { SingleImageDropzone } from "@/components/upload/single-image";
import {
  UploaderProvider,
  type UploadFn,
} from "@/components/upload/uploader-provider";
import { useEdgeStore } from "@/lib/edgestore";
import * as React from "react";
import { Spinner } from "./spinner";

export function SingleImageDropzoneUsage() {
  const { edgestore } = useEdgeStore();

  const [loading, setLoading] = React.useState(false);

  const uploadFn: UploadFn = React.useCallback(
    async ({ file, onProgressChange, signal }) => {
      try {
        setLoading(true); 

        const res = await edgestore.publicImages.upload({
          file,
          signal,
          onProgressChange,
        });

        console.log(res);
        return res;
      } finally {
        setLoading(false); 
      }
    },
    [edgestore],
  );

  return (
    <UploaderProvider uploadFn={uploadFn} autoUpload>
      <div className="relative">
        <SingleImageDropzone
          height={200}
          width={200}
          dropzoneOptions={{
            maxSize: 1024 * 1024 * 1,
          }}
        />

        {/* 🔥 Spinner overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
            <Spinner />
          </div>
        )}
      </div>
    </UploaderProvider>
  );
}
