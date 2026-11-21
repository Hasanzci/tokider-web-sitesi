# TOKİDER Web Sitesi

`index.html`'e çift tıklayınca site tarayıcıda açılır. Sunucu ya da kurulum gerekmez.

## Klasör yapısı

```
assets/
  haberler/   → MANŞET + HABERLER (her klasör bir haber)
  galeri/     → FOTO GALERİ (her klasör bir albüm)
  ortaklar/   → Ortak kurum logoları (dosya adı = kurum adı)
  logo/       → amblem.svg (keskin vektör logo) + orijinal logo
```

### Yeni haber eklemek
1. `assets/haberler/` içinde yeni bir klasör aç: `00 Kandil Programımız` gibi.
   Baştaki numara sırayı belirler, **küçük numara en üstte görünür**. İlk 8 haber manşette döner.
2. Fotoğrafları klasöre at. Kapak olmasını istediğin fotoğrafın adını `kapak` ile başlat.
3. İstersen klasöre `haber.txt` koy (başka bir haberin dosyasını kopyalayıp düzenleyebilirsin):
   ```
   tarih: Mart 2026
   kategori: Sohbet
   ozet: Kısa özet cümlesi.
   soz: Habere eşlik eden ayet ya da hadis
   kaynak: Bakara Suresi, 148. Ayet
   ---
   Haberin metni. Paragrafları boş satırla ayır.
   ```
   `haber.txt` yoksa başlık klasör adından alınır ve sadece fotoğraflar gösterilir.

### Galeriye fotoğraf eklemek
- Var olan bir albüm klasörüne fotoğraf at ya da yeni albüm klasörü aç (`11 Kandil Geceleri` gibi).
- Albümdeki `bilgi.txt` dosyasında açıklama, ayet/hadis ve kaynak yazıyor; istediğin gibi değiştirebilirsin.

### Değişikliklerden sonra
**`guncelle.bat`'a çift tıkla.** Mac/Linux'ta `python3 guncelle.py` çalıştır.
Bunun için bilgisayarda Python yüklü olmalı (python.org). Python'la uğraşmak istemezsen Claude'a "güncelle" demen de yeter.

## Yayına almadan önce kontrol et
- **IBAN**: broşürden okundu, `index.html` içinde `id="iban"` satırında duruyor. Mutlaka dernekten teyit et.
- **Ayet ve hadisler**: meal ve kaynaklar yaygın Türkçe meallerden alındı. Yine de dernek hocasına bir kez kontrol ettir.
- **Haber metinleri**: eski Wix sitesindeki kısa özetlerden genişletildi. Eksik ya da yanlış bilgi varsa ilgili `haber.txt`'yi düzelt.

## Yayına alma
Klasörün tamamını herhangi bir statik hostinge yükle: Netlify Drop (sürükle-bırak), GitHub Pages ya da tokider.net hostingi.
