"use client";

import React from "react";

interface AlertMessageDismissibleProps {
  type: "success" | "error";
  message: string | null;
}

export default function AlertMessageDismissible({
  type,
  message,
}: AlertMessageDismissibleProps) {
  if (!message) return null;
  return (
    <div>
      <p
        className={`alert-dismissible-${
          type === "success" ? "success" : "danger"
        }`}
      >
        {message}
      </p>
    </div>
  );
}
