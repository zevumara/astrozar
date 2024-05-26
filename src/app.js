window.onload = function () {
  window.astrozar = new Application({
    debug: false,
    preload: [
      "the-answer.ogg",
      "alea-iacta-est.ogg",
      "reveal.ogg",
      "open.ogg",
      "close.ogg",
      "chosen.ogg",
      "holding.ogg",
      "shuffling.ogg",
      "slot-hover.ogg",
      "button.ogg",
      "input.ogg",
      "key.ogg",
      "ambience.mp3",
      "background.webp",
      "astrozar.webp",
      "bg-card.webp",
      "holo.webp",
      "sparkles.webp",
      "icosahedron.webp",
      "octahedron.webp",
      "dodecahedron.webp",
      "stars-landscape.webp",
      "stars-portrait.webp",
    ],
    customScreens: {
      welcomeScreen: WelcomeScreen,
      queryScreen: QueryScreen,
      shufflingScreen: ShufflingScreen,
      slotsScreen: SlotsScreen,
      respondingScreen: RespondingScreen,
      answerScreen: AnswerScreen,
    },
    onload: async () => {
      const screenEffectsEl = document.querySelector(".screen-effects");
      const loaderEl = screenEffectsEl.querySelector(".loader");
      loaderEl.classList.add("animation", "fade-out");
      setTimeout(() => {
        screenEffectsEl.classList.add("hide");
        loaderEl.classList.remove("animation", "fade-out");
        loaderEl.classList.add("hide");
      }, 500);
    },
  });
};

class Application {
  constructor(args = []) {
    const { debug, preload, onload, customScreens } = args;
    this._config();
    this.onload = onload;
    this.screens = new Screens();
    this.translation = new Translation();
    this.newSession();
    this.screens.initialization(this, customScreens);
    this._debug(debug);
    this._effects();
    this.files = [];
    this._preloadFiles(preload);
  }

  async _config() {
    // Disable scroll with space
    document.addEventListener("keydown", (ev) => {
      if (ev.keyCode === 32 && ev.target.tagName !== "TEXTAREA") {
        ev.preventDefault();
      }
    });
  }

  newSession() {
    const newSession = {
      deck: {
        octahedron: [],
        icosahedron: [],
        dodecahedron: [],
      },
      spread: {
        id: null,
        query: null,
        answer: null,
        octahedron: null,
        icosahedron: null,
        dodecahedron: null,
      },
    };
    this.session = JSON.parse(localStorage.getItem("session")) || newSession;
  }
  f;

  saveSession() {
    localStorage.setItem("session", JSON.stringify(this.session));
  }

  async _preloadFiles(files = []) {
    for (let i = 0; i < 9; i++) {
      files.push(`octahedron-${i}.webp`);
      files.push(`icosahedron-${i}.webp`);
      files.push(`dodecahedron-${i}.webp`);
    }
    await this.translation.load();
    const loaded = {};
    const loadFiles = files.map(async (file) => {
      const [, extension] = file.match(/\.(\w+)$/);
      if (extension === "webp") {
        if (this.debug) console.log(`Loading "img/${file}" ...`);
        const imageElement = new Image();
        await new Promise((resolve) => {
          imageElement.addEventListener("load", function () {
            loaded[file] = imageElement;
            resolve();
          });
          imageElement.src = `img/${file}`;
        });
      }
      if (extension === "ogg" || extension === "mp3") {
        if (this.debug) console.log(`Loading "audio/${file}" ...`);
        const audioElement = new Audio();
        await new Promise((resolve) => {
          audioElement.addEventListener("canplaythrough", function () {
            loaded[file] = audioElement;
            resolve();
          });
          audioElement.src = `audio/${file}`;
        });
      }
    });
    await Promise.all(loadFiles);
    this.files = loaded;
    if (this.debug) console.log("All files are loaded:", loaded);
    this.sound = new AudioManager(loaded);
    this._start();
  }

