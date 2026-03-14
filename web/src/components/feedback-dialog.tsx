"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FeedbackType = "feedback" | "prompt";

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("feedback");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!text.trim()) return;
    // TODO: send to backend
    console.log(`[feedback] type=${type}`, text);
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setText("");
      setType("feedback");
    }, 1500);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setText("");
      setType("feedback");
      setSubmitted(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-7 items-center gap-1 bg-screamin-green-800 px-2.5 text-xs font-medium text-white hover:bg-screamin-green-700"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" />
        Feedback
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="border-screamin-green-200 sm:max-w-md">
          {submitted ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <p className="text-lg font-semibold text-screamin-green-900">
                Thanks for your feedback!
              </p>
              <p className="text-sm text-screamin-green-700">
                We appreciate you taking the time.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-screamin-green-900">
                  Send Feedback
                </DialogTitle>
                <DialogDescription className="text-screamin-green-700">
                  Help us improve Luchor. Choose what you'd like to share.
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("feedback")}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium border",
                    type === "feedback"
                      ? "border-screamin-green-800 bg-screamin-green-800 text-white"
                      : "border-screamin-green-200 text-screamin-green-900 hover:bg-screamin-green-50",
                  )}
                >
                  Give Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setType("prompt")}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium border",
                    type === "prompt"
                      ? "border-screamin-green-800 bg-screamin-green-800 text-white"
                      : "border-screamin-green-200 text-screamin-green-900 hover:bg-screamin-green-50",
                  )}
                >
                  Prompt to Fix
                </button>
              </div>

              <Textarea
                placeholder={
                  type === "feedback"
                    ? "What's on your mind? Share feedback, ideas, or issues..."
                    : "Describe the issue and how you'd like it fixed..."
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] border-screamin-green-200 focus-visible:ring-screamin-green-800"
              />

              <DialogFooter>
                <Button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="bg-screamin-green-800 text-white hover:bg-screamin-green-700 disabled:opacity-50"
                >
                  {type === "feedback" ? "Send Feedback" : "Submit Prompt"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
