import { useMutation } from "@tanstack/react-query";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
}

interface UseAccountFilesOptions {
  accountId: number;
  onSuccess?: (file: UploadedFile) => void;
}

export function useAccountFiles({
  accountId,
  onSuccess,
}: UseAccountFilesOptions) {
  const { mutateAsync: uploadFile, isPending: isUploading } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/accounts/${accountId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }

      const data = await response.json();
      return data.file as UploadedFile;
    },
    onSuccess,
  });

  async function onUpload(files: File[]) {
    for (const file of files) {
      await uploadFile(file);
    }
  }

  return {
    onUpload,
    isUploading,
  };
}
