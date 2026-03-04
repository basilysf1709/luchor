export const runtime = "nodejs";

export async function POST(req: Request) {
  const agentServiceChatUrl = process.env.AGENT_SERVICE_CHAT_URL;

  if (!agentServiceChatUrl) {
    return Response.json(
      {
        error:
          "AGENT_SERVICE_CHAT_URL is not set. Configure it to the deployed agent chat endpoint.",
      },
      { status: 500 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "application/json";
  const body = await req.text();
  const headers = new Headers({ "content-type": contentType });
  const apiKey = process.env.AGENT_SERVICE_API_KEY;
  if (apiKey) {
    headers.set("authorization", `Bearer ${apiKey}`);
  }

  try {
    const upstream = await fetch(agentServiceChatUrl, {
      method: "POST",
      headers,
      body,
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: upstream.headers,
    });
  } catch (error) {
    console.error("Agent service proxy error:", error);
    return Response.json(
      { error: "Failed to reach agent service." },
      { status: 502 },
    );
  }
}
