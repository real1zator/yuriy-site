/* ══════════════════════════════════════════════════════════════
   НАСТРОЙКИ TELEGRAM
   Замените значения на реальные перед публикацией сайта.
   Получить токен: @BotFather в Telegram → /newbot
   Получить chat_id: написать боту, затем открыть
   https://api.telegram.org/bot<ТОКЕН>/getUpdates
   ══════════════════════════════════════════════════════════════ */
var TELEGRAM_BOT_TOKEN = "ВСТАВЬТЕ_ТОКЕН_БОТА";
var TELEGRAM_CHAT_ID   = "ВСТАВЬТЕ_CHAT_ID";

function sendToTelegram(data) {
    var lines = [
        "\u{1F4E9} <b>Новая заявка с сайта!</b>",
        "",
        "<b>Сайт:</b> " + (data.get("site") || document.title),
        "<b>Имя:</b> " + (data.get("name") || "—"),
        "<b>Телефон:</b> " + (data.get("phone") || "—"),
    ];
    var type = data.get("type");
    if (type) lines.push("<b>Услуга:</b> " + type);
    var msg = data.get("message");
    if (msg) lines.push("<b>Комментарий:</b> " + msg);
    lines.push("");
    lines.push("<i>" + new Date().toLocaleString("ru-RU") + "</i>");
    return fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: lines.join("\n"), parse_mode: "HTML" })
    }).then(function(r) { return r.json(); })
      .then(function(j) { if (!j.ok) throw new Error(j.description); return j; });
}

/* ═══ FORM SUBMIT WITH TOAST ═══ */
function showToast(msg) {
    var t = document.createElement("div");
    t.className = "form-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function() { t.classList.add("show"); });
    setTimeout(function() { t.classList.remove("show"); setTimeout(function() { t.remove(); }, 400); }, 3500);
}

function bindForm(id, msg) {
    var f = document.getElementById(id); if (!f) return;
    f.addEventListener("submit", function(e) {
        e.preventDefault();
        var btn = f.querySelector('button[type="submit"]');
        var origText = btn.textContent;
        btn.textContent = "Отправка…"; btn.disabled = true;
        var fd = new FormData(f);
        fd.append("site", document.title || "Landing");
        if (TELEGRAM_BOT_TOKEN === "ВСТАВЬТЕ_ТОКЕН_БОТА") {
            showToast("✅ " + msg);
            f.reset();
            btn.textContent = origText; btn.disabled = false;
            return;
        }
        sendToTelegram(fd)
            .then(function() { showToast("✅ " + msg); f.reset(); })
            .catch(function() { showToast("Ошибка отправки"); })
            .finally(function() { btn.textContent = origText; btn.disabled = false; });
    });
}
bindForm("callbackForm", "Заявка отправлена — мы свяжемся с вами в ближайшее время!");

/* ═══ PHONE MASK ═══ */
document.querySelectorAll('input[name="phone"]').forEach(function(inp) {
    inp.addEventListener("input", function(e) {
        var v = e.target.value.replace(/\D/g, "");
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 0 && v[0] !== "7") v = "7" + v.slice(v[0] === "8" ? 1 : 0);
        var o = "";
        if (v.length > 0) o = "+7";
        if (v.length > 1) o += " (" + v.slice(1, 4);
        if (v.length > 4) o += ") " + v.slice(4, 7);
        if (v.length > 7) o += "-" + v.slice(7, 9);
        if (v.length > 9) o += "-" + v.slice(9, 11);
        e.target.value = o;
    });
});

/* ═══ SMOOTH SCROLL ═══ */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener("click", function(e) {
        var id = this.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        var t = document.querySelector(id);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
});

/* ═══ SCROLL REVEAL (multiple animation types) ═══ */
(function() {
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(en) {
            if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); }
        });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    // Classic reveal-up
    document.querySelectorAll(
        ".card, .gallery .item, .testimonial, .adv, .step, .callback-form, .contact-info, details, .cta-inner"
    ).forEach(function(el, i) {
        el.classList.add("reveal");
        el.style.transitionDelay = (i % 8) * 0.07 + "s";
        obs.observe(el);
    });

    // Sections get reveal
    document.querySelectorAll(".section").forEach(function(el) {
        el.classList.add("reveal");
        obs.observe(el);
    });

    // About image slides from left
    document.querySelectorAll(".about-img-wrap").forEach(function(el) {
        el.classList.add("reveal-left");
        obs.observe(el);
    });

    // About text from right
    document.querySelectorAll(".about-text").forEach(function(el) {
        el.classList.add("reveal-right");
        obs.observe(el);
    });
})();

/* ═══ NUMBER COUNTER ANIMATION ═══ */
(function() {
    var counted = false;
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(en) {
            if (en.isIntersecting && !counted) {
                counted = true;
                animateNumbers();
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.3 });

    var statsEl = document.querySelector(".hero-stats") || document.querySelector(".about-numbers");
    if (statsEl) obs.observe(statsEl);

    function animateNumbers() {
        document.querySelectorAll(".stat-num, .an-val").forEach(function(el) {
            var text = el.textContent.trim();
            var match = text.match(/^([\d,.]+)(\+?)$/);
            if (!match) return;
            var target = parseFloat(match[1].replace(",", "."));
            var suffix = match[2] || "";
            var isFloat = text.includes(",") || text.includes(".");
            var duration = 1800;
            var start = performance.now();
            el.textContent = "0" + suffix;

            function tick(now) {
                var p = Math.min((now - start) / duration, 1);
                var ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
                var current = target * ease;
                if (isFloat) {
                    el.textContent = current.toFixed(1).replace(".", ",") + suffix;
                } else {
                    el.textContent = Math.floor(current) + suffix;
                }
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = text; // restore original
            }
            requestAnimationFrame(tick);
        });
    }
})();

