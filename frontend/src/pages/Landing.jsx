import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Inline styles as a JS object so no extra CSS file is needed ─── */
const S = {
  root: {
    fontFamily: "'Barlow', sans-serif",
    background: '#1a1e29',
    color: '#ffffff',
    overflowX: 'hidden',
    cursor: 'none',
  },
};

/* ─── tiny hook: load a <link> once ─── */
function useFonts() {
  useEffect(() => {
    if (document.getElementById('jerko-fonts')) return;
    const l = document.createElement('link');
    l.id = 'jerko-fonts';
    l.rel = 'stylesheet';
    l.href =
      'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;600;700&family=Barlow+Condensed:wght@700;900&display=swap';
    document.head.appendChild(l);
  }, []);
}

/* ─── inject <style> once ─── */
function useGlobalCSS() {
  useEffect(() => {
    if (document.getElementById('jerko-css')) return;
    const style = document.createElement('style');
    style.id = 'jerko-css';
    style.textContent = `
      :root {
        --gold:#01c38e; --gold-l:#03e8a8;
        --dark:#1a1e29; --dark2:#1a1e29; --dark3:#132d46;
        --steel:#132d46; --steel2:#132d46;
        --white:#ffffff; --muted:#8A9BAD; --accent:#01c38e;
      }
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html{scroll-behavior:smooth;}
      body{cursor:none;}

      /* cursor */
      #jk-cursor{position:fixed;width:12px;height:12px;border-radius:50%;background:var(--gold);pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .3s,height .3s;}
      #jk-ring{position:fixed;width:40px;height:40px;border-radius:50%;border:1px solid rgba(200,169,110,.5);pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:all .15s ease;}

      /* nav */
      .jk-nav{position:fixed;top:0;left:0;right:0;z-index:1000;padding:0 60px;height:80px;display:flex;align-items:center;justify-content:space-between;transition:background .4s,backdrop-filter .4s;}
      .jk-nav.scrolled{background:rgba(8,10,13,.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(200,169,110,.15);}
      .jk-logo{font-family:'Bebas Neue',cursive;font-size:2.4rem;letter-spacing:6px;color:var(--white);display:flex;align-items:center;gap:12px;}
      .jk-dot{width:8px;height:8px;background:var(--gold);border-radius:50%;animation:jkpulse 2s ease infinite;}
      @keyframes jkpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
      .jk-navlinks{display:flex;gap:48px;list-style:none;}
      .jk-navlinks a{font-size:.8rem;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--muted);text-decoration:none;transition:color .3s;position:relative;}
      .jk-navlinks a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:var(--gold);transition:width .3s;}
      .jk-navlinks a:hover{color:var(--gold);}
      .jk-navlinks a:hover::after{width:100%;}
      .jk-nav-cta{background:transparent;border:1px solid var(--gold);color:var(--gold);padding:10px 28px;font-size:.75rem;font-weight:600;letter-spacing:3px;text-transform:uppercase;cursor:none;transition:all .3s;font-family:'Barlow',sans-serif;}
      .jk-nav-cta:hover{background:var(--gold);color:var(--dark);}

      /* hero */
      .jk-hero{position:relative;height:100vh;display:flex;align-items:center;overflow:hidden;}
      .jk-hero-content{position:relative;z-index:10;padding:0 80px;max-width:900px;}
      .jk-tag{font-size:.7rem;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:24px;display:flex;align-items:center;gap:16px;opacity:0;transform:translateY(20px);}
      .jk-tag::before{content:'';display:block;width:40px;height:1px;background:var(--gold);}
      .jk-h1{font-family:'Bebas Neue',cursive;font-size:clamp(5rem,12vw,12rem);line-height:.9;letter-spacing:4px;opacity:0;}
      .jk-h1 .line{display:block;overflow:hidden;}
      .jk-h1 .word{display:inline-block;transform:translateY(110%);}
      .jk-gold{color:var(--gold);}
      .jk-sub{margin-top:32px;font-size:1.1rem;font-weight:300;color:var(--muted);max-width:500px;line-height:1.8;opacity:0;transform:translateY(30px);}
      .jk-actions{margin-top:48px;display:flex;gap:20px;opacity:0;transform:translateY(30px);}
      .jk-btn-p{background:var(--gold);color:var(--dark);padding:16px 40px;font-size:.8rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;border:none;cursor:none;transition:all .3s;position:relative;overflow:hidden;font-family:'Barlow',sans-serif;}
      .jk-btn-p::before{content:'';position:absolute;inset:0;background:var(--gold-l);transform:translateX(-100%);transition:transform .4s ease;}
      .jk-btn-p:hover::before{transform:translateX(0);}
      .jk-btn-p span{position:relative;z-index:1;}
      .jk-btn-s{background:transparent;color:var(--white);padding:16px 40px;font-size:.8rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;border:1px solid rgba(240,237,232,.3);cursor:none;transition:all .3s;font-family:'Barlow',sans-serif;}
      .jk-btn-s:hover{border-color:var(--gold);color:var(--gold);}
      .jk-scroll-hint{position:absolute;bottom:40px;left:80px;display:flex;align-items:center;gap:16px;font-size:.7rem;letter-spacing:3px;text-transform:uppercase;color:var(--muted);z-index:10;opacity:0;}
      .jk-scroll-line{width:60px;height:1px;background:linear-gradient(to right,transparent,var(--gold));position:relative;overflow:hidden;}
      .jk-scroll-line::after{content:'';position:absolute;inset:0;background:var(--gold);animation:jkslide 1.5s ease infinite;}
      @keyframes jkslide{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

      /* stats */
      .jk-stats{background:var(--dark2);padding:100px 80px;position:relative;overflow:hidden;}
      .jk-stats::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,var(--gold),transparent);}
      .jk-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:rgba(200,169,110,.1);}
      .jk-stat{background:var(--dark2);padding:60px 40px;text-align:center;position:relative;overflow:hidden;opacity:0;transform:translateY(40px);}
      .jk-stat::before{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:2px;background:var(--gold);transition:width .6s ease;}
      .jk-stat:hover::before{width:80%;}
      .jk-stat-num{font-family:'Bebas Neue',cursive;font-size:6rem;line-height:1;color:var(--gold);display:block;}
      .jk-stat-label{font-size:.75rem;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:var(--muted);margin-top:12px;}

      /* section header */
      .jk-sec{padding:140px 80px;background:var(--dark);}
      .jk-sec-alt{padding:140px 80px;background:var(--dark2);}
      .jk-sec-hdr{display:grid;grid-template-columns:1fr 1fr;gap:80px;margin-bottom:100px;align-items:end;}
      .jk-sec-tag{font-size:.7rem;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:16px;display:flex;align-items:center;gap:12px;}
      .jk-sec-tag::before{content:'';width:30px;height:1px;background:var(--gold);}
      .jk-sec-title{font-family:'Bebas Neue',cursive;font-size:clamp(3rem,6vw,6rem);line-height:.95;letter-spacing:3px;}
      .jk-sec-desc{color:var(--muted);font-size:1.05rem;line-height:1.9;font-weight:300;align-self:end;}

      /* services */
      .jk-svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:rgba(200,169,110,.08);}
      .jk-svc{background:var(--dark3);padding:56px 44px;position:relative;overflow:hidden;opacity:0;transform:translateY(60px);transition:background .4s;}
      .jk-svc::before{content:'';position:absolute;top:0;left:0;width:0;height:100%;background:linear-gradient(135deg,rgba(200,169,110,.08),transparent);transition:width .5s ease;}
      .jk-svc:hover{background:var(--steel2);}
      .jk-svc:hover::before{width:100%;}
      .jk-svc-num{font-family:'Bebas Neue',cursive;font-size:5rem;color:rgba(200,169,110,.1);line-height:1;transition:color .3s;}
      .jk-svc:hover .jk-svc-num{color:rgba(200,169,110,.2);}
      .jk-svc-ico{width:56px;height:56px;margin:20px 0;}
      .jk-svc-ico svg{width:100%;height:100%;fill:none;stroke:var(--gold);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
      .jk-svc-title{font-family:'Barlow Condensed',sans-serif;font-size:1.5rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--white);margin-bottom:16px;transition:color .3s;}
      .jk-svc:hover .jk-svc-title{color:var(--gold);}
      .jk-svc-desc{font-size:.9rem;color:var(--muted);line-height:1.8;font-weight:300;}
      .jk-svc-arr{position:absolute;bottom:40px;right:40px;width:32px;height:32px;border:1px solid rgba(200,169,110,.3);display:flex;align-items:center;justify-content:center;transform:rotate(45deg);transition:all .3s;font-size:14px;color:var(--gold);}
      .jk-svc:hover .jk-svc-arr{background:var(--gold);border-color:var(--gold);transform:rotate(0deg);color:var(--dark);}

      /* showcase */
      .jk-show{position:relative;height:100vh;background:var(--dark2);display:flex;align-items:center;overflow:hidden;}
      .jk-show-txt{position:relative;z-index:10;padding:0 80px;max-width:600px;opacity:0;transform:translateX(-60px);}
      .jk-show-title{font-family:'Bebas Neue',cursive;font-size:clamp(3.5rem,7vw,7rem);line-height:.9;letter-spacing:4px;margin:20px 0 28px;}
      .jk-show-list{list-style:none;margin-top:40px;}
      .jk-show-list li{display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid rgba(200,169,110,.1);font-size:.9rem;font-weight:300;color:var(--muted);letter-spacing:1px;}
      .jk-show-list li::before{content:'';width:6px;height:6px;background:var(--gold);border-radius:50%;flex-shrink:0;}

      /* projects */
      .jk-proj-grid{margin-top:80px;display:grid;grid-template-columns:1fr 1fr;gap:2px;background:rgba(200,169,110,.08);}
      .jk-proj{background:var(--dark3);padding:60px 56px;position:relative;overflow:hidden;min-height:340px;display:flex;flex-direction:column;justify-content:space-between;opacity:0;transform:translateY(40px);}
      .jk-proj::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(200,169,110,.05) 0%,transparent 60%);opacity:0;transition:opacity .5s;}
      .jk-proj:hover::after{opacity:1;}
      .jk-proj-top{position:relative;z-index:1;}
      .jk-proj-cap{display:inline-block;background:rgba(200,169,110,.12);border:1px solid rgba(200,169,110,.3);color:var(--gold);font-size:.7rem;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:6px 14px;margin-bottom:24px;}
      .jk-proj-title{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;line-height:1.1;margin-bottom:16px;transition:color .3s;}
      .jk-proj:hover .jk-proj-title{color:var(--gold);}
      .jk-proj-desc{color:var(--muted);font-size:.9rem;line-height:1.8;font-weight:300;}
      .jk-proj-num{font-family:'Bebas Neue',cursive;font-size:8rem;color:rgba(200,169,110,.06);position:absolute;bottom:-20px;right:30px;line-height:1;transition:color .4s;}
      .jk-proj:hover .jk-proj-num{color:rgba(200,169,110,.12);}

      /* marquee */
      .jk-mq{background:var(--gold);padding:20px 0;overflow:hidden;white-space:nowrap;}
      .jk-mq-track{display:inline-flex;animation:jkmq 20s linear infinite;}
      .jk-mq-item{font-family:'Bebas Neue',cursive;font-size:1.6rem;letter-spacing:6px;color:var(--dark);padding:0 48px;display:flex;align-items:center;gap:48px;}
      .jk-mq-dot{width:8px;height:8px;background:var(--dark);border-radius:50%;opacity:.4;}
      @keyframes jkmq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

      /* cta */
      .jk-cta{padding:160px 80px;background:var(--dark2);text-align:center;position:relative;overflow:hidden;}
      .jk-cta-content{position:relative;z-index:10;}
      .jk-cta-title{font-family:'Bebas Neue',cursive;font-size:clamp(4rem,10vw,10rem);line-height:.9;letter-spacing:6px;margin:20px 0 40px;}
      .jk-cta-outline{-webkit-text-stroke:1px var(--gold);color:transparent;}
      .jk-cta-sub{font-size:1.1rem;color:var(--muted);max-width:520px;margin:0 auto 48px;font-weight:300;line-height:1.8;}

      /* footer */
      .jk-footer{background:var(--dark);border-top:1px solid rgba(200,169,110,.15);padding:80px 80px 40px;}
      .jk-footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:80px;margin-bottom:60px;}
      .jk-footer-logo{font-family:'Bebas Neue',cursive;font-size:3rem;letter-spacing:8px;color:var(--white);display:flex;align-items:center;gap:10px;margin-bottom:20px;}
      .jk-footer-tag{color:var(--muted);font-size:.9rem;line-height:1.9;font-weight:300;max-width:280px;}
      .jk-footer-hdg{font-size:.7rem;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:24px;}
      .jk-footer-links{list-style:none;}
      .jk-footer-links li{margin-bottom:12px;}
      .jk-footer-links a,.jk-footer-links span{color:var(--muted);font-size:.9rem;font-weight:300;text-decoration:none;transition:color .3s;cursor:none;}
      .jk-footer-links a:hover{color:var(--gold);}
      .jk-footer-bottom{border-top:1px solid rgba(200,169,110,.1);padding-top:30px;display:flex;justify-content:space-between;align-items:center;}
      .jk-footer-bottom p{color:var(--muted);font-size:.8rem;letter-spacing:2px;}
      .jk-footer-socials{display:flex;gap:20px;}
      .jk-footer-socials a{width:36px;height:36px;border:1px solid rgba(200,169,110,.2);display:flex;align-items:center;justify-content:center;text-decoration:none;color:var(--muted);font-size:.75rem;transition:all .3s;cursor:none;}
      .jk-footer-socials a:hover{border-color:var(--gold);color:var(--gold);background:rgba(200,169,110,.08);}

      /* loader */
      .jk-loader{position:fixed;inset:0;background:var(--dark);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;}
      .jk-loader-logo{font-family:'Bebas Neue',cursive;font-size:5rem;letter-spacing:16px;color:var(--white);}
      .jk-loader-wrap{width:200px;height:1px;background:rgba(200,169,110,.2);position:relative;overflow:hidden;}
      .jk-loader-bar{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--gold);transition:width .05s;}
      .jk-loader-pct{font-size:.75rem;letter-spacing:4px;color:var(--gold);}

      /* canvas abs */
      .jk-canvas-abs{position:absolute;inset:0;z-index:0;}

      /* responsive */
      @media(max-width:1024px){
        .jk-nav{padding:0 30px;}
        .jk-hero-content,.jk-scroll-hint{padding-left:40px;}
        .jk-stats,.jk-sec,.jk-sec-alt,.jk-cta,.jk-footer{padding-left:40px;padding-right:40px;}
        .jk-stats-grid{grid-template-columns:repeat(2,1fr);}
        .jk-svc-grid{grid-template-columns:1fr 1fr;}
        .jk-footer-grid{grid-template-columns:1fr 1fr;gap:40px;}
      }
      @media(max-width:768px){
        .jk-navlinks{display:none;}
        .jk-svc-grid,.jk-proj-grid{grid-template-columns:1fr;}
        .jk-sec-hdr{grid-template-columns:1fr;}
        .jk-show-txt{padding:0 30px;}
        .jk-stats-grid{grid-template-columns:1fr 1fr;}
      }
    `;
    document.head.appendChild(style);
  }, []);
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const loaderRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const showCanvasRef = useRef(null);
  const ctaCanvasRef = useRef(null);
  const cursorRef = useRef(null);
  const ringRef = useRef(null);

  useFonts();
  useGlobalCSS();

  /* ── Cursor ── */
  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', onMove);
    let raf;
    const loop = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      raf = requestAnimationFrame(loop);
    };
    loop();
    const hoverEls = document.querySelectorAll('button,a,.jk-svc,.jk-proj');
    const enter = () => { cursor.style.width = '20px'; cursor.style.height = '20px'; ring.style.width = '60px'; ring.style.height = '60px'; };
    const leave = () => { cursor.style.width = '12px'; cursor.style.height = '12px'; ring.style.width = '40px'; ring.style.height = '40px'; };
    hoverEls.forEach(el => { el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave); });
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ── Navbar scroll ── */
  useEffect(() => {
    const nav = document.getElementById('jk-nav');
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Loader ── */
  useEffect(() => {
    const loader = loaderRef.current;
    const bar = loader?.querySelector('.jk-loader-bar');
    const pct = loader?.querySelector('.jk-loader-pct');
    if (!loader) return;
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) { p = 100; clearInterval(iv); hideLoader(); }
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = Math.floor(p) + '%';
    }, 80);
    function hideLoader() {
      import('gsap').then(({ gsap }) => {
        gsap.to(loader, {
          opacity: 0, duration: 0.8, ease: 'power2.out',
          onComplete: () => { loader.style.display = 'none'; }
        });
      });
    }
    return () => clearInterval(iv);
  }, []);

  /* ── GSAP scroll animations ── */
  useEffect(() => {
    let ctx;
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {

          // Hero
          gsap.set('.jk-h1', { opacity: 1 });
          gsap.to('.jk-tag', { opacity: 1, y: 0, duration: 1, delay: 0.9, ease: 'power3.out' });
          gsap.to('.jk-h1 .word', { y: 0, duration: 1.2, stagger: 0.12, delay: 1.1, ease: 'power4.out' });
          gsap.to('.jk-sub', { opacity: 1, y: 0, duration: 1, delay: 1.7, ease: 'power3.out' });
          gsap.to('.jk-actions', { opacity: 1, y: 0, duration: 1, delay: 1.9, ease: 'power3.out' });
          gsap.to('.jk-scroll-hint', { opacity: 1, duration: 1, delay: 2.4 });

          // Stats
          gsap.to('.jk-stat', {
            opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: '.jk-stats', start: 'top 80%' }
          });

          // Counters
          document.querySelectorAll('.jk-stat-num').forEach(el => {
            const target = parseInt(el.dataset.target);
            ScrollTrigger.create({
              trigger: el, start: 'top 85%', once: true,
              onEnter: () => gsap.to({ val: 0 }, {
                val: target, duration: 2, ease: 'power2.out',
                onUpdate: function () { el.textContent = Math.floor(this.targets()[0].val); }
              })
            });
          });

          // Services
          gsap.to('.jk-svc', {
            opacity: 1, y: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: '.jk-svc-grid', start: 'top 70%' }
          });

          // Showcase text
          gsap.to('.jk-show-txt', {
            opacity: 1, x: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: '.jk-show', start: 'top 70%' }
          });

          // Projects
          gsap.to('.jk-proj', {
            opacity: 1, y: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: '.jk-proj-grid', start: 'top 70%' }
          });

          // Section titles
          gsap.utils.toArray('.jk-sec-title').forEach(el => {
            gsap.from(el, {
              opacity: 0, y: 60, duration: 1, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 85%' }
            });
          });

          // CTA parallax
          gsap.to('.jk-cta-title', {
            y: -40,
            scrollTrigger: {
              trigger: '.jk-cta', start: 'top bottom', end: 'bottom top', scrub: 1.5
            }
          });
        });
      });
    });
    return () => ctx?.revert();
  }, []);

  /* ── Hero Three.js ── */
