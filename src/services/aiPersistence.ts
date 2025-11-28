import { SessionModel } from "../model/session";

export async function saveAiResponseIntoSession(userId: string, sessionId: string | null, aiPayload: any) {
    if (!aiPayload) throw new Error("No aiPayload");

    if (sessionId) {
        return SessionModel.findByIdAndUpdate(
            sessionId,
            {
                $push: {
                    messages: { $each: aiPayload.messages || [] },
                    charts: { $each: aiPayload.charts || [] },
                },
                $set: { metrics: aiPayload.metrics || {}, updatedAt: new Date() },
            },
            { new: true }
        );
    } else {
        const s = await SessionModel.create({
            user_id: userId,
            title: aiPayload.title || "AI analysis",
            messages: aiPayload.messages || [],
            charts: aiPayload.charts || [],
            metrics: aiPayload.metrics || {},
        });

        return s;
    }
}
