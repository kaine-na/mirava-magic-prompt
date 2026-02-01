/**
 * IP (Intellectual Property) Content Filter for Mirava Magic Prompt
 * 
 * This module provides comprehensive filtering for copyrighted content,
 * trademarked characters, celebrity names, artist styles, and brand references
 * to ensure generated prompts don't infringe on intellectual property rights.
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface IPTerm {
  term: string;
  replacement: string;
  category: IPCategory;
  variations?: string[];
}

export type IPCategory = 
  | 'disney_character'
  | 'marvel_character'
  | 'dc_character'
  | 'anime_character'
  | 'nintendo_character'
  | 'video_game_character'
  | 'tech_brand'
  | 'fashion_brand'
  | 'food_brand'
  | 'luxury_brand'
  | 'automotive_brand'
  | 'artist'
  | 'studio'
  | 'celebrity'
  | 'franchise'
  | 'movie_character'
  | 'tv_character';

export interface IPDetectionResult {
  hasIP: boolean;
  detectedTerms: string[];
  categories: IPCategory[];
  details: Array<{
    term: string;
    category: IPCategory;
    position: number;
    suggestedReplacement: string;
  }>;
}

export interface SanitizationResult {
  originalPrompt: string;
  sanitizedPrompt: string;
  wasModified: boolean;
  replacements: Array<{
    original: string;
    replacement: string;
    category: IPCategory;
  }>;
}

// =============================================================================
// IP BLOCKLISTS
// =============================================================================

/**
 * Disney Characters (24 entries)
 */
const DISNEY_CHARACTERS: IPTerm[] = [
  { term: 'mickey mouse', replacement: 'cartoon mouse character', category: 'disney_character', variations: ['mickey', 'mickey m'] },
  { term: 'minnie mouse', replacement: 'cartoon mouse character in dress', category: 'disney_character', variations: ['minnie'] },
  { term: 'donald duck', replacement: 'cartoon duck character', category: 'disney_character', variations: ['donald d'] },
  { term: 'daisy duck', replacement: 'cartoon duck character in bow', category: 'disney_character' },
  { term: 'goofy', replacement: 'tall cartoon dog character', category: 'disney_character' },
  { term: 'pluto', replacement: 'cartoon dog pet', category: 'disney_character' },
  { term: 'elsa', replacement: 'ice princess character', category: 'disney_character', variations: ['frozen elsa', 'queen elsa'] },
  { term: 'anna', replacement: 'adventurous princess character', category: 'disney_character', variations: ['frozen anna', 'princess anna'] },
  { term: 'olaf', replacement: 'friendly snowman character', category: 'disney_character' },
  { term: 'moana', replacement: 'polynesian princess character', category: 'disney_character' },
  { term: 'rapunzel', replacement: 'long-haired princess character', category: 'disney_character' },
  { term: 'ariel', replacement: 'mermaid princess character', category: 'disney_character', variations: ['little mermaid'] },
  { term: 'simba', replacement: 'young lion character', category: 'disney_character' },
  { term: 'mufasa', replacement: 'majestic lion king character', category: 'disney_character' },
  { term: 'stitch', replacement: 'blue alien creature character', category: 'disney_character', variations: ['lilo and stitch'] },
  { term: 'buzz lightyear', replacement: 'space ranger toy character', category: 'disney_character', variations: ['buzz'] },
  { term: 'woody', replacement: 'cowboy toy character', category: 'disney_character', variations: ['sheriff woody'] },
  { term: 'cinderella', replacement: 'princess in ball gown', category: 'disney_character' },
  { term: 'snow white', replacement: 'princess with dark hair', category: 'disney_character' },
  { term: 'belle', replacement: 'bookish princess character', category: 'disney_character', variations: ['beauty and the beast belle'] },
  { term: 'jasmine', replacement: 'arabian princess character', category: 'disney_character', variations: ['princess jasmine'] },
  { term: 'mulan', replacement: 'warrior princess character', category: 'disney_character' },
  { term: 'pocahontas', replacement: 'native american princess character', category: 'disney_character' },
  { term: 'tinker bell', replacement: 'fairy character with wings', category: 'disney_character', variations: ['tinkerbell'] },
];

/**
 * Marvel Characters (24 entries)
 */
const MARVEL_CHARACTERS: IPTerm[] = [
  { term: 'spider-man', replacement: 'masked web-slinging superhero', category: 'marvel_character', variations: ['spiderman', 'spider man', 'peter parker'] },
  { term: 'iron man', replacement: 'armored tech superhero', category: 'marvel_character', variations: ['ironman', 'tony stark'] },
  { term: 'thor', replacement: 'norse god superhero with hammer', category: 'marvel_character', variations: ['thor odinson'] },
  { term: 'hulk', replacement: 'giant green superhero', category: 'marvel_character', variations: ['bruce banner', 'incredible hulk'] },
  { term: 'captain america', replacement: 'patriotic shield-wielding superhero', category: 'marvel_character', variations: ['steve rogers', 'cap'] },
  { term: 'black widow', replacement: 'female spy superhero', category: 'marvel_character', variations: ['natasha romanoff'] },
  { term: 'hawkeye', replacement: 'archer superhero', category: 'marvel_character', variations: ['clint barton'] },
  { term: 'black panther', replacement: 'armored jungle warrior hero', category: 'marvel_character', variations: ['t\'challa', 'tchalla'] },
  { term: 'doctor strange', replacement: 'mystical sorcerer superhero', category: 'marvel_character', variations: ['dr strange', 'stephen strange'] },
  { term: 'scarlet witch', replacement: 'magical reality-warping superhero', category: 'marvel_character', variations: ['wanda maximoff', 'wanda'] },
  { term: 'vision', replacement: 'android superhero', category: 'marvel_character' },
  { term: 'ant-man', replacement: 'size-changing superhero', category: 'marvel_character', variations: ['antman', 'scott lang'] },
  { term: 'wasp', replacement: 'winged size-changing superhero', category: 'marvel_character', variations: ['hope van dyne'] },
  { term: 'captain marvel', replacement: 'cosmic-powered female superhero', category: 'marvel_character', variations: ['carol danvers'] },
  { term: 'thanos', replacement: 'titan supervillain', category: 'marvel_character' },
  { term: 'loki', replacement: 'trickster god villain', category: 'marvel_character' },
  { term: 'deadpool', replacement: 'masked mercenary antihero', category: 'marvel_character', variations: ['wade wilson'] },
  { term: 'wolverine', replacement: 'clawed mutant hero', category: 'marvel_character', variations: ['logan', 'james howlett'] },
  { term: 'storm', replacement: 'weather-controlling mutant hero', category: 'marvel_character', variations: ['ororo munroe'] },
  { term: 'magneto', replacement: 'magnetic mutant villain', category: 'marvel_character', variations: ['erik lehnsherr'] },
  { term: 'professor x', replacement: 'telepathic mutant leader', category: 'marvel_character', variations: ['charles xavier', 'prof x'] },
  { term: 'venom', replacement: 'symbiote antihero', category: 'marvel_character', variations: ['eddie brock'] },
  { term: 'groot', replacement: 'tree-like alien creature', category: 'marvel_character' },
  { term: 'rocket raccoon', replacement: 'anthropomorphic raccoon character', category: 'marvel_character', variations: ['rocket'] },
];

