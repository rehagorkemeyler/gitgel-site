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
