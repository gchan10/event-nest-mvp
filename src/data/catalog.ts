import { CatalogItem, Category, Priority } from '../types';

const NB = 'Newborn';
const M3 = '3–6 months';
const M6 = 'Around 6 months';
const M9 = '9–12 months';

const c = (
  id: string, name: string, category: Category, priority: Priority,
  startMonth: number, ageLabel: string, why: string,
): CatalogItem => ({ id, name, category, priority, startMonth, ageLabel, why });

// Conservative, safety-first starter list. Optional items are never framed as must-haves.
export const CATALOG: CatalogItem[] = [
  // Sleep
  c('crib', 'Crib or bassinet', 'sleep', 'essential', 0, NB, 'A firm, flat, safety-certified sleep space with nothing else in it.'),
  c('crib-mattress', 'Firm crib mattress', 'sleep', 'essential', 0, NB, 'Must be firm and fit snugly with no gaps at the edges.'),
  c('crib-sheets', 'Fitted crib sheets', 'sleep', 'essential', 0, NB, 'Two or three tight-fitting spares for middle-of-the-night changes.'),
  c('swaddles', 'Swaddles or sleep sacks', 'sleep', 'essential', 0, NB, 'Keep baby warm without loose blankets; stop swaddling once rolling starts.'),
  c('sleep-sack', 'Arms-free sleep sacks', 'sleep', 'useful', 3, M3, 'The safe next step once baby shows signs of rolling over.'),
  c('white-noise', 'White noise machine', 'sleep', 'optional', 0, NB, 'Helps some babies settle; keep it across the room at low volume.'),
  c('monitor', 'Baby monitor', 'sleep', 'optional', 0, NB, 'Handy for naps in another room, but it is not a safety device.'),
  c('blackout', 'Blackout curtains', 'sleep', 'optional', 3, M3, 'Can help with daytime naps as sleep patterns develop.'),

  // Feeding
  c('burp-cloths', 'Burp cloths', 'feeding', 'essential', 0, NB, 'Spit-up is constant; a stack within reach saves a lot of laundry.'),
  c('bottles', 'Bottles', 'feeding', 'useful', 0, NB, 'Needed for formula or pumped milk; start with a few before buying a set.'),
  c('bottle-brush', 'Bottle brush & drying rack', 'feeding', 'useful', 0, NB, 'Makes daily bottle cleaning faster and more hygienic.'),
  c('pump', 'Breast pump', 'feeding', 'useful', 0, NB, 'Worth it if breastfeeding; often covered by health insurance.'),
  c('formula', 'Formula (if using)', 'feeding', 'useful', 0, NB, 'Ask your pediatrician which type, and keep a backup on hand.'),
  c('nursing-pillow', 'Nursing pillow', 'feeding', 'optional', 0, NB, 'Supports your arms during feeds; never use it for baby sleep.'),
  c('high-chair', 'High chair', 'feeding', 'essential', 6, M6, 'Needed once baby sits up well and starts solid foods.'),
  c('bibs', 'Bibs', 'feeding', 'useful', 6, M6, 'Wipeable bibs make starting solids much less messy.'),
  c('spoons', 'Baby spoons & bowls', 'feeding', 'useful', 6, M6, 'Small, soft-tipped spoons are easiest for first foods.'),
  c('cup', 'Small open or straw cup', 'feeding', 'useful', 6, M6, 'Sips of water from a cup can be introduced around six months.'),

  // Diapering
  c('diapers', 'Diapers', 'diapering', 'essential', 0, NB, "Don't overbuy newborn size; babies outgrow it quickly."),
  c('wipes', 'Wipes', 'diapering', 'essential', 0, NB, 'Fragrance-free wipes are gentlest on new skin.'),
  c('diaper-cream', 'Diaper cream', 'diapering', 'essential', 0, NB, 'A zinc-based cream helps prevent and treat diaper rash.'),
  c('changing-pad', 'Changing pad', 'diapering', 'useful', 0, NB, 'A contoured pad on a secured dresser works as well as a changing table.'),
  c('diaper-bag', 'Diaper bag', 'diapering', 'useful', 0, NB, 'Any roomy bag works; keep it stocked by the door.'),
  c('diaper-pail', 'Diaper pail', 'diapering', 'optional', 0, NB, 'Nice for odor control, but a lidded trash can also works.'),

  // Clothing
  c('bodysuits', 'Bodysuits (0–3m)', 'clothing', 'essential', 0, NB, 'The everyday base layer; easy snaps make changes faster.'),
  c('sleepers', 'Sleepers / footed pajamas', 'clothing', 'essential', 0, NB, 'Zippers beat snaps at 3am.'),
  c('hats-socks', 'Hats & socks', 'clothing', 'useful', 0, NB, 'Newborns lose heat quickly; a few of each is plenty.'),
  c('outerwear', 'Weather-appropriate layers', 'clothing', 'useful', 0, NB, 'Use thin layers in the car seat; no puffy coats under the harness.'),
  c('clothes-3-6', '3–6 month clothes', 'clothing', 'essential', 3, M3, 'Babies size up fast; have the next size ready.'),
  c('clothes-6-12', '6–12 month clothes', 'clothing', 'essential', 6, M6, 'Check hand-me-downs before buying the next size.'),

  // Bathing
  c('baby-wash', 'Gentle baby wash', 'bathing', 'essential', 0, NB, 'Mild and fragrance-free; a little goes a long way.'),
  c('nail-clippers', 'Baby nail clippers or file', 'bathing', 'essential', 0, NB, 'Tiny nails grow fast and can scratch faces.'),
  c('bathtub', 'Baby bathtub', 'bathing', 'useful', 0, NB, 'Supports baby securely; never leave baby alone in water.'),
  c('towels', 'Hooded towels & washcloths', 'bathing', 'useful', 0, NB, 'Soft towels keep baby warm right after the bath.'),

  // Travel
  c('car-seat', 'Infant car seat', 'travel', 'essential', 0, NB, 'Required to bring baby home; avoid used seats without a known history.'),
  c('stroller', 'Stroller', 'travel', 'useful', 0, NB, 'Check that it works with your car seat or lies flat for newborns.'),
  c('carrier', 'Baby carrier or wrap', 'travel', 'useful', 0, NB, 'Hands-free soothing; keep baby\'s face visible and airway clear.'),
  c('convertible-seat', 'Convertible car seat', 'travel', 'essential', 9, M9, "Needed once baby outgrows the infant seat's height or weight limit."),

  // Health & Safety
  c('thermometer', 'Digital thermometer', 'health', 'essential', 0, NB, 'Ask your pediatrician which type and when to call about a fever.'),
  c('aspirator', 'Nasal aspirator & saline', 'health', 'useful', 0, NB, 'Helps clear stuffy noses so baby can feed and sleep.'),
  c('first-aid', 'Infant first-aid basics', 'health', 'useful', 0, NB, 'Keep supplies together; confirm any medicine dose with your pediatrician.'),
  c('anchors', 'Furniture anchors', 'health', 'essential', 6, M6, 'Anchor dressers, shelves and TVs before baby starts pulling up.'),
  c('outlet-covers', 'Outlet covers & cabinet locks', 'health', 'essential', 6, M6, 'Babyproof before crawling begins, not after.'),
  c('gates', 'Safety gates', 'health', 'essential', 9, M9, 'Hardware-mounted gates are needed at the top of stairs.'),

  // Play
  c('play-mat', 'Play mat or activity gym', 'play', 'useful', 3, M3, 'Encourages tummy time and reaching as baby gets stronger.'),
  c('board-books', 'Board books', 'play', 'useful', 3, M3, 'Reading together early supports language; sturdy pages survive chewing.'),
  c('teethers', 'Teething toys', 'play', 'useful', 3, M3, 'Teething often starts between 4 and 7 months.'),
  c('push-toy', 'Push toy or activity table', 'play', 'optional', 9, M9, 'Fun for new standers; plenty of babies do fine without one.'),

  // Other
  c('pacifiers', 'Pacifiers', 'other', 'optional', 0, NB, 'Some babies love them; never attach to a cord or clip in the crib.'),
];

export const CATALOG_BY_ID = Object.fromEntries(CATALOG.map((x) => [x.id, x]));

export const AGE_WINDOWS = [
  { start: 0, label: NB },
  { start: 3, label: M3 },
  { start: 6, label: M6 },
  { start: 9, label: M9 },
];