/**
 * DC Characters (17 entries)
 */
const DC_CHARACTERS: IPTerm[] = [
  { term: 'batman', replacement: 'dark vigilante superhero', category: 'dc_character', variations: ['bruce wayne', 'dark knight', 'bat man'] },
  { term: 'superman', replacement: 'caped flying superhero', category: 'dc_character', variations: ['clark kent', 'man of steel', 'super man'] },
  { term: 'wonder woman', replacement: 'amazonian warrior superhero', category: 'dc_character', variations: ['diana prince'] },
  { term: 'aquaman', replacement: 'underwater king superhero', category: 'dc_character', variations: ['arthur curry'] },
  { term: 'the flash', replacement: 'speedster superhero', category: 'dc_character', variations: ['flash', 'barry allen', 'wally west'] },
  { term: 'green lantern', replacement: 'ring-wielding space superhero', category: 'dc_character', variations: ['hal jordan', 'john stewart'] },
  { term: 'cyborg', replacement: 'cybernetic superhero', category: 'dc_character', variations: ['victor stone'] },
  { term: 'joker', replacement: 'clown-themed supervillain', category: 'dc_character' },
  { term: 'harley quinn', replacement: 'mischievous female villain', category: 'dc_character', variations: ['harley'] },
  { term: 'catwoman', replacement: 'cat-themed antiheroine', category: 'dc_character', variations: ['selina kyle'] },
  { term: 'robin', replacement: 'young sidekick hero', category: 'dc_character', variations: ['dick grayson', 'tim drake', 'damian wayne'] },
  { term: 'batgirl', replacement: 'female vigilante hero', category: 'dc_character', variations: ['barbara gordon'] },
  { term: 'supergirl', replacement: 'flying female superhero', category: 'dc_character', variations: ['kara zor-el'] },
  { term: 'nightwing', replacement: 'acrobatic vigilante hero', category: 'dc_character' },
  { term: 'poison ivy', replacement: 'plant-controlling villain', category: 'dc_character', variations: ['pamela isley'] },
  { term: 'lex luthor', replacement: 'genius billionaire villain', category: 'dc_character' },
  { term: 'darkseid', replacement: 'cosmic tyrant villain', category: 'dc_character' },
];

/**
 * Anime Characters (24 entries)
 */
const ANIME_CHARACTERS: IPTerm[] = [
  { term: 'goku', replacement: 'spiky-haired martial artist', category: 'anime_character', variations: ['son goku', 'kakarot'] },
  { term: 'vegeta', replacement: 'proud warrior prince', category: 'anime_character' },
  { term: 'naruto', replacement: 'blonde ninja character', category: 'anime_character', variations: ['naruto uzumaki'] },
  { term: 'sasuke', replacement: 'dark-haired ninja rival', category: 'anime_character', variations: ['sasuke uchiha'] },
  { term: 'kakashi', replacement: 'masked ninja mentor', category: 'anime_character', variations: ['kakashi hatake'] },
  { term: 'pikachu', replacement: 'yellow electric creature', category: 'anime_character' },
  { term: 'ash ketchum', replacement: 'young monster trainer', category: 'anime_character', variations: ['ash', 'satoshi'] },
  { term: 'luffy', replacement: 'straw hat pirate captain', category: 'anime_character', variations: ['monkey d luffy', 'monkey d. luffy'] },
  { term: 'zoro', replacement: 'green-haired swordsman', category: 'anime_character', variations: ['roronoa zoro'] },
  { term: 'ichigo', replacement: 'orange-haired soul warrior', category: 'anime_character', variations: ['ichigo kurosaki'] },
  { term: 'eren', replacement: 'titan-shifting soldier', category: 'anime_character', variations: ['eren yeager', 'eren jaeger'] },
  { term: 'mikasa', replacement: 'skilled female soldier', category: 'anime_character', variations: ['mikasa ackerman'] },
  { term: 'levi', replacement: 'elite soldier captain', category: 'anime_character', variations: ['levi ackerman'] },
  { term: 'light yagami', replacement: 'genius student with notebook', category: 'anime_character', variations: ['kira'] },
  { term: 'saitama', replacement: 'bald superhero character', category: 'anime_character', variations: ['one punch man'] },
  { term: 'genos', replacement: 'cyborg hero character', category: 'anime_character' },
  { term: 'tanjiro', replacement: 'checkered-haori swordsman', category: 'anime_character', variations: ['tanjiro kamado'] },
  { term: 'nezuko', replacement: 'demon girl with bamboo muzzle', category: 'anime_character', variations: ['nezuko kamado'] },
  { term: 'deku', replacement: 'green-haired hero student', category: 'anime_character', variations: ['izuku midoriya', 'midoriya'] },
  { term: 'all might', replacement: 'muscular symbol of peace hero', category: 'anime_character' },
  { term: 'sailor moon', replacement: 'magical girl warrior', category: 'anime_character', variations: ['usagi tsukino'] },
  { term: 'totoro', replacement: 'large friendly forest spirit', category: 'anime_character', variations: ['my neighbor totoro'] },
  { term: 'spirited away', replacement: 'japanese spirit world', category: 'anime_character', variations: ['chihiro', 'no face'] },
  { term: 'edward elric', replacement: 'young alchemist with metal arm', category: 'anime_character', variations: ['fullmetal alchemist'] },
];

