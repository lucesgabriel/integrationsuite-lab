/**
 * Endpoints de servicios externos (sitio estático, sin backend).
 * Estas keys están diseñadas para ser públicas en el front-end — no son secretos.
 *
 * Mientras estén vacíos, los componentes se degradan con gracia:
 * - ContactForm muestra el botón mailto clásico.
 * - NewsletterSignup no se renderiza.
 */
export const services = {
  /**
   * Formulario de contacto (Web3Forms).
   * Obtener en https://web3forms.com → "Get Access Key" con el email de contacto.
   * Ejemplo: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   */
  web3formsAccessKey: "35506d65-541b-43b0-823e-40da4319470f",

  /**
   * Newsletter (Kit / ConvertKit).
   * Crear un form inline en Kit → Grow → Landing Pages & Forms,
   * y copiar la action URL del embed HTML.
   * Ejemplo: "https://app.kit.com/forms/1234567/subscriptions"
   */
  kitFormAction: "https://app.kit.com/forms/9553017/subscriptions",
};
