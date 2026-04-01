import { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
  onImageSelected: (file: File | string) => void;
  isAnalyzing: boolean;
}

export function UploadZone({ onImageSelected, isAnalyzing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
      setIsCameraOpen(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraOpen, startCamera, stopCamera]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            onImageSelected(file);
            setIsCameraOpen(false);
          }
        }, 'image/jpeg');
      }
    }
  }, [onImageSelected]);

  const optimizeImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG).",
        variant: "destructive",
      });
      return;
    }
    
    // Pass the original file directly
    onImageSelected(file);
  }, [onImageSelected, toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  if (isCameraOpen) {
    return (
      <div className="relative rounded-3xl overflow-hidden bg-black aspect-video flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute bottom-6 flex items-center gap-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
            onClick={() => setIsCameraOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            variant="default"
            size="icon"
            className="rounded-full h-16 w-16 border-4 border-white/30 bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all"
            onClick={capturePhoto}
          >
            <div className="w-12 h-12 rounded-full border-2 border-primary" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
            onClick={startCamera}
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        relative group
        border-2 border-dashed rounded-3xl p-10
        flex flex-col items-center justify-center gap-6
        transition-all duration-300 ease-out
        ${isDragging
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50'
        }
      `}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={isAnalyzing}
      />

      <div className="flex gap-4 relative z-20">
        <div className={`
          w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300
          ${isDragging ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-blue-50 text-blue-500 group-hover:scale-110'}
        `}>
          {isAnalyzing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <Upload className="w-10 h-10" />
          )}
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-display font-semibold text-slate-900">
          {isAnalyzing ? "Analyzing lesion..." : "Upload scan image"}
        </h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Drag and drop here, or tap to browse
        </p>
      </div>

      <div className="relative z-20 flex items-center gap-3 w-full max-w-xs">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-xs text-slate-400 font-medium uppercase">OR</span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      <Button
        variant="outline"
        onClick={() => setIsCameraOpen(true)}
        disabled={isAnalyzing}
        className="relative z-20 gap-2 rounded-full border-slate-200 hover:border-primary hover:text-primary transition-colors"
      >
        <Camera className="w-4 h-4" />
        Use Camera
      </Button>
    </div>
  );
}