/**
 * Nintendo Characters (17 entries)
 */
const NINTENDO_CHARACTERS: IPTerm[] = [
  { term: 'mario', replacement: 'red-capped plumber character', category: 'nintendo_character', variations: ['super mario', 'mario bros'] },
  { term: 'luigi', replacement: 'green-capped plumber character', category: 'nintendo_character' },
  { term: 'princess peach', replacement: 'pink dress princess', category: 'nintendo_character', variations: ['peach'] },
  { term: 'bowser', replacement: 'turtle king villain', category: 'nintendo_character', variations: ['king koopa'] },
  { term: 'link', replacement: 'green-clad elven warrior', category: 'nintendo_character', variations: ['zelda link'] },
  { term: 'zelda', replacement: 'elven princess with magic', category: 'nintendo_character', variations: ['princess zelda'] },
  { term: 'ganondorf', replacement: 'dark sorcerer villain', category: 'nintendo_character', variations: ['ganon'] },
  { term: 'samus', replacement: 'armored bounty hunter', category: 'nintendo_character', variations: ['samus aran', 'metroid samus'] },
  { term: 'kirby', replacement: 'pink round creature', category: 'nintendo_character' },
  { term: 'donkey kong', replacement: 'giant ape character', category: 'nintendo_character', variations: ['dk'] },
  { term: 'diddy kong', replacement: 'small monkey character', category: 'nintendo_character' },
  { term: 'yoshi', replacement: 'friendly dinosaur character', category: 'nintendo_character' },
  { term: 'wario', replacement: 'yellow-clad rival character', category: 'nintendo_character' },
  { term: 'waluigi', replacement: 'tall purple rival character', category: 'nintendo_character' },
  { term: 'toad', replacement: 'mushroom-headed character', category: 'nintendo_character' },
  { term: 'captain falcon', replacement: 'racing pilot hero', category: 'nintendo_character' },
  { term: 'fox mccloud', replacement: 'space pilot fox character', category: 'nintendo_character', variations: ['starfox', 'star fox'] },
];

/**
 * Video Game Characters (15 entries)
 */
const VIDEO_GAME_CHARACTERS: IPTerm[] = [
  { term: 'master chief', replacement: 'armored space soldier', category: 'video_game_character', variations: ['halo master chief', 'john-117'] },
  { term: 'kratos', replacement: 'muscular ancient warrior', category: 'video_game_character', variations: ['god of war kratos'] },
  { term: 'solid snake', replacement: 'tactical stealth soldier', category: 'video_game_character', variations: ['snake', 'metal gear snake'] },
  { term: 'lara croft', replacement: 'female archaeologist adventurer', category: 'video_game_character', variations: ['tomb raider'] },
  { term: 'geralt', replacement: 'white-haired monster hunter', category: 'video_game_character', variations: ['geralt of rivia', 'witcher geralt'] },
  { term: 'cloud strife', replacement: 'spiky-haired swordsman', category: 'video_game_character', variations: ['cloud', 'ff7 cloud'] },
  { term: 'sephiroth', replacement: 'silver-haired villain', category: 'video_game_character' },
  { term: 'dante', replacement: 'white-haired demon hunter', category: 'video_game_character', variations: ['devil may cry dante'] },
  { term: 'ryu', replacement: 'martial artist in white gi', category: 'video_game_character', variations: ['street fighter ryu'] },
  { term: 'chun-li', replacement: 'female martial artist', category: 'video_game_character' },
  { term: 'sonic', replacement: 'blue hedgehog character', category: 'video_game_character', variations: ['sonic the hedgehog'] },
  { term: 'crash bandicoot', replacement: 'orange bandicoot character', category: 'video_game_character', variations: ['crash'] },
  { term: 'nathan drake', replacement: 'treasure hunter adventurer', category: 'video_game_character', variations: ['uncharted nathan'] },
  { term: 'joel', replacement: 'grizzled survivor father figure', category: 'video_game_character', variations: ['the last of us joel'] },
  { term: 'ellie', replacement: 'young female survivor', category: 'video_game_character', variations: ['the last of us ellie'] },
];

/**
 * Tech Brands (20 entries)
 */
