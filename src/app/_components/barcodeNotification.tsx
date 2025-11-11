"use client";
import { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

interface BarcodeNotificationProps {
  message: string | null;
  type: "error" | "success" | null;
  onClose: () => void;
}

export default function BarcodeNotification({
  message,
  type,
  onClose,
}: BarcodeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 500); // Wait for fade out animation
      }, 4000); // Show for 4 seconds

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message || !type || !isVisible) return null;

  const isError = type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <>
      {/* Backdrop shadow overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] transition-opacity duration-500 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsVisible(false);
            onClose();
          }, 500);
        }}
      />
      
      {/* Notification */}
      <div
        className={`fixed top-1/2 left-1/2 z-[10000] transition-all duration-500 ease-out ${
          isExiting
            ? "opacity-0 scale-95"
            : "opacity-100 scale-100"
        }`}
        style={{
          transform: isExiting
            ? "translate(-50%, -50%) scale(0.95)"
            : "translate(-50%, -50%) scale(1)",
        }}
      >
        <div
          className="bg-white border border-gray-200 text-black px-8 py-8 rounded-2xl shadow-2xl min-w-[500px] max-w-[90vw] flex items-center gap-4"
          style={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
        {/* Icon */}
        <div className="flex-shrink-0 text-gray-900">
          <Icon size={32} strokeWidth={2.5} />
        </div>

        {/* Message */}
        <div className="flex-1 text-xl font-semibold leading-relaxed text-gray-900">
          {message}
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose();
            }, 500);
          }}
          className="flex-shrink-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors p-1 rounded-full"
          aria-label="Close notification"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
    </>
  );
}

