"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../../../providers/cartContext";

interface IdleRedirectProps {
  timeout?: number; // Timeout duration in milliseconds
  redirectPath?: string;
  excludePaths?: string[];
  dialogOpen?: boolean; // Added dialogOpen prop
}

const IdleRedirect = ({
  timeout = 30000, // Default to 30000 if not provided
  redirectPath = "/",
  excludePaths = [],
  dialogOpen = false, // Default to false if not provided
}: IdleRedirectProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { cartItems, setCartItems } = useCart();

  const resetTimer = () => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Set the new timeout based on the passed timeout prop
    timerRef.current = setTimeout(() => {
      if (pathname !== redirectPath && !excludePaths.includes(pathname)) {
        setCartItems([]); // Clear the cart
        localStorage.removeItem("cart"); // Clear cart in localStorage
        router.push(redirectPath); // Redirect to the provided path
      }
    }, timeout);
  };

  useEffect(() => {
    // Don't trigger timeout if dialog is open
    if (dialogOpen) {
      return; // Do not reset the timer when the dialog is open
    }

    // Add event listeners to reset the timer on activity
    const events = ["click", "mousemove", "keydown", "touchstart"];
    const handleActivity = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Reset the timer when the component mounts or when the timeout changes
    resetTimer();

    return () => {
      // Cleanup event listeners when the component unmounts or re-renders
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [timeout, dialogOpen, pathname, excludePaths, router, setCartItems]);

  return null; // This component does not render anything
};

export default IdleRedirect;
