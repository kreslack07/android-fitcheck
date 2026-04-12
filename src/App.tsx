/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Sparkles, CheckCircle2, AlertCircle, RefreshCcw, Star, Palette, Maximize2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { rateOutfit, type OutfitRating } from "@/src/lib/gemini";

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rating, setRating] = useState<OutfitRating | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      // Stop any existing tracks first
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      toast.error("Could not access camera. Please check permissions and ensure you are on HTTPS.");
      console.error(err);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    // We need to restart the camera with the new facing mode
    setTimeout(startCamera, 100);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setRating(null);
    try {
      const result = await rateOutfit(image, "image/jpeg");
      setRating(result);
      toast.success("Analysis complete!");
    } catch (err) {
      toast.error("Failed to analyze outfit. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setRating(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      <Toaster position="top-center" theme="dark" />
      
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 border-orange-500/50 text-orange-400 px-3 py-1">
              AI Fashion Assistant
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              RORK OUTFIT RATING
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Elevate your style with instant AI-powered feedback. Upload your look and get professional coordination advice.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Upload/Preview */}
          <section className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-0 relative aspect-[3/4] flex items-center justify-center bg-zinc-950">
                <AnimatePresence mode="wait">
                  {!image && !isCameraActive ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-4 p-8 text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        <Upload className="w-8 h-8 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-zinc-300 font-medium">No image selected</p>
                        <p className="text-zinc-500 text-sm">Upload a photo or use your camera</p>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">
                          <Upload className="w-4 h-4 mr-2" /> Upload
                        </Button>
                        <Button onClick={startCamera} variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">
                          <Camera className="w-4 h-4 mr-2" /> Camera
                        </Button>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                      />
                    </motion.div>
                  ) : isCameraActive ? (
                    <motion.div
                      key="camera"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full relative"
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4">
                        <Button onClick={toggleCamera} variant="secondary" size="icon" className="rounded-full bg-zinc-800/80 backdrop-blur-md">
                          <RefreshCcw className="w-5 h-5" />
                        </Button>
                        <Button onClick={capturePhoto} size="lg" className="rounded-full w-16 h-16 bg-white hover:bg-zinc-200 text-black p-0">
                          <div className="w-12 h-12 rounded-full border-2 border-black" />
                        </Button>
                        <Button onClick={stopCamera} variant="destructive" size="icon" className="rounded-full bg-rose-600/80 backdrop-blur-md">
                          <RefreshCcw className="w-5 h-5 rotate-45" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full relative group"
                    >
                      <img src={image!} alt="Outfit preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button onClick={reset} variant="destructive" size="sm">
                          Remove
                        </Button>
                        <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm">
                          Replace
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {image && !isAnalyzing && !rating && (
              <Button
                onClick={handleAnalyze}
                className="w-full h-14 text-lg font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20"
              >
                <Sparkles className="w-5 h-5 mr-2" /> ANALYZE LOOK
              </Button>
            )}

            {isAnalyzing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-400 animate-pulse flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" /> AI is scanning your outfit...
                  </span>
                  <span className="text-zinc-500">Processing Vision</span>
                </div>
                <Progress value={undefined} className="h-1 bg-zinc-800" />
              </div>
            )}
          </section>

          {/* Right Column: Results */}
          <section className="space-y-6">
            <AnimatePresence mode="wait">
              {rating ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Score Card */}
                  <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-3xl font-bold">Overall Rating</CardTitle>
                          <CardDescription className="text-orange-400 font-medium mt-1">
                            {rating.styleCategory} Style
                          </CardDescription>
                        </div>
                        <div className="text-5xl font-black text-orange-500">
                          {rating.overallScore}<span className="text-2xl text-zinc-600">/10</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 gap-4">
                        <ScoreMetric label="Color Coordination" score={rating.colorCoordination} icon={<Palette className="w-4 h-4" />} />
                        <ScoreMetric label="Fit & Silhouette" score={rating.fitAndSilhouette} icon={<Maximize2 className="w-4 h-4" />} />
                        <ScoreMetric label="Versatility" score={rating.versatility} icon={<Layers className="w-4 h-4" />} />
                      </div>
                      
                      <Separator className="bg-zinc-800" />
                      
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center">
                          <Star className="w-4 h-4 mr-2 text-orange-500" /> AI Feedback
                        </h4>
                        <p className="text-zinc-300 leading-relaxed italic">
                          "{rating.feedback}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-zinc-900/30 border-zinc-800">
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-bold text-emerald-400 flex items-center uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> What Works
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <ul className="space-y-2">
                          {rating.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-zinc-400 flex items-start">
                              <span className="mr-2 text-emerald-500/50">•</span> {pro}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-900/30 border-zinc-800">
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-bold text-rose-400 flex items-center uppercase tracking-widest">
                          <AlertCircle className="w-4 h-4 mr-2" /> Room for Growth
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <ul className="space-y-2">
                          {rating.cons.map((con, i) => (
                            <li key={i} className="text-sm text-zinc-400 flex items-start">
                              <span className="mr-2 text-rose-500/50">•</span> {con}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Suggestions */}
                  <Card className="bg-orange-500/5 border-orange-500/20">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-orange-400">Pro Style Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[120px]">
                        <div className="space-y-3">
                          {rating.suggestions.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold shrink-0">
                                {i + 1}
                              </div>
                              <p className="text-sm text-zinc-300">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Button onClick={reset} variant="outline" className="w-full border-zinc-800 hover:bg-zinc-900">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Rate Another Outfit
                  </Button>
                </motion.div>
              ) : !isAnalyzing ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-zinc-800 rounded-3xl"
                >
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-zinc-700" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ready for Analysis</h3>
                  <p className="text-zinc-500 text-sm max-w-xs">
                    Upload a full-body photo to get detailed feedback on your style, fit, and coordination.
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-zinc-900 py-12 px-6 text-center">
        <p className="text-zinc-600 text-sm">
          Powered by Gemini 2.0 Flash • Designed for Style Enthusiasts
        </p>
      </footer>
    </div>
  );
}

function ScoreMetric({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-zinc-400 flex items-center gap-2">
          {icon} {label}
        </span>
        <span className="font-bold text-zinc-200">{score}/10</span>
      </div>
      <Progress value={score * 10} className="h-1.5 bg-zinc-800" />
    </div>
  );
}
