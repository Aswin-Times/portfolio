import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { portfolioData as data } from "./content.js";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

const main = document.querySelector("#main-content");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isPlaceholder = (value) => String(value).includes("[");

const safeLink = (value, type = "url") => {
  if (isPlaceholder(value) || !value) {
    return "#placeholder-content";
  }

  if (type === "email") {
    return `mailto:${value}`;
  }

  return value;
};

const externalAttributes = (href) =>
  href.startsWith("http") ? 'target="_blank" rel="noreferrer"' : "";

function maskMark(className = "", labelled = false) {
  return `
    <svg class="mask-mark ${className}" viewBox="0 0 170 220" ${
      labelled ? 'role="img" aria-label="Abstract theatrical mask"' : 'aria-hidden="true"'
    }>
      <path class="mask-mark__face" d="M85 9C52 10 27 33 24 76l8 66c3 36 25 64 53 70 28-6 50-34 53-70l8-66C143 33 118 10 85 9Z"/>
      <path class="mask-mark__ridge" d="M85 36 70 124l15 16 15-16Z"/>
      <path class="mask-mark__eye" d="M40 88c13-14 28-16 39-3-11 15-27 16-39 3Zm51-3c11-13 26-11 39 3-12 13-28 12-39-3Z"/>
      <path class="mask-mark__mouth" d="M52 161c20 11 46 11 66 0-10 19-56 19-66 0Z"/>
      <path class="mask-mark__scar" d="m119 43 15 18-17 6 14 17"/>
    </svg>`;
}

function revealHeading(title, className = "") {
  const lines = title.split("\n");
  return `
    <h2 class="section-title ${className}">
      ${lines
        .map(
          (line) =>
            `<span class="reveal-line"><span>${escapeHtml(line)}</span></span>`,
        )
        .join("")}
    </h2>`;
}

function sectionLabel(text) {
  return `<p class="section-kicker"><span></span>${escapeHtml(text)}</p>`;
}

function renderHero() {
  const { identity, copy } = data;

  return `
    <section class="hero phase-section" id="the-plan" data-phase="1" aria-labelledby="hero-title">
      <div class="hero__blueprint" aria-hidden="true">
        <svg viewBox="0 0 1440 820" preserveAspectRatio="none">
          <path class="draw-line" d="M-20 618C162 540 148 383 363 382s134-171 352-156c220 15 185 216 386 235 143 14 194-56 359-154"/>
          <path class="draw-line draw-line--thin" d="M64 672h205l57-79h242l72 86h206l81-101h212"/>
          <circle cx="363" cy="382" r="12"/><circle cx="715" cy="226" r="12"/><circle cx="1101" cy="461" r="12"/>
        </svg>
      </div>
      <div class="hero__topline">
        <span>${escapeHtml(copy.heroEyebrow)}</span>
        <span>00 / 06</span>
      </div>
      <div class="hero__intro" data-type-text="${escapeHtml(identity.greeting)}">${escapeHtml(identity.greeting)}</div>
      <div class="hero__main">
        <div class="hero__title-wrap">
          <h1 id="hero-title" class="hero__title">
            ${identity.titleLines
              .map(
                (line, index) =>
                  `<span class="hero__title-line hero__title-line--${index + 1}">${escapeHtml(line)}</span>`,
              )
              .join("")}
          </h1>
          <span class="hero__role">${escapeHtml(identity.role)}</span>
        </div>
        <div class="hero__mask-wrap">
          ${maskMark("hero__mask", true)}
          <span class="hero__coordinate">${escapeHtml(identity.base)}</span>
        </div>
      </div>
      <div class="hero__bottomline">
        <p>${escapeHtml(identity.pitch)}</p>
        <a class="scroll-prompt magnetic" href="#the-dossier">
          <span>${escapeHtml(copy.heroSideNote)}</span><i aria-hidden="true"></i>
        </a>
      </div>
    </section>`;
}