/* ═══ HEADER SCROLL EFFECT ═══ */
(function() {
    var header = document.querySelector(".header");
    if (!header) return;
    var last = 0;
    window.addEventListener("scroll", function() {
        var y = window.scrollY;
        header.classList.toggle("scrolled", y > 50);
        last = y;
    }, { passive: true });
})();

/* ═══ ACTIVE NAV HIGHLIGHT ═══ */
(function() {
    var sections = document.querySelectorAll("section[id]");
    var navLinks = document.querySelectorAll(".header-nav a");
    if (!sections.length || !navLinks.length) return;

    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(en) {
            if (en.isIntersecting) {
                navLinks.forEach(function(a) {
                    a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
                });
            }
        });
    }, { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" });

    sections.forEach(function(s) { obs.observe(s); });
})();

/* ═══ LIGHTBOX GALLERY ═══ */
(function() {
    var images = [];
    var currentIdx = 0;

    // Create lightbox
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<button class="lb-close">&times;</button><button class="lb-nav lb-prev">&#8249;</button><img src="" alt=""><button class="lb-nav lb-next">&#8250;</button><div class="lb-caption"></div>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lb-caption");

    document.querySelectorAll(".gallery .item").forEach(function(item, i) {
        var img = item.querySelector("img");
        var cap = item.querySelector("span");
        if (img) {
            images.push({ src: img.src.replace("w=800", "w=1400"), caption: cap ? cap.textContent : "" });
            // Add zoom icon
            var zi = document.createElement("div");
            zi.className = "zoom-icon";
            zi.innerHTML = "&#x1F50D;";
            item.appendChild(zi);

            item.addEventListener("click", function() {
                currentIdx = i;
                showLightbox();
            });
        }
    });

    function showLightbox() {
        if (!images[currentIdx]) return;
        lbImg.src = images[currentIdx].src;
        lbCap.textContent = images[currentIdx].caption;
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lb.classList.remove("open");
        document.body.style.overflow = "";
    }

    lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
    lb.addEventListener("click", function(e) { if (e.target === lb) closeLightbox(); });
    lb.querySelector(".lb-prev").addEventListener("click", function(e) {
        e.stopPropagation();
        currentIdx = (currentIdx - 1 + images.length) % images.length;
        showLightbox();
    });
    lb.querySelector(".lb-next").addEventListener("click", function(e) {
        e.stopPropagation();
        currentIdx = (currentIdx + 1) % images.length;
        showLightbox();
    });

    document.addEventListener("keydown", function(e) {
        if (!lb.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") { currentIdx = (currentIdx - 1 + images.length) % images.length; showLightbox(); }
        if (e.key === "ArrowRight") { currentIdx = (currentIdx + 1) % images.length; showLightbox(); }
    });
})();

/* ═══ PARTICLE BACKGROUND ═══ */
(function() {
    var canvas = document.getElementById("particles");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var particles = [];
    var accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#c9a96e";

    function hexToRgb(hex) {
        hex = hex.replace("#", "");
        return { r: parseInt(hex.substring(0,2),16), g: parseInt(hex.substring(2,4),16), b: parseInt(hex.substring(4,6),16) };
    }
    var rgb = hexToRgb(accentColor);

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (var i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 2 + 0.5,
            a: Math.random() * 0.3 + 0.05
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function(p) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + p.a + ")";
            ctx.fill();
        });

        // Draw connections
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + (0.06 * (1 - dist / 150)) + ")";
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

/* ═══ CURSOR GLOW (desktop) ═══ */
(function() {
    if (window.innerWidth < 700) return;
    var glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    var mx = 0, my = 0, gx = 0, gy = 0;
    document.addEventListener("mousemove", function(e) { mx = e.clientX; my = e.clientY; });
    function tick() {
        gx += (mx - gx) * 0.08;
        gy += (my - gy) * 0.08;
        glow.style.left = gx + "px";
        glow.style.top = gy + "px";
        requestAnimationFrame(tick);
    }
    tick();
})();

/* ═══ SCROLL PROGRESS BAR ═══ */
(function() {
    var bar = document.createElement("div");
    bar.className = "progress-bar";
    document.body.appendChild(bar);
    window.addEventListener("scroll", function() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var pct = h > 0 ? (window.scrollY / h * 100) : 0;
        bar.style.width = pct + "%";
    }, { passive: true });
})();

/* ═══ SCROLL-TO-TOP BUTTON ═══ */
(function() {
    var btn = document.querySelector(".scroll-top");
    if (!btn) return;
    window.addEventListener("scroll", function() {
        btn.classList.toggle("vis", window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener("click", function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
})();

/* ═══ TILT EFFECT ON CARDS (desktop) ═══ */
(function() {
    if (window.innerWidth < 1024) return;
    document.querySelectorAll(".card, .adv, .testimonial").forEach(function(el) {
        el.addEventListener("mousemove", function(e) {
            var rect = el.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.transform = "perspective(800px) rotateY(" + (x * 6) + "deg) rotateX(" + (-y * 6) + "deg) translateY(-4px)";
        });
        el.addEventListener("mouseleave", function() {
            el.style.transform = "";
        });
    });
})();

/* ═══ TYPING EFFECT ON HERO SUBTITLE ═══ */
(function() {
    var sub = document.querySelector(".hero .sub");
    if (!sub || window.innerWidth < 700) return;
    var text = sub.textContent;
    sub.textContent = "";
    sub.style.minHeight = "3em";
    var i = 0;
    function typeChar() {
        if (i < text.length) {
            sub.textContent += text[i];
            i++;
            setTimeout(typeChar, 18 + Math.random() * 12);
        }
    }
    setTimeout(typeChar, 800);
})();
