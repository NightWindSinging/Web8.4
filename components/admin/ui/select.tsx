import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn("flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100", className)} {...props} />;
}