function renderDossier() {
  const { copy, dossier, identity } = data;
  const fields = [
    ["SUBJECT", identity.name],
    ["ROLE", identity.role],
    ["OPERATION", dossier.operation],
    ["LOCATION", dossier.location],
    ["STATUS", dossier.availability],
  ];

  return `
    <section class="dossier phase-section" id="the-dossier" data-phase="2" aria-labelledby="dossier-title">
      <div class="dossier__shutter shutter-trigger" aria-hidden="true"><span></span><span></span></div>
      <div class="section-shell dossier__shell">
        <header class="section-head dossier__head">
          ${sectionLabel(copy.dossierKicker)}
          ${revealHeading(copy.dossierTitle)}
        </header>
        <article class="case-file">
          <div class="case-file__clip" aria-hidden="true"></div>
          <div class="case-file__header">
            <span>FILE / AR-06-2026</span>
            <span>ACCESS / EYES ONLY</span>
          </div>
          <div class="case-file__stamp">${escapeHtml(copy.dossierStamp)}</div>
          <div class="case-file__columns">
            <div>
              <p class="case-file__intro">${escapeHtml(copy.dossierIntro)}</p>
              <p class="typed-dossier" data-type-text="${escapeHtml(dossier.summary)}">${escapeHtml(dossier.summary)}</p>
            </div>
            <dl class="dossier-fields">
              ${fields
                .map(
                  ([label, value]) => `
                    <div class="dossier-field">
                      <dt>${escapeHtml(label)}</dt>
                      <dd><span>${escapeHtml(value)}</span><b class="redaction" aria-hidden="true"></b></dd>
                    </div>`,
                )
                .join("")}
            </dl>
          </div>
          <div class="case-file__notes">
            ${dossier.notes
              .map(
                (note, index) => `
                  <p><span>0${index + 1}</span>${escapeHtml(note)}</p>`,
              )
              .join("")}
          </div>
          <p class="case-file__hint">${escapeHtml(copy.placeholderHint)}</p>
        </article>
      </div>
    </section>`;
}

