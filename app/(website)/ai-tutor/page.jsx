import TestSeriesWrapper from "@/components/ai-tutor/TestSeriesWrapper";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function AiTutorPage() {
  return (
    <Suspense fallback={null}>
      <TestSeriesWrapper />
    </Suspense>
  );
}
