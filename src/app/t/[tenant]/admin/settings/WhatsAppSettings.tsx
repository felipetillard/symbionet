"use client";
import { useState } from "react";
import { updateWhatsAppNumberAction } from "./server-actions";

type WhatsAppSettingsProps = {
  tenantSlug: string;
  currentNumber: string;
};

export default function WhatsAppSettings({ tenantSlug, currentNumber }: WhatsAppSettingsProps) {
  const [whatsappNumber, setWhatsappNumber] = useState(currentNumber);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (cleaned && !cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateWhatsAppNumberAction(tenantSlug, whatsappNumber);
      setMessage({ type: 'success', text: '¡Número de WhatsApp actualizado exitosamente!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al actualizar el número de WhatsApp' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidNumber = whatsappNumber.length >= 10 && whatsappNumber.startsWith('+');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-semibold text-white mb-2">Pago por WhatsApp</h2>
        <p className="text-white/60 text-sm">
          Configura tu número de WhatsApp para recibir pedidos de clientes y habilitar el pago vía WhatsApp.
        </p>
      </div>

      {/* Status Alert */}
      {!currentNumber && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-orange-400 font-medium mb-1">Pago por WhatsApp No Configurado</h3>
              <p className="text-orange-300/80 text-sm">
                Tus clientes no pueden completar compras hasta que configures un número de WhatsApp. Configúralo abajo para habilitar el pago.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {message && (
        <div className={`rounded-xl p-4 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            Número de Teléfono WhatsApp
          </label>
          <div className="space-y-2">
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(formatPhoneNumber(e.target.value))}
              placeholder="+1234567890"
              disabled={isSubmitting}
              className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-white/50 text-xs">
              Ingresa el número de teléfono donde quieres recibir pedidos de clientes (incluye código de país, ej. +1234567890)
            </p>
          </div>
        </div>

        {/* Preview */}
        {whatsappNumber && isValidNumber && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-2">Vista Previa</h3>
            <p className="text-white/70 text-sm mb-3">
              Cuando los clientes paguen, serán redirigidos a WhatsApp con un mensaje como:
            </p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-300 text-sm font-mono">
                ¡Hola! Me gustaría pedir:<br/>
                • Nombre del Producto x1 - $32.00<br/>
                Total: $32.00<br/><br/>
                ¡Por favor confirma mi pedido. ¡Gracias!
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || !isValidNumber}
            className="flex-1 h-12 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 rounded-lg font-medium text-white transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Actualizando...
              </div>
            ) : (
              'Guardar Número WhatsApp'
            )}
          </button>
          
          {/* Temporary test button */}
          <button
            type="button"
            onClick={async () => {
              console.log('🧪 Test button clicked - starting direct test');
              try {
                console.log('🧪 Calling server action directly with +1234567890');
                await updateWhatsAppNumberAction(tenantSlug, '+1234567890');
                console.log('✅ Test successful!');
                setMessage({ type: 'success', text: '¡Prueba exitosa!' });
              } catch (error) {
                console.error('❌ Test failed:', error);
                setMessage({ 
                  type: 'error', 
                  text: `Prueba fallida: ${error instanceof Error ? error.message : 'Error desconocido'}` 
                });
              }
            }}
            className="h-12 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg font-medium text-red-300 transition-all duration-200"
          >
            🧪 Test
          </button>
          
          {whatsappNumber && isValidNumber && (
            <a
              href={`https://wa.me/${whatsappNumber.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-6 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg font-medium text-green-300 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
              </svg>
              Probar Número
            </a>
          )}
        </div>
      </form>
    </div>
  );
} 