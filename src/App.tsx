/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  Star,
  CheckCircle2,
  MessageCircle
} from "lucide-react";
import { useGeoCurrency } from "./hooks/useGeoCurrency";
import { useTelegramTracker } from "./hooks/useTelegramTracker";

const CustomVideo = ({
  src,
  className,
  onPlay,
  onPause,
  onEnded,
}: {
  src: string;
  className?: string;
  onPlay?: (currentTime: number) => void;
  onPause?: (currentTime: number) => void;
  onEnded?: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={src}
        className={className}
        controls
        playsInline
        preload="metadata"
        onPlay={() => {
          if (videoRef.current && onPlay) {
            onPlay(videoRef.current.currentTime);
          }
        }}
        onPause={() => {
          if (videoRef.current && onPause) {
            onPause(videoRef.current.currentTime);
          }
        }}
        onEnded={() => {
          if (onEnded) onEnded();
        }}
      />
    </div>
  );
};

export default function App() {
  const [timeLeft, setTimeLeft] = useState(48 * 60 + 20); // 48 minutos de urgencia
  const geo = useGeoCurrency();
  const { 
    trackCheckoutClick, 
    trackVideoPlay, 
    trackVideoPause, 
    trackVideoEnded 
  } = useTelegramTracker(geo.countryName);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const HOTMART_URL = "https://pay.hotmart.com/W105526885V?off=qmsrqdaf&checkoutMode=10";
  const WHATSAPP_URL = "https://wa.me/?text=Hola%20Abuela%20Griselda,%20tengo%20una%20duda%20sobre%20el%20Cuaderno%20de%20100%20Recetas";

  const MOCKUP_BOOK =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1790647223/Create_3D_book_mockup_2K_20260928202131-Photoroom.png";
  const MOCKUP_PHONE =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1790648105/Create_3D_phone_mockup_2K_20260928203734-Photoroom.png";
  const AVATAR =
    "https://res.cloudinary.com/nudnxkcm/image/upload/f_auto/q_auto/Enhance_this_photo._2K_20260923223342.jpg";

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-lato text-[#2C3E50] selection:bg-[#A8C99A]/40 overflow-x-hidden flex flex-col w-full max-w-[100vw]">
      
      {/* BARRA SUPERIOR DE GANCHO INSTAGRAM REEL (sin emoji de planta) */}
      <aside aria-label="Aviso de Reel" className="bg-[#A8C99A]/20 border-b border-[#A8C99A]/40 px-3 py-2 text-center text-[#2C3E50] text-[15px] sm:text-[16px] font-medium">
        <div className="max-w-2xl mx-auto">
          <p className="leading-snug">
            ¿Llegaste desde Instagram? Aquí tienes la guía completa que viste en mi video.
          </p>
        </div>
      </aside>

      {/* SECCIÓN 1: HERO CON GANCHO DE REEL */}
      <header className="relative px-4 pt-6 pb-8 sm:px-6 sm:pt-10 sm:pb-12 max-w-2xl mx-auto w-full text-center">
        <div className="space-y-4 sm:space-y-5">

          {/* Titular: Poppins 28-36px mobile / 36-48px desktop / Bold 700 */}
          <h1 className="font-poppins font-bold text-[#2C3E50] text-[30px] sm:text-[40px] md:text-[44px] leading-[1.2] tracking-tight text-balance">
            Esa hinchazón de panza y el dolor de rodillas que te despierta a las 3 AM… tiene solución en tu cocina.
          </h1>

          {/* Subtítulo / Body: Lato 16-18px mobile / 18-20px desktop / Regular 400 */}
          <p className="font-lato font-normal text-[17px] sm:text-[19px] text-[#2C3E50]/85 leading-[1.65] max-w-xl mx-auto">
            Miles de mujeres mayores de 45 años ya apagaron el dolor sin pastillas ni recetas complicadas. Letra grande y lista en 10 minutos.
          </p>

          {/* Imagen de Portada del Libro */}
          <div className="py-2 flex justify-center">
            <div className="relative group max-w-[240px] sm:max-w-[280px]">
              <div className="absolute -inset-3 rounded-3xl bg-[#A8C99A]/25 blur-xl -z-10"></div>
              <img
                src={MOCKUP_BOOK}
                alt="Cuaderno 100 Recetas de la Abuela Para Sanar"
                className="w-48 sm:w-60 mx-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* CTA Principal: Open Sans 16px mobile / 16-18px desktop / Bold 700 */}
          <div className="flex flex-col items-center">
            <a
              href={HOTMART_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCheckoutClick("Botón (Hero - Ver cómo funciona)")}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#4A7C59] hover:bg-[#3D684A] text-white font-opensans font-bold text-[16px] sm:text-[18px] min-h-[56px] py-4 px-8 rounded-[12px] shadow-md shadow-[#4A7C59]/25 transition-transform active:scale-[0.98] text-center"
            >
              <span>QUIERO MI CUADERNO AHORA →</span>
            </a>
          </div>

        </div>
      </header>

      {/* SECCIÓN 2: TESTIMONIOS Y VIDEOS */}
      <section className="bg-white/90 border-y border-[#E8D5B7] px-4 py-8 sm:py-12">
        <div className="max-w-xl mx-auto space-y-5">
          
          {/* Subtítulo H2: Poppins 20-24px mobile / 24-28px desktop / SemiBold 600 */}
          <h2 className="font-poppins font-semibold text-[22px] sm:text-[26px] text-[#2C3E50] text-center leading-tight">
            Ellas te cuentan su cambio:
          </h2>

          {/* Videos de Testimonios Reales en Formato Vertical 9:16 (Instagram Reels) */}
          <div className="pt-1">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                "https://res.cloudinary.com/nudnxkcm/video/upload/v1789090995/Testimonio_1_Abuela_tulun.mp4",
                "https://res.cloudinary.com/nudnxkcm/video/upload/v1789090994/Testimonio_2_Abuela_tulun.mp4",
                "https://res.cloudinary.com/nudnxkcm/video/upload/v1789090998/Testimonio_3_Abuela_tulun.mp4"
              ].map((url, idx) => (
                <div key={idx} className="relative w-[210px] min-[400px]:w-[230px] sm:w-[250px] aspect-[9/16] snap-center rounded-[18px] overflow-hidden bg-black shadow-lg border border-[#E8D5B7]/60 shrink-0 flex items-center justify-center">
                  <CustomVideo 
                    src={url} 
                    className="w-full h-full object-cover bg-black"
                    onPlay={(curr) => trackVideoPlay(curr)}
                    onPause={(curr) => trackVideoPause(curr)}
                    onEnded={() => trackVideoEnded()}
                  />
                </div>
              ))}
            </div>
            <p className="text-center text-[13px] text-[#2C3E50]/60 mt-1">
              Desliza para ver más videos →
            </p>
          </div>

          {/* Testimonios escritos naturales con foto de cada señora */}
          <div className="grid gap-3.5 pt-1">
            <div className="p-4 sm:p-5 rounded-[16px] bg-[#FAF9F6] border border-[#E8D5B7] shadow-sm">
              <div className="flex items-start gap-3.5">
                <img
                  src="https://res.cloudinary.com/nudnxkcm/image/upload/v1789688454/Woman_taking_spontaneous_selfie_20260917203407.jpg"
                  alt="Carmen Rodríguez, de Medellín"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#4A7C59]/40 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex text-amber-500 text-[13px] mb-1 tracking-widest" aria-label="5 estrellas">
                    ★★★★★
                  </div>
                  <p className="text-[16px] sm:text-[17px] italic text-[#2C3E50] leading-relaxed">
                    “Jamás pensé que funcionaría tan bien para mí. Con el té de banana y canela dormí 7 horas seguidas por primera vez en años.”
                  </p>
                  <p className="mt-2 font-bold text-[15px] text-[#4A7C59]">
                    — Carmen Rodríguez, de Medellín
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-[16px] bg-[#FAF9F6] border border-[#E8D5B7] shadow-sm">
              <div className="flex items-start gap-3.5">
                <img
                  src="https://res.cloudinary.com/nudnxkcm/image/upload/v1789688455/Woman_taking_profile_selfie_20260917202911.jpg"
                  alt="Teresa Morales, de Puebla"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#4A7C59]/40 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex text-amber-500 text-[13px] mb-1 tracking-widest" aria-label="5 estrellas">
                    ★★★★★
                  </div>
                  <p className="text-[16px] sm:text-[17px] italic text-[#2C3E50] leading-relaxed">
                    “Lo mejor que compré este año. Todo se prepara con lo que una ya tiene en la cocina.”
                  </p>
                  <p className="mt-2 font-bold text-[15px] text-[#4A7C59]">
                    — Teresa Morales, de Puebla
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓN 3: EL PROBLEMA (Español neutro y empático) */}
      <section className="px-4 py-10 sm:px-6 sm:py-14 max-w-2xl mx-auto w-full space-y-5 text-[17px] sm:text-[19px] leading-[1.75] text-[#2C3E50]">
        
        <h2 className="font-poppins font-semibold text-[22px] sm:text-[26px] text-[#2C3E50] leading-tight">
          Sé exactamente cómo te sientes...
        </h2>

        <ul className="space-y-3 bg-white/90 p-5 rounded-[14px] border border-[#E8D5B7]">
          <li className="flex items-start gap-3">
            <span className="text-[#A8C99A] font-bold text-xl leading-none mt-1">•</span>
            <span>Te despiertas cansada y con el cuerpo rígido aunque duermas suficientes horas.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#A8C99A] font-bold text-xl leading-none mt-1">•</span>
            <span>Comes liviano y a las dos horas tienes la panza hinchada como un globo.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#A8C99A] font-bold text-xl leading-none mt-1">•</span>
            <span>Has gastado en pastillas de farmacia que solo tapan el dolor por unas horas y te dejan el estómago peor.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#A8C99A] font-bold text-xl leading-none mt-1">•</span>
            <span>Te dijeron que "son cosas de la edad" y te preguntas si ya es tarde para sentirte bien.</span>
          </li>
        </ul>

        <p className="font-poppins font-semibold text-[#4A7C59] text-[19px] sm:text-[21px] leading-snug">
          No estás sola. Y no es tu culpa.
        </p>

        <p>
          Tu cuerpo no está roto: solo necesitas que alguien te explique, con calma, qué hacer con la sabiduría natural que ya tienes en casa.
        </p>

      </section>

      {/* SECCIÓN 4: LA SOLUCIÓN VISUAL (Foto de 84 años agrandada) */}
      <section className="bg-white/90 border-y border-[#E8D5B7] px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl mx-auto space-y-6 text-[17px] sm:text-[19px] leading-[1.75] text-[#2C3E50]">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-2 text-center sm:text-left">
            <div className="relative group shrink-0">
              <div className="absolute -inset-2.5 rounded-[26px] bg-[#A8C99A]/30 blur-md -z-10"></div>
              <img
                src={AVATAR}
                alt="Abuela Griselda a sus 84 años"
                className="w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 rounded-[22px] object-cover border-4 border-[#A8C99A] shadow-lg mx-auto"
              />
            </div>
            <div className="space-y-2">
              <h2 className="font-poppins font-semibold text-[22px] sm:text-[26px] text-[#2C3E50] leading-tight">
                ¿Qué es “100 Recetas de la Abuela”?
              </h2>
              <p className="text-[#4A7C59] font-medium text-[17px] sm:text-[18px] leading-relaxed">
                El cuaderno secreto de cocina recopilado durante más de 40 años por mí, Griselda, a mis <strong>84 años</strong>.
              </p>
              <p className="text-[#2C3E50]/80 text-[16px] sm:text-[17px] leading-relaxed">
                Todo lo que comparto en mis videos, ahora reunido y ordenado para que lo tengas siempre a mano.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#FAF9F6] border border-[#A8C99A]/40">
              <CheckCircle2 className="w-6 h-6 text-[#4A7C59] shrink-0 mt-0.5" />
              <span><strong>100% ingredientes de alacena y verdulería:</strong> Limón, canela, romero, cúrcuma, repollo, jengibre. Cero polvos raros de internet.</span>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#FAF9F6] border border-[#A8C99A]/40">
              <CheckCircle2 className="w-6 h-6 text-[#4A7C59] shrink-0 mt-0.5" />
              <span><strong>Letra grande para no forzar la vista:</strong> Cada receta completa en su propia página con medidas caseras exactas.</span>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#FAF9F6] border border-[#A8C99A]/40">
              <CheckCircle2 className="w-6 h-6 text-[#4A7C59] shrink-0 mt-0.5" />
              <span><strong>Listas en 5 a 15 minutos:</strong> Explicado paso a paso con minutos y cuándo tomarlo para un alivio suave y seguro.</span>
            </div>
          </div>

          {/* Imagen de producto en uso */}
          <div className="pt-2 text-center">
            <img
              src={MOCKUP_PHONE}
              alt="Cuaderno abierto en celular"
              className="w-40 sm:w-48 mx-auto object-contain drop-shadow-md"
            />
            <p className="mt-2 text-[16px] font-bold text-[#4A7C59]">
              “Así de simple funciona: un solo toque en tu celular y ya lo estás leyendo.”
            </p>
          </div>

        </div>
      </section>

      {/* SECCIÓN 6: QUÉ INCLUYE EXACTAMENTE */}
      <section id="oferta" className="bg-white/90 border-y border-[#E8D5B7] px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl mx-auto rounded-[24px] bg-[#FAF9F6] p-6 sm:p-9 border border-[#E8D5B7] shadow-md text-center space-y-6">
          
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#A8C99A]/25 border border-[#A8C99A]/50 text-[#2C3E50] font-bold text-[14px] sm:text-[15px] tracking-wide">
            OFERTA EXCLUSIVA PARA QUIEN VIENE DE INSTAGRAM
          </span>

          <h2 className="font-poppins font-semibold text-[22px] sm:text-[26px] text-[#2C3E50] leading-tight">
            Todo lo que incluye tu acceso hoy:
          </h2>

          {/* Tarjeta Unificada del Producto */}
          <div className="bg-white rounded-[18px] border border-[#E8D5B7] p-6 sm:p-7 shadow-xs text-left space-y-5">
            
            {/* Mockup y Título Principal */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-2 border-b border-[#E8D5B7]/60">
              <img
                src={MOCKUP_BOOK}
                alt="Cuaderno 100 Recetas de la Abuela Para Sanar"
                className="w-36 sm:w-44 shrink-0 object-contain drop-shadow-md"
              />
              <div className="text-center sm:text-left space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#E8D5B7] text-[13px] font-semibold text-[#4A7C59]">
                  📱 Formato Digital Interactivo
                </span>
                <h3 className="font-poppins font-semibold text-[20px] sm:text-[23px] text-[#2C3E50] leading-snug">
                  Libro Digital "100 Recetas de la Abuela"
                </h3>
                <p className="font-lato font-normal text-[15px] sm:text-[16px] text-[#2C3E50]/75">
                  110 páginas en formato PDF de alta calidad, listo para leer en tu celular o imprimir.
                </p>
              </div>
            </div>

            {/* Puntos destacados del contenido */}
            <div className="space-y-3 pt-1 text-[16px] sm:text-[17px] text-[#2C3E50] font-lato font-normal">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#4A7C59] shrink-0 mt-0.5" />
                <span><strong>100 recetas e infusiones naturales:</strong> soluciones probadas para la inflamación, articulaciones y descanso.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#4A7C59] shrink-0 mt-0.5" />
                <span><strong>Medidas caseras exactas:</strong> explicadas con cucharas, tazas y pizcas para que no te compliques con balanzas.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#4A7C59] shrink-0 mt-0.5" />
                <span><strong>Acceso de por vida:</strong> descárgalo una vez y consérvalo para siempre en tus dispositivos.</span>
              </div>
            </div>

            {/* Bloque de Precio y Descuento: Montserrat 32-40px mobile / 40-48px desktop / Bold 700 */}
            <div className="pt-4 border-t border-[#E8D5B7]/60 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-[14px] sm:text-[15px] text-[#2C3E50]/60 line-through font-medium">
                  Precio regular: $19 USD
                </p>
                <div>
                  <span className="block font-montserrat font-bold text-[36px] sm:text-[44px] text-[#4A7C59] leading-tight whitespace-nowrap">
                    $7 USD
                  </span>
                  <span className="inline-block text-[13px] sm:text-[14px] font-bold text-[#D4A843] uppercase tracking-wide whitespace-nowrap">
                    (63% de descuento)
                  </span>
                </div>
                {geo.currentPriceFormatted && geo.currencyCode !== "USD" && (
                  <p className="text-[15px] sm:text-[16px] font-bold text-[#2C3E50] mt-1 whitespace-nowrap">
                    Equivalente aprox: <span className="font-montserrat font-bold">{geo.currentPriceFormatted}</span>
                  </p>
                )}
              </div>

              <div className="text-center sm:text-right text-[14px] text-[#2C3E50]/80">
                <p className="font-semibold text-[#4A7C59] flex items-center justify-center sm:justify-end gap-1 whitespace-nowrap">
                  <span>⚡ Descarga Inmediata</span>
                </p>
                <p className="text-[13px] text-[#2C3E50]/70 whitespace-nowrap">
                  Llega a tu correo y teléfono al instante
                </p>
              </div>
            </div>

          </div>

          {/* BOTÓN CTA #2: Open Sans 16px mobile / 16-18px desktop / Bold 700 */}
          <div className="pt-2 space-y-3">
            <a
              href={HOTMART_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCheckoutClick("Botón (Oferta Detallada)")}
              className="inline-flex w-full items-center justify-center gap-2 bg-[#4A7C59] hover:bg-[#3D684A] text-white font-opensans font-bold text-[16px] sm:text-[18px] min-h-[56px] py-4 px-6 rounded-[14px] shadow-md shadow-[#4A7C59]/25 transition-transform active:scale-[0.98] text-center"
            >
              <span>SÍ, QUIERO MI CUADERNO – ACCEDER POR $7 USD →</span>
            </a>
            
            <p className="text-[14px] text-[#2C3E50]/70 flex items-center justify-center gap-1.5">
              <span>🔒 Pago 100% seguro y encriptado</span>
              <span>·</span>
              <span>Garantía de 7 días</span>
            </p>
          </div>

        </div>
      </section>

      {/* SECCIÓN 7: GARANTÍA SIN RIESGO */}
      <section className="px-4 py-10 sm:px-6 sm:py-14 max-w-2xl mx-auto w-full">
        <div className="rounded-[16px] p-6 sm:p-7 bg-white border border-[#A8C99A]/50 shadow-xs space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 rounded-[14px] bg-[#A8C99A]/20 text-[#4A7C59] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h2 className="font-poppins font-semibold text-[22px] sm:text-[26px] text-[#2C3E50] leading-snug mb-1.5">
              <span className="block">GARANTÍA INCONDICIONAL</span>
              <span className="block text-[#4A7C59]">DE 7 DÍAS</span>
            </h2>
            <p className="font-lato font-normal text-[16px] sm:text-[18px] leading-relaxed text-[#2C3E50]">
              Si en 7 días no sientes que tus rodillas, tu digestión o tu descanso mejoran, mandas un mensaje y te devolvemos el 100% de tu dinero. Sin preguntas y sin complicaciones. Tu compra está 100% protegida.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 8: PREGUNTAS FRECUENTES CLAVE (Español neutro) */}
      <section className="bg-white/90 border-y border-[#E8D5B7] px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl mx-auto space-y-5">
          
          <h2 className="font-poppins font-semibold text-[22px] sm:text-[26px] text-center text-[#2C3E50] leading-tight mb-6">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4 text-[16px] sm:text-[18px] leading-relaxed text-[#2C3E50] font-lato">
            
            <div className="p-4 rounded-[12px] bg-[#FAF9F6] border border-[#E8D5B7]">
              <p className="font-poppins font-semibold text-[17px] sm:text-[18px] text-[#2C3E50] mb-1">❓ ¿Necesito experiencia previa?</p>
              <p className="font-lato font-normal text-[#2C3E50]/90">→ No, está diseñado paso a paso con medidas caseras para que cualquier persona lo prepare fácilmente.</p>
            </div>

            <div className="p-4 rounded-[12px] bg-[#FAF9F6] border border-[#E8D5B7]">
              <p className="font-poppins font-semibold text-[17px] sm:text-[18px] text-[#2C3E50] mb-1">❓ ¿Cuánto tiempo necesito dedicarle?</p>
              <p className="font-lato font-normal text-[#2C3E50]/90">→ Solo 10 a 15 minutos al día con ingredientes que ya tienes en casa.</p>
            </div>

            <div className="p-4 rounded-[12px] bg-[#FAF9F6] border border-[#E8D5B7]">
              <p className="font-poppins font-semibold text-[17px] sm:text-[18px] text-[#2C3E50] mb-1">❓ ¿Funciona si tengo más de 50 o 60 años?</p>
              <p className="font-lato font-normal text-[#2C3E50]/90">→ Sí, la gran mayoría de nuestras lectoras tienen más de 45 años. Está hecho para que sea muy cómodo y sin forzar la vista.</p>
            </div>

            <div className="p-4 rounded-[12px] bg-[#FAF9F6] border border-[#E8D5B7]">
              <p className="font-poppins font-semibold text-[17px] sm:text-[18px] text-[#2C3E50] mb-1">❓ ¿Cómo recibo el producto?</p>
              <p className="font-lato font-normal text-[#2C3E50]/90">→ Acceso inmediato por correo electrónico y WhatsApp tras la compra. Lo tocas y se abre como una foto larga en tu celular.</p>
            </div>

            <div className="p-4 rounded-[12px] bg-[#FAF9F6] border border-[#E8D5B7]">
              <p className="font-poppins font-semibold text-[17px] sm:text-[18px] text-[#2C3E50] mb-1">❓ ¿Puedo hacer preguntas si tengo dudas?</p>
              <p className="font-lato font-normal text-[#2C3E50]/90">→ Sí, tienes soporte directo por WhatsApp incluido para ayudarte en todo momento.</p>
            </div>

          </div>

        </div>
      </section>

      {/* SECCIÓN 9: CTA FINAL CON URGENCIA */}
      <footer className="px-4 py-10 sm:px-6 sm:py-16 text-center max-w-2xl mx-auto w-full space-y-6">
        
        {/* Contador de Urgencia */}
        <div className="p-4 rounded-[14px] bg-white border border-[#E8D5B7] max-w-md mx-auto shadow-xs">
          <p className="text-red-700 font-bold text-[13px] sm:text-[15px] uppercase mb-2 flex items-center justify-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
            <span>⏰ OFERTA POR TIEMPO LIMITADO</span>
          </p>
          <div className="flex justify-center items-center gap-3 font-mono font-bold text-2xl text-[#2C3E50]">
            <div className="bg-[#2C3E50] text-white px-3 py-1.5 rounded-[8px]">
              {Math.floor(timeLeft / 60).toString().padStart(2, "0")}
            </div>
            <span>:</span>
            <div className="bg-[#2C3E50] text-white px-3 py-1.5 rounded-[8px]">
              {(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          </div>
          <p className="text-[14px] text-[#2C3E50]/70 mt-2">
            El precio vuelve a $19 USD al finalizar el contador
          </p>
        </div>

        <p className="font-poppins font-semibold text-[20px] sm:text-[24px] text-[#2C3E50] leading-tight">
          Únete a las mujeres que ya transformaron sus mañanas y apagaron el dolor.
        </p>

        {/* BOTÓN CTA #3: Open Sans 16px mobile / 16-18px desktop / Bold 700 */}
        <div>
          <a
            href={HOTMART_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCheckoutClick("Botón (Cierre Final)")}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#4A7C59] hover:bg-[#3D684A] text-white font-opensans font-bold text-[16px] sm:text-[18px] min-h-[56px] py-4 px-8 rounded-[12px] shadow-md shadow-[#4A7C59]/25 transition-transform active:scale-[0.98] text-center"
          >
            <span>SÍ, QUIERO EMPEZAR HOY →</span>
          </a>
        </div>

        <div className="pt-4 border-t border-[#E8D5B7]">
          <p className="italic text-[18px] sm:text-[19px]">
            Un abrazo fuerte, hija. Cuídate mucho.
          </p>
          <p className="font-bold text-[#4A7C59] text-[19px] sm:text-[20px] mt-1">
            — Griselda, tu Abuela Tulun
          </p>
        </div>

        <p className="pt-4 text-[13px] text-[#2C3E50]/60">
          © {new Date().getFullYear()} Abuela Tulun · Todos los derechos reservados
        </p>

      </footer>

      {/* BOTÓN FLOTANTE DE WHATSAPP DIRECTO */}
      <aside aria-label="Contacto por WhatsApp" className="fixed bottom-4 right-4 z-50">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#4A7C59] hover:bg-[#3D684A] text-white px-4 py-3 rounded-full shadow-lg shadow-black/20 font-opensans font-bold text-[15px] sm:text-[16px] transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="hidden sm:inline">¿Dudas? Escríbeme</span>
        </a>
      </aside>

    </div>
  );
}
