import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Lenis from "lenis";
import { portfolioData as data } from "./content.js";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const main = document.querySelector("#main-content");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopQuery = "(min-width: 801px) and (prefers-reduced-motion: no-preference)";
const mobileQuery = "(max-width: 800px) and (prefers-reduced-motion: no-preference)";
const totalPhases = data.copy.phases.length;
let audioEnabled = false;
let audioContext;
let lastClockValue = "";
let lastLaserFlicker = 0;
let lastPhase = 0;
let logTimer;
let hudMetrics = { contactStart: 1, phases: [] };

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isPlaceholder = (value) => String(value).includes("[");

const safeLink = (value, type = "url") => {
  if (isPlaceholder(value) || !value) return "";
  return type === "email" ? `mailto:${value}` : value;
};

const externalAttributes = (href) =>
  href?.startsWith("http") ? 'target="_blank" rel="noreferrer"' : "";

const linkMarkup = (href, label, className = "", attributes = "") => {
  if (!href) return "";
  return `<a class="${className}" href="${escapeHtml(href)}" ${attributes}>${escapeHtml(label)}</a>`;
};

function maskMark(className = "", labelled = false) {
  return `
    <svg class="mask-mark ${className}" viewBox="0 0 170 220" ${
      labelled ? 'role="img" aria-label="Abstract theatrical mask"' : 'aria-hidden="true"'
    }>
      <path class="mask-mark__face" d="M85 9C52 10 27 33 24 76l8 66c3 36 25 64 53 70 28-6 50-34 53-70l8-66C143 33 118 10 85 9Z"/>
      <path class="mask-mark__ridge" d="M85 36 70 124l15 16 15-16Z"/>
      <path class="mask-mark__eye mask-mark__eye--left" d="M40 88c13-14 28-16 39-3-11 15-27 16-39 3Z"/>
      <path class="mask-mark__eye mask-mark__eye--right" d="M91 85c11-13 26-11 39 3-12 13-28 12-39-3Z"/>
      <path class="mask-mark__mouth" d="M52 161c20 11 46 11 66 0-10 19-56 19-66 0Z"/>
      <path class="mask-mark__scar" d="m119 43 15 18-17 6 14 17"/>
    </svg>`;
}

function noteMark(index) {
  return `
    <span class="paper-note paper-note--${index}" aria-hidden="true">
      <svg viewBox="0 0 96 54"><rect x="3" y="3" width="90" height="48"/><circle cx="48" cy="27" r="12"/><path d="M16 15h17M63 39h17M66 15h14M16 39h14"/></svg>
    </span>`;
}

function revealHeading(title, className = "") {
  return `
    <h2 class="section-title ${className}">
      ${title
        .split("\n")
        .map(
          (line) =>
            `<span class="reveal-line"><span data-decrypt="${escapeHtml(line)}">${escapeHtml(line)}</span></span>`,
        )
        .join("")}
    </h2>`;
}

function sectionLabel(text) {
  return `
    <p class="section-kicker">
      <span class="section-kicker__rule" aria-hidden="true"></span>
      <span data-decrypt="${escapeHtml(text)}">${escapeHtml(text)}</span>
    </p>`;
}

function letterLine(line, index) {
  return `
    <span class="hero__title-line hero__title-line--${index + 1}">
      ${[...line]
        .map((letter) => `<span class="hero-letter">${letter === " " ? "&nbsp;" : escapeHtml(letter)}</span>`)
        .join("")}
    </span>`;
}

function transitionMark(type) {
  return `
    <div class="operation-transition operation-transition--${type}" aria-hidden="true">
      <span></span><span></span>
      <div class="police-tape">${Array(3).fill(`<b>${escapeHtml(data.copy.tape)}</b>`).join("")}</div>
    </div>`;
}

