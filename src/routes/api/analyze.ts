import { createFileRoute } from "@tanstack/react-router";

const SYSTEM = `You are a world-class AI image prompt engineer. Study the provided image(s) (multiple images are frames from one video) and write the exact prompt that would recreate it in Midjourney, DALL·E, Flux or Stable Diffusion.
Reply in this exact format, no preamble:

PROMPT:
<one rich, comma-separated prompt covering subject, action, setting, composition, camera/lens, lighting, color palette, mood, style, medium and quality tags>

NEGATIVE:
<short negative prompt>

STYLE: <3-5 word style label>
TAGS: <5 comma-separated tags>`;

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });
        let body: { images?: string[]; isVideo?: boolean };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        const images = (body.images ?? []).filter((i) => typeof i === "string" && i.startsWith("data:image/")).slice(0, 4);
        if (!images.length) return Response.json({ error: "Please upload an image or video." }, { status: 400 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            stream: true,
            store: false,
            reasoning: { effort: "low" },
            instructions: SYSTEM,
            input: [
              {
                role: "user",
                content: [
                  { type: "input_text", text: body.isVideo ? "These are frames from a video. Write the prompt to recreate this video scene." : "Write the exact prompt for this image." },
                  ...images.map((image_url) => ({ type: "input_image", image_url })),
                ],
              },
            ],
          }),
          signal: request.signal,
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          let message = "Couldn't analyze this file right now. Please try again shortly.";
          if (upstream.status === 429) message = "Too many requests — please wait a moment and try again.";
          if (upstream.status === 402) message = "AI credits are used up. Please try again later.";
          try { message = JSON.parse(text)?.error?.message || JSON.parse(text)?.message || message; } catch { /* keep */ }
          return Response.json({ error: message }, { status: upstream.status });
        }
        return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
      },
    },
  },
});
