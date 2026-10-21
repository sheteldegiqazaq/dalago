import { randomUUID } from 'node:crypto';
import type {
  CompanyType,
  OfferStatus,
  RequestStatus,
  Unit,
} from '@generated/prisma/client';
import { ScryptPasswordHasher } from '../../../modules/accounts/gateways/scrypt-password-hasher';
import { buildSearchText } from '../../../modules/products/services/search-terms';
import type { PrismaService } from '../prisma.service';

type SeedDatabaseOptions = {
  adminEmail: string;
  adminName: string;
};

/** Пароль всех аккаунтов-примеров. Примеры данных создаются только сидом и помечены isSample. */
export const SAMPLE_PASSWORD = 'dalago12345';
// Зарезервированный домен .example (RFC 2606): адреса заведомо не принадлежат реальным людям.
export const SAMPLE_EMAIL_DOMAIN = 'dalago.example';

const REGIONS = [
  {
    id: 'abai',
    nameRu: 'Абайская область',
    nameKk: 'Абай облысы',
    isActive: true,
    sortOrder: 0,
  },
  {
    id: 'east-kazakhstan',
    nameRu: 'Восточно-Казахстанская область',
    nameKk: 'Шығыс Қазақстан облысы',
    isActive: false,
    sortOrder: 1,
  },
  {
    id: 'pavlodar',
    nameRu: 'Павлодарская область',
    nameKk: 'Павлодар облысы',
    isActive: false,
    sortOrder: 2,
  },
  {
    id: 'zhetysu',
    nameRu: 'Область Жетісу',
    nameKk: 'Жетісу облысы',
    isActive: false,
    sortOrder: 3,
  },
];

// Координаты — приблизительные центры населённых пунктов (общедоступная география), не адреса компаний.
const CITIES = [
  {
    id: 'semey',
    nameRu: 'Семей',
    nameKk: 'Семей',
    latitude: 50.411,
    longitude: 80.227,
  },
  {
    id: 'kurchatov',
    nameRu: 'Курчатов',
    nameKk: 'Курчатов',
    latitude: 50.756,
    longitude: 78.542,
  },
  {
    id: 'ayagoz',
    nameRu: 'Аягоз',
    nameKk: 'Аягөз',
    latitude: 47.965,
    longitude: 80.439,
  },
  {
    id: 'urzhar',
    nameRu: 'Урджар',
    nameKk: 'Үржар',
    latitude: 47.093,
    longitude: 81.633,
  },
  {
    id: 'makanchi',
    nameRu: 'Маканчи',
    nameKk: 'Мақаншы',
    latitude: 46.806,
    longitude: 82.003,
  },
  {
    id: 'kokpekty',
    nameRu: 'Кокпекты',
    nameKk: 'Көкпекті',
    latitude: 48.757,
    longitude: 82.371,
  },
  {
    id: 'karaul',
    nameRu: 'Караул',
    nameKk: 'Қарауыл',
    latitude: 48.945,
    longitude: 79.255,
  },
  {
    id: 'borodulikha',
    nameRu: 'Бородулиха',
    nameKk: 'Бородулиха',
    latitude: 50.718,
    longitude: 80.935,
  },
  {
    id: 'beskaragay',
    nameRu: 'Бескарагай',
    nameKk: 'Бесқарағай',
    latitude: 50.892,
    longitude: 79.464,
  },
  {
    id: 'kalbatau',
    nameRu: 'Калбатау',
    nameKk: 'Қалбатау',
    latitude: 49.333,
    longitude: 81.578,
  },
  {
    id: 'aksuat',
    nameRu: 'Аксуат',
    nameKk: 'Ақсуат',
    latitude: 47.76,
    longitude: 82.808,
  },
];