function phaseStamp(text) {
  return `<span class="phase-stamp">${escapeHtml(text)}</span>`;
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
      <div class="hero__topline"><span>${escapeHtml(copy.heroEyebrow)}</span><span>00 / ${String(totalPhases).padStart(2, "0")}</span></div>
      ${phaseStamp(copy.stamps.plan)}
      <div class="hero__intro" data-type-text="${escapeHtml(identity.greeting)}">${escapeHtml(identity.greeting)}</div>
      <div class="hero__main">
        <div class="hero__title-wrap">
          <h1 id="hero-title" class="hero__title">${identity.titleLines.map(letterLine).join("")}</h1>
          <span class="hero__role">${escapeHtml(identity.role)}</span>
        </div>
        <div class="hero__mask-wrap">
          ${maskMark("hero__mask", true)}
          <span class="hero__coordinate">${escapeHtml(identity.base)}</span>
        </div>
        <div class="hero__eye-portal" aria-hidden="true"></div>
      </div>
      <div class="hero__bottomline">
        <p>${escapeHtml(identity.pitch)}</p>
        <a class="scroll-prompt magnetic" href="#the-dossier"><span>${escapeHtml(copy.heroSideNote)}</span><i aria-hidden="true"></i></a>
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
  const backPage = (type, code, title) => `
    <article class="case-file case-file--${type}" aria-hidden="true">
      <div class="case-file__header"><span>FILE / ${code}</span><span>ACCESS / EYES ONLY</span></div>
      <p class="case-file__ghost-title">${title}</p>
      <div class="case-file__ghost-rules"><i></i><i></i><i></i><i></i><i></i></div>
    </article>`;

  return `
    <section class="dossier phase-section" id="the-dossier" data-phase="2" aria-labelledby="dossier-title">
      <div class="dossier__shutter shutter-trigger" aria-hidden="true"><span></span><span></span></div>
      <div class="section-shell dossier__shell">
        <header class="section-head dossier__head">
          ${sectionLabel(copy.dossierKicker)}
          ${revealHeading(copy.dossierTitle)}
          ${phaseStamp(copy.stamps.dossier)}
        </header>
        <div class="case-file-stack">
          ${backPage("back", "AR-06-B", "ROUTE NOTES")}
          ${backPage("middle", "AR-06-C", "CONTINGENCY")}
          <article class="case-file case-file--front">
            <div class="case-file__clip" aria-hidden="true"></div>
            <div class="case-file__header"><span>FILE / AR-06-2026</span><span>ACCESS / EYES ONLY</span></div>
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
              ${dossier.notes.map((note, index) => `<p><span>0${index + 1}</span>${escapeHtml(note)}</p>`).join("")}
            </div>
          </article>
        </div>
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
          ${phaseStamp(copy.stamps.crew)}
        </header>
        <div class="crew-roster">
          ${crew
            .map(
              (member, index) => `
                <article class="crew-card crew-card--${member.accent}" tabindex="0" role="button" aria-label="Reveal ${escapeHtml(member.code)} skills">
                  <div class="crew-card__flip">
                    <div class="crew-card__front">
                      <div class="crew-card__top"><span>UNIT ${escapeHtml(member.number)}</span><span>ACTIVE</span></div>
                      <div class="crew-card__portrait" aria-hidden="true">${maskMark()}<span class="crew-card__scan"></span></div>
                      <h3>${escapeHtml(member.code)}</h3>
                      <p class="crew-card__role">${escapeHtml(member.role)}</p>
                      <span class="crew-card__instruction">TURN FOR SKILLS</span>
                      <span class="crew-card__index">0${index + 1}</span>
                    </div>
                    <div class="crew-card__back">
                      <span>SKILL ALLOCATION / ${escapeHtml(member.number)}</span>
                      <h3>${escapeHtml(member.code)}</h3>
                      <ul>${member.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")}</ul>
                      <p>Tap again to return to the operation.</p>
                    </div>
                  </div>
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

function floorPlan() {
  return `
    <div class="projects__floorplan" aria-hidden="true">
      <svg viewBox="0 0 1200 520" preserveAspectRatio="none">
        <g class="floor-room floor-room--0"><path class="draw-line" d="M45 55h230v135H45z"/><text x="68" y="90">ENTRY</text></g>
        <g class="floor-room floor-room--1"><path class="draw-line" d="M330 55h230v135H330z"/><text x="353" y="90">SYSTEMS</text></g>
        <g class="floor-room floor-room--2"><path class="draw-line" d="M625 55h225v135H625z"/><text x="648" y="90">ARCHIVE</text></g>
        <g class="floor-room floor-room--3"><path class="draw-line" d="M905 55h245v135H905z"/><text x="928" y="90">EXIT</text></g>
        <path id="crew-route" class="floor-route" d="M80 260C188 186 254 332 338 255S485 184 563 264s132 57 198-14 141-68 210 6 108 26 172-64"/>
        <circle id="crew-route-dot" cx="80" cy="260" r="10"/>
        <path class="floor-dimension" d="M45 452h1105M45 441v22M1150 441v22"/>
      </svg>
    </div>`;
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
          ${phaseStamp(copy.stamps.heists)}
        </header>
      </div>
      <div class="projects__pin">
        ${floorPlan()}
        <div class="projects__track">
          ${projects
            .map((project) => {
              const href = safeLink(project.link);
              return `
                <article class="project-panel">
                  ${blueprintLines()}
                  <div class="project-panel__evidence" aria-hidden="true"><span>VISUAL / CASE ${escapeHtml(project.index)}</span></div>
                  <div class="project-panel__crosshair" aria-hidden="true"></div>
                  <div class="project-panel__meta"><span>CASE / ${escapeHtml(project.index)}</span><span>${escapeHtml(project.coordinate)}</span></div>
                  <div class="project-panel__dimensions" aria-hidden="true">W-640 / H-580 / CLEARANCE 03</div>
                  <div class="project-panel__content">
                    <p class="project-panel__target-label">${escapeHtml(copy.heistTarget)}</p>
                    <h3>${escapeHtml(project.name)}</h3>
                    <p class="project-panel__description">${escapeHtml(project.description)}</p>
                    <div class="project-panel__details">
                      <div><span>${escapeHtml(copy.heistMethod)}</span><ul>${project.tech.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
                      <div><span>${escapeHtml(copy.heistStatus)}</span><strong>${escapeHtml(project.status)}</strong></div>
                    </div>
                    ${href ? `<a class="project-panel__link magnetic" href="${escapeHtml(href)}" ${externalAttributes(href)}>${escapeHtml(copy.heistLink)} <i aria-hidden="true">+</i></a>` : ""}
                  </div>
                  <span class="project-panel__number">${escapeHtml(project.index)}</span>
                </article>`;
            })
            .join("")}
        </div>
      </div>
    </section>`;
}

function dialTicks() {
  return Array.from(
    { length: 36 },
    (_, index) => `<i style="--tick:${index}"></i>`,
  ).join("");
}

function renderVault() {
  const { copy, achievements } = data;
  const href = safeLink(achievements.highlight.postUrl);
  return `
    <section class="vault phase-section" id="the-vault" data-phase="5" aria-labelledby="vault-title">
      <div class="section-shell vault__shell">
        <header class="section-head vault__head">
          ${sectionLabel(copy.vaultKicker)}
          ${revealHeading(copy.vaultTitle)}
          <p class="section-lead">${escapeHtml(copy.vaultLead)}</p>
          ${phaseStamp(copy.stamps.vault)}
        </header>
        <div class="vault__pin">
          <div class="vault__machine">
            <div class="vault__door">
              <div class="vault__dial">${dialTicks()}<span class="vault__dial-center"></span></div>
              <div class="vault__combination" aria-label="Vault combination">
                ${achievements.combination.map((number, index) => `<span data-combination="${escapeHtml(number)}">00</span>`).join("")}
              </div>
              <p>${escapeHtml(copy.vaultOpen)}</p>
            </div>
            <div class="vault__loot">
              <span>${escapeHtml(copy.achievementLabel)}</span>
              <article>
                <p class="vault__loot-countdown" data-vault-countdown="${escapeHtml(achievements.highlight.countdown)}">${escapeHtml(achievements.highlight.countdown)}</p>
                <h3>${escapeHtml(achievements.highlight.title)}</h3>
                <p class="vault__result-stamp">${escapeHtml(achievements.highlight.result)}</p>
                <dl class="vault__facts">
                  <div><dt>${escapeHtml(copy.resultLabel)}</dt><dd>${escapeHtml(achievements.highlight.result)}</dd></div>
                  <div><dt>${escapeHtml(copy.builtLabel)}</dt><dd>${escapeHtml(achievements.highlight.whatBuilt)}</dd></div>
                </dl>
                <p>${escapeHtml(achievements.highlight.description)}</p>
                ${href ? `<a class="magnetic" href="${escapeHtml(href)}" ${externalAttributes(href)}>${escapeHtml(copy.originalPostLabel)} <i aria-hidden="true">+</i></a>` : ""}
              </article>
            </div>
            <aside class="vault__transcript">
              <span>${escapeHtml(copy.transcriptLabel)}</span>
              <p data-type-text="${escapeHtml(achievements.transcript.join("\n"))}">${escapeHtml(achievements.transcript[0])}</p>
            </aside>
            <div class="evidence-tags">
              ${achievements.other
                .map(
                  (achievement, index) => `
                    <article class="evidence-tag evidence-tag--${index + 1}">
                      <span>${escapeHtml(achievement.year)}</span>
                      <h4>${escapeHtml(achievement.title)}</h4>
                      <p>${escapeHtml(achievement.detail)}</p>
                    </article>`,
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function renderExperience() {
  const { copy, experience } = data;
  return `
    <section class="corkboard phase-section" id="the-experience" data-phase="6" aria-labelledby="timeline-title">
      <div class="section-shell corkboard__shell">
        <header class="section-head">
          ${sectionLabel(copy.timelineKicker)}
          ${revealHeading(copy.timelineTitle)}
          <p class="section-lead">${escapeHtml(copy.timelineLead)}</p>
          ${phaseStamp(copy.stamps.timeline)}
        </header>
        <div class="corkboard__board">
          <svg class="corkboard__thread" viewBox="0 0 1180 690" preserveAspectRatio="none" aria-hidden="true">
            <path class="draw-line" d="M87 132C251 26 368 250 515 160S759 24 846 269 1063 395 1120 548"/>
          </svg>
          <ol>
            ${experience
              .map(
                (entry, index) => `
                  <li class="cork-card cork-card--${index + 1}">
                    <span class="cork-card__pin" aria-hidden="true"></span>
                    <p class="cork-card__period">${escapeHtml(entry.period)}</p>
                    <h3>${escapeHtml(entry.title)}</h3>
                    <p class="cork-card__place">${escapeHtml(entry.place)}</p>
                    <p class="cork-card__description">${escapeHtml(entry.description)}</p>
                    <span class="cork-card__code">CHAPTER 0${index + 1}</span>
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
    <section class="contact phase-section" id="the-getaway" data-phase="7" aria-labelledby="getaway-title">
      <div class="contact__mask-curtain" aria-hidden="true">${maskMark("contact__mask")}</div>
      <div class="contact__red-block" aria-hidden="true"></div>
      <div class="contact__notes" aria-hidden="true">${Array.from({ length: 10 }, (_, index) => noteMark(index + 1)).join("")}</div>
      <div class="section-shell contact__shell">
        <header class="section-head contact__head">
          ${sectionLabel(copy.getawayKicker)}
          ${revealHeading(copy.getawayTitle, "contact__title")}
          ${phaseStamp(copy.stamps.getaway)}
        </header>
        <div class="contact__lower">
          <p class="contact__lead">${escapeHtml(copy.getawayLead)}</p>
          ${emailHref ? `<a class="contact__cta magnetic" href="${escapeHtml(emailHref)}"><span>${escapeHtml(copy.joinLabel)}</span><i aria-hidden="true">+</i></a>` : ""}
          <div class="contact__channels">
            <p>${escapeHtml(copy.contactLabel)}</p>
            ${linkMarkup(emailHref, contact.email)}
            ${linkMarkup(githubHref, "GITHUB", "", externalAttributes(githubHref))}
            ${linkMarkup(linkedinHref, "LINKEDIN", "", externalAttributes(linkedinHref))}
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
    transitionMark("torn"),
    `<section class="marquee" aria-label="${escapeHtml(data.copy.marquee)}"><div class="marquee__inner">${Array(5).fill(`<span>${escapeHtml(data.copy.marquee)}</span><b aria-hidden="true">/</b>`).join("")}</div></section>`,
    renderCrew(),
    transitionMark("cut"),
    renderProjects(),
    transitionMark("vault"),
    renderVault(),
    transitionMark("torn"),
    renderExperience(),
    transitionMark("cut"),
    renderContact(),
  ].join("");

  document.title = `${data.identity.name} | The Plan`;
  document.querySelector("#wordmark-name").textContent = data.identity.name.toUpperCase();
  document.querySelector(".wordmark__mark").textContent = data.identity.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("/")
    .toUpperCase();
  document.querySelector("#availability-tag").textContent = data.copy.availableStatus;
  document.querySelector("#rules-toggle").textContent = data.copy.nav[0];
  document.querySelector("#sound-toggle").textContent = data.copy.soundOff;
  document.querySelector(".loader-label").textContent = `${data.copy.loaderLabel} 0%`;
  document.querySelector("#cctv-camera").textContent = data.copy.cameraLabel;
  document.querySelector("#cctv-location").textContent = data.copy.cameraLocation;
  document.querySelector("#heist-log-text").textContent = data.copy.logEntries[0];
  document.querySelector("#rules-list").innerHTML = data.copy.rules
    .map(
      (rule) => `
        <li>
          <a href="${escapeHtml(rule.target)}">
            <span>${escapeHtml(rule.number)}</span>
            <strong>${escapeHtml(rule.label)}</strong>
            <em>${escapeHtml(rule.rule)}</em>
          </a>
        </li>`,
    )
    .join("");
}

function prepareSvgLines() {
  document.querySelectorAll(".draw-line").forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });
}

function runTypewriter(element, speed = 16) {
  if (!element || element.dataset.typed === "true") return;
  const message = element.dataset.typeText;
  if (!message) return;
  element.dataset.typed = "true";
  element.textContent = "";
  let cursor = 0;

  const write = () => {
    element.textContent = message.slice(0, cursor);
    cursor += 1;
    if (cursor <= message.length) window.setTimeout(write, speed);
  };

  write();
}

function decryptText(element) {
  if (element.dataset.decrypted === "true") return;
  const text = element.dataset.decrypt || element.textContent;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-";
  const state = { frame: 0 };
  element.dataset.decrypted = "true";

  gsap.to(state, {
    frame: text.length * 2.2,
    duration: Math.max(0.38, text.length * 0.022),
    ease: "none",
    onUpdate: () => {
      const resolved = Math.floor(state.frame / 2.2);
      element.textContent = [...text]
        .map((character, index) => {
          if (character === " ") return " ";
          return index < resolved ? character : alphabet[Math.floor(Math.random() * alphabet.length)];
        })
        .join("");
    },
    onComplete: () => {
      element.textContent = text;
    },
  });
}

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${remainder}`;
}

function initializeClock() {
  const clock = document.querySelector("#countdown");
  clock.innerHTML = [...clock.textContent].map((character) => {
    return character === ":" ? '<span class="clock-separator">:</span>' : `<span class="clock-digit">${character}</span>`;
  }).join("");
}

function setClock(value) {
  const digits = [...document.querySelectorAll(".clock-digit")];
  const nextDigits = value.replaceAll(":", "").split("");
  digits.forEach((digit, index) => {
    if (digit.textContent === nextDigits[index]) return;
    digit.classList.remove("is-flipping");
    void digit.offsetWidth;
    digit.classList.add("is-flipping");
    window.setTimeout(() => {
      digit.textContent = nextDigits[index];
    }, 85);
  });
}

function pulseAudio(frequency, duration, volume, type = "sine") {
  if (!audioEnabled || !audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration + 0.02);
}

function setupSound() {
  const toggle = document.querySelector("#sound-toggle");
  toggle.addEventListener("click", async () => {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    await audioContext.resume();
    audioEnabled = !audioEnabled;
    toggle.setAttribute("aria-pressed", String(audioEnabled));
    toggle.textContent = audioEnabled ? data.copy.soundOn : data.copy.soundOff;
    if (audioEnabled) pulseAudio(180, 0.16, 0.035, "triangle");
  });
}

function typeLog(message) {
  const log = document.querySelector("#heist-log-text");
  window.clearTimeout(logTimer);
  log.textContent = "";
  let cursor = 0;
  const type = () => {
    log.textContent = message.slice(0, cursor);
    cursor += 1;
    if (cursor <= message.length) {
      logTimer = window.setTimeout(type, 12);
    }
  };
  type();
}

function flashCctv() {
  if (prefersReducedMotion.matches) return;
  const cctv = document.querySelector(".cctv-overlay");
  cctv.classList.remove("is-glitching");
  void cctv.offsetWidth;
  cctv.classList.add("is-glitching");
}

function updateHud(progress) {
  const scrollY = window.scrollY;
  const operationProgress = Math.min(1, scrollY / hudMetrics.contactStart);
  const remainingSeconds = 360 * (1 - operationProgress);
  const clockValue = formatDuration(remainingSeconds);
  const currentPhase =
    hudMetrics.phases.reduce((active, offsetTop, index) => {
      return scrollY + window.innerHeight * 0.42 >= offsetTop ? index + 1 : active;
    }, 1) || 1;

  if (clockValue !== lastClockValue) {
    if (lastClockValue && audioEnabled) pulseAudio(820, 0.025, 0.012, "square");
    setClock(clockValue);
    lastClockValue = clockValue;
  }

  document.querySelector("#scroll-progress").style.transform = `scaleX(${progress})`;
  document.querySelector("#phase-label").textContent = `PHASE ${String(currentPhase).padStart(2, "0")} / ${String(totalPhases).padStart(2, "0")}`;
  document.body.classList.toggle("is-tense", remainingSeconds <= 60 && remainingSeconds > 0);
  if (currentPhase !== lastPhase) {
    lastPhase = currentPhase;
    typeLog(data.copy.logEntries[currentPhase - 1]);
    flashCctv();
  }
}

function refreshHudMetrics() {
  const contact = document.querySelector("#the-getaway");
  hudMetrics = {
    contactStart: Math.max(1, contact.offsetTop - window.innerHeight * 0.42),
    phases: [...document.querySelectorAll(".phase-section")].map((section) => section.offsetTop),
  };
}

function screenShake(target) {
  if (prefersReducedMotion.matches) return;
  gsap.to(target, {
    keyframes: [{ x: -4 }, { x: 4 }, { x: -2 }, { x: 0 }],
    duration: 0.3,
    ease: "power1.out",
  });
}

function flickerTripwire() {
  const now = performance.now();
  if (now - lastLaserFlicker < 360) return;
  lastLaserFlicker = now;
  const laser = document.querySelector(".laser-tripwire");
  laser.classList.remove("is-flickering");
  void laser.offsetWidth;
  laser.classList.add("is-flickering");
}

function setupCursorAndMagnetism() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  const cursor = document.querySelector(".laser-cursor");
  cursor.insertAdjacentHTML("beforeend", `${maskMark("laser-cursor__mask")}<span class="laser-cursor__label">${escapeHtml(data.copy.viewLabel)}</span>`);
  let previousY = -100;

  window.addEventListener(
    "pointermove",
    (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      cursor.classList.add("is-visible");
      const laserY = document.querySelector(".laser-tripwire").getBoundingClientRect().top;
      if ((previousY < laserY && event.clientY >= laserY) || (previousY > laserY && event.clientY <= laserY)) {
        flickerTripwire();
      }
      previousY = event.clientY;
    },
    { passive: true },
  );

  document.querySelectorAll("a, button, .project-panel").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      cursor.classList.add("is-tight");
      if (element.classList.contains("project-panel")) cursor.classList.add("is-project");
    });
    element.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-tight", "is-project");
    });
  });

  if (prefersReducedMotion.matches) return;
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      gsap.to(element, {
        x: (event.clientX - bounds.left - bounds.width / 2) * 0.13,
        y: (event.clientY - bounds.top - bounds.height / 2) * 0.13,
        duration: 0.2,
        overwrite: true,
      });
    });
    element.addEventListener("pointerleave", () => {
      gsap.to(element, { x: 0, y: 0, duration: 0.45, ease: "elastic.out(1, 0.45)" });
    });
  });
}

function setupCctv() {
  const time = document.querySelector("#cctv-time");
  const updateTime = () => {
    const now = new Date();
    time.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };
  updateTime();
  window.setInterval(updateTime, 1000);
}

function setupWatchingMask(lenis) {
  const eyes = gsap.utils.toArray(".hero__mask .mask-mark__eye");
  if (!eyes.length) return;

  if (window.matchMedia("(pointer: fine)").matches) {
    const moveEyeX = gsap.quickTo(eyes, "x", { duration: 0.35, ease: "power2.out" });
    const moveEyeY = gsap.quickTo(eyes, "y", { duration: 0.35, ease: "power2.out" });
    window.addEventListener(
      "pointermove",
      (event) => {
        const bounds = document.querySelector(".hero__mask").getBoundingClientRect();
        const x = gsap.utils.clamp(-3.2, 3.2, ((event.clientX - (bounds.left + bounds.width / 2)) / bounds.width) * 7);
        const y = gsap.utils.clamp(-2.2, 2.2, ((event.clientY - (bounds.top + bounds.height / 2)) / bounds.height) * 5);
        moveEyeX(x);
        moveEyeY(y);
      },
      { passive: true },
    );
    return;
  }

  lenis.on("scroll", (event) => {
    const y = gsap.utils.clamp(-2.2, 2.2, (event.velocity ?? 0) * 0.09);
    gsap.to(eyes, { y, duration: 0.3, ease: "power2.out", overwrite: true });
  });
}

function setupClickRipples() {
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (prefersReducedMotion.matches) return;
      const ripple = document.createElement("span");
      ripple.className = "click-ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      document.body.append(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    },
    { passive: true },
  );
}

function setupRulesMenu() {
  const overlay = document.querySelector("#rules-menu");
  const open = document.querySelector("#rules-toggle");
  const close = document.querySelector("#rules-close");
  let previousFocus;

  const setOpen = (isOpen) => {
    overlay.classList.toggle("is-open", isOpen);
    overlay.setAttribute("aria-hidden", String(!isOpen));
    open.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("rules-open", isOpen);
    if (isOpen) {
      previousFocus = document.activeElement;
      close.focus();
    } else {
      previousFocus?.focus();
    }
  };

  open.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  overlay.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) setOpen(false);
  });
}

function setupCrewFlip() {
  document.querySelectorAll(".crew-card").forEach((card) => {
    const toggle = () => card.classList.toggle("is-flipped");
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
  });
}

function setupDecryptTriggers() {
  document.querySelectorAll("[data-decrypt]").forEach((element) => {
    ScrollTrigger.create({
      trigger: element,
      start: "top 84%",
      once: true,
      onEnter: () => decryptText(element),
    });
  });
}

function setupTripwireTriggers() {
  document.querySelectorAll(".section-title, .hero__title").forEach((element) => {
    ScrollTrigger.create({
      trigger: element,
      start: "top 46%",
      end: "bottom 46%",
      onEnter: () => {
        element.classList.add("is-laser-breaking");
        flickerTripwire();
      },
      onEnterBack: () => {
        element.classList.add("is-laser-breaking");
        flickerTripwire();
      },
      onLeave: () => element.classList.remove("is-laser-breaking"),
      onLeaveBack: () => element.classList.remove("is-laser-breaking"),
    });
  });
}

function setupTransitions() {
  document.querySelectorAll(".operation-transition").forEach((transition) => {
    gsap.fromTo(
      transition.querySelectorAll("span"),
      { scaleX: 0 },
      {
        scaleX: 1,
        transformOrigin: (index) => (index ? "right center" : "left center"),
        stagger: 0.06,
        scrollTrigger: { trigger: transition, start: "top 82%", end: "bottom 40%", scrub: 0.5 },
      },
    );
    gsap.fromTo(
      transition.querySelector(".police-tape"),
      { xPercent: -24 },
      {
        xPercent: 24,
        ease: "none",
        scrollTrigger: { trigger: transition, start: "top bottom", end: "bottom top", scrub: 0.6 },
      },
    );
  });
  document.querySelectorAll(".shutter-trigger").forEach((shutter) => {
    gsap.to(shutter.querySelectorAll("span"), {
      xPercent: (index) => (index ? 105 : -105),
      ease: "power4.inOut",
      scrollTrigger: { trigger: shutter, start: "top 75%", end: "bottom 45%", scrub: true },
    });
  });
}

function setupLineDrawing() {
  document.querySelectorAll(".draw-line").forEach((path) => {
    if (path.id === "crew-route") return;
    if (path.closest(".projects")) {
      path.style.strokeDashoffset = "0";
      return;
    }
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: path.closest("section") || path.closest(".project-panel"),
        start: "top 82%",
        end: "bottom 30%",
        scrub: 0.7,
      },
    });
  });
}

function setupStamps() {
  document.querySelectorAll(".phase-stamp").forEach((stamp) => {
    const section = stamp.closest(".phase-section");
    gsap.fromTo(
      stamp,
      { scale: 2.25, rotation: -20, opacity: 0 },
      {
        scale: 1,
        rotation: -8,
        opacity: 0.9,
        duration: 0.36,
        ease: "back.out(2.4)",
        scrollTrigger: {
          trigger: section,
          start: "top 68%",
          once: true,
          onEnter: () => {
            screenShake(section);
            pulseAudio(122, 0.11, 0.028, "triangle");
          },
        },
      },
    );
  });
}

function setupVelocityEngine(lenis, marqueeTween) {
  const setSkew = gsap.quickTo(document.documentElement, "--velocity-skew", { duration: 0.22, ease: "power2.out" });
  const setOffset = gsap.quickTo(document.documentElement, "--chromatic-offset", { duration: 0.22, ease: "power2.out" });
  const setGrain = gsap.quickTo(".film-grain", "opacity", { duration: 0.2, ease: "power2.out" });

  lenis.on("scroll", (event) => {
    const velocity = event.velocity ?? lenis.velocity ?? 0;
    const intensity = gsap.utils.clamp(0, 1, Math.abs(velocity) / 30);
    const direction = velocity < 0 ? -1 : 1;
    setSkew(`${(intensity * direction * 2.2).toFixed(2)}deg`);
    setOffset(`${(intensity * direction * 3).toFixed(2)}px`);
    setGrain(0.11 + intensity * 0.16);
    marqueeTween.timeScale(direction * (0.55 + intensity * 2.25));
  });
}

function setupGlobalMotion() {
  const marqueeTween = gsap.to(".marquee__inner", {
    xPercent: -25,
    duration: 18,
    ease: "none",
    repeat: -1,
  });
  const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, syncTouch: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  setupVelocityEngine(lenis, marqueeTween);
  refreshHudMetrics();

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => updateHud(self.progress),
    onRefresh: refreshHudMetrics,
  });

  runTypewriter(document.querySelector(".hero__intro"), 30);
  setupDecryptTriggers();
  setupTripwireTriggers();
  setupTransitions();
  setupLineDrawing();
  setupStamps();
  setupWatchingMask(lenis);
  return lenis;
}

function setupHero(desktop = false) {
  const letters = document.querySelectorAll(".hero-letter");
  if (!desktop) {
    gsap.from(letters, {
      yPercent: 110,
      opacity: 0,
      stagger: 0.025,
      duration: 0.55,
      ease: "power4.out",
      scrollTrigger: { trigger: ".hero", start: "top 70%" },
    });
    return;
  }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "+=160%",
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
    },
  });
  timeline
    .to(".hero__intro", { y: -50, opacity: 0, duration: 0.16 }, 0)
    .to(letters, { yPercent: 150, rotation: (index) => (index % 2 ? 16 : -14), opacity: 0, stagger: { each: 0.018, from: "random" }, duration: 0.55 }, 0.14)
    .to(".hero__mask-wrap", { scale: 8.5, transformOrigin: "63% 37%", duration: 0.65 }, 0.2)
    .to(".hero__eye-portal", { scale: 60, opacity: 1, duration: 0.54, ease: "power2.in" }, 0.37)
    .to(".hero__blueprint, .hero__bottomline, .hero__role", { opacity: 0, duration: 0.18 }, 0.34);
}

function setupDossier(desktop = false) {
  const redactions = document.querySelectorAll(".redaction");
  const stamp = document.querySelector(".case-file__stamp");
  if (!desktop) {
    gsap.to(redactions, {
      xPercent: 110,
      stagger: 0.12,
      scrollTrigger: { trigger: ".case-file--front", start: "top 80%" },
    });
    ScrollTrigger.create({
      trigger: ".case-file--front",
      start: "top 74%",
      once: true,
      onEnter: () => {
        runTypewriter(document.querySelector(".typed-dossier"), 10);
        gsap.fromTo(stamp, { scale: 2.3, rotation: -22, opacity: 0 }, { scale: 1, rotation: -11, opacity: 0.88, duration: 0.38, ease: "back.out(2)" });
      },
    });
    return;
  }

  const stage = document.querySelector(".case-file-stack");
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".case-file-stack",
      start: "top 68%",
      once: true,
    },
  });
  timeline
    .fromTo(stamp, { scale: 2.3, rotation: -22, opacity: 0 }, {
      scale: 1,
      rotation: -11,
      opacity: 0.88,
      duration: 0.18,
      ease: "back.out(2)",
      onStart: () => screenShake(stage),
    }, 0.1)
    .to(redactions, { xPercent: 110, stagger: 0.06, duration: 0.26, ease: "power3.inOut" }, 0.16)
    .call(() => runTypewriter(document.querySelector(".typed-dossier"), 9), [], 0.2)
    .to(".case-file--front", { xPercent: 22, rotation: 5, duration: 0.48, ease: "power2.inOut" }, 0.54)
    .to(".case-file--middle", { xPercent: -14, rotation: -5, duration: 0.42, ease: "power2.inOut" }, 0.64);
}

function setupCrew(desktop = false) {
  const roster = document.querySelector(".crew-roster");
  const cards = gsap.utils.toArray(".crew-card");
  if (!desktop) {
    gsap.from(cards, {
      y: 52,
      opacity: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: { trigger: roster, start: "top 78%" },
    });
    return;
  }

  gsap.from(cards, {
    y: (index) => 80 + (index % 3) * 24,
    rotation: (index) => (index % 2 ? 4 : -4),
    opacity: 0,
    stagger: 0.07,
    duration: 0.7,
    ease: "power3.out",
    scrollTrigger: { trigger: roster, start: "top 72%", once: true },
  });
}

function setupProjects(desktop = false) {
  const pin = document.querySelector(".projects__pin");
  const track = document.querySelector(".projects__track");
  const panels = gsap.utils.toArray(".project-panel");
  const route = document.querySelector("#crew-route");
  const routeDot = document.querySelector("#crew-route-dot");
  const rooms = gsap.utils.toArray(".floor-room");

  if (!desktop) {
    gsap.from(panels, {
      y: 42,
      opacity: 0,
      stagger: 0.08,
      duration: 0.55,
      scrollTrigger: { trigger: pin, start: "top 75%" },
    });
    return;
  }

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const horizontal = gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: pin,
      start: "top top",
      end: () => `+=${distance() + window.innerHeight * 0.4}`,
      pin: true,
      scrub: 0.9,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  gsap.to(route, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
      trigger: pin,
      start: "top top",
      end: () => `+=${distance() + window.innerHeight * 0.4}`,
      scrub: true,
    },
  });
  gsap.to(routeDot, {
    motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5] },
    ease: "none",
    scrollTrigger: {
      trigger: pin,
      start: "top top",
      end: () => `+=${distance() + window.innerHeight * 0.4}`,
      scrub: true,
    },
  });

  panels.forEach((panel, index) => {
    gsap.fromTo(
      panel.querySelector(".project-panel__evidence"),
      { clipPath: "inset(100% 0 0 0)" },
      {
        clipPath: "inset(0% 0 0 0)",
        scrollTrigger: {
          trigger: panel,
          containerAnimation: horizontal,
          start: "left 72%",
          end: "left 26%",
          scrub: true,
        },
      },
    );
    gsap.to(rooms[index], {
      opacity: 1,
      duration: 0.1,
      scrollTrigger: {
        trigger: panel,
        containerAnimation: horizontal,
        start: "left 72%",
        toggleActions: "play none none reverse",
      },
    });
  });

  return () => horizontal.kill();
}

function setupVault(desktop = false) {
  const dial = document.querySelector(".vault__dial");
  const door = document.querySelector(".vault__door");
  const loot = document.querySelector(".vault__loot");
  const values = [...document.querySelectorAll(".vault__combination span")];
  const vaultCountdown = document.querySelector(".vault__loot-countdown");
  const transcript = document.querySelector(".vault__transcript p");
  const resultStamp = document.querySelector(".vault__result-stamp");
  const evidenceTags = gsap.utils.toArray(".evidence-tag");
  let clunked = false;

  const updateVaultReadout = (progress) => {
    values.forEach((value, index) => {
      const target = Number(value.dataset.combination);
      const visible = String(Math.min(target, Math.floor(progress * (target || 1)))).padStart(2, "0");
      value.textContent = visible;
    });
    vaultCountdown.textContent = formatDuration(86400 * (1 - progress));
  };

  if (!desktop) {
    ScrollTrigger.create({
      trigger: ".vault__machine",
      start: "top 80%",
      end: "bottom 30%",
      onUpdate: (self) => {
        gsap.set(dial, { rotation: self.progress * 540 });
        updateVaultReadout(self.progress);
      },
      onEnter: () => {
        gsap.to(loot, { opacity: 1, y: 0, duration: 0.45 });
        gsap.fromTo(resultStamp, { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.32, ease: "back.out(2)" });
        gsap.from(evidenceTags, { y: 24, opacity: 0, stagger: 0.1, duration: 0.4 });
        runTypewriter(transcript, 9);
      },
    });
    return;
  }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".vault__pin",
      start: "top top",
      end: "+=145%",
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      onUpdate: (self) => {
        updateVaultReadout(self.progress);
        if (self.progress > 0.74 && !clunked) {
          clunked = true;
          pulseAudio(76, 0.32, 0.06, "sine");
        }
      },
    },
  });
  timeline
    .to(dial, { rotation: 900, duration: 0.7, ease: "none" }, 0)
    .to(door, { rotateY: -104, duration: 0.35, ease: "power2.inOut" }, 0.66)
    .fromTo(loot, { opacity: 0, y: 38 }, { opacity: 1, y: 0, duration: 0.25 }, 0.76)
    .fromTo(resultStamp, { scale: 1.9, rotation: -16, opacity: 0 }, { scale: 1, rotation: -6, opacity: 1, duration: 0.18, ease: "back.out(2)" }, 0.81)
    .from(evidenceTags, { y: 32, opacity: 0, stagger: 0.08, duration: 0.18 }, 0.82)
    .call(() => runTypewriter(transcript, 9), [], 0.84);
}

function setupCorkboard() {
  const cards = gsap.utils.toArray(".cork-card");
  cards.forEach((card) => {
    const pin = card.querySelector(".cork-card__pin");
    gsap.from(card, {
      y: -120,
      rotation: gsap.utils.random(-4, 4),
      opacity: 0,
      duration: 0.55,
      ease: "bounce.out",
      scrollTrigger: { trigger: card, start: "top 80%" },
    });
    gsap.from(pin, {
      scale: 3,
      duration: 0.26,
      ease: "back.out(3)",
      scrollTrigger: { trigger: card, start: "top 80%" },
    });
  });
}

function rainNotes() {
  const notes = gsap.utils.toArray(".paper-note");
  gsap.fromTo(
    notes,
    { y: -window.innerHeight * 0.65, x: (index) => gsap.utils.random(-60, 60), rotation: (index) => gsap.utils.random(-35, 35), opacity: 0 },
    {
      y: (index) => gsap.utils.random(20, 330),
      x: (index) => gsap.utils.random(-130, 130),
      rotation: (index) => gsap.utils.random(-90, 90),
      opacity: 0.82,
      stagger: 0.035,
      duration: 1.2,
      ease: "power2.out",
      overwrite: true,
    },
  );
}

function setupContact(desktop = false) {
  const curtain = document.querySelector(".contact__mask-curtain");
  const contactContent = document.querySelectorAll(".contact__head, .contact__lower, .site-footer");
  const reveal = () => {
    const timeline = gsap.timeline();
    timeline
      .to(curtain, { xPercent: 145, duration: desktop ? 0.82 : 0.58, ease: "power4.inOut" })
      .fromTo(contactContent, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.28")
      .call(rainNotes);
  };

  gsap.set(contactContent, { opacity: 0, y: 35 });
  ScrollTrigger.create({
    trigger: ".contact",
    start: "top 62%",
    once: true,
    onEnter: () => {
      document.body.classList.add("alarm-state");
      window.setTimeout(() => document.body.classList.remove("alarm-state"), 520);
      pulseAudio(94, 0.28, 0.055, "sine");
      reveal();
    },
  });
}

function setupReducedMotion() {
  document.documentElement.classList.add("reduced-motion");
  document.querySelectorAll(".draw-line").forEach((path) => {
    path.style.strokeDashoffset = "0";
  });
  document.querySelectorAll("[data-type-text]").forEach((element) => {
    element.textContent = element.dataset.typeText;
  });
  document.querySelectorAll(".contact__head, .contact__lower, .site-footer").forEach((element) => {
    element.style.opacity = "1";
    element.style.transform = "none";
  });
  document.querySelector(".contact__mask-curtain").style.display = "none";
  document.querySelector(".vault__loot").style.opacity = "1";
  initializeClock();
  updateHud(Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)));
  window.addEventListener(
    "scroll",
    () => updateHud(Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight))),
    { passive: true },
  );
}

function setupMotion() {
  initializeClock();
  if (prefersReducedMotion.matches) {
    setupReducedMotion();
    return;
  }

  setupGlobalMotion();
  const media = gsap.matchMedia();
  media.add(desktopQuery, () => {
    setupHero(true);
    setupDossier(true);
    setupCrew(true);
    setupProjects(true);
    setupVault(true);
    setupCorkboard();
    setupContact(true);
  });
  media.add(mobileQuery, () => {
    setupHero(false);
    setupDossier(false);
    setupCrew(false);
    setupProjects(false);
    setupVault(false);
    setupCorkboard();
    setupContact(false);
  });
  ScrollTrigger.refresh();
}

function runLoader() {
  const loader = document.querySelector(".site-loader");
  const mark = document.querySelector(".loader-mark");
  const label = document.querySelector(".loader-label");
  const state = { value: 0 };
  mark.innerHTML = maskMark("loader-mask");
  const paths = [...mark.querySelectorAll("path")];
  paths.forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });

  const timeline = gsap.timeline({
    onComplete: () => loader.remove(),
  });
  timeline
    .to(paths, { strokeDashoffset: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }, 0)
    .to(state, {
      value: 100,
      duration: 1,
      ease: "none",
      onUpdate: () => {
        label.textContent = `${data.copy.loaderLabel} ${Math.round(state.value)}%`;
      },
    }, 0)
    .to(mark.querySelector(".mask-mark__face"), { fillOpacity: 1, duration: 0.18 }, 0.76)
    .to(loader, { opacity: 0, duration: 0.12 }, 1.08)
    .set(loader, { display: "none" });
}

function setupKonami() {
  const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  const phrase = "bellaciao";
  let input = [];
  let letters = "";
  const triggerPlanB = () => {
    document.body.classList.add("plan-b");
    window.setTimeout(() => document.body.classList.remove("plan-b"), 1200);
    input = [];
    letters = "";
  };

  window.addEventListener("keydown", (event) => {
    input = [...input, event.key].slice(-code.length);
    if (event.key.length === 1 && event.key !== " ") {
      letters = `${letters}${event.key.toLowerCase()}`.slice(-phrase.length);
    }
    if (input.join("|").toLowerCase() === code.join("|").toLowerCase()) {
      triggerPlanB();
    }
    if (letters === phrase) {
      triggerPlanB();
    }
  });
}

renderPage();
prepareSvgLines();
setupSound();
setupRulesMenu();
setupCrewFlip();
setupCursorAndMagnetism();
setupCctv();
setupClickRipples();
setupKonami();
setupMotion();
runLoader();

if ("fonts" in document) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
