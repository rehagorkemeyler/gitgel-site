# GORKEM-TODO

## Aşama W0 sonrası

1. vercel.com > GitHub ile giriş > Add New > Project > `gitgel-site` > Deploy.
2. Çıkan `....vercel.app` adresini Claude'a gönder.

## SENİN SIRAN: Aşama W5 (Search Console)

1. https://search.google.com/search-console adresine Google hesabınla gir > "Mülk ekle" > sağdaki **URL öneki** kutusuna `https://gitgel-site.vercel.app` yaz > Devam.
2. Doğrulama yöntemi olarak **HTML etiketi**'ni seç. Çıkan `<meta name="google-site-verification" content="BURASI" />` içindeki **BURASI** kısmını kopyala (tırnaklar olmadan). Henüz "Doğrula"ya basma.
3. vercel.com > gitgel-site > Settings > Environment Variables > Key: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, Value: kopyaladığın kod, Environments: Production > Save.
4. Deployments sekmesi > en üstteki deployment'ın yanındaki ⋯ > **Redeploy** (yeniden yayınlansın). 1-2 dakika bekle.
5. Search Console'a dön > **Doğrula**. "Mülk sahipliği doğrulandı" yazısını görmelisin.
6. Sol menüde **Sitemap'ler** > "Yeni sitemap ekle" kutusuna `sitemap-index.xml` yaz > Gönder. Durum "Başarılı" olmalı (ilk günlerde "Alınamadı" görünürse 1 gün bekle, normaldir).
7. Bana "Search Console tamam" yaz. Birkaç gün sonra Sayfalar raporunda kaç sayfanın dizine eklendiğini yaz, W6'ya (yeni diller) ona göre geçeriz.

## SENİN SIRAN: W5 sonrası izleme (3-7 gün sonra)

1. Search Console > Sayfalar: "Dizine eklendi" ve "Dizine eklenmedi" sayılarını bana yaz.
2. Search Console > Sitemap'ler: `sitemap-index.xml` durumunun "Başarılı" olduğunu kontrol et.
3. vercel.com > gitgel-site > Usage: kırmızı veya "limite yaklaştı" uyarısı var mı bak, varsa yaz.

## SENİN SIRAN: W7 geri bildirimleri (Android indirme ve şehir derin bağlantısı)

**A) "Android'e indir" doğrudan APK indirsin.** `gitgel-native` gizli olduğu için oradaki release linki herkese 404 verir. Site artık şu adresi kullanıyor: `https://github.com/rehagorkemeyler/gitgel-releases/releases/latest/download/GitGel.apk`
1. github.com > sağ üst **+** > **New repository** > ad: `gitgel-releases`, **Public** seç > Create repository.
2. Açılan repoda sağda **Releases** > **Create a new release** > Tag: `v1.0.0` (her yeni sürümde artır) > Title: `GitGel 1.0.0`.
3. Alttaki kutuya APK dosyasını sürükle ve dosya adının tam olarak **`GitGel.apk`** olduğundan emin ol (değilse bilgisayarında yeniden adlandırıp öyle yükle) > **Publish release**.
4. Kontrol: yukarıdaki adresi gizli sekmede aç; sayfa açılmadan APK inmeye başlamalı. Yeni sürümde 2-3. adımı tekrarla; link hep en son sürümü indirir.
(Farklı bir adres kullanmak istersen: Vercel > gitgel-site > Settings > Environment Variables > `NEXT_PUBLIC_ANDROID_APK_URL` = adres > Redeploy.)

**B) "Şehrini seç" kartları PWA'yı o şehirde açsın.** Kartlar artık `https://rehagorkemeyler.github.io/GitGel/?city=ankara` gibi adreslere gidiyor, ama PWA şu an şehri yalnızca tarayıcı hafızasından (`gg-city`) okuyor; `?city=` parametresini görmezden geliyor, yani PWA son seçilen şehirde açılıyor. Bu oturumun `GitGel` reposuna erişim izni olmadığı için düzeltemedim.
1. `GitGel` (PWA) reposunda bir Claude oturumu aç ve şunu yaz: "Uygulama açılırken URL'de `?city=istanbul|ankara|bursa` varsa onu `gg-city` olarak localStorage'a yaz, parametreyi URL'den sil ve o şehirle başla."
2. Yayınlandıktan sonra kontrol: `https://rehagorkemeyler.github.io/GitGel/?city=bursa` adresini aç; PWA Bursa haritasıyla açılmalı.
(İstersen bu oturuma GitGel reposunu ekleme izni ver, ben yapayım.)
