// Vuelve arriba de todo sin cambiar la dirección de la página
function subir() {
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' })
}

export default function Footer() {
  return (
      <footer className="flex shrink-0 min-h-[90px] px-5 py-6 flex-wrap items-center justify-center gap-x-7 gap-y-3.5 mt-12 border-t-[3px] border-background bg-secondary">
          <a className="inline-flex px-3 py-2 items-center gap-2 rounded-[10px] text-[0.94rem] font-semibold text-white no-underline opacity-80 hover:opacity-100 [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:text-white hover:bg-[rgba(255,255,255,0.12)] hover:[transform:translateY(-1px)] focus-visible:text-white focus-visible:bg-[rgba(255,255,255,0.12)] focus-visible:[transform:translateY(-1px)]" href="mailto:soft-tecnology@gmail.com"><i className="fa-solid fa-envelope"></i>Enviar Email</a>
          <a className="inline-flex px-3 py-2 items-center gap-2 rounded-[10px] text-[0.94rem] font-semibold text-white no-underline opacity-80 hover:opacity-100 [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:text-white hover:bg-[rgba(255,255,255,0.12)] hover:[transform:translateY(-1px)] focus-visible:text-white focus-visible:bg-[rgba(255,255,255,0.12)] focus-visible:[transform:translateY(-1px)]" href="https://www.instagram.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-instagram"></i>Instagram</a>
          <button type="button" onClick={subir} className="footer-top inline-flex items-center gap-2 px-4 py-2 border border-background rounded-[999px] bg-transparent text-white text-[0.94rem] font-semibold cursor-pointer [transition:background-color_0.2s,color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:bg-background hover:text-secondary hover:[transform:translateY(-1px)] focus-visible:bg-background focus-visible:text-secondary focus-visible:[transform:translateY(-1px)] focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-2" aria-label="Volver al inicio de la página"><i className="fa-solid fa-arrow-up" aria-hidden="true"></i>Subir</button>
      </footer>
  )
}
