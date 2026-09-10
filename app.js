const canvas = document.getElementById("flies");
const ctx = canvas.getContext("2d");
const mouse = { x: -9999, y: -9999 };
const flies = [];
let width = 0;
let height = 0;
let last = performance.now();
let running = true;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

class Fly {
  constructor() {
    this.reset(true);
  }

  reset(randomX) {
    this.x = randomX ? Math.random() * width : Math.random() < 0.5 ? -40 : width + 40;
    this.y = Math.random() * height;
    this.heading = Math.random() * Math.PI * 2;
    this.turn = 0;
    this.speed = 0.7 + Math.random() * 1.8;
    this.size = 10 + Math.random() * 22;
    this.flap = Math.random() * Math.PI * 2;
    this.flapSpeed = 0.4 + Math.random() * 0.5;
    this.alpha = 0.45 + Math.random() * 0.45;
    this.z = 0.55 + Math.random() * 0.7;
  }

  update(dt) {
    this.turn += (Math.random() - 0.5) * 0.35;
    this.turn *= 0.9;
    this.heading += this.turn * 0.08 * dt;

    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 140) {
      this.heading += Math.atan2(dy, dx) * 0.04 * dt;
      this.speed = Math.min(this.speed + 0.04, 3.2);
    } else {
      this.speed += (1.4 - this.speed) * 0.01;
    }

    this.x += Math.cos(this.heading) * this.speed * this.z * dt;
    this.y += Math.sin(this.heading) * this.speed * this.z * dt;
    this.y += Math.sin(this.flap * 0.35) * 0.15 * dt;
    this.flap += this.flapSpeed * dt;

    if (this.x < -60 || this.x > width + 60 || this.y < -60 || this.y > height + 60) {
      this.reset(false);
    }
  }

  draw() {
    const wing = Math.sin(this.flap) * 0.55;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.heading);
    ctx.scale(this.size / 16, this.size / 16);
    ctx.globalAlpha = this.alpha;

    ctx.fillStyle = "rgba(220, 232, 255, 0.42)";
    ctx.save();
    ctx.rotate(-0.55 + wing);
    ctx.scale(1, 0.28 + Math.abs(wing) * 0.25);
    ctx.beginPath();
    ctx.ellipse(-1, -9, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(0.55 - wing);
    ctx.scale(1, 0.28 + Math.abs(wing) * 0.25);
    ctx.beginPath();
    ctx.ellipse(-1, 9, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#e7e2d4";
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#cfc8b6";
    ctx.beginPath();
    ctx.ellipse(-4.5, 0, 4.2, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d24a32";
    ctx.beginPath();
    ctx.ellipse(5.6, -1.1, 2.6, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 200, 180, 0.55)";
    ctx.beginPath();
    ctx.ellipse(6.3, -1.6, 0.8, 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function spawn() {
  const count = window.matchMedia("(max-width: 760px)").matches ? 14 : 26;
  flies.length = 0;
  for (let i = 0; i < count; i += 1) flies.push(new Fly());
}

function loop(now) {
  if (!running) return;
  const dt = Math.min(32, now - last) / 16.67;
  last = now;
  ctx.clearRect(0, 0, width, height);
  for (const fly of flies) {
    fly.update(dt);
    fly.draw();
  }
  requestAnimationFrame(loop);
}

window.addEventListener("resize", () => {
  resize();
  spawn();
});

const glow = document.querySelector(".cursor-glow");
window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  glow.style.opacity = "1";
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

window.addEventListener("mouseleave", () => {
  mouse.x = -9999;
  mouse.y = -9999;
  glow.style.opacity = "0";
});

document.addEventListener("visibilitychange", () => {
  running = document.visibilityState === "visible";
  if (running) {
    last = performance.now();
    requestAnimationFrame(loop);
  }
});

const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

const toast = document.getElementById("toast");
document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.getAttribute("data-copy");
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("input");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1400);
  });
});

resize();
spawn();
requestAnimationFrame(loop);
