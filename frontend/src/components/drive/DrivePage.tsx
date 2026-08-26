"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Folder,
  File,
  Search,
  MoreVertical,
  Loader2,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { supabase } from "@/lib/supabase";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
  size?: string;
  iconLink?: string;
};
const DriveSkeleton = () => {
  return (
    <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border p-4"
        >
          {/* icon + menu */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          {/* file info */}
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>

          {/* open */}
          <Skeleton className="mt-4 h-3 w-16" />
        </div>
      ))}
    </div>
  );
};
const DrivePage = () => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const providerToken = session?.provider_token;

      console.log("DRIVE PROVIDER TOKEN:", providerToken);

      if (!providerToken) {
        setError("Google provider token not found");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drive/files`, {
        headers: {
          "X-Google-Provider-Token": providerToken,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Drive API error:", response.status, errorText);

        throw new Error(`Drive API error: ${response.status}`);
      }

      const data = await response.json();

      console.log("DRIVE FILES:", data);

      setFiles(data.files ?? []);
    } catch (error) {
      console.error("Drive frontend error:", error);

      setError("Failed to load Google Drive files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return files;
    }

    return files.filter((file) => file.name.toLowerCase().includes(query));
  }, [files, search]);

  const getFileType = (mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.folder") {
      return "Folder";
    }

    if (mimeType === "application/pdf") {
      return "PDF";
    }

    if (mimeType.includes("google-apps.document")) {
      return "Google Docs";
    }

    if (mimeType.includes("google-apps.spreadsheet")) {
      return "Google Sheets";
    }

    if (mimeType.includes("google-apps.presentation")) {
      return "Google Slides";
    }

    return "File";
  };

  const isFolder = (file: DriveFile) => {
    return file.mimeType === "application/vnd.google-apps.folder";
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}

      <div className="flex items-center justify-between border-b p-6">
        <div>
          <h1 className="text-2xl font-semibold">Drive</h1>

          <p className="text-sm text-muted-foreground">
            Your Google Drive files
          </p>
        </div>
      </div>

      {/* Search */}

      <div className="p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search files..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading */}

     {loading && <DriveSkeleton />}

      {/* Error */}

      {!loading && error && (
        <div className="px-6">
          <div className="rounded-lg border p-6 text-center">
            <p className="font-medium">{error}</p>

            <Button variant="outline" className="mt-4" onClick={loadFiles}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* Empty */}

      {!loading && !error && filteredFiles.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <File className="mx-auto h-10 w-10 text-muted-foreground" />

            <p className="mt-3 font-medium">No files found</p>

            {search && (
              <p className="mt-1 text-sm text-muted-foreground">
                Try another search
              </p>
            )}
          </div>
        </div>
      )}

      {/* Files */}

      {!loading && !error && filteredFiles.length > 0 && (
        <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group rounded-lg border p-4 transition hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                {isFolder(file) ? (
                  <Folder className="h-8 w-8" />
                ) : file.iconLink ? (
                  <img src={file.iconLink} alt="" className="h-8 w-8" />
                ) : (
                  <File className="h-8 w-8" />
                )}

                {file.webViewLink ? (
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </a>
                ) : (
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mt-4">
                <p className="truncate font-medium" title={file.name}>
                  {file.name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {getFileType(file.mimeType)}
                </p>

                {file.modifiedTime && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(file.modifiedTime).toLocaleDateString()}
                  </p>
                )}
              </div>

              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Open
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DrivePage;