const CATEGORIES = [
  { slug: 'vegetables', nameRu: 'Овощи', nameKk: 'Көкөністер', icon: 'carrot' },
  {
    slug: 'fruits',
    nameRu: 'Фрукты и ягоды',
    nameKk: 'Жемістер мен жидектер',
    icon: 'apple',
  },
  { slug: 'meat', nameRu: 'Мясо', nameKk: 'Ет', icon: 'beef' },
  {
    slug: 'dairy',
    nameRu: 'Молочная продукция',
    nameKk: 'Сүт өнімдері',
    icon: 'milk',
  },
  {
    slug: 'grain',
    nameRu: 'Зерно и мука',
    nameKk: 'Астық және ұн',
    icon: 'wheat',
  },
  { slug: 'honey', nameRu: 'Мёд', nameKk: 'Бал', icon: 'honey' },
  { slug: 'eggs', nameRu: 'Яйца', nameKk: 'Жұмыртқа', icon: 'egg' },
  { slug: 'other', nameRu: 'Другое', nameKk: 'Басқа', icon: 'package' },
];

type SampleCompany = {
  key: string;
  email: string;
  userName: string;
  role: 'BUYER' | 'SUPPLIER';
  name: string;
  type: CompanyType;
  cityId: string;
  phone: string;
  description: string;
};

// Все компании вымышленные. Телефоны с кодом +7 000 не существуют.
const COMPANIES: SampleCompany[] = [
  {
    key: 'farm',
    email: `supplier@${SAMPLE_EMAIL_DOMAIN}`,
    userName: 'Ерлан',
    role: 'SUPPLIER',
    name: 'КХ «Ертіс бақшасы»',
    type: 'FARM',
    cityId: 'semey',
    phone: '+7 000 000 00 01',
    description:
      'Крестьянское хозяйство: картофель и овощи открытого грунта у Иртыша. Своя доставка по Семею.',
  },
  {
    key: 'grain',
    email: `grain@${SAMPLE_EMAIL_DOMAIN}`,
    userName: 'Нұрлан',
    role: 'SUPPLIER',
    name: 'ТОО «Бородулиха астығы»',
    type: 'FARM',
    cityId: 'borodulikha',
    phone: '+7 000 000 00 02',
    description:
      'Зерновое хозяйство: пшеница, ячмень и мука собственного помола.',
  },
  {
    key: 'dairy',
    email: `dairy@${SAMPLE_EMAIL_DOMAIN}`,
    userName: 'Гүлнар',
    role: 'SUPPLIER',
    name: '«Шұбартау сүті»',
    type: 'PRODUCER',
    cityId: 'ayagoz',
    phone: '+7 000 000 00 03',
    description: 'Молочный цех: молоко, сметана, курт и кумыс.',
  },
  {
    key: 'honey',
    email: `honey@${SAMPLE_EMAIL_DOMAIN}`,
    userName: 'Бақыт',
    role: 'SUPPLIER',
    name: 'Пасека «Тарбағатай балы»',
    type: 'PRODUCER',
    cityId: 'urzhar',
    phone: '+7 000 000 00 04',
    description: 'Пасека у подножия Тарбагатая.',
  },
  {
    key: 'meat',
    email: `meat@${SAMPLE_EMAIL_DOMAIN}`,
    userName: 'Асхат',
    role: 'SUPPLIER',
    name: 'ТОО «Семей ет өнімдері»',
    type: 'PROCESSOR',
    cityId: 'semey',
    phone: '+7 000 000 00 05',
    description:
      'Мясной цех: охлаждённая говядина, баранина и конина для HoReCa.',
  },
  {
    key: 'orchard',
    email: `orchard@${SAMPLE_EMAIL_DOMAIN}`,
    userName: 'Айгүл',
    role: 'SUPPLIER',
    name: 'КХ «Үржар бау-бақшасы»',
    type: 'FARM',
    cityId: 'urzhar',
    phone: '+7 000 000 00 06',
    description: 'Сад: яблоки, облепиха и картофель.',
  },
  {
    key: 'eggs',
    email: `eggs@${SAMPLE_EMAIL_DOMAIN}`,
    userName: 'Марат',
    role: 'SUPPLIER',
    name: '«Көкпекті құс»',
    type: 'PRODUCER',
    cityId: 'kokpekty',
    phone: '+7 000 000 00 07',
    description: 'Птицеферма: куриное яйцо категории С1.',
  },
  {
    key: 'cafe',
    email: `buyer@${SAMPLE_EMAIL_DOMAIN}`,
    userName: 'Динара',
    role: 'BUYER',
    name: 'Кафе «Ақ дастархан»',
    type: 'CAFE',
    cityId: 'semey',
    phone: '+7 000 000 00 11',
    description: 'Кафе национальной кухни в Семее.',
  },
  {
    key: 'shop',
    email: `shop@${SAMPLE_EMAIL_DOMAIN}`,
    userName: 'Серік',
    role: 'BUYER',
    name: 'Магазин «Береке»',
    type: 'SHOP',
    cityId: 'semey',
    phone: '+7 000 000 00 12',
    description: 'Продуктовый магазин у дома.',
  },
  {
    key: 'canteen',
    email: `canteen@${SAMPLE_EMAIL_DOMAIN}`,
    userName: 'Жанна',
    role: 'BUYER',
    name: 'Столовая «Курчатов асханасы»',
    type: 'CANTEEN',
    cityId: 'kurchatov',
    phone: '+7 000 000 00 13',
    description: 'Столовая для работников предприятий.',
  },
];