/* ─────────────────────────────────────────────
   REEMPLAZA SOLO ESTE BLOQUE:

   useEffect(() => {
     const canvas = heroCanvasRef.current;
     ...
   }, []);

   POR ESTE COMPLETO
───────────────────────────────────────────── */

useEffect(() => {
  const canvas = heroCanvasRef.current;

  if (!canvas) return;

  let renderer;
  let scene;
  let camera;
  let animId;

  let disposed = false;

  const cleanupScene = (obj) => {
    if (!obj) return;

    obj.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }

      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  };

  import('three').then((THREE) => {
    if (disposed) return;

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    camera.position.z = 30;

    /* GRID */

    const gridGeo =
      new THREE.PlaneGeometry(
        120,
        120,
        40,
        40
      );

    const gridMat =
      new THREE.MeshBasicMaterial({
        color: 0x01c38e,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
      });

    const grid = new THREE.Mesh(
      gridGeo,
      gridMat
    );

    grid.rotation.x = -Math.PI / 2;

    grid.position.y = -14;

    scene.add(grid);

    /* PARTICLES */

    const pCount = 1200;

    const pGeo =
      new THREE.BufferGeometry();

    const positions =
      new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      positions[i * 3] =
        (Math.random() - 0.5) * 100;

      positions[i * 3 + 1] =
        (Math.random() - 0.5) * 60;

      positions[i * 3 + 2] =
        (Math.random() - 0.5) * 60;
    }

    pGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    const pMat =
      new THREE.PointsMaterial({
        color: 0x01c38e,
        size: 0.12,
        transparent: true,
        opacity: 0.7,
      });

    const particles =
      new THREE.Points(
        pGeo,
        pMat
      );

    scene.add(particles);

    /* SHAPES */

    const addGeo = (
      geo,
      x,
      y,
      z,
      col
    ) => {
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({
          color: col,
          wireframe: true,
          transparent: true,
          opacity: 0.15,
        })
      );

      mesh.position.set(x, y, z);

      scene.add(mesh);

      return mesh;
    };

    const shapes = [
      addGeo(
        new THREE.IcosahedronGeometry(6, 1),
        20,
        0,
        -10,
        0x01c38e
      ),

      addGeo(
        new THREE.OctahedronGeometry(4, 0),
        -25,
        5,
        -15,
        0x01c38e
      ),

      addGeo(
        new THREE.TorusGeometry(
          5,
          1.5,
          8,
          16
        ),
        0,
        -8,
        -20,
        0x01c38e
      ),
    ];

    /* MOUSE */

    let mouse = {
      x: 0,
      y: 0,
    };

    const onMouseMove = (e) => {
      mouse.x =
        (e.clientX /
          window.innerWidth -
          0.5) *
        2;

      mouse.y =
        -(
          e.clientY /
            window.innerHeight -
          0.5
        ) * 2;
    };

    document.addEventListener(
      'mousemove',
      onMouseMove
    );

    /* RESIZE */

    const onResize = () => {
      if (
        !renderer ||
        !camera
      )
        return;

      camera.aspect =
        window.innerWidth /
        window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    };

    window.addEventListener(
      'resize',
      onResize
    );

    /* CONTEXT LOST */

    const onContextLost = (e) => {
      e.preventDefault();

      console.warn(
        'WebGL context lost'
      );
    };

    canvas.addEventListener(
      'webglcontextlost',
      onContextLost,
      false
    );

    /* ANIMATE */

    let t = 0;

    const animate = () => {
      if (disposed) return;

      animId =
        requestAnimationFrame(
          animate
        );

      t += 0.005;

      particles.rotation.y +=
        0.0005;

      particles.rotation.x +=
        0.0002;

      shapes.forEach((s, i) => {
        s.rotation.x +=
          0.003 +
          i * 0.001;

        s.rotation.y += 0.004;

        s.position.y +=
          Math.sin(t + i) *
          0.01;
      });

      camera.position.x +=
        (mouse.x * 3 -
          camera.position.x) *
        0.03;

      camera.position.y +=
        (mouse.y * 2 -
          camera.position.y) *
        0.03;

      camera.lookAt(
        0,
        0,
        0
      );

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    /* CLEANUP */

    canvas._cleanup = () => {
      disposed = true;

      cancelAnimationFrame(
        animId
      );

      document.removeEventListener(
        'mousemove',
        onMouseMove
      );

      window.removeEventListener(
        'resize',
        onResize
      );

      canvas.removeEventListener(
        'webglcontextlost',
        onContextLost
      );

      cleanupScene(scene);

      scene.clear();

      renderer.dispose();

      renderer.forceContextLoss();

      renderer.domElement = null;

      renderer = null;
      scene = null;
      camera = null;
    };
  });

  return () => {
    disposed = true;

    canvas?._cleanup?.();
  };
}, []);

  /* ── Showcase Three.js ── */
  useEffect(() => {
    const canvas = showCanvasRef.current;
    if (!canvas) return;
    let renderer, animId;

    import('three').then((THREE) => {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(18, 6, 18);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0x111827, 1));
      const goldLight = new THREE.PointLight(0x01c38e, 3, 50);
      goldLight.position.set(10, 10, 10);
      scene.add(goldLight);
      const blueLight = new THREE.PointLight(0x01c38e, 2, 40);
      blueLight.position.set(-10, -5, 5);
      scene.add(blueLight);

      const machine = new THREE.Group();
      scene.add(machine);

      const steelMat = new THREE.MeshPhongMaterial({ color: 0x1E2A38, specular: 0x4A8FD4, shininess: 80 });
      const goldMat = new THREE.MeshPhongMaterial({ color: 0x01c38e, specular: 0xffffff, shininess: 120 });
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x01c38e, wireframe: true, transparent: true, opacity: 0.4 });

      machine.add(new THREE.Mesh(new THREE.BoxGeometry(8, 5, 4), steelMat));
      for (let i = 0; i < 4; i++) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3, 16), goldMat);
        c.position.set(-3 + i * 2, 4, 0);
        c.rotation.z = Math.PI / 2;
        machine.add(c);
      }
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(5, 0.15, 12, 60), goldMat);
      ring1.rotation.y = Math.PI / 4;
      machine.add(ring1);
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.08, 8, 60), wireMat);
      ring2.rotation.x = Math.PI / 3;
      machine.add(ring2);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 8), steelMat);
        arm.position.set(Math.cos(a) * 4.5, Math.sin(a) * 4.5, 0);
        arm.rotation.z = a + Math.PI / 2;
        machine.add(arm);
      }
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 1), goldMat);
      machine.add(core);
      machine.add(new THREE.Mesh(new THREE.SphereGeometry(8, 12, 8), wireMat));

      let t = 0;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        t += 0.008;
        machine.rotation.y += 0.006;
        machine.rotation.x = Math.sin(t * 0.3) * 0.15;
        ring1.rotation.z += 0.02;
        ring2.rotation.y += 0.015;
        core.rotation.y -= 0.04;
        core.rotation.x += 0.02;
        goldLight.position.x = Math.sin(t) * 12;
        goldLight.position.z = Math.cos(t) * 12;
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);
      const cleanupScene = (obj) => {
        if (!obj) return;
        obj.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
            else child.material.dispose();
          }
        });
      };

      canvas._cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        cleanupScene(scene);
        scene.clear();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement = null;
        renderer = null;
      };
    });

    return () => { canvas._cleanup?.(); };
  }, []);

  /* ── CTA Three.js vortex ── */
  useEffect(() => {
    const canvas = ctaCanvasRef.current;
    if (!canvas) return;
    let renderer, animId;

    import('three').then((THREE) => {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 25;

      const count = 2000;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const phi = new Float32Array(count);
      const radius = new Float32Array(count);
      const speed = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        phi[i] = Math.random() * Math.PI * 2;
        radius[i] = 3 + Math.random() * 18;
        speed[i] = (Math.random() * .5 + .2) * (Math.random() > .5 ? 1 : -1);
        pos[i * 3] = Math.cos(phi[i]) * radius[i];
        pos[i * 3 + 1] = (Math.random() - .5) * 20;
        pos[i * 3 + 2] = Math.sin(phi[i]) * radius[i];
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x01c38e, size: 0.1, transparent: true, opacity: 0.6 }));
      scene.add(pts);

      let t = 0;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        t += 0.005;
        for (let i = 0; i < count; i++) {
          phi[i] += speed[i] * 0.005;
          pos[i * 3] = Math.cos(phi[i]) * radius[i];
          pos[i * 3 + 2] = Math.sin(phi[i]) * radius[i];
          pos[i * 3 + 1] += Math.sin(t + i) * 0.003;
        }
        geo.attributes.position.needsUpdate = true;
        camera.position.y = Math.sin(t * 0.2) * 3;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      const cleanupScene = (obj) => {
        if (!obj) return;
        obj.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
            else child.material.dispose();
          }
        });
      };

      canvas._cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        cleanupScene(scene);
        scene.clear();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement = null;
        renderer = null;
      };
    });

    return () => { canvas._cleanup?.(); };
  }, []);

  /* ═══════════════ JSX ═══════════════ */

  const servicios = [
    { n: '01', title: 'Maquinaria Automatizada', desc: 'Diseño y fabricación de maquinaria industrial automatizada de alta precisión para entornos de producción exigentes.', icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
    { n: '02', title: 'Ingeniería Personalizada', desc: 'Soluciones a medida para procesos industriales complejos, adaptadas a las necesidades específicas de cada cliente.', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M5.34 5.34L3.93 6.75M21 12h-2M5 12H3M19.07 19.07l-1.41-1.41M5.34 18.66l-1.41 1.41M12 21v-2M12 5V3" /></> },
    { n: '03', title: 'Control de Calidad', desc: 'Certificación y pruebas exhaustivas en cada proyecto, garantizando los más altos estándares internacionales.', icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /> },
    { n: '04', title: 'Tecnología Avanzada', desc: 'Equipos CNC, robótica y sistemas de control de última generación integrados en cada solución.', icon: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /> },
    { n: '05', title: 'Producción Especializada', desc: 'Fabricación de maquinaria pesada con los más altos estándares de la industria y materiales de primera calidad.', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16M12 12v4" /></> },
    { n: '06', title: 'Soporte Técnico', desc: 'Mantenimiento preventivo y correctivo con asistencia técnica especializada 24/7 para minimizar tiempos muertos.', icon: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /> },
  ];

  const proyectos = [
    { cap: 'Hasta 50 toneladas', title: 'Grúas Puente Automatizadas', desc: 'Sistemas de elevación con control automático, encoders de posición y certificación de seguridad internacional EN 15011.', n: '01' },
    { cap: 'Producción continua', title: 'Líneas de Ensamblaje Robotizadas', desc: 'Integración completa de robots industriales KUKA y FANUC para ensamblaje de alta velocidad y precisión.', n: '02' },
    { cap: 'Hasta 500 toneladas', title: 'Prensas Hidráulicas CNC', desc: 'Prensas de alta presión con control numérico computarizado, servovalves proporcionales y sistema de seguridad redundante.', n: '03' },
    { cap: '5 ejes simultáneos', title: 'Centros de Mecanizado', desc: 'Mecanizado de precisión para componentes complejos de titanio y acero inoxidable con acabados espejo.', n: '04' },
  ];

  const mqItems = ['PRECISIÓN INDUSTRIAL', 'AUTOMATIZACIÓN', 'ROBÓTICA AVANZADA', 'CNC MACHINES', 'INGENIERÍA JERKO', '25 AÑOS DE EXPERIENCIA'];

  return (
    <div style={S.root}>
      {/* Loader */}
      <div className="jk-loader" ref={loaderRef}>
        <div className="jk-loader-logo">JERKO</div>
        <div className="jk-loader-wrap"><div className="jk-loader-bar" /></div>
        <div className="jk-loader-pct">0%</div>
      </div>

      {/* Cursor */}
      <div id="jk-cursor" ref={cursorRef} />
      <div id="jk-ring" ref={ringRef} />

      {/* Navbar */}
      <nav className="jk-nav" id="jk-nav">
        <div className="jk-logo"><span className="jk-dot" />JERKO</div>
        <ul className="jk-navlinks">
          <li><a href="#services">Servicios</a></li>
          <li><a href="#showcase">Tecnología</a></li>
          <li><a href="#projects">Proyectos</a></li>
          <li><a href="#cta">Contacto</a></li>
        </ul>
        <button className="jk-nav-cta" onClick={() => navigate('/login')}>Acceso Sistema</button>
      </nav>

      {/* Hero */}
      <section className="jk-hero">
        <canvas className="jk-canvas-abs" ref={heroCanvasRef} />
        <div className="jk-hero-content">
          <div className="jk-tag">Ingeniería Industrial · Desde 1999</div>
          <h1 className="jk-h1">
            <span className="line"><span className="word">MECANICA</span></span>
            <span className="line"><span className="word jk-gold">J.E.RKO</span></span>
            <span className="line"><span className="word">INDUSTRIAL</span></span>
          </h1>
          <p className="jk-sub">Diseñamos, fabricamos e integramos sistemas de maquinaria industrial de alta complejidad con tecnología de última generación.</p>
          <div className="jk-actions">
            <button className="jk-btn-p"><span>Ver Proyectos</span></button>
            <button className="jk-btn-s" onClick={() => navigate('/login')}>Ingresar al Sistema</button>
          </div>
        </div>
        <div className="jk-scroll-hint">
          <div className="jk-scroll-line" />Scroll
        </div>
      </section>

      {/* Stats */}
      <section className="jk-stats">
        <div className="jk-stats-grid">
          {[['25', 'Años de Experiencia'], ['500', 'Proyectos Completados'], ['98', '% Satisfacción'], ['50', 'Ingenieros Especializados']].map(([n, l]) => (
            <div className="jk-stat" key={l}>
              <span className="jk-stat-num" data-target={n}>{n}</span>
              <span className="jk-stat-label">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="jk-sec" id="services">
        <div className="jk-sec-hdr">
          <div>
            <div className="jk-sec-tag">Capacidades</div>
            <h2 className="jk-sec-title">NUESTROS<br /><span className="jk-gold">SERVICIOS</span></h2>
          </div>
          <p className="jk-sec-desc">Soluciones integrales en maquinaria industrial automatizada. Desde el diseño conceptual hasta la integración completa en planta.</p>
        </div>
        <div className="jk-svc-grid">
          {servicios.map((s) => (
            <div className="jk-svc" key={s.n}>
              <div className="jk-svc-num">{s.n}</div>
              <div className="jk-svc-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="#01c38e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {s.icon}
                </svg>
              </div>
              <div className="jk-svc-title">{s.title}</div>
              <p className="jk-svc-desc">{s.desc}</p>
              <div className="jk-svc-arr">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee */}
      <div className="jk-mq">
        <div className="jk-mq-track">
          {[...mqItems, ...mqItems].map((item, i) => (
            <div className="jk-mq-item" key={i}>{item}<span className="jk-mq-dot" /></div>
          ))}
        </div>
      </div>

      {/* Showcase */}
      <section className="jk-show" id="showcase">
        <canvas className="jk-canvas-abs" ref={showCanvasRef} />
        <div className="jk-show-txt">
          <div className="jk-sec-tag">Tecnología</div>
          <h2 className="jk-show-title">PRECISIÓN<br /><span className="jk-gold">SIN</span><br />LÍMITES</h2>
          <ul className="jk-show-list">
            <li>Tolerancias de hasta ±0.001mm en mecanizado CNC</li>
            <li>Sistemas de control PLC de última generación</li>
            <li>Integración robótica con visión artificial</li>
            <li>Monitoreo en tiempo real con IoT industrial</li>
            <li>Certificación ISO 9001:2015 en todos los procesos</li>
          </ul>
        </div>
      </section>

      {/* Projects */}
      <section className="jk-sec" id="projects">
        <div className="jk-sec-hdr">
          <div>
            <div className="jk-sec-tag">Portafolio</div>
            <h2 className="jk-sec-title">PROYECTOS<br /><span className="jk-gold">DESTACADOS</span></h2>
          </div>
          <p className="jk-sec-desc">Maquinaria de alta complejidad fabricada con precisión milimétrica. Cada proyecto es un testimonio de nuestra excelencia técnica.</p>
        </div>
        <div className="jk-proj-grid">
          {proyectos.map((p) => (
            <div className="jk-proj" key={p.n}>
              <div className="jk-proj-top">
                <div className="jk-proj-cap">{p.cap}</div>
                <h3 className="jk-proj-title">{p.title}</h3>
                <p className="jk-proj-desc">{p.desc}</p>
              </div>
              <div className="jk-proj-num">{p.n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="jk-cta" id="cta">
        <canvas className="jk-canvas-abs" ref={ctaCanvasRef} style={{ opacity: 0.4 }} />
        <div className="jk-cta-content">
          <div className="jk-sec-tag" style={{ justifyContent: 'center' }}>Trabajo Juntos</div>
          <h2 className="jk-cta-title">
            <span className="jk-cta-outline">IDEAS</span><br />EN METAL
          </h2>
          <p className="jk-cta-sub">¿Tienes un proyecto de maquinaria industrial? Nuestro equipo de ingenieros está listo para convertir tu visión en realidad.</p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            <button className="jk-btn-p"><span>Iniciar Proyecto</span></button>
            <button className="jk-btn-s" onClick={() => navigate('/login')}>Ingresar al Sistema</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="jk-footer">
        <div className="jk-footer-grid">
          <div>
            <div className="jk-footer-logo"><span className="jk-dot" />JERKO</div>
            <p className="jk-footer-tag">Fabricación de maquinaria pesada automatizada con los más altos estándares de calidad desde 1999.</p>
          </div>
          <div>
            <div className="jk-footer-hdg">Servicios</div>
            <ul className="jk-footer-links">
              {['Maquinaria CNC', 'Robótica Industrial', 'Ingeniería Custom', 'Soporte Técnico'].map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="jk-footer-hdg">Contacto</div>
            <ul className="jk-footer-links">
              <li><span>contacto@jerko.com</span></li>
              <li><span>+56 2 1234 5678</span></li>
              <li><span>Santiago, Chile</span></li>
            </ul>
          </div>
          <div>
            <div className="jk-footer-hdg">Horario</div>
            <ul className="jk-footer-links">
              <li><span>Lun–Vie: 8:00–18:00</span></li>
              <li><span>Sáb: 9:00–13:00</span></li>
              <li><span>Dom: Cerrado</span></li>
            </ul>
          </div>
        </div>
        <div className="jk-footer-bottom">
          <p>© 2024 JERKO. Todos los derechos reservados.</p>
          <div className="jk-footer-socials">
            <a href="#">LI</a><a href="#">IG</a><a href="#">YT</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
