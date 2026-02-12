import AITutorClient from "@/components/ai-tutor/AITutorClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function AiTutorPage() {
    return (
        <Suspense fallback={null}>
            <AITutorClient />
        </Suspense>
    );
}
