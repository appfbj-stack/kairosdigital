"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Camera, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentUrl?: string | null;
  name?: string;
  onChange: (file: File | null) => void;
  uploading?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { wrapper: "w-16 h-16", icon: "w-6 h-6", text: "text-2xl", btn: "w-5 h-5 -bottom-0.5 -right-0.5" },
  md: { wrapper: "w-24 h-24", icon: "w-8 h-8", text: "text-3xl", btn: "w-6 h-6 bottom-0 right-0" },
  lg: { wrapper: "w-32 h-32", icon: "w-10 h-10", text: "text-4xl", btn: "w-7 h-7 bottom-0 right-0" },
};

export function AvatarUpload({
  currentUrl,
  name,
  onChange,
  uploading,
  size = "lg",
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const s = sizeMap[size];

  const displayUrl = preview ?? currentUrl;
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    onChange(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            s.wrapper,
            "rounded-full overflow-hidden border-2 border-border",
            "flex items-center justify-center bg-muted",
            "transition-all hover:border-primary cursor-pointer",
            uploading && "opacity-60 cursor-wait"
          )}
        >
          {displayUrl ? (
            <>
              <img
                src={displayUrl}
                alt={name ?? "Avatar"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <Camera className={cn(s.icon, "text-white")} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              {initials ? (
                <span className={cn(s.text, "font-bold text-muted-foreground")}>{initials}</span>
              ) : (
                <User className={cn(s.icon, "text-muted-foreground")} />
              )}
              <Camera className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-3" />
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>

        {(preview || currentUrl) && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              s.btn,
              "absolute bg-destructive text-destructive-foreground rounded-full p-0.5",
              "hover:opacity-90 transition-opacity shadow-sm"
            )}
          >
            <X className="w-full h-full" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        {uploading ? "Enviando..." : "Clique para adicionar foto · JPG, PNG ou WebP · máx 5MB"}
      </p>
    </div>
  );
}
