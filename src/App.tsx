/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Leaf, Sun, Droplets, Sparkles, ArrowRight } from "lucide-react";
import { useGeoCurrency } from "./hooks/useGeoCurrency";
import { useTelegramTracker } from "./hooks/useTelegramTracker";

const CustomVideo = ({
  src,
  className
}: {
  src: string;
  className?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={src}
        className={className}
        controls
        preload="metadata"
      />
    </div>
  );
};

export default function App() {
  const [timeLeft, setTimeLeft] = useState(59 * 60); // Inicia exactamente en 59 minutos (3540 segundos: 00h : 59m : 00s)
  const geo = useGeoCurrency();
  const { trackCheckoutClick } = useTelegramTracker(geo.countryName);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const MOCKUP_BOOK =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059099/mockup_libro_desintoxica_tu_cuerpo_en_21_dias-Photoroom.png";
  const MOCKUP_TABLET =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059098/mockup_tablet_desintoxica_tu_cuerpo_en_21_dias-Photoroom.png";
  const MOCKUP_PHONE =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059098/mockup_celular_desintoxica_tu_cuerpo_en_21_dias-Photoroom.png";
  const AVATAR =
    "https://res.cloudinary.com/nudnxkcm/image/upload/f_auto/q_auto/Enhance_this_photo._2K_20260923223342.jpg";

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#212121] selection:bg-emerald-200 overflow-x-hidden flex flex-col w-full max-w-[100vw]">
      {/* BANNER SUPERIOR DE ADVERTENCIA */}
      <div className="bg-amber-400 px-4 py-2.5 text-center text-base font-bold tracking-normal text-amber-950 sm:text-lg">
        Atención: Para la mujer que siente que su propio cuerpo se convirtió en su enemigo.
      </div>

      {/* SECCIÓN 1: HERO */}
      <section className="relative overflow-hidden px-4 pt-6 pb-6 sm:px-6 md:pt-10 md:pb-8">
        {/* Subtle background blob */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-900/5 blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-amber-600/5 blur-3xl"></div>

        <div className="mx-auto max-w-4xl relative z-10">
          <div className="text-center">
            <h1 className="mx-auto max-w-4xl font-serif font-bold tracking-tight text-[#166534]">
              <span className="block text-[22px] leading-[1.3] sm:text-3xl md:text-4xl lg:text-5xl sm:leading-tight font-serif">
                <span className="block">Cómo Desinflamar Tu Vientre,</span>
                <span className="block">Apagar El Dolor Articular</span>
                <span className="block">Y Recuperar Tu Energía</span>
                <span className="block mt-1 sm:mt-2">En 21 Días...</span>
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: EL PROBLEMA */}
      <section className="bg-white px-4 pt-6 pb-12 sm:px-6 md:pt-8 md:pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-6 text-lg sm:text-xl md:text-2xl leading-[1.75] text-[#212121]">
            <p>
              Hija, respira. Y por un momento, deja de culparte.
            </p>
            <p>
              Sé lo que has pensado frente al espejo. Te preguntas por qué te levantas con el vientre hinchado, por qué tus rodillas duelen y tu espalda se queja. Estás agotada de hacer dietas que te matan de hambre para luego abandonarlas sintiéndote culpable.
            </p>
            <p>
              Quizá alguien te dijo que es simplemente la edad, que después de los 40 es normal.
            </p>
            <p className="font-serif font-bold text-[#166534] text-xl sm:text-2xl md:text-3xl">
              Pero escucha bien a esta vieja abuela: Tu cuerpo no está roto.
            </p>
            <p>
              Ha soportado noches sin dormir, estrés, cambios hormonales y tantas veces en las que pusiste a todos los demás primero. La industria farmacéutica quiere que creas que la única salida es vivir tomando analgésicos. Pero tu cuerpo es como una antigua casa de campo: no está enojada contigo, simplemente necesita atención y que abras las ventanas.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: TESTIMONIOS Y LA AUTORIDAD */}
      <section className="bg-[#14532D] px-4 py-12 text-stone-50 sm:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">

          {/* TESTIMONIOS */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="mx-auto max-w-2xl font-serif text-2xl font-bold leading-snug text-[#FDFBF7] sm:text-3xl md:text-4xl text-balance">
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

            <div className="space-y-5 text-center lg:text-left">
              <h2 className="font-serif text-2xl font-bold leading-snug text-[#FDFBF7] sm:text-3xl md:text-4xl">
                El Método Ancestral de 21 Días
              </h2>

              <p className="text-lg leading-[1.7] text-emerald-100 sm:text-xl md:text-2xl">
                No quiero darte pociones mágicas ni que vivas contando calorías con angustia. Quiero enseñarte a regresar a lo sencillo: comida real, plantas utilizadas con prudencia, movimiento suave y descanso.
              </p>

              <div className="rounded-xl border border-emerald-700 bg-emerald-900/50 p-4 sm:p-5 md:p-6 backdrop-blur-sm text-center sm:text-left">
                <p className="text-base sm:text-xl font-bold text-amber-300 leading-snug text-balance">
                  El método ancestral para deshinchar tu vientre, frenar el dolor y reactivar tu metabolismo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: ENTREGABLES */}
      <section className="px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="font-serif text-2xl font-bold text-[#166534] sm:text-3xl md:text-4xl">
              Tu Transformación<br />Paso a Paso
            </h2>
          </div>

          <div className="grid gap-5 sm:gap-6 lg:gap-8 md:grid-cols-2">
            {/* Item 1 */}
            <div className="group rounded-2xl bg-white p-6 sm:p-7 shadow-lg shadow-emerald-900/5 ring-1 ring-stone-200 transition-all hover:shadow-xl hover:shadow-emerald-900/10">
              <div className="mb-3 sm:mb-4 inline-flex rounded-xl bg-emerald-100 p-3 text-[#166534]">
                <Droplets className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="mb-2 text-xl sm:text-2xl font-serif font-bold text-[#212121]">
                Fase 1 (Días 1-7)<br />
                <span className="text-[#B45309]">Drenaje Profundo</span>
              </h3>
              <p className="text-base sm:text-lg text-[#212121] leading-[1.65]">
                Expulsa el líquido retenido y la hinchazón severa. Volverás a abrocharte el pantalón sin que te apriete.
              </p>
            </div>

            {/* Item 2 */}
            <div className="group rounded-2xl bg-white p-6 sm:p-7 shadow-lg shadow-emerald-900/5 ring-1 ring-stone-200 transition-all hover:shadow-xl hover:shadow-emerald-900/10">
              <div className="mb-3 sm:mb-4 inline-flex rounded-xl bg-emerald-100 p-3 text-[#166534]">
                <Sun className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="mb-2 text-xl sm:text-2xl font-serif font-bold text-[#212121]">
                Fase 2 (Días 8-14)<br />
                <span className="text-[#B45309]">Reseteo Metabólico</span>
              </h3>
              <p className="text-base sm:text-lg text-[#212121] leading-[1.65]">
                Usa las combinaciones exactas para apagar la resistencia a la insulina y derretir la grasa estancada.
              </p>
            </div>

            {/* Item 3 */}
            <div className="group rounded-2xl bg-white p-6 sm:p-7 shadow-lg shadow-emerald-900/5 ring-1 ring-stone-200 transition-all hover:shadow-xl hover:shadow-emerald-900/10 sm:col-span-2 md:col-span-1 lg:col-span-2 lg:max-w-xl lg:mx-auto lg:w-full">
              <div className="mb-3 sm:mb-4 inline-flex rounded-xl bg-emerald-100 p-3 text-[#166534]">
                <Leaf className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="mb-2 text-xl sm:text-2xl font-serif font-bold text-[#212121]">
                Fase 3 (Días 15-21)<br />
                <span className="text-[#B45309]">Alivio y Rejuvenecimiento</span>
              </h3>
              <p className="text-base sm:text-lg text-[#212121] leading-[1.65]">
                Recetas antiinflamatorias intensivas que apagan el fuego en tus rodillas, lumbares y articulaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: CIERRE Y CTA FINAL */}
      <section id="checkout" className="bg-[#FDFBF7] px-4 py-12 sm:px-6 md:py-16 border-t border-stone-200">
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

              <div className="mb-8 flex flex-col items-center text-center">
                <span className="mb-2 text-lg sm:text-xl font-medium text-stone-500 line-through">
                  Valor normal: {geo.originalPriceFormatted}
                </span>
                <div className="flex flex-col items-center leading-tight w-full">
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#212121] tracking-tight">
                    Ahora solo
                  </span>
                  <span className="text-[32px] sm:text-5xl md:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight text-[#166534] my-2 whitespace-nowrap text-center">
                    {geo.currentPriceFormatted}
                  </span>
                  <p className="mt-3 text-sm sm:text-base font-bold text-stone-800 max-w-lg mx-auto text-center leading-relaxed">
                    Valor aproximado. El precio exacto se mostrará al finalizar tu compra y puede variar según la conversión de moneda e impuestos de tu país.
                  </p>
                </div>
              </div>

              <a
                href="https://pay.hotmart.com/W105526885V?off=qmsrqdaf&checkoutMode=10"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCheckoutClick("Botón (Oferta Final)")}
                className="group relative inline-flex w-full items-center justify-center gap-2 sm:gap-3 overflow-hidden rounded-full bg-[#15803d] px-6 py-4 sm:py-5 text-base sm:text-xl font-bold text-white shadow-[0_8px_30px_rgb(21,128,61,0.3)] transition-all hover:scale-105 hover:bg-[#166534] hover:shadow-[0_8px_40px_rgb(21,128,61,0.4)] active:scale-95 sm:w-auto md:px-14 whitespace-nowrap"
              >
                <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                  <div className="relative h-full w-12 bg-white/20" />
                </span>
                <span>QUIERO ADQUIRIR AHORA</span>
              </a>

              {/* CONTADOR DEBAJO DEL BOTÓN DE COMPRAR */}
              <div className="mt-6 sm:mt-8 flex flex-col items-center w-full max-w-lg mx-auto bg-stone-50 border border-stone-200/80 rounded-2xl py-4 px-3 sm:px-6 shadow-sm">
                <p className="text-red-600 font-extrabold text-[12px] min-[380px]:text-sm sm:text-base tracking-wider uppercase mb-3 flex items-center justify-center gap-1.5 text-center whitespace-nowrap">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
                  <span>ESTA OFERTA TERMINA PRONTO</span>
                </p>
                <div className="flex gap-2 sm:gap-3 items-center justify-center">
                  {/* HORAS */}
                  <div className="flex flex-col items-center">
                    <div className="bg-stone-900 text-white font-mono font-bold text-2xl sm:text-4xl min-w-[50px] sm:min-w-[70px] text-center px-2.5 sm:px-3 py-1.5 sm:py-2.5 rounded-lg shadow-inner shadow-black/50 tracking-tighter">
                      {Math.floor(timeLeft / 3600).toString().padStart(2, '0')}
                    </div>
                    <span className="text-[11px] sm:text-xs text-stone-600 font-bold uppercase tracking-wider mt-1">Horas</span>
                  </div>
                  <span className="text-stone-900 font-bold text-2xl sm:text-3xl -mt-4 sm:-mt-5 animate-pulse">:</span>
                  {/* MINUTOS */}
                  <div className="flex flex-col items-center">
                    <div className="bg-stone-900 text-white font-mono font-bold text-2xl sm:text-4xl min-w-[50px] sm:min-w-[70px] text-center px-2.5 sm:px-3 py-1.5 sm:py-2.5 rounded-lg shadow-inner shadow-black/50 tracking-tighter">
                      {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}
                    </div>
                    <span className="text-[11px] sm:text-xs text-stone-600 font-bold uppercase tracking-wider mt-1">Minutos</span>
                  </div>
                  <span className="text-stone-900 font-bold text-2xl sm:text-3xl -mt-4 sm:-mt-5 animate-pulse">:</span>
                  {/* SEGUNDOS */}
                  <div className="flex flex-col items-center">
                    <div className="bg-stone-900 text-white font-mono font-bold text-2xl sm:text-4xl min-w-[50px] sm:min-w-[70px] text-center px-2.5 sm:px-3 py-1.5 sm:py-2.5 rounded-lg shadow-inner shadow-black/50 tracking-tighter">
                      {(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <span className="text-[11px] sm:text-xs text-stone-600 font-bold uppercase tracking-wider mt-1">Segundos</span>
                  </div>
                </div>
              </div>
              
              <p className="mt-6 text-sm sm:text-base text-stone-500 font-medium">
                🔒 Pago 100% seguro. Acceso inmediato al finalizar tu orden.
              </p>
            </div>
            
            {/* TEXTO DEBAJO DE LA OFERTA */}
            <p className="max-w-2xl text-lg sm:text-xl leading-[1.75] text-[#212121] font-serif md:text-2xl text-balance">
              La decisión es tuya. Puedes seguir despertando mañana con el mismo dolor articular y la misma frustración frente al espejo... O puedes unirte a las mujeres que ya están usando la medicina de la tierra.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
