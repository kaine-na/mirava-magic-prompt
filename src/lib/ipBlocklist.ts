/**
 * IP Blocklist Data Structure
 * 
 * This module contains the comprehensive blocklist of intellectual property
 * terms (copyrighted characters, celebrity names, brand names, artist names,
 * and franchise names) along with their generic replacements.
 * 
 * @module ipBlocklist
 */

/**
 * Categories of intellectual property
 */
export type IPCategory = 
  | 'character'    // Fictional characters from any media
  | 'brand'        // Company names, product names, trademarks
  | 'celebrity'    // Real people (actors, musicians, athletes, etc.)
  | 'artist'       // Artists, photographers, illustrators
  | 'franchise'    // Entertainment franchises and universes
  | 'game'         // Video game specific IP
  | 'anime'        // Anime/manga specific IP
  | 'music';       // Music artists and bands

/**
 * Single entry in the IP blocklist
 */
export interface IPBlocklistEntry {
  /** The term to detect (string for exact match, RegExp for patterns) */
  term: string | RegExp;
  /** The generic replacement text */
  replacement: string;
  /** Category of IP for filtering and analytics */
  category: IPCategory;
  /** Optional: Related terms or aliases */
  aliases?: string[];
  /** Optional: Notes about this entry */
  notes?: string;
}

/**
 * Comprehensive IP Blocklist
 * 
 * This blocklist is organized by category and designed to catch
 * the most commonly requested IP terms in AI image generation.
 * 
 * Design principles:
 * - Replacements describe WHAT something looks like, not WHO it is
 * - Replacements preserve the creative intent while avoiding IP
 * - Regex patterns are used for names with variations
 * - Aliases are tracked for analytics but entries exist separately
 */
