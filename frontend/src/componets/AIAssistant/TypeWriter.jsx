import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

const TypeWriter = ({ content, speed = 15, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  // Store the initial content to prevent restarts if parent re-renders
  const initialContentRef = useRef(content);
  const onCompleteRef = useRef(onComplete);

  // Update onComplete ref without triggering effect restart
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isComplete) return;

    const targetContent = initialContentRef.current;
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < targetContent.length) {
        setDisplayedContent(targetContent.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [speed, isComplete]); // Removed content and onComplete from deps

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
