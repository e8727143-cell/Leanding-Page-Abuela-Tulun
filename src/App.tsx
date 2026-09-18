/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Leaf, Sun, Droplets, Sparkles, ArrowRight, Play } from "lucide-react";

const CustomVideo = ({ src, className, onTimeUpdate }: { src: string; className?: string; onTimeUpdate?: any }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={src}
        className={className}
        controls
        preload="metadata"
        onTimeUpdate={onTimeUpdate}
      />
    </div>
  );
};

export default function App() {
  const [showHeroButton, setShowHeroButton] = useState(false);
  const [viewers, setViewers] = useState(457);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [showExitPopup, setShowExitPopup] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitPopup) {
        setShowExitPopup(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [showExitPopup]);

  useEffect(() => {
    if (showHeroButton) return;
    const interval = setInterval(() => {
      setViewers(prev => {
        let change = Math.floor(Math.random() * 11) - 5;
        let next = prev + change;
        if (next > 500) next = 500;
        if (next < 410) next = 410;
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [showHeroButton]);

  useEffect(() => {
    if (!showHeroButton) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showHeroButton]);

  const [commentsData, setCommentsData] = useState<{id: number, name: string, text: string, time: string, avatar: string}[]>([]);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Ensure no duplicates in the avatars list (removed the duplicate URL)
    const AVATARS = Array.from(new Set([
      "https://res.cloudinary.com/nudnxkcm/image/upload/v1789688455/Woman_taking_profile_selfie_20260917202911.jpg",
      "https://res.cloudinary.com/nudnxkcm/image/upload/v1789688455/Woman_taking_home_selfie_20260917202825.jpg",
      "https://res.cloudinary.com/nudnxkcm/image/upload/v1789688455/Woman_taking_selfie_20260917202949.jpg",
      "https://res.cloudinary.com/nudnxkcm/image/upload/v1789688454/Woman_taking_selfie_20260917203334.jpg",
      "https://res.cloudinary.com/nudnxkcm/image/upload/v1789688454/Woman_taking_spontaneous_selfie_20260917203407.jpg",
      "https://res.cloudinary.com/nudnxkcm/image/upload/v1789688455/Woman_taking_selfie_indoors_20260917203140.jpg",
      "https://res.cloudinary.com/nudnxkcm/image/upload/v1789688454/Woman_taking_selfie_profile_picture_20260917202415.jpg"
    ]));

    const baseComments = [
      { id: 1, name: "María Fernanda", text: "Llevo 3 días y ya no me duelen las rodillas, es increíble." },
      { id: 2, name: "Carmen Rosa", text: "Al fin algo que no son pastillas. Empecé hoy." },
      { id: 3, name: "Teresa G.", text: "Pensé que era mentira pero ya bajé 2 tallas de pantalón, me siento super desinflamada." },
      { id: 4, name: "Luz Elena", text: "Alguien más sintió alivio en la espalda la primera semana?" }
    ];

    const shuffledAvatars = [...AVATARS].sort(() => 0.5 - Math.random());
    
    let currentTime = Math.floor(Math.random() * 3) + 1;
    
    const initializedComments = baseComments.map((c, index) => {
      // Direct access guarantees uniqueness since shuffledAvatars has 7 unique elements
      const avatar = shuffledAvatars[index];
      const timeStr = `Hace ${currentTime} min`;
      currentTime += Math.floor(Math.random() * 10) + 4;
      return { ...c, avatar, time: timeStr };
    });

    setCommentsData(initializedComments);
    setIsTyping(true);

    const typingTimer = setTimeout(() => {
      setIsTyping(false);
      setCommentsData(prev => {
        // Prevent double injection in React strict mode
        if (prev.some(c => c.id === 5)) return prev;
        
        const newComment = {
          id: 5,
          name: "Patricia M.",
          text: "¡Yo también quiero empezar! Acabo de ver el video y me identifico muchísimo.",
          time: "Justo ahora",
          // The 5th unique avatar from the list
          avatar: shuffledAvatars[baseComments.length]
        };
        return [...prev, newComment];
      });
    }, Math.floor(Math.random() * 8000) + 7000); // Between 7 and 15 seconds

    return () => clearTimeout(typingTimer);
  }, []);

  const MOCKUP_BOOK =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059099/mockup_libro_desintoxica_tu_cuerpo_en_21_dias-Photoroom.png";
  const MOCKUP_TABLET =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059098/mockup_tablet_desintoxica_tu_cuerpo_en_21_dias-Photoroom.png";
  const MOCKUP_PHONE =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059098/mockup_celular_desintoxica_tu_cuerpo_en_21_dias-Photoroom.png";
  const AVATAR =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059369/Avatar_Abuela_Tulun.jpg";

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800 selection:bg-emerald-200 overflow-x-hidden flex flex-col w-full max-w-[100vw]">
      {showExitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/10 md:p-10">
            <button 
              onClick={() => setShowExitPopup(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="text-center">
              <h2 className="mb-4 font-serif text-2xl font-bold text-red-600 md:text-3xl">¡ESPERA!</h2>
              <p className="mb-6 text-base text-stone-600 md:text-lg leading-relaxed">
                Hija, de verdad quiero ayudarte y esta oferta es exclusiva para quien miró el vídeo, no se repetirá más. Cómo última oferta puedes llevarte el libro digital con todas mis recetas por apenas <span className="font-bold text-stone-900">$9.97</span>
              </p>
              <a
                href="https://pay.hotmart.com/W105526885V?off=82bvewu1&checkoutMode=10"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-red-600 px-6 py-4 text-sm font-bold text-white shadow-[0_8px_30px_rgb(220,38,38,0.3)] transition-all hover:scale-105 hover:bg-red-700 hover:shadow-[0_8px_40px_rgb(220,38,38,0.4)] active:scale-95 sm:text-base md:text-lg text-center"
              >
                <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                  <div className="relative h-full w-8 bg-white/20" />
                </span>
                <span>APROVECHAR OFERTA EXCLUSIVA</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* BANNER SUPERIOR DE ADVERTENCIA */}
      <div className="bg-amber-400 px-4 py-2 text-center text-sm font-bold tracking-wide text-amber-950 md:text-base">
        ATENCIÓN! Las farmacias no quieren que sepas esto. Este contenido es exclusivo para pocas personas.
      </div>

      {/* SECCIÓN 1: HERO */}
      <section className="relative overflow-hidden px-4 pt-6 pb-10 sm:px-6 md:pt-10 md:pb-16">
        {/* Subtle background blob */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-900/5 blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-amber-600/5 blur-3xl"></div>

        <div className="mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            <h1 className="mx-auto mb-4 max-w-4xl text-balance font-serif text-[22px] font-bold leading-[1.15] tracking-tight text-[#166534] sm:text-4xl md:text-5xl lg:text-6xl sm:leading-tight">
              Cómo Vaciar Tu Abdomen, Apagar El Dolor Articular Y Reactivar Tu Metabolismo En 21 Días... Sin Pastillas De Farmacia.
            </h1>
            <div className="mt-4 mb-6 sm:mb-8 flex justify-center">
              <p className="inline-block rounded-lg bg-amber-400 px-4 py-2 text-sm sm:text-base md:text-lg font-bold text-amber-950 shadow-sm text-balance">
                Mira el vídeo abajo que puede desaparecer en cualquier momento.
              </p>
            </div>
          </div>

          {/* VSL VIDEO SECTION */}
          <div className="mx-auto mb-6 w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-stone-900/5 bg-stone-900">
            <div className="relative aspect-video w-full">
              <CustomVideo
                src="https://res.cloudinary.com/nudnxkcm/video/upload/v1789085259/VSL_Leandig_Page_Abuela_Tulun.mp4"
                className="h-full w-full object-cover"
                onTimeUpdate={(e: any) => {
                  if (e.target.currentTime >= 54 && !showHeroButton) {
                    setShowHeroButton(true);
                  }
                }}
              />
            </div>
          </div>

          {!showHeroButton && (
            <div className="mx-auto max-w-4xl w-full px-2 sm:px-0 mb-8 sm:mb-12 transition-opacity duration-500">
              <div className="flex justify-center items-center gap-2 mb-6 text-stone-600 font-medium text-sm sm:text-base">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-600 font-bold">{viewers}</span> personas están viendo este video
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 sm:p-6 text-left">
                <h3 className="text-lg font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">Comentarios (14)</h3>
                <div className="space-y-4">
                  {commentsData.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <img 
                        src={c.avatar} 
                        alt={c.name} 
                        className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm border border-stone-200"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-sm text-[#3b5998]">{c.name}</span>
                          <span className="text-xs text-stone-400">{c.time}</span>
                        </div>
                        <p className="text-sm text-stone-700 mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {isTyping && (
                  <div className="flex gap-3 items-center mt-6 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="flex gap-1 bg-stone-200 px-3 py-2 rounded-full items-center">
                      <div className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                    <span className="text-xs font-medium text-stone-500 italic">Alguien está escribiendo un comentario...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {showHeroButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl ring-2 ring-red-500 overflow-hidden relative"
            >
              <div className="w-full bg-red-600 py-3 text-center">
                <p className="text-white font-bold text-sm sm:text-base tracking-wide px-4">
                  🚨 OFERTA EXCLUSIVA PARA QUIEN ESTÁ VIENDO EL VÍDEO 🚨
                </p>
              </div>

              <div className="p-6 sm:p-10 flex flex-col items-center w-full">
                <div className="flex flex-col items-center mb-6 w-full">
                  <p className="text-stone-500 font-medium text-sm mb-2 uppercase tracking-widest">La oferta expira en</p>
                  <div className="flex gap-2 sm:gap-3 items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-stone-900 text-white font-mono font-bold text-4xl sm:text-6xl px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-inner shadow-black/50 tracking-tighter">
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}
                      </div>
                      <span className="text-[10px] sm:text-xs text-stone-400 font-medium mt-1 uppercase tracking-widest">Minutos</span>
                    </div>
                    <span className="text-stone-900 font-bold text-4xl sm:text-5xl -mt-4 sm:-mt-5 animate-pulse">:</span>
                    <div className="flex flex-col items-center">
                      <div className="bg-stone-900 text-white font-mono font-bold text-4xl sm:text-6xl px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-inner shadow-black/50 tracking-tighter">
                        {(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                      <span className="text-[10px] sm:text-xs text-stone-400 font-medium mt-1 uppercase tracking-widest">Segundos</span>
                    </div>
                  </div>
                </div>

                <img 
                  src={MOCKUP_PHONE} 
                  alt="Mockup Celular" 
                  className="w-32 sm:w-48 object-contain drop-shadow-2xl mb-6"
                />

                <div className="mb-8 flex flex-col items-center text-center">
                  <span className="mb-1 text-base font-medium text-stone-500 line-through sm:text-lg">Valor normal: $49.97</span>
                  <span className="text-4xl font-extrabold tracking-tight text-[#166534] sm:text-5xl md:text-6xl">
                    Ahora solo $11.97
                  </span>
                </div>

                <a
                  href="https://pay.hotmart.com/W105526885V?checkoutMode=10&off=qmsrqdaf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex w-full items-center justify-center gap-1.5 sm:gap-3 overflow-hidden rounded-full bg-[#15803d] px-3 sm:px-6 py-4 sm:py-5 text-[14px] sm:text-lg font-bold text-white shadow-[0_8px_30px_rgb(21,128,61,0.3)] transition-all hover:scale-105 hover:bg-[#166534] hover:shadow-[0_8px_40px_rgb(21,128,61,0.4)] active:scale-95 text-center leading-tight whitespace-nowrap"
                >
                  <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                    <div className="relative h-full w-8 bg-white/20" />
                  </span>
                  <span>QUIERO ADQUIRIR AHORA</span>
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-1 shrink-0" />
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* SECCIÓN 2: EL PROBLEMA */}
      <section className="bg-white px-4 pt-6 pb-10 sm:px-6 md:pt-8 md:pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-4 sm:space-y-5 text-base leading-relaxed text-stone-700 sm:text-lg md:text-xl md:leading-loose">
            <p>
              Estás agotada. Agotada de hacer dietas que te matan de hambre y ver que la báscula no se mueve. Cansada de despertar con las manos hinchadas, pesadez en las piernas y un dolor de espalda que no te deja disfrutar tu día.
            </p>
            <p className="font-semibold text-stone-900">
              Pero necesito que leas esto con atención: No es tu culpa.
            </p>
            <p>
              Esa hinchazón abdominal y esa fatiga crónica no son por "comer de más" ni por "falta de voluntad". Es tu hígado pidiendo auxilio y una severa resistencia a la insulina bloqueando tu metabolismo.
            </p>
            <p>
              La industria farmacéutica quiere que creas que a tu edad el dolor es normal, para mantenerte atada a sus analgésicos. Pero tu cuerpo solo necesita un botón de reinicio.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: TESTIMONIOS Y LA AUTORIDAD */}
      <section className="bg-[#14532D] px-4 py-10 text-stone-50 sm:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">

          {/* TESTIMONIOS */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="mx-auto max-w-2xl font-serif text-2xl font-bold leading-tight text-[#FDFBF7] sm:text-3xl md:text-4xl text-balance">
                Ellas ya desintoxicaron su cuerpo y apagaron el dolor
              </h2>
            </div>

            {/* Slider móvil / Grid en desktop para videos 9:16 */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                "https://res.cloudinary.com/nudnxkcm/video/upload/v1789090995/Testimonio_1_Abuela_tulun.mp4",
                "https://res.cloudinary.com/nudnxkcm/video/upload/v1789090994/Testimonio_2_Abuela_tulun.mp4",
                "https://res.cloudinary.com/nudnxkcm/video/upload/v1789090998/Testimonio_3_Abuela_tulun.mp4"
              ].map((url, idx) => (
                <div key={idx} className="relative w-[75vw] sm:w-auto snap-center rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 shrink-0 flex items-center justify-center">
                  <CustomVideo 
                    src={url} 
                    className="w-full h-auto max-h-[70vh] sm:max-h-[500px] object-contain bg-black"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative mx-auto w-full max-w-[260px] sm:max-w-sm lg:mx-0 lg:max-w-none">
              <div className="absolute -inset-3 sm:-inset-4 rounded-2xl bg-emerald-800/50 blur-lg"></div>
              <img
                src={AVATAR}
                alt="Autora"
                className="relative aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl shadow-black/40 ring-1 ring-white/10"
              />
            </div>

            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <h2 className="font-serif text-2xl font-bold leading-tight text-[#FDFBF7] sm:text-3xl md:text-4xl">
                El Método Que La Industria Médica Intenta Ocultar
              </h2>

              <p className="text-base leading-relaxed text-emerald-100 sm:text-lg md:text-xl">
                Las dietas de moda fallan porque intentan quemar grasa en un cuerpo intoxicado. Es como intentar limpiar el piso con agua sucia. Para volver a sentirte ligera, primero debes destapar tus órganos filtro.
              </p>

              <div className="rounded-xl border border-emerald-700 bg-emerald-900/50 p-4 sm:p-5 md:p-6 backdrop-blur-sm text-center sm:text-left">
                <p className="text-[15px] sm:text-lg font-bold text-amber-400 leading-snug text-balance">
                  El método ancestral para deshinchar tu vientre, frenar el dolor y reactivar tu metabolismo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: ENTREGABLES */}
      <section className="px-4 py-10 sm:px-6 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center sm:mb-10">
            <h2 className="font-serif text-2xl font-bold text-[#166534] sm:text-3xl md:text-4xl">
              Tu Transformación<br />Paso a Paso
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-5 lg:gap-6 md:grid-cols-2">
            {/* Item 1 */}
            <div className="group rounded-2xl bg-white p-5 sm:p-6 shadow-lg shadow-emerald-900/5 ring-1 ring-stone-200 transition-all hover:shadow-xl hover:shadow-emerald-900/10">
              <div className="mb-3 sm:mb-4 inline-flex rounded-xl bg-emerald-100 p-3 text-[#166534]">
                <Droplets className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="mb-1 sm:mb-2 text-lg sm:text-xl font-bold text-stone-900">
                Fase 1 (Días 1-7)<br />
                <span className="text-[#B45309]">Drenaje Profundo</span>
              </h3>
              <p className="text-sm sm:text-base text-stone-600">
                Expulsa el líquido retenido y la hinchazón severa. Volverás a abrocharte el pantalón sin que te apriete.
              </p>
            </div>

            {/* Item 2 */}
            <div className="group rounded-2xl bg-white p-5 sm:p-6 shadow-lg shadow-emerald-900/5 ring-1 ring-stone-200 transition-all hover:shadow-xl hover:shadow-emerald-900/10">
              <div className="mb-3 sm:mb-4 inline-flex rounded-xl bg-emerald-100 p-3 text-[#166534]">
                <Sun className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="mb-1 sm:mb-2 text-lg sm:text-xl font-bold text-stone-900">
                Fase 2 (Días 8-14)<br />
                <span className="text-[#B45309]">Reseteo Metabólico</span>
              </h3>
              <p className="text-sm sm:text-base text-stone-600">
                Usa las combinaciones exactas para apagar la resistencia a la insulina y derretir la grasa estancada.
              </p>
            </div>

            {/* Item 3 */}
            <div className="group rounded-2xl bg-white p-5 sm:p-6 shadow-lg shadow-emerald-900/5 ring-1 ring-stone-200 transition-all hover:shadow-xl hover:shadow-emerald-900/10 sm:col-span-2 md:col-span-1 lg:col-span-2 lg:max-w-xl lg:mx-auto lg:w-full">
              <div className="mb-3 sm:mb-4 inline-flex rounded-xl bg-emerald-100 p-3 text-[#166534]">
                <Leaf className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="mb-1 sm:mb-2 text-lg sm:text-xl font-bold text-stone-900">
                Fase 3 (Días 15-21)<br />
                <span className="text-[#B45309]">Alivio y Rejuvenecimiento</span>
              </h3>
              <p className="text-sm sm:text-base text-stone-600">
                Recetas antiinflamatorias intensivas que apagan el fuego en tus rodillas, lumbares y articulaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: CIERRE Y CTA FINAL */}
      <section id="checkout" className="bg-[#FDFBF7] px-4 py-10 sm:px-6 md:py-16 border-t border-stone-200">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex flex-col items-center">
            {/* CAJA DE OFERTA */}
            <div className="w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-10 shadow-2xl ring-1 ring-stone-200 mb-8 sm:mb-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
              
              <div className="mx-auto mb-8 flex max-w-2xl flex-wrap justify-center items-end gap-2 sm:gap-4">
                <img
                  src={MOCKUP_TABLET}
                  alt="Mockup Tablet"
                  className="w-24 sm:w-32 object-contain drop-shadow-xl md:w-48 -mb-2 sm:-mb-6 hidden sm:block"
                />
                <img
                  src={MOCKUP_BOOK}
                  alt="Mockup Libro"
                  className="z-10 w-48 sm:w-64 object-contain drop-shadow-2xl md:w-80"
                />
                <img
                  src={MOCKUP_PHONE}
                  alt="Mockup Celular"
                  className="w-16 sm:w-24 object-contain drop-shadow-xl md:w-36 -mb-1 sm:-mb-3 hidden sm:block"
                />
              </div>

              <div className="mb-6 flex flex-col items-center">
                <span className="mb-1 text-base font-medium text-stone-500 line-through sm:text-lg">Valor normal: $47.00</span>
                <span className="text-4xl font-extrabold tracking-tight text-[#166534] sm:text-5xl md:text-6xl">
                  Ahora solo $11.97
                </span>
              </div>

              <a
                href="https://pay.hotmart.com/W105526885V?checkoutMode=10&off=qmsrqdaf"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex w-full items-center justify-center gap-2 sm:gap-3 overflow-hidden rounded-full bg-[#15803d] px-4 sm:px-6 py-4 sm:py-5 text-[15px] sm:text-xl font-bold text-white shadow-[0_8px_30px_rgb(21,128,61,0.3)] transition-all hover:scale-105 hover:bg-[#166534] hover:shadow-[0_8px_40px_rgb(21,128,61,0.4)] active:scale-95 sm:w-auto md:px-14 whitespace-nowrap"
              >
                <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                  <div className="relative h-full w-12 bg-white/20" />
                </span>
                <span>QUIERO ADQUIRIR AHORA</span>
              </a>
              
              <p className="mt-6 text-xs sm:text-sm text-stone-500 font-medium">
                🔒 Pago 100% seguro. Acceso inmediato al finalizar tu orden.
              </p>
            </div>
            
            {/* TEXTO DEBAJO DE LA OFERTA */}
            <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-stone-700 md:text-2xl text-balance">
              La decisión es tuya. Puedes seguir despertando mañana con el mismo dolor articular y la misma frustración frente al espejo... O puedes unirte a las mujeres que ya están usando la medicina de la tierra.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