type SampleProduct = {
  key: string;
  supplier: string;
  category: string;
  title: string;
  titleKk: string;
  description: string;
  descriptionKk: string;
  price: number;
  unit: Unit;
  availableQty: number;
  minOrderQty: number;
  delivery: boolean;
  pickup?: boolean;
  tags: string[];
  inactive?: boolean;
  daysAgo: number;
};

// Цены и объёмы — иллюстративные, не рыночные котировки.
const PRODUCTS: SampleProduct[] = [
  {
    key: 'potato',
    supplier: 'farm',
    category: 'vegetables',
    title: 'Картофель «Гала», урожай 2026',
    titleKk: '«Гала» картобы, 2026 жылғы өнім',
    description:
      'Отборный продовольственный картофель, калибр 5+ см, мешки по 30 кг. Хранится в овощехранилище.',
    descriptionKk:
      'Іріктелген азықтық картоп, көлемі 5+ см, 30 кг-дан қапталған. Көкөніс қоймасында сақталады.',
    price: 140,
    unit: 'KG',
    availableQty: 8000,
    minOrderQty: 200,
    delivery: true,
    tags: ['картошка', 'картофель', 'картоп', 'гала'],
    daysAgo: 2,
  },
  {
    key: 'carrot',
    supplier: 'farm',
    category: 'vegetables',
    title: 'Морковь мытая',
    titleKk: 'Жуылған сәбіз',
    description: 'Морковь сорта «Абако», мытая, в сетках по 20 кг.',
    descriptionKk: '«Абако» сұрыпты сәбіз, жуылған, 20 кг-дық торларда.',
    price: 160,
    unit: 'KG',
    availableQty: 3000,
    minOrderQty: 100,
    delivery: true,
    tags: ['морковь', 'сәбіз'],
    daysAgo: 3,
  },
  {
    key: 'onion',
    supplier: 'farm',
    category: 'vegetables',
    title: 'Лук репчатый',
    titleKk: 'Пияз',
    description: 'Лук репчатый жёлтый, сухой, сетки по 25 кг.',
    descriptionKk: 'Сары пияз, құрғақ, 25 кг-дық торларда.',
    price: 120,
    unit: 'KG',
    availableQty: 4000,
    minOrderQty: 200,
    delivery: true,
    tags: ['лук', 'пияз'],
    daysAgo: 5,
  },
  {
    key: 'cabbage',
    supplier: 'farm',
    category: 'vegetables',
    title: 'Капуста белокочанная',
    titleKk: 'Ақ қауданды қырыққабат',
    description: 'Плотные кочаны 2–4 кг, подходит для засолки и столовых.',
    descriptionKk: 'Тығыз қауданды 2–4 кг, тұздауға және асханаларға жарамды.',
    price: 110,
    unit: 'KG',
    availableQty: 2500,
    minOrderQty: 100,
    delivery: true,
    tags: ['капуста', 'қырыққабат'],
    daysAgo: 6,
  },
  {
    key: 'beet',
    supplier: 'farm',
    category: 'vegetables',
    title: 'Свёкла столовая',
    titleKk: 'Асханалық қызылша',
    description: 'Свёкла столовая. Временно снята с продажи до новой партии.',
    descriptionKk:
      'Асханалық қызылша. Жаңа партияға дейін сатылымнан уақытша алынды.',
    price: 130,
    unit: 'KG',
    availableQty: 0,
    minOrderQty: 100,
    delivery: true,
    tags: ['свекла', 'қызылша'],
    inactive: true,
    daysAgo: 20,
  },
  {
    key: 'wheat',
    supplier: 'grain',
    category: 'grain',
    title: 'Пшеница 3 класса',
    titleKk: '3-сыныпты бидай',
    description:
      'Пшеница мягкая яровая 3 класса, клейковина 23–25%. Отгрузка со склада, самовывоз.',
    descriptionKk:
      '3-сыныпты жұмсақ жаздық бидай, желімшесі 23–25%. Қоймадан жөнелту, өзі алып кету.',
    price: 95000,
    unit: 'T',
    availableQty: 120,
    minOrderQty: 5,
    delivery: false,
    tags: ['пшеница', 'бидай', 'зерно'],
    daysAgo: 4,
  },
  {
    key: 'barley',
    supplier: 'grain',
    category: 'grain',
    title: 'Ячмень фуражный',
    titleKk: 'Жемдік арпа',
    description: 'Ячмень фуражный для животноводства, влажность до 14%.',
    descriptionKk:
      'Мал шаруашылығына арналған жемдік арпа, ылғалдылығы 14%-ға дейін.',
    price: 78000,
    unit: 'T',
    availableQty: 60,
    minOrderQty: 5,
    delivery: false,
    tags: ['ячмень', 'арпа', 'фураж'],
    daysAgo: 8,
  },
  {
    key: 'flour',
    supplier: 'grain',
    category: 'grain',
    title: 'Мука пшеничная первого сорта',
    titleKk: 'Бірінші сұрыпты бидай ұны',
    description:
      'Мука собственного помола, мешки по 50 кг. Доставка по области от 500 кг.',
    descriptionKk:
      'Өз диірменімізде тартылған ұн, 50 кг-дық қаптарда. Облыс бойынша 500 кг-нан бастап жеткізу.',
    price: 260,
    unit: 'KG',
    availableQty: 10000,
    minOrderQty: 500,
    delivery: true,
    tags: ['мука', 'ұн'],
    daysAgo: 1,
  },
  {
    key: 'milk',
    supplier: 'dairy',
    category: 'dairy',
    title: 'Молоко коровье 3,2%',
    titleKk: 'Сиыр сүті 3,2%',
    description:
      'Пастеризованное молоко, фляги и бутылки по 1 л. Поставка 2 раза в неделю.',
    descriptionKk:
      'Пастерленген сүт, бидондар мен 1 литрлік бөтелкелер. Аптасына 2 рет жеткізу.',
    price: 280,
    unit: 'L',
    availableQty: 1500,
    minOrderQty: 50,
    delivery: true,
    tags: ['молоко', 'сүт'],
    daysAgo: 1,
  },
  {
    key: 'sour-cream',
    supplier: 'dairy',
    category: 'dairy',
    title: 'Сметана 20%',
    titleKk: 'Қаймақ 20%',
    description: 'Сметана 20% в вёдрах по 5 кг.',
    descriptionKk: '5 кг-дық шелектегі 20% қаймақ.',
    price: 1400,
    unit: 'KG',
    availableQty: 200,
    minOrderQty: 10,
    delivery: true,
    tags: ['сметана', 'қаймақ'],
    daysAgo: 7,
  },
  {
    key: 'kurt',
    supplier: 'dairy',
    category: 'dairy',
    title: 'Курт домашний',
    titleKk: 'Үй құрты',
    description: 'Курт солёный, сушёный на солнце, фасовка по 1 кг.',
    descriptionKk: 'Күнге кептірілген тұзды құрт, 1 кг-нан оралған.',
    price: 4500,
    unit: 'KG',
    availableQty: 150,
    minOrderQty: 5,
    delivery: false,
    tags: ['курт', 'құрт'],
    daysAgo: 12,
  },
  {
    key: 'kumys',
    supplier: 'dairy',
    category: 'dairy',
    title: 'Кумыс',
    titleKk: 'Қымыз',
    description: 'Кумыс из кобыльего молока, бутылки по 1,5 л. Сезонный товар.',
    descriptionKk:
      'Бие сүтінен жасалған қымыз, 1,5 литрлік бөтелкелер. Маусымдық өнім.',
    price: 1200,
    unit: 'L',
    availableQty: 300,
    minOrderQty: 20,
    delivery: true,
    tags: ['кумыс', 'қымыз'],
    daysAgo: 9,
  },
  {
    key: 'honey-mountain',
    supplier: 'honey',
    category: 'honey',
    title: 'Мёд горный разнотравье',
    titleKk: 'Таулы шөп балы',
    description: 'Мёд с горных лугов Тарбагатая, банки 1 кг и фляги 20 кг.',
    descriptionKk:
      'Тарбағатайдың таулы шабындықтарынан жиналған бал, 1 кг банкалар және 20 кг бидондар.',
    price: 3500,
    unit: 'KG',
    availableQty: 800,
    minOrderQty: 10,
    delivery: true,
    tags: ['мед', 'мёд', 'бал'],
    daysAgo: 3,
  },
  {
    key: 'honey-clover',
    supplier: 'honey',
    category: 'honey',
    title: 'Мёд донниковый',
    titleKk: 'Түйежоңышқа балы',
    description: 'Светлый донниковый мёд, фляги по 20 кг.',
    descriptionKk: 'Ашық түсті түйежоңышқа балы, 20 кг-дық бидондар.',
    price: 3200,
    unit: 'KG',
    availableQty: 400,
    minOrderQty: 10,
    delivery: false,
    tags: ['мед', 'мёд', 'бал'],
    daysAgo: 15,
  },
  {
    key: 'beef',
    supplier: 'meat',
    category: 'meat',
    title: 'Говядина охлаждённая',
    titleKk: 'Салқындатылған сиыр еті',
    description:
      'Говядина охлаждённая, четвертины и разделка под заказ. Ветеринарные документы на каждую партию.',
    descriptionKk:
      'Салқындатылған сиыр еті, ширек ұша және тапсырыс бойынша бөлшектеу. Әр партияға ветеринарлық құжаттар.',
    price: 3300,
    unit: 'KG',
    availableQty: 1200,
    minOrderQty: 20,
    delivery: true,
    tags: ['говядина', 'сиыр еті', 'мясо'],
    daysAgo: 1,
  },
  {
    key: 'lamb',
    supplier: 'meat',
    category: 'meat',
    title: 'Баранина охлаждённая',
    titleKk: 'Салқындатылған қой еті',
    description: 'Баранина охлаждённая, туши 15–20 кг.',
    descriptionKk: 'Салқындатылған қой еті, ұшалары 15–20 кг.',
    price: 3600,
    unit: 'KG',
    availableQty: 600,
    minOrderQty: 20,
    delivery: true,
    tags: ['баранина', 'қой еті', 'мясо'],
    daysAgo: 2,
  },
  {
    key: 'horse',
    supplier: 'meat',
    category: 'meat',
    title: 'Конина',
    titleKk: 'Жылқы еті',
    description: 'Конина охлаждённая, подходит для казы и бешбармака.',
    descriptionKk: 'Салқындатылған жылқы еті, қазы мен бешбармаққа жарамды.',
    price: 3400,
    unit: 'KG',
    availableQty: 400,
    minOrderQty: 20,
    delivery: true,
    tags: ['конина', 'жылқы еті', 'мясо'],
    daysAgo: 4,
  },
  {
    key: 'apple',
    supplier: 'orchard',
    category: 'fruits',
    title: 'Яблоки «Апорт»',
    titleKk: '«Апорт» алмасы',
    description: 'Яблоки сорта «Апорт», ящики по 18 кг.',
    descriptionKk: '«Апорт» сұрыпты алма, 18 кг-дық жәшіктерде.',
    price: 450,
    unit: 'KG',
    availableQty: 5000,
    minOrderQty: 100,
    delivery: true,
    tags: ['яблоки', 'алма', 'апорт'],
    daysAgo: 2,
  },
  {
    key: 'sea-buckthorn',
    supplier: 'orchard',
    category: 'fruits',
    title: 'Облепиха замороженная',
    titleKk: 'Мұздатылған шырғанақ',
    description: 'Облепиха шоковой заморозки, пакеты по 5 кг.',
    descriptionKk: 'Тез мұздатылған шырғанақ, 5 кг-дық пакеттер.',
    price: 1800,
    unit: 'KG',
    availableQty: 300,
    minOrderQty: 10,
    delivery: false,
    tags: ['облепиха', 'шырғанақ', 'ягоды'],
    daysAgo: 10,
  },
  {
    key: 'potato-orchard',
    supplier: 'orchard',
    category: 'vegetables',
    title: 'Картофель продовольственный',
    titleKk: 'Азықтық картоп',
    description:
      'Картофель сорта «Невский», навалом или в мешках. Только самовывоз из Урджара.',
    descriptionKk:
      '«Невский» сұрыпты картоп, үйінді немесе қаппен. Тек Үржардан өзі алып кету.',
    price: 150,
    unit: 'KG',
    availableQty: 3000,
    minOrderQty: 500,
    delivery: false,
    tags: ['картошка', 'картофель', 'картоп'],
    daysAgo: 5,
  },
  {
    key: 'eggs',
    supplier: 'eggs',
    category: 'eggs',
    title: 'Яйцо куриное С1',
    titleKk: 'С1 санатты тауық жұмыртқасы',
    description: 'Яйцо куриное столовое С1, коробки по 360 шт.',
    descriptionKk:
      'С1 санатты асханалық тауық жұмыртқасы, 360 данадан қорапта.',
    price: 55,
    unit: 'PCS',
    availableQty: 20000,
    minOrderQty: 360,
    delivery: true,
    tags: ['яйца', 'жұмыртқа'],
    daysAgo: 3,
  },
];

