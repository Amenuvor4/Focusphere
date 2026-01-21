import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const TypeWriter = ({ content, speed = 15, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [content, speed, onComplete, isComplete]);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-gray-900 dark:prose-strong:text-white">
      <ReactMarkdown>{displayedContent}</ReactMarkdown>
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-blue-600 dark:bg-blue-400 ml-0.5 animate-pulse" />
      )}
    </div>
  );
};

export default TypeWriter;