  async _start() {
    const url = new URL(window.location.href);
    const sharingId = url.searchParams.get("share");
    const spreadPending = JSON.parse(localStorage.getItem("session"));
    if (sharingId) {
      try {
        const response = await fetch(`/share/${sharingId}`);
        const result = await response.json();
        this.session.spread.id = sharingId;
        this.session.spread.query = result.query;
        this.session.spread.answer = result.answer;
        this.session.spread.octahedron = result.number.substr(0, 1);
        this.session.spread.icosahedron = result.number.substr(2, 1);
        this.session.spread.dodecahedron = result.number.substr(4, 1);
        this.screens.list.answerScreen.prepare();
        this.screens.goTo("answerScreen");
        if (this.debug) console.log("Spread:", this.session.spread);
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (spreadPending) {
      this.screens.list.slotsScreen.restoreSession();
      this.screens.goTo("slotsScreen");
    } else {
      this.screens.goTo("welcomeScreen");
    }
    this.onload();
  }

  _debug(active) {
    if (!active) return;
    this.debug = true;
    this.debugElement = document.querySelector("#debug");
    this.debugElement.classList.remove("hide");
    console.log("-- DEBUG MODE --");
  }

  _effects() {
    const animatedBackgroundElement = document.querySelector(".animated-background");
    if (window.innerWidth > 800) {
      animatedBackgroundElement.classList.remove("hide");
      if (this.debug) console.log("Effects are activated.");
    } else {
      animatedBackgroundElement.remove();
    }
  }

  delay(ms, callback = () => {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        callback();
        resolve();
      }, ms);
    });
  }

  screen() {
    return this.screens.currentScreen;
  }
}

class Screens {
  constructor() {
    this.scrollElement = document.querySelector(".screens");
    this.currentScreen = null;
    this.targetScreen = null;
    this.isTransitioning = false;
    this.list = {};
    this.scrollElement.addEventListener("scroll", this.scrollHandler.bind(this));
    window.addEventListener("resize", this.resizeHandler.bind(this));
  }

  initialization(app, screens = {}) {
    const screensElements = document.querySelectorAll("section.screen");
    screensElements.forEach((el) => {
      const screenClass = screens[el.id] || Screen;
      this.list[el.id] = new screenClass(app, el.id);
    });
  }

  goTo(screen) {
    return new Promise((resolve) => {
      if (this.isTransitioning || !this.list[screen] || !this.list[screen].el) return resolve();
      // First time
      if (!this.currentScreen) {
        this.currentScreen = this.list[screen];
        this.currentScreen.activate();
        this.scrollElement.scrollTop = this.currentScreen.el.offsetTop;
        return resolve();
      }
      // Moving to another screen
      this.currentScreen.deactivate();
      this.targetScreen = this.list[screen];
      this.isTransitioning = true;
      //this.scrollElement.scrollTop = this.targetScreen.el.offsetTop;
      this.targetScreen.el.scrollIntoView({ behavior: "smooth" });
      const checkStatus = () => {
        if (!this.isTransitioning) {
          return resolve();
        } else {
          requestAnimationFrame(checkStatus);
        }
      };
      checkStatus();
    });
  }

  scrollHandler() {
    if (!this.targetScreen?.el) return;
    let scrollTop = Math.ceil(this.scrollElement.scrollTop);
    if (scrollTop === this.targetScreen.el.offsetTop) {
      this.currentScreen = this.targetScreen;
      this.targetScreen = null;
      this.isTransitioning = false;
      this.currentScreen.activate();
    }
  }

  resizeHandler() {
    if (this.isTransitioning || !this.currentScreen?.el) return;
    if (this.scrollElement.scrollTop != this.currentScreen.el.offsetTop) {
      this.scrollElement.scrollTop = this.currentScreen.el.offsetTop;
    }
  }

  updateViewport() {
    this.scrollElement.style.height = window.innerHeight + "px";
    this.scrollElement.style.width = window.innerWidth + "px";
    for (screen in this.list) {
      this.list[screen].updateViewport();
    }
  }
}

class Screen {
  constructor(app, selector) {
    this._ = app;
    this.name = selector;
    this.el = document.getElementById(selector);
    this.handlers = {
      click: [],
      input: [],
      keydown: [],
    };
    this.boundHandler = this.handler.bind(this);
    this.tooltip = {};
    this.updateViewport();
  }

  activate() {
    this.events();
    this.addListeners();
    this.tooltips();
    this.ready();
  }

  deactivate() {
    this.removeListeners();
    this.removeEvents();
    this.removeTooltips();
  }

  events() {}

  tooltips() {}

  ready() {}

  removeTooltips() {
    for (const tooltip in this.tooltip) {
      this.tooltip[tooltip].hide({ remove: true });
    }
  }

  removeEvents() {}

  addEvent(type, selector, callback) {
    this.handlers[type].push({
      selector: selector,
      callback: callback,
    });
  }

  addListeners() {
    for (const eventType in this.handlers) {
      this.el.addEventListener(eventType, this.boundHandler);
    }
  }

