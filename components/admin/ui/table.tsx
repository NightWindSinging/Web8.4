import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.ComponentProps<"table">) { return <div className="w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm", className)} {...props} /></div>; }
export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) { return <thead className={cn("border-b border-slate-200 bg-slate-50/70", className)} {...props} />; }
export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) { return <tbody className={cn("divide-y divide-slate-100", className)} {...props} />; }
export function TableRow({ className, ...props }: React.ComponentProps<"tr">) { return <tr className={cn("transition-colors hover:bg-slate-50/60", className)} {...props} />; }
export function TableHead({ className, ...props }: React.ComponentProps<"th">) { return <th className={cn("h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-slate-500", className)} {...props} />; }
export function TableCell({ className, ...props }: React.ComponentProps<"td">) { return <td className={cn("p-4 align-middle text-slate-600", className)} {...props} />; }
