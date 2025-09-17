import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Label } from "./label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
interface ImageDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}
export const ImageDropzone = ({
  value,
  onChange,
  label = "Foto de Perfil",
  className,
  disabled = false
}: ImageDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
  const generateFileName = (originalName: string) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase();
    return `${timestamp}_${randomString}.${extension}`;
  };
  const uploadFile = async (file: File) => {
    if (!acceptedFormats.includes(file.type)) {
      toast.error("Formato não suportado. Use JPEG, PNG, WebP ou HEIC");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      toast.error("Arquivo muito grande. Máximo 5MB");
      return;
    }
    setIsUploading(true);
    try {
      // Generate a unique file name
      const fileName = generateFileName(file.name);
      const userId = "temp-user"; // This would be replaced with actual user ID when auth is implemented
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const {
        data,
        error
      } = await supabase.storage.from('profile-images').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (error) {
        throw error;
      }

      // Get public URL
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('profile-images').getPublicUrl(filePath);
      setPreview(publicUrl);
      onChange(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Erro ao enviar imagem: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsUploading(false);
    }
  };
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file) {
      uploadFile(file);
    }
  }, [disabled, isUploading]);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };
  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };
  return <div className={cn("space-y-2", className)}>
      {label}
      
      <div className={cn("relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors", isDragOver && "border-primary bg-primary/5", !isDragOver && "border-muted-foreground/25 hover:border-muted-foreground/50", disabled && "opacity-50 cursor-not-allowed", preview && "border-solid border-border")} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={!preview ? openFileDialog : undefined}>
        <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.heic" onChange={handleFileSelect} className="hidden" disabled={disabled || isUploading} />

        {isUploading && <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Enviando imagem...</p>
          </div>}

        {!isUploading && !preview && <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Clique para selecionar ou arraste uma imagem
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP ou HEIC (máx. 5MB)
              </p>
            </div>
          </div>}

        {!isUploading && preview && <div className="relative">
            <img src={preview} alt="Preview" className="max-w-full max-h-48 mx-auto rounded-lg object-cover" onError={() => {
          setPreview(null);
          toast.error("Erro ao carregar imagem");
        }} />
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button type="button" variant="secondary" size="sm" onClick={e => {
            e.stopPropagation();
            openFileDialog();
          }} disabled={disabled}>
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={e => {
            e.stopPropagation();
            handleRemove();
          }} disabled={disabled}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>}
      </div>

      {preview && !isUploading && <p className="text-xs text-muted-foreground text-center">
          Clique na imagem para alterar ou use os botões para editar/remover
        </p>}
    </div>;
};