function renderCrew() {
  const { copy, crew } = data;

  return `
    <section class="crew phase-section" id="the-crew" data-phase="3" aria-labelledby="crew-title">
      <div class="section-shell">
        <header class="section-head crew__head">
          ${sectionLabel(copy.crewKicker)}
          ${revealHeading(copy.crewTitle)}
          <p class="section-lead">${escapeHtml(copy.crewLead)}</p>
        </header>
        <div class="crew-roster">
          ${crew
            .map(
              (member, index) => `
                <article class="crew-card crew-card--${member.accent}" style="--order:${index}">
                  <div class="crew-card__top">
                    <span>UNIT ${escapeHtml(member.number)}</span>
                    <span>ACTIVE</span>
                  </div>
                  <div class="crew-card__portrait" aria-hidden="true">
                    ${maskMark()}
                    <span class="crew-card__scan"></span>
                  </div>
                  <h3>${escapeHtml(member.code)}</h3>
                  <p class="crew-card__role">${escapeHtml(member.role)}</p>
                  <ul>
                    ${member.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")}
                  </ul>
                  <span class="crew-card__index">0${index + 1}</span>
                </article>`,
            )
            .join("")}
        </div>
      </div>
    </section>`;
}

function blueprintLines() {
  return `
    <svg class="project-blueprint" viewBox="0 0 640 580" preserveAspectRatio="none" aria-hidden="true">
      <path class="draw-line" d="M22 470 144 355l106 52 119-260 149 120 104-166"/>
      <path class="draw-line draw-line--thin" d="M34 74h559M72 111v372M570 111v371M153 354h273"/>
      <circle cx="144" cy="355" r="10"/><circle cx="369" cy="147" r="10"/><circle cx="518" cy="267" r="10"/>
      <path class="project-blueprint__target" d="M454 334h110v110H454zM474 354h70v70h-70z"/>
    </svg>`;
}

function renderProjects() {
  const { copy, projects } = data;
  return `
    <section class="projects phase-section" id="the-heists" data-phase="4" aria-labelledby="heists-title">
      <div class="projects__intro section-shell">
        <header class="section-head">
          ${sectionLabel(copy.heistsKicker)}
          ${revealHeading(copy.heistsTitle)}
          <p class="section-lead">${escapeHtml(copy.heistsLead)}</p>
        </header>
      </div>
      <div class="projects__pin">
        <div class="projects__track">
          ${projects
            .map((project) => {
              const href = safeLink(project.link);
              return `
                <article class="project-panel">
                  ${blueprintLines()}
                  <div class="project-panel__crosshair" aria-hidden="true"></div>
                  <div class="project-panel__meta">
                    <span>CASE / ${escapeHtml(project.index)}</span>
                    <span>${escapeHtml(project.coordinate)}</span>
                  </div>
                  <div class="project-panel__content">
                    <p class="project-panel__target-label">${escapeHtml(copy.heistTarget)}</p>
                    <h3>${escapeHtml(project.name)}</h3>
                    <p class="project-panel__description">${escapeHtml(project.description)}</p>
                    <div class="project-panel__details">
                      <div>
                        <span>${escapeHtml(copy.heistMethod)}</span>
                        <ul>${project.tech.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                      </div>
                      <div>
                        <span>${escapeHtml(copy.heistStatus)}</span>
                        <strong>${escapeHtml(project.status)}</strong>
                      </div>
                    </div>
                    <a class="project-panel__link magnetic" href="${escapeHtml(href)}" ${externalAttributes(href)}>
                      ${escapeHtml(copy.heistLink)} <i aria-hidden="true">+</i>
                    </a>
                  </div>
                  <span class="project-panel__number">${escapeHtml(project.index)}</span>
                </article>`;
            })
            .join("")}
        </div>
      </div>
    </section>`;
}

function renderTimeline() {
  const { copy, experience } = data;
  return `
    <section class="timeline phase-section" id="the-timeline" data-phase="5" aria-labelledby="timeline-title">
      <div class="section-shell timeline__shell">
        <header class="section-head">
          ${sectionLabel(copy.timelineKicker)}
          ${revealHeading(copy.timelineTitle)}
          <p class="section-lead">${escapeHtml(copy.timelineLead)}</p>
        </header>
        <div class="timeline__body">
          <svg class="timeline__line" viewBox="0 0 10 1000" preserveAspectRatio="none" aria-hidden="true">
            <path class="draw-line" d="M5 0C-1 130 12 215 5 332S11 536 5 655 13 844 5 1000"/>
          </svg>
          <ol>
            ${experience
              .map(
                (entry, index) => `
                  <li class="timeline-entry">
                    <span class="timeline-entry__node" aria-hidden="true"></span>
                    <p class="timeline-entry__period">${escapeHtml(entry.period)}</p>
                    <h3>${escapeHtml(entry.title)}</h3>
                    <p class="timeline-entry__place">${escapeHtml(entry.place)}</p>
                    <p class="timeline-entry__description">${escapeHtml(entry.description)}</p>
                    <span class="timeline-entry__code">CHAPTER 0${index + 1}</span>
                  </li>`,
              )
              .join("")}
          </ol>
        </div>
      </div>
    </section>`;
}

function renderContact() {
  const { copy, contact } = data;
  const emailHref = safeLink(contact.email, "email");
  const githubHref = safeLink(contact.github);
  const linkedinHref = safeLink(contact.linkedin);

  return `
    <section class="contact phase-section" id="the-getaway" data-phase="6" aria-labelledby="getaway-title">
      <div class="contact__red-block" aria-hidden="true"></div>
      <div class="section-shell contact__shell">
        <header class="section-head contact__head">
          ${sectionLabel(copy.getawayKicker)}
          ${revealHeading(copy.getawayTitle, "contact__title")}
        </header>
        <div class="contact__lower">
          <p class="contact__lead">${escapeHtml(copy.getawayLead)}</p>
          <a class="contact__cta magnetic" href="${escapeHtml(emailHref)}">
            <span>${escapeHtml(copy.joinLabel)}</span><i aria-hidden="true">+</i>
          </a>
          <div class="contact__channels" id="placeholder-content">
            <p>${escapeHtml(copy.contactLabel)}</p>
            <a href="${escapeHtml(emailHref)}">${escapeHtml(contact.email)}</a>
            <a href="${escapeHtml(githubHref)}" ${externalAttributes(githubHref)}>${escapeHtml(contact.github)}</a>
            <a href="${escapeHtml(linkedinHref)}" ${externalAttributes(linkedinHref)}>${escapeHtml(contact.linkedin)}</a>
          </div>
        </div>
        <footer class="site-footer">
          <div>${maskMark("site-footer__mask")}</div>
          <p>${escapeHtml(copy.footerLine)}</p>
          <span>${escapeHtml(data.identity.name.toUpperCase())} / ${escapeHtml(data.identity.siteYear)}</span>
        </footer>
      </div>
    </section>`;
}

function renderPage() {
  main.innerHTML = [
    renderHero(),
    renderDossier(),
    `<section class="marquee" aria-label="${escapeHtml(data.copy.marquee)}"><div class="marquee__inner">${Array(5)
      .fill(`<span>${escapeHtml(data.copy.marquee)}</span><b aria-hidden="true">/</b>`)
      .join("")}</div></section>`,
    renderCrew(),
    renderProjects(),
    renderTimeline(),
    renderContact(),
  ].join("");

  document.title = `${data.identity.name} | The Plan`;
  document.querySelector("#wordmark-name").textContent = data.identity.name.toUpperCase();
  document.querySelector(".wordmark__mark").textContent = data.identity.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("/")
    .toUpperCase();
  document.querySelector(".site-header nav").innerHTML = [
    ["#the-dossier", data.copy.nav[0]],
    ["#the-heists", data.copy.nav[1]],
    ["#the-getaway", data.copy.nav[2]],
  ]
    .map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`)
    .join("");
}

function prepareSvgLines() {
  document.querySelectorAll(".draw-line").forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });
}

function runTypewriter(element, speed = 18) {
  const message = element.dataset.typeText;
  if (!message || element.dataset.typed === "true") return;

  element.dataset.typed = "true";
  element.textContent = "";
  let cursor = 0;

  const write = () => {
    element.textContent = message.slice(0, cursor);
    cursor += 1;
    if (cursor <= message.length) {
      window.setTimeout(write, speed);
    }
  };

  write();
}

function setupCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const cursor = document.querySelector(".laser-cursor");
  cursor.insertAdjacentHTML("beforeend", maskMark("laser-cursor__mask"));
  let x = -80;
  let y = -80;

  window.addEventListener(
    "pointermove",
    (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      cursor.classList.add("is-visible");
    },
    { passive: true },
  );

  document.querySelectorAll("a, button, .project-panel").forEach((element) => {
    element.addEventListener("pointerenter", () => cursor.classList.add("is-tight"));
    element.addEventListener("pointerleave", () => cursor.classList.remove("is-tight"));
  });
}

function setupMagneticButtons() {
  if (!window.matchMedia("(pointer: fine)").matches || reduceMotion.matches) return;

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.16;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.16;
      gsap.to(element, { x, y, duration: 0.24, ease: "power2.out", overwrite: true });
    });
    element.addEventListener("pointerleave", () => {
      gsap.to(element, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.45)" });
    });
  });
}

function updateHud(progress) {
  const countdown = document.querySelector("#countdown");
  const progressLine = document.querySelector("#scroll-progress");
  const phaseLabel = document.querySelector("#phase-label");
  const contact = document.querySelector("#the-getaway");
  const phases = [...document.querySelectorAll(".phase-section")];
  const contactStart = Math.max(1, contact.offsetTop - window.innerHeight * 0.25);
  const operationProgress = Math.min(1, window.scrollY / contactStart);
  const secondsRemaining = Math.max(0, Math.ceil(360 * (1 - operationProgress)));
  const hours = String(Math.floor(secondsRemaining / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((secondsRemaining % 3600) / 60)).padStart(2, "0");
  const seconds = String(secondsRemaining % 60).padStart(2, "0");
  const currentPhase =
    phases.reduce((active, section, index) => {
      return window.scrollY + window.innerHeight * 0.34 >= section.offsetTop ? index + 1 : active;
    }, 1) || 1;

  countdown.textContent = `${hours}:${minutes}:${seconds}`;
  progressLine.style.transform = `scaleX(${progress})`;
  phaseLabel.textContent = `PHASE ${String(currentPhase).padStart(2, "0")} / 06`;
}

function setupReducedMotion() {
  document.documentElement.classList.add("reduced-motion");
  document.querySelectorAll(".draw-line").forEach((path) => {
    path.style.strokeDashoffset = "0";
  });
  document.querySelectorAll("[data-type-text]").forEach((element) => {
    element.textContent = element.dataset.typeText;
  });
  updateHud(Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)));
  window.addEventListener(
    "scroll",
    () =>
      updateHud(
        Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)),
      ),
    { passive: true },
  );
}

function setupMotion() {
  if (reduceMotion.matches) {
    setupReducedMotion();
    return;
  }

  const lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    syncTouch: false,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => updateHud(self.progress),
  });

  runTypewriter(document.querySelector(".hero__intro"), 32);
  gsap.set(".hero__title-line", { yPercent: 0 });
  const heroTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "+=145%",
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
    },
  });
  heroTimeline
    .to(".hero__intro", { y: -50, opacity: 0, duration: 0.18 }, 0)
    .to(".hero__title-line--1", { xPercent: -120, duration: 0.7 }, 0.16)
    .to(".hero__title-line--2", { xPercent: 120, duration: 0.7 }, 0.16)
    .to(".hero__title-line--3", { yPercent: 120, duration: 0.7 }, 0.16)
    .to(".hero__mask-wrap", { yPercent: -80, opacity: 0, duration: 0.35 }, 0.18)
    .to(".hero__blueprint", { opacity: 0, duration: 0.4 }, 0.35)
    .to(".hero__bottomline", { opacity: 0, duration: 0.18 }, 0.2);

  document.querySelectorAll(".section-title").forEach((heading) => {
    gsap.fromTo(
      heading.querySelectorAll(".reveal-line > span"),
      { yPercent: 120 },
      {
        yPercent: 0,
        duration: 0.8,
        ease: "power4.out",
        stagger: 0.1,
        scrollTrigger: { trigger: heading, start: "top 83%" },
      },
    );
  });

  ScrollTrigger.create({
    trigger: ".dossier",
    start: "top 63%",
    once: true,
    onEnter: () => runTypewriter(document.querySelector(".typed-dossier"), 11),
  });

  gsap.utils.toArray(".redaction").forEach((bar) => {
    gsap.to(bar, {
      xPercent: 110,
      duration: 0.8,
      ease: "power3.inOut",
      scrollTrigger: { trigger: bar, start: "top 83%" },
    });
  });

  gsap.utils.toArray(".shutter-trigger").forEach((shutter) => {
    gsap.to(shutter.querySelectorAll("span"), {
      xPercent: (index) => (index ? 105 : -105),
      ease: "power4.inOut",
      scrollTrigger: { trigger: shutter, start: "top 75%", end: "bottom 45%", scrub: true },
    });
  });

  document.querySelectorAll(".draw-line").forEach((path) => {
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: path.closest("section") || path.closest(".project-panel"),
        start: "top 82%",
        end: "bottom 30%",
        scrub: 0.8,
      },
    });
  });

  gsap.from(".crew-card", {
    y: 80,
    opacity: 0,
    stagger: 0.07,
    duration: 0.75,
    ease: "power3.out",
    scrollTrigger: { trigger: ".crew-roster", start: "top 78%" },
  });

  const marqueeTween = gsap.to(".marquee__inner", {
    xPercent: -25,
    duration: 18,
    ease: "none",
    repeat: -1,
  });
  ScrollTrigger.create({
    trigger: "body",
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const velocity = self.getVelocity();
      const speed = gsap.utils.clamp(-2.5, 2.5, velocity / 900);
      gsap.to(marqueeTween, { timeScale: speed || 0.45, duration: 0.4, overwrite: true });
    },
  });

  const media = gsap.matchMedia();
  media.add("(min-width: 801px)", () => {
    const pin = document.querySelector(".projects__pin");
    const track = document.querySelector(".projects__track");
    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const horizontal = gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: () => `+=${getDistance() + window.innerHeight * 0.35}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    document.querySelectorAll(".project-panel").forEach((panel, index) => {
      gsap.to(panel.querySelector(".project-blueprint"), {
        xPercent: index % 2 ? 10 : -10,
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${getDistance() + window.innerHeight * 0.35}`,
          scrub: 1,
        },
      });
    });

    return () => horizontal.kill();
  });

  gsap.to(".film-grain", {
    yPercent: -8,
    ease: "none",
    scrollTrigger: { trigger: "body", start: 0, end: "max", scrub: true },
  });
  gsap.to(".hero__mask", {
    yPercent: -18,
    rotate: -6,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  ScrollTrigger.refresh();
}

function dismissLoader() {
  const loader = document.querySelector(".site-loader");
  const mark = loader.querySelector(".loader-mark");
  mark.innerHTML = maskMark("", false);
  window.setTimeout(() => {
    gsap.to(loader, {
      yPercent: -100,
      duration: 0.75,
      ease: "power4.inOut",
      onComplete: () => loader.remove(),
    });
  }, 350);
}

renderPage();
prepareSvgLines();
setupCursor();
setupMagneticButtons();
setupMotion();
dismissLoader();

if ("fonts" in document) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
