"use client";

import { useEffect, useState } from "react";
import { CongregationsClient } from "./congregations-client";

export default function CongregationsPage() {
  const [congregations, setCongregations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/congregations")
      .then((r) => r.json())
      .then((d) => setCongregations(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return <CongregationsClient congregations={congregations} />;
}