  removeListeners() {
    for (const eventType in this.handlers) {
      this.el.removeEventListener(eventType, this.boundHandler);
    }
  }

  handler(event) {
    const handlers = this.handlers[event.type];
    if (!handlers) return;

    for (const handler of handlers) {
      if (event.target.matches(handler.selector)) {
        if (event.type !== "keydown") event.preventDefault();
        handler.callback.bind(this)(event.target, event);
      }
    }
  }

  playAnimation(selector, animation, duration) {
    return new Promise((resolve) => {
      const element = this.el.querySelector(selector);
      element.classList.add("animation", animation);
      if (duration) element.style.animationDuration = `${duration}ms`;
      function handleAnimationEnd(event) {
        event.stopPropagation();
        element.classList.remove("animation", animation);
        resolve("Animation ended");
      }
      element.addEventListener("animationend", handleAnimationEnd, { once: true });
    });
  }

  addTransition(element) {
    return new Promise((resolve) => {
      element.classList.add("transition");
      function handleAnimationEnd(event) {
        event.stopPropagation();
        element.classList.remove("transition");
        resolve("Animation ended");
      }
      element.addEventListener("transitionend", handleAnimationEnd, { once: true });
    });
  }

  async showFlashEffect() {
    this._.sound.play("button.ogg");
    const screenEffects = document.querySelector(".screen-effects");
    const flashEl = screenEffects.querySelector(".flash");
    screenEffects.classList.remove("hide");
    flashEl.classList.remove("hide");
    await this._.delay(250);
    screenEffects.classList.add("hide");
    flashEl.classList.add("hide");
  }

  showProgressBar(time) {
    return new Promise(async (resolve) => {
      this.progressBarActive = true;
      this.screenEffectsEl = document.querySelector(".screen-effects");
      this.progressBarEl = this.screenEffectsEl.querySelector(".progress-bar");
      this.barEl = this.progressBarEl.querySelector(".progress-bar .bar");
      this.screenEffectsEl.style.cursor = "grabbing";
      this.screenEffectsEl.classList.remove("hide");
      this.progressBarEl.classList.remove("hide");
      this.barEl.style.animation = `scale-x ${time}ms ease-in-out`;
      await this._.delay(time, () => {
        this.hideProgressBar();
        if (this.progressBarActive) resolve();
      });
    });
  }

  cancelProgressBar() {
    this.progressBarActive = false;
    this.hideProgressBar();
  }

  hideProgressBar() {
    if (!this.barEl) return;
    this.screenEffectsEl.style.cursor = "default";
    this.screenEffectsEl.classList.add("hide");
    this.progressBarEl.classList.add("hide");
    this.barEl.classList.remove("horizontal-scale");
  }

  async showModal() {
    const modalEl = document.querySelector(".modal");
    modalEl.classList.remove("hide");
  }

  hideModal() {
    const modalEl = document.querySelector(".modal");
    modalEl.classList.add("hide");
  }

  updateViewport() {
    this.el.style.height = window.innerHeight + "px";
    this.el.style.width = window.innerWidth + "px";
  }
}

class AudioManager {
  constructor(files) {
    this.files = files;
    this.context = null;
    this.playing = null;
  }

  play(file, overlay = true, volume = 1, loop = false) {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    const sfx = this.files[file];
    if (sfx) {
      if (!sfx.sourceNode) {
        sfx.sourceNode = this.context.createMediaElementSource(sfx);
        sfx.sourceNode.connect(this.context.destination);
      }
      if (overlay) {
        const audioInstance = new Audio(sfx.src);
        audioInstance.addEventListener("ended", function () {
          this.remove();
        });
        audioInstance.volume = volume;
        audioInstance.loop = loop;
        audioInstance.play();
        audioInstance.id = file.slice(0, -4);
        this.playing = audioInstance;
      } else {
        sfx.volume = volume;
        sfx.loop = loop;
        sfx.id = file.slice(0, -4);
        sfx.play();
        this.playing = sfx;
      }
    } else {
      console.error(`Sound "${file}" has not been preloaded.`);
    }
  }

  stop() {
    if (this.playing) {
      this.playing.pause();
      this.playing.currentTime = 0;
    }
  }
}

class Tooltip {
  constructor(target, args = []) {
    const { position, text, name, zIndex, duration } = args;
    this.name = name || null;
    this.inactive = localStorage.getItem(name) || false;
    this.removeElement = false;
    this.duration = duration || 0;
    this.position = position || "top";
    this.text = text || "Empty tooltip.";
    this.element = document.createElement("div");
    this.element.classList.add("tooltip", this.position);
    this.element.innerHTML = `<p>${this.text}</p>`;
    if (zIndex) this.element.style.zIndex = zIndex;
    target.appendChild(this.element);
  }

