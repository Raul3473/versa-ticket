exports.enviarCorreoTicketCerrado = async (usuario, ticket, transporter) => {
    try {
        console.log("📨 Enviando correo...");
        console.log("Usuario:", usuario.email);
        console.log("Ticket:", ticket.id);

        const mailOptions = {
            from: `"Soporte Técnico" <${process.env.EMAIL_USER}>`,
            to: usuario.email,
            subject: `✅ Ticket Resuelto: ${ticket.titulo}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                    <h2>¡Hola ${usuario.nombre}!</h2>
                    
                    <p>
                        Te notificamos que tu ticket 
                        <strong>#${ticket.id}</strong> 
                        ha sido marcado como 
                        <strong style="color: green;">Cerrado</strong>.
                    </p>

                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Asunto:</strong> ${ticket.titulo}</p>
                    </div>

                    <p>
                        Si el problema persiste o tienes alguna duda, 
                        puedes abrir un nuevo ticket.
                    </p>

                    <p>
                        Saludos,<br>
                        <strong>Equipo de Soporte</strong>
                    </p>
                </div>
            `
        };

        // 🔥 ENVÍO DEL CORREO
        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Correo enviado correctamente");
        console.log("Response:", info.response);

    } catch (error) {
        console.error("❌ Error enviando correo:", error.message);
    }
};