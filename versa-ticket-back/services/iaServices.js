
exports.analizarTicket = async (titulo, descripcion) => {
    // El mismo prompt poderoso
    const prompt = `
    Eres un asistente experto de Mesa de Ayuda para el sistema "Versa Ticket".
    Tu trabajo es analizar el título y la descripción de un problema y clasificarlo.
    
    Analiza este ticket:
    TÍTULO: "${titulo}"
    DESCRIPCIÓN: "${descripcion}"

    Reglas de clasificación (Devuelve SOLO un JSON válido, sin texto extra):
    1. "area_id": 1 (Soporte TI), 2 (Mantenimiento), 3 (Recursos Humanos).
    2. "categoria_id": 1 (Hardware), 2 (Software), 3 (Redes), 4 (Mobiliario).
    3. "prioridad_id": 1 (Baja), 2 (Media), 3 (Alta - Usa alta si detectas urgencia, enojo o impacto crítico).
    4. "sentimiento": "Positivo", "Neutral" o "Negativo".

    Ejemplo de respuesta esperada:
    {
      "area_id": 1,
      "categoria_id": 3,
      "prioridad_id": 3,
      "sentimiento": "Negativo"
    }
    `;

    try {
        // Le pegamos directo a la API de Google
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        // Si Google se queja, lo atrapamos aquí para ver qué dice exactamente
        if (!response.ok) {
            console.error("Google rechazó la petición:", data);
            throw new Error(`Google API Error: ${data.error?.message || 'Error desconocido'}`);
        }

        // Navegamos por el JSON que nos devuelve Google para sacar el texto
        const responseText = data.candidates[0].content.parts[0].text;
        
        // Limpiamos la respuesta
        const jsonLimpio = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        return JSON.parse(jsonLimpio);

    } catch (error) {
        console.error("Error detallado en IA:", error);
        throw new Error("No se pudo analizar el ticket con IA");
    }
};