const TECH_BRANDS: IPTerm[] = [
  { term: 'apple', replacement: 'premium tech brand', category: 'tech_brand', variations: ['apple inc'] },
  { term: 'iphone', replacement: 'smartphone', category: 'tech_brand', variations: ['shot on iphone'] },
  { term: 'ipad', replacement: 'tablet device', category: 'tech_brand' },
  { term: 'macbook', replacement: 'laptop computer', category: 'tech_brand', variations: ['mac book', 'macbook pro'] },
  { term: 'airpods', replacement: 'wireless earbuds', category: 'tech_brand', variations: ['air pods'] },
  { term: 'google', replacement: 'tech company', category: 'tech_brand' },
  { term: 'pixel phone', replacement: 'android smartphone', category: 'tech_brand', variations: ['google pixel'] },
  { term: 'microsoft', replacement: 'software company', category: 'tech_brand' },
  { term: 'surface', replacement: 'tablet laptop device', category: 'tech_brand', variations: ['surface pro', 'microsoft surface'] },
  { term: 'xbox', replacement: 'gaming console', category: 'tech_brand' },
  { term: 'playstation', replacement: 'gaming console', category: 'tech_brand', variations: ['ps5', 'ps4', 'sony playstation'] },
  { term: 'nintendo switch', replacement: 'portable gaming console', category: 'tech_brand', variations: ['switch'] },
  { term: 'samsung', replacement: 'electronics brand', category: 'tech_brand' },
  { term: 'galaxy phone', replacement: 'android smartphone', category: 'tech_brand', variations: ['samsung galaxy'] },
  { term: 'tesla', replacement: 'electric vehicle', category: 'tech_brand', variations: ['tesla car', 'tesla model'] },
  { term: 'nvidia', replacement: 'graphics hardware', category: 'tech_brand', variations: ['nvidia rtx', 'geforce'] },
  { term: 'intel', replacement: 'processor chip', category: 'tech_brand' },
  { term: 'amd', replacement: 'processor chip', category: 'tech_brand' },
  { term: 'meta', replacement: 'tech company', category: 'tech_brand', variations: ['facebook', 'meta quest'] },
  { term: 'amazon', replacement: 'e-commerce company', category: 'tech_brand', variations: ['amazon prime'] },
];

/**
 * Fashion Brands (19 entries)
 */
const FASHION_BRANDS: IPTerm[] = [
  { term: 'nike', replacement: 'athletic sportswear', category: 'fashion_brand', variations: ['nike shoes', 'nike swoosh'] },
  { term: 'adidas', replacement: 'athletic sportswear', category: 'fashion_brand', variations: ['adidas three stripes'] },
  { term: 'puma', replacement: 'athletic sportswear', category: 'fashion_brand' },
  { term: 'reebok', replacement: 'athletic footwear', category: 'fashion_brand' },
  { term: 'under armour', replacement: 'athletic apparel', category: 'fashion_brand' },
  { term: 'gucci', replacement: 'luxury fashion', category: 'luxury_brand' },
  { term: 'louis vuitton', replacement: 'luxury fashion brand', category: 'luxury_brand', variations: ['lv', 'louis v'] },
  { term: 'chanel', replacement: 'luxury fashion house', category: 'luxury_brand' },
  { term: 'prada', replacement: 'luxury fashion', category: 'luxury_brand' },
  { term: 'versace', replacement: 'luxury fashion', category: 'luxury_brand' },
  { term: 'hermès', replacement: 'luxury fashion', category: 'luxury_brand', variations: ['hermes', 'birkin bag'] },
  { term: 'balenciaga', replacement: 'luxury streetwear', category: 'luxury_brand' },
  { term: 'supreme', replacement: 'streetwear brand', category: 'fashion_brand' },
  { term: 'off-white', replacement: 'streetwear brand', category: 'fashion_brand', variations: ['off white'] },
  { term: 'burberry', replacement: 'luxury fashion', category: 'luxury_brand' },
  { term: 'dior', replacement: 'luxury fashion house', category: 'luxury_brand', variations: ['christian dior'] },
  { term: 'ralph lauren', replacement: 'fashion brand', category: 'fashion_brand', variations: ['polo ralph lauren'] },
  { term: 'calvin klein', replacement: 'fashion brand', category: 'fashion_brand', variations: ['ck'] },
  { term: 'levi\'s', replacement: 'denim brand', category: 'fashion_brand', variations: ['levis'] },
];

/**
 * Food & Beverage Brands (15 entries)
 */
const FOOD_BRANDS: IPTerm[] = [
  { term: 'coca-cola', replacement: 'cola beverage', category: 'food_brand', variations: ['coca cola', 'coke'] },
  { term: 'pepsi', replacement: 'cola beverage', category: 'food_brand', variations: ['pepsico'] },
  { term: 'mcdonald\'s', replacement: 'fast food restaurant', category: 'food_brand', variations: ['mcdonalds', 'mcd'] },
  { term: 'burger king', replacement: 'fast food restaurant', category: 'food_brand' },
  { term: 'starbucks', replacement: 'coffee shop', category: 'food_brand', variations: ['starbucks coffee'] },
  { term: 'dunkin', replacement: 'coffee and donut shop', category: 'food_brand', variations: ['dunkin donuts'] },
  { term: 'subway', replacement: 'sandwich shop', category: 'food_brand' },
  { term: 'kfc', replacement: 'fried chicken restaurant', category: 'food_brand', variations: ['kentucky fried chicken'] },
  { term: 'pizza hut', replacement: 'pizza restaurant', category: 'food_brand' },
  { term: 'taco bell', replacement: 'mexican fast food', category: 'food_brand' },
  { term: 'red bull', replacement: 'energy drink', category: 'food_brand' },
  { term: 'monster energy', replacement: 'energy drink', category: 'food_brand', variations: ['monster drink'] },
  { term: 'oreo', replacement: 'sandwich cookie', category: 'food_brand' },
  { term: 'nutella', replacement: 'chocolate hazelnut spread', category: 'food_brand' },
  { term: 'doritos', replacement: 'tortilla chips', category: 'food_brand' },
];

/**
 * Automotive Brands (15 entries)
 */
