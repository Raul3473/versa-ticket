describe('Flujo E2E de Versa Ticket', () => {
  it('Debería loguearse como usuario y crear un ticket', () => {
    // 1. Abre el navegador en tu página local
    cy.visit('http://localhost:5173/login');

    // 2. Escribe el correo y la contraseña (¡PON TUS DATOS REALES AQUÍ!)
    cy.get('input[type="email"]').type('admin@versa.com');
    cy.get('input[type="password"]').type('password'); 
    
    // 3. Le da clic al botón de Iniciar Sesión (asegúrate de que el type="submit" exista en tu botón)
    cy.get('button[type="submit"]').click();

    // 4. Espera a que el backend responda y verifica que entró al /inbox
    cy.url().should('include', '/admin');
    
    // 5. Busca el enlace o botón para crear ticket y le da clic
    // Nota: Si tu botón dice otra cosa como "Nuevo Ticket", cámbialo aquí abajo:
    cy.contains('Nuevo Ticket').click(); 

    // 6. Llena el formulario del ticket automáticamente
    cy.get('input[name="titulo"]').type('Falla de red automatizada por Cypress');
    cy.get('textarea[name="descripcion"]').type('Esta es una prueba End-to-End generada automáticamente para la documentación del Sprint 9.');
    
    // Selecciona el área, categoría y prioridad (asumiendo que son <select>)
    // IMPORTANTE: Los números entre comillas son los "value" de las opciones en tu BD
    cy.get('select[name="area_id"]').select('1'); 
    
    //Seleccionamos la categoría (Cambia el '1' por el ID o value de "Hardware")
    cy.get('select[name="categoria_id"]').select('1'); 
    
    // Seleccionamos la prioridad
    cy.get('select[name="prioridad_id"]').select('3'); 
    
    // 7. Le da clic a Guardar
    cy.get('button[type="submit"]').contains('Crear Ticket').click();

    // 8. Verifica que el sistema lo regrese al Inbox (lo que significa que el ticket se creó con éxito)
    cy.url().should('include', '/inbox');
  });
});