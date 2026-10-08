// Tastatur, mus og enkel berøringsstyring (virtuell stikke + knapper).
export class Input {
  constructor(dom) {
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: innerWidth / 2, y: innerHeight / 2, down: false, rdown: false, moved: false };
    this.touchMove = { x: 0, y: 0, active: false };
    this.touchButtons = new Set();
    this.touchPressed = new Set();
    this.usingTouch = false;

    addEventListener('keydown', e => {
      if (!this.allowNav && ['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (this.allowNav && ['ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
      if (!this.keys.has(e.code)) this.pressed.add(e.code);
      this.keys.add(e.code);
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => {
      this.keys.clear();
      this.mouse.down = this.mouse.rdown = false;
    });
    dom.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.moved = true;
    });
    dom.addEventListener('mousedown', e => {
      this.usingTouch = false;
      if (e.button === 0) {
        this.mouse.down = true;
        this.pressed.add('Mouse0');
      }
      if (e.button === 2) {
        this.mouse.rdown = true;
        this.pressed.add('Mouse2');
      }
    });
    addEventListener('mouseup', e => {
      if (e.button === 0) this.mouse.down = false;
      if (e.button === 2) this.mouse.rdown = false;
    });
    dom.addEventListener('contextmenu', e => e.preventDefault());
    dom.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > 2) this.pressed.add('Wheel'); }, { passive: true });
  }

  down(code) {
    return this.keys.has(code) || this.touchButtons.has(code);
  }

  wasPressed(code) {
    return this.pressed.has(code) || this.touchPressed.has(code);
  }

  endFrame() {
    this.pressed.clear();
    this.touchPressed.clear();
  }

  // Berøring: venstre halvdel er bevegelsesstikke, knapper i høyre hjørne
  setupTouch(root) {
    const stick = root.querySelector('#stick');
    const knob = root.querySelector('#stick .knob');
    let stickId = null;
    let cx = 0, cy = 0;
    const R = 56;
    const start = e => {
      for (const t of e.changedTouches) {
        if (stickId === null && t.clientX < innerWidth * 0.5) {
          stickId = t.identifier;
          cx = t.clientX;
          cy = t.clientY;
          stick.style.left = cx - 70 + 'px';
          stick.style.top = cy - 70 + 'px';
          stick.classList.add('on');
          this.usingTouch = true;
        }
      }
    };
    const move = e => {
      for (const t of e.changedTouches) {
        if (t.identifier === stickId) {
          let dx = t.clientX - cx, dy = t.clientY - cy;
          const l = Math.hypot(dx, dy);
          if (l > R) { dx *= R / l; dy *= R / l; }
          knob.style.transform = `translate(${dx}px, ${dy}px)`;
          this.touchMove.x = dx / R;
          this.touchMove.y = dy / R;
          this.touchMove.active = true;
          e.preventDefault();
        }
      }
    };
    const end = e => {
      for (const t of e.changedTouches) {
        if (t.identifier === stickId) {
          stickId = null;
          this.touchMove.active = false;
          this.touchMove.x = this.touchMove.y = 0;
          knob.style.transform = '';
          stick.classList.remove('on');
        }
      }
    };
    const zone = root.querySelector('#touchzone');
    zone.addEventListener('touchstart', start, { passive: true });
    zone.addEventListener('touchmove', move, { passive: false });
    zone.addEventListener('touchend', end);
    zone.addEventListener('touchcancel', end);
    this.bindTouchButtons(root);
  }

  bindTouchButtons(root) {
    root.querySelectorAll('[data-tbtn]').forEach(b => {
      if (b.dataset.bound) return;
      b.dataset.bound = '1';
      const code = b.dataset.tbtn;
      b.addEventListener('touchstart', e => {
        e.preventDefault();
        this.usingTouch = true;
        this.touchButtons.add(code);
        this.touchPressed.add(code);
        b.classList.add('on');
      }, { passive: false });
      const up = () => { this.touchButtons.delete(code); b.classList.remove('on'); };
      b.addEventListener('touchend', up);
      b.addEventListener('touchcancel', up);
    });
  }
}
