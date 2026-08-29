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

    if (url.pathname === "/") {
      return new Response(JSON.stringify({ status: "OK", mensaje: "Servidor activo" }), { headers });
    }

    // CARGAR PARTIDA
    if (url.pathname === "/load" && request.method === "GET") {
      const userId = url.searchParams.get("userId");

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Falta userId" }),
          { status: 400, headers }
        );
      }

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

    // GUARDAR PARTIDA
    if (url.pathname === "/save" && request.method === "POST") {
      try {
        const body = await request.json();
        const { userId, coins, weapons, weaponLevels } = body;

        if (!userId) {
          return new Response(
            JSON.stringify({ error: "Falta userId" }),
            { status: 400, headers }
          );
        }

        await env.DB.prepare(`
          INSERT INTO ahorra (
            id_usuario,
            monedas,
            armas,
            niveles_de_armas,
            actualizado_en
          )
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)

          ON CONFLICT(id_usuario) DO UPDATE SET
            monedas = excluded.monedas,
            armas = excluded.armas,
            niveles_de_armas = excluded.niveles_de_armas,
            actualizado_en = CURRENT_TIMESTAMP
        `).bind(
          userId,
          coins ?? 0,
          JSON.stringify(weapons || []),
          JSON.stringify(weaponLevels || {})
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

    // PERMITIR SERVIR ARCHIVOS ESTÁTICOS DE CLOUDFLARE ASSETS
    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
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