const AUTOMOTIVE_BRANDS: IPTerm[] = [
  { term: 'ferrari', replacement: 'luxury sports car', category: 'automotive_brand' },
  { term: 'lamborghini', replacement: 'luxury sports car', category: 'automotive_brand', variations: ['lambo'] },
  { term: 'porsche', replacement: 'luxury sports car', category: 'automotive_brand' },
  { term: 'bugatti', replacement: 'hypercar', category: 'automotive_brand' },
  { term: 'maserati', replacement: 'luxury sports car', category: 'automotive_brand' },
  { term: 'bmw', replacement: 'luxury automobile', category: 'automotive_brand' },
  { term: 'mercedes', replacement: 'luxury automobile', category: 'automotive_brand', variations: ['mercedes-benz', 'mercedes benz'] },
  { term: 'audi', replacement: 'luxury automobile', category: 'automotive_brand' },
  { term: 'rolls royce', replacement: 'ultra-luxury automobile', category: 'automotive_brand', variations: ['rolls-royce'] },
  { term: 'bentley', replacement: 'luxury automobile', category: 'automotive_brand' },
  { term: 'aston martin', replacement: 'luxury sports car', category: 'automotive_brand' },
  { term: 'mclaren', replacement: 'supercar', category: 'automotive_brand' },
  { term: 'jaguar', replacement: 'luxury automobile', category: 'automotive_brand' },
  { term: 'land rover', replacement: 'luxury suv', category: 'automotive_brand' },
  { term: 'lexus', replacement: 'luxury automobile', category: 'automotive_brand' },
];

/**
 * Artists (29 entries) - Artists whose styles are commonly referenced
 */
const ARTISTS: IPTerm[] = [
  { term: 'greg rutkowski', replacement: 'detailed fantasy art style', category: 'artist', variations: ['rutkowski', 'greg rutkowski style'] },
  { term: 'artgerm', replacement: 'polished comic art style', category: 'artist', variations: ['artgerm style', 'stanley lau'] },
  { term: 'ross tran', replacement: 'dynamic character art style', category: 'artist', variations: ['rossdraws'] },
  { term: 'wlop', replacement: 'ethereal digital painting style', category: 'artist', variations: ['wlop style', 'wang ling'] },
  { term: 'sakimichan', replacement: 'stylized portrait art style', category: 'artist', variations: ['sakimi chan'] },
  { term: 'ilya kuvshinov', replacement: 'anime-inspired portrait style', category: 'artist' },
  { term: 'krenz cushart', replacement: 'dynamic illustration style', category: 'artist', variations: ['krenz'] },
  { term: 'loish', replacement: 'colorful character art style', category: 'artist', variations: ['lois van baarle'] },
  { term: 'rossdraws', replacement: 'vibrant character art style', category: 'artist' },
  { term: 'charlie bowater', replacement: 'painterly portrait style', category: 'artist' },
  { term: 'james gurney', replacement: 'naturalistic painting style', category: 'artist', variations: ['dinotopia style'] },
  { term: 'frazetta', replacement: 'heroic fantasy art style', category: 'artist', variations: ['frank frazetta'] },
  { term: 'beeple', replacement: 'surreal 3d art style', category: 'artist', variations: ['mike winkelmann'] },
  { term: 'kim jung gi', replacement: 'masterful ink drawing style', category: 'artist' },
  { term: 'moebius', replacement: 'european comic art style', category: 'artist', variations: ['jean giraud'] },
  { term: 'alphonse mucha', replacement: 'art nouveau illustration style', category: 'artist', variations: ['mucha style'] },
  { term: 'zdzislaw beksinski', replacement: 'dark surrealist art style', category: 'artist', variations: ['beksinski'] },
  { term: 'hr giger', replacement: 'biomechanical art style', category: 'artist', variations: ['h.r. giger', 'giger style'] },
  { term: 'makoto shinkai', replacement: 'anime landscape art style', category: 'artist', variations: ['shinkai style'] },
  { term: 'takehiko inoue', replacement: 'manga art style', category: 'artist' },
  { term: 'junji ito', replacement: 'horror manga style', category: 'artist' },
  { term: 'hayao miyazaki', replacement: 'whimsical anime style', category: 'artist', variations: ['miyazaki style'] },
  { term: 'akira toriyama', replacement: 'action manga style', category: 'artist' },
  { term: 'yoshitaka amano', replacement: 'ethereal fantasy illustration style', category: 'artist' },
  { term: 'boris vallejo', replacement: 'heroic fantasy art style', category: 'artist' },
  { term: 'luis royo', replacement: 'dark fantasy art style', category: 'artist' },
  { term: 'simon stalenhag', replacement: 'retro sci-fi art style', category: 'artist', variations: ['simon stålenhag'] },
  { term: 'andrew wyeth', replacement: 'american realist painting style', category: 'artist' },
  { term: 'norman rockwell', replacement: 'americana illustration style', category: 'artist' },
];

/**
 * Studios (12 entries)
 */
const STUDIOS: IPTerm[] = [
  { term: 'studio ghibli', replacement: 'japanese animation studio style', category: 'studio', variations: ['ghibli style', 'ghibli'] },
  { term: 'pixar', replacement: '3d animation studio style', category: 'studio', variations: ['pixar style'] },
  { term: 'dreamworks', replacement: 'animation studio style', category: 'studio' },
  { term: 'disney style', replacement: 'classic animation style', category: 'studio' },
  { term: 'marvel studios', replacement: 'superhero movie style', category: 'studio' },
  { term: 'dc studios', replacement: 'superhero movie style', category: 'studio', variations: ['dceu style'] },
  { term: 'weta workshop', replacement: 'high fantasy creature design', category: 'studio' },
  { term: 'ilm', replacement: 'visual effects style', category: 'studio', variations: ['industrial light and magic'] },
  { term: 'blizzard', replacement: 'stylized game art', category: 'studio', variations: ['blizzard style', 'blizzard entertainment'] },
  { term: 'riot games', replacement: 'stylized character art', category: 'studio', variations: ['league of legends style'] },
  { term: 'fromsoftware', replacement: 'dark gothic game art', category: 'studio', variations: ['from software', 'souls-like'] },
  { term: 'cdpr', replacement: 'realistic game art', category: 'studio', variations: ['cd projekt red'] },
];

