import type { Unit } from '@generated/prisma/client';

export type LexiconEntry = {
  category: string;
  nameRu: string;
  nameKk: string;
  /** Основы слов (ru/kk/en), по ним же ищем в каталоге. */
  stems: string[];
};

export const PRODUCT_LEXICON: LexiconEntry[] = [
  {
    category: 'vegetables',
    nameRu: 'Картофель',
    nameKk: 'Картоп',
    stems: ['картоф', 'картош', 'картоп', 'potato'],
  },
  {
    category: 'vegetables',
    nameRu: 'Морковь',
    nameKk: 'Сәбіз',
    stems: ['морков', 'сәбіз', 'сабиз', 'carrot'],
  },
  {
    category: 'vegetables',
    nameRu: 'Лук репчатый',
    nameKk: 'Пияз',
    stems: ['лук', 'пияз', 'onion'],
  },
  {
    category: 'vegetables',
    nameRu: 'Капуста',
    nameKk: 'Қырыққабат',
    stems: ['капуст', 'қырыққабат', 'cabbage'],
  },
  {
    category: 'vegetables',
    nameRu: 'Помидоры',
    nameKk: 'Қызанақ',
    stems: ['помидор', 'томат', 'қызанақ', 'tomato'],
  },
  {
    category: 'vegetables',
    nameRu: 'Огурцы',
    nameKk: 'Қияр',
    stems: ['огур', 'қияр', 'cucumber'],
  },
  {
    category: 'vegetables',
    nameRu: 'Свёкла',
    nameKk: 'Қызылша',
    stems: ['свекл', 'свёкл', 'қызылша', 'beet'],
  },
  {
    category: 'fruits',
    nameRu: 'Яблоки',
    nameKk: 'Алма',
    stems: ['яблок', 'алма', 'apple'],
  },
  {
    category: 'fruits',
    nameRu: 'Ягоды',
    nameKk: 'Жидек',
    stems: ['ягод', 'жидек', 'облепих', 'смородин', 'berr'],
  },
  {
    category: 'meat',
    nameRu: 'Говядина',
    nameKk: 'Сиыр еті',
    stems: ['говяд', 'сиыр', 'beef'],
  },
  {
    category: 'meat',
    nameRu: 'Баранина',
    nameKk: 'Қой еті',
    stems: ['баран', 'қой ет', 'lamb', 'mutton'],
  },
  {
    category: 'meat',
    nameRu: 'Конина',
    nameKk: 'Жылқы еті',
    stems: ['конин', 'жылқы', 'қазы', 'horse'],
  },
  {
    category: 'meat',
    nameRu: 'Курица',
    nameKk: 'Тауық еті',
    stems: ['куриц', 'курин', 'бройлер', 'тауық', 'chicken'],
  },
  { category: 'meat', nameRu: 'Мясо', nameKk: 'Ет', stems: ['мяс', 'meat'] },
  {
    category: 'dairy',
    nameRu: 'Молоко',
    nameKk: 'Сүт',
    stems: ['молок', 'молоч', 'сүт', 'milk'],
  },
  {
    category: 'dairy',
    nameRu: 'Кумыс',
    nameKk: 'Қымыз',
    stems: ['кумыс', 'қымыз', 'kumys'],
  },
  {
    category: 'dairy',
    nameRu: 'Сметана',
    nameKk: 'Қаймақ',
    stems: ['сметан', 'қаймақ'],
  },
  {
    category: 'dairy',
    nameRu: 'Творог',
    nameKk: 'Сүзбе',
    stems: ['творог', 'сүзбе'],
  },
  {
    category: 'dairy',
    nameRu: 'Сыр',
    nameKk: 'Ірімшік',
    stems: ['сыр', 'ірімшік', 'cheese'],
  },
  {
    category: 'dairy',
    nameRu: 'Курт',
    nameKk: 'Құрт',
    stems: ['курт', 'құрт'],
  },
  {
    category: 'grain',
    nameRu: 'Пшеница',
    nameKk: 'Бидай',
    stems: ['пшениц', 'бидай', 'wheat'],
  },
  {
    category: 'grain',
    nameRu: 'Ячмень',
    nameKk: 'Арпа',
    stems: ['ячмен', 'арпа', 'barley'],
  },
  {
    category: 'grain',
    nameRu: 'Овёс',
    nameKk: 'Сұлы',
    stems: ['овес', 'овёс', 'овса', 'сұлы', 'oat'],
  },
  {
    category: 'grain',
    nameRu: 'Мука',
    nameKk: 'Ұн',
    stems: ['мука', 'муку', 'ұн', 'flour'],
  },
  {
    category: 'grain',
    nameRu: 'Зерно',
    nameKk: 'Астық',
    stems: ['зерн', 'астық', 'grain'],
  },
  {
    category: 'honey',
    nameRu: 'Мёд',
    nameKk: 'Бал',
    stems: ['мёд', 'мед', 'бал', 'honey'],
  },
  {
    category: 'eggs',
    nameRu: 'Яйца',
    nameKk: 'Жұмыртқа',
    stems: ['яйц', 'яиц', 'жұмыртқа', 'egg'],
  },
];

/** Основы названий населённых пунктов, включая казахские падежные формы (Семейге, Семейде). */
export const CITY_LEXICON: Array<{ id: string; stems: string[] }> = [
  { id: 'semey', stems: ['семе', 'semey', 'semei'] },
  { id: 'kurchatov', stems: ['курчатов', 'kurchatov'] },
  { id: 'ayagoz', stems: ['аягоз', 'аягөз', 'ayagoz'] },
  { id: 'urzhar', stems: ['үржар', 'урджар', 'уржар', 'urzhar', 'urjar'] },
  { id: 'makanchi', stems: ['маканч', 'мақанш', 'makanchi'] },
  { id: 'kokpekty', stems: ['кокпект', 'көкпект', 'kokpekty'] },
  { id: 'karaul', stems: ['караул', 'қарауыл', 'karaul'] },
  { id: 'borodulikha', stems: ['бородулих', 'borodulikha'] },
  { id: 'beskaragay', stems: ['бескарагай', 'бесқарағай', 'beskaragay'] },
  { id: 'kalbatau', stems: ['калбатау', 'қалбатау', 'kalbatau'] },
  { id: 'aksuat', stems: ['аксуат', 'ақсуат', 'aksuat'] },
];

export const REGION_STEMS: Array<{ id: string; stems: string[] }> = [
  {
    id: 'abai',
    stems: ['абай обл', 'области абай', 'абайск', 'abai region', 'abai oblast'],
  },
];

export const UNIT_PATTERNS: Array<{ unit: Unit; pattern: string }> = [
  { unit: 'T', pattern: 'тонн\\p{L}*|тонна|т|t|tons?' },
  { unit: 'KG', pattern: 'кг|килограмм\\p{L}*|кило|kg|kilograms?' },
  { unit: 'L', pattern: 'литр\\p{L}*|л|l|liters?|litres?' },
  { unit: 'PCS', pattern: 'шт\\p{L}*|штук\\p{L}*|дана|pcs|pieces?' },
  { unit: 'PACK', pattern: 'упаков\\p{L}*|қорап|pack\\p{L}*|box\\p{L}*' },
];
