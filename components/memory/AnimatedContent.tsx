import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AnimatedContentProps {
  isUrlMode: boolean;
  url: string;
  setUrl: (url: string) => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  tagInput: string;
  setTagInput: (input: string) => void;
  handleTagInput: (input: string) => void;
  handleCreateMemory: () => void;
}

export const AnimatedContent = ({
  isUrlMode,
  url,
  setUrl,
  title,
  setTitle,
  content,
  setContent,
  tagInput,
  setTagInput,
  handleTagInput,
  handleCreateMemory,
}: AnimatedContentProps) => {
  return (
    <AnimatePresence mode="wait">
      {isUrlMode ? (
        <motion.div
          key="url-mode"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="space-y-2 overflow-hidden"
        >
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter article URL"
            type="url"
          />
        </motion.div>
      ) : (
        <motion.div
          key="manual-mode"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="space-y-2 overflow-hidden"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Memory title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your memory..."
              className="w-full h-42 p-2 rounded-md border resize-none"
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === ",") {
                  e.preventDefault();
                  handleTagInput(tagInput);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (tagInput.trim()) {
                    handleTagInput(tagInput);
                  }
                  if (content.trim()) {
                    handleCreateMemory();
                  }
                }
              }}
              onBlur={() => {
                if (tagInput.trim()) handleTagInput(tagInput);
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (pasted.includes(",")) {
                  e.preventDefault();
                  handleTagInput(pasted);
                }
              }}
              placeholder="Type or paste tags (comma-separated)"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
