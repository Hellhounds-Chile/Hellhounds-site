// HellHounds contact API. Secrets belong in Cloudflare, never in this repository.
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") {
      return json({ error: "Ruta no encontrada." }, 404);
    }
    if (request.method !== "POST") {
      return new Response(null, { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } });
    }
    if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) {
      return json({ error: "El formulario aún se está configurando." }, 503);
    }
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
      return json({ error: "Formato de solicitud inválido." }, 415);
    }
    if (Number(request.headers.get("content-length") || 0) > 12000) {
      return json({ error: "El mensaje es demasiado largo." }, 413);
    }
    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) {
      return json({ error: "Origen no autorizado." }, 403);
    }
    let data;
    try {
      const body = await request.text();
      if (body.length > 12000) return json({ error: "El mensaje es demasiado largo." }, 413);
      data = JSON.parse(body);
    } catch {
      return json({ error: "No se pudo leer el formulario." }, 400);
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return json({ error: "Datos inválidos." }, 400);
    }
    const { nombre, correo, tipo, mensaje, token, website } = data;
    if (website) return json({ ok: true });
    if ([nombre, correo, tipo, mensaje, token].some(v => typeof v !== "string")) {
      return json({ error: "Completa todos los campos y la verificación." }, 400);
    }
    const clean = [nombre, correo, tipo, mensaje].map(v => v.trim());
    const [name, email, category, message] = clean;
    const categories = ["Colegio o universidad", "Marca o auspiciador", "Prensa", "Otro"];
    if (name.length < 2 || name.length > 100 ||
        email.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) ||
        !categories.includes(category) || message.length < 10 || message.length > 4000 ||
        token.length < 10 || token.length > 4096) {
      return json({ error: "Revisa los datos ingresados." }, 400);
    }
    let verification;
    try {
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: request.headers.get("CF-Connecting-IP") || undefined })
      });
      verification = await response.json();
    } catch {
      return json({ error: "No se pudo verificar la solicitud. Inténtalo de nuevo." }, 502);
    }
    if (!verification.success || (verification.hostname && verification.hostname !== url.hostname)) {
      return json({ error: "Verificación antispam inválida. Vuelve a intentarlo." }, 403);
    }
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "HellHounds Web <notificaciones@hellhounds.cl>",
          to: ["contacto.hellhounds@gmail.com"],
          reply_to: email,
          subject: `Contacto web: ${category}`,
          text: `Nombre: ${name}\nCorreo: ${email}\nTipo: ${category}\n\n${message}`
        })
      });
      if (!response.ok) {
        console.error("Resend delivery request failed", response.status);
        return json({ error: "No se pudo enviar el mensaje. Inténtalo más tarde." }, 502);
      }
      return json({ ok: true, message: "Tu mensaje fue enviado. Gracias por contactar a HellHounds." });
    } catch {
      return json({ error: "No se pudo enviar el mensaje. Inténtalo más tarde." }, 502);
    }
  }
};
