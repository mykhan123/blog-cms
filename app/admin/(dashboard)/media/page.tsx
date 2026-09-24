"use client";

import { ChangeEvent, useEffect, useState } from "react";

type Media = {
  id: string;
  fileName: string;
  url: string;
  publicId: string;
  resourceType: string;
  format: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
};

function formatFileSize(bytes: number | null) {
  if (!bytes) return "-";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadMedia() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/media");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load media");
      }

      setMedia(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Failed to load media"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage("Image uploaded successfully.");

      await loadMedia();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Upload failed"
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/media", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setMessage("Image deleted successfully.");

      setSelectedMedia(null);

      await loadMedia();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Delete failed"
      );
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);

      setMessage("Image URL copied.");
    } catch {
      setError("Failed to copy URL.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Media Library
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Upload and manage images used in your blog.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
          {uploading ? "Uploading..." : "Upload Image"}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          Loading media...
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            No media found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Upload your first image to start building your media library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setSelectedMedia(item)}
                className="block w-full"
              >
                <div className="aspect-video bg-gray-100">
                  <img
                    src={item.url}
                    alt={item.fileName}
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>

              <div className="space-y-3 p-4">
                <div>
                  <p
                    className="truncate text-sm font-semibold text-gray-800"
                    title={item.fileName}
                  >
                    {item.fileName}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {item.width && item.height
                      ? `${item.width} × ${item.height}`
                      : "Unknown dimensions"}{" "}
                    • {formatFileSize(item.size)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(item.url)}
                    className="flex-1 rounded-lg border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Copy URL
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Image Preview
                </h2>

                <p className="text-xs text-gray-500">
                  {selectedMedia.fileName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <div className="overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.fileName}
                  className="max-h-[55vh] w-full object-contain"
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">File</p>
                  <p className="mt-1 break-all text-sm font-medium">
                    {selectedMedia.fileName}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Format</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedMedia.format || "-"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Dimensions</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedMedia.width && selectedMedia.height
                      ? `${selectedMedia.width} × ${selectedMedia.height}`
                      : "-"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Size</p>
                  <p className="mt-1 text-sm font-medium">
                    {formatFileSize(selectedMedia.size)}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 sm:col-span-2">
                  <p className="text-xs text-gray-500">Uploaded By</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedMedia.uploadedBy.name}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => copyUrl(selectedMedia.url)}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Copy Image URL
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}