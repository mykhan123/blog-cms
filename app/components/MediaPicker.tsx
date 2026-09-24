"use client";

import { useEffect, useState } from "react";

type Media = {
  id: string;
  fileName: string;
  url: string;
  format: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
};

type MediaPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function MediaPicker({
  value,
  onChange,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
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
    if (open) {
      loadMedia();
    }
  }, [open]);

  function selectImage(url: string) {
    onChange(url);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste image URL or select from Media Library"
          className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Media Library
        </button>
      </div>

      {value && (
        <div className="flex max-h-72 items-center justify-center overflow-hidden rounded-xl border bg-gray-100">
          <img
            src={value}
            alt="Cover preview"
            className="max-h-72 w-full object-contain"
          />
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Select Image
                </h2>

                <p className="text-sm text-gray-500">
                  Choose an image from your media library.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="py-10 text-center text-gray-500">
                  Loading media...
                </div>
              ) : error ? (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              ) : media.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  No images available.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {media.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => selectImage(item.url)}
                      className="overflow-hidden rounded-xl border text-left transition hover:border-blue-500 hover:ring-2 hover:ring-blue-100"
                    >
                      <div className="aspect-video bg-gray-100">
                        <img
                          src={item.url}
                          alt={item.fileName}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-3">
                        <p
                          className="truncate text-sm font-medium text-gray-800"
                          title={item.fileName}
                        >
                          {item.fileName}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.width && item.height
                            ? `${item.width} × ${item.height}`
                            : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}