/**
 * Franchises (30 entries)
 */
const FRANCHISES: IPTerm[] = [
  { term: 'star wars', replacement: 'space opera universe', category: 'franchise', variations: ['starwars', 'a galaxy far far away'] },
  { term: 'harry potter', replacement: 'wizarding school universe', category: 'franchise', variations: ['hogwarts', 'wizarding world'] },
  { term: 'lord of the rings', replacement: 'high fantasy epic', category: 'franchise', variations: ['lotr', 'middle earth', 'middle-earth'] },
  { term: 'game of thrones', replacement: 'medieval fantasy drama', category: 'franchise', variations: ['got', 'westeros', 'house of the dragon'] },
  { term: 'pokemon', replacement: 'creature collection universe', category: 'franchise', variations: ['pokémon'] },
  { term: 'dragon ball', replacement: 'martial arts anime universe', category: 'franchise', variations: ['dragonball', 'dbz'] },
  { term: 'one piece', replacement: 'pirate adventure anime', category: 'franchise' },
  { term: 'attack on titan', replacement: 'giant creature anime', category: 'franchise', variations: ['aot', 'shingeki no kyojin'] },
  { term: 'my hero academia', replacement: 'superhero school anime', category: 'franchise', variations: ['mha', 'boku no hero'] },
  { term: 'demon slayer', replacement: 'samurai demon anime', category: 'franchise', variations: ['kimetsu no yaiba'] },
  { term: 'jujutsu kaisen', replacement: 'supernatural battle anime', category: 'franchise', variations: ['jjk'] },
  { term: 'final fantasy', replacement: 'epic rpg universe', category: 'franchise', variations: ['ff', 'ffxiv', 'ff7'] },
  { term: 'the witcher', replacement: 'dark fantasy monster hunter', category: 'franchise', variations: ['witcher'] },
  { term: 'elder scrolls', replacement: 'open world fantasy rpg', category: 'franchise', variations: ['skyrim', 'oblivion'] },
  { term: 'world of warcraft', replacement: 'fantasy mmo universe', category: 'franchise', variations: ['wow', 'warcraft'] },
  { term: 'league of legends', replacement: 'fantasy battle arena', category: 'franchise', variations: ['lol', 'arcane'] },
  { term: 'overwatch', replacement: 'team shooter universe', category: 'franchise' },
  { term: 'halo', replacement: 'sci-fi military universe', category: 'franchise' },
  { term: 'mass effect', replacement: 'space opera rpg', category: 'franchise' },
  { term: 'warhammer', replacement: 'grimdark fantasy universe', category: 'franchise', variations: ['warhammer 40k', '40k'] },
  { term: 'dungeons and dragons', replacement: 'tabletop fantasy rpg', category: 'franchise', variations: ['d&d', 'dnd'] },
  { term: 'transformers', replacement: 'robot action franchise', category: 'franchise' },
  { term: 'teenage mutant ninja turtles', replacement: 'mutant heroes', category: 'franchise', variations: ['tmnt'] },
  { term: 'power rangers', replacement: 'team hero franchise', category: 'franchise' },
  { term: 'stranger things', replacement: 'supernatural 80s horror', category: 'franchise' },
  { term: 'the mandalorian', replacement: 'space bounty hunter', category: 'franchise', variations: ['grogu', 'baby yoda'] },
  { term: 'avengers', replacement: 'superhero team', category: 'franchise' },
  { term: 'justice league', replacement: 'superhero team', category: 'franchise' },
  { term: 'x-men', replacement: 'mutant superhero team', category: 'franchise', variations: ['xmen'] },
  { term: 'the matrix', replacement: 'cyberpunk simulation universe', category: 'franchise' },
];

/**
 * Movie/TV Characters (18 entries)
 */
const MOVIE_TV_CHARACTERS: IPTerm[] = [
  { term: 'james bond', replacement: 'suave secret agent', category: 'movie_character', variations: ['007', 'bond'] },
  { term: 'indiana jones', replacement: 'adventurer archaeologist', category: 'movie_character', variations: ['indy'] },
  { term: 'darth vader', replacement: 'dark armored villain', category: 'movie_character' },
  { term: 'yoda', replacement: 'wise small green master', category: 'movie_character', variations: ['master yoda'] },
  { term: 'gandalf', replacement: 'wise wizard with staff', category: 'movie_character', variations: ['gandalf the grey', 'gandalf the white'] },
  { term: 'frodo', replacement: 'small fantasy hero', category: 'movie_character', variations: ['frodo baggins'] },
  { term: 'aragorn', replacement: 'rugged ranger king', category: 'movie_character', variations: ['strider'] },
  { term: 'legolas', replacement: 'elven archer warrior', category: 'movie_character' },
  { term: 'jack sparrow', replacement: 'eccentric pirate captain', category: 'movie_character', variations: ['captain jack sparrow'] },
  { term: 'terminator', replacement: 'robotic assassin', category: 'movie_character', variations: ['t-800', 't-1000'] },
  { term: 'john wick', replacement: 'skilled assassin', category: 'movie_character' },
  { term: 'neo', replacement: 'chosen one in digital world', category: 'movie_character', variations: ['the matrix neo', 'the one'] },
  { term: 'walter white', replacement: 'chemistry teacher turned criminal', category: 'tv_character', variations: ['heisenberg'] },
  { term: 'jon snow', replacement: 'northern fantasy warrior', category: 'tv_character' },
  { term: 'daenerys', replacement: 'dragon queen character', category: 'tv_character', variations: ['daenerys targaryen', 'khaleesi'] },
  { term: 'sherlock holmes', replacement: 'brilliant detective', category: 'movie_character', variations: ['sherlock'] },
  { term: 'the doctor', replacement: 'time-traveling alien', category: 'tv_character', variations: ['doctor who'] },
  { term: 'eleven', replacement: 'psychic girl character', category: 'tv_character', variations: ['el'] },
];

