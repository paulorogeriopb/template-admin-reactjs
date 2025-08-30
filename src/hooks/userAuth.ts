"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  return { authenticated };
}
