"use client";

import { HistoryItem } from "../types/history.types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function HistoryList({ data }: { data: HistoryItem[] }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <Card key={item.id} className="space-y-2">
          <p className="text-sm text-slate-300 line-clamp-2">
            {item.text}
          </p>

          <div className="flex justify-between items-center">
            <Badge>{item.prediction}</Badge>
            <span className="text-xs text-slate-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}