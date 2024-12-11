import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
}

interface UseTransactionFilesOptions {
  transactionId: number;
  onSuccess?: (file: UploadedFile) => void;
}

export function useTransactionFiles({
  transactionId,
  onSuccess,
}: UseTransactionFilesOptions) {
  const queryClient = useQueryClient();

  const { mutateAsync: uploadFile, isPending: isUploading } = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadedFiles: string[] = [];

      console.log("uploading files", files);

      for (const file of files) {
        const formData = new FormData();
        console.log("uploading file", file);
        formData.append("file", file);

        const response = await fetch(
          `/api/transactions/${transactionId}/documents`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          console.log("response failed", await response.json());
          const error = await response.json();
          throw new Error(error.error || "Failed to upload file");
        }

        console.log("response ok");
        const data = await response.json();
        uploadedFiles.push(data.file.url);
        onSuccess?.(data.file);
      }

      return uploadedFiles;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionId],
      });
    },
  });

  const { mutateAsync: deleteFile, isPending: isDeleting } = useMutation({
    mutationFn: async (path: string) => {
      const response = await fetch(
        `/api/transactions/${transactionId}/documents`,
        {
          method: "DELETE",
          body: JSON.stringify({ path }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete file");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionId],
      });
    },
  });

  const { mutateAsync: getSignedUrl, isPending: isGettingUrl } = useMutation({
    mutationFn: async (path: string) => {
      const response = await fetch(
        `/api/transactions/${transactionId}/documents/${encodeURIComponent(path)}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get signed URL");
      }

      const data = await response.json();
      return data.url as string;
    },
  });

  return {
    uploadFile,
    deleteFile,
    getSignedUrl,
    isUploading,
    isDeleting,
    isGettingUrl,
  };
}