// =============================================================================
// CELEBRITY PATTERNS
// =============================================================================

/**
 * Common celebrity name patterns and specific high-profile names (52 entries)
 */
const CELEBRITY_PATTERNS: string[] = [
  // Actors
  'tom hanks', 'tom cruise', 'leonardo dicaprio', 'brad pitt', 'johnny depp',
  'keanu reeves', 'ryan gosling', 'chris hemsworth', 'robert downey jr',
  'scarlett johansson', 'margot robbie', 'jennifer lawrence', 'emma watson',
  'natalie portman', 'anne hathaway', 'gal gadot', 'zendaya', 'timothee chalamet',
  
  // Musicians
  'taylor swift', 'beyonce', 'rihanna', 'lady gaga', 'ariana grande',
  'billie eilish', 'dua lipa', 'drake', 'kanye west', 'ye', 'the weeknd',
  'travis scott', 'post malone', 'ed sheeran', 'justin bieber', 'bts',
  
  // Tech figures
  'elon musk', 'mark zuckerberg', 'jeff bezos', 'bill gates', 'steve jobs',
  
  // Athletes
  'lebron james', 'michael jordan', 'cristiano ronaldo', 'lionel messi',
  'serena williams', 'tom brady', 'kobe bryant',
  
  // Models/Influencers
  'kim kardashian', 'kylie jenner', 'kendall jenner', 'bella hadid', 'gigi hadid',
  
  // Historical figures (for deepfake concerns)
  'marilyn monroe', 'audrey hepburn', 'elvis presley', 'michael jackson',
];

// =============================================================================
// COMBINE ALL BLOCKLISTS
// =============================================================================

