<template>

  <!-- Navbar di-teleport ke body agar position:fixed selalu bekerja -->
  <Teleport to="body">
    <!-- ── Navbar bar ── -->
    <header class="lp-nav" :class="{ 'lp-nav--solid': scrolled }">
      <div class="lp-nav__inner">
        <a href="/" class="lp-nav__brand">
          <img :src="logoUrl" alt="Naspiotech" class="lp-nav__logo" />
          <span>Naspiotech</span>
        </a>

        <!-- Desktop links — disembunyikan di mobile -->
        <nav class="lp-nav__links">
          <a href="#about-naspion" class="lp-nav__link">About</a>
          <a href="#why-ngt"       class="lp-nav__link">NGT</a>
          <a href="#pkm-kc"        class="lp-nav__link">PKM‑KC</a>
          <a href="#our-team"      class="lp-nav__link">Tim</a>
        </nav>

        <div class="lp-nav__actions">
          <router-link to="/login" class="lp-nav__cta lp-nav__cta--desktop">Masuk</router-link>
          <button
            class="lp-nav__burger"
            :class="{ 'is-active': mobileOpen }"
            :aria-label="mobileOpen ? 'Tutup menu' : 'Buka menu'"
            @click="mobileOpen = !mobileOpen"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>

    <!-- Backdrop — sibling dari header, position:fixed ke viewport -->
    <Transition name="lp-fade">
      <div v-if="mobileOpen" class="lp-mob-backdrop" @click="close" />
    </Transition>

    <!-- Side drawer kanan — sibling dari header, bergaya dashboard -->
    <aside class="lp-mob-drawer" :class="{ 'is-open': mobileOpen }">
      <div class="lp-mob-drawer__head">
        <div class="lp-mob-drawer__brand">
          <div class="lp-mob-drawer__logo-box">
            <img :src="logoUrl" alt="Naspiotech" />
          </div>
          <div>
            <span class="lp-mob-drawer__name">Naspiotech</span>
            <span class="lp-mob-drawer__sub">Realtime CO₂ Sensing</span>
          </div>
        </div>
        <button class="lp-mob-drawer__close" @click="close" aria-label="Tutup menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <nav class="lp-mob-drawer__nav">
        <a href="#about-naspion" class="lp-mob-drawer__link" @click="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          About
        </a>
        <a href="#why-ngt" class="lp-mob-drawer__link" @click="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          NGT
        </a>
        <a href="#pkm-kc" class="lp-mob-drawer__link" @click="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          PKM‑KC
        </a>
        <a href="#our-team" class="lp-mob-drawer__link" @click="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Tim
        </a>
      </nav>

      <router-link to="/login" class="lp-mob-drawer__cta" @click="close">Masuk</router-link>
    </aside>
  </Teleport>

  <!-- ════════════════════════════════════════════════════════════
       PAGE CONTENT
       ════════════════════════════════════════════════════════════ -->
  <main class="lp">

    <!-- ───────── HERO ───────── -->
    <section class="lp-hero">
      <div class="lp-hero__glow lp-hero__glow--a" />
      <div class="lp-hero__glow lp-hero__glow--b" />

      <div class="lp-wrap lp-hero__grid">
        <div class="lp-hero__copy">
          <h1 class="lp-hero__h1 lp-hero-anim" style="--d:.28s">
            Early Detection<br />
            <span class="lp-hero__accent">Better Protection</span>
          </h1>
          <p class="lp-hero__sub lp-hero-anim" style="--d:.44s">
            Naspiotech membaca kadar CO₂ secara real-time untuk memberi
            sinyal awal saat posisi selang NGT perlu diperiksa ulang.
          </p>
          <div class="lp-hero__btns lp-hero-anim" style="--d:.58s">
            <router-link to="/login" class="lp-btn lp-btn--solid">Masuk / Daftar</router-link>
            <a href="#why-ngt" class="lp-btn lp-btn--ghost">Pelajari NGT</a>
          </div>
        </div>

        <div class="lp-hero__visual lp-hero-anim lp-hero-anim--right" style="--d:.3s">
          <div class="lp-card-3d">
            <div class="lp-switcher">
              <img
                v-for="(item, i) in switcherItems"
                :key="item.alt"
                :src="item.src"
                :alt="item.alt"
                class="lp-switcher__item"
                :style="{
                  '--switcher-delay': `${i * 2.4}s`,
                  '--switcher-duration': '16.8s'
                }"
              />
            </div>
          </div>
          <div class="lp-pill lp-pill--a">
            <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            CO₂ Realtime
          </div>
          <div class="lp-pill lp-pill--b">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Patient Safe
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── ABOUT ───────── -->
    <section class="lp-section" id="about-naspion">
      <div class="lp-wrap">
        <div class="lp-section__head" data-reveal>
          <h2 class="lp-h2">Apa Itu Naspiotech?</h2>
          <p class="lp-desc">
            Naspiotech adalah sistem pemantauan berbasis sensor CO₂ yang dirancang khusus
            untuk mendukung keamanan penggunaan selang NGT. Bukan pengganti prosedur klinis —
            melainkan alat bantu agar kondisi yang perlu diperhatikan lebih cepat terdeteksi.
          </p>
        </div>

        <div class="lp-feat-grid">
          <div v-for="(f, i) in features" :key="f.label"
               class="lp-feat" data-reveal="scale" :data-delay="i + 1">
            <div class="lp-feat__icon" v-html="f.icon" />
            <h3>{{ f.label }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── NGT ───────── -->
    <section class="lp-section lp-section--dim" id="why-ngt">
      <div class="lp-wrap">
        <div class="lp-section__head" data-reveal="left">
          <h2 class="lp-h2">Selang NGT & Risikonya</h2>
          <p class="lp-desc">
            NGT (Nasogastric Tube) adalah selang yang masuk lewat hidung menuju lambung,
            digunakan untuk pemberian nutrisi atau obat. Posisi selang yang melenceng ke
            saluran napas bisa menimbulkan komplikasi serius — mulai dari batuk, sesak,
            hingga pneumonia aspirasi.
          </p>
        </div>

        <div class="lp-risk-grid">
          <div v-for="(r, i) in risks" :key="r.title"
               class="lp-risk-card" data-reveal :data-delay="i + 1">
            <div class="lp-risk-card__num">{{ String(i+1).padStart(2,'0') }}</div>
            <div class="lp-risk-card__icon" v-html="r.icon" />
            <h3>{{ r.title }}</h3>
            <p>{{ r.desc }}</p>
          </div>
        </div>

        <div class="lp-center" data-reveal>
          <router-link to="/login" class="lp-btn lp-btn--solid">Mulai Pantau</router-link>
        </div>
      </div>
    </section>

    <!-- ───────── CO₂ ───────── -->
    <section class="lp-section" id="co2-ngt">
      <div class="lp-wrap">
        <div class="lp-section__head" data-reveal="right">
          <h2 class="lp-h2">Kenapa CO₂?</h2>
          <p class="lp-desc">
            Saat selang NGT menyasar ke saluran napas, bacaan CO₂ akan berbeda
            dari kondisi normal. Perbedaan inilah yang ditangkap sensor dan ditampilkan
            di dashboard sebagai peringatan awal.
          </p>
        </div>

        <div class="lp-flow" data-reveal>
          <template v-for="(s, i) in flowSteps" :key="s">
            <div class="lp-flow__step">
              <div class="lp-flow__num">{{ i + 1 }}</div>
              <span>{{ s }}</span>
            </div>
            <div v-if="i < flowSteps.length - 1" class="lp-flow__arrow">›</div>
          </template>
        </div>

        <div class="lp-co2-grid">
          <div v-for="(c, i) in co2Cards" :key="c.title"
               class="lp-co2-card" data-reveal="scale" :data-delay="i + 1">
            <div class="lp-co2-card__icon" v-html="c.icon" />
            <h3>{{ c.title }}</h3>
            <p>{{ c.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── PKM-KC ───────── -->
    <section class="lp-section lp-section--dim" id="pkm-kc">
      <div class="lp-wrap">
        <div class="lp-pkm-grid">
          <div class="lp-pkm__left" data-reveal="left">
            <h2 class="lp-h2">PKM-KC</h2>
            <p class="lp-desc">
              PKM Karsa Cipta mendorong mahasiswa menciptakan karya teknologi
              yang punya nilai guna nyata. Naspiotech lahir dari sini — prototipe
              monitoring NGT yang mencoba menjawab kebutuhan nyata di lingkungan klinis.
            </p>
            <router-link to="/login" class="lp-btn lp-btn--solid" style="margin-top:8px">
              Lihat Dashboard
            </router-link>
          </div>
          <div class="lp-pkm__right">
            <div v-for="(v, i) in pkmValues" :key="v.title"
                 class="lp-pkm-card" data-reveal="right" :data-delay="i + 1">
              <div class="lp-pkm-card__icon" v-html="v.icon" />
              <div>
                <h3>{{ v.title }}</h3>
                <p>{{ v.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── TEAM ───────── -->
    <section class="lp-section lp-section--team" id="our-team">
      <div class="lp-wrap">
        <div class="lp-section__head lp-section__head--center" data-reveal>
          <h2 class="lp-h2">Meet the Team</h2>
          <p class="lp-desc">
            Lima mahasiswa, satu tujuan — membangun alat monitoring NGT yang benar-benar bisa dipakai di lapangan.
          </p>
        </div>
      </div>

      <!-- Carousel 3-card, card tengah ditonjolkan -->
      <div class="lp-carousel">
        <div class="lp-carousel__track" :style="cTrackStyle">
          <div
            v-for="(m, i) in cItems"
            :key="`tc-${i}`"
            class="lp-carousel__card"
            :class="cCardClass(i)"
          >
            <div class="lp-team-photo-wrap">
              <img :src="m.photo" :alt="m.name" class="lp-team-photo" />
            </div>
            <div class="lp-team-info">
              <h3>{{ m.name }}</h3>
              <div class="lp-team-role">{{ m.role }}</div>
              <p>{{ m.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────── FOOTER ───────── -->
    <footer class="lp-footer">
      <div class="lp-wrap lp-footer__grid">
        <div class="lp-footer__brand">
          <div class="lp-footer__brand-name">
            <img :src="logoUrl" alt="Naspiotech" />
            <span>Naspiotech</span>
          </div>
          <p>Realtime CO₂ monitoring untuk keamanan pemasangan NGT.</p>
          <p class="lp-footer__note">
            Sistem ini adalah alat bantu pemantauan. Bukan pengganti penilaian klinis.
          </p>
        </div>

        <div class="lp-footer__col">
          <strong>Navigasi</strong>
          <a href="#about-naspion">About Naspiotech</a>
          <a href="#why-ngt">NGT & Risiko</a>
          <a href="#pkm-kc">PKM-KC</a>
          <a href="#our-team">Tim</a>
          <router-link to="/login">Login</router-link>
        </div>

        <div class="lp-footer__col">
          <strong>Kontak</strong>
          <a href="mailto:pkmkcnaspionundip@gmail.com" class="lp-footer__link">
            <span v-html="ic.mail" class="lp-footer__ico" />
            pkmkcnaspionundip@gmail.com
          </a>
          <a href="https://www.instagram.com/naspiontech/" class="lp-footer__link">
            <span v-html="ic.insta" class="lp-footer__ico" />
            @naspiotech
          </a>
          <a href="https://www.tiktok.com/@naspion_pkmkc" class="lp-footer__link">
            <span v-html="ic.tiktok" class="lp-footer__ico" />
            @naspion_pkmkc
          </a>
          <a href="https://wa.me/6285225396839" class="lp-footer__link">
            <span v-html="ic.phone" class="lp-footer__ico" />
            +62 852-2539-6839
          </a>
        </div>
      </div>

      <div class="lp-footer__bar">
        <div class="lp-wrap">© 2026 Naspiotech · PKM-KC · All rights reserved.</div>
      </div>
    </footer>

  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import logoUrl   from '@/assets/logo-pkm-erfat.png'
import mascotUrl  from '@/assets/MaskotNaspion.png'
import SimbelmawaUrl  from '@/assets/Simbelmawa.png'
import PKMUrl  from '@/assets/PKM.png'
import KemdiktiUrl  from '@/assets/Kemdikti.png'
import BelmawaUrl  from '@/assets/Belmawa.png'
import DiktiUrl  from '@/assets/Dikti.png'
import salsaPhoto  from '@/assets/Salsa-Project Leader.png'
import erfatPhoto  from '@/assets/Erfat-Clinical Research.png'
import fatikaPhoto from '@/assets/Fatika-Clinical Validation.png'
import fahriPhoto  from '@/assets/Fahri-Software Engineer.png'
import vidiPhoto   from '@/assets/Vidi-Hardware Engineer.png'
import adhePhoto   from '@/assets/Adhe Setya Pramayoga, S.kom., M.T-Pembina..png'

/* ── State ── */
const scrolled   = ref(false)
const mobileOpen = ref(false)
const close = () => { mobileOpen.value = false }

const switcherItems = [
  { src: logoUrl, alt: 'Logo Naspiotech' },
  { src: mascotUrl, alt: 'Maskot Naspion' },
  { src: SimbelmawaUrl, alt: 'Simbelmawa' },
  { src: PKMUrl, alt: 'PKM' },
  { src: KemdiktiUrl, alt: 'Kemdikti' },
  { src: BelmawaUrl, alt: 'Belmawa' },
  { src: DiktiUrl, alt: 'Dikti' },
]

/* ── Scroll lock (preserves position + hides scrollbar jump) ── */
let savedY = 0
const lockScroll = () => {
  savedY = window.scrollY
  const sbw = window.innerWidth - document.documentElement.clientWidth
  Object.assign(document.body.style, {
    position: 'fixed', top: `-${savedY}px`,
    left: '0', right: '0', width: '100%',
    ...(sbw > 0 ? { paddingRight: `${sbw}px` } : {})
  })
}
const unlockScroll = () => {
  Object.assign(document.body.style, {
    position: '', top: '', left: '', right: '', width: '', paddingRight: ''
  })
  window.scrollTo(0, savedY)
}
watch(mobileOpen, open => open ? lockScroll() : unlockScroll())

/* ── Scroll reveal via IntersectionObserver ── */
let io = null
const initReveal = () => {
  io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-revealed')
        io.unobserve(e.target)
      }
    })
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' })
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el))
}

/* ── Listeners ── */
const onScroll = () => {
  const y = window.scrollY
  scrolled.value = y > 40
  if (y < window.innerHeight) {
    document.documentElement.style.setProperty('--hero-scroll', y + 'px')
  }
}
const onResize = () => {
  if (window.innerWidth > 768 && mobileOpen.value) close()
  cCardW.value = getCardW()
}
const onKey    = e  => { if (e.key === 'Escape') close() }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onKey)
  initReveal()
  cTimer = setInterval(cAdvance, 2200)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKey)
  io?.disconnect()
  unlockScroll()
  clearInterval(cTimer)
})

