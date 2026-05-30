/**
 * 1. CUSTOM CURSOR LOGIC
 */
const dot = document.getElementById("cur-dot");
const ring = document.getElementById("cur-ring");
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + "px";
    dot.style.top = my + "px";
});

// Smooth ring follow effect
(function follow() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(follow);
})();

// Cursor interaction on hover
document.querySelectorAll("a, button, .si, .ptag, .fp").forEach(el => {
    el.addEventListener("mouseenter", () => {
        ring.classList.add("big");
        dot.style.transform = "translate(-50%,-50%) scale(2)";
    });
    el.addEventListener("mouseleave", () => {
        ring.classList.remove("big");
        dot.style.transform = "translate(-50%,-50%) scale(1)";
    });
});

/**
 * 2. STARFIELD BACKGROUND ANIMATION
 */
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
let W, H;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const stars = [];
for (let i = 0; i < 260; i++) {
    stars.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        r: Math.random() * 1.6 + 0.2,
        o: Math.random(),
        speed: Math.random() * 0.35 + 0.05,
        t: Math.random() * Math.PI * 2,
        col: Math.random() > 0.88 ? (Math.random() > 0.5 ? "0,212,255" : "168,85,247") : "255,255,255"
    });
}

const shooters = [];
function createShooter() {
    return {
        x: Math.random() * W,
        y: Math.random() * H * 0.4,
        vx: (Math.random() - 0.4) * 8,
        vy: Math.random() * 5 + 3,
        life: 0
    };
}

(function anim() {
    ctx.clearRect(0, 0, W, H);
    
    // Draw Stars
    stars.forEach(s => {
        s.t += 0.018;
        const op = s.o * (0.4 + 0.6 * Math.sin(s.t));
        ctx.globalAlpha = op;
        ctx.fillStyle = "rgb(" + s.col + ")";
        ctx.beginPath();
        ctx.arc(s.x % W, s.y % H, s.r, 0, Math.PI * 2);
        ctx.fill();
        
        // Twinkle cross for larger stars
        if (s.r > 1.0) {
            ctx.globalAlpha = op * 0.3;
            ctx.strokeStyle = "rgb(" + s.col + ")";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(s.x % W - s.r * 3, s.y % H);
            ctx.lineTo(s.x % W + s.r * 3, s.y % H);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(s.x % W, s.y % H - s.r * 3);
            ctx.lineTo(s.x % W, s.y % H + s.r * 3);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
        s.y += s.speed;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    });

    // Shooting Stars
    if (Math.random() < 0.006) shooters.push(createShooter());
    for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.life++;
        const op = Math.max(0, 1 - s.life / 70);
        if (op <= 0) { shooters.splice(i, 1); continue; }
        
        const grad = ctx.createLinearGradient(s.x - s.vx * 12, s.y - s.vy * 12, s.x, s.y);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, "rgba(0,212,255," + op + ")");
        
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 12, s.y - s.vy * 12);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = op;
        ctx.stroke();
        ctx.globalAlpha = 1;
        s.x += s.vx;
        s.y += s.vy;
    }
    requestAnimationFrame(anim);
})();

/**
 * 3. NAME TYPING EFFECT
 */
const nameEl = document.getElementById("hero-name");
"NASEEM".split("").forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "char" + (i === 0 ? " ac" : "");
    span.textContent = ch;
    span.style.animationDelay = (0.5 + i * 0.09) + "s";
    nameEl.appendChild(span);
});

// Blinking cursor after name
const blink = document.createElement("span");
blink.className = "blink-cur";
blink.style.animation = "blink 1.1s step-end infinite";
blink.style.opacity = "0";
setTimeout(() => { 
    blink.style.opacity = "1"; 
    blink.style.transition = "opacity 0.3s"; 
}, 1200);
nameEl.appendChild(blink);

/**
 * 4. SYSTEM CLOCK & NAV SCROLL
 */
function tick() {
    const n = new Date();
    const pad = v => String(v).padStart(2, "0");
    const t = pad(n.getHours()) + ":" + pad(n.getMinutes()) + ":" + pad(n.getSeconds());
    document.getElementById("clock").textContent = t;
    document.getElementById("ftime").textContent = "SYS:" + t;
}
tick();
setInterval(tick, 1000);

window.addEventListener("scroll", () => {
    document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 60);
});

/**
 * 5. REVEAL ON SCROLL (Intersection Observer)
 */
const reveals = document.querySelectorAll(".reveal");
document.querySelectorAll("section, footer").forEach(sec => {
    sec.querySelectorAll(".reveal").forEach((el, i) => {
        el.dataset.d = i * 90; // Stagger delay
    });
});

const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), +e.target.dataset.d || 0);
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.08, rootMargin: "0px 0px -20px 0px" });

reveals.forEach(el => observer.observe(el));

// Parallax glow effect on mouse move
document.addEventListener("mousemove", e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 25;
    const y = (e.clientY / window.innerHeight - 0.5) * 18;
    document.querySelectorAll(".hero-bg-glow").forEach(g => {
        g.style.transform = `translate(${x}px, ${y}px)`;
    });
    document.querySelectorAll(".hero-bg-glow2").forEach(g => {
        g.style.transform = `translate(${-x * 0.5}px, ${-y * 0.5}px)`;
    });
});