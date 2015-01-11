/*global RM*/
RM.items = {
  'arrows': {
    'tile': {
      'x': 24 * 2,
      'y': 21 * 4
    },
    'weight': 0,
    'count': 50,
    'category': 'munition'
  },
  'bow': {
    'tile': {
      'x': 24 * 8,
      'y': 21 * 4
    },
    'damage': 3,
    'weight': 3,
    'twoHanded': true,
    'ranged': true,
    'usesArrows': true,
    'category': 'weapon'
  },
  'dagger': {
    'tile': {
      'x': 24 * 16,
      'y': 21 * 4
    },
    'damage': 3,
    'weight': 1,
    'oneHanded': true,
    'melee': true,
    'ranged': true,
    'throwable': true,
    'category': 'weapon'
  },
  'elvenCloak': {
    'tile': {
      'x': 24 * 18,
      'y': 21 * 4
    },
    'weight': 1,
    'armour': 1,
    'category': 'cloak'
  }
};