  show(delay = 0) {
    if (this.inactive || this.element.classList.contains("show")) return;
    setTimeout(() => {
      this.element.classList.add("show");
      if (this.name) localStorage.setItem(this.name, 1);
    }, delay);
    if (this.duration) {
      setTimeout(() => {
        this.hide();
      }, this.duration);
    }
  }

  hide(args = []) {
    if (this.inactive) return;
    const { delay, remove } = args;
    setTimeout(() => {
      this.element.classList.remove("show");
      if (remove) {
        setTimeout(() => {
          this.element.remove();
          this.inactive = true;
        }, 2000);
      }
    }, delay || 0);
  }
}

class Translation {
  constructor() {
    this.language = navigator.language.slice(0, 2) === "es" ? "es" : "en";
    this.texts = null;
    this.htmls = null;
    this.placeholders = null;
    this.cards = null;
  }
  async load() {
    const response = await fetch(`/lang/${this.language}.json`);
    const file = await response.json();
    this.texts = file.text;
    this.htmls = file.html;
    this.cards = file.cards;
    this.placeholders = file.placeholder;
    for (const text in this.texts) {
      const el = document.querySelector(`.__${text}`);
      if (el) {
        el.innerText = this.texts[text];
      }
    }
    for (const html in this.htmls) {
      const el = document.querySelector(`.__${html}`);
      if (el) {
        el.innerHTML = this.htmls[html];
      }
    }
    for (const placeholder in this.placeholders) {
      const el = document.querySelector(`.__${placeholder}`);
      if (el) {
        el.setAttribute("placeholder", this.placeholders[placeholder]);
      }
    }
    document.title = this.texts["title"];
  }
}

/**************************************************************************/
/* Screens                                                                */
/**************************************************************************/

class WelcomeScreen extends Screen {
  constructor(app, selector) {
    super(app, selector);
  }

  reset() {
    this.el.querySelector("button").classList.remove("disabled");
  }

  events() {
    this.addEvent("click", "._changeScreen", async function (el) {
      this._.sound.play("ambience.mp3", true, 0.1, true);
      this.el.querySelector("button").classList.add("disabled");
      await this.showFlashEffect();
      this._.screens.goTo(el.dataset.to);
    });
  }
}

class QueryScreen extends Screen {
  constructor(app, selector) {
    super(app, selector);
    this.MIN_CHAR = 20;
    this.MAX_CHAR = 76;
    this.queryEl = this.el.querySelector("._textareaQuery");
  }

  reset() {
    this.queryEl.value = "";
  }

  ready() {
    this.queryEl.focus();
  }

  async changeScreen() {
    const characters = this.queryEl.value.length;
    if (characters > this.MIN_CHAR && characters < this.MAX_CHAR) {
      this.queryEl.blur();
      if ("virtualKeyboard" in navigator) {
        navigator.virtualKeyboard.hide();
      }
      this.el.querySelector("button").classList.add("disabled");
      await this.showFlashEffect();
      this._.screens.goTo(this.el.querySelector("button").dataset.to);
    }
  }

  events() {
    this.addEvent("input", "._textareaQuery", function (el) {
      const characters = el.value.length;
      const btnEl = this.el.querySelector("button");
      this._.sound.play("key.ogg");
      if (characters > this.MIN_CHAR && characters <= this.MAX_CHAR) {
        btnEl.innerText = this._.translation.texts["concern_button"];
        this._.session.spread.query = el.value;
        if (btnEl.classList.contains("disabled")) {
          btnEl.classList.remove("disabled");
        }
      } else {
        if (characters < this.MIN_CHAR) {
          btnEl.innerText = this._.translation.texts["expand_question"];
        }
        this._.session.spread.query = null;
        if (!btnEl.classList.contains("disabled")) {
          btnEl.classList.add("disabled");
        }
      }
    });
    this.addEvent("keydown", "._textareaQuery", async function (el, ev) {
      if (ev.keyCode === 13) {
        ev.preventDefault();
        this.changeScreen();
      }
    });
    this.addEvent("click", "._changeScreen", function (el) {
      this.changeScreen();
    });
  }
}

class ShufflingScreen extends Screen {
  constructor(app, selector) {
    super(app, selector);
  }