type SampleOffer = {
  supplier: string;
  product?: string;
  quantity: number;
  price: number;
  deliveryCost?: number;
  inDays: number;
  terms: string;
  status: OfferStatus;
};

type SampleRequest = {
  buyer: string;
  category: string;
  title: string;
  description: string;
  quantity: number;
  unit: Unit;
  targetPrice?: number;
  cityId: string;
  inDays: number;
  status: RequestStatus;
  daysAgo: number;
  offers: SampleOffer[];
};

const REQUESTS: SampleRequest[] = [
  {
    buyer: 'cafe',
    category: 'vegetables',
    title: 'Картофель для кухни кафе, 300 кг',
    description:
      'Нужен чистый картофель среднего калибра, поставка в Семей, ул. Примерная, 1.',
    quantity: 300,
    unit: 'KG',
    targetPrice: 145,
    cityId: 'semey',
    inDays: 6,
    status: 'OFFERS_RECEIVED',
    daysAgo: 1,
    offers: [
      {
        supplier: 'farm',
        product: 'potato',
        quantity: 300,
        price: 140,
        deliveryCost: 3000,
        inDays: 3,
        terms: 'Доставка своим транспортом, оплата по факту.',
        status: 'PENDING',
      },
      {
        supplier: 'orchard',
        product: 'potato-orchard',
        quantity: 300,
        price: 135,
        inDays: 5,
        terms: 'Самовывоз из Урджара.',
        status: 'PENDING',
      },
    ],
  },
  {
    buyer: 'shop',
    category: 'dairy',
    title: 'Молоко 3,2% — поставка 2 раза в неделю',
    description:
      'Магазину у дома нужно 200 литров молока в неделю, бутылки по 1 л.',
    quantity: 200,
    unit: 'L',
    targetPrice: 270,
    cityId: 'semey',
    inDays: 4,
    status: 'OPEN',
    daysAgo: 0,
    offers: [],
  },
  {
    buyer: 'shop',
    category: 'vegetables',
    title: 'Лук и морковь для овощного отдела',
    description: 'По 150 кг лука и моркови, желательно в сетках.',
    quantity: 300,
    unit: 'KG',
    cityId: 'semey',
    inDays: 8,
    status: 'OPEN',
    daysAgo: 0,
    offers: [],
  },
  {
    buyer: 'canteen',
    category: 'grain',
    title: 'Мука пшеничная для выпечки, 1 тонна',
    description: 'Мука первого сорта в мешках по 50 кг, доставка в Курчатов.',
    quantity: 1000,
    unit: 'KG',
    targetPrice: 270,
    cityId: 'kurchatov',
    inDays: 10,
    status: 'ACCEPTED',
    daysAgo: 6,
    offers: [
      {
        supplier: 'grain',
        product: 'flour',
        quantity: 1000,
        price: 255,
        deliveryCost: 15000,
        inDays: 4,
        terms: 'Доставка манипулятором, разгрузка включена.',
        status: 'ACCEPTED',
      },
    ],
  },
  {
    buyer: 'cafe',
    category: 'honey',
    title: 'Мёд для десертов, 20 кг',
    description: 'Светлый мёд для выпечки.',
    quantity: 20,
    unit: 'KG',
    cityId: 'semey',
    inDays: 12,
    status: 'CLOSED',
    daysAgo: 10,
    offers: [
      {
        supplier: 'honey',
        product: 'honey-clover',
        quantity: 20,
        price: 3300,
        inDays: 5,
        terms: 'Фляга 20 кг.',
        status: 'REJECTED',
      },
    ],
  },
];

