CONTENT.push(String.raw`
=== UNIT u3 | Bölüm 3 | Özgül Faktörler Modelinde Kazanç ve Kayıplar | Azalan verim, ücretin belirlenmesi, reel ücret, sermaye ve toprak rantı, Çin şoku

--- LESSON u3a | SF | Model ve azalan verim
FX: imalat (M): emek + sermaye; tarım (A): emek + toprak :: yalnızca emek sektörler arası hareketli
FX: azalan verim :: aynı makineye işçi ekledikçe her yeni işçinin katkısı (MPL) azalır
FX: $\text{FM}(M) = \dfrac{MPL_A}{MPL_M}$ :: 1 birim imalat için vazgeçilen tarım; imalat büyüdükçe artar → PPF eğri
FX: kısa dönem modeli :: sermaye ve toprak sektörler arasında taşınamaz

## CARD Neden yeni bir model?
Ricardo modelinde tek faktör emek olduğu için **bütün işçiler** ticaretten kazanıyordu. Bu fazla basit: gerçekte ticaret ==kazananlar ve kaybedenler== yaratır.
:::ornek Bolivya
2005'te Evo Morales, Bolivya'nın 180 yıllık tarihinde seçilen ilk Aymara yerlisi başkan oldu. 2009 anayasası yerlilere kendi topraklarındaki doğal kaynakların kontrolünü verdi. Doğalgaz ihracatı, satan yabancı ve devlet şirketlerine kazanç getirmişti ama yerli halk bu kazançtan pay alamamıştı. Kazancın paylaşımı konusundaki anlaşmazlık hükümetleri devirecek kadar büyük gerilim yarattı.
:::
==Özgül faktörler modeli (specific-factors model)==:
• İki sektör: **imalat (M)** emek ve ==sermaye== (makine, fabrika) kullanır; **tarım (A)** emek ve ==toprak== kullanır.
• Sermaye yalnızca imalatta, toprak yalnızca tarımda işe yarar: bunlar o sektöre ==özgü (specific)== faktörler. **Emek** iki sektörde de çalışabilir ve aralarında serbestçe geçer.
• Sermaye ve toprak sektörler arasında taşınamadığı için bu bir ==kısa dönem== modeli (Heckscher–Ohlin uzun dönem).
**Bu bölümün sembolleri:**
| Sembol | Ne demek? |
| $M$, $A$ alt indisi | imalat (manufacturing), tarım (agriculture) |
| $L_M$, $L_A$ | imalatta ve tarımda çalışan işçi sayısı; $L_M + L_A = L$ (toplam) |
| $K$ | sermaye miktarı (makine sayısı), yalnız imalatta |
| $T$ | toprak miktarı (dönüm), yalnız tarımda |
| $MPL_M$, $MPL_A$ | bir işçinin imalatta / tarımda ekstra ürettiği miktar |
| $P_M$, $P_A$ | imalat malının ve tarım malının (gıdanın) fiyatı |
| $W$ | ücret (iki sektörde aynı) |
| $R_K$ | ==sermaye rantı==: bir makinenin bir dönemde sahibine kazandırdığı para (makinenin "kirası") |
| $R_T$ | ==toprak rantı==: bir dönüm toprağın bir dönemde sahibine kazandırdığı para (toprağın "kirası") |
:::ipucu Neden sermaye özgül?
Makineler, binalar, ekipman belli faaliyetler için tasarlanmıştır; bir dokuma makinesini tarlaya taşıyamazsın. İşçi ise fabrikadan tarlaya geçebilir.
:::

## CARD Azalan verim ve eğri PPF
@fig prodfn
**Azalan verim (diminishing returns):** makine sayısı sabitken fabrikaya işçi ekledikçe üretim artar ama **her yeni işçi bir öncekinden daha az** ekler.
:::ornek Sayıyla
10 makineli bir fabrika: 1. işçi 10 birim, 2. işçi 8 birim, 3. işçi 6 birim ekliyor. Makineler kalabalıklaşıyor; yeni işçi bekliyor. Yani $MPL_M$: 10, 8, 6… düşüyor. Tarımda toprak sabit: aynı mantık.
:::
• Toplam emek sabit: imalatta daha çok işçi = tarımda daha az.
• İmalata işçi geçtikçe $MPL_M$ **düşer** (fabrika kalabalıklaşıyor), tarımda kalanların $MPL_A$'sı **yükselir** (tarla başına işçi azaldı).
• Bir işçiyi tarımdan imalata almak: imalat $MPL_M$ kadar artar, tarım $MPL_A$ kadar azalır. Yani 1 birim imalatın maliyeti:
$$\text{FM}(M) = \frac{MPL_A}{MPL_M} = \frac{\text{vazgeçilen tarım}}{\text{kazanılan imalat}}$$
:::ornek Hocanın sayıları
Bir işçi 5 imalat ekliyor, 2 tarım kaybettiriyor: $2/5 = 0.4$ tarım/imalat. Daha çok işçi geçince marjinal ürünler 4 ve 3 oluyor: $3/4 = 0.75$. İmalat genişledikçe maliyet **artar**: PPF imalat ekseni boyunca **dikleşir**, yani eğri (dışa bombeli) olur. Ricardo'da maliyet sabitti, PPF düzdü.
:::
:::dikkat Kavram karışıklığı
Azalan verim **bir girdiyi artırıp ötekini sabit tutunca** ortaya çıkar. Makine ve işçi birlikte iki katına çıkarsa üretim de iki katına çıkabilir (ölçeğe göre sabit getiri); ikisi çelişmez.
:::

## CARD Ticaretten toplam kazanç
@fig sfppf
Şekli adım adım okuyalım (yatay eksen imalat, dikey eksen tarım):
1. **Otarşi A:** ülke PPF üzerinde en yüksek kayıtsızlık eğrisine (U₁) dokunan noktada. Oradaki teğet doğrusunun eğimi imalatın nispi fiyatı $P_M/P_A$.
2. Home'un otarşideki imalat fiyatı Foreign'dakinden düşük ($P_M/P_A < P^*_M/P^*_A$): Home imalatta karşılaştırmalı üstün.
3. **Ticaret:** dünyada imalat daha pahalı (dik kırmızı doğru). Home daha çok imalat üretir: A'dan **B**'ye kayar.
4. **Tüketim C:** B'den geçen dünya fiyat doğrusu üzerinde, daha yüksek U₂'ye teğet olduğu nokta. B'den C'ye: imalat ihraç (sola), tarım ithal (yukarı).
5. Nispi fiyatı **artan** mal (imalat) ihraç, **düşen** mal (tarım) ithal edilir. Ticaret fiyatı otarşi fiyatından farklı olduğu sürece ülke **toplamda** kazanır. Ama kazanç eşit dağılmaz (sonraki dersler).
:::ornek Ticaretten kazanç ne kadar büyük?
ABD Aralık 1807 – Mart 1809 arasında Başkan Jefferson'ın isteğiyle ticareti neredeyse tamamen durdurdu (==ambargo==): GSYH ambargo olmasaydı olacağından yaklaşık %5 düşüktü. Japonya 1854'te 200 yıllık kendi kendine yeterlilikten (otarşi) dünyaya açıldı; kazanç tek taraflı değildi, ABD gibi ortaklar da kazandı.
:::

## CARD Ülkelere göre ticaretten kazanç
Kitaptaki uygulama tablosu ülkelerin ticaret/GSYH oranını ve tahmin edilen ticaretten kazancı (otarşiye kıyasla gelir farkı, %) veriyor; son sütun aynı tahminin farklı varsayımlarla düzeltilmiş hâli. Seçilmiş satırlar:
| Ülke | Ticaret/GSYH (%) | Ticaretten kazanç (%) | Düzeltilmiş kazanç (%) |
| Malezya | 116 | 74 | 219 |
| Macaristan | 81 | 87 | 166 |
| İsviçre | 65 | 135 | 111 |
| Almanya | 44 | 46 | 40 |
| Çin | 33 | 13 | 30 |
| Türkiye | 26 | 38 | 41 |
| Hindistan | 25 | 14 | 21 |
| Japonya | 16 | 26 | 21 |
| ABD | 15 | 19 | 14 |
| Brezilya | 14 | 10 | 10 |
| Ortalama | 38 | 48 | 59 |
• Kazançlar **büyük**: ortalama %48 (düzeltilmiş %59). Türkiye için tahmin %38: ticaret dursa gelir yaklaşık bu kadar daha düşük olurdu.
• Ticarete açıklığı (ticaret/GSYH) yüksek küçük ekonomilerde kazanç genellikle daha büyük (Malezya, Macaristan); büyük ve görece kapalı ekonomilerde daha küçük (ABD, Brezilya, Hindistan). İlişki birebir değil (Çin 33'e karşı 13).

## Q
SRC: Slayt clicker 3.1
EN: In the specific-factors model, labor:
TR: Özgül faktörler modelinde emek için hangisi doğru?
+ is used in both sectors
- can only be used in agriculture
- can only be used in manufacturing
- is freely mobile between countries
HINT: Sermaye imalata, toprak tarıma özgü.
EX: **Doğru cevap:** iki sektörde de kullanılır.
Emek ülke içinde sektörler arası serbest; ülkeler arası hareket Bölüm 5'in konusu.
**Diğer şıklar neden yanlış?**
• "Yalnız tarımda" / "yalnız imalatta": sektöre bağlı olanlar toprak ve sermaye; emek ikisinde de çalışır.
• "Ülkeler arası serbest": Bölüm 3'te göç yok; ülkeler arası hareket Bölüm 5'te.

## Q
EN: Why is the specific-factors model considered a short-run model?
TR: Özgül faktörler modeli neden kısa dönem modeli?
+ Because capital and land cannot move between the two industries
- Because labor cannot move between industries
- Because prices are fixed
- Because trade lasts only a short time
HINT: Heckscher–Ohlin'de bütün faktörler hareketli.
EX: **Doğru cevap:** sermaye ve toprak sektörler arasında taşınamaz.
Geçen yılın boşluk doldurma sorusunda da vardı: "The specific-factors model is a short-run model because capital and land could not move between the two industries."
**Diğer şıklar neden yanlış?**
• "Emek hareket edemez": emek sektörler arasında hareket eder; taşınamayan sermaye ve toprak.
• "Fiyatlar sabit": fiyatlar ticaretle değişiyor, model tam da bunu inceliyor.
• "Ticaret kısa sürer": "kısa dönem" faktörlerin hareketsizliği ile ilgili, ticaretin süresiyle değil.

## Q
EN: In the specific-factors model the PPF is bowed out (concave) because:
TR: Özgül faktörler modelinde PPF neden eğri (dışa bombeli)?
+ of diminishing returns to labor in each industry, so the opportunity cost of manufactures rises as manufacturing expands
- labor is the only factor of production
- the marginal product of labor is constant
- the country has an absolute advantage in both goods
HINT: $MPL_A/MPL_M$ imalat büyüdükçe ne olur?
EX: **Doğru cevap:** azalan verim; imalat büyüdükçe fırsat maliyeti artar.
Ricardo'da MPL sabit olduğu için PPF düzdü.
**Diğer şıklar neden yanlış?**
• "Tek faktör emek": bu Ricardo; orada PPF düz.
• "MPL sabit": sabit MPL düz PPF verir.
• "Mutlak üstünlük": PPF'nin şekliyle ilgisiz.

## Q
EN: Moving one worker from agriculture to manufacturing adds 5 units of manufactures and reduces agriculture by 2 units. What is the opportunity cost of one unit of manufactures?
TR: Bir işçi tarımdan imalata geçince imalat 5 artıyor, tarım 2 azalıyor. 1 birim imalatın fırsat maliyeti nedir?
+ 0.4 units of agriculture
- 2.5 units of agriculture
- 3 units of agriculture
- 10 units of agriculture
HINT: $MPL_A/MPL_M$.
EX: **Doğru cevap:** 0.4 birim tarım.
**Adım adım:** bir işçi tarımdan imalata geçince 5 imalat kazanılıyor, 2 tarım kaybediliyor. 5 imalatın bedeli 2 tarım → 1 imalatın bedeli $2/5 = 0.4$ tarım.
$2/5 = 0.4$. Ters oran 2.5, bir tarım biriminin imalat cinsinden maliyeti.
**Diğer şıklar neden yanlış?**
• 2.5: $5/2$; tarımın imalat cinsinden maliyeti (ters oran).
• 3: $5 - 2$; çıkarma anlamsız.
• 10: $5\times2$; çarpma anlamsız.

## Q
EN: The U.S. trade embargo of 1807–1809 is used in the textbook to show that:
TR: 1807–1809 ABD ambargosu kitapta neyi göstermek için kullanılır?
+ the gains from trade are large: U.S. GDP was about 5% lower than it would have been
- trade embargoes increase GDP
- tariffs have no effect on trade
- Japan gained from opening to trade
HINT: Ticaretten kazancın büyüklüğü.
EX: **Doğru cevap:** ticaretten kazanç büyük; GSYH yaklaşık %5 düşüktü.
Japonya'nın 1854'te açılması ikinci tarihsel örnek.
**Diğer şıklar neden yanlış?** Ambargo GSYH'yi **düşürdü** (artırmadı); tarifelerle ilgili değil; Japonya ayrı bir örnek (1854'te ticarete açılma).

## Q
SRC: Slayt clicker 3.2
EN: Assume that the Home no-trade relative price of manufacturing is lower than the Foreign relative price, $P_M/P_A < P^*_M/P^*_A$. What trade pattern would you expect?
TR: Home'da imalatın otarşi nispi fiyatı Foreign'dakinden düşük. Ticaret yönü ne olur?
+ Foreign will import manufacturing
- Foreign will import agriculture
- Home will export agriculture
- There is not enough information to determine the answer
HINT: Home imalatı görece ucuza üretiyor.
EX: **Doğru cevap:** Foreign imalat ithal eder.
Home imalatta karşılaştırmalı üstün: imalat ihraç, tarım ithal eder.
**Diğer şıklar neden yanlış?**
• "Foreign tarım ithal eder": Foreign'da imalat pahalı, tarım görece ucuz; tarımı ihraç eder.
• "Home tarım ihraç eder": Home imalatta ucuz, imalat ihraç eder.
• "Bilgi yetersiz": otarşi fiyatlarının karşılaştırması ticaret yönünü söylemeye yeter.

## Q
EN: In the specific-factors model, opening to trade leads to:
TR: Özgül faktörler modelinde ticarete açılmanın sonucu nedir?
+ overall gains for the country, but some factors of production lose
- gains for every factor of production
- losses for the country as a whole
- no change in the earnings of any factor
HINT: Kitabın 1. anahtar noktası.
EX: **Doğru cevap:** ülke toplamda kazanır ama bazı faktörler kaybeder.
Teoride kazançlar kayıplardan büyük; kazananlardan vergi alıp kaybedenleri telafi etmek mümkün ama pratikte zor.
**Diğer şıklar neden yanlış?**
• "Her faktör kazanır": ithalat sektörünün özgül faktörü kaybeder.
• "Ülke kaybeder": toplam kazanç pozitif.
• "Kimsenin kazancı değişmez": fiyatlar değişince gelirler değişir.

## GEN sfMoc

--- LESSON u3b | W | Ücretin belirlenmesi ve reel ücret
FX: $W = P_M\cdot MPL_M = P_A\cdot MPL_A$ :: işçiler serbest → iki sektörün ücreti eşitlenir
FX: $P_M$ %10 artarsa ücret %10'dan AZ artar :: $\Delta W/W < \Delta P_M/P_M$ (Δ = değişim, Δ/ = yüzde değişim)
FX: $W/P_M$ düşer, $W/P_A$ artar :: reel ücret (ücretle alınabilen mal) belirsiz (ambiguous)

## CARD Ücretin belirlenmesi (Şekil 3-4)
@fig labmkt
**Grafiği okumak:**
• **Yatay eksen** ülkedeki bütün işçiler. **İmalat işçileri soldan** (0_M'den sağa), **tarım işçileri sağdan** (0_A'dan sola) sayılır. Eksen üzerindeki her nokta işçilerin bir bölüşümü: noktanın solundakiler imalatta, sağındakiler tarımda.
• **Dikey eksen** ücret (lira).
• **Mavi çizgi** $P_M\cdot MPL_M$: imalatın bir işçiye ödeyebileceği en yüksek ücret = imalat fiyatı × o işçinin ekstra ürettiği miktar. İmalata işçi ekledikçe (sağa gittikçe) $MPL_M$ düştüğü için **aşağı iner**.
• **Kırmızı çizgi** $P_A\cdot MPL_A$: tarımın ödeyebileceği ücret. Tarım işçileri sağdan sayıldığı için, sola gittikçe tarımda işçi artar ve ücret düşer; soldan bakınca çizgi **yükselir**.
• **Kesişim A:** iki sektör aynı ücreti ödüyor. Burası denge: ücret W, imalatta 0_M–L arası, tarımda L–0_A arası işçi.
**Neden A?** A'nın solunda imalat daha çok öder (mavi kırmızının üstünde): işçiler imalata geçer, sağa doğru kayarız. Sağında tarım daha çok öder: işçiler tarıma geçer. Ancak A'da kimse geçmek istemez.
:::dikkat Fiziksel üretim ücret değildir
Daha çok fiziksel çıktı üreten sektör daha çok ödemek zorunda değil. Ücret, çıktının **değerini** yansıtır: fiyat × marjinal ürün. 5 elma ile 2 araba parçasını doğrudan karşılaştıramazsın; liraya çevirmek gerekir.
:::

## CARD İmalat fiyatı artarsa
@fig pmrise
**Ne olur, adım adım:**
1. İmalat malının fiyatı $P_M$ artar (tarım fiyatı aynı). Aynı işçinin ürettiği malın değeri artar: mavi çizgi $P_M\cdot MPL_M$ **yukarı kayar**.
2. Eski ücrette imalat artık daha çok ödüyor: işçiler tarımdan imalata geçer. İmalat istihdamı artar, tarımınki azalır (A'dan B'ye).
3. Ücret W'den W′'ye **artar**. Ama çizginin kaydığı kadar değil: imalata gelen yeni işçiler fabrikayı kalabalıklaştırır, $MPL_M$ düşer.
$$\frac{\Delta W}{W} < \frac{\Delta P_M}{P_M}$$
($\Delta$ "değişim" demek; $\Delta W/W$ ücretin yüzde değişimi.)
**Reel ücret** = ücretle alınabilecek mal miktarı:
• **İmalat malı cinsinden** $W/P_M$: ücret %10'dan az, fiyat %10 arttı → işçi **daha az** imalat malı alır.
• **Tarım malı cinsinden** $W/P_A$: ücret arttı, gıda fiyatı aynı → işçi **daha çok** gıda alır.
• İşçinin durumu **belirsiz (ambiguous)**: çok gıda tüketen işçi kazanır, çok imalat malı tüketen kaybeder. Ricardo'da reel ücret kesin artıyordu; burada işçiler hakkında kesin konuşamayız.
:::ornek Hocanın sayıları
İmalat fiyatı %10, ücret %5 artarsa: gıda cinsinden satın alma gücü %5 artar; imalat cinsinden $1.05/1.10 - 1 = -0.0455$, yani yaklaşık −%4.5 (kabaca $5 - 10 = -5$ puan).
:::

## CARD Yoksul mu zengin mi daha çok kazanır?
Fiyat değişimi bireyleri iki kanaldan etkiler:
• ==Harcama kanalı (spending channel)==: aldıkları malların fiyatı değişir. Ticaret gıda ve temel ihtiyaçları ucuzlatırsa en çok **yoksullar** kazanır, çünkü gelirlerinin büyük kısmını bunlara harcarlar (==Engel yasası==: gelir arttıkça gıdaya giden pay azalır).
• ==Kazanç kanalı (earnings channel)==: elde ettikleri gelir değişir. ABD'de ticaret nitelikli emeğin gelirini daha çok artırdı: bu kanal **zenginleri** kayırır.
**İşsizlik:** modelde işçi bir sektörden çıkınca hemen ötekine geçer. Gerçekte iş aramak zaman alır; ama işçiler (belki genişleyen ihracat sektörlerinde) yeni iş bulabildiğine göre ticaretin işçiler için kesin iyi ya da kötü olduğu söylenemez.

## Q
SRC: Slayt clicker 3.5
EN: In the specific-factors model, workers' real wages _____ because of trade.
TR: Özgül faktörler modelinde işçilerin reel ücreti ticaret yüzünden nasıl değişir?
+ change in an ambiguous manner
- increase
- decrease
- neither increase nor decrease
HINT: Bir mal cinsinden artar, öteki cinsinden düşer.
EX: **Doğru cevap:** belirsiz.
Ücret fiyatı artan mala göre düşer, öteki mala göre artar. Heckscher–Ohlin'de ise belirsizlik yok (Stolper–Samuelson).
**Diğer şıklar neden yanlış?** "Artar", "azalır", "değişmez" tek yönlü cevaplar; oysa reel ücret bir mal cinsinden artarken öteki mal cinsinden düşer. Ricardo'da "artar" doğruydu, HO'da Stolper–Samuelson kesin yön verir; özgül faktörlerde belirsiz.

## Q
EN: In the specific-factors model, the price of manufactures rises and the price of food is unchanged. Which is correct?
TR: İmalat fiyatı artıyor, gıda fiyatı sabit. Hangisi doğru?
+ The wage rises by a smaller percentage than the price of manufactures
- The wage rises by a larger percentage than the price of manufactures
- The wage falls
- The wage rises by exactly the same percentage as the price of manufactures
HINT: İmalata gelen işçiler $MPL_M$'yi düşürür.
EX: **Doğru cevap:** ücret, imalat fiyatından daha az artar.
$\Delta W/W < \Delta P_M/P_M$. Bu yüzden $W/P_M$ düşer.
**Diğer şıklar neden yanlış?**
• "Fiyattan çok artar": imalata gelen işçiler $MPL_M$'yi düşürür; ücret fiyat kadar bile artamaz.
• "Ücret düşer": imalat daha çok ödeyince ücret yükselir.
• "Tam aynı oranda": o zaman $MPL_M$ hiç düşmemiş olurdu; azalan verim nedeniyle düşer.

## Q
EN: When the price of manufactures rises in the specific-factors model, what happens to the allocation of labor?
TR: İmalat fiyatı artınca emeğin dağılımı nasıl değişir?
+ Labor moves from agriculture to manufacturing
- Labor moves from manufacturing to agriculture
- Labor leaves the country
- The allocation does not change because labor is a specific factor
HINT: Hangi sektör daha çok öder?
EX: **Doğru cevap:** emek tarımdan imalata geçer.
$P_M\cdot MPL_M$ yukarı kaydı; imalat ücreti eşitlenene kadar işçi çeker.
**Diğer şıklar neden yanlış?**
• "İmalattan tarıma": imalat daha çok ödediği için tersi olur.
• "Ülkeyi terk eder": modelde göç yok.
• "Emek özgül faktör": emek hareketli faktör; özgül olanlar sermaye ve toprak.

## Q
EN: The price of manufactures rises by 10% and the wage rises by 5%. The real wage in terms of manufactures changes by approximately:
TR: İmalat fiyatı %10, ücret %5 artıyor. İmalat cinsinden reel ücret yaklaşık ne kadar değişir?
+ −4.5%
- +5%
- +15%
- −10%
HINT: $1.05/1.10 - 1$.
EX: **Doğru cevap:** yaklaşık −%4.5.
**Adım adım:** imalat cinsinden reel ücret $W/P_M$. Ücret 1.05 katına, fiyat 1.10 katına çıktı: $1.05/1.10 = 0.9545$, yani %4.5 düşüş. Kısa yol: $5\% - 10\% \approx -5\%$.
$1.05/1.10 - 1 = -0.0455$. Tarım malı cinsinden reel ücret %5 artar.
**Diğer şıklar neden yanlış?**
• +%5: bu gıda cinsinden reel ücret.
• +%15: ücret ve fiyat değişimi toplanmış.
• −%10: ücret artışı unutulmuş.

## Q
EN: Why can't a higher nominal wage alone tell us that workers are better off in the specific-factors model?
TR: Daha yüksek nominal ücret neden tek başına işçilerin iyileştiğini göstermez?
+ Because we must compare the wage with both goods prices; purchasing power rises over one good and falls over the other
- Because nominal wages never change in this model
- Because workers do not consume manufactures
- Because real wages always fall with trade
HINT: Hocanın özetindeki kendini sınama sorusu.
EX: **Doğru cevap:** ücreti iki malın fiyatıyla karşılaştırmak gerek.
Satın alma gücü bir mal cinsinden artar, öteki cinsinden düşer; refah tüketim bileşimine bağlı.
**Diğer şıklar neden yanlış?**
• "Nominal ücret hiç değişmez": değişir (örnekte %5 arttı).
• "İşçiler imalat malı tüketmez": model böyle bir şey varsaymaz.
• "Reel ücret hep düşer": gıda cinsinden artar.

## Q
EN: The "spending channel" through which trade affects individuals tends to benefit poor consumers the most because:
TR: Harcama kanalı neden en çok yoksulları kayırır?
+ they spend a larger share of their income on food and necessities whose prices tend to fall with trade
- they own most of the capital
- they work in export industries
- their wages rise the fastest
HINT: Engel yasası.
EX: **Doğru cevap:** gelirlerinin büyük kısmını gıda ve temel ihtiyaçlara harcarlar.
Kazanç kanalı ise ABD'de nitelikli emeği, yani zenginleri kayırır.
**Diğer şıklar neden yanlış?** Sermaye sahipliği, ihracat sektöründe çalışmak ya da ücretin hızlı artması **kazanç** kanalıyla ilgili; soru harcama kanalını soruyor: hangi malları aldıkları.

## Q
EN: In Figure 3-4 the labor used in manufacturing is measured from left to right and the labor used in agriculture from right to left. The equilibrium wage is found where:
TR: Şekil 3-4'te denge ücreti nerede?
+ the $P_M \cdot MPL_M$ curve intersects the $P_A \cdot MPL_A$ curve
- $MPL_M$ equals $MPL_A$ in physical units
- labor in manufacturing equals labor in agriculture
- the wage equals the price of manufactures
HINT: Değer marjinal ürünleri eşitlenir.
EX: **Doğru cevap:** iki $P\cdot MPL$ eğrisinin kesiştiği yerde.
Eşit olan fiziksel marjinal ürünler değil, değer marjinal ürünleri.
**Diğer şıklar neden yanlış?**
• "Fiziksel MPL'ler eşit": eşit olan değer marjinal ürünleri ($P\times MPL$); farklı mallar fiziksel olarak karşılaştırılamaz.
• "İki sektörde işçi sayısı eşit": denge ücretlerin eşitlendiği yer, işçi sayısının değil.
• "Ücret = imalat fiyatı": MPL ile çarpmayı unutur.

## GEN sfWage
## GEN sfRealWage

--- LESSON u3c | R | Sermaye ve toprak getirileri
FX: $R_K = \dfrac{P_M Q_M - W L_M}{K}$ :: sermaye rantı = (imalat satışı − işçilere ödenen) ÷ makine sayısı
FX: $R_T = \dfrac{P_A Q_A - W L_A}{T}$ :: toprak rantı = (tarım satışı − işçilere ödenen) ÷ dönüm
FX: $\dfrac{\Delta R_K}{R_K} = \dfrac{\hat P_M\cdot P_MQ_M - \hat W\cdot WL_M}{R_K K}$ :: şapka (^) = yüzde değişim; kitap: $(10\%\cdot100 - 5\%\cdot60)/40 = 17.5\%$
FX: $\hat R_T < 0 < \hat W < \hat P_M < \hat R_K$ :: $P_M$ artınca: toprak kaybeder, ücret arada, sermaye en çok kazanır

## CARD Rantlar nasıl değişir?
**Rant ne demek?** Bir makinenin ya da bir dönüm toprağın sahibine bir dönemde kazandırdığı para. Makineyi kiraya verseydin alacağın kira gibi düşün.
• $R_K$: ==sermaye rantı (rental on capital)==, makine başına kazanç.
• $R_T$: ==toprak rantı (rental on land)==, dönüm başına kazanç.
**Nasıl hesaplanır?** Bir sektörün satışından işçilere ödenen çıkarılır; kalan, makine (ya da toprak) sahiplerine gider:
$$R_K = \frac{\overbrace{P_M Q_M}^{\text{imalat satışı}} - \overbrace{W L_M}^{\text{işçilere ödenen}}}{\underbrace{K}_{\text{makine sayısı}}}, \qquad R_T = \frac{P_A Q_A - W L_A}{T}$$
:::ornek Küçük örnek
İmalatın satışı 100 lira, işçilere 60 lira ödendi, 10 makine var: her makine sahibine $(100 - 60)/10 = 4$ lira kalır. $R_K = 4$.
:::
**Fiyat değişince marjinal ürün mantığı:** imalat fiyatı artınca işçiler imalata geçer.
• Her makineye daha çok işçi düşer: makine daha verimli çalışır, ==sermayenin marjinal ürünü artar==, $R_K$ artar.
• Tarımdan işçi gider: her dönüme daha az işçi düşer, ==toprağın marjinal ürünü düşer==, $R_T$ düşer.
Genel kural: bir sektörde çalışan işçi artarsa **o sektörün özgül faktörü** kazanır.
• Toprak sahibinin rantı düştü, gıda fiyatı aynı, imalat pahalandı: toprak sahibi **iki mal cinsinden de** kaybeder.
• Sermaye sahibinin rantı fiyattan da hızlı arttı: **iki mal cinsinden de** kazanır.

## CARD Kitaptaki sayısal örnek
**Başlangıç durumu:**
| Başlangıç | İmalat | Tarım |
| Hasılat (satış) | 100 | 100 |
| İşçilere ödeme | 60 | 50 |
| Özgül faktöre kalan | 40 (makine sahipleri) | 50 (toprak sahipleri) |
**Şok:** imalat fiyatı %10 artıyor, tarım fiyatı aynı, ücret %5 artıyor. (Ücret artışı soruda **verilir**; tablo tek başına onu belirlemez.)
**Sermaye rantı: parayı takip et.**
1. İmalatın satışı %10 artar: $100 \to 110$, yani **+10**.
2. İşçilere ödenen %5 artar: $60 \to 63$, yani **+3**.
3. Makine sahiplerine kalan: önce $100 - 60 = 40$, şimdi $110 - 63 = 47$. Artış **+7**.
4. Yüzde değişim: $7/40 = 0.175$ → **%17.5**. Makine sayısı değişmediği için makine başına rant $R_K$ da %17.5 artar.
Kitabın formülü aynı şeyi yazar:
$$\frac{\Delta R_K}{R_K} = \frac{10\%\times100 - 5\%\times60}{40} = \frac{10 - 3}{40} = 17.5\%$$
**Toprak rantı: parayı takip et.**
1. Tarımın satışı değişmez: 100 (fiyat aynı).
2. İşçilere ödenen %5 artar: $50 \to 52.5$, yani **+2.5**.
3. Toprak sahiplerine kalan: önce 50, şimdi $100 - 52.5 = 47.5$. Değişim **−2.5**.
4. Yüzde değişim: $-2.5/50 = -0.05$ → **−%5**.
$$\frac{\Delta R_T}{R_T} = \frac{0 - 5\%\times50}{50} = -5\%$$
@fig sfrank
**Sayı doğrusu:** toprak rantı −%5 < 0 < ücret +%5 < imalat fiyatı +%10 < sermaye rantı +%17.5.
• Sermaye rantı fiyattan (%10) hızlı arttı: makine sahibi **iki mal cinsinden de** kazanır.
• Toprak rantı düştü, hiçbir mal ucuzlamadı: toprak sahibi **iki mal cinsinden de** kaybeder.
• Ücret fiyatların (%0 ve %10) **arasında**: işçinin durumu belirsiz.
:::ipucu Sembol okuma
$\Delta R_K / R_K$ = "R_K'nin yüzde değişimi". Bazı slaytlarda $\hat R_K$ (R_K şapka) diye de yazılır: aynı şey. Kitap bu hesabı başlangıç miktarlarıyla yapar; küçük değişimler için iyi bir yaklaşımdır.
:::

## CARD Kim kazanır, kim kaybeder?
| Fiyat değişimi (öteki fiyat sabit) | Sermaye (makine sahibi) | Toprak (toprak sahibi) | Emek (işçi) |
| İmalat fiyatı artar | kazanır | kaybeder | belirsiz |
| İmalat fiyatı düşer | kaybeder | kazanır | belirsiz |
| Tarım fiyatı artar | kaybeder | kazanır | belirsiz |
**Tek cümlelik kural:** bir sektörün malının nispi fiyatı artarsa **o sektöre bağlı faktör** (imalatta sermaye, tarımda toprak) iki mal cinsinden de kazanır; **öteki sektöre bağlı faktör** kaybeder; işçinin durumu belirsizdir.
**Ticarete açılınca:**
• İhraç malının nispi fiyatı artar → ==ihracat sektörünün özgül faktörü kazanır==.
• İthal malın nispi fiyatı düşer → ==ithalat sektörünün özgül faktörü kaybeder==.
• İşçiler iki sektör arasında geçebildiği için uç kazanç ya da kayıplardan kaçınır: ücret iki fiyat değişiminin arasında kalır.
:::ipucu Sermaye rantı neden fiyattan hızlı artar?
İki etki üst üste biner: makinenin ürettiği mal pahalandı (fiyat etkisi) **ve** makineye daha çok işçi geldiği için makine daha çok üretiyor (verimlilik etkisi).
:::

## Q
SRC: Slayt clicker 3.3
EN: According to the specific-factors model, labor resources in each country will _____ as a result of trade.
TR: Özgül faktörler modelinde ticaret sonucu emek nereye kayar?
+ shift to the export industry
- shift to the import industry
- continue to have the same allocation among industries
- emigrate to the other country
HINT: Nispi fiyatı artan sektör daha çok öder.
EX: **Doğru cevap:** ihracat sektörüne kayar.
İhraç malının nispi fiyatı artar, $P\cdot MPL$ eğrisi yukarı kayar ve işçi çeker. Emek ülkeler arası hareket etmez.
**Diğer şıklar neden yanlış?**
• "İthalat sektörüne": ithal malın nispi fiyatı düşer, o sektör daha az öder; işçiler oradan çıkar.
• "Dağılım değişmez": fiyat değişince $P\cdot MPL$ eğrisi kayar, işçiler yer değiştirir.
• "Göç": modelde ülkeler arası emek hareketi yok.

## Q
EN: In the textbook's table on the gains from trade, which countries tend to have the largest estimated gains?
TR: Kitaptaki tabloda en büyük ticaretten kazanç hangi ülkelerde?
+ small, open economies with high ratios of trade to GDP, such as Malaysia and Hungary
- large economies with low trade ratios, such as the United States and Brazil
- countries that do not trade at all
- only countries in the European Union
HINT: Malezya: ticaret/GSYH 116, kazanç 74.
EX: **Doğru cevap:** ticaret/GSYH oranı yüksek küçük açık ekonomiler.
ABD (15/19) ve Brezilya (14/10) gibi büyük, görece kapalı ekonomilerde kazanç küçük. Ortalama kazanç %48.
**Diğer şıklar neden yanlış?**
• ABD ve Brezilya: kazançları küçük (%19 ve %10).
• "Hiç ticaret yapmayanlar": ticaret yoksa ticaretten kazanç da yok.
• "Yalnız AB ülkeleri": tabloda Malezya en büyüklerden; kural AB'ye özgü değil.

## Q
SRC: Slayt clicker 3.4
EN: According to the specific-factors model, the specific factor used in the import industry will:
TR: İthalat sektörünün özgül faktörüne ne olur?
+ lose as trade is opened
- gain as trade is opened
- neither gain nor lose
- There is not enough information to determine the answer
HINT: İthal malın nispi fiyatı düşer.
EX: **Doğru cevap:** ticarete açılınca kaybeder.
İhracat sektörünün özgül faktörü ise kazanır.
**Diğer şıklar neden yanlış?** İthal malın nispi fiyatı düşer; o sektörden işçi çıkar, sektöre bağlı faktörün (örneğin toprak) marjinal ürünü ve rantı düşer: kesin **kaybeder**. Kazanan ihracat sektörünün özgül faktörü. Bilgi yeterli: kitabın ana sonucu.

## Q
EN: Manufacturing has revenue 100, payments to labor 60 and payments to capital 40. The price of manufactures rises by 10%, the price of food is unchanged, and the wage rises by 5%. The rental on capital rises by:
TR: İmalat hasılatı 100, emek 60, sermaye 40. Fiyat %10, ücret %5 artıyor. Sermaye rantı yüzde kaç artar?
+ 17.5%
- 5%
- 10%
- 7%
HINT: $(10\%\cdot100 - 5\%\cdot60)/40$.
EX: **Doğru cevap: %17.5.**
**Adım adım (parayı takip et):** satış 100 → 110 (+10). İşçilere 60 → 63 (+3). Makine sahiplerine kalan 40 → 47 (+7). Yüzde: $7/40 = 17.5\%$.
$(10 - 3)/40 = 0.175$. Rant fiyattan (%10) hızlı arttı: sermaye iki mal cinsinden de kazanır.
**Diğer şıklar neden yanlış?**
• %5: ücret artışı (rant değil).
• %10: fiyat artışı; rant fiyattan daha hızlı artar.
• %7: makine sahiplerine kalan paranın **artışı** (7 lira); yüzde için 40'a bölmek gerekir: $7/40 = 17.5\%$.

## Q
EN: Agriculture has revenue 100, payments to labor 50 and payments to land 50. The price of food is unchanged and the wage rises by 5%. The rental on land changes by:
TR: Tarım hasılatı 100, emek 50, toprak 50. Gıda fiyatı sabit, ücret %5 artıyor. Toprak rantı yüzde kaç değişir?
+ −5%
- +5%
- −2.5%
- −10%
HINT: $-5\%\times50/50$.
EX: **Doğru cevap:** −%5.
**Adım adım (parayı takip et):** tarım satışı 100'de kalır. İşçilere 50 → 52.5 (+2.5). Toprak sahiplerine kalan 50 → 47.5 (−2.5). Yüzde: $-2.5/50 = -5\%$.
Toprak rantı düştü, hiçbir mal ucuzlamadı: toprak sahibi iki mal cinsinden de kaybeder.
**Diğer şıklar neden yanlış?**
• +%5: işaret ters; ücret artınca toprağa kalan **azalır**.
• −%2.5: kalan paranın değişimi (−2.5 lira); yüzde için 50'ye bölmek gerekir.
• −%10: imalat fiyatı değişimi karıştırılmış.

## Q
EN: When the price of manufactures rises in the specific-factors model, the correct ranking of percentage changes is:
TR: İmalat fiyatı artınca yüzde değişimlerin doğru sıralaması hangisi?
+ $\hat R_T < 0 < \hat W < \hat P_M < \hat R_K$
- $\hat R_K < 0 < \hat W < \hat P_M < \hat R_T$
- $\hat W < 0 < \hat R_T < \hat P_M < \hat R_K$
- $0 < \hat R_T < \hat P_M < \hat W < \hat R_K$
HINT: Toprak kaybeder, sermaye kazanır, ücret arada.
EX: **Doğru cevap:** $\hat R_T < 0 < \hat W < \hat P_M < \hat R_K$.
Ücret artar ama fiyattan az (işçi belirsiz); sermaye rantı fiyattan hızlı.
**Diğer şıklar neden yanlış?**
• $R_K$ ve $R_T$ yer değiştirmiş: imalat fiyatı artınca imalata bağlı **sermaye** kazanır, toprak kaybeder.
• Ücret 0'ın altında: ücret **artar** (imalat daha çok ödüyor), ama fiyattan az.
• $R_T$ pozitif: tarımdan işçi çıkınca toprağın verimliliği düşer, rant düşer.

## Q
EN: As more labor is used in manufacturing, the marginal product of capital:
TR: İmalatta daha çok emek kullanılınca sermayenin marjinal ürünü ne olur?
+ rises, because each machine has more labor to work it
- falls, because of diminishing returns to capital
- does not change
- becomes zero
HINT: Her makineye düşen işçi.
EX: **Doğru cevap:** artar.
Tarımdan işçi çıkınca toprağın marjinal ürünü ise düşer.
**Diğer şıklar neden yanlış?**
• "Düşer": azalan verim **sabit tutulan** faktöre daha çok işçi eklenince işçinin ürünü için geçerli; makinenin ürünü ise artar (makine başına işçi arttı).
• "Değişmez" ve "sıfır olur": işçi sayısı değişince makinenin verimliliği değişir.

## Q
EN: In the specific-factors model, the price of food (agriculture) rises while the price of manufactures is fixed. Who gains in real terms?
TR: Gıda fiyatı artıyor, imalat fiyatı sabit. Reel olarak kim kazanır?
+ landowners
- capital owners
- workers, unambiguously
- nobody
HINT: Fiyatı artan sektörün özgül faktörü.
EX: **Doğru cevap:** toprak sahipleri.
Sermaye sahipleri kaybeder, işçilerin durumu yine belirsiz.
**Diğer şıklar neden yanlış?**
• Sermaye sahipleri: imalat fiyatı aynı, imalattan işçi çıkıyor; sermaye kaybeder.
• "İşçiler kesin": reel ücret yine belirsiz.
• "Kimse": tarım fiyatı arttığında toprak sahipleri kesin kazanır.

## Q
EN: Why can the rental on capital rise by more than the price of manufactures?
TR: Sermaye rantı neden imalat fiyatından daha çok artabilir?
+ Capital benefits from the higher output price and from the greater productivity as more workers enter manufacturing
- Because the wage falls by more than the price rises
- Because capital moves into agriculture
- Because land rentals rise too
HINT: Hocanın özetindeki kendini sınama sorusu.
EX: **Doğru cevap:** hem yüksek fiyattan hem de artan verimlilikten yararlanır.
İmalata gelen işçiler sermayenin marjinal ürününü artırır.
**Diğer şıklar neden yanlış?** Ücret düşmüyor, artıyor (fiyattan az); sermaye tarıma geçemez (özgül faktör); toprak rantı artmıyor, düşüyor.

## GEN sfRents

--- LESSON u3d | CHN | Kaybedenler: Çin şoku, TAA ve kahve
FX: Çin şoku :: Çin'in WTO'ya girişi (2001) sonrası ithalat artışı; 1999–2011 ≈ 1.7 milyon iş kaybı
FX: işten çıkarılanların ≈ ⅔'ü 3 yılda iş bulur :: yarısı daha düşük ücretle
FX: TAA (1962) :: ithalat rekabeti yüzünden işini kaybedenlere ek destek

## CARD Çin şoku
Modelde işçiler bir sektörden çıkınca öteki sektöre **hemen** geçiyordu. Gerçekte:
• Çin 2001'de WTO'ya girdi; ABD ithalatındaki Çin payı 2001'de %10'dan 2009'da %23'e çıktı. Buna ve imalat istihdamına etkisine =="Çin şoku"== denir.
• Çalışmalar ABD imalatında **2 milyon ya da daha fazla** iş kaybı buldu. 1999–2011 arasında ithalat ve bağlantılı sektörlerde yaklaşık 1.7 milyon iş kaybı.
• Çok büyük bir fiyat değişiminde ihracat sektörlerinde kayıpları dengeleyecek kadar iş yaratılması **on yıldan uzun** sürdü. Ama daha uzun 1991–2011 döneminde ithalattan iş kayıpları ihracattan iş kazançlarıyla neredeyse dengelendi.
@fig pmfall
Modelde imalat fiyatı düşünce: imalat emeği azalır, tarım emeği artar, ücret düşer; imalata bağlı sermaye kaybeder.

## CARD İşsizlik ve hizmetler
• ABD imalat istihdamı ve toplam istihdamdaki payı 1973'ten beri düşüyor; hizmet sektörü büyüyor.
• 1974–2007 arası imalatta ücretler hizmetlerden biraz yüksekti; 2008'den beri tüm özel hizmetlerde ücret daha yüksek (bilgi hizmetlerindeki yüksek ücretler etkisiyle).
| İşten çıkarılanlar (2015–2017) | Toplam | Yeniden iş bulan | Daha düşük ücretle | Aynı ya da yüksek ücretle |
| Tüm sektörler | 2.98 milyon | %66 | %51 | %49 |
| İmalat | 479 bin | %65 | %53 | %47 |
| Hizmetler | 2.24 milyon | %69 | %53 | %47 |
Kitabın 5. anahtar noktası: iktisatçılar işsizlik maliyetini normalde ticaret kaybı saymaz, çünkü insanlar çoğunlukla yeni iş bulur: yaklaşık **üçte ikisi üç yıl içinde**, yarısı daha düşük, yarısı aynı ya da yüksek ücretle.

## CARD Kayıplar telafi edilebilir mi?
Teoride ticaretin kazançları kayıplardan büyük: hükümet kazananlardan vergi alıp kaybedenleri telafi edebilir. Pratikte zor.
• **Emek:** 1962'den beri ABD'de ==Ticarete Uyum Yardımı (Trade Adjustment Assistance, TAA)==: ithalat rekabeti yüzünden işini kaybedenlere ek işsizlik ödemesi ve sağlık sigortası.
• **Sermaye:** ithalat rekabetiyle karşılaşan firmalara TAA: danışman, mühendis, uzman tutmak için fon.
• **Toprak:** hükümetler çiftçi gelirlerinin düşmesini engellemeye çalışır.
:::ornek Kahve
Dünya kahve fiyatları çok dalgalı (2018 dolarıyla 1986'da libre başına 3.39 dolar, 2001'de 0.63, 2007'de 1.30): hava koşulları ve ülkelerin üretim artışları. Bu, ihracatçı ülkelerde çiftçi gelirlerinde büyük dalgalanma demek. **Adil ticaret (Fair Trade USA)** gibi kuruluşlar tüketiciye daha pahalı ama istikrarlı fiyatlı kahve seçeneği sunar. 2005'te fiyatlar yükselince çiftçiler kahveyi kooperatife değil yerel en yüksek teklife satmak istedi.
:::

## Q
EN: The "China shock" refers to:
TR: "Çin şoku" neyi anlatır?
+ the impact on the U.S. labor market of rising imports from China after China joined the WTO in 2001
- China's tariffs on U.S. goods in 2018
- the fall in Chinese wages after 2008
- the effect of U.S. FDI on Chinese manufacturing
HINT: ABD ithalatında Çin payı %10'dan %23'e.
EX: **Doğru cevap:** Çin'in WTO'ya girişi sonrası ithalat artışının ABD emek piyasasına etkisi.
İmalatta 2 milyon ya da daha fazla iş kaybı tahmin ediliyor.
**Diğer şıklar neden yanlış?** 2018 tarifeleri ABD–Çin ticaret savaşı (Bölüm 1); Çin ücretlerinin düşüşü ve ABD'nin Çin'deki FDI'sı "Çin şoku" değil.

## Q
EN: In the specific-factors model, a fall in the price of manufactured goods (for example, from import competition):
TR: İmalat fiyatı düşerse (örneğin ithalat rekabeti) ne olur?
+ reduces employment in manufacturing and lowers the real return to capital tied to that industry
- raises employment in manufacturing
- raises the real return to capital in manufacturing
- has no effect on landowners
HINT: Şekil 3-9.
EX: **Doğru cevap:** imalat istihdamı düşer, imalata bağlı sermaye kaybeder.
İşçiler tarıma geçer, ücret düşer; toprak sahipleri kazanır.
**Diğer şıklar neden yanlış?** İmalat fiyatı düşünce imalat daha az öder: istihdam **azalır**, imalata bağlı sermaye **kaybeder**. Toprak sahipleri etkilenir: tarıma işçi gelir, toprak rantı **artar**.

## Q
EN: About what share of U.S. workers displaced from manufacturing or service jobs find new jobs within three years?
TR: İşten çıkarılan ABD işçilerinin yaklaşık ne kadarı üç yıl içinde yeni iş buluyor?
+ about two-thirds, roughly half at lower wages
- almost all, at higher wages
- about one-tenth
- none, because jobs never return
HINT: Tablo 3-2: %65–69.
EX: **Doğru cevap:** yaklaşık üçte ikisi; yaklaşık yarısı daha düşük ücretle.
Bu yüzden iktisatçılar işsizliği genellikle kalıcı ticaret kaybı saymaz.
**Diğer şıklar neden yanlış?** Tablo 3-2: yeniden iş bulanlar %65–69; neredeyse hepsi değil, onda bir de değil; iş bulanların yarısından fazlası (%51–53) daha düşük ücretle.

## Q
EN: The Trade Adjustment Assistance (TAA) program in the United States:
TR: ABD'deki Ticarete Uyum Yardımı (TAA) nedir?
+ provides additional unemployment and health insurance to workers laid off because of import competition
- imposes tariffs on imports from China
- gives subsidies to exporters of coffee
- limits immigration of workers
HINT: 1962'de başladı.
EX: **Doğru cevap:** ithalat rekabeti yüzünden işten çıkarılanlara ek işsizlik ve sağlık sigortası.
Firmalar için de rekabet gücünü artırmaya yönelik bir TAA programı var.
**Diğer şıklar neden yanlış?** TAA tarife koymaz, kahve ihracatçılarına sübvansiyon vermez (Adil Ticaret ayrı, sivil bir girişim), göçle ilgisi yok.

## Q
EN: In theory the gains from opening to trade exceed the losses. This means that:
TR: Teoride kazançlar kayıplardan büyük. Bu ne demek?
+ the government could in principle tax the winners and compensate the losers so that everyone is better off, though this is hard in practice
- nobody loses from trade
- compensation happens automatically through the market
- losers always outnumber winners
HINT: Kitabın sonuç slaytı.
EX: **Doğru cevap:** prensipte kazananlardan alıp kaybedenlere vermek mümkün; pratikte zor.
Telafi kendiliğinden olmaz; uyum maliyetleri ve sahiplik yapısı ticarete muhalefeti açıklar.
**Diğer şıklar neden yanlış?** Kaybedenler var (ithalat sektörünün özgül faktörü); telafi kendiliğinden olmaz, pratikte zor; kaybedenlerin sayısı hakkında model bir şey söylemez.

## Q
EN: Over the longer period 1991–2011, the textbook finds that job losses in U.S. import industries were:
TR: 1991–2011 döneminin tamamında ithalat sektörlerindeki iş kayıpları nasıldı?
+ nearly balanced by job gains in export industries
- ten times larger than job gains in exports
- zero
- entirely in the service sector
HINT: Kısa dönem ve uzun dönem farkı.
EX: **Doğru cevap:** ihracattaki iş kazançlarıyla neredeyse dengelendi.
1999–2011'de ise yaklaşık 1.7 milyon net kayıp vardı; dengelenme on yıldan uzun sürdü.
**Diğer şıklar neden yanlış?** Uzun dönemde kayıplar kazançlardan on kat büyük değil, neredeyse eşit; kayıplar sıfır değil (1999–2011'de 1.7 milyon); kayıplar imalattaydı, yalnızca hizmetlerde değil.

## Q
EN: Why do coffee farmers' incomes fluctuate so much?
TR: Kahve çiftçilerinin gelirleri neden çok dalgalanır?
+ World coffee prices fluctuate widely because of weather and changes in supply as countries expand production
- Coffee is not traded internationally
- Coffee prices are fixed by the WTO
- Coffee farmers are paid a fixed wage
HINT: 3.39 dolar, 0.63 dolar, 1.30 dolar.
EX: **Doğru cevap:** dünya fiyatları hava ve arz değişimleri yüzünden çok dalgalı.
Kitabın 7. anahtar noktası: ihracatta çok kişi çalışsa da dünya fiyatı dalgalanması gelirleri sert etkiler.
**Diğer şıklar neden yanlış?** Kahve dünyada çok ticaret yapılan bir mal; fiyatını WTO belirlemez; çiftçilerin geliri sabit ücret değil, kahve fiyatına bağlı.

`);
