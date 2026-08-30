export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    // 1. CARGAR PARTIDA (/load)
    if (url.pathname === "/load" && request.method === "GET") {
      const rawUserId = url.searchParams.get("userId");

      if (!rawUserId) {
        return new Response(
          JSON.stringify({ error: "Falta userId" }),
          { status: 400, headers }
        );
      }

      const userId = String(rawUserId);

      try {
        const result = await env.DB.prepare(`
          SELECT * FROM ahorra
          WHERE id_usuario = ?
        `).bind(userId).first();

        return new Response(
          JSON.stringify({ data: result || null }),
          { headers }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers }
        );
      }
    }

    // 2. GUARDAR PARTIDA (/save)
    if (url.pathname === "/save" && request.method === "POST") {
      try {
        const body = await request.json();
        const { userId: rawUserId, coins, weapons, weaponLevels, enemyIndex, energy } = body;

        if (!rawUserId) {
          return new Response(
            JSON.stringify({ error: "Falta userId" }),
            { status: 400, headers }
          );
        }

        const userId = String(rawUserId);

        await env.DB.prepare(`
  INSERT INTO ahorra (
    id_usuario,
    monedas,
    armas,
    niveles_de_armas,
    enemigo,
    enemigo_vida,
    energia,
    actualizado_en
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)

  ON CONFLICT(id_usuario) DO UPDATE SET
    monedas = excluded.monedas,
    armas = excluded.armas,
    niveles_de_armas = excluded.niveles_de_armas,
    enemigo = excluded.enemigo,
    enemigo_vida = excluded.enemigo_vida,
    energia = excluded.energia,
    actualizado_en = CURRENT_TIMESTAMP
`)
.bind(
  userId,
  coins ?? 0,
  JSON.stringify(weapons || []),
  JSON.stringify(weaponLevels || {}),
  enemyIndex ?? 0,
  enemyHealth,
  energy ?? 100
).run();
        return new Response(
          JSON.stringify({ success: true }),
          { headers }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers }
        );
      }
    }

    // 3. ARCHIVOS ESTÁTICOS
    if (env.ASSETS) {
      let targetRequest = request;
      
      if (url.pathname === "/") {
        targetRequest = new Request(new URL("/index.html", request.url), request);
      }

      const assetResponse = await env.ASSETS.fetch(targetRequest);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }

    return new Response(
      JSON.stringify({ error: "Ruta no encontrada" }),
      { status: 404, headers }
    );
  }
};
