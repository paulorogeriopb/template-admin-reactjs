"use client";

import React from "react";

interface AlertMessageProps {
  type: "success" | "error";
  message: string | null;
}

export default function AlertMessage({ type, message }: AlertMessageProps) {
  if (!message) return null;
  return (
    <div>
      <p className={`alert-${type === "success" ? "success" : "danger"}`}>
        {message}
      </p>
    </div>
  );
}
