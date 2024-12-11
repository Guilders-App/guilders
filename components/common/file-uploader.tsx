"use client";

import { Loader2, Upload, X } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from "react-dropzone";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useControllableState } from "@/lib/hooks/useControllableState";
import { cn, formatBytes } from "@/lib/utils";

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @type (files: File[]) => void
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps["accept"];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps["maxSize"];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFileCount={4}
   */
  maxFileCount?: DropzoneProps["maxFiles"];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;

  /**
   * Existing documents to display
   * @type string[] | undefined
   * @default undefined
   * @example existingDocuments={["path/to/doc1.pdf", "path/to/doc2.jpg"]}
   */
  existingDocuments?: string[];

  /**
   * Callback when an existing document is removed
   * @type (path: string) => void
   * @default undefined
   */
  onRemoveExisting?: (path: string) => Promise<void>;

  /**
   * Callback when a file is viewed
   * @type (path: string) => Promise<string>
   * @default undefined
   */
  onView?: (path: string) => Promise<string>;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = {
      "image/*": [],
    },
    maxSize = 1024 * 1024 * 2,
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    existingDocuments = [],
    onRemoveExisting,
    onView,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const [localDocuments, setLocalDocuments] =
    useState<string[]>(existingDocuments);

  useEffect(() => {
    setLocalDocuments(existingDocuments);
  }, [existingDocuments]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time");
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(`Cannot upload more than ${maxFileCount} files`);
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`File ${file.name} was rejected`);
        });
      }

      if (
        onUpload &&
        updatedFiles.length > 0 &&
        updatedFiles.length <= maxFileCount
      ) {
        const target =
          updatedFiles.length > 0 ? `${updatedFiles.length} files` : `file`;

        toast.promise(onUpload(updatedFiles), {
          loading: `Uploading ${target}...`,
          success: () => `${target} uploaded`,
          error: `Failed to upload ${target}`,
        });
      }
    },
    [files, maxFileCount, multiple, onUpload, setFiles]
  );

  async function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  async function handleRemoveExisting(path: string) {
    if (!onRemoveExisting) return;

    try {
      await onRemoveExisting(path);
      setLocalDocuments((prev) => prev.filter((doc) => doc !== path));
    } catch (error) {
      toast.error("Failed to remove file");
      throw error;
    }
  }

  const isDisabled =
    disabled || (files?.length ?? 0 + localDocuments.length) >= maxFileCount;

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFileCount - localDocuments.length}
        multiple={maxFileCount > 1 || multiple}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isDragActive && "border-muted-foreground/50",
              isDisabled && "pointer-events-none opacity-60",
              className
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="font-medium text-muted-foreground">
                  Drop the files here
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col gap-px">
                  <p className="font-medium text-muted-foreground">
                    Drag and drop files here, or click to select files
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    You can upload
                    {maxFileCount > 1
                      ? ` ${maxFileCount === Infinity ? "multiple" : maxFileCount}
                      files (up to ${formatBytes(maxSize)} each)`
                      : ` a file with ${formatBytes(maxSize)}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>
      {((files?.length ?? 0) > 0 || localDocuments.length > 0) && (
        <ScrollArea className="h-fit w-full px-3">
          <div className="flex max-h-48 flex-col gap-4">
            {localDocuments.map((path, index) => (
              <FileCard
                key={`existing-${index}`}
                file={{
                  name: path.split("/").pop() || path,
                  size: 0,
                  type: path.toLowerCase().endsWith(".pdf")
                    ? "application/pdf"
                    : "image/*",
                }}
                path={path}
                onRemove={async () => handleRemoveExisting(path)}
                onView={onView}
              />
            ))}
            {files?.map((file, index) => (
              <FileCard
                key={`new-${index}`}
                file={file}
                onRemove={() => onRemove(index)}
                progress={progresses?.[file.name]}
                onView={onView}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

interface FileCardProps {
  file: File | { name: string; size: number; type: string };
  path?: string;
  onRemove: () => Promise<void>;
  onView?: (path: string) => Promise<string>;
  progress?: number;
}

function FileCard({ file, path, progress, onRemove, onView }: FileCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleView = async () => {
    if (!path || !onView) return;

    setIsLoading(true);
    try {
      const url = await onView(path);
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to open document");
      console.error("Error opening document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove();
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Failed to remove file");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2.5">
      <div className="flex flex-1 gap-2.5">
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-px">
            <p className="line-clamp-1 text-sm font-medium text-foreground/80">
              {file.name}
            </p>
            {"size" in file && file.size > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </p>
            )}
          </div>
          {progress ? <Progress value={progress} /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {path && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/90"
            disabled={isLoading}
            onClick={handleView}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "View"
            )}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7"
          onClick={handleRemove}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <X className="size-4" />
          )}
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    </div>
  );
}