  async ready() {
    this.generateDecks();
    await this._.delay(1800);
    this._.screens.goTo("slotsScreen");
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  generateDecks() {
    const numbers = Array.from({ length: 10 }, (_, i) => i);

    // Shuffling numbers
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    for (const deck in this._.session.deck) {
      const numbers = this.shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const positions = [
        { x: "24px", y: "0" },
        { x: "-21px", y: "0" },
        { x: "21px", y: "0" },
        { x: "-18px", y: "0" },
        { x: "18px", y: "0" },
        { x: "-15px", y: "0" },
        { x: "15px", y: "0" },
        { x: "-12px", y: "0" },
        { x: "12px", y: "0" },
        { x: "0", y: "0" },
      ];
      for (let i = 0; i < 10; i++) {
        const rotation = Math.floor(Math.random() * 8 - 4);
        const card = {
          number: numbers.pop(),
          rotation: rotation,
          x: positions[i].x,
          y: positions[i].y,
        };
        this._.session.deck[deck].push(card);
      }
    }
  }
}

class SlotsScreen extends Screen {
  constructor(app, selector) {
    super(app, selector);
    this.THRESHOLD = 160;
    this.isAnimating = false;
    this.isSelecting = false;
    this.dragDistance = 0;
    this.startX = 0;
    this.slotSelected = null;
    this.startDragBound = this.startDrag.bind(this);
    this.onMoveBound = this.onMove.bind(this);
    this.onEndBound = this.onEnd.bind(this);
  }

  tooltips() {
    this.tooltip["tap"] = new Tooltip(this.el.querySelector(".container"), {
      text: this._.translation.htmls["tooltip_tap"],
      name: "tooltip_tap",
    });
    this.tooltip["swipe"] = new Tooltip(this.el.querySelector(".modal"), {
      text: this._.translation.htmls["tooltip_swipe"],
      name: "tooltip_swipe",
    });
    this.tooltip["hold"] = new Tooltip(this.el.querySelector(".modal"), {
      text: this._.translation.htmls["tooltip_hold"],
      position: "bottom",
      zIndex: 4,
      name: "tooltip_hold",
    });
  }

  reset() {
    let slotEl = this.el.querySelector(".slot.octahedron");
    slotEl.classList.remove("lock", "subtle-levitation");
    slotEl.innerHTML = `
    <div class="type animation rotating"></div>
    <div class="order">1.</div>
    <div class="_openModal"></div>`;

    slotEl = this.el.querySelector(".slot.icosahedron");
    slotEl.classList.remove("lock", "subtle-levitation");
    slotEl.innerHTML = `
    <div class="type animation rotating"></div>
    <div class="order">2.</div>
    <div class="_openModal"></div>`;

    slotEl = this.el.querySelector(".slot.dodecahedron");
    slotEl.classList.remove("lock", "subtle-levitation");
    slotEl.innerHTML = `
    <div class="type animation rotating"></div>
    <div class="order">3.</div>
    <div class="_openModal"></div>`;
  }

  ready() {
    this.tooltip["tap"].show(500);
  }

  events() {
    this.addEvent("click", "._openModal", async function (el) {
      this._.sound.play("open.ogg");
      this.slotSelected = el.parentElement.dataset.slot;
      this.showModal();
      await this.playAnimation(".modal", "fade-in", 250);
    });

    this.addEvent("click", "._closeModal", async function (el) {
      this._.sound.play("close.ogg");
      await this.playAnimation(".modal", "fade-out", 300);
      this.hideModal();
    });

    const slotEls = this.el.querySelectorAll("._openModal");
    slotEls.forEach((slotEl) => {
      slotEl.addEventListener("mouseenter", () => {
        this._.sound.play("slot-hover.ogg");
      });
    });
  }

  removeEvents() {
    const slotEls = this.el.querySelectorAll("._openModal");
    slotEls.forEach((slotEl) => {
      slotEl.removeEventListener("mouseenter");
    });
  }

  restoreSession() {
    this.setSlot("octahedron", this._.session.spread.octahedron);
    this.setSlot("icosahedron", this._.session.spread.icosahedron);
    this.setSlot("dodecahedron", this._.session.spread.dodecahedron);
    this.aleaIactaEst();
  }

  async saveSlot(slot, cardNumber) {
    this._.session.spread[slot] = parseInt(cardNumber);
    if (
      typeof this._.session.spread.octahedron === "number" &&
      typeof this._.session.spread.icosahedron === "number" &&
      typeof this._.session.spread.dodecahedron === "number"
    ) {
      this._.saveSession();
      this.aleaIactaEst();
    }
  }

