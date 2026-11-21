# TOKİDER Web Sitesi (v2)

**Canlı Site (GitHub Pages):** https://hasanzci.github.io/tokider-web-sitesi/  
**GitHub Deposu:** https://github.com/Hasanzci/tokider-web-sitesi

`index.html`'e çift tıklayınca site tarayıcıda açılır. Sunucu ya da kurulum gerekmez.

## Yenilikler ve Özellikler
- **Diyanet İşleri Başkanlığı Resmi Kur'an-ı Kerim Meali Doğrulaması:** Sitedeki tüm ayet-i kerimeler (üst kayan şerit, Günün Ayet-i Kerimesi kartı, 82 ayetlik *Kur'an-ı Kerim'den Hikmetler* seçkisi, 13 haber ve 10 galeri albümü) **Diyanet İşleri Başkanlığı / Türkiye Diyanet Vakfı** resmi mealiyle birebir kontrol edilmiş ve Arapça mushaf metinleriyle birlikte eklenmiştir.
- **Yavaşlatılmış & Kontrol Edilebilir Üst Ayet Şeridi:** En üstteki kayan ayet şeridinin hızı metin uzunluğuna göre dingin ve rahat okunur bir hıza (~25px/sn) düşürülmüştür. Üzerine gelindiğinde duraklar; ayrıca şerit üzerindeki **Duraklat (`⏸`)** ve **Hız (`Yavaş / Normal`)** butonlarıyla kontrol edilebilir.
- **Yeni Bölümler & Zenginleştirilmiş Tasarım:**
  - **Kur'an-ı Kerim'den Hikmetler (82 Ayet Seçkisi):** 6 konu başlığında (*İlim & Hikmet*, *İnfak & Yardımlaşma*, *Ahlak & Kardeşlik*, *İbadet & Takva*, *Sabır & Tevekkül*, *Aile & Gençlik*) filtreleme, anlık arama, Arapça aç/kapat, rastgele ayet seçimi ve tek tıkla kopyalama.
  - **Hakkımızda, Temel İlkelerimiz & Tarihçe Zaman Çizelgesi:** 2012 kuruluşundan bugüne TOKİDER'in yolculuğu ve 4 temel ilkesi.
  - **Fotoğraflı Faaliyet Kartları & Canlı Galeri Şeridi:** Arşiv fotoğraflarıyla zenginleştirilmiş faaliyet kartları, akıcı fotoğraf şeridi ve Sıkça Sorulan Sorular (S.S.S.) bölümü.
  - **Tam Mobil ve Tablet Senkronizasyonu:** Mobil çekmece menü, dokunmatik kaydırma (manşet ve lightbox), okuma ilerleme çubuğu ve yukarı çık butonu.

## Klasör Yapısı

```
assets/
  haberler/   → MANŞET + HABERLER (her klasör bir haber)
  galeri/     → FOTO GALERİ (her klasör bir albüm)
  ortaklar/   → Ortak kurum logoları (dosya adı = kurum adı)
  logo/       → amblem.svg (keskin vektör logo) + orijinal logo
```

### Değişikliklerden Sonra
1. **`guncelle.bat`'a çift tıkla** (veya `python guncelle.py` çalıştır).
2. GitHub'a göndermek için:
   ```powershell
   git add -A
   git commit -m "İçerik güncellendi"
   git push
   ```
