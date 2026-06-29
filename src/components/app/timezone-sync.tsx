"use client";

import { useEffect } from "react";
import { updateUserTimezoneAction } from "@/actions/auth";

export function TimezoneSync() {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) return;
    void updateUserTimezoneAction(timeZone);
  }, []);

  return null;
}