  async aleaIactaEst() {
    await this._.delay(250);
    await this.showFlashEffect();
    this.tooltip["tap"].hide({ remove: true });
    const slotsEls = this.el.querySelectorAll(".slot");
    slotsEls.forEach((slotEl) => {
      slotEl.style.transition = "all 0.5s ease-in-out";
      slotEl.classList.add("done");
    });
    await this._.delay(1500);
    this._.sound.play("alea-iacta-est.ogg");
    await this._.delay(5500);
    this._.screens.goTo("respondingScreen");
  }

  /*
  -------------
   Modal: Deck
  -------------
  */

  showModal() {
    this.renderDeck();
    document.addEventListener("mousedown", this.startDragBound);
    document.addEventListener("touchstart", this.startDragBound, { passive: true });
    super.showModal();
    this.tooltip["swipe"].show(500);
  }

  hideModal() {
    document.removeEventListener("mousedown", this.startDragBound);
    document.removeEventListener("touchstart", this.startDragBound);
    super.hideModal();
    this.clearDeck();
  }

  // Rendering

  renderDeck() {
    const container = this.el.querySelector("#deck .container");
    container.innerHTML = "";
    this._.session.deck[this.slotSelected].forEach((card, index) => {
      const cardEl = document.createElement("div");
      const innerEl = document.createElement("div");
      const typeEl = document.createElement("div");
      typeEl.innerHTML = `${this.slotSelected.replace("hedron", "")}<span>Λ</span>`;
      innerEl.classList.add("inner");
      typeEl.classList.add("type");
      cardEl.classList.add("card", "back", "animation", "transition", this.slotSelected);
      cardEl.setAttribute("id", "card_" + card.number);
      cardEl.setAttribute("data-index", index);
      cardEl.setAttribute("data-number", card.number);
      cardEl.style.zIndex = index;
      cardEl.style.transform = `rotate(${card.rotation}deg) translate(${card.x}, ${card.y})`;
      innerEl.appendChild(typeEl);
      cardEl.appendChild(innerEl);
      container.appendChild(cardEl);
    });
    const cardOnTop =
      this._.session.deck[this.slotSelected][this._.session.deck[this.slotSelected].length - 1]
        .number;
    this.selectedCardEl = this.el.querySelector("#card_" + cardOnTop);
    const nextCard =
      this._.session.deck[this.slotSelected][this._.session.deck[this.slotSelected].length - 2]
        .number;
    this.nextCardEl = this.el.querySelector("#card_" + nextCard);
    this.selectedCardEl.classList.remove("transition");
    this.selectedCardEl.classList.add("_selected", "animation", "scale-card");
    const closeButtonEl = document.createElement("button");
    closeButtonEl.classList.add("circular", "_closeModal");
    container.appendChild(closeButtonEl);
  }

  updateCards() {
    this._.sound.play("shuffling.ogg");
    const container = this.el.querySelector("#deck .container");
    for (let i = 0; i < this._.session.deck[this.slotSelected].length; i++) {
      const card = this._.session.deck[this.slotSelected][i];
      const cardEl = container.querySelector(`#card_${card.number}`);
      cardEl.style.zIndex = i;
      cardEl.dataset.index = i;
      cardEl.dataset.number = card.number;
      cardEl.style.transform = `rotate(${card.rotation}deg) translate(${card.x}, ${card.y})`;
    }
    const cardOnTop =
      this._.session.deck[this.slotSelected][this._.session.deck[this.slotSelected].length - 1]
        .number;
    this.selectedCardEl = this.el.querySelector("#card_" + cardOnTop);
    const nextCard =
      this._.session.deck[this.slotSelected][this._.session.deck[this.slotSelected].length - 2]
        .number;
    this.nextCardEl = this.el.querySelector("#card_" + nextCard);
    this.selectedCardEl.classList.add("_selected", "animation", "scale-card");
  }

  clearDeck() {
    const deckEl = this.el.querySelector("#deck");
    const selectedCardEl = this.el.querySelector("#selectedCard");
    const cardBackEl = this.el.querySelector("#selected_card_back");
    const cardFrontEl = this.el.querySelector("#selected_card_front");
    deckEl.classList.remove("collapse");
    selectedCardEl.classList.add("hide");
    cardFrontEl.classList.add("hide");
    cardBackEl.classList.remove("hide", "octahedron", "icosahedron", "dodecahedron");
  }

