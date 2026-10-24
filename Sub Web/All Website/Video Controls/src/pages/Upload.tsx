import { Layout } from "@/components/Layout";
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { videoApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "@/data/mockData";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState("");
  const [isShort, setIsShort] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleVideoSelect = (files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    const allowed = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!allowed.includes(file.type)) {
      setError("Invalid video format. Use MP4, WebM, MOV, or AVI.");
      return;
    }
    setVideoFile(file);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    setError("");
  };

  const handleThumbnailSelect = (files: FileList | null) => {
    if (!files?.[0]) return;
    setThumbnailFile(files[0]);
  };

  const handleUpload = async () => {
    if (!videoFile) { setError("Please select a video file"); return; }
    if (!title.trim()) { setError("Please enter a title"); return; }
    if (!user) { setError("Please sign in to upload"); return; }

    setUploading(true);
    setError("");
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("isShort", String(isShort));
      if (tags.trim()) formData.append("tags", JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean)));

      setUploadProgress(30);
      const data = await videoApi.upload(formData);
      setUploadProgress(100);
      setSuccess(true);

      setTimeout(() => navigate(`/watch/${data.video._id}`), 2000);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  if (!user || (user.role !== "creator" && user.role !== "admin")) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">Creator Access Required</h2>
          <p className="text-muted-foreground mt-2 text-center">Sign in as a creator or admin to upload videos.</p>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold">Video Uploaded!</h2>
          <p className="text-muted-foreground mt-2">Your video has been uploaded and stored successfully.</p>
          <p className="text-sm text-muted-foreground mt-1">Redirecting to your video...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center shadow-glow">
            <UploadCloud className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Upload a video</h1>
        </div>
        <p className="text-muted-foreground mb-8">Share your story with millions. Drop your video below to get started.</p>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleVideoSelect(e.dataTransfer.files); }}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center gradient-card transition-smooth ${dragOver ? "border-primary shadow-glow" : "border-border"}`}
          >
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={(e) => handleVideoSelect(e.target.files)}
              className="hidden"
            />

            {videoFile ? (
              <div className="space-y-3">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-bold text-green-400">Video Selected</h3>
                <p className="text-sm text-muted-foreground">{videoFile.name}</p>
                <p className="text-xs text-muted-foreground">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                <Button variant="outline" onClick={() => { setVideoFile(null); if (videoInputRef.current) videoInputRef.current.value = ""; }} className="rounded-full">
                  Change File
                </Button>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full gradient-primary grid place-items-center mx-auto mb-5 shadow-glow animate-pulse-glow">
                  <UploadCloud className="w-9 h-9 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Drag and drop video files</h3>
                <p className="text-muted-foreground text-sm mt-2 mb-5">MP4, MOV, WebM or AVI • Up to 4GB</p>
                <Button onClick={() => videoInputRef.current?.click()} className="gradient-primary border-0 rounded-full font-semibold shadow-glow">
                  Select files
                </Button>
              </>
            )}

            {uploading && (
              <div className="mt-6">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {error && <p className="text-destructive text-sm mt-4">{error}</p>}
            <p className="text-xs text-muted-foreground mt-6">Videos are stored locally on the server and saved to MongoDB database.</p>
          </div>

          <div className="space-y-4 p-6 rounded-2xl gradient-card border border-border">
            <div>
              <label className="text-sm font-semibold mb-2 block">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="" className="bg-background/50" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="" className="bg-background/50 resize-none" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg bg-background/50 border border-input px-3 py-2 text-sm">
                {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Tags (comma-separated)</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="" className="bg-background/50" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Thumbnail</label>
              <input ref={thumbInputRef} type="file" accept="image/*" onChange={(e) => handleThumbnailSelect(e.target.files)} className="hidden" />
              <button
                onClick={() => thumbInputRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary transition-smooth overflow-hidden"
              >
                {thumbnailFile ? (
                  <img src={URL.createObjectURL(thumbnailFile)} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isShort" checked={isShort} onChange={(e) => setIsShort(e.target.checked)} className="rounded" />
              <label htmlFor="isShort" className="text-sm font-medium">This is a Short (vertical video)</label>
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploading || !videoFile}
              className="w-full gradient-primary border-0 rounded-full font-semibold shadow-glow"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : "Publish Video"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