const day = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number) => {
  const date = new Date(Date.now() + days * day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export async function seedDatabase(
  prisma: PrismaService,
  options: SeedDatabaseOptions,
) {
  await seedReference(prisma);

  const admin = await prisma.user.upsert({
    where: { email: options.adminEmail },
    create: {
      id: randomUUID(),
      email: options.adminEmail,
      name: options.adminName,
      role: 'ADMIN',
    },
    update: { name: options.adminName, role: 'ADMIN' },
  });

  const samples = await seedSampleMarketplace(prisma);

  return { admin, samples };
}

async function seedReference(prisma: PrismaService) {
  for (const region of REGIONS) {
    await prisma.region.upsert({
      where: { id: region.id },
      create: region,
      update: region,
    });
  }

  for (const [index, city] of CITIES.entries()) {
    const data = { ...city, regionId: 'abai', sortOrder: index };
    await prisma.city.upsert({
      where: { id: city.id },
      create: data,
      update: data,
    });
  }

  for (const [index, category] of CATEGORIES.entries()) {
    const data = { ...category, sortOrder: index };
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: data,
      update: data,
    });
  }
}

/** Пересоздаёт примеры данных с нуля: удаление владельцев компаний-примеров каскадно удаляет их компании и сделки. */
async function seedSampleMarketplace(prisma: PrismaService) {
  // По флагу, а не по домену: так удаляются и примеры, созданные прежними версиями сида.
  await prisma.user.deleteMany({
    where: { company: { isSample: true } },
  });

  const passwordHash = await new ScryptPasswordHasher().hash(SAMPLE_PASSWORD);
  const categories = new Map(
    (await prisma.category.findMany()).map((c) => [c.slug, c]),
  );
  const companyIds = new Map<string, string>();
  const userIds = new Map<string, string>();

  for (const [index, company] of COMPANIES.entries()) {
    const user = await prisma.user.create({
      data: {
        email: company.email,
        name: company.userName,
        passwordHash,
        role: company.role,
        preferredLanguage: 'kk',
        createdAt: new Date(Date.now() - (60 - index) * day),
        company: {
          create: {
            name: company.name,
            type: company.type,
            cityId: company.cityId,
            phone: company.phone,
            description: company.description,
            isSample: true,
            createdAt: new Date(Date.now() - (60 - index) * day),
          },
        },
      },
      include: { company: true },
    });
    companyIds.set(company.key, user.company!.id);
    userIds.set(company.key, user.id);
  }

  const productIds = new Map<string, string>();

  for (const product of PRODUCTS) {
    const category = categories.get(product.category)!;
    const supplier = COMPANIES.find((c) => c.key === product.supplier)!;
    const at = new Date(Date.now() - product.daysAgo * day);
    const created = await prisma.product.create({
      data: {
        supplierCompanyId: companyIds.get(product.supplier)!,
        categoryId: category.id,
        title: product.title,
        titleKk: product.titleKk,
        description: product.description,
        descriptionKk: product.descriptionKk,
        price: product.price,
        unit: product.unit,
        availableQty: product.availableQty,
        minOrderQty: product.minOrderQty,
        cityId: supplier.cityId,
        deliveryAvailable: product.delivery,
        pickupAvailable: product.pickup ?? true,
        tags: product.tags,
        status: product.inactive ? 'INACTIVE' : 'ACTIVE',
        isSample: true,
        createdAt: at,
        updatedAt: at,
        searchText: buildSearchText([
          product.title,
          product.titleKk,
          product.description,
          product.descriptionKk,
          ...product.tags,
          category.nameRu,
          category.nameKk,
          category.slug,
        ]),
      },
    });
    productIds.set(product.key, created.id);
  }

  let offers = 0;

  for (const request of REQUESTS) {
    const createdAt = new Date(Date.now() - request.daysAgo * day);
    const created = await prisma.purchaseRequest.create({
      data: {
        buyerCompanyId: companyIds.get(request.buyer)!,
        categoryId: categories.get(request.category)!.id,
        title: request.title,
        description: request.description,
        quantity: request.quantity,
        unit: request.unit,
        targetPrice: request.targetPrice ?? null,
        deliveryCityId: request.cityId,
        desiredDate: daysFromNow(request.inDays),
        status: request.status,
        isSample: true,
        createdAt,
        closedAt: ['ACCEPTED', 'CLOSED'].includes(request.status)
          ? new Date()
          : null,
      },
    });

    for (const offer of request.offers) {
      await prisma.offer.create({
        data: {
          requestId: created.id,
          supplierCompanyId: companyIds.get(offer.supplier)!,
          productId: offer.product ? productIds.get(offer.product) : null,
          quantity: offer.quantity,
          pricePerUnit: offer.price,
          deliveryCost: offer.deliveryCost ?? null,
          estimatedDeliveryDate: daysFromNow(offer.inDays),
          terms: offer.terms,
          status: offer.status,
          isSample: true,
          createdAt: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000),
        },
      });
      offers++;
    }
  }

  await prisma.inquiry.create({
    data: {
      fromCompanyId: companyIds.get('cafe')!,
      toCompanyId: companyIds.get('meat')!,
      productId: productIds.get('beef'),
      subject: 'Говядина для кафе: регулярные поставки',
      isSample: true,
      messages: {
        create: [
          {
            authorUserId: userIds.get('cafe')!,
            body: 'Здравствуйте! Нам нужно 40–50 кг говядины в неделю. Можете привозить по вторникам?',
            createdAt: new Date(Date.now() - 2 * day),
          },
          {
            authorUserId: userIds.get('meat')!,
            body: 'Сәлеметсіз бе! Да, по вторникам возим по Семею. Цена от 50 кг — 3200 тг/кг.',
            createdAt: new Date(Date.now() - 2 * day + 2 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  await prisma.inquiry.create({
    data: {
      fromCompanyId: companyIds.get('shop')!,
      toCompanyId: companyIds.get('farm')!,
      productId: productIds.get('potato'),
      subject: 'Картофель «Гала»: есть фасовка по 10 кг?',
      isSample: true,
      messages: {
        create: [
          {
            authorUserId: userIds.get('shop')!,
            body: 'Добрый день! Для магазина удобнее мешки по 10 кг. Есть такая фасовка?',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  return {
    companies: COMPANIES.length,
    products: PRODUCTS.length,
    requests: REQUESTS.length,
    offers,
  };
}