  createCard(number, deck) {
    const cardContent = `
      <div class="card front ${deck}" style="background-image: url(/img/${deck}-${number}.webp)">
        <div class="inner">
          <div class="number">
            <p>${number}</p>
            <div class="animation rotating"></div>
          </div>
          <div class="name">${this._.translation.cards[deck][number]}</div>
        </div>
      </div>
    `;
    return cardContent;
  }

  // Animations

  startSelection() {
    this.isSelecting = true;
    this.addTransition(this.selectedCardEl);
    this.selectedCardEl.style.marginTop = "-50px";
    this.startSelectionTimeout = setTimeout(async () => {
      if (this.isAnimating || !this.isSelecting) return;
      this.selectedCardEl.classList.add("horizontal-shaking");
      this._.sound.play("holding.ogg");
      await this.showProgressBar(1200);
      this.cardSelected();
    }, 1000);
  }

  stopSelection() {
    if (this._.sound.playing.id === "holding") this._.sound.stop();
    this.selectedCardEl.classList.remove("horizontal-shaking");
    clearTimeout(this.startSelectionTimeout);
    this.selectedCardEl.style.marginTop = "0";
    this.cancelProgressBar();
  }

  setSlot(slot, number) {
    const slotEl = this.el.querySelector(".slot." + slot);
    const card = this.createCard(number, slot);
    slotEl.classList.add("lock", "subtle-levitation");
    slotEl.innerHTML = card;
  }

  async cardSelected() {
    this.tooltip["swipe"].hide({ remove: true });
    this.tooltip["hold"].hide({ remove: true });
    const deckEl = this.el.querySelector("#deck");
    const selectedCardEl = this.el.querySelector("#selectedCard");
    const cardBackEl = selectedCardEl.querySelector("#selected_card_back");
    const cardFrontEl = selectedCardEl.querySelector("#selected_card_front");
    const cardBackTypeEl = cardBackEl.querySelector(".type");
    const cardNumber = this.selectedCardEl.dataset.number;
    const card = this.createCard(cardNumber, this.slotSelected);
    cardFrontEl.innerHTML = card;
    cardBackEl.classList.add(this.slotSelected);
    cardBackTypeEl.innerHTML = `${this.slotSelected.replace("hedron", "")}<span>Λ</span>`;
    deckEl.classList.add("collapse");
    selectedCardEl.classList.remove("hide");
    this._.sound.play("chosen.ogg");
    await this.playAnimation("#selected_card_back", "wobble", 1000);
    await this.playAnimation("#selected_card_back", "flip-out-y");
    cardBackEl.classList.add("hide");
    cardFrontEl.classList.remove("hide");
    this._.sound.play("reveal.ogg");
    await this.playAnimation("#selected_card_front", "flip-in-y", 1000);
    await this._.delay(500);
    await this.playAnimation("#selected_card_front", "zoom-out-up", 800);
    this.setSlot(this.slotSelected, cardNumber);
    this.saveSlot(this.slotSelected, cardNumber);
    this.hideModal();
  }

  // Mouse/touch events

  startDrag(event) {
    if (this.isAnimating) return;
    this.startX = event.pageX ?? event.touches[0].pageX;
    document.addEventListener("mousemove", this.onMoveBound);
    document.addEventListener("mouseup", this.onEndBound);
    document.addEventListener("touchmove", this.onMoveBound, { passive: true });
    document.addEventListener("touchend", this.onEndBound, { passive: true });
    this.startSelection();
  }

  onMove(event) {
    const currentX = event.pageX ?? event.touches[0].pageX;
    this.dragDistance = currentX - Math.floor(this.startX);
    if (this.dragDistance === 0) return;
    this.selectedCardEl.classList.remove("transition");
    this.isAnimating = true;
    const deg = this.dragDistance / 12;
    const minScale = 0.5;
    const maxScale = 1;
    const maxDragDistance = 300;
    const scaleRange = maxScale - minScale;
    let scale = maxScale - (Math.abs(this.dragDistance) / maxDragDistance) * scaleRange;
    scale = Math.max(minScale, scale);
    this.selectedCardEl.style.transform = `translateX(${this.dragDistance}px) rotate(${deg}deg) scale(${scale})`;
    this.selectedCardEl.style.cursor = "grabbing";
    const takingADecision = Math.abs(this.dragDistance) >= this.THRESHOLD;
    if (takingADecision) {
      this.selectedCardEl.style.zIndex = 0;
    } else {
      this.selectedCardEl.style.zIndex = 11;
    }
  }

