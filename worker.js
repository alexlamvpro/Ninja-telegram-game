export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Permitir solicitudes del juego
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Responder a solicitudes OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
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

      const result = await env.DB.prepare(`
        SELECT * FROM ahorra
        WHERE "ID de usuario" = ?
      `).bind(userId).first();

      return new Response(
        JSON.stringify({ data: result || null }),
        { headers }
      );
    }

    // GUARDAR PARTIDA
    if (url.pathname === "/save" && request.method === "POST") {
      const body = await request.json();

      const {
        userId,
        coins,
        weapons,
        weaponLevels
      } = body;

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Falta userId" }),
          { status: 400, headers }
        );
      }

      await env.DB.prepare(`
        INSERT INTO ahorra (
          "ID de usuario",
          monedas,
          armas,
          niveles_de_armas,
          actualizado_en
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)

        ON CONFLICT("ID de usuario") DO UPDATE SET
          monedas = excluded.monedas,
          armas = excluded.armas,
          niveles_de_armas = excluded.niveles_de_armas,
          actualizado_en = CURRENT_TIMESTAMP
      `).bind(
        userId,
        coins,
        JSON.stringify(weapons),
        JSON.stringify(weaponLevels)
      ).run();

      return new Response(
        JSON.stringify({ success: true }),
        { headers }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ruta no encontrada" }),
      { status: 404, headers }
    );
  }
};