/* ── SVG icon helper ── */
const s = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
const ic = {
  wifi:     s('<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>'),
  scan:     s('<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/>'),
  chart:    s('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),
  bell:     s('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'),
  wind:     s('<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>'),
  activity: s('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),
  shield:   s('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>'),
  clock:    s('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  monitor:  s('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'),
  bellDot:  s('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"/>'),
  bulb:     s('<line x1="9" y1="21" x2="15" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M12 2a7 7 0 0 1 5 11.93V17H7v-3.07A7 7 0 0 1 12 2z"/>'),
  heart:    s('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'),
  wrench:   s('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
  mail:     s('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'),
  insta:    s('<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>'),
  phone:    s('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  tiktok:   '<svg viewBox="0 0 448 512" style="fill:currentColor;stroke:none"><path style="fill:currentColor;stroke:none" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg>',
}

/* ── Data ── */
const features = [
  { icon: ic.wifi,    label: 'Sensor CO₂',  desc: 'Membaca kadar CO₂ secara otomatis dan berkala.' },
  { icon: ic.scan,    label: 'Deteksi NGT', desc: 'Sinyal awal ketika posisi selang perlu dicek ulang.' },
  { icon: ic.chart,   label: 'Dashboard',   desc: 'Tampilan data yang mudah dibaca kapan saja.' },
  { icon: ic.bell,    label: 'Notifikasi',  desc: 'Peringatan dini langsung ke perangkat.' },
]

const risks = [
  { icon: ic.wind,     title: 'Aspirasi',     desc: 'Cairan atau nutrisi masuk ke paru-paru jika selang salah posisi.' },
  { icon: ic.activity, title: 'Sesak Napas',  desc: 'Selang yang mengarah ke trakea dapat mengganggu pernapasan.' },
  { icon: ic.shield,   title: 'Infeksi Paru', desc: 'Komplikasi berkelanjutan berupa pneumonia aspirasi.' },
]

const flowSteps = ['NGT Terpasang', 'Sensor Baca CO₂', 'Sistem Analisis', 'Notifikasi Muncul']

const co2Cards = [
  { icon: ic.clock,   title: 'Continuous', desc: 'Pembacaan CO₂ berjalan terus tanpa perlu input manual.' },
  { icon: ic.monitor, title: 'Live View',  desc: 'Data tersedia di dashboard kapan pun dibutuhkan.' },
  { icon: ic.bellDot, title: 'Alert',      desc: 'Notifikasi otomatis saat nilai CO₂ melampaui batas.' },
]

const pkmValues = [
  { icon: ic.bulb,   title: 'Inovatif',  desc: 'Solusi berbasis teknologi sensor untuk kebutuhan medis.' },
  { icon: ic.heart,  title: 'Berdampak', desc: 'Fokus pada keamanan pasien sebagai prioritas utama.' },
  { icon: ic.wrench, title: 'Prototipe', desc: 'Diuji langsung dalam bentuk perangkat nyata.' },
]

const team = [
  { name: 'Salsa',  photo: salsaPhoto,  role: 'Project Leader',       desc: 'Koordinasi tim dan menentukan arah pengembangan proyek secara keseluruhan.' },
  { name: 'Erfat',  photo: erfatPhoto,  role: 'Clinical Research',     desc: 'Meriset latar klinis NGT dan memastikan solusi relevan secara medis.' },
  { name: 'Fatika', photo: fatikaPhoto, role: 'Clinical Validation',   desc: 'Memvalidasi prosedur klinis dan menguji akurasi sistem di skenario nyata.' },
  { name: 'Fahri',  photo: fahriPhoto,  role: 'Software Engineer',     desc: 'Membangun frontend, backend, dashboard realtime, dan alur autentikasi pengguna.' },
  { name: 'Vidi',   photo: vidiPhoto,   role: 'Hardware Engineer',     desc: 'Mengembangkan firmware sensor dan integrasi perangkat keras CO₂.' },
  { name: 'Adhe Setya Pramayoga', photo: adhePhoto, role: 'Pembina', desc: 'Membimbing dan mengarahkan tim dalam pengembangan proyek PKM-KC secara akademis.' },
]

/* ── Team Carousel ── */
const CARD_GAP = 24
const cItems   = [...team, ...team, ...team]
const cIdx     = ref(team.length)
const cAnim    = ref(true)

function getCardW() {
  if (typeof window === 'undefined') return 280
  if (window.innerWidth < 480) return 200
  if (window.innerWidth < 768) return 240
  return 280
}
const cCardW = ref(getCardW())

const cTrackStyle = computed(() => ({
  transform: `translateX(calc(50vw - ${cIdx.value * (cCardW.value + CARD_GAP) + cCardW.value / 2}px))`,
  transition: cAnim.value ? 'transform 0.7s cubic-bezier(.22,1,.36,1)' : 'none',
}))

function cCardClass(i) {
  // Pakai modulo supaya class TIDAK berubah saat reset loop (tidak ada flash)
  const len = team.length
  const d = ((i % len) - (cIdx.value % len) + len) % len
  if (d === 0)       return 'is-center'
  if (d === 1)       return 'is-next'
  if (d === len - 1) return 'is-prev'
  return ''
}

let cTimer = null
function cAdvance() {
  cIdx.value++
  if (cIdx.value >= team.length * 2) {
    setTimeout(() => {
      cAnim.value = false
      cIdx.value -= team.length
      // Double RAF: pastikan DOM sudah repaint sebelum animasi aktif lagi
      requestAnimationFrame(() => requestAnimationFrame(() => {
        cAnim.value = true
      }))
    }, 720)
  }
}
</script>


<!-- ══════════════════════════════════════════════════════════════
     GLOBAL — Navbar di-Teleport ke body, scoped tidak menjangkau
     ══════════════════════════════════════════════════════════════ -->
<style>
/* ── Reset conflict ── */
.lp-nav *, .lp-nav *::before, .lp-nav *::after { box-sizing: border-box; }

/* ── Navbar shell ── */
.lp-nav {
  position: fixed;
  top: 16px; left: 50%; right: auto;
  transform: translateX(-50%);
  width: min(1100px, calc(100% - 32px));
  z-index: 9000;
  border-radius: 999px;
  padding: 10px 10px 10px 20px;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,.55);
  border: 1px solid rgba(255,255,255,.72);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 4px 24px rgba(7,59,46,.08), inset 0 1px 0 rgba(255,255,255,.8);
  transition: all .3s cubic-bezier(.22,1,.36,1);
  font-family: 'Poppins', sans-serif;
}
.lp-nav--solid {
  background: rgba(255,255,255,.90);
  box-shadow: 0 8px 36px rgba(7,59,46,.12), inset 0 1px 0 rgba(255,255,255,.9);
  top: 10px;
}
.lp-nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

/* ── Brand ── */
.lp-nav__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex: 0 0 auto;
}
.lp-nav__logo {
  width: 32px; height: 32px;
  object-fit: contain;
  border-radius: 8px;
  background: rgba(255,255,255,.9);
  padding: 2px;
  border: 1px solid rgba(16,185,129,.18);
}
.lp-nav__brand span {
  font-size: 15px;
  font-weight: 700;
  color: #064E3B;
  letter-spacing: -.01em;
  font-family: 'Poppins', sans-serif;
}

/* ── Nav links ── */
.lp-nav__links {
  display: flex;
  align-items: center;
  gap: 2px;
}
.lp-nav__link {
  padding: 7px 14px;
  border-radius: 999px;
  color: #374151;
  font-size: 13.5px;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  text-decoration: none;
  transition: background .18s, color .18s;
}
.lp-nav__link:hover { background: rgba(16,185,129,.12); color: #064E3B; }

/* ── CTA button ── */
.lp-nav__cta {
  display: inline-flex;
  align-items: center;
  padding: 9px 22px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  text-decoration: none;
  color: #fff;
  background: linear-gradient(135deg, #34d399, #059669 55%, #064E3B);
  box-shadow: 0 4px 16px rgba(5,150,105,.28);
  transition: all .22s;
}
.lp-nav__cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(5,150,105,.34); }
.lp-nav__cta--mobile { display: none; border-radius: 14px; justify-content: center; }

/* ── Hamburger ── */
.lp-nav__burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 9px;
  border: none;
  background: rgba(16,185,129,.10);
  border-radius: 10px;
  cursor: pointer;
  z-index: 9002;
}
.lp-nav__burger span {
  display: block;
  width: 20px; height: 2px;
  background: #064E3B;
  border-radius: 2px;
  transition: transform .25s ease, opacity .2s ease;
  transform-origin: center;
}
.lp-nav__burger.is-active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.lp-nav__burger.is-active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.lp-nav__burger.is-active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── Mobile navbar — tiruan .app-navbar dashboard ── */
@media (max-width: 768px) {
  .lp-nav {
    top: 10px;
    left: 12px;
    right: 12px;
    transform: none;
    width: auto;
    border-radius: 20px;
    padding: 10px 12px;
    background: rgba(255,255,255,.72);
    backdrop-filter: blur(22px) saturate(180%);
    -webkit-backdrop-filter: blur(22px) saturate(180%);
    border: 1px solid rgba(255,255,255,.72);
    box-shadow: 0 5px 14px rgba(15,23,42,.06);
  }
  .lp-nav--solid {
    top: 10px;
    background: rgba(255,255,255,.92);
    box-shadow: 0 8px 24px rgba(15,23,42,.09);
  }
  .lp-nav__links        { display: none; }
  .lp-nav__cta--desktop { display: none; }
  .lp-nav__burger {
    display: flex;
    width: 42px; height: 42px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 0;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(15,23,42,.14);
    border-radius: 14px;
  }
}

/* ── Mobile backdrop ── */
.lp-mob-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9001;
  background: rgba(15,23,42,.28);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

/* ── Side drawer — tiruan .mobile-drawer dashboard ── */
.lp-mob-drawer {
  display: none;
  position: fixed;
  inset: 0 0 0 auto;
  z-index: 9002;
  width: min(320px, 88vw);
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(255,255,255,.92);
  border-left: 1px solid rgba(255,255,255,.72);
  box-shadow: -4px 0 60px rgba(7,59,46,.14);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  transform: translateX(105%);
  transition: transform .28s cubic-bezier(.22,1,.36,1);
  overflow-y: auto;
  font-family: 'Poppins', sans-serif;
}
@media (max-width: 768px) {
  .lp-mob-drawer { display: flex; }
  .lp-mob-drawer.is-open { transform: translateX(0); }
}

.lp-mob-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.lp-mob-drawer__brand { display: flex; align-items: center; gap: 12px; }
.lp-mob-drawer__logo-box {
  width: 42px; height: 42px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(220,252,231,.90));
  border: 1px solid rgba(16,185,129,.18);
  box-shadow: 0 10px 24px rgba(16,185,129,.12), inset 0 1px 0 rgba(255,255,255,.9);
  overflow: hidden;
}
.lp-mob-drawer__logo-box img { width: 100%; height: 100%; object-fit: cover; }
.lp-mob-drawer__name {
  display: block;
  font-size: 14px; font-weight: 700;
  color: #0f1f1a;
  letter-spacing: -.01em;
  line-height: 1.12;
}
.lp-mob-drawer__sub {
  display: block;
  margin-top: 2px;
  font-size: 10px; font-weight: 500;
  color: #526175;
}
.lp-mob-drawer__close {
  width: 38px; height: 38px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 12px;
  color: #526175;
  background: rgba(255,255,255,.72);
  border: 1px solid rgba(15,23,42,.08);
  cursor: pointer;
}
.lp-mob-drawer__close svg { width: 16px; height: 16px; }

.lp-mob-drawer__nav { display: grid; gap: 6px; }
.lp-mob-drawer__link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 10px 14px;
  border-radius: 16px;
  color: #43526a;
  font-size: 14px; font-weight: 500;
  text-decoration: none;
  transition: all .18s;
}
.lp-mob-drawer__link:hover { color: #047857; background: rgba(220,252,231,.84); }
.lp-mob-drawer__link svg { width: 17px; height: 17px; flex-shrink: 0; }

.lp-mob-drawer__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 10px 20px;
  margin-top: auto;
  border-radius: 999px;
  color: #fff;
  font-size: 13px; font-weight: 700;
  text-decoration: none;
  background: linear-gradient(135deg, #34d399, #10b981 48%, #059669);
  box-shadow: 0 16px 44px rgba(16,185,129,.23), inset 0 1px 0 rgba(255,255,255,.25);
  transition: transform .2s, box-shadow .2s;
}
.lp-mob-drawer__cta:hover { transform: translateY(-1px); box-shadow: 0 20px 48px rgba(16,185,129,.28); }

/* ── Transitions ── */
.lp-fade-enter-active, .lp-fade-leave-active { transition: opacity .2s; }
.lp-fade-enter-from, .lp-fade-leave-to { opacity: 0; }
</style>


<!-- ══════════════════════════════════════════════════════════════
     SCOPED — Page content styles
     ══════════════════════════════════════════════════════════════ -->
<style scoped>
/* ── Hero load animations ── */
.lp-hero-anim {
  opacity: 0;
  transform: translateY(28px);
  animation: heroUp .75s cubic-bezier(.22,1,.36,1) var(--d, 0s) forwards;
}
.lp-hero-anim--right {
  transform: translateX(48px) scale(.96);
  animation: heroRight .85s cubic-bezier(.22,1,.36,1) var(--d, 0s) forwards;
}
@keyframes heroUp {
  to { opacity: 1; transform: translateY(0); }
}
@keyframes heroRight {
  to { opacity: 1; transform: translateX(0) scale(1); }
}

/* ── Scroll reveal — CSS custom props per direction ── */
[data-reveal] {
  opacity: 0;
  --rx: 0px; --ry: 36px; --rs: 1;
  transform: translateX(var(--rx)) translateY(var(--ry)) scale(var(--rs));
  transition:
    opacity .7s cubic-bezier(.22,1,.36,1),
    transform .7s cubic-bezier(.22,1,.36,1);
}
/* Direction variants */
[data-reveal="left"]  { --rx: -52px; --ry: 0px; }
[data-reveal="right"] { --rx:  52px; --ry: 0px; }
[data-reveal="scale"] { --rx: 0px;   --ry: 20px; --rs: .86; }
[data-reveal="fade"]  { --rx: 0px;   --ry: 0px; }

/* Revealed state — reset semua ke posisi natural */
[data-reveal].is-revealed {
  opacity: 1;
  --rx: 0px; --ry: 0px; --rs: 1;
}

/* Stagger delays */
[data-reveal][data-delay="1"] { transition-delay: .07s; }
[data-reveal][data-delay="2"] { transition-delay: .15s; }
[data-reveal][data-delay="3"] { transition-delay: .23s; }
[data-reveal][data-delay="4"] { transition-delay: .31s; }

/* Mobile: nonaktifkan kiri/kanan agar tidak overflow horizontal */
@media (max-width: 768px) {
  [data-reveal="left"],
  [data-reveal="right"] { --rx: 0px; --ry: 28px; }
}

/* ── Root & tokens ── */
.lp {
  --green:    #059669;
  --green-dk: #064E3B;
  --green-lt: #34d399;
  --green-bg: #F0FFF8;
  --border:   rgba(5,150,105,.15);
  --txt:      #0f2d1f;
  --muted:    #5a7566;
  --ease:     cubic-bezier(.22,1,.36,1);

  font-family: 'Poppins', sans-serif;
  color: var(--txt);
  background: #F8FFFE;
  min-height: 100vh;
}

/* ── Layout ── */
.lp-wrap {
  width: min(1120px, calc(100% - 40px));
  margin: 0 auto;
}
.lp-center { display: flex; justify-content: center; margin-top: 40px; }

/* ── Buttons ── */
.lp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: 999px;
  font-family: 'Poppins', sans-serif;
  font-size: 14.5px;
  font-weight: 600;
  text-decoration: none;
  transition: all .22s var(--ease);
  white-space: nowrap;
}
.lp-btn--solid {
  background: linear-gradient(135deg, var(--green-lt), var(--green) 55%, var(--green-dk));
  color: #fff;
  box-shadow: 0 6px 22px rgba(5,150,105,.30);
}
.lp-btn--solid:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(5,150,105,.36); }
.lp-btn--ghost {
  background: rgba(255,255,255,.76);
  color: var(--green-dk);
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 10px rgba(7,59,46,.06);
}
.lp-btn--ghost:hover { background: #fff; transform: translateY(-1px); }

/* ── Chip (badge) ── */
.lp-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: .03em;
  margin-bottom: 14px;
  background: rgba(52,211,153,.15);
  color: #065f46;
  border: 1px solid rgba(52,211,153,.28);
}
.lp-chip--teal   { background: rgba(20,184,166,.12); color: #0f4c42; border-color: rgba(20,184,166,.25); }
.lp-chip--amber  { background: rgba(245,158,11,.12);  color: #78350f; border-color: rgba(245,158,11,.25); }
.lp-chip--blue   { background: rgba(59,130,246,.10);  color: #1e3a8a; border-color: rgba(59,130,246,.22); }
.lp-chip--violet { background: rgba(139,92,246,.10);  color: #4c1d95; border-color: rgba(139,92,246,.22); }
.lp-chip--green  { background: rgba(52,211,153,.15);  color: #065f46; border-color: rgba(52,211,153,.28); }

/* ══════════ HERO ══════════ */
.lp-hero {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 160px 0 100px;
}
.lp-hero__glow {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(80px);
}
.lp-hero__glow--a {
  width: 600px; height: 600px;
  background: rgba(52,211,153,.18);
  top: -140px; left: -180px;
  transform: translateY(calc(var(--hero-scroll, 0px) * .14));
  will-change: transform;
}
.lp-hero__glow--b {
  width: 500px; height: 500px;
  background: rgba(125,211,252,.16);
  top: 80px; right: -160px;
  transform: translateY(calc(var(--hero-scroll, 0px) * .08));
  will-change: transform;
}
.lp-hero__grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 64px;
}
.lp-hero__h1 {
  margin: 0 0 18px;
  font-size: clamp(30px, 4vw, 56px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -.03em;
  color: var(--green-dk);
}
.lp-hero__accent {
  background: linear-gradient(135deg, var(--green-lt), var(--green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lp-hero__sub {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.75;
  color: var(--muted);
  margin: 0 0 30px;
  max-width: 440px;
}
.lp-hero__btns { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 36px; }
.lp-hero__stats { display: flex; align-items: center; gap: 20px; }
.lp-stat { display: flex; flex-direction: column; }
.lp-stat strong { font-size: 15px; font-weight: 700; color: var(--green-dk); line-height: 1.2; }
.lp-stat span   { font-size: 11px; font-weight: 400; color: var(--muted); }
.lp-stat__div   { width: 1px; height: 28px; background: var(--border); }

/* Visual / Card 3D */
.lp-hero__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lp-card-3d {
  width: 340px; height: 340px;
  border-radius: 38px;
  background: rgba(255,255,255,.78);
  border: 1px solid rgba(255,255,255,.88);
  box-shadow: 0 30px 80px rgba(7,59,46,.13), 0 1px 0 rgba(255,255,255,.9) inset;
  backdrop-filter: blur(16px);
  display: grid;
  place-items: center;
  overflow: hidden;
}
.lp-switcher { position: relative; width: 70%; height: 70%; }
.lp-switcher__item {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: contain;
  opacity: 0;
  transform: scale(.92);
  animation-name: lpSwitcherItem;
  animation-duration: var(--switcher-duration);
  animation-delay: var(--switcher-delay);
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
@keyframes lpSwitcherItem {
  0%, 7%    { opacity: 0; transform: scale(.92); }
  10%, 20%  { opacity: 1; transform: scale(1); }
  24%, 100% { opacity: 0; transform: scale(.92); }
}

/* Floating pills */
.lp-pill {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255,255,255,.95);
  border: 1px solid var(--border);
  box-shadow: 0 8px 24px rgba(7,59,46,.10);
  font-size: 12px;
  font-weight: 600;
  color: var(--green-dk);
  animation: lpFloat 4s ease-in-out infinite;
}
.lp-pill svg { width: 13px; height: 13px; stroke: var(--green); fill: none; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.lp-pill--a { top: 18px;  right: -14px; }
.lp-pill--b { bottom: 36px; left: -14px; animation-delay: 2s; }
@keyframes lpFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }

/* ══════════ SECTIONS ══════════ */
.lp-section { padding: 96px 0; }
.lp-section--dim {
  background: linear-gradient(180deg, #F0FFF8 0%, #F8FFFE 100%);
  border-top: 1px solid rgba(5,150,105,.08);
  border-bottom: 1px solid rgba(5,150,105,.08);
}
.lp-section__head { max-width: 620px; margin-bottom: 52px; }
.lp-section__head--center { margin-left: auto; margin-right: auto; text-align: center; }
.lp-h2 {
  margin: 0 0 16px;
  font-size: clamp(24px, 3.2vw, 40px);
  font-weight: 700;
  letter-spacing: -.025em;
  color: var(--green-dk);
  line-height: 1.15;
}
.lp-desc {
  font-size: 15.5px;
  font-weight: 400;
  line-height: 1.78;
  color: var(--muted);
  margin: 0;
}

/* ── About feature cards ── */
.lp-feat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.lp-feat {
  padding: 26px 22px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 6px 24px rgba(7,59,46,.06);
  transition: transform .22s var(--ease), box-shadow .22s;
}
.lp-feat:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(7,59,46,.10); }
.lp-feat__icon {
  width: 46px; height: 46px;
  border-radius: 13px;
  background: rgba(5,150,105,.10);
  border: 1px solid rgba(5,150,105,.14);
  display: grid;
  place-items: center;
  color: var(--green);
  margin-bottom: 16px;
}
.lp-feat__icon :deep(svg) { width: 20px; height: 20px; }
.lp-feat h3    { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: var(--txt); }
.lp-feat p     { margin: 0; font-size: 12.5px; color: var(--muted); line-height: 1.55; }

/* ── NGT Risk cards ── */
.lp-risk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}
.lp-risk-card {
  position: relative;
  padding: 28px 24px;
  border-radius: 26px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 8px 28px rgba(7,59,46,.06);
  overflow: hidden;
  transition: transform .22s var(--ease), box-shadow .22s;
}
.lp-risk-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(7,59,46,.11); }
.lp-risk-card__num {
  position: absolute;
  top: 16px; right: 20px;
  font-size: 32px;
  font-weight: 800;
  color: rgba(5,150,105,.08);
  line-height: 1;
  letter-spacing: -.04em;
}
.lp-risk-card__icon {
  width: 50px; height: 50px;
  border-radius: 14px;
  background: rgba(5,150,105,.08);
  border: 1px solid rgba(5,150,105,.12);
  display: grid;
  place-items: center;
  color: var(--green);
  margin-bottom: 16px;
}
.lp-risk-card__icon :deep(svg) { width: 22px; height: 22px; }
.lp-risk-card h3    { margin: 0 0 8px; font-size: 15px; font-weight: 600; color: var(--txt); }
.lp-risk-card p     { margin: 0; font-size: 13px; color: var(--muted); line-height: 1.6; }

/* ── CO₂ flow ── */
.lp-flow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 22px 24px;
  border-radius: 20px;
  background: rgba(255,255,255,.8);
  border: 1px solid var(--border);
  margin-bottom: 24px;
}
.lp-flow__step {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 120px;
}
.lp-flow__num {
  width: 32px; height: 32px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green-lt), var(--green));
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
.lp-flow__step span { font-size: 13px; font-weight: 500; color: var(--txt); }
.lp-flow__arrow { color: var(--green); font-size: 22px; font-weight: 300; flex: 0 0 auto; opacity: .6; }

.lp-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 18px;
  border-radius: 14px;
  background: #fffbeb;
  border: 1px solid rgba(245,158,11,.22);
  font-size: 13px;
  color: #78350f;
  line-height: 1.6;
  margin-bottom: 32px;
}
.lp-note svg { color: #b45309; flex-shrink: 0; margin-top: 1px; }

.lp-co2-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
.lp-co2-card {
  padding: 24px 20px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 6px 22px rgba(7,59,46,.05);
  transition: transform .2s;
}
.lp-co2-card:hover { transform: translateY(-3px); }
.lp-co2-card__icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: rgba(5,150,105,.09);
  border: 1px solid rgba(5,150,105,.13);
  display: grid;
  place-items: center;
  color: var(--green);
  margin-bottom: 14px;
}
.lp-co2-card__icon :deep(svg) { width: 19px; height: 19px; }
.lp-co2-card h3    { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: var(--txt); }
.lp-co2-card p     { margin: 0; font-size: 12.5px; color: var(--muted); line-height: 1.55; }

/* ── PKM-KC ── */
.lp-pkm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.lp-pkm__right { display: grid; gap: 16px; }
.lp-pkm-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 4px 16px rgba(7,59,46,.05);
  transition: transform .2s;
}
.lp-pkm-card:hover { transform: translateX(4px); }
.lp-pkm-card__icon {
  width: 42px; height: 42px;
  border-radius: 12px;
  background: rgba(5,150,105,.09);
  border: 1px solid rgba(5,150,105,.13);
  display: grid;
  place-items: center;
  color: var(--green);
  flex: 0 0 auto;
}
.lp-pkm-card__icon :deep(svg) { width: 19px; height: 19px; }
.lp-pkm-card h3    { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: var(--txt); }
.lp-pkm-card p     { margin: 0; font-size: 12.5px; color: var(--muted); line-height: 1.5; }

/* ── Team Carousel ── */
.lp-section--team { padding-bottom: 80px; }

.lp-carousel {
  overflow: hidden;
  padding: 24px 0 48px;
}
.lp-carousel__track {
  display: flex;
  gap: 24px;
  will-change: transform;
}
.lp-carousel__card {
  flex: 0 0 280px;
  width: 280px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid var(--border);
  overflow: hidden;
  transform: scale(0.74);
  opacity: 0.22;
  transition: transform 0.7s cubic-bezier(.22,1,.36,1), opacity 0.7s ease, box-shadow 0.7s ease, border-color 0.7s ease;
  box-shadow: none;
}
.lp-carousel__card.is-prev,
.lp-carousel__card.is-next {
  transform: scale(0.85);
  opacity: 0.55;
}
.lp-carousel__card.is-center {
  transform: scale(1);
  opacity: 1;
  box-shadow: 0 28px 64px rgba(7,59,46,.16);
  border-color: rgba(52,211,153,.3);
}
.lp-carousel__card.is-center .lp-team-photo { transform: scale(1.03); }

.lp-team-photo-wrap {
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: rgba(5,150,105,.06);
}
.lp-team-photo {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
  transition: transform .5s var(--ease);
}
.lp-team-card:hover .lp-team-photo { transform: scale(1.06); }

.lp-team-info {
  padding: 14px 16px 18px;
  text-align: center;
}
.lp-team-card h3 {
  margin: 0 0 6px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: -.01em;
}
.lp-team-role {
  display: inline-flex;
  align-items: center;
  margin-bottom: 9px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(52,211,153,.14);
  border: 1px solid rgba(52,211,153,.22);
  color: #065f46;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .02em;
}
.lp-team-card p {
  margin: 0;
  font-size: 11.5px;
  color: var(--muted);
  line-height: 1.55;
}

/* ── Footer ── */
.lp-footer {
  background: linear-gradient(135deg, #10b981 0%, #059669 52%, #047857 100%);
  color: rgba(255,255,255,.9);
  padding: 64px 0 0;
  font-family: 'Poppins', sans-serif;
}
.lp-footer__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 52px;
  padding-bottom: 52px;
}
.lp-footer__brand-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.lp-footer__brand-name img {
  width: 34px; height: 34px;
  object-fit: contain;
  border-radius: 8px;
  background: rgba(255,255,255,.12);
  padding: 3px;
}
.lp-footer__brand-name span { font-size: 18px; font-weight: 700; color: #fff; }
.lp-footer__brand p {
  font-size: 13px;
  line-height: 1.65;
  color: rgba(255,255,255,.85);
  margin: 0 0 10px;
}
.lp-footer__note {
  font-size: 11.5px !important;
  color: rgba(255,255,255,.70) !important;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,.22);
  line-height: 1.65 !important;
}
.lp-footer__col { display: flex; flex-direction: column; gap: 10px; }
.lp-footer__col strong { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 4px; }
.lp-footer__col a {
  font-size: 13px;
  color: rgba(255,255,255,.82);
  text-decoration: none;
  transition: color .18s;
}
.lp-footer__col a:hover { color: #fff; }
.lp-footer__link {
  display: flex;
  align-items: center;
  gap: 9px;
}
.lp-footer__ico { display: inline-flex; flex-shrink: 0; }
.lp-footer__ico :deep(svg) {
  width: 14px; height: 14px;
  stroke: rgba(255,255,255,.82);
  stroke-width: 1.75;
}
.lp-footer__bar {
  border-top: 1px solid rgba(255,255,255,.22);
  padding: 16px 0;
  font-size: 12px;
  color: rgba(255,255,255,.72);
}

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 1060px) {
  .lp-hero__grid  { gap: 40px; }
  .lp-card-3d     { width: 290px; height: 290px; }
  .lp-feat-grid   { grid-template-columns: repeat(2,1fr); }
}

@media (max-width: 768px) {
  .lp-wrap { width: calc(100% - 32px); }

  .lp-hero { padding: 110px 0 64px; min-height: auto; }
  .lp-hero__grid { grid-template-columns: 1fr; gap: 40px; text-align: center; }
  .lp-hero__visual { order: -1; }
  .lp-hero__sub   { max-width: 100%; margin-left: auto; margin-right: auto; }
  .lp-hero__btns  { justify-content: center; }
  .lp-hero__stats { justify-content: center; }
  .lp-pill        { display: none; }
  .lp-card-3d     { width: 220px; height: 220px; border-radius: 28px; }

  .lp-section     { padding: 64px 0; }
  .lp-feat-grid   { grid-template-columns: 1fr 1fr; }
  .lp-risk-grid   { grid-template-columns: 1fr; }
  .lp-co2-grid    { grid-template-columns: 1fr; }
  .lp-pkm-grid    { grid-template-columns: 1fr; gap: 36px; }
  .lp-carousel__card { flex: 0 0 240px; width: 240px; }
  .lp-footer__grid { grid-template-columns: 1fr; gap: 32px; }

  .lp-flow        { flex-direction: column; align-items: flex-start; }
  .lp-flow__arrow { transform: rotate(90deg); }
  .lp-flow__step  { flex: none; }
}

@media (max-width: 480px) {
  .lp-wrap      { width: calc(100% - 24px); }
  .lp-hero      { padding: 92px 0 52px; }
  .lp-hero__h1  { font-size: 26px; }
  .lp-card-3d   { width: 180px; height: 180px; }
  .lp-hero__btns { flex-direction: column; }
  .lp-btn       { width: 100%; justify-content: center; }
  .lp-hero__stats { gap: 12px; }
  .lp-feat-grid { grid-template-columns: 1fr; }
  .lp-carousel__card { flex: 0 0 200px; width: 200px; }
  .lp-section   { padding: 48px 0; }
}
</style>
