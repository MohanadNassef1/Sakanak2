export interface BlogArticle {
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  contentEn: string;
  contentAr: string;
  keywords: string;
  publishedAt: string;
  readTimeMin: number;
  category: 'guides' | 'tips' | 'city' | 'students';
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'best-areas-rent-cairo-2026',
    titleEn: 'Best Areas to Rent a Room in Cairo in 2026',
    titleAr: 'أفضل مناطق لإيجار غرفة في القاهرة 2026',
    excerptEn: 'A complete guide to the best neighborhoods in Cairo for renting a room or shared apartment, including prices and what to expect.',
    excerptAr: 'دليل شامل لأفضل أحياء القاهرة لإيجار غرفة أو شقة مشاركة، مع الأسعار وما تتوقعه.',
    contentEn: `## Best Areas to Rent a Room in Cairo in 2026

Cairo is a massive city with dozens of neighborhoods, each offering a different lifestyle and price range. Whether you're a student, a young professional, or someone looking for a shared apartment, this guide will help you find the perfect area.

### 1. Nasr City (مدينة نصر)
**Average rent:** 3,000 - 6,000 EGP/month for a shared room
Nasr City is one of Cairo's most popular residential areas. It has excellent public transportation, shopping malls like City Stars, and a wide variety of restaurants. It's ideal for young professionals and students at Ain Shams University.

### 2. Heliopolis (مصر الجديدة)
**Average rent:** 4,000 - 8,000 EGP/month for a shared room
Heliopolis offers a blend of classic Cairo charm with modern amenities. The area has beautiful architecture, cafés, and is close to Cairo International Airport. Great for those who appreciate a more upscale neighborhood.

### 3. Maadi (المعادي)
**Average rent:** 5,000 - 10,000 EGP/month for a shared room
Known for its tree-lined streets and expat-friendly atmosphere, Maadi is perfect for those who want a quieter lifestyle. It has international schools, restaurants, and easy metro access.

### 4. New Cairo (القاهرة الجديدة)
**Average rent:** 4,000 - 9,000 EGP/month for a shared room
New Cairo is a modern suburb with gated communities, malls, and universities like AUC. It's ideal for students and families but requires a car for most commutes.

### 5. Dokki & Mohandessin (الدقي والمهندسين)
**Average rent:** 3,500 - 7,000 EGP/month for a shared room
These neighboring areas in Giza are well-connected by metro and buses. They offer affordable options with good access to downtown Cairo.

### Tips for Finding a Room in Cairo
- **Use Sakanak** to find verified listings without broker fees
- **Visit before you commit** — always book a viewing through the platform
- **Check public transportation** access — Cairo traffic can be brutal
- **Ask about utilities** — electricity and water bills can vary significantly
- **Verify your identity** on the platform for more trust and better matches`,
    contentAr: `## أفضل مناطق لإيجار غرفة في القاهرة 2026

القاهرة مدينة ضخمة فيها عشرات الأحياء، كل واحد فيهم بيقدم أسلوب حياة ومستوى أسعار مختلف. سواء كنت طالب أو شاب بيشتغل أو بتدور على شقة مشاركة، الدليل ده هيساعدك تلاقي المنطقة المثالية.

### 1. مدينة نصر
**متوسط الإيجار:** 3,000 - 6,000 جنيه/شهر لغرفة مشاركة
مدينة نصر من أشهر المناطق السكنية في القاهرة. فيها مواصلات ممتازة، مولات زي سيتي ستارز، وتنوع كبير في المطاعم. مناسبة جداً للشباب وطلاب جامعة عين شمس.

### 2. مصر الجديدة
**متوسط الإيجار:** 4,000 - 8,000 جنيه/شهر لغرفة مشاركة
مصر الجديدة بتقدم مزيج من سحر القاهرة الكلاسيكي مع المرافق الحديثة. المنطقة فيها معمار جميل، كافيهات، وقريبة من مطار القاهرة الدولي.

### 3. المعادي
**متوسط الإيجار:** 5,000 - 10,000 جنيه/شهر لغرفة مشاركة
معروفة بشوارعها المليانة أشجار وجوها الهادي. المعادي مثالية لللي بيحبوا أسلوب حياة أهدى. فيها مدارس دولية، مطاعم، ومترو.

### 4. القاهرة الجديدة
**متوسط الإيجار:** 4,000 - 9,000 جنيه/شهر لغرفة مشاركة
القاهرة الجديدة منطقة حديثة فيها كمبوندات، مولات، وجامعات زي الجامعة الأمريكية. مناسبة للطلاب والعائلات بس محتاج عربية.

### 5. الدقي والمهندسين
**متوسط الإيجار:** 3,500 - 7,000 جنيه/شهر لغرفة مشاركة
المنطقتين دول في الجيزة ومتصلين بالمترو والأتوبيسات. بيقدموا خيارات بأسعار معقولة مع وصول سهل لوسط البلد.

### نصائح للبحث عن غرفة في القاهرة
- **استخدم سكنك** لإيجاد شقق موثقة بدون عمولة سمسار
- **زور المكان قبل ما تلتزم** — احجز معاينة من خلال المنصة
- **تأكد من المواصلات** — زحمة القاهرة صعبة
- **اسأل عن الفواتير** — فواتير الكهرباء والمياه ممكن تختلف كتير
- **وثق هويتك** على المنصة لثقة أكتر ونتائج أحسن`,
    keywords: 'best areas rent Cairo, أفضل مناطق إيجار القاهرة, rooms for rent Cairo 2026, غرف للايجار القاهرة, Nasr City rent, مدينة نصر إيجار, Maadi rent, Heliopolis rent',
    publishedAt: '2026-03-01',
    readTimeMin: 5,
    category: 'city',
  },
  {
    slug: 'how-to-find-roommate-egypt',
    titleEn: 'How to Find a Trustworthy Roommate in Egypt',
    titleAr: 'إزاي تلاقي شريك سكن موثوق في مصر',
    excerptEn: 'Step-by-step guide to finding a safe and compatible roommate in Egypt, including red flags to watch out for.',
    excerptAr: 'دليل خطوة بخطوة للبحث عن شريك سكن آمن ومتوافق في مصر، مع علامات التحذير اللي لازم تاخد بالك منها.',
    contentEn: `## How to Find a Trustworthy Roommate in Egypt

Finding the right roommate can make or break your living experience. Here's how to find someone trustworthy and compatible in Egypt.

### Step 1: Define Your Preferences
Before you start searching, know what you want:
- **Budget range** — How much can you afford monthly?
- **Location** — Which areas work for your commute?
- **Lifestyle** — Smoker or non-smoker? Pets? Guests policy?
- **Gender preference** — Many people in Egypt prefer same-gender roommates

### Step 2: Use a Verified Platform
Avoid random social media posts. Use Sakanak where all users go through ID verification. This ensures:
- Real identities — no fake profiles
- Safety ratings and reviews
- Direct communication without brokers

### Step 3: Meet Before You Commit
Always book a viewing and meet the potential roommate in person. Ask about:
- Daily routine and work schedule
- Cleaning and chores expectations
- Guest policies
- Bill splitting arrangement

### Step 4: Check Red Flags
Watch out for:
- 🚩 Refusing to show ID or verify identity
- 🚩 Asking for large upfront payments
- 🚩 Being vague about the apartment details
- 🚩 Pressuring you to decide quickly
- 🚩 No photos of the actual room

### Step 5: Agree on Terms
Before moving in, agree on:
- Rent amount and payment dates
- Deposit and refund terms
- Notice period for leaving
- Shared expenses (internet, utilities, cleaning)

Using Sakanak makes this process safer and easier with verified users, in-app messaging, and viewing booking.`,
    contentAr: `## إزاي تلاقي شريك سكن موثوق في مصر

اختيار شريك السكن المناسب ممكن يأثر على تجربة سكنك بالكامل. هنا دليل للبحث عن شريك سكن موثوق ومتوافق في مصر.

### الخطوة 1: حدد تفضيلاتك
قبل ما تبدأ تدور، اعرف إنت عايز إيه:
- **الميزانية** — كام تقدر تدفع في الشهر؟
- **المكان** — إيه المناطق اللي مناسبة لشغلك؟
- **أسلوب الحياة** — مدخن ولا لأ؟ حيوانات أليفة؟ سياسة الضيوف؟
- **الجنس** — ناس كتير في مصر بتفضل شريك سكن من نفس الجنس

### الخطوة 2: استخدم منصة موثقة
تجنب البوستات العشوائية على السوشيال ميديا. استخدم سكنك اللي كل المستخدمين بيتحققوا من هويتهم. ده بيضمن:
- هويات حقيقية — مفيش بروفايلات مزيفة
- تقييمات ومراجعات أمان
- تواصل مباشر بدون سماسرة

### الخطوة 3: قابل قبل ما تلتزم
دايماً احجز معاينة وقابل شريك السكن المحتمل شخصياً. اسأل عن:
- الروتين اليومي ومواعيد الشغل
- توقعات النظافة والشغل البيتي
- سياسة الضيوف
- تقسيم الفواتير

### الخطوة 4: خلي بالك من علامات التحذير
انتبه لـ:
- 🚩 رفض إظهار الهوية أو التوثيق
- 🚩 طلب مبالغ كبيرة مقدماً
- 🚩 الغموض عن تفاصيل الشقة
- 🚩 الضغط عليك لاتخاذ قرار سريع
- 🚩 عدم وجود صور للغرفة الفعلية

### الخطوة 5: اتفق على الشروط
قبل ما تنقل، اتفق على:
- مبلغ الإيجار ومواعيد الدفع
- التأمين وشروط الاسترداد
- فترة الإشعار للمغادرة
- المصاريف المشتركة (إنترنت، فواتير، نظافة)

استخدام سكنك بيخلي العملية دي أأمن وأسهل مع مستخدمين موثقين، رسائل داخلية، وحجز معاينات.`,
    keywords: 'find roommate Egypt, شريك سكن في مصر, how to find roommate, البحث عن شريك سكن, safe roommate, roommate tips Egypt, نصائح شريك سكن',
    publishedAt: '2026-03-05',
    readTimeMin: 4,
    category: 'guides',
  },
  {
    slug: 'student-housing-guide-egypt',
    titleEn: 'Student Housing Guide: Best Options in Egypt for 2026',
    titleAr: 'دليل سكن الطلاب: أفضل الخيارات في مصر 2026',
    excerptEn: 'Everything students need to know about finding affordable housing near Egyptian universities.',
    excerptAr: 'كل ما يحتاج الطلاب معرفته عن إيجاد سكن بأسعار معقولة بالقرب من الجامعات المصرية.',
    contentEn: `## Student Housing Guide: Best Options in Egypt for 2026

Finding affordable student housing in Egypt can be challenging. This guide covers the best options near major universities.

### Cairo Universities
**Cairo University (جامعة القاهرة)**
- Best areas: Dokki, Mohandessin, Boulaq El Dakrour
- Budget: 2,500 - 5,000 EGP/month per person
- Look for shared apartments near the metro

**American University in Cairo (AUC)**
- Best areas: New Cairo, Fifth Settlement, Rehab City
- Budget: 4,000 - 8,000 EGP/month per person
- Many student-oriented buildings in the area

**Ain Shams University**
- Best areas: Nasr City, Heliopolis, Ain Shams
- Budget: 2,000 - 4,500 EGP/month per person
- Affordable options with good transportation

### Alexandria Universities
**Alexandria University**
- Best areas: Smouha, Sporting, Louran
- Budget: 2,000 - 4,000 EGP/month per person
- Walking distance options available

### Mansoura University
- Best areas: Toreel, Hay El Gameaa
- Budget: 1,500 - 3,000 EGP/month per person
- Very affordable compared to Cairo

### Tips for Students
1. **Start early** — Housing near universities fills up fast before semesters
2. **Use Sakanak's student filter** to find student-friendly listings
3. **Share with fellow students** — Splitting a 2-3 bedroom apartment is cheapest
4. **Check distance to campus** — Walking distance saves transportation costs
5. **Verify the landlord** — Use platforms with ID verification like Sakanak`,
    contentAr: `## دليل سكن الطلاب: أفضل الخيارات في مصر 2026

إيجاد سكن طلاب بأسعار معقولة في مصر ممكن يكون صعب. الدليل ده بيغطي أفضل الخيارات بالقرب من الجامعات الكبرى.

### جامعات القاهرة
**جامعة القاهرة**
- أفضل مناطق: الدقي، المهندسين، بولاق الدكرور
- الميزانية: 2,500 - 5,000 جنيه/شهر للفرد
- دور على شقق مشاركة قريبة من المترو

**الجامعة الأمريكية بالقاهرة**
- أفضل مناطق: القاهرة الجديدة، التجمع الخامس، مدينة الرحاب
- الميزانية: 4,000 - 8,000 جنيه/شهر للفرد
- فيه عمارات كتير موجهة للطلاب في المنطقة

**جامعة عين شمس**
- أفضل مناطق: مدينة نصر، مصر الجديدة، عين شمس
- الميزانية: 2,000 - 4,500 جنيه/شهر للفرد
- خيارات بأسعار معقولة مع مواصلات كويسة

### جامعات الاسكندرية
**جامعة الاسكندرية**
- أفضل مناطق: سموحة، سبورتنج، لوران
- الميزانية: 2,000 - 4,000 جنيه/شهر للفرد
- فيه خيارات على مسافة مشي

### جامعة المنصورة
- أفضل مناطق: التوريل، حي الجامعة
- الميزانية: 1,500 - 3,000 جنيه/شهر للفرد
- أسعار أرخص بكتير من القاهرة

### نصائح للطلاب
1. **ابدأ بدري** — السكن قرب الجامعات بيتملي بسرعة قبل الفصول الدراسية
2. **استخدم فلتر الطلاب في سكنك** لإيجاد إعلانات مناسبة للطلاب
3. **شارك مع زملاء** — تقسيم شقة 2-3 أوض أرخص حاجة
4. **تأكد من المسافة للكلية** — المشي بيوفر مصاريف المواصلات
5. **تحقق من صاحب الشقة** — استخدم منصات بتوثق الهوية زي سكنك`,
    keywords: 'student housing Egypt, سكن طلاب مصر, student accommodation Cairo, سكن جامعي, university housing Egypt, affordable student rooms, سكن طلاب رخيص, AUC housing, Cairo University housing',
    publishedAt: '2026-03-03',
    readTimeMin: 6,
    category: 'students',
  },
  {
    slug: 'renting-without-broker-egypt',
    titleEn: 'How to Rent a Room in Egypt Without a Broker',
    titleAr: 'إزاي تأجر غرفة في مصر بدون سمسار',
    excerptEn: 'Save money by avoiding broker fees. Learn how to find rooms directly from owners using online platforms.',
    excerptAr: 'وفر فلوسك بتجنب عمولة السمسار. اتعلم إزاي تلاقي غرف مباشرة من أصحابها.',
    contentEn: `## How to Rent a Room in Egypt Without a Broker

Broker fees in Egypt can cost you 1-2 months of rent. Here's how to avoid them entirely.

### The Problem with Brokers
- Fees typically range from 50% to 100% of one month's rent
- Some brokers charge both the tenant AND the landlord
- Many listings on social media are posted by brokers pretending to be owners
- No accountability if something goes wrong

### How to Find Direct Listings

#### 1. Use Sakanak
Sakanak is a broker-free platform where:
- All listings are from verified owners or tenants
- No broker fees — ever
- ID verification ensures real people
- In-app messaging for safe communication

#### 2. University Notice Boards
Many universities have physical or online boards where students post room availability. Check:
- Facebook groups for your specific university
- Student affairs offices
- Department notice boards

#### 3. Walk the Neighborhood
Visit the area you want to live in and look for "للإيجار" (for rent) signs on buildings. This old-school method still works, especially in residential areas.

### Red Flags of Hidden Broker Fees
- 🚩 Being asked to pay a "viewing fee"
- 🚩 Someone who shows multiple apartments in different areas (likely a broker)
- 🚩 Vague about whether they're the owner
- 🚩 Asking for the fee in cash with no receipt

### Your Rights
In Egypt, there's no law requiring you to use a broker. You have every right to find housing directly. Platforms like Sakanak exist specifically to connect you with verified owners.`,
    contentAr: `## إزاي تأجر غرفة في مصر بدون سمسار

عمولة السمسار في مصر ممكن تكلفك إيجار شهر أو اتنين. هنا إزاي تتجنبها تماماً.

### مشكلة السماسرة
- العمولة عادة من 50% لـ 100% من إيجار شهر
- بعض السماسرة بيشتغلوا من المستأجر والمالك
- إعلانات كتير على السوشيال ميديا بتبقى من سماسرة بيتظاهروا إنهم أصحاب شقق
- مفيش مسؤولية لو حصلت مشكلة

### إزاي تلاقي إعلانات مباشرة

#### 1. استخدم سكنك
سكنك منصة بدون سماسرة حيث:
- كل الإعلانات من ملاك أو مستأجرين موثقين
- مفيش عمولة سمسار — أبداً
- توثيق الهوية بيضمن أشخاص حقيقيين
- رسائل داخلية للتواصل الآمن

#### 2. لوحات إعلانات الجامعات
جامعات كتير عندها لوحات إعلانات فيزيقية أو أونلاين. شوف:
- جروبات فيسبوك لجامعتك
- مكاتب شؤون الطلاب
- لوحات إعلانات الأقسام

#### 3. امشي في الحي
زور المنطقة اللي عايز تسكن فيها ودور على لافتات "للإيجار" على العمارات. الطريقة القديمة دي لسه شغالة.

### علامات تحذير لعمولة سمسار مخفية
- 🚩 طلب دفع "رسوم معاينة"
- 🚩 شخص بيوريك شقق كتير في مناطق مختلفة (غالباً سمسار)
- 🚩 مش واضح هو المالك ولا لأ
- 🚩 طلب العمولة كاش بدون إيصال

### حقوقك
في مصر، مفيش قانون بيلزمك تستخدم سمسار. من حقك تلاقي سكن مباشرة. منصات زي سكنك موجودة خصيصاً لتوصلك بملاك موثقين.`,
    keywords: 'rent without broker Egypt, إيجار بدون سمسار, no broker fees, بدون عمولة, direct from owner, مباشرة من المالك, save money renting Egypt',
    publishedAt: '2026-02-28',
    readTimeMin: 4,
    category: 'tips',
  },
  {
    slug: 'alexandria-rooms-guide',
    titleEn: 'Complete Guide to Renting Rooms in Alexandria',
    titleAr: 'الدليل الشامل لإيجار غرف في الاسكندرية',
    excerptEn: 'Everything you need to know about finding rooms and shared apartments in Alexandria, Egypt.',
    excerptAr: 'كل ما تحتاج معرفته عن إيجاد غرف وشقق مشاركة في الاسكندرية.',
    contentEn: `## Complete Guide to Renting Rooms in Alexandria

Alexandria is Egypt's second largest city and a major university hub. Here's your complete guide to finding housing.

### Best Areas for Renting

#### Smouha (سموحة)
- **Price range:** 2,500 - 5,000 EGP/month per room
- Modern area with shops, cafés, and near Alexandria University
- Popular with students and young professionals

#### Sidi Bishr (سيدي بشر)
- **Price range:** 2,000 - 4,000 EGP/month per room
- Close to the beach and public transportation
- More affordable with good amenities

#### Miami (ميامي)
- **Price range:** 2,500 - 5,000 EGP/month per room
- Beachfront location, popular during summer
- Prices may be higher in summer months

#### Gleem & Stanley (جليم وستانلي)
- **Price range:** 3,000 - 6,000 EGP/month per room
- Upscale Corniche-facing areas
- Beautiful sea views but pricier

#### Louran (لوران)
- **Price range:** 2,500 - 4,500 EGP/month per room
- Central location with good transportation
- Near the tram line for easy commuting

### Tips Specific to Alexandria
1. **Summer prices rise** — If possible, sign a lease before June
2. **Check for sea humidity** — Apartments near the sea need good ventilation
3. **Tram access matters** — Alexandria's tram is cheap and connects most areas
4. **University proximity** — Alex University and Arab Academy students should look at Smouha and Sporting
5. **Use Sakanak** — Find verified listings in Alexandria without broker fees`,
    contentAr: `## الدليل الشامل لإيجار غرف في الاسكندرية

الاسكندرية هي تاني أكبر مدينة في مصر ومركز جامعي كبير. هنا دليلك الشامل لإيجاد سكن.

### أفضل مناطق للإيجار

#### سموحة
- **متوسط الأسعار:** 2,500 - 5,000 جنيه/شهر لغرفة
- منطقة حديثة فيها محلات، كافيهات، وقريبة من جامعة الاسكندرية
- شعبية عند الطلاب والشباب

#### سيدي بشر
- **متوسط الأسعار:** 2,000 - 4,000 جنيه/شهر لغرفة
- قريبة من البحر والمواصلات
- أسعار معقولة مع خدمات كويسة

#### ميامي
- **متوسط الأسعار:** 2,500 - 5,000 جنيه/شهر لغرفة
- على البحر مباشرة، شعبية في الصيف
- الأسعار ممكن ترتفع في الصيف

#### جليم وستانلي
- **متوسط الأسعار:** 3,000 - 6,000 جنيه/شهر لغرفة
- مناطق راقية على الكورنيش
- مناظر بحر جميلة بس أغلى

#### لوران
- **متوسط الأسعار:** 2,500 - 4,500 جنيه/شهر لغرفة
- موقع مركزي مع مواصلات كويسة
- قريب من خط الترام

### نصائح خاصة بالاسكندرية
1. **الأسعار بترتفع في الصيف** — لو تقدر، وقع عقد قبل يونيو
2. **تأكد من الرطوبة** — الشقق القريبة من البحر محتاجة تهوية كويسة
3. **الترام مهم** — ترام اسكندرية رخيص وبيوصل معظم المناطق
4. **القرب من الجامعة** — طلاب جامعة الاسكندرية والأكاديمية العربية يدوروا في سموحة وسبورتنج
5. **استخدم سكنك** — لاقي شقق موثقة في الاسكندرية بدون عمولة سمسار`,
    keywords: 'rooms Alexandria Egypt, غرف للايجار في الاسكندرية, rent Alexandria, إيجار الاسكندرية, Smouha rent, سموحة إيجار, student housing Alexandria, سكن طلاب الاسكندرية',
    publishedAt: '2026-03-07',
    readTimeMin: 5,
    category: 'city',
  },
  {
    slug: 'rooms-for-rent-giza-2026',
    titleEn: 'Rooms for Rent in Giza 2026: Neighborhoods, Prices & Tips',
    titleAr: 'غرف للإيجار في الجيزة 2026: الأحياء والأسعار والنصائح',
    excerptEn: 'Discover the best areas to rent a room in Giza, from Dokki and Mohandessin to 6th of October City, with updated prices.',
    excerptAr: 'اكتشف أفضل المناطق لإيجار غرفة في الجيزة، من الدقي والمهندسين لمدينة 6 أكتوبر، مع أسعار محدثة.',
    contentEn: \`## Rooms for Rent in Giza 2026: Neighborhoods, Prices & Tips

Giza is home to millions of Egyptians and hosts major universities like Cairo University, making it one of the busiest rental markets in the country.

### 1. Dokki (الدقي)
**Average rent:** 3,000 - 6,000 EGP/month per room
Dokki is a central area with excellent metro access (Dokki & Bohooth stations). It's popular with Cairo University students and young professionals. The streets are lively with restaurants, cafés, and shops.

### 2. Mohandessin (المهندسين)
**Average rent:** 3,500 - 7,000 EGP/month per room
Adjacent to Dokki, Mohandessin offers slightly more upscale living with famous streets like Shehab and Gameat El Dowal. Good nightlife and dining scene.

### 3. Haram & Faisal (الهرم وفيصل)
**Average rent:** 1,500 - 3,500 EGP/month per room
These are the most affordable areas in Giza. They're densely populated and busy, but offer the lowest rents. Great for students on a tight budget.

### 4. 6th of October City (مدينة 6 أكتوبر)
**Average rent:** 2,500 - 5,000 EGP/month per room
A planned city west of Giza with modern infrastructure. Home to multiple private universities (MSA, October University). More spacious apartments but requires a car or bus commute.

### 5. Sheikh Zayed (الشيخ زايد)
**Average rent:** 4,000 - 8,000 EGP/month per room
An upscale suburb with gated communities and malls like Hyper One and Mall of Arabia. Quieter lifestyle but farther from central Cairo.

### Tips for Renting in Giza
- **Metro access is key** — Dokki and Mohandessin have direct metro lines
- **Check for student deals** — Many landlords near Cairo University offer student-friendly rates
- **Visit during the day** — Some areas feel different at night
- **Use Sakanak** to find verified listings without broker fees
- **Compare prices** — Giza has a huge range from budget to premium\`,
    contentAr: \`## غرف للإيجار في الجيزة 2026: الأحياء والأسعار والنصائح

الجيزة موطن لملايين المصريين وفيها جامعات كبرى زي جامعة القاهرة، مما يخليها من أنشط أسواق الإيجار في البلد.

### 1. الدقي
**متوسط الإيجار:** 3,000 - 6,000 جنيه/شهر لغرفة
الدقي منطقة مركزية مع وصول ممتاز للمترو (محطات الدقي والبحوث). شعبية عند طلاب جامعة القاهرة والشباب. الشوارع مليانة مطاعم وكافيهات ومحلات.

### 2. المهندسين
**متوسط الإيجار:** 3,500 - 7,000 جنيه/شهر لغرفة
جنب الدقي، المهندسين بتقدم سكن أرقى شوية مع شوارع شهيرة زي شهاب وجامعة الدول. فيها حياة ليلية ومطاعم كويسة.

### 3. الهرم وفيصل
**متوسط الإيجار:** 1,500 - 3,500 جنيه/شهر لغرفة
دي أرخص مناطق في الجيزة. مزدحمة بس بتقدم أقل إيجارات. ممتازة للطلاب اللي ميزانيتهم محدودة.

### 4. مدينة 6 أكتوبر
**متوسط الإيجار:** 2,500 - 5,000 جنيه/شهر لغرفة
مدينة مخططة غرب الجيزة مع بنية تحتية حديثة. فيها جامعات خاصة كتير (MSA، جامعة أكتوبر). شقق أوسع بس محتاج عربية أو أتوبيس.

### 5. الشيخ زايد
**متوسط الإيجار:** 4,000 - 8,000 جنيه/شهر لغرفة
منطقة راقية فيها كمبوندات ومولات زي هايبر وان ومول العرب. حياة أهدى بس أبعد عن وسط القاهرة.

### نصائح للإيجار في الجيزة
- **المترو مهم** — الدقي والمهندسين عندهم مترو مباشر
- **دور على عروض طلاب** — ملاك كتير قرب جامعة القاهرة بيقدموا أسعار للطلاب
- **زور بالنهار** — بعض المناطق مختلفة بالليل
- **استخدم سكنك** لإيجاد إعلانات موثقة بدون عمولة
- **قارن الأسعار** — الجيزة فيها تنوع كبير من رخيص لفاخر\`,
    keywords: 'rooms for rent Giza, غرف للايجار في الجيزة, rent Giza 2026, إيجار الجيزة, Dokki rent, الدقي إيجار, Mohandessin rent, المهندسين إيجار, 6th October rent, Haram Faisal rent, الهرم فيصل إيجار',
    publishedAt: '2026-03-08',
    readTimeMin: 5,
    category: 'city',
  },
  {
    slug: 'shared-apartment-living-tips-egypt',
    titleEn: '10 Essential Tips for Shared Apartment Living in Egypt',
    titleAr: '10 نصائح أساسية للسكن المشترك في مصر',
    excerptEn: 'Make your shared apartment experience smooth and conflict-free with these practical tips for Egyptian flatmates.',
    excerptAr: 'اجعل تجربة السكن المشترك سلسة وبدون مشاكل مع النصائح العملية دي لشركاء السكن في مصر.',
    contentEn: \`## 10 Essential Tips for Shared Apartment Living in Egypt

Living with roommates in Egypt is common and affordable, but it requires clear communication and mutual respect. Here are 10 tips to keep the peace.

### 1. Set Ground Rules on Day One
Before moving in, agree on:
- Cleaning schedule and responsibilities
- Guest policies and overnight visitors
- Noise hours (especially during exams!)
- Shared vs. personal food in the fridge

### 2. Split Bills Fairly
Use a shared spreadsheet or app to track:
- Rent (split equally or by room size)
- Electricity and water bills
- Internet subscription
- Shared groceries and cleaning supplies

### 3. Respect Prayer and Study Times
Egypt is a religious country. Be mindful of:
- Prayer times and quiet spaces
- Ramadan fasting hours — avoid loud eating or cooking
- Exam periods — keep noise down

### 4. Handle Kitchen Conflicts Early
The kitchen is the #1 source of roommate conflict. Agree on:
- Who cleans what and when
- Shared cooking vs. individual meals
- How to handle expired or eaten food

### 5. Communicate About Maintenance
When something breaks:
- Report it to the landlord together
- Split repair costs if not covered by deposit
- Don't let small issues build into big problems

### 6. Establish a Cleaning Routine
Create a weekly rotation for:
- Bathroom cleaning
- Kitchen and common areas
- Taking out trash
- Mopping and sweeping

### 7. Be Smart About Security
- Always lock the door when leaving
- Don't share the key with non-residents
- Agree on a policy for lost keys
- Keep valuables in your room

### 8. Plan for Move-Out
Discuss early:
- How much notice is required
- How to find a replacement roommate
- Deposit refund process

### 9. Use Written Agreements
Even among friends, put things in writing:
- Rent amount and due dates
- Deposit terms
- Who's on the lease
- Notice period

### 10. Use Sakanak for Better Matches
Sakanak's matching system helps you find compatible roommates based on lifestyle, budget, and preferences — reducing conflicts from the start.\`,
    contentAr: \`## 10 نصائح أساسية للسكن المشترك في مصر

السكن مع شركاء سكن في مصر شائع ومعقول التكلفة، بس محتاج تواصل واضح واحترام متبادل. هنا 10 نصائح لتحافظ على السلام.

### 1. حط قواعد من أول يوم
قبل ما تنقل، اتفق على:
- جدول النظافة والمسؤوليات
- سياسة الضيوف والمبيت
- ساعات الهدوء (خصوصاً وقت الامتحانات!)
- أكل مشترك ولا شخصي في التلاجة

### 2. قسم الفواتير بعدل
استخدم جدول مشترك لتتبع:
- الإيجار (بالتساوي أو حسب حجم الأوضة)
- فواتير كهرباء ومياه
- اشتراك الإنترنت
- مشتريات مشتركة ومستلزمات نظافة

### 3. احترم أوقات الصلاة والمذاكرة
مصر بلد متدينة. خلي بالك من:
- أوقات الصلاة والأماكن الهادية
- ساعات صيام رمضان — تجنب الأكل بصوت عالي
- فترات الامتحانات — خلي الدوشة أقل

### 4. حل مشاكل المطبخ بدري
المطبخ هو السبب الأول لخلافات شركاء السكن. اتفق على:
- مين بينضف إيه وإمتى
- طبخ مشترك ولا فردي
- إزاي تتعامل مع الأكل اللي خلص أو انتهى

### 5. تواصل عن الصيانة
لما حاجة تبوظ:
- بلغ صاحب الشقة سوا
- قسم تكاليف الإصلاح لو مش مغطاة بالتأمين
- متسيبش المشاكل الصغيرة تكبر

### 6. حط روتين نظافة
اعمل جدول أسبوعي لـ:
- نظافة الحمام
- المطبخ والأماكن المشتركة
- طلع الزبالة
- المسح والكنس

### 7. خلي بالك من الأمان
- دايماً اقفل الباب لما تطلع
- متديش المفتاح لحد من بره
- اتفق على سياسة لو المفتاح ضاع
- خلي حاجاتك الثمينة في أوضتك

### 8. خطط للخروج من الشقة
ناقش بدري:
- كام إشعار مطلوب
- إزاي تلاقي شريك سكن بديل
- عملية استرداد التأمين

### 9. استخدم اتفاقيات مكتوبة
حتى بين الأصحاب، اكتب الحاجات:
- مبلغ الإيجار ومواعيد الدفع
- شروط التأمين
- مين اسمه على العقد
- فترة الإشعار

### 10. استخدم سكنك لتوافق أحسن
نظام التوافق في سكنك بيساعدك تلاقي شركاء سكن متوافقين بناءً على أسلوب الحياة والميزانية والتفضيلات — وده بيقلل الخلافات من البداية.\`,
    keywords: 'shared apartment Egypt, شقة مشاركة مصر, roommate tips, نصائح شريك سكن, flat sharing Egypt, سكن مشترك, living with roommates Egypt, قواعد السكن المشترك',
    publishedAt: '2026-03-06',
    readTimeMin: 6,
    category: 'tips',
  },
  {
    slug: 'tenant-rights-renting-egypt',
    titleEn: 'Know Your Rights: Tenant Rights When Renting in Egypt',
    titleAr: 'اعرف حقوقك: حقوق المستأجر في مصر',
    excerptEn: 'Understanding your legal rights as a tenant in Egypt can protect you from scams and unfair practices.',
    excerptAr: 'فهم حقوقك القانونية كمستأجر في مصر بيحميك من النصب والممارسات غير العادلة.',
    contentEn: \`## Know Your Rights: Tenant Rights When Renting in Egypt

Many tenants in Egypt are unaware of their legal rights, making them vulnerable to exploitation. Here's what you need to know.

### The Rental Contract
In Egypt, a rental agreement should include:
- **Names and IDs** of both landlord and tenant
- **Property address** and description
- **Monthly rent amount** and payment method
- **Contract duration** (usually 1 year renewable)
- **Deposit amount** and return conditions
- **Maintenance responsibilities**

### Your Key Rights as a Tenant

#### 1. Right to a Written Contract
Always insist on a written contract. Verbal agreements are hard to enforce in court. The contract should be registered at the Shahr El Aqari (real estate registry) for maximum protection.

#### 2. Right to Receipt for Payments
You have the right to receive a receipt for every payment — rent, deposit, or utility bills. Keep all receipts as proof.

#### 3. Right to Privacy
Your landlord cannot enter the apartment without your permission, except in emergencies. They must give reasonable notice for inspections or repairs.

#### 4. Right to Habitable Conditions
The landlord must maintain:
- Working plumbing and electricity
- Structural safety
- Pest control if infestation occurs
- Functioning doors and windows

#### 5. Right to Your Deposit Back
Your deposit must be returned when you leave, minus any documented damage beyond normal wear and tear. The landlord cannot keep your deposit without justification.

### Common Scams to Avoid
- 🚩 **No contract** — Never rent without a written agreement
- 🚩 **Deposit theft** — Document the apartment's condition with photos when you move in
- 🚩 **Illegal eviction** — A landlord cannot force you out before the contract ends
- 🚩 **Hidden fees** — All fees should be in the contract
- 🚩 **Fake ownership** — Verify the landlord owns the property

### How Sakanak Protects You
- All users go through ID verification
- In-app booking and communication creates a record
- Viewing booking system ensures accountability
- No hidden broker fees — ever\`,
    contentAr: \`## اعرف حقوقك: حقوق المستأجر في مصر

مستأجرين كتير في مصر مش عارفين حقوقهم القانونية، وده بيخليهم عرضة للاستغلال. هنا اللي محتاج تعرفه.

### عقد الإيجار
في مصر، عقد الإيجار لازم يشمل:
- **أسماء وبطاقات** المالك والمستأجر
- **عنوان العقار** ووصفه
- **مبلغ الإيجار الشهري** وطريقة الدفع
- **مدة العقد** (عادة سنة قابلة للتجديد)
- **مبلغ التأمين** وشروط الاسترداد
- **مسؤوليات الصيانة**

### حقوقك الأساسية كمستأجر

#### 1. الحق في عقد مكتوب
دايماً اصر على عقد مكتوب. الاتفاقات الشفهية صعب تتنفذ في المحكمة. العقد لازم يتسجل في الشهر العقاري لأقصى حماية.

#### 2. الحق في إيصال للمدفوعات
من حقك تاخد إيصال لكل دفعة — إيجار أو تأمين أو فواتير. احتفظ بكل الإيصالات كإثبات.

#### 3. الحق في الخصوصية
صاحب الشقة مش من حقه يدخل الشقة بدون إذنك، إلا في حالات الطوارئ. لازم يديك إشعار معقول للمعاينة أو الإصلاحات.

#### 4. الحق في ظروف سكن مناسبة
المالك لازم يحافظ على:
- سباكة وكهرباء شغالة
- سلامة هيكلية
- مكافحة حشرات لو فيه مشكلة
- أبواب وشبابيك شغالة

#### 5. الحق في استرداد التأمين
التأمين لازم يترجع لما تمشي، ناقص أي تلفيات موثقة فوق الاستهلاك العادي. المالك مش من حقه ياخد التأمين بدون مبرر.

### نصب شائع لازم تتجنبه
- 🚩 **بدون عقد** — متأجرش أبداً بدون اتفاق مكتوب
- 🚩 **سرقة التأمين** — وثق حالة الشقة بصور لما تنقل
- 🚩 **طرد غير قانوني** — المالك مش من حقه يطردك قبل ما العقد ينتهي
- 🚩 **رسوم مخفية** — كل الرسوم لازم تكون في العقد
- 🚩 **ملكية مزيفة** — تأكد إن المالك فعلاً بيملك العقار

### إزاي سكنك بتحميك
- كل المستخدمين بيتحققوا من هويتهم
- الحجز والتواصل داخل التطبيق بيعمل سجل
- نظام حجز المعاينات بيضمن المسؤولية
- مفيش عمولة سمسار مخفية — أبداً\`,
    keywords: 'tenant rights Egypt, حقوق المستأجر في مصر, rental contract Egypt, عقد إيجار مصر, renting scams Egypt, نصب الإيجار, landlord tenant law Egypt, قانون المالك والمستأجر',
    publishedAt: '2026-03-04',
    readTimeMin: 6,
    category: 'guides',
  },
  {
    slug: 'cost-of-living-comparison-egyptian-cities',
    titleEn: 'Cost of Living & Rent Comparison: Cairo vs Alexandria vs Mansoura',
    titleAr: 'مقارنة تكاليف المعيشة والإيجار: القاهرة vs الاسكندرية vs المنصورة',
    excerptEn: 'Compare rent, food, transport and total monthly costs across Egypt\\'s top 3 cities for room seekers.',
    excerptAr: 'قارن الإيجار والأكل والمواصلات والتكاليف الشهرية في أكبر 3 مدن في مصر للباحثين عن سكن.',
    contentEn: \`## Cost of Living & Rent Comparison: Cairo vs Alexandria vs Mansoura

Choosing where to live in Egypt often comes down to budget. Here's a detailed cost comparison across the three most popular cities for room seekers.

### Rent Comparison (per room, shared apartment)

| Category | Cairo | Alexandria | Mansoura |
|----------|-------|------------|----------|
| Budget area | 2,000-4,000 EGP | 1,500-3,000 EGP | 1,200-2,500 EGP |
| Mid-range area | 4,000-7,000 EGP | 3,000-5,000 EGP | 2,000-3,500 EGP |
| Premium area | 7,000-12,000 EGP | 5,000-8,000 EGP | 3,000-5,000 EGP |

### Monthly Expenses Breakdown

#### Food & Groceries
- **Cairo:** 3,000-5,000 EGP/month
- **Alexandria:** 2,500-4,000 EGP/month
- **Mansoura:** 2,000-3,500 EGP/month

#### Transportation
- **Cairo:** 800-2,000 EGP/month (metro + Uber)
- **Alexandria:** 500-1,200 EGP/month (tram + minibus)
- **Mansoura:** 300-800 EGP/month (mostly walkable + tuk-tuk)

#### Utilities (shared)
- **Cairo:** 300-600 EGP/person
- **Alexandria:** 250-500 EGP/person
- **Mansoura:** 200-400 EGP/person

#### Internet
- All cities: 200-400 EGP/month (split between roommates)

### Total Monthly Budget (per person)

| Level | Cairo | Alexandria | Mansoura |
|-------|-------|------------|----------|
| Student/Budget | 6,000-9,000 EGP | 4,500-7,000 EGP | 3,500-5,500 EGP |
| Comfortable | 9,000-15,000 EGP | 7,000-11,000 EGP | 5,500-8,000 EGP |
| Premium | 15,000+ EGP | 11,000+ EGP | 8,000+ EGP |

### Which City is Right for You?

**Choose Cairo if:**
- You work in a corporate or tech job
- You want the most options for entertainment and dining
- You don't mind traffic and crowds

**Choose Alexandria if:**
- You want a more relaxed lifestyle by the sea
- You're studying at Alexandria University or Arab Academy
- You want lower costs than Cairo with good amenities

**Choose Mansoura if:**
- You're a student at Mansoura University
- Budget is your top priority
- You prefer a smaller, community-oriented city

### Save Money Everywhere with Sakanak
No matter which city you choose, use Sakanak to:
- Find rooms directly from verified owners — no broker fees
- Compare prices across neighborhoods
- Match with compatible roommates to split costs\`,
    contentAr: \`## مقارنة تكاليف المعيشة والإيجار: القاهرة vs الاسكندرية vs المنصورة

اختيار مكان السكن في مصر غالباً بيرجع للميزانية. هنا مقارنة تفصيلية للتكاليف في أشهر 3 مدن للباحثين عن سكن.

### مقارنة الإيجارات (لغرفة في شقة مشاركة)

| الفئة | القاهرة | الاسكندرية | المنصورة |
|-------|---------|------------|----------|
| منطقة اقتصادية | 2,000-4,000 جنيه | 1,500-3,000 جنيه | 1,200-2,500 جنيه |
| منطقة متوسطة | 4,000-7,000 جنيه | 3,000-5,000 جنيه | 2,000-3,500 جنيه |
| منطقة راقية | 7,000-12,000 جنيه | 5,000-8,000 جنيه | 3,000-5,000 جنيه |

### تفصيل المصاريف الشهرية

#### الأكل والبقالة
- **القاهرة:** 3,000-5,000 جنيه/شهر
- **الاسكندرية:** 2,500-4,000 جنيه/شهر
- **المنصورة:** 2,000-3,500 جنيه/شهر

#### المواصلات
- **القاهرة:** 800-2,000 جنيه/شهر (مترو + أوبر)
- **الاسكندرية:** 500-1,200 جنيه/شهر (ترام + ميكروباص)
- **المنصورة:** 300-800 جنيه/شهر (معظمها مشي + توك توك)

#### الفواتير (مشتركة)
- **القاهرة:** 300-600 جنيه/فرد
- **الاسكندرية:** 250-500 جنيه/فرد
- **المنصورة:** 200-400 جنيه/فرد

#### الإنترنت
- كل المدن: 200-400 جنيه/شهر (مقسمة على شركاء السكن)

### إجمالي الميزانية الشهرية (للفرد)

| المستوى | القاهرة | الاسكندرية | المنصورة |
|---------|---------|------------|----------|
| طالب/اقتصادي | 6,000-9,000 جنيه | 4,500-7,000 جنيه | 3,500-5,500 جنيه |
| مريح | 9,000-15,000 جنيه | 7,000-11,000 جنيه | 5,500-8,000 جنيه |
| فاخر | 15,000+ جنيه | 11,000+ جنيه | 8,000+ جنيه |

### أي مدينة مناسبة ليك؟

**اختار القاهرة لو:**
- بتشتغل في شركة أو تكنولوجيا
- عايز أكتر خيارات للترفيه والأكل
- متضايقش من الزحمة

**اختار الاسكندرية لو:**
- عايز حياة أهدى على البحر
- بتدرس في جامعة الاسكندرية أو الأكاديمية العربية
- عايز تكاليف أقل من القاهرة مع خدمات كويسة

**اختار المنصورة لو:**
- طالب في جامعة المنصورة
- الميزانية أهم أولوياتك
- بتفضل مدينة أصغر ومجتمعية

### وفر فلوس في أي مكان مع سكنك
مهما اخترت أي مدينة، استخدم سكنك عشان:
- تلاقي غرف مباشرة من ملاك موثقين — بدون عمولة
- تقارن الأسعار في الأحياء المختلفة
- تتوافق مع شركاء سكن لتقسيم التكاليف\`,
    keywords: 'cost of living Egypt, تكاليف المعيشة مصر, rent comparison Cairo Alexandria, مقارنة إيجار القاهرة الاسكندرية, cheapest cities Egypt, أرخص مدن مصر, Mansoura rent, المنصورة إيجار, budget living Egypt, سكن اقتصادي مصر',
    publishedAt: '2026-03-02',
    readTimeMin: 7,
    category: 'guides',
  },
  {
    slug: 'new-cairo-fifth-settlement-rooms-guide',
    titleEn: 'Rooms for Rent in New Cairo & Fifth Settlement: 2026 Guide',
    titleAr: 'غرف للإيجار في القاهرة الجديدة والتجمع الخامس: دليل 2026',
    excerptEn: 'Find affordable rooms and shared apartments near AUC, the German University, and top compounds in New Cairo.',
    excerptAr: 'لاقي غرف بأسعار معقولة وشقق مشاركة بالقرب من الجامعة الأمريكية والجامعة الألمانية وأفضل الكمبوندات في القاهرة الجديدة.',
    contentEn: \`## Rooms for Rent in New Cairo & Fifth Settlement: 2026 Guide

New Cairo has become one of Egypt's most desirable residential areas, especially for students and young professionals. Here's everything you need to know.

### Why New Cairo?
- Home to AUC (American University in Cairo) and GUC (German University in Cairo)
- Modern infrastructure with wide roads and green spaces
- Major malls: Cairo Festival City, Point 90, Downtown Katameya
- Growing job market with many companies relocating here

### Best Neighborhoods for Renting

#### Fifth Settlement (التجمع الخامس)
**Average rent:** 4,000 - 8,000 EGP/month per room
The heart of New Cairo with excellent amenities. Close to AUC and most services. Mix of standalone buildings and gated compounds.

#### Rehab City (مدينة الرحاب)
**Average rent:** 3,500 - 6,000 EGP/month per room
A self-contained community with its own mall, schools, and clinics. Great for a quieter lifestyle. Regular bus service to downtown.

#### Madinaty (مدينتي)
**Average rent:** 3,000 - 5,500 EGP/month per room
Egypt's largest residential compound. Very green and family-friendly. Farther from central Cairo but has everything you need within.

#### Beit Al Watan (بيت الوطن)
**Average rent:** 3,000 - 5,000 EGP/month per room
Newer area with competitive prices. Still developing but growing rapidly. Good option for budget-conscious renters.

#### Shorouk City (مدينة الشروق)
**Average rent:** 2,500 - 4,500 EGP/month per room
Adjacent to New Cairo with lower prices. Popular with students at nearby universities. More affordable alternative.

### Transportation Tips
- **No metro access yet** — New Cairo relies on buses and cars
- **CTA buses** connect New Cairo to central Cairo
- **Uber/Careem** are widely available but can be expensive for daily commutes
- **University shuttles** — AUC and GUC offer student transportation
- **Carpooling** with roommates is common and cost-effective

### For Students
If you're studying at AUC or GUC:
1. Check areas within a 15-minute drive of your campus
2. Look for furnished rooms (common in student-heavy areas)
3. Share with fellow students — 3-4 person apartments are cheapest
4. Use Sakanak's student filter for student-friendly listings

### Tips for New Cairo Renters
- **Check water pressure** — Some newer buildings have issues
- **Verify compound rules** — Some don't allow sharing
- **Internet coverage** — Check signal strength before committing
- **Parking** — Essential in New Cairo, check availability
- **Use Sakanak** for verified, broker-free listings in New Cairo\`,
    contentAr: \`## غرف للإيجار في القاهرة الجديدة والتجمع الخامس: دليل 2026

القاهرة الجديدة بقت واحدة من أكثر المناطق السكنية المرغوبة في مصر، خصوصاً للطلاب والشباب. هنا كل ما تحتاج تعرفه.

### ليه القاهرة الجديدة؟
- فيها الجامعة الأمريكية (AUC) والجامعة الألمانية (GUC)
- بنية تحتية حديثة مع شوارع واسعة ومساحات خضراء
- مولات كبيرة: كايرو فستيفال سيتي، بوينت 90، داون تاون قطامية
- سوق عمل بيكبر مع شركات كتير بتنقل هناك

### أفضل الأحياء للإيجار

#### التجمع الخامس
**متوسط الإيجار:** 4,000 - 8,000 جنيه/شهر لغرفة
قلب القاهرة الجديدة مع خدمات ممتازة. قريب من الجامعة الأمريكية ومعظم الخدمات. مزيج من عمارات مستقلة وكمبوندات.

#### مدينة الرحاب
**متوسط الإيجار:** 3,500 - 6,000 جنيه/شهر لغرفة
مجتمع مكتفي ذاتياً فيه مول ومدارس وعيادات خاصة. ممتاز لحياة أهدى. فيه أتوبيسات منتظمة لوسط البلد.

#### مدينتي
**متوسط الإيجار:** 3,000 - 5,500 جنيه/شهر لغرفة
أكبر كمبوند سكني في مصر. أخضر جداً ومناسب للعائلات. أبعد عن وسط القاهرة بس فيه كل حاجة.

#### بيت الوطن
**متوسط الإيجار:** 3,000 - 5,000 جنيه/شهر لغرفة
منطقة جديدة بأسعار تنافسية. لسه بتتطور بس بتكبر بسرعة. خيار كويس للي ميزانيته محدودة.

#### مدينة الشروق
**متوسط الإيجار:** 2,500 - 4,500 جنيه/شهر لغرفة
جنب القاهرة الجديدة بأسعار أقل. شعبية عند الطلاب. بديل أرخص.

### نصائح المواصلات
- **مفيش مترو لسه** — القاهرة الجديدة بتعتمد على الأتوبيسات والعربيات
- **أتوبيسات CTA** بتوصل القاهرة الجديدة بوسط القاهرة
- **أوبر/كريم** متوفرين بس ممكن يكونوا غاليين يومياً
- **أتوبيسات الجامعة** — الأمريكية والألمانية بيوفروا نقل للطلاب
- **المشاركة في التوصيل** مع شركاء السكن شائعة وموفرة

### للطلاب
لو بتدرس في الأمريكية أو الألمانية:
1. دور على مناطق في نطاق 15 دقيقة من الكلية
2. دور على غرف مفروشة (شائعة في المناطق الطلابية)
3. شارك مع زملاء — شقق 3-4 أشخاص أرخص
4. استخدم فلتر الطلاب في سكنك

### نصائح لمستأجري القاهرة الجديدة
- **تأكد من ضغط المياه** — بعض العمارات الجديدة فيها مشاكل
- **تحقق من قوانين الكمبوند** — بعضها مش بيسمح بالمشاركة
- **تغطية الإنترنت** — تأكد من قوة الشبكة قبل ما تلتزم
- **الباركينج** — أساسي في القاهرة الجديدة، تأكد من توفره
- **استخدم سكنك** لإعلانات موثقة بدون سمسار في القاهرة الجديدة\`,
    keywords: 'rooms New Cairo, غرف للايجار القاهرة الجديدة, Fifth Settlement rent, التجمع الخامس إيجار, AUC housing, سكن الجامعة الأمريكية, Rehab City rent, الرحاب إيجار, Madinaty rent, مدينتي إيجار, student housing New Cairo, سكن طلاب القاهرة الجديدة',
    publishedAt: '2026-03-07',
    readTimeMin: 7,
    category: 'city',
  },
];
