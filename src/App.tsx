/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Leaf, Sun, Droplets, Sparkles, ArrowRight, Play } from "lucide-react";

const CustomVideo = ({ src, className, onTimeUpdate }: { src: string; className?: string; onTimeUpdate?: any }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={src}
        className={className}
        controls
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={onTimeUpdate}
      />
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-all hover:bg-black/10"
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.play();
            }
          }}
        >
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#15803d] text-white shadow-[0_0_30px_rgb(21,128,61,0.5)] transition-transform hover:scale-110">
            <Play className="h-8 w-8 sm:h-10 sm:w-10 ml-1 sm:ml-1.5" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [showHeroButton, setShowHeroButton] = useState(false);
  const [email, setEmail] = useState("");
  const MOCKUP_BOOK =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059099/mockup_libro_desintoxica_tu_cuerpo_en_21_dias-Photoroom.png";
  const MOCKUP_TABLET =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059098/mockup_tablet_desintoxica_tu_cuerpo_en_21_dias-Photoroom.png";
  const MOCKUP_PHONE =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059098/mockup_celular_desintoxica_tu_cuerpo_en_21_dias-Photoroom.png";
  const AVATAR =
    "https://res.cloudinary.com/nudnxkcm/image/upload/v1789059369/Avatar_Abuela_Tulun.jpg";

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800 selection:bg-emerald-200 overflow-x-hidden flex flex-col w-full max-w-[100vw]">
      {/* BANNER SUPERIOR DE ADVERTENCIA */}
      <div className="bg-amber-400 px-4 py-2 text-center text-sm font-bold tracking-wide text-amber-950 md:text-base">
        ATENCIÓN: Para mujeres de más de 40 años que sienten que su cuerpo "retiene todo"
      </div>

      {/* SECCIÓN 1: HERO */}
      <section className="relative overflow-hidden px-4 pt-6 pb-10 sm:px-6 md:pt-10 md:pb-16">
        {/* Subtle background blob */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-900/5 blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-amber-600/5 blur-3xl"></div>

        <div className="mx-auto max-w-5xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center"
          >
            <h1 className="mx-auto mb-4 max-w-4xl text-balance font-serif text-[22px] font-bold leading-[1.15] tracking-tight text-[#166534] sm:text-4xl md:text-5xl lg:text-6xl sm:leading-tight">
              Cómo Vaciar Tu Abdomen, Apagar El Dolor Articular Y Reactivar Tu Metabolismo En 21 Días... Sin Pastillas De Farmacia.
            </h1>
            <div className="mt-4 mb-6 sm:mb-8 flex justify-center">
              <p className="inline-block rounded-lg bg-amber-400 px-4 py-2 text-sm sm:text-base md:text-lg font-bold text-amber-950 whitespace-nowrap shadow-sm">
                Mira el vídeo abajo y transforma tu vida
              </p>
            </div>
          </motion.div>

          {/* VSL VIDEO SECTION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mx-auto mb-6 w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-stone-900/5 bg-stone-900 sm:mb-8"
          >
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
          </motion.div>

          {showHeroButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center w-full"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const baseUrl = "https://pay.hotmart.com/W105526885V?checkoutMode=10&off=qmsrqdaf";
                  const url = email ? `${baseUrl}&email=${encodeURIComponent(email)}` : baseUrl;
                  window.open(url, "_blank");
                }}
                className="group relative inline-flex w-full items-center justify-center gap-1.5 sm:gap-3 overflow-hidden rounded-full bg-[#15803d] px-3 sm:px-6 py-4 sm:py-5 text-[14px] sm:text-lg font-bold text-white shadow-[0_8px_30px_rgb(21,128,61,0.3)] transition-all hover:scale-105 hover:bg-[#166534] hover:shadow-[0_8px_40px_rgb(21,128,61,0.4)] active:scale-95 sm:w-auto md:px-10 md:text-xl text-center leading-tight"
              >
                <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                  <div className="relative h-full w-8 bg-white/20" />
                </span>
                <span className="flex-1">QUIERO DESENTOXICAR MI CUERPO</span>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-1 shrink-0" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* SECCIÓN 2: EL PROBLEMA */}
      <section className="bg-white px-4 pt-6 pb-10 sm:px-6 md:pt-8 md:pb-16">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-4 sm:space-y-5 text-base leading-relaxed text-stone-700 sm:text-lg md:text-xl md:leading-loose"
          >
            <motion.p variants={fadeUp}>
              Estás agotada. Agotada de hacer dietas que te matan de hambre y ver que la báscula no se mueve. Cansada de despertar con las manos hinchadas, pesadez en las piernas y un dolor de espalda que no te deja disfrutar tu día.
            </motion.p>
            <motion.p variants={fadeUp} className="font-semibold text-stone-900">
              Pero necesito que leas esto con atención: No es tu culpa.
            </motion.p>
            <motion.p variants={fadeUp}>
              Esa hinchazón abdominal y esa fatiga crónica no son por "comer de más" ni por "falta de voluntad". Es tu hígado pidiendo auxilio y una severa resistencia a la insulina bloqueando tu metabolismo.
            </motion.p>
            <motion.p variants={fadeUp}>
              La industria farmacéutica quiere que creas que a tu edad el dolor es normal, para mantenerte atada a sus analgésicos. Pero tu cuerpo solo necesita un botón de reinicio.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN 3: TESTIMONIOS Y LA AUTORIDAD */}
      <section className="bg-[#14532D] px-4 py-10 text-stone-50 sm:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">

          {/* TESTIMONIOS */}
          <div className="mb-12 sm:mb-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center mb-6 sm:mb-8"
            >
              <h2 className="mx-auto max-w-2xl font-serif text-2xl font-bold leading-tight text-[#FDFBF7] sm:text-3xl md:text-4xl text-balance">
                Ellas ya desintoxicaron su cuerpo y apagaron el dolor
              </h2>
            </motion.div>

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
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative mx-auto w-full max-w-[260px] sm:max-w-sm lg:mx-0 lg:max-w-none"
            >
              <div className="absolute -inset-3 sm:-inset-4 rounded-2xl bg-emerald-800/50 blur-lg"></div>
              <img
                src={AVATAR}
                alt="Autora"
                className="relative aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl shadow-black/40 ring-1 ring-white/10"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-4 sm:space-y-6 text-center lg:text-left"
            >
              <motion.h2
                variants={fadeUp}
                className="font-serif text-2xl font-bold leading-tight text-[#FDFBF7] sm:text-3xl md:text-4xl"
              >
                El Método Que La Industria Médica Intenta Ocultar
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="text-base leading-relaxed text-emerald-100 sm:text-lg md:text-xl"
              >
                Las dietas de moda fallan porque intentan quemar grasa en un cuerpo intoxicado. Es como intentar limpiar el piso con agua sucia. Para volver a sentirte ligera, primero debes destapar tus órganos filtro.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="rounded-xl border border-emerald-700 bg-emerald-900/50 p-4 sm:p-5 md:p-6 backdrop-blur-sm text-center sm:text-left"
              >
                <p className="text-[15px] sm:text-lg font-bold text-amber-400 leading-snug text-balance">
                  El método ancestral para deshinchar tu vientre, frenar el dolor y reactivar tu metabolismo.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: ENTREGABLES */}
      <section className="px-4 py-10 sm:px-6 md:py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-6 text-center sm:mb-10"
          >
            <h2 className="font-serif text-2xl font-bold text-[#166534] sm:text-3xl md:text-4xl">
              Tu Transformación<br />Paso a Paso
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-4 sm:gap-5 lg:gap-6 md:grid-cols-2"
          >
            {/* Item 1 */}
            <motion.div variants={fadeUp} className="group rounded-2xl bg-white p-5 sm:p-6 shadow-lg shadow-emerald-900/5 ring-1 ring-stone-200 transition-all hover:shadow-xl hover:shadow-emerald-900/10">
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
            </motion.div>

            {/* Item 2 */}
            <motion.div variants={fadeUp} className="group rounded-2xl bg-white p-5 sm:p-6 shadow-lg shadow-emerald-900/5 ring-1 ring-stone-200 transition-all hover:shadow-xl hover:shadow-emerald-900/10">
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
            </motion.div>

            {/* Item 3 */}
            <motion.div variants={fadeUp} className="group rounded-2xl bg-white p-5 sm:p-6 shadow-lg shadow-emerald-900/5 ring-1 ring-stone-200 transition-all hover:shadow-xl hover:shadow-emerald-900/10 sm:col-span-2 md:col-span-1 lg:col-span-2 lg:max-w-xl lg:mx-auto lg:w-full">
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN 5: CIERRE Y CTA FINAL */}
      <section id="checkout" className="bg-[#FDFBF7] px-4 py-10 sm:px-6 md:py-16 border-t border-stone-200">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="flex flex-col items-center"
          >
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
                  Hoy solo $14.97
                </span>
              </div>

              <div className="w-full flex flex-col items-center">
                <div className="mb-4 flex w-full max-w-sm flex-col items-center mx-auto">
                  <input
                    type="email"
                    placeholder="Ingresa tu mejor correo..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full border-2 border-stone-200 px-5 py-3 sm:py-4 text-center text-stone-800 placeholder:text-stone-400 focus:border-[#15803d] focus:outline-none focus:ring-2 focus:ring-[#15803d]/30 transition-all text-base sm:text-lg"
                    required
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (!email) {
                      alert("Por favor, ingresa tu correo electrónico antes de continuar.");
                      return;
                    }
                    const url = `https://pay.hotmart.com/W105526885V?checkoutMode=10&off=qmsrqdaf&email=${encodeURIComponent(email)}`;
                    window.open(url, "_blank");
                  }}
                  className="group relative inline-flex w-full items-center justify-center gap-2 sm:gap-3 overflow-hidden rounded-full bg-[#15803d] px-4 sm:px-6 py-4 sm:py-5 text-[15px] sm:text-xl font-bold text-white shadow-[0_8px_30px_rgb(21,128,61,0.3)] transition-all hover:scale-105 hover:bg-[#166534] hover:shadow-[0_8px_40px_rgb(21,128,61,0.4)] active:scale-95 sm:w-auto md:px-14 whitespace-nowrap"
                >
                  <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                    <div className="relative h-full w-12 bg-white/20" />
                  </span>
                  <span>QUIERO ADQUIRIR AHORA</span>
                </button>
              </div>
              
              <p className="mt-6 text-xs sm:text-sm text-stone-500 font-medium">
                🔒 Pago 100% seguro. Acceso inmediato al finalizar tu orden.
              </p>
            </div>
            
            {/* TEXTO DEBAJO DE LA OFERTA */}
            <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-stone-700 md:text-2xl text-balance">
              La decisión es tuya. Puedes seguir despertando mañana con el mismo dolor articular y la misma frustración frente al espejo... O puedes unirte a las mujeres que ya están usando la medicina de la tierra.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
