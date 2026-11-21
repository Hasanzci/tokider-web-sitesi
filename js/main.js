/* TOKİDER – site davranışları. İçerik js/veri.js'den gelir (guncelle.py üretir). */
(function () {
  const V = window.SITE_VERI || { haberler: [], albumler: [], ortaklar: [], ayetler: [] };
  const $ = (s, k = document) => k.querySelector(s);
  const $$ = (s, k = document) => Array.from(k.querySelectorAll(s));
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const u = s => encodeURI(s);
  const kacis = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const H = V.haberler || [];
  const A = V.albumler || [];
  const AYETLER = V.ayetler || [];

  /* ---- Bildirim (Toast) & Kopyalama Yardımcısı ---- */
  const bildirimEl = $("#bildirim");
  let bildirimZaman;
  function bildirimGoster(mesaj) {
    if (!bildirimEl) return;
    bildirimEl.textContent = mesaj;
    bildirimEl.classList.add("goster");
    clearTimeout(bildirimZaman);
    bildirimZaman = setTimeout(() => bildirimEl.classList.remove("goster"), 2400);
  }
  async function panoyaKopyala(metin, mesaj = "Panoya kopyalandı ✓") {
    try {
      await navigator.clipboard.writeText(metin);
    } catch (_) {
      const t = el("textarea");
      t.value = metin;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    bildirimGoster(mesaj);
  }

  /* ---- Tarih, Menü, Okuma Çubuğu & Yukarı Çık ---- */
  $("#bugun").textContent = new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("#yil").textContent = new Date().getFullYear();

  const nav = $("#nav"), menu = $("#menu"), ham = $("#hamburger"), perde = $("#menuPerde");
  const okumaCubugu = $("#okumaCubugu"), yukariBtn = $("#yukariCik");
  const menuLinkler = $$("a:not(.btn)", menu);
  const bolumler = menuLinkler.map(a => $(a.getAttribute("href"))).filter(Boolean);

  function menuKapat() {
    menu.classList.remove("acik");
    ham.classList.remove("acik");
    ham.setAttribute("aria-expanded", "false");
    if (perde) perde.classList.remove("acik");
  }
  ham.onclick = () => {
    const acik = menu.classList.toggle("acik");
    ham.classList.toggle("acik", acik);
    ham.setAttribute("aria-expanded", String(acik));
    if (perde) perde.classList.toggle("acik", acik);
  };
  if (perde) perde.onclick = menuKapat;
  $$("a", menu).forEach(a => a.addEventListener("click", menuKapat));

  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("dolu", y > 60);
    if (yukariBtn) yukariBtn.classList.toggle("goster", y > 450);
    if (okumaCubugu) {
      const maks = document.documentElement.scrollHeight - innerHeight;
      okumaCubugu.style.width = maks > 0 ? Math.min(100, (y / maks) * 100) + "%" : "0%";
    }
    // Scroll-spy aktif menü
    let aktifId = "manset";
    for (const b of bolumler) {
      if (b.offsetTop - 160 <= y) aktifId = b.id;
    }
    menuLinkler.forEach(a => a.classList.toggle("aktif-link", a.getAttribute("href") === "#" + aktifId));
  }, { passive: true });

  if (yukariBtn) yukariBtn.onclick = () => scrollTo({ top: 0, behavior: "smooth" });

  /* ---- Üst Şerit: Yavaş Kayan Diyanet Ayet-i Kerimeleri ---- */
  const kayanYazi = $("#kayanYazi");
  const kayanHavuz = AYETLER.length
    ? AYETLER.map(x => ({ arapca: x.arapca, soz: x.meal, kaynak: x.kaynak }))
    : [...H, ...A].filter(x => x.soz).map(x => ({ arapca: x.arapca || "", soz: x.soz, kaynak: x.kaynak }));

  if (kayanYazi && kayanHavuz.length) {
    kayanYazi.innerHTML = kayanHavuz.map(s =>
      `<span>${s.arapca ? `<q class="k-ar" dir="rtl" lang="ar">${kacis(s.arapca)}</q>` : ""}“${kacis(s.soz)}”<em>${kacis(s.kaynak)} · Diyanet Meali</em></span>`
    ).join("");

    // Metin genişliğine göre çok yavaş ve rahat okunur bir kayma süresi hesapla (~26 piksel / saniye)
    let yavasMod = true;
    const hizAyarla = () => {
      const genislik = Math.max(kayanYazi.scrollWidth, 12000);
      const pxPerSec = yavasMod ? 25 : 42;
      const sure = Math.max(450, Math.round(genislik / pxPerSec));
      kayanYazi.style.animationDuration = sure + "s";
    };
    requestAnimationFrame(hizAyarla);
    addEventListener("resize", hizAyarla);

    const durdurBtn = $("#kayanDurdur");
    const hizBtn = $("#kayanHiz");
    if (durdurBtn) {
      durdurBtn.onclick = () => {
        const durdu = kayanYazi.classList.toggle("durdu");
        durdurBtn.textContent = durdu ? "▶" : "⏸";
        bildirimGoster(durdu ? "Ayet şeridi duraklatıldı" : "Ayet şeridi devam ediyor");
      };
    }
    if (hizBtn) {
      hizBtn.onclick = () => {
        yavasMod = !yavasMod;
        hizBtn.textContent = yavasMod ? "Yavaş" : "Normal";
        hizAyarla();
        bildirimGoster(yavasMod ? "Kayma hızı: Yavaş ve dingin" : "Kayma hızı: Normal");
      };
    }
  }

  /* ---- Günün Ayet-i Kerimesi (Etkileşimli Kart) ---- */
  if (kayanHavuz.length) {
    const gun = Math.floor(Date.now() / 864e5);
    let gaIndex = gun % kayanHavuz.length;
    const gaAr = $("#gununAyetiArapca"), gaMetin = $("#gununAyeti"), gaKaynak = $("#gununAyetiKaynak");

    function gununAyetiCiz(idx) {
      gaIndex = (idx + kayanHavuz.length) % kayanHavuz.length;
      const s = kayanHavuz[gaIndex];
      if (gaAr) {
        gaAr.textContent = s.arapca || "";
        gaAr.style.display = s.arapca ? "" : "none";
      }
      gaMetin.textContent = `“${s.soz}”`;
      gaKaynak.textContent = s.kaynak;
    }
    gununAyetiCiz(gaIndex);

    if ($("#gaOnceki")) $("#gaOnceki").onclick = () => gununAyetiCiz(gaIndex - 1);
    if ($("#gaSonraki")) $("#gaSonraki").onclick = () => gununAyetiCiz(gaIndex + 1);
    if ($("#gaRastgele")) $("#gaRastgele").onclick = () => {
      let r = Math.floor(Math.random() * kayanHavuz.length);
      if (r === gaIndex && kayanHavuz.length > 1) r = (r + 1) % kayanHavuz.length;
      gununAyetiCiz(r);
    };
    if ($("#gaKopyala")) $("#gaKopyala").onclick = () => {
      const s = kayanHavuz[gaIndex];
      panoyaKopyala(`${s.arapca ? s.arapca + "\n" : ""}“${s.soz}”\n— ${s.kaynak} (Diyanet İşleri Başkanlığı Meali)`, "Ayet-i Kerime kopyalandı ✓");
    };
  }

  /* ---- Manşet Slider ---- */
  const mansetler = H.slice(0, 8);
  const slaytKap = $("#mansetSlaytlar"), sayfaKap = $("#mansetSayfalar");
  let mI = 0, mZaman;
  mansetler.forEach((h, i) => {
    const s = el("div", "mslayt" + (i ? "" : " aktif"));
    s.innerHTML = `<img src="${u(h.fotolar[0])}" alt="${kacis(h.baslik)}" ${i > 1 ? 'loading="lazy"' : ""}>
      <div class="mslayt-yazi">
        <span class="etiket-kirmizi">${kacis(h.kategori)}</span>${h.tarih ? `<time>${kacis(h.tarih)}</time>` : ""}
        <h2>${kacis(h.baslik)}</h2>
        <p>${kacis(h.ozet)}</p>
        <span class="mslayt-aksiyon">Haberi ve ${h.fotolar.length} Fotoğrafı İncele →</span>
      </div>`;
    s.onclick = () => haberAc(i);
    slaytKap.appendChild(s);
    const b = el("button", i ? "" : "aktif", i + 1);
    b.type = "button";
    b.setAttribute("aria-label", h.baslik);
    b.onmouseenter = b.onclick = () => mGit(i, true);
    sayfaKap.appendChild(b);
  });
  function mGit(i, kullanici) {
    if (!mansetler.length) return;
    slaytKap.children[mI].classList.remove("aktif");
    sayfaKap.children[mI].classList.remove("aktif");
    mI = (i + mansetler.length) % mansetler.length;
    slaytKap.children[mI].classList.add("aktif");
    const b = sayfaKap.children[mI];
    b.classList.remove("aktif");
    void b.offsetWidth;
    b.classList.add("aktif");
    mBaslat(kullanici ? 9500 : 6500);
  }
  function mBaslat(ms = 6500) {
    clearTimeout(mZaman);
    mZaman = setTimeout(() => mGit(mI + 1), ms);
  }
  mBaslat();
  if ($("#mansetOnceki")) $("#mansetOnceki").onclick = () => mGit(mI - 1, true);
  if ($("#mansetSonraki")) $("#mansetSonraki").onclick = () => mGit(mI + 1, true);

  let tx = 0;
  slaytKap.addEventListener("touchstart", e => tx = e.touches[0].clientX, { passive: true });
  slaytKap.addEventListener("touchend", e => {
    const d = e.changedTouches[0].clientX - tx;
    if (Math.abs(d) > 45) mGit(mI + (d < 0 ? 1 : -1), true);
  });

  // Son haberler (manşetin yanı)
  const son = $("#sonHaberler");
  H.slice(0, 5).forEach((h, i) => {
    const li = el("li", "", `<img src="${u(h.fotolar[0])}" alt="" loading="lazy"><div><small>${kacis(h.kategori)}</small><b>${kacis(h.baslik)}</b></div>`);
    li.onclick = () => haberAc(i);
    son.appendChild(li);
  });

  /* ---- Haber Kartları ---- */
  const grid = $("#haberGrid"), filtre = $("#haberFiltre");
  const kat = h => h.kategori.split("·")[0].trim();
  const kategoriler = ["Tümü", ...new Set(H.map(kat))];
  function kartlar(sec) {
    grid.innerHTML = "";
    H.forEach((h, i) => {
      if (sec !== "Tümü" && kat(h) !== sec) return;
      const k = el("article", "haber-kart gorun goster");
      k.innerHTML = `<div class="gorsel"><img src="${u(h.fotolar[0])}" alt="${kacis(h.baslik)}" loading="lazy"><span class="etiket-kirmizi">${kacis(kat(h))}</span><span class="foto-say">📷 ${h.fotolar.length}</span></div>
        <div class="ic">${h.tarih ? `<time>${kacis(h.tarih)}</time>` : ""}<h3>${kacis(h.baslik)}</h3><p>${kacis(h.ozet)}</p><span class="devam">Haberi oku →</span></div>`;
      k.onclick = () => haberAc(i);
      grid.appendChild(k);
    });
  }
  kategoriler.forEach((c, i) => {
    const adet = c === "Tümü" ? H.length : H.filter(h => kat(h) === c).length;
    const b = el("button", i ? "" : "aktif", `${kacis(c)} (${adet})`);
    b.type = "button";
    b.onclick = () => {
      $$("button", filtre).forEach(x => x.classList.remove("aktif"));
      b.classList.add("aktif");
      kartlar(c);
    };
    filtre.appendChild(b);
  });
  kartlar("Tümü");

  /* ---- Kur'an-ı Kerim'den Hikmetler (82 Diyanet Ayeti Seçkisi) ---- */
  const ayetVitrin = $("#ayetVitrin"), ayetFiltre = $("#ayetFiltre"), ayetAra = $("#ayetAra");
  const dahaFazlaAyetBtn = $("#dahaFazlaAyet"), rastgeleAyetBtn = $("#rastgeleAyetBtn"), arapcaToggle = $("#arapcaToggle");
  if ($("#ayetSayisi") && AYETLER.length) {
    $("#ayetSayisi").dataset.say = AYETLER.length;
    $("#ayetSayisi").textContent = AYETLER.length;
  }

  let aktifAyetKonu = "Tümü";
  let ayetLimit = 12;
  const ayetKonular = ["Tümü", ...new Set(AYETLER.map(a => a.konu))];

  function ayetleriCiz(vurgulaKod = null) {
    if (!ayetVitrin) return;
    const aranan = (ayetAra ? ayetAra.value : "").trim().toLocaleLowerCase("tr-TR");
    const uygun = AYETLER.filter(a => {
      if (aktifAyetKonu !== "Tümü" && a.konu !== aktifAyetKonu) return false;
      if (!aranan) return true;
      return (
        a.meal.toLocaleLowerCase("tr-TR").includes(aranan) ||
        a.kaynak.toLocaleLowerCase("tr-TR").includes(aranan) ||
        a.konu.toLocaleLowerCase("tr-TR").includes(aranan)
      );
    });

    ayetVitrin.innerHTML = "";
    const gosterilecek = aranan ? uygun : uygun.slice(0, ayetLimit);

    gosterilecek.forEach(a => {
      const kart = el("article", "ayet-oge" + (vurgulaKod === a.kod ? " vurgula" : ""));
      kart.innerHTML = `
        <div>
          <div class="ayet-oge-ust">
            <span class="ayet-konu">${kacis(a.konu)}</span>
            <span class="ayet-sure-no">${kacis(a.kaynak)}</span>
          </div>
          <p class="ayet-oge-ar" dir="rtl" lang="ar">${kacis(a.arapca)}</p>
          <blockquote class="ayet-oge-meal">“${kacis(a.meal)}”</blockquote>
        </div>
        <div class="ayet-oge-alt">
          <span class="ayet-diyanet-not">✓ Diyanet İşleri Başkanlığı Meali</span>
          <button type="button" class="ayet-kopyala-btn">📋 Kopyala</button>
        </div>`;
      $(".ayet-kopyala-btn", kart).onclick = () => {
        panoyaKopyala(`${a.arapca}\n“${a.meal}”\n— ${a.kaynak} (Diyanet İşleri Başkanlığı Meali)`, `${a.kaynak} kopyalandı ✓`);
      };
      ayetVitrin.appendChild(kart);
    });

    if (dahaFazlaAyetBtn) {
      const kalan = uygun.length - gosterilecek.length;
      dahaFazlaAyetBtn.parentElement.style.display = kalan > 0 ? "" : "none";
      dahaFazlaAyetBtn.textContent = `Daha Fazla Ayet-i Kerime Göster (${kalan} ayet daha)`;
    }
  }

  if (ayetFiltre) {
    ayetKonular.forEach((konu, i) => {
      const adet = konu === "Tümü" ? AYETLER.length : AYETLER.filter(x => x.konu === konu).length;
      const b = el("button", i ? "" : "aktif", `${kacis(konu)} (${adet})`);
      b.type = "button";
      b.onclick = () => {
        $$("button", ayetFiltre).forEach(x => x.classList.remove("aktif"));
        b.classList.add("aktif");
        aktifAyetKonu = konu;
        ayetLimit = 12;
        ayetleriCiz();
      };
      ayetFiltre.appendChild(b);
    });
  }
  if (ayetAra) ayetAra.addEventListener("input", () => ayetleriCiz());
  if (dahaFazlaAyetBtn) {
    dahaFazlaAyetBtn.onclick = () => {
      ayetLimit += 12;
      ayetleriCiz();
    };
  }
  if (arapcaToggle && ayetVitrin) {
    arapcaToggle.onclick = () => {
      const gizli = ayetVitrin.classList.toggle("arapca-gizli");
      arapcaToggle.classList.toggle("aktif", !gizli);
      arapcaToggle.textContent = gizli ? "Arapça Metin: Kapalı" : "Arapça Metin: Açık";
    };
  }
  if (rastgeleAyetBtn && AYETLER.length) {
    rastgeleAyetBtn.onclick = () => {
      const secilen = AYETLER[Math.floor(Math.random() * AYETLER.length)];
      aktifAyetKonu = "Tümü";
      if (ayetAra) ayetAra.value = "";
      if (ayetFiltre) {
        $$("button", ayetFiltre).forEach((b, i) => b.classList.toggle("aktif", i === 0));
      }
      const idx = AYETLER.indexOf(secilen);
      ayetLimit = Math.max(12, idx + 3);
      ayetleriCiz(secilen.kod);
      const vurgulu = $(".ayet-oge.vurgula", ayetVitrin);
      if (vurgulu) vurgulu.scrollIntoView({ behavior: "smooth", block: "center" });
      bildirimGoster(`Seçilen Ayet: ${secilen.kaynak}`);
    };
  }
  ayetleriCiz();

  /* ---- Haber Detay Modal ---- */
  const modal = $("#haberModal");
  let aktifHaber = 0;
  function haberAc(i) {
    const h = H[i];
    if (!h) return;
    aktifHaber = i;
    $("#hmKapak").style.backgroundImage = `url("${u(h.fotolar[0])}")`;
    $("#hmKapak").onclick = () => lbAc(h.fotolar, 0);
    $("#hmKategori").textContent = h.kategori;
    $("#hmTarih").textContent = h.tarih || "";
    $("#hmBaslik").textContent = h.baslik;
    $("#hmOzet").textContent = h.ozet;
    $("#hmMetin").innerHTML = h.metin.map(p => `<p>${kacis(p)}</p>`).join("");
    $("#hmAyet").style.display = h.soz ? "" : "none";
    if ($("#hmArapca")) {
      $("#hmArapca").textContent = h.arapca || "";
      $("#hmArapca").style.display = h.arapca ? "" : "none";
    }
    $("#hmSoz").textContent = `“${h.soz}”`;
    $("#hmKaynak").textContent = h.kaynak;
    $("#hmFotoBaslik").textContent = `Fotoğraflar (${h.fotolar.length})`;
    const fk = $("#hmFotolar");
    fk.innerHTML = "";
    h.fotolar.forEach((f, j) => {
      const im = el("img");
      im.src = u(f);
      im.loading = "lazy";
      im.alt = h.baslik;
      im.onclick = () => lbAc(h.fotolar, j);
      fk.appendChild(im);
    });
    modal.classList.add("acik");
    modal.scrollTop = 0;
    document.body.classList.add("kilit");
    history.replaceState(null, "", "#haber-" + (i + 1));
  }
  function haberKapat() {
    modal.classList.remove("acik");
    document.body.classList.remove("kilit");
    history.replaceState(null, "", "#haberler");
  }
  $("#modalKapat").onclick = haberKapat;
  modal.addEventListener("click", e => { if (e.target === modal) haberKapat(); });
  $("#hmOnceki").onclick = () => haberAc((aktifHaber - 1 + H.length) % H.length);
  $("#hmSonraki").onclick = () => haberAc((aktifHaber + 1) % H.length);
  const m = location.hash.match(/^#haber-(\d+)/);
  if (m) haberAc(+m[1] - 1);

  /* ---- Proje Bölümü: "Proje" Kategorili Haberler ---- */
  const projeHaberleri = H.map((h, i) => [h, i]).filter(([h]) => /proje/i.test(h.kategori));
  if (projeHaberleri.length) {
    const pGorsel = $("#projeGorsel");
    pGorsel.style.backgroundImage = `url("${u(projeHaberleri[0][0].fotolar[0])}")`;
    projeHaberleri.forEach(([h, i], idx) => {
      const li = el("li", idx === 0 ? "aktif" : "", `<img src="${u(h.fotolar[0])}" alt="" loading="lazy">${kacis(h.baslik)}<span>Haberi Oku →</span>`);
      li.onmouseenter = () => {
        $$("li", $("#projeRota")).forEach(x => x.classList.remove("aktif"));
        li.classList.add("aktif");
        pGorsel.style.backgroundImage = `url("${u(h.fotolar[0])}")`;
      };
      li.onclick = () => haberAc(i);
      $("#projeRota").appendChild(li);
    });
  }

  /* ---- Galeri & Canlı Fotoğraf Şeridi ---- */
  const toplamFoto = A.reduce((t, a) => t + a.fotolar.length, 0) + H.reduce((t, h) => t + h.fotolar.length, 0);
  $("#fotoSayisi").dataset.say = toplamFoto;
  $("#fotoSayisi").textContent = toplamFoto;

  // Canlı fotoğraf şeridi (her albümden seçme kareler)
  const canliSerit = $("#canliFotoSerit");
  if (canliSerit && A.length) {
    const vitrinFotolar = [];
    A.forEach(a => a.fotolar.slice(0, 2).forEach(f => vitrinFotolar.push(f)));
    const ikili = [...vitrinFotolar, ...vitrinFotolar];
    ikili.forEach((f, idx) => {
      const img = el("img");
      img.src = u(f);
      img.alt = "TOKİDER Arşiv Karesi";
      img.loading = "lazy";
      img.onclick = () => lbAc(vitrinFotolar, idx % vitrinFotolar.length);
      canliSerit.appendChild(img);
    });
  }

  const kartKap = $("#albumKartlar"), gGrid = $("#galeriGrid"), ayetKap = $("#albumAyet"), dahaBtn = $("#dahaFazla");
  const SAYFA = 16;
  let aktifAlbum = 0, gosterilen = SAYFA;
  const rozetSvg = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 6.9 17.2A8 8 0 1 1 12 2zm5 3 1 2.6 2.8.2-2.2 1.8.7 2.7L17 10.8l-2.3 1.5.7-2.7-2.2-1.8 2.8-.2z"/></svg>';

  function albumGoster(i, sifirla = true) {
    const a = A[i];
    if (!a) return;
    aktifAlbum = i;
    if (sifirla) gosterilen = SAYFA;
    $$(".album-kart", kartKap).forEach((k, j) => k.classList.toggle("aktif", j === i));
    ayetKap.innerHTML = `<div class="rozet">${rozetSvg}</div><div><h3>${kacis(a.baslik)}</h3>${a.aciklama ? `<div class="acik">${kacis(a.aciklama)}</div>` : ""}
      ${a.arapca ? `<p class="album-ar" dir="rtl" lang="ar">${kacis(a.arapca)}</p>` : ""}
      ${a.soz ? `<blockquote>“${kacis(a.soz)}”</blockquote><cite>${kacis(a.kaynak)}</cite>` : ""}</div>`;
    gGrid.innerHTML = "";
    a.fotolar.slice(0, gosterilen).forEach((f, j) => {
      const fig = el("figure", "foto");
      fig.style.animationDelay = Math.min((j % SAYFA) * 35, 500) + "ms";
      fig.innerHTML = `<img src="${u(f)}" alt="${kacis(a.baslik)}" loading="lazy">`;
      fig.onclick = () => lbAc(a.fotolar, j);
      gGrid.appendChild(fig);
    });
    dahaBtn.parentElement.style.display = a.fotolar.length > gosterilen ? "" : "none";
  }

  A.forEach((a, i) => {
    const k = el("div", "album-kart", `<img src="${u(a.fotolar[0])}" alt="" loading="lazy"><span>${kacis(a.baslik)}<small>${a.fotolar.length} fotoğraf</small></span>`);
    k.onclick = () => albumGoster(i);
    kartKap.appendChild(k);
  });
  dahaBtn.onclick = () => {
    gosterilen += SAYFA;
    albumGoster(aktifAlbum, false);
  };
  albumGoster(0);

  // Faaliyet kartlarından ilgili galeri albümüne geçiş
  $$("[data-album]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = +btn.dataset.album;
      if (!isNaN(idx) && A[idx]) albumGoster(idx);
    });
  });

  /* ---- Lightbox ---- */
  const lb = $("#lightbox"), lbImg = $("img", lb), lbSay = $(".lb-sayac", lb);
  let lbListe = [], lbI = 0;
  function lbCiz() {
    lbImg.src = u(lbListe[lbI]);
    lbSay.textContent = `${lbI + 1} / ${lbListe.length}`;
  }
  function lbAc(liste, i) {
    lbListe = liste;
    lbI = i;
    lbCiz();
    lb.classList.add("acik");
    document.body.classList.add("kilit");
  }
  function lbKapat() {
    lb.classList.remove("acik");
    if (!modal.classList.contains("acik")) document.body.classList.remove("kilit");
  }
  const lbGit = d => {
    lbI = (lbI + d + lbListe.length) % lbListe.length;
    lbCiz();
  };
  $(".lb-kapat", lb).onclick = lbKapat;
  $(".lb-sol", lb).onclick = () => lbGit(-1);
  $(".lb-sag", lb).onclick = () => lbGit(1);
  lb.addEventListener("click", e => { if (e.target === lb) lbKapat(); });
  let lx = 0;
  lb.addEventListener("touchstart", e => lx = e.touches[0].clientX, { passive: true });
  lb.addEventListener("touchend", e => {
    const d = e.changedTouches[0].clientX - lx;
    if (Math.abs(d) > 45) lbGit(d < 0 ? 1 : -1);
  });
  addEventListener("keydown", e => {
    if (lb.classList.contains("acik")) {
      if (e.key === "Escape") lbKapat();
      if (e.key === "ArrowLeft") lbGit(-1);
      if (e.key === "ArrowRight") lbGit(1);
    } else if (modal.classList.contains("acik") && e.key === "Escape") {
      haberKapat();
    } else if (menu.classList.contains("acik") && e.key === "Escape") {
      menuKapat();
    }
  });

  /* ---- Ortaklar ---- */
  if (V.ortaklar.length) {
    V.ortaklar.forEach(o => $("#ortaklarListe").appendChild(el("div", "ortak", `<img src="${u(o.logo)}" alt="${kacis(o.isim)}" title="${kacis(o.isim)}" loading="lazy">`)));
  } else {
    $("#ortaklar").style.display = "none";
  }

  /* ---- IBAN & Hesap Adı Kopyalama ---- */
  $("#ibanKopyala").onclick = () => {
    const iban = $("#iban").textContent.replace(/\s/g, "");
    panoyaKopyala(iban, "IBAN kopyalandı ✓");
  };
  if ($("#hesapAdKopyala")) {
    $("#hesapAdKopyala").onclick = () => {
      panoyaKopyala($("#hesapAdi").textContent.trim(), "Dernek hesap adı kopyalandı ✓");
    };
  }

  /* ---- Giriş Animasyonları & Sayaçlar ---- */
  const hedef = $$(".faaliyet, .proje-vitrin, .proje-metin, .ayet-kart, .bant-kart, .banka, .harita, .gunun-ayeti, .ozet-kart, .ilke-kart, .zaman-adim, .sss-item, .sss-davet");
  hedef.forEach(x => x.classList.add("gorun"));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("goster");
      io.unobserve(e.target);
    }
  }), { threshold: 0.1 });
  hedef.forEach(x => io.observe(x));

  const sIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const t = e.target, son = +t.dataset.say, bas = son > 1000 ? son - 40 : 0, t0 = performance.now();
    const ad = n => {
      const p = Math.min((n - t0) / 1400, 1);
      t.textContent = Math.round(bas + (son - bas) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(ad);
    };
    requestAnimationFrame(ad);
    sIO.unobserve(t);
  }), { threshold: 0.5 });
  $$("[data-say]").forEach(x => sIO.observe(x));
})();