const ALL_IP_TERMS: IPTerm[] = [
  ...DISNEY_CHARACTERS,
  ...MARVEL_CHARACTERS,
  ...DC_CHARACTERS,
  ...ANIME_CHARACTERS,
  ...NINTENDO_CHARACTERS,
  ...VIDEO_GAME_CHARACTERS,
  ...TECH_BRANDS,
  ...FASHION_BRANDS,
  ...FOOD_BRANDS,
  ...AUTOMOTIVE_BRANDS,
  ...ARTISTS,
  ...STUDIOS,
  ...FRANCHISES,
  ...MOVIE_TV_CHARACTERS,
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a regex pattern for a term and its variations
 * Uses word boundaries to avoid partial matches
 */
function createTermPattern(term: IPTerm): RegExp {
  const allTerms = [term.term, ...(term.variations || [])];
  const escapedTerms = allTerms.map(t => escapeRegex(t));
  const pattern = `\\b(${escapedTerms.join('|')})\\b`;
  return new RegExp(pattern, 'gi');
}

/**
 * Creates patterns for celebrity names
 */
function createCelebrityPatterns(): RegExp[] {
  return CELEBRITY_PATTERNS.map(name => {
    const escaped = escapeRegex(name);
    return new RegExp(`\\b${escaped}\\b`, 'gi');
  });
}

/**
 * Find all matches of a pattern in a string
 * Compatible replacement for String.prototype.matchAll
 */
function findAllMatches(str: string, pattern: RegExp): Array<{ match: string; index: number }> {
  const results: Array<{ match: string; index: number }> = [];
  const globalPattern = new RegExp(pattern.source, 'gi');
  let match: RegExpExecArray | null;
  
  while ((match = globalPattern.exec(str)) !== null) {
    results.push({ match: match[0], index: match.index });
  }
  
  return results;
}

// =============================================================================
// MAIN FILTER FUNCTIONS
// =============================================================================

/**
 * Detects IP content in a prompt and returns detailed information
 * about what was found.
 */
export function detectIPContent(prompt: string): IPDetectionResult {
  const normalizedPrompt = prompt.toLowerCase();
  const detectedTerms: string[] = [];
  const categories: Set<IPCategory> = new Set();
  const details: IPDetectionResult['details'] = [];

  // Check all IP terms
  for (const term of ALL_IP_TERMS) {
    const pattern = createTermPattern(term);
    const matches = findAllMatches(normalizedPrompt, pattern);
    
    for (const matchInfo of matches) {
      const matchedText = matchInfo.match;
      if (!detectedTerms.includes(matchedText)) {
        detectedTerms.push(matchedText);
        categories.add(term.category);
        details.push({
          term: matchedText,
          category: term.category,
          position: matchInfo.index,
          suggestedReplacement: term.replacement,
        });
      }
    }
  }

  // Check celebrity patterns
  const celebrityPatterns = createCelebrityPatterns();
  for (const pattern of celebrityPatterns) {
    const matches = findAllMatches(normalizedPrompt, pattern);
    
    for (const matchInfo of matches) {
      const matchedText = matchInfo.match;
      if (!detectedTerms.includes(matchedText)) {
        detectedTerms.push(matchedText);
        categories.add('celebrity');
        details.push({
          term: matchedText,
          category: 'celebrity',
          position: matchInfo.index,
          suggestedReplacement: 'person',
        });
      }
    }
  }

  return {
    hasIP: detectedTerms.length > 0,
    detectedTerms,
    categories: Array.from(categories),
    details: details.sort((a, b) => a.position - b.position),
  };
}

/**
 * Sanitizes a prompt by replacing IP content with safe alternatives.
 * Returns the cleaned prompt.
 */
export function sanitizePromptForIP(prompt: string): string {
  let sanitizedPrompt = prompt;

  // Replace all IP terms
  for (const term of ALL_IP_TERMS) {
    const pattern = createTermPattern(term);
    sanitizedPrompt = sanitizedPrompt.replace(pattern, term.replacement);
  }

  // Replace celebrity names with "person"
  const celebrityPatterns = createCelebrityPatterns();
  for (const pattern of celebrityPatterns) {
    sanitizedPrompt = sanitizedPrompt.replace(pattern, 'person');
  }

  // Clean up any double spaces that might have been created
  sanitizedPrompt = sanitizedPrompt.replace(/\s+/g, ' ').trim();

  return sanitizedPrompt;
}

/**
 * Extended sanitization that returns detailed information about changes made
 */
export function sanitizePromptForIPDetailed(prompt: string): SanitizationResult {
  let sanitizedPrompt = prompt;
  const replacements: SanitizationResult['replacements'] = [];

  // Replace all IP terms
  for (const term of ALL_IP_TERMS) {
    const pattern = createTermPattern(term);
    const matches = findAllMatches(prompt, pattern);
    
    for (const matchInfo of matches) {
      const matchedText = matchInfo.match;
      const found = replacements.find(r => 
        r.original.toLowerCase() === matchedText.toLowerCase()
      );
      if (!found) {
        replacements.push({
          original: matchedText,
          replacement: term.replacement,
          category: term.category,
        });
      }
    }
    
    sanitizedPrompt = sanitizedPrompt.replace(pattern, term.replacement);
  }

  // Replace celebrity names
  const celebrityPatternsArray = createCelebrityPatterns();
  for (const pattern of celebrityPatternsArray) {
    const matches = findAllMatches(prompt, pattern);
    
    for (const matchInfo of matches) {
      const matchedText = matchInfo.match;
      const found = replacements.find(r => 
        r.original.toLowerCase() === matchedText.toLowerCase()
      );
      if (!found) {
        replacements.push({
          original: matchedText,
          replacement: 'person',
          category: 'celebrity',
        });
      }
    }
    
    sanitizedPrompt = sanitizedPrompt.replace(pattern, 'person');
  }

  // Clean up whitespace
  sanitizedPrompt = sanitizedPrompt.replace(/\s+/g, ' ').trim();

  return {
    originalPrompt: prompt,
    sanitizedPrompt,
    wasModified: prompt !== sanitizedPrompt,
    replacements,
  };
}

/**
 * Checks if a prompt is safe (contains no IP content)
 */
export function isPromptSafe(prompt: string): boolean {
  const detection = detectIPContent(prompt);
  return !detection.hasIP;
}

/**
 * Returns the list of all blocked categories
 */
export function getBlockedCategories(): IPCategory[] {
  return [
    'disney_character',
    'marvel_character',
    'dc_character',
    'anime_character',
    'nintendo_character',
    'video_game_character',
    'tech_brand',
    'fashion_brand',
    'food_brand',
    'luxury_brand',
    'automotive_brand',
    'artist',
    'studio',
    'celebrity',
    'franchise',
    'movie_character',
    'tv_character',
  ];
}

/**
 * Get the total count of IP terms being filtered
 */
export function getIPTermCount(): {
  total: number;
  byCategory: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  
  for (const term of ALL_IP_TERMS) {
    const count = 1 + (term.variations?.length || 0);
    byCategory[term.category] = (byCategory[term.category] || 0) + count;
  }
  
  // Add celebrity count
  byCategory['celebrity'] = CELEBRITY_PATTERNS.length;
  
  const total = Object.values(byCategory).reduce((sum, count) => sum + count, 0);
  
  return { total, byCategory };
}

/**
 * Adds a custom IP term to the filter at runtime
 * Note: This only affects the current session
 */
export function addCustomIPTerm(term: IPTerm): void {
  ALL_IP_TERMS.push(term);
}

/**
 * Generate a warning message for detected IP content
 */
export function generateIPWarning(detection: IPDetectionResult): string {
  if (!detection.hasIP) {
    return '';
  }

  const categoryLabels: Record<IPCategory, string> = {
    disney_character: 'Disney character',
    marvel_character: 'Marvel character',
    dc_character: 'DC character',
    anime_character: 'Anime character',
    nintendo_character: 'Nintendo character',
    video_game_character: 'Video game character',
    tech_brand: 'Tech brand',
    fashion_brand: 'Fashion brand',
    food_brand: 'Food/beverage brand',
    luxury_brand: 'Luxury brand',
    automotive_brand: 'Automotive brand',
    artist: 'Artist name/style',
    studio: 'Studio name/style',
    celebrity: 'Celebrity name',
    franchise: 'Franchise/IP',
    movie_character: 'Movie character',
    tv_character: 'TV character',
  };

  const uniqueCategories = detection.categories
    .map(cat => categoryLabels[cat])
    .filter((v, i, a) => a.indexOf(v) === i);

  let warning = `⚠️ Potential IP content detected:\n`;
  warning += `Found ${detection.detectedTerms.length} term(s) in ${uniqueCategories.length} category(ies):\n`;
  warning += `Categories: ${uniqueCategories.join(', ')}\n`;
  warning += `Terms: ${detection.detectedTerms.slice(0, 5).join(', ')}`;
  
  if (detection.detectedTerms.length > 5) {
    warning += ` (+${detection.detectedTerms.length - 5} more)`;
  }

  return warning;
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  ALL_IP_TERMS,
  CELEBRITY_PATTERNS,
  DISNEY_CHARACTERS,
  MARVEL_CHARACTERS,
  DC_CHARACTERS,
  ANIME_CHARACTERS,
  NINTENDO_CHARACTERS,
  VIDEO_GAME_CHARACTERS,
  TECH_BRANDS,
  FASHION_BRANDS,
  FOOD_BRANDS,
  AUTOMOTIVE_BRANDS,
  ARTISTS,
  STUDIOS,
  FRANCHISES,
  MOVIE_TV_CHARACTERS,
};

export default {
  detectIPContent,
  sanitizePromptForIP,
  sanitizePromptForIPDetailed,
  isPromptSafe,
  getBlockedCategories,
  getIPTermCount,
  addCustomIPTerm,
  generateIPWarning,
};