export const IP_BLOCKLIST: readonly IPBlocklistEntry[] = Object.freeze([
  // ============================================================
  // CHARACTERS - Superheroes (DC)
  // ============================================================
  {
    term: 'Batman',
    replacement: 'dark vigilante hero with cape and pointed cowl',
    category: 'character',
    aliases: ['The Batman', 'Dark Knight', 'Bruce Wayne', 'Bat-Man'],
  },
  {
    term: 'Dark Knight',
    replacement: 'dark vigilante hero with cape and pointed cowl',
    category: 'character',
  },
  {
    term: 'Bruce Wayne',
    replacement: 'wealthy dark-haired businessman',
    category: 'character',
  },
  {
    term: 'Superman',
    replacement: 'powerful flying hero in blue suit with red cape',
    category: 'character',
    aliases: ['Clark Kent', 'Man of Steel', 'Kal-El'],
  },
  {
    term: 'Man of Steel',
    replacement: 'powerful flying hero in blue suit with red cape',
    category: 'character',
  },
  {
    term: 'Wonder Woman',
    replacement: 'amazonian warrior princess with tiara and lasso',
    category: 'character',
    aliases: ['Diana Prince'],
  },
  {
    term: 'Joker',
    replacement: 'maniacal clown villain with green hair and white face',
    category: 'character',
  },
  {
    term: 'Harley Quinn',
    replacement: 'acrobatic villain in red and black harlequin costume',
    category: 'character',
  },
  {
    term: 'Aquaman',
    replacement: 'underwater king with trident and scaled armor',
    category: 'character',
  },
  {
    term: 'Flash',
    replacement: 'speedster hero in red suit with lightning bolt emblem',
    category: 'character',
  },
  {
    term: 'Green Lantern',
    replacement: 'cosmic hero with glowing green power ring',
    category: 'character',
  },
  {
    term: 'Catwoman',
    replacement: 'agile thief in black cat-themed bodysuit',
    category: 'character',
    aliases: ['Selina Kyle'],
  },

  // ============================================================
  // CHARACTERS - Superheroes (Marvel)
  // ============================================================
  {
    term: 'Spider-Man',
    replacement: 'web-slinging superhero in red and blue suit with web pattern',
    category: 'character',
    aliases: ['Spiderman', 'Spider Man', 'Peter Parker', 'Miles Morales'],
  },
  {
    term: 'Spiderman',
    replacement: 'web-slinging superhero in red and blue suit with web pattern',
    category: 'character',
  },
  {
    term: 'Peter Parker',
    replacement: 'young photographer with secret heroic identity',
    category: 'character',
  },
  {
    term: 'Iron Man',
    replacement: 'armored tech hero in red and gold powered suit',
    category: 'character',
    aliases: ['Ironman', 'Tony Stark'],
  },
  {
    term: 'Ironman',
    replacement: 'armored tech hero in red and gold powered suit',
    category: 'character',
  },
  {
    term: 'Tony Stark',
    replacement: 'genius billionaire inventor with goatee',
    category: 'character',
  },
  {
    term: 'Captain America',
    replacement: 'patriotic super soldier with round shield and star emblem',
    category: 'character',
    aliases: ['Steve Rogers', 'Cap'],
  },
  {
    term: 'Thor',
    replacement: 'norse thunder god with hammer and flowing cape',
    category: 'character',
  },
  {
    term: 'Hulk',
    replacement: 'massive green-skinned muscular giant',
    category: 'character',
    aliases: ['Bruce Banner', 'Incredible Hulk'],
  },
  {
    term: 'Incredible Hulk',
    replacement: 'massive green-skinned muscular giant',
    category: 'character',
  },
  {
    term: 'Black Widow',
    replacement: 'skilled spy in black tactical suit',
    category: 'character',
    aliases: ['Natasha Romanoff'],
  },
  {
    term: 'Wolverine',
    replacement: 'feral mutant with metal claws and yellow suit',
    category: 'character',
    aliases: ['Logan'],
  },
  {
    term: 'Deadpool',
    replacement: 'wisecracking mercenary in red and black suit with katanas',
    category: 'character',
    aliases: ['Wade Wilson', 'Merc with a Mouth'],
  },
  {
    term: 'Thanos',
    replacement: 'purple-skinned cosmic titan with golden gauntlet',
    category: 'character',
  },
  {
    term: 'Black Panther',
    replacement: 'agile warrior king in sleek black vibranium suit',
    category: 'character',
    aliases: ["T'Challa"],
  },
  {
    term: 'Doctor Strange',
    replacement: 'sorcerer supreme with red cloak and mystical arts',
    category: 'character',
    aliases: ['Dr. Strange', 'Stephen Strange'],
  },
  {
    term: 'Scarlet Witch',
    replacement: 'powerful sorceress with red magic and headdress',
    category: 'character',
    aliases: ['Wanda Maximoff'],
  },
  {
    term: 'Wanda Maximoff',
    replacement: 'powerful sorceress with red magic',
    category: 'character',
  },
  {
    term: 'Venom',
    replacement: 'black symbiote creature with white spider symbol and fangs',
    category: 'character',
  },
  {
    term: 'Groot',
    replacement: 'sentient tree creature',
    category: 'character',
  },
  {
    term: 'Rocket Raccoon',
    replacement: 'anthropomorphic raccoon with weapons',
    category: 'character',
  },
  {
    term: 'Loki',
    replacement: 'trickster god with horned helmet and green cape',
    category: 'character',
  },
  {
    term: 'Vision',
    replacement: 'android hero with red skin and mind gem',
    category: 'character',
  },
  {
    term: 'Ant-Man',
    replacement: 'size-changing hero with helmet and red suit',
    category: 'character',
  },

  // ============================================================
  // CHARACTERS - Star Wars
  // ============================================================
  {
    term: 'Darth Vader',
    replacement: 'dark armored villain with black helmet, mask, and cape',
    category: 'character',
    aliases: ['Vader', 'Anakin Skywalker'],
  },
  {
    term: 'Luke Skywalker',
    replacement: 'young hero with laser sword in robes',
    category: 'character',
  },
  {
    term: 'Yoda',
    replacement: 'small green elderly alien sage with pointed ears',
    category: 'character',
    aliases: ['Baby Yoda', 'Grogu'],
  },
  {
    term: 'Baby Yoda',
    replacement: 'small green alien child with large ears and eyes',
    category: 'character',
  },
  {
    term: 'Grogu',
    replacement: 'small green alien child with large ears and eyes',
    category: 'character',
  },
  {
    term: 'Obi-Wan Kenobi',
    replacement: 'bearded warrior monk with laser sword',
    category: 'character',
    aliases: ['Obi Wan', 'Kenobi'],
  },
  {
    term: 'Princess Leia',
    replacement: 'royal leader with iconic hair buns in white gown',
    category: 'character',
    aliases: ['Leia Organa'],
  },
  {
    term: 'Han Solo',
    replacement: 'roguish smuggler pilot with blaster',
    category: 'character',
  },
  {
    term: 'Chewbacca',
    replacement: 'tall furry alien co-pilot with bandolier',
    category: 'character',
    aliases: ['Chewie'],
  },
  {
    term: 'Stormtrooper',
    replacement: 'soldier in white plastic armor and helmet',
    category: 'character',
  },
  {
    term: 'R2-D2',
    replacement: 'small cylindrical blue and white robot',
    category: 'character',
    aliases: ['R2D2', 'Artoo'],
  },
  {
    term: 'R2D2',
    replacement: 'small cylindrical blue and white robot',
    category: 'character',
  },
  {
    term: 'C-3PO',
    replacement: 'golden humanoid protocol robot',
    category: 'character',
    aliases: ['C3PO', 'Threepio'],
  },
  {
    term: 'C3PO',
    replacement: 'golden humanoid protocol robot',
    category: 'character',
  },
  {
    term: 'Kylo Ren',
    replacement: 'dark warrior with crossguard laser sword and mask',
    category: 'character',
  },
  {
    term: 'The Mandalorian',
    replacement: 'armored bounty hunter with T-visor helmet',
    category: 'character',
    aliases: ['Mando', 'Din Djarin'],
  },
  {
    term: 'Boba Fett',
    replacement: 'armored bounty hunter with jet pack and T-visor helmet',
    category: 'character',
  },
  {
    term: 'Palpatine',
    replacement: 'hooded dark lord with wrinkled face',
    category: 'character',
    aliases: ['Emperor Palpatine', 'Darth Sidious'],
  },

  // ============================================================
  // CHARACTERS - Disney Animated
  // ============================================================
  {
    term: 'Mickey Mouse',
    replacement: 'cheerful cartoon mouse with round ears and red shorts',
    category: 'character',
    aliases: ['Mickey'],
  },
  {
    term: 'Minnie Mouse',
    replacement: 'female cartoon mouse with polka dot bow and dress',
    category: 'character',
    aliases: ['Minnie'],
  },
  {
    term: 'Donald Duck',
    replacement: 'cartoon duck in sailor suit with blue hat',
    category: 'character',
  },
  {
    term: 'Goofy',
    replacement: 'tall clumsy cartoon dog in casual clothes',
    category: 'character',
  },
  {
    term: 'Elsa',
    replacement: 'ice princess with platinum blonde braid and blue gown',
    category: 'character',
  },
  {
    term: 'Anna',
    replacement: 'cheerful princess with strawberry blonde braids',
    category: 'character',
  },
  {
    term: 'Moana',
    replacement: 'polynesian princess with curly dark hair on ocean voyage',
    category: 'character',
  },
  {
    term: 'Rapunzel',
    replacement: 'princess with extremely long golden magical hair',
    category: 'character',
  },
  {
    term: 'Cinderella',
    replacement: 'princess in blue ball gown with glass slippers',
    category: 'character',
  },
  {
    term: 'Ariel',
    replacement: 'red-haired mermaid princess with purple seashell top',
    category: 'character',
  },
  {
    term: 'Belle',
    replacement: 'brunette princess in golden yellow ball gown',
    category: 'character',
  },
  {
    term: 'Jasmine',
    replacement: 'Arabian princess with long black hair and blue outfit',
    category: 'character',
  },
  {
    term: 'Mulan',
    replacement: 'Chinese warrior woman with black hair and armor',
    category: 'character',
  },
  {
    term: 'Pocahontas',
    replacement: 'Native American woman with long flowing black hair',
    category: 'character',
  },
  {
    term: 'Simba',
    replacement: 'young lion cub destined to be king',
    category: 'character',
  },
  {
    term: 'Stitch',
    replacement: 'blue alien creature with large ears and koala-like appearance',
    category: 'character',
  },
  {
    term: 'Olaf',
    replacement: 'cheerful animated snowman with carrot nose',
    category: 'character',
  },
  {
    term: 'Woody',
    replacement: 'cowboy doll with pull-string and sheriff badge',
    category: 'character',
  },
  {
    term: 'Buzz Lightyear',
    replacement: 'space ranger action figure with wings and laser',
    category: 'character',
  },
  {
    term: 'Maleficent',
    replacement: 'dark fairy villain with horned headdress',
    category: 'character',
  },
  {
    term: 'Ursula',
    replacement: 'sea witch with octopus tentacles and white hair',
    category: 'character',
  },

  // ============================================================
  // CHARACTERS - Video Games (Nintendo)
  // ============================================================
  {
    term: 'Mario',
    replacement: 'italian plumber with red cap, mustache, and overalls',
    category: 'character',
    aliases: ['Super Mario'],
  },
  {
    term: 'Super Mario',
    replacement: 'italian plumber with red cap, mustache, and overalls',
    category: 'character',
  },
  {
    term: 'Luigi',
    replacement: 'tall green-clad plumber with mustache',
    category: 'character',
  },
  {
    term: 'Princess Peach',
    replacement: 'blonde princess in pink gown with crown',
    category: 'character',
    aliases: ['Peach'],
  },
  {
    term: 'Bowser',
    replacement: 'large spiky-shelled turtle dragon king',
    category: 'character',
  },
  {
    term: 'Toad',
    replacement: 'small mushroom-headed character with spots',
    category: 'character',
  },
  {
    term: 'Yoshi',
    replacement: 'friendly green dinosaur with saddle',
    category: 'character',
  },
  {
    term: 'Link',
    replacement: 'elf-eared hero in green tunic with sword and shield',
    category: 'character',
  },
  {
    term: 'Zelda',
    replacement: 'elven princess with pointed ears and royal attire',
    category: 'character',
    aliases: ['Princess Zelda'],
  },
  {
    term: 'Ganondorf',
    replacement: 'dark lord villain with red hair and armor',
    category: 'character',
    aliases: ['Ganon'],
  },
  {
    term: 'Pikachu',
    replacement: 'small yellow electric rodent with red cheeks and lightning tail',
    category: 'character',
  },
  {
    term: 'Charizard',
    replacement: 'orange fire-breathing dragon with flame tail',
    category: 'character',
  },
  {
    term: 'Eevee',
    replacement: 'fluffy brown fox-like creature with bushy tail',
    category: 'character',
  },
  {
    term: 'Mewtwo',
    replacement: 'powerful psychic humanoid feline creature',
    category: 'character',
  },
  {
    term: 'Gengar',
    replacement: 'purple ghost creature with mischievous grin',
    category: 'character',
  },
  {
    term: 'Bulbasaur',
    replacement: 'small blue-green creature with plant bulb on back',
    category: 'character',
  },
  {
    term: 'Squirtle',
    replacement: 'small blue turtle creature with curly tail',
    category: 'character',
  },
  {
    term: 'Charmander',
    replacement: 'small orange lizard with flame on tail',
    category: 'character',
  },
  {
    term: 'Jigglypuff',
    replacement: 'round pink singing creature with large eyes',
    category: 'character',
  },
  {
    term: 'Samus Aran',
    replacement: 'armored bounty hunter in orange power suit',
    category: 'character',
    aliases: ['Samus'],
  },
  {
    term: 'Kirby',
    replacement: 'round pink puffball creature with cute face',
    category: 'character',
  },
  {
    term: 'Donkey Kong',
    replacement: 'muscular gorilla with red necktie',
    category: 'character',
    aliases: ['DK'],
  },

  // ============================================================
  // CHARACTERS - Video Games (Other)
  // ============================================================
  {
    term: 'Sonic',
    replacement: 'blue anthropomorphic hedgehog with red sneakers',
    category: 'character',
    aliases: ['Sonic the Hedgehog'],
  },
  {
    term: 'Sonic the Hedgehog',
    replacement: 'blue anthropomorphic hedgehog with red sneakers',
    category: 'character',
  },
  {
    term: 'Master Chief',
    replacement: 'armored super soldier in green powered armor with visor',
    category: 'character',
  },
  {
    term: 'Kratos',
    replacement: 'muscular bald warrior with red tattoo and chain weapons',
    category: 'character',
  },
  {
    term: 'Lara Croft',
    replacement: 'athletic female adventurer and archaeologist',
    category: 'character',
  },
  {
    term: 'Cloud Strife',
    replacement: 'spiky blonde-haired warrior with massive sword',
    category: 'character',
    aliases: ['Cloud'],
  },
  {
    term: 'Geralt of Rivia',
    replacement: 'white-haired monster hunter with dual swords',
    category: 'character',
    aliases: ['Geralt', 'The Witcher'],
  },
  {
    term: 'Steve',
    replacement: 'blocky voxel character in blue shirt',
    category: 'character',
    notes: 'Minecraft character',
  },
  {
    term: 'Creeper',
    replacement: 'green blocky explosive creature',
    category: 'character',
    notes: 'Minecraft creature',
  },
  {
    term: 'Enderman',
    replacement: 'tall black blocky creature with purple eyes',
    category: 'character',
    notes: 'Minecraft creature',
  },

  // ============================================================
  // CHARACTERS - Anime/Manga
  // ============================================================
  {
    term: 'Goku',
    replacement: 'spiky black-haired martial artist in orange gi',
    category: 'anime',
    aliases: ['Son Goku', 'Kakarot'],
  },
  {
    term: 'Vegeta',
    replacement: 'proud spiky-haired warrior prince in armor',
    category: 'anime',
  },
  {
    term: 'Naruto',
    replacement: 'blonde ninja with whisker marks and orange outfit',
    category: 'anime',
    aliases: ['Naruto Uzumaki'],
  },
  {
    term: 'Sasuke',
    replacement: 'dark-haired ninja with stoic expression',
    category: 'anime',
    aliases: ['Sasuke Uchiha'],
  },
  {
    term: 'Kakashi',
    replacement: 'silver-haired ninja with mask covering face',
    category: 'anime',
  },
  {
    term: 'Luffy',
    replacement: 'cheerful pirate captain with straw hat',
    category: 'anime',
    aliases: ['Monkey D. Luffy'],
  },
  {
    term: 'Zoro',
    replacement: 'green-haired swordsman with three katanas',
    category: 'anime',
    aliases: ['Roronoa Zoro'],
  },
  {
    term: 'Tanjiro',
    replacement: 'kind-hearted demon slayer with checkered haori',
    category: 'anime',
    aliases: ['Tanjiro Kamado'],
  },
  {
    term: 'Nezuko',
    replacement: 'demon girl with bamboo muzzle and pink kimono',
    category: 'anime',
  },
  {
    term: 'Eren',
    replacement: 'determined soldier with titan-shifting powers',
    category: 'anime',
    aliases: ['Eren Yeager', 'Eren Jaeger'],
  },
  {
    term: 'Mikasa',
    replacement: 'skilled female soldier with red scarf',
    category: 'anime',
    aliases: ['Mikasa Ackerman'],
  },
  {
    term: 'Levi',
    replacement: 'short skilled soldier with black hair and stern expression',
    category: 'anime',
    aliases: ['Levi Ackerman'],
  },
  {
    term: 'Sailor Moon',
    replacement: 'magical girl with blonde odango hairstyle and sailor uniform',
    category: 'anime',
    aliases: ['Usagi Tsukino'],
  },
  {
    term: 'Totoro',
    replacement: 'large fluffy forest spirit with round belly and umbrella',
    category: 'anime',
  },
  {
    term: 'No Face',
    replacement: 'mysterious black spirit with white mask',
    category: 'anime',
    aliases: ['Kaonashi'],
    notes: 'Spirited Away character',
  },

  // ============================================================
  // CHARACTERS - Harry Potter
  // ============================================================
  {
    term: 'Harry Potter',
    replacement: 'young wizard with round glasses, dark messy hair, and lightning scar',
    category: 'character',
  },
  {
    term: 'Hermione',
    replacement: 'bushy-haired clever witch with wand',
    category: 'character',
    aliases: ['Hermione Granger'],
  },
  {
    term: 'Ron Weasley',
    replacement: 'tall red-haired wizard with freckles',
    category: 'character',
  },
  {
    term: 'Dumbledore',
    replacement: 'elderly wizard with long white beard and half-moon glasses',
    category: 'character',
    aliases: ['Albus Dumbledore'],
  },
  {
    term: 'Voldemort',
    replacement: 'pale snake-like dark wizard with no nose',
    category: 'character',
    aliases: ['Tom Riddle', 'He Who Must Not Be Named'],
  },
  {
    term: 'Snape',
    replacement: 'dark-haired wizard professor with hooked nose and black robes',
    category: 'character',
    aliases: ['Severus Snape'],
  },
  {
    term: 'Hagrid',
    replacement: 'giant-sized friendly man with wild beard and hair',
    category: 'character',
  },
  {
    term: 'Draco Malfoy',
    replacement: 'pale blonde wizard with aristocratic features',
    category: 'character',
  },

  // ============================================================
  // CHARACTERS - Lord of the Rings
  // ============================================================
  {
    term: 'Gandalf',
    replacement: 'elderly wizard with long grey beard, staff, and pointed hat',
    category: 'character',
  },
  {
    term: 'Frodo',
    replacement: 'small curly-haired halfling carrying a powerful ring',
    category: 'character',
    aliases: ['Frodo Baggins'],
  },
  {
    term: 'Legolas',
    replacement: 'blonde elven archer with long hair and bow',
    category: 'character',
  },
  {
    term: 'Aragorn',
    replacement: 'rugged ranger and rightful king with sword',
    category: 'character',
  },
  {
    term: 'Gollum',
    replacement: 'emaciated grey creature obsessed with a ring',
    category: 'character',
    aliases: ['Smeagol'],
  },
  {
    term: 'Sauron',
    replacement: 'dark lord with flaming eye atop a tower',
    category: 'character',
  },
  {
    term: 'Gimli',
    replacement: 'stout bearded dwarf warrior with axe',
    category: 'character',
  },
  {
    term: 'Bilbo',
    replacement: 'elderly halfling adventurer',
    category: 'character',
    aliases: ['Bilbo Baggins'],
  },

  // ============================================================
  // CELEBRITIES - Actors
  // ============================================================
  {
    term: /\bKeanu\s*Reeves\b/i,
    replacement: 'dark-haired male actor with kind demeanor',
    category: 'celebrity',
  },
  {
    term: /\bTom\s*Cruise\b/i,
    replacement: 'charismatic male action star',
    category: 'celebrity',
  },
  {
    term: /\bDwayne\s*Johnson\b/i,
    replacement: 'muscular bald male actor',
    category: 'celebrity',
  },
  {
    term: /\bThe\s*Rock\b/i,
    replacement: 'muscular bald male actor',
    category: 'celebrity',
  },
  {
    term: /\bScarlett\s*Johansson\b/i,
    replacement: 'blonde female actress',
    category: 'celebrity',
  },
  {
    term: /\bRobert\s*Downey\s*Jr\.?\b/i,
    replacement: 'charismatic male actor with goatee',
    category: 'celebrity',
  },
  {
    term: /\bChris\s*Hemsworth\b/i,
    replacement: 'tall blonde muscular male actor',
    category: 'celebrity',
  },
  {
    term: /\bChris\s*Evans\b/i,
    replacement: 'athletic male actor with strong features',
    category: 'celebrity',
  },
  {
    term: /\bMargot\s*Robbie\b/i,
    replacement: 'blonde australian actress',
    category: 'celebrity',
  },
  {
    term: /\bLeonardo\s*DiCaprio\b/i,
    replacement: 'acclaimed male actor',
    category: 'celebrity',
  },
  {
    term: /\bBrad\s*Pitt\b/i,
    replacement: 'handsome blonde male actor',
    category: 'celebrity',
  },
  {
    term: /\bAngelina\s*Jolie\b/i,
    replacement: 'elegant female actress with full lips',
    category: 'celebrity',
  },
  {
    term: /\bJennifer\s*Lawrence\b/i,
    replacement: 'blonde female actress',
    category: 'celebrity',
  },
  {
    term: /\bTimoth[ée]e?\s*Chalamet\b/i,
    replacement: 'young dark-haired male actor with defined features',
    category: 'celebrity',
  },
  {
    term: /\bZendaya\b/i,
    replacement: 'young female actress with elegant features',
    category: 'celebrity',
  },
  {
    term: /\bRyan\s*Reynolds\b/i,
    replacement: 'witty male actor with brown hair',
    category: 'celebrity',
  },
  {
    term: /\bRyan\s*Gosling\b/i,
    replacement: 'blonde male actor',
    category: 'celebrity',
  },
  {
    term: /\bMorgan\s*Freeman\b/i,
    replacement: 'distinguished elderly male actor with grey hair',
    category: 'celebrity',
  },
  {
    term: /\bSamuel\s*L\.?\s*Jackson\b/i,
    replacement: 'bald male actor with commanding presence',
    category: 'celebrity',
  },
  {
    term: /\bJohnny\s*Depp\b/i,
    replacement: 'eccentric male actor with dark features',
    category: 'celebrity',
  },
  {
    term: /\bEmma\s*Watson\b/i,
    replacement: 'brunette british actress',
    category: 'celebrity',
  },
  {
    term: /\bNatalie\s*Portman\b/i,
    replacement: 'petite brunette actress',
    category: 'celebrity',
  },

  // ============================================================
  // CELEBRITIES - Musicians
  // ============================================================
  {
    term: /\bTaylor\s*Swift\b/i,
    replacement: 'blonde female pop singer with red lips',
    category: 'celebrity',
  },
  {
    term: /\bBeyonc[ée]?\b/i,
    replacement: 'powerful female R&B singer',
    category: 'celebrity',
  },
  {
    term: /\bDrake\b/i,
    replacement: 'male hip hop artist with beard',
    category: 'celebrity',
  },
  {
    term: /\bRihanna\b/i,
    replacement: 'stylish female pop and R&B singer',
    category: 'celebrity',
  },
  {
    term: /\bLady\s*Gaga\b/i,
    replacement: 'avant-garde female pop artist',
    category: 'celebrity',
  },
  {
    term: /\bAriana\s*Grande\b/i,
    replacement: 'petite female pop singer with high ponytail',
    category: 'celebrity',
  },
  {
    term: /\bEd\s*Sheeran\b/i,
    replacement: 'red-haired male singer with acoustic guitar',
    category: 'celebrity',
  },
  {
    term: /\bBTS\b/i,
    replacement: 'K-pop boy band members',
    category: 'celebrity',
  },
  {
    term: /\bBillie\s*Eilish\b/i,
    replacement: 'young female singer with colorful hair',
    category: 'celebrity',
  },
  {
    term: /\bThe\s*Weeknd\b/i,
    replacement: 'male R&B singer with distinct hairstyle',
    category: 'celebrity',
  },
  {
    term: /\bPost\s*Malone\b/i,
    replacement: 'male artist with face tattoos and braids',
    category: 'celebrity',
  },
  {
    term: /\bKanye\s*West\b/i,
    replacement: 'male hip hop artist and producer',
    category: 'celebrity',
  },
  {
    term: /\bYe\b/i,
    replacement: 'male hip hop artist and producer',
    category: 'celebrity',
    notes: 'Kanye West legal name',
  },
  {
    term: /\bDoja\s*Cat\b/i,
    replacement: 'female hip hop and pop artist',
    category: 'celebrity',
  },
  {
    term: /\bNicki\s*Minaj\b/i,
    replacement: 'bold female rapper with colorful style',
    category: 'celebrity',
  },
  {
    term: /\bTravis\s*Scott\b/i,
    replacement: 'male hip hop artist',
    category: 'celebrity',
  },
  {
    term: /\bSelena\s*Gomez\b/i,
    replacement: 'brunette female pop singer',
    category: 'celebrity',
  },
  {
    term: /\bJustin\s*Bieber\b/i,
    replacement: 'young male pop singer',
    category: 'celebrity',
  },
  {
    term: /\bHarry\s*Styles\b/i,
    replacement: 'stylish male singer with curly hair',
    category: 'celebrity',
  },

  // ============================================================
  // CELEBRITIES - Athletes
  // ============================================================
  {
    term: /\bLeBron\s*James\b/i,
    replacement: 'tall basketball player',
    category: 'celebrity',
  },
  {
    term: /\bCristiano\s*Ronaldo\b/i,
    replacement: 'athletic male soccer player',
    category: 'celebrity',
  },
  {
    term: /\bLionel\s*Messi\b/i,
    replacement: 'skilled male soccer player',
    category: 'celebrity',
  },
  {
    term: /\bSerena\s*Williams\b/i,
    replacement: 'powerful female tennis player',
    category: 'celebrity',
  },
  {
    term: /\bMichael\s*Jordan\b/i,
    replacement: 'legendary basketball player with bald head',
    category: 'celebrity',
  },
  {
    term: /\bKobe\s*Bryant\b/i,
    replacement: 'legendary basketball player',
    category: 'celebrity',
  },
  {
    term: /\bTom\s*Brady\b/i,
    replacement: 'accomplished male football quarterback',
    category: 'celebrity',
  },
  {
    term: /\bUsain\s*Bolt\b/i,
    replacement: 'tall sprinter with signature pose',
    category: 'celebrity',
  },

  // ============================================================
  // CELEBRITIES - Other Public Figures
  // ============================================================
  {
    term: /\bElon\s*Musk\b/i,
    replacement: 'tech entrepreneur businessman',
    category: 'celebrity',
  },
  {
    term: /\bKim\s*Kardashian\b/i,
    replacement: 'female media personality with dark hair',
    category: 'celebrity',
  },
  {
    term: /\bKylie\s*Jenner\b/i,
    replacement: 'young female beauty mogul',
    category: 'celebrity',
  },
  {
    term: /\bMrBeast\b/i,
    replacement: 'male content creator',
    category: 'celebrity',
  },
  {
    term: /\bMr\.?\s*Beast\b/i,
    replacement: 'male content creator',
    category: 'celebrity',
  },
  {
    term: /\bPewDiePie\b/i,
    replacement: 'blonde male content creator',
    category: 'celebrity',
  },

  // ============================================================
  // ARTISTS - Digital/Contemporary (Living)
  // ============================================================
  {
    term: /\bGreg\s*Rutkowski\b/i,
    replacement: 'fantasy digital art with dramatic lighting and rich colors',
    category: 'artist',
  },
  {
    term: /\bArtgerm\b/i,
    replacement: 'polished digital illustration with vibrant colors and clean lines',
    category: 'artist',
  },
  {
    term: /\bWlop\b/i,
    replacement: 'ethereal digital painting with soft lighting and delicate features',
    category: 'artist',
  },
  {
    term: /\bRoss\s*Tran\b/i,
    replacement: 'dynamic stylized digital illustration',
    category: 'artist',
  },
  {
    term: /\bLoish\b/i,
    replacement: 'whimsical digital illustration with flowing lines and pastel colors',
    category: 'artist',
  },
  {
    term: /\bSakimichan\b/i,
    replacement: 'polished anime-influenced digital painting',
    category: 'artist',
  },
  {
    term: /\bIlya\s*Kuvshinov\b/i,
    replacement: 'soft anime-style digital portrait with delicate features',
    category: 'artist',
  },
  {
    term: /\bCraig\s*Mullins\b/i,
    replacement: 'painterly digital concept art with atmospheric depth',
    category: 'artist',
  },
  {
    term: /\bFeng\s*Zhu\b/i,
    replacement: 'dynamic sci-fi concept art with industrial design',
    category: 'artist',
  },
  {
    term: /\bJames\s*Jean\b/i,
    replacement: 'intricate surreal illustration with organic forms',
    category: 'artist',
  },
  {
    term: /\bMakoto\s*Shinkai\b/i,
    replacement: 'photorealistic anime backgrounds with dramatic skies and lighting',
    category: 'artist',
  },
  {
    term: /\bHayao\s*Miyazaki\b/i,
    replacement: 'whimsical hand-drawn animation with pastoral themes',
    category: 'artist',
  },
  {
    term: /\bBeeple\b/i,
    replacement: 'surreal digital art with dystopian themes',
    category: 'artist',
  },
  {
    term: /\bAlex\s*Ross\b/i,
    replacement: 'photorealistic painted comic book art',
    category: 'artist',
  },
  {
    term: /\bRange\s*Murata\b/i,
    replacement: 'retro-futuristic anime character design',
    category: 'artist',
  },
  {
    term: /\bYoshitaka\s*Amano\b/i,
    replacement: 'ethereal fantasy illustration with wispy linework',
    category: 'artist',
  },

  // ============================================================
  // ARTISTS - Photographers
  // ============================================================
  {
    term: /\bAnnie\s*Leibovitz\b/i,
    replacement: 'dramatic portrait photography with theatrical lighting',
    category: 'artist',
  },
  {
    term: /\bPeter\s*Lindbergh\b/i,
    replacement: 'black and white fashion photography with natural beauty',
    category: 'artist',
  },
  {
    term: /\bMario\s*Testino\b/i,
    replacement: 'glamorous fashion photography with vibrant colors',
    category: 'artist',
  },
  {
    term: /\bSteven\s*Meisel\b/i,
    replacement: 'dramatic editorial fashion photography',
    category: 'artist',
  },

  // ============================================================
  // BRANDS - Tech Companies
  // ============================================================
  {
    term: 'iPhone',
    replacement: 'modern smartphone with slim bezels',
    category: 'brand',
  },
  {
    term: 'MacBook',
    replacement: 'premium aluminum laptop',
    category: 'brand',
  },
  {
    term: 'iPad',
    replacement: 'premium tablet device',
    category: 'brand',
  },
  {
    term: 'AirPods',
    replacement: 'wireless earbuds',
    category: 'brand',
  },
  {
    term: 'Apple Watch',
    replacement: 'smartwatch with square display',
    category: 'brand',
  },
  {
    term: 'iMac',
    replacement: 'all-in-one desktop computer',
    category: 'brand',
  },
  {
    term: 'Tesla',
    replacement: 'electric vehicle with minimalist interior',
    category: 'brand',
  },
  {
    term: 'Model S',
    replacement: 'sleek electric sedan',
    category: 'brand',
  },
  {
    term: 'Model 3',
    replacement: 'compact electric sedan',
    category: 'brand',
  },
  {
    term: 'Model X',
    replacement: 'electric SUV with falcon wing doors',
    category: 'brand',
  },
  {
    term: 'Xbox',
    replacement: 'gaming console',
    category: 'brand',
  },
  {
    term: 'PlayStation',
    replacement: 'gaming console',
    category: 'brand',
    aliases: ['PS5', 'PS4', 'PSP'],
  },
  {
    term: 'PS5',
    replacement: 'modern gaming console',
    category: 'brand',
  },
  {
    term: 'PS4',
    replacement: 'gaming console',
    category: 'brand',
  },
  {
    term: 'Nintendo Switch',
    replacement: 'handheld gaming console',
    category: 'brand',
  },
  {
    term: 'Steam Deck',
    replacement: 'handheld gaming PC',
    category: 'brand',
  },
  {
    term: 'Oculus',
    replacement: 'virtual reality headset',
    category: 'brand',
  },
  {
    term: 'Quest',
    replacement: 'virtual reality headset',
    category: 'brand',
    notes: 'Meta Quest VR headset',
  },

  // ============================================================
  // BRANDS - Fashion & Luxury
  // ============================================================
  {
    term: 'Nike',
    replacement: 'athletic sneakers with swoosh design',
    category: 'brand',
  },
  {
    term: 'Air Jordan',
    replacement: 'high-top basketball sneakers',
    category: 'brand',
    aliases: ['Jordans'],
  },
  {
    term: 'Adidas',
    replacement: 'athletic shoes with three stripes',
    category: 'brand',
  },
  {
    term: 'Supreme',
    replacement: 'streetwear brand with red box logo',
    category: 'brand',
  },
  {
    term: 'Gucci',
    replacement: 'luxury Italian fashion brand',
    category: 'brand',
  },
  {
    term: 'Louis Vuitton',
    replacement: 'luxury fashion with monogram pattern',
    category: 'brand',
    aliases: ['LV'],
  },
  {
    term: 'Chanel',
    replacement: 'luxury French fashion brand',
    category: 'brand',
  },
  {
    term: 'Versace',
    replacement: 'Italian luxury fashion with bold patterns',
    category: 'brand',
  },
  {
    term: 'Prada',
    replacement: 'Italian luxury fashion brand',
    category: 'brand',
  },
  {
    term: 'Balenciaga',
    replacement: 'avant-garde luxury fashion',
    category: 'brand',
  },
  {
    term: 'Rolex',
    replacement: 'luxury Swiss watch',
    category: 'brand',
  },
  {
    term: "Levi's",
    replacement: 'classic denim jeans',
    category: 'brand',
    aliases: ['Levis'],
  },
  {
    term: 'Levis',
    replacement: 'classic denim jeans',
    category: 'brand',
  },
  {
    term: 'Off-White',
    replacement: 'contemporary streetwear fashion',
    category: 'brand',
  },
  {
    term: 'Yeezy',
    replacement: 'minimalist fashion sneakers',
    category: 'brand',
  },
  {
    term: 'Hermes',
    replacement: 'luxury French leather goods',
    category: 'brand',
    aliases: ['Hermès'],
  },

  // ============================================================
  // BRANDS - Automotive
  // ============================================================
  {
    term: 'Ferrari',
    replacement: 'Italian sports car in red',
    category: 'brand',
  },
  {
    term: 'Lamborghini',
    replacement: 'angular Italian supercar',
    category: 'brand',
  },
  {
    term: 'Porsche',
    replacement: 'German sports car',
    category: 'brand',
  },
  {
    term: 'Mercedes',
    replacement: 'luxury German car',
    category: 'brand',
    aliases: ['Mercedes-Benz'],
  },
  {
    term: 'Mercedes-Benz',
    replacement: 'luxury German car',
    category: 'brand',
  },
  {
    term: 'BMW',
    replacement: 'German luxury car',
    category: 'brand',
  },
  {
    term: 'Audi',
    replacement: 'German car with four rings logo',
    category: 'brand',
  },
  {
    term: 'Bugatti',
    replacement: 'ultra-luxury hypercar',
    category: 'brand',
  },
  {
    term: 'McLaren',
    replacement: 'British supercar',
    category: 'brand',
  },
  {
    term: 'Rolls-Royce',
    replacement: 'ultra-luxury British car',
    category: 'brand',
    aliases: ['Rolls Royce'],
  },
  {
    term: 'Bentley',
    replacement: 'luxury British grand tourer',
    category: 'brand',
  },
  {
    term: 'Corvette',
    replacement: 'American sports car',
    category: 'brand',
  },
  {
    term: 'Mustang',
    replacement: 'American muscle car',
    category: 'brand',
  },

  // ============================================================
  // BRANDS - Food & Beverage
  // ============================================================
  {
    term: 'Coca-Cola',
    replacement: 'classic cola drink in curved bottle',
    category: 'brand',
    aliases: ['Coke', 'Coca Cola'],
  },
  {
    term: 'Coke',
    replacement: 'classic cola drink',
    category: 'brand',
  },
  {
    term: 'Pepsi',
    replacement: 'cola drink with red white and blue',
    category: 'brand',
  },
  {
    term: "McDonald's",
    replacement: 'fast food restaurant with golden arches',
    category: 'brand',
    aliases: ['McDonalds'],
  },
  {
    term: 'McDonalds',
    replacement: 'fast food restaurant with golden arches',
    category: 'brand',
  },
  {
    term: 'Starbucks',
    replacement: 'coffee shop with green mermaid logo',
    category: 'brand',
  },
  {
    term: 'Red Bull',
    replacement: 'energy drink in slim can',
    category: 'brand',
  },
  {
    term: 'Monster Energy',
    replacement: 'energy drink with claw mark logo',
    category: 'brand',
    aliases: ['Monster'],
  },
  {
    term: "Dunkin'",
    replacement: 'donut and coffee chain',
    category: 'brand',
    aliases: ['Dunkin Donuts'],
  },
  {
    term: 'Krispy Kreme',
    replacement: 'glazed donut chain',
    category: 'brand',
  },

  // ============================================================
  // FRANCHISES - Entertainment
  // ============================================================
  {
    term: 'Star Wars',
    replacement: 'space opera with laser swords and galactic conflict',
    category: 'franchise',
  },
  {
    term: 'Marvel',
    replacement: 'comic book superhero universe',
    category: 'franchise',
    aliases: ['Marvel Comics', 'MCU', 'Marvel Cinematic Universe'],
  },
  {
    term: 'MCU',
    replacement: 'comic book superhero universe',
    category: 'franchise',
  },
  {
    term: 'DC Comics',
    replacement: 'comic book superhero universe',
    category: 'franchise',
    aliases: ['DC', 'DCEU'],
  },
  {
    term: 'DCEU',
    replacement: 'comic book superhero universe',
    category: 'franchise',
  },
  {
    term: 'Disney',
    replacement: 'family-friendly animated entertainment',
    category: 'franchise',
  },
  {
    term: 'Pixar',
    replacement: '3D animated film style with emotional storytelling',
    category: 'franchise',
  },
  {
    term: 'DreamWorks',
    replacement: 'animated film studio style',
    category: 'franchise',
  },
  {
    term: 'Pokemon',
    replacement: 'collectible creature franchise',
    category: 'franchise',
    aliases: ['Pokémon'],
  },
  {
    term: 'Pokémon',
    replacement: 'collectible creature franchise',
    category: 'franchise',
  },
  {
    term: 'Dragon Ball',
    replacement: 'martial arts anime with energy attacks',
    category: 'franchise',
    aliases: ['Dragon Ball Z', 'DBZ'],
  },
  {
    term: 'Dragon Ball Z',
    replacement: 'martial arts anime with energy attacks',
    category: 'franchise',
  },
  {
    term: 'DBZ',
    replacement: 'martial arts anime with energy attacks',
    category: 'franchise',
  },
  {
    term: 'One Piece',
    replacement: 'pirate adventure anime',
    category: 'franchise',
  },
  {
    term: 'Attack on Titan',
    replacement: 'post-apocalyptic anime with giant humanoids',
    category: 'franchise',
    aliases: ['Shingeki no Kyojin'],
  },
  {
    term: 'My Hero Academia',
    replacement: 'superhero school anime',
    category: 'franchise',
    aliases: ['Boku no Hero Academia', 'MHA'],
  },
  {
    term: 'Demon Slayer',
    replacement: 'demon hunting anime with breathing techniques',
    category: 'franchise',
    aliases: ['Kimetsu no Yaiba'],
  },
  {
    term: 'Jujutsu Kaisen',
    replacement: 'supernatural action anime with cursed energy',
    category: 'franchise',
  },
  {
    term: 'Chainsaw Man',
    replacement: 'dark action anime with devil powers',
    category: 'franchise',
  },
  {
    term: 'Minecraft',
    replacement: 'voxel block-based sandbox world',
    category: 'franchise',
  },
  {
    term: 'Fortnite',
    replacement: 'battle royale game with building mechanics',
    category: 'franchise',
  },
  {
    term: 'Call of Duty',
    replacement: 'military first-person shooter game',
    category: 'franchise',
    aliases: ['COD'],
  },
  {
    term: 'Grand Theft Auto',
    replacement: 'open world crime game',
    category: 'franchise',
    aliases: ['GTA'],
  },
  {
    term: 'GTA',
    replacement: 'open world crime game',
    category: 'franchise',
  },
  {
    term: 'League of Legends',
    replacement: 'fantasy battle arena game',
    category: 'franchise',
    aliases: ['LoL'],
  },
  {
    term: 'Overwatch',
    replacement: 'team-based hero shooter game',
    category: 'franchise',
  },
  {
    term: 'Valorant',
    replacement: 'tactical shooter game with abilities',
    category: 'franchise',
  },
  {
    term: 'Elden Ring',
    replacement: 'dark fantasy open world game',
    category: 'franchise',
  },
  {
    term: 'Dark Souls',
    replacement: 'challenging dark fantasy action game',
    category: 'franchise',
  },
  {
    term: 'Final Fantasy',
    replacement: 'JRPG fantasy adventure',
    category: 'franchise',
    aliases: ['FF'],
  },
  {
    term: 'Genshin Impact',
    replacement: 'open world anime action RPG',
    category: 'franchise',
  },
  {
    term: 'Honkai Star Rail',
    replacement: 'sci-fi anime turn-based RPG',
    category: 'franchise',
  },
  {
    term: 'Studio Ghibli',
    replacement: 'whimsical hand-drawn anime with pastoral themes and nature spirits',
    category: 'franchise',
  },
  {
    term: 'The Witcher',
    replacement: 'dark fantasy monster hunter franchise',
    category: 'franchise',
  },
  {
    term: 'Cyberpunk 2077',
    replacement: 'futuristic dystopian neon-lit game',
    category: 'franchise',
  },
  {
    term: 'Halo',
    replacement: 'sci-fi space soldier game',
    category: 'franchise',
  },
  {
    term: 'God of War',
    replacement: 'mythological action game',
    category: 'franchise',
  },
  {
    term: 'Legend of Zelda',
    replacement: 'fantasy adventure game franchise',
    category: 'franchise',
  },
  {
    term: 'Transformers',
    replacement: 'shape-shifting robots',
    category: 'franchise',
  },
  {
    term: 'Game of Thrones',
    replacement: 'medieval fantasy with political intrigue',
    category: 'franchise',
    aliases: ['GoT', 'House of the Dragon'],
  },
  {
    term: 'Lord of the Rings',
    replacement: 'high fantasy with elves, dwarves, and hobbits',
    category: 'franchise',
    aliases: ['LOTR', 'Rings of Power'],
  },
  {
    term: 'LOTR',
    replacement: 'high fantasy with elves, dwarves, and hobbits',
    category: 'franchise',
  },
  {
    term: 'Stranger Things',
    replacement: '1980s supernatural horror mystery',
    category: 'franchise',
  },
  {
    term: 'Avatar',
    replacement: 'alien world with blue humanoids',
    category: 'franchise',
    notes: 'James Cameron film',
  },
  {
    term: 'Avatar: The Last Airbender',
    replacement: 'elemental bending martial arts animation',
    category: 'franchise',
    aliases: ['ATLA', 'The Last Airbender'],
  },
  {
    term: 'ATLA',
    replacement: 'elemental bending martial arts animation',
    category: 'franchise',
  },
  {
    term: 'SpongeBob',
    replacement: 'yellow sea sponge cartoon character',
    category: 'franchise',
    aliases: ['SpongeBob SquarePants'],
  },
  {
    term: 'The Simpsons',
    replacement: 'yellow-skinned cartoon family',
    category: 'franchise',
  },
  {
    term: 'Family Guy',
    replacement: 'adult animated comedy',
    category: 'franchise',
  },
  {
    term: 'Rick and Morty',
    replacement: 'sci-fi adult animated comedy',
    category: 'franchise',
  },
  {
    term: 'South Park',
    replacement: 'adult animated comedy with paper cut-out style',
    category: 'franchise',
  },
  {
    term: 'Hogwarts',
    replacement: 'magical castle school for wizards',
    category: 'franchise',
  },
  {
    term: 'Harry Potter',
    replacement: 'young wizard story with magic school',
    category: 'franchise',
  },
  {
    term: 'John Wick',
    replacement: 'stylized action thriller with assassins',
    category: 'franchise',
  },
  {
    term: 'Matrix',
    replacement: 'sci-fi virtual reality world with green code',
    category: 'franchise',
    aliases: ['The Matrix'],
  },
  {
    term: 'Jurassic Park',
    replacement: 'dinosaur theme park',
    category: 'franchise',
    aliases: ['Jurassic World'],
  },
  {
    term: 'Terminator',
    replacement: 'sci-fi with killer robots',
    category: 'franchise',
  },
  {
    term: 'Alien',
    replacement: 'sci-fi horror with xenomorph creatures',
    category: 'franchise',
    aliases: ['Aliens'],
  },
  {
    term: 'Predator',
    replacement: 'sci-fi with alien hunter',
    category: 'franchise',
  },

  // ============================================================
  // MISC - Platform Names
  // ============================================================
  {
    term: 'ArtStation',
    replacement: 'professional digital art portfolio quality',
    category: 'brand',
  },
  {
    term: 'DeviantArt',
    replacement: 'online art community style',
    category: 'brand',
  },
  {
    term: 'Pixiv',
    replacement: 'Japanese illustration community style',
    category: 'brand',
  },
  {
    term: 'Behance',
    replacement: 'professional design portfolio',
    category: 'brand',
  },
]);

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get all entries for a specific category
 */
export function getBlocklistByCategory(category: IPCategory): IPBlocklistEntry[] {
  return IP_BLOCKLIST.filter(entry => entry.category === category);
}

/**
 * Get count of entries per category
 */
export function getBlocklistStats(): Record<IPCategory, number> {
  const stats: Partial<Record<IPCategory, number>> = {};
  for (const entry of IP_BLOCKLIST) {
    stats[entry.category] = (stats[entry.category] || 0) + 1;
  }
  return stats as Record<IPCategory, number>;
}

/**
 * Search blocklist by term
 */
export function searchBlocklist(query: string): IPBlocklistEntry[] {
  const lowerQuery = query.toLowerCase();
  return IP_BLOCKLIST.filter(entry => {
    if (typeof entry.term === 'string') {
      return entry.term.toLowerCase().includes(lowerQuery);
    }
    return entry.term.source.toLowerCase().includes(lowerQuery);
  });
}

/**
 * Add custom entries to blocklist (for runtime extension)
 */
export function createExtendedBlocklist(
  customEntries: IPBlocklistEntry[]
): readonly IPBlocklistEntry[] {
  return Object.freeze([...IP_BLOCKLIST, ...customEntries]);
}