  async onEnd() {
    this.stopSelection();
    document.removeEventListener("mousemove", this.onMoveBound);
    document.removeEventListener("mouseup", this.onEndBound);
    document.removeEventListener("touchmove", this.onMoveBound);
    document.removeEventListener("touchend", this.onEndBound);
    this.addTransition(this.selectedCardEl);
    const card = this._.session.deck[this.slotSelected][this.selectedCardEl.dataset.index];
    this.selectedCardEl.style.transform = `rotate(${card.rotation}deg) translate(${card.x}, ${card.y})`;
    const decisionMade = Math.abs(this.dragDistance) >= this.THRESHOLD;
    if (decisionMade) {
      this.selectedCardEl.classList.remove("_selected", "scale-card");
      const cardOnTop = this._.session.deck[this.slotSelected].pop();
      this._.session.deck[this.slotSelected].unshift(cardOnTop);
      this.updateCards();
      this.tooltip["swipe"].hide({ remove: true });
      this.tooltip["hold"].show(500);
    }
    this.selectedCardEl.style.transform = "none";
    this.selectedCardEl.style.cursor = "grab";
    this.isAnimating = false;
    this.isSelecting = false;
    this.dragDistance = 0;
  }
}

class RespondingScreen extends Screen {
  constructor(app, selector) {
    super(app, selector);
  }

  async getAnswer() {
    try {
      const response = await fetch("/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: this._.session.spread.query,
          o: this._.session.spread.octahedron,
          i: this._.session.spread.icosahedron,
          d: this._.session.spread.dodecahedron,
        }),
      });
      if (!response.ok) {
        console.log("Error:", `Request failed with status ${response.status}.`);
        return false;
      }
      const result = await response.json();
      if (result.error) {
        console.log("Error:", result.error);
        return false;
      }
      this._.session.spread.id = result.id;
      this._.session.spread.answer = result.answer;
      if (this._.debug) {
        console.log("ID:", result.id);
      }
      return true;
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async ready() {
    const start = performance.now();
    const delay = 4500;
    let asnwerReceived = false;
    let tryNumber = 0;
    while (!asnwerReceived && tryNumber < 10) {
      tryNumber++;
      if (this._.debug) console.log("Try number:", tryNumber);
      asnwerReceived = await this.getAnswer();
      await this._.delay(500);
    }
    const end = performance.now();
    await this._.delay(Math.max(delay - (end - start), 0));
    if (this._.session.spread.id && this._.session.spread.answer) {
      this._.screens.list.answerScreen.prepare();
      this._.sound.play("the-answer.ogg");
      await this._.delay(250);
      this._.screens.goTo("answerScreen");
    }
  }
}

class AnswerScreen extends Screen {
  constructor(app, selector) {
    super(app, selector);
  }

  tooltips() {
    this.tooltip["shared"] = new Tooltip(this.el.querySelector(".container"), {
      text: this._.translation.texts["tooltip_shared"],
      position: "bottom",
      duration: 4000,
    });
  }

  ready() {
    localStorage.removeItem("session");
  }

  prepare() {
    const queryEl = this.el.querySelector("h2");
    const answerEl = this.el.querySelector("h1 span");
    const numberEl = this.el.querySelector(".number h3");
    queryEl.innerText = this._.session.spread.query;
    answerEl.innerText = this._.session.spread.answer;
    numberEl.innerText = `${this._.session.spread.octahedron} ${this._.session.spread.icosahedron} ${this._.session.spread.dodecahedron}`;
  }

  events() {
    this.addEvent("click", "._share", async function (el) {
      const urlShare = `https://astroz.ar/?share=${this._.session.spread.id}`;
      if (navigator.share) {
        navigator
          .share({
            title: this._.translation.texts["sharing_look"],
            text:
              this._.translation.texts["sharing_question"] +
              this._.session.spread.query +
              "\n\n" +
              this._.translation.texts["sharing_look"],
            url: urlShare,
          })
          .then(() => {
            if (this._.debug) console.log("Enlace compartido.");
          });
      } else {
        navigator.clipboard.writeText(urlShare);
        this.tooltip["shared"].show();
      }
    });
    this.addEvent("click", "._retry", async function (el) {
      this._.newSession();
      this._.screens.list.welcomeScreen.reset();
      this._.screens.list.queryScreen.reset();
      this._.screens.list.slotsScreen.reset();
      this._.screens.goTo("welcomeScreen");
    });
  }
}

window.onresize = function () {
  window.astrozar.screens.updateViewport();
};
