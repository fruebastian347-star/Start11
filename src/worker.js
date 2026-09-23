export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // START11 Veo resolver
    if (url.pathname === "/api/veo/resolve") {
      if (request.method !== "GET") {
        return jsonResponse(
          { error: "Method not allowed" },
          405
        );
      }

      const match = (url.searchParams.get("match") || "").trim();

      // Accepter kun et Veo match-slug.
      // Workeren må ikke kunne bruges som en vilkårlig proxy.
      if (!match || !/^[A-Za-z0-9_-]+$/.test(match)) {
        return jsonResponse(
          { error: "Invalid Veo match" },
          400
        );
      }

      const veoUrl =
        `https://app.veo.co/api/app/matches/${encodeURIComponent(match)}/videos`;

      try {
        const response = await fetch(veoUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          return jsonResponse(
            {
              error: "Veo request failed",
              status: response.status
            },
            response.status
          );
        }

        const data = await response.json();

        return jsonResponse(data, 200);
      } catch (error) {
        return jsonResponse(
          {
            error: "Could not contact Veo",
            message: String(error?.message || error)
          },
          502
        );
      }
    }

    // Alt andet er START11s normale statiske hjemmeside.
    return env.ASSETS.fetch(request);
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    }
  });
}