const monsterFactory = () => { 
  //Many characteristics of the monster are stored in arrays of objects,
  //to be selected and combined randomly.
  //Some characteristics require or are incompatible with others. For
  //instance, a "Shambling" creature can't fly and a "Deep Sea" creature
  //must be able to swim.


  //a monster's name may start with zero or one descriptors
  const nameDescriptor = [
    {name:'', frequency: 0.28},
    {name:'Giant', sizeExcluded: ['tiny', 'small', 'medium'], frequency: 0.12},
    {name:'Baby', sizeExcluded:['large', 'huge'], hdMax: 4, frequency: 0.12},
    {name:'Ancient', hdMin: 8, frequency: 0.12},
    {name:'Shambling', movementExcluded: ['fly', 'swim'], frequency: 0.12},
    {name:'Creeping', movementExcluded: ['fly', 'swim'], frequency: 0.12},
    {name:'Deep Sea', movementIncluded:['swim'], movementExcluded: ['land', 'fly'], swimSpeedMin: 10, frequency: 0.12},
    {name:'Ethereal', specialQualities: ['ethereal jaunt'], frequency: 0.12}
  ];

  // a monster's primary name is constructed from exactly one prefix and one root
  const namePrefix = [
    {name:'Rapto',  movementIncluded:['fly'], flySpeedMin: 60, frequency: 0.2},
    {name:'Octo', attackModesIncluded: ['tentacle'], tentacleMin: 8, frequency:0.2},
    {name:'Bug', frequency: 0.2},
    {name:'Dark', typeExcluded: ['animal'], frequency:0.2},
    {name:'Cocka', specialAttacksIncluded: ['gaze (petrification)'], frequency:0.2}
  ];

  const nameRoot = [
    {name:'dragon', specialAttacksIncluded: ['breath weapon (--type--)'], type: 'dragon', frequency:0.2},
    {name:'bunny', frequency: 0.2},
    {name:'hawk', movementIncluded:['fly'], frequency:0.2},
    {name:'puppy', specialAttacksIncluded:['slobber'], frequency:0.2},
    {name:'shark', movementIncluded:['swim'], movementExcluded: ['land', 'fly'], swimSpeedMin: 30, attackModes:['bite'], attackModesExcluded: ['claw'], frequency:0.2}
  ];

  //a monster will have exactly one size
  const size = [
    {name:'tiny', frequency:0.1},
    {name:'small', frequency:0.2},
    {name:'medium', frequency:0.4},
    {name:'large', frequency:0.2},
    {name:'huge', frequency:0.1}
  ];

  //a monster will have exactly one type
  const type = [
    {name:'animal', frequency:0.2},
    {name:'magical beast', frequency:0.4},
    {name:'outsider', frequency:0.2},
    {name:'aberration', frequency:0.2},
  ];

  //a monster will have one or more movement types
  // **NOTE** any property that excludes land movement must include another form, to make sure the monster can move in some way
  // unless you really mean for the possibility of an immobile monster
  const movement = [
    {name: 'land', landSpeedMin: 10, landSpeedMax:60, frequency: 1.0}, //everything has a land speed unless specifically excluded
    {name: 'fly', flySpeedMin: 20, flySpeedMax: 120, frequency: 0.3},
    {name: 'swim', swimSpeedMin: 10, swimSpeedMax: 60, frequency: 0.2}
  ];
  
  //a monster will have one or more attack modes
  // **NOTE** it's good form, when excluding an attack mode, to include another one, 
  //just to guarantee that not all attack modes get excluded by various attributes
  const attackModes = [
    {name:'bite', biteMax: 1, frequency:0.6},
    {name:'claw', clawMin: 2, clawMax: 4, frequency:0.8},
    {name:'tailSlap', tailSlapMax: 1, frequency: 0.2},
    {name:'tentacle', tentacleMin: 2, tentacleMax: 8, frequency: 0.1}
  ];

  // a monster will have zero or more special attacks
  const specialAttacks = [
    {name: 'none', frequency: 0.4},
    {name: 'trample', frequency: 0.15},
    {name: 'improved grab', frequency: 0.15},
    {name: 'gaze (--type--)', typeParen: ['petrification', 'charm', 'death'], frequency: 0.1},
    {name: 'stink spray', frequency: 0.1},
    {name: 'eyeball lasers', frequency: 0.05},
    {name: 'breath weapon (--type--)', typeParen: ['fire', 'acid', 'cold'], frequency: 0.05}
  ];

  //a monster will have zero or more special qualities
  const specialQualities = [
    {name: 'none', frequency: 0.4},
    {name: 'scent', frequency: 0.4},
    {name: 'blindsight', frequency: 0.3},
    {name: 'change shape', frequency: 0.2}
  ];

  //this array establishes some of the pieces of information that will be conveyed about the monster
  const monsterProperties = [
    {property:'nameDescriptor', objArray:nameDescriptor, freqType:'single'},
    {property:'namePrefix', objArray:namePrefix, freqType:'single'},
    {property:'nameRoot', objArray:nameRoot, freqType:'single'},
    {property:'size', objArray:size, freqType:'single'},
    {property:'type', objArray:type, freqType:'single'},
    {property:'movement', objArray:movement, freqType:'checkeach', constraints:true, minmax:true},
    {property:'attackModes', objArray:attackModes, freqType:'checkeach'},
    {property:'specialAttacks', objArray:specialAttacks, freqType:'recheck', parenthetical:'attackTypes'},
    {property:'specialQualities', objArray:specialQualities, freqType:'recheck'}
  ];

  //helper function returns an object from an array based on the item's frequency of occurrence
  const randomObject = (arr) => {
    const rand = Math.random();
    let freqSum = 0;
    let i = -1;
    while (freqSum < rand) {
      i++;
      freqSum += arr[i].frequency;
    }
    return arr[i];
  }

  //helper function to get object array from property name
  const getObjArray = (propertyName) => {
    for (propObj of monsterProperties) {
      if (propObj.property === propertyName) {return propObj.objArray;}
    }
  }

  const getObj = (propertyName, objArrayName) => {
    for (propObj of getObjArray(propertyName)) {
      if (propObj.name === objArrayName) {return propObj;}
    }
  }

  //helper function to fill in paranthetical types to property values (e.g. 'gaze {--type--)' => 'gaze (petrification)'
  const fillInParen = (property, val) => {
    const parenLoc = val.indexOf('(--type--)');
    if (parenLoc === -1) {return val;}
    //have to do some cleanup
    let suffixLoc = property.indexOf('Included');
    if (suffixLoc === -1) {suffixLoc = property.indexOf('Excluded');}
    if (suffixLoc >= 0) {
      property = property.slice(0,suffixLoc);
    }
    const objArray = getObjArray(property);
    for (obj of objArray) {
      if (obj.name === val) {
        return val.slice(0,parenLoc) + '(' + obj.typeParen[Math.floor(Math.random() * obj.typeParen.length)] + ')';
      }
    }  
  }

  //helper function to strip the parenthetical modifier from a property/value
  const stripParen = (str) => {
    const parenLoc = str.indexOf('(');
    if (parenLoc === -1) {
      return str;
    } else {
      return str.slice(0,parenLoc - 1);
    }
  }

  //helper function to check whether a name is included in an array
  //need this because we may need to strip parentheticals
  const foundIn = (arr, str) => {
    const strStripped = stripParen(str);
    if (strStripped === str) {
      return (arr.indexOf(str) >= 0);
    } else {
      for (arrStr of arr) {
        if (stripParen(arrStr) === strStripped) {
          return true;
        }
      }
    }
    return false;
  } 

//helper function to check if a property value is excluded
  const isExcluded = (monster, propName, testObj) => {
    let filteredArray
    //first, it's excluded if the name of the property is explicitly excluded
    const propNameExcluded = propName + 'Excluded';
    if (monster.hasOwnProperty(propNameExcluded) && monster[propNameExcluded].indexOf(testObj.name) >= 0) { 
      return true;
    };
    /*next, we have to cycle through all the properties of testObj (except 'name' and 'frequency') and check:
      1. does it Include something that is specifically Excluded by a previous selection
      2. does it Exclude something that is specifically Included by a previous selection
      3. does it set a Maximum for a property that is below the Minimum that has already been set
      4. does it set a Minimum for a property that is above the Maximum that has already been set
      5. does it assign a value to a singly-valued property (other than Min and Max) thah has already been assigned with a different value
    */
    for (const property in testObj) {
      if (property !== 'frequency' && property !== 'name') {
        switch (true) {
          case property.includes('Included'): //this is case 1 above
            const propExcluded = property.replace('Included', 'Excluded');
            if (monster.hasOwnProperty(propExcluded)) {
              filteredArray = testObj[property].filter(value => monster[propExcluded].includes(value));
              if (filteredArray.length > 0) {
                return true;
              }
            }
            break;
          case property.includes('Excluded'): //this is case 2 above
            const propIncluded = property.replace('Excluded', 'Included');
            if (monster.hasOwnProperty(propIncluded)) {
              filteredArray = testObj[property].filter(value => monster[propIncluded].includes(value));
              if (filteredArray.length > 0) {
                return true;
              }
            }
            break;
          case property.includes('Max'): //this is case 3 above
            const propMin = property.replace('Max', 'Min');
            if (monster.hasOwnProperty(propMin)) {
              if (testObj[property] < monster[propMin]) {
                return true;
              }
            }
            break;
          case property.includes('Min'): //this is case 4 above
            const propMax = property.replace('Min', 'Max');
            if (monster.hasOwnProperty(propMax)) {
              if (testObj[property] > monster[propMax]) {
                return true;
              }
            }
            break;
          case (monster.hasOwnProperty(property) && typeof monster[property] !== 'object' && monster[property] !== testObj[property]): //this is case 5 above
            return true;
            break;
        }
      }
    }
  }

  //helper function to apply constraints associated with a property setting
  const applyConstraints = (monster, propName, obj) => {
    for (const property in obj) {
      let propVal = obj[property];
      let propNameVal = monster[propName]; //only need this if we need to add a parenthetical to the value here
      switch (true) {
        case (property.includes('Min')):
          if (!(monster.hasOwnProperty(property)) || monster[property] < propVal) {
            monster[property] = propVal;
          }
          break;
        case (property.includes('Max')):
          if (!(monster.hasOwnProperty(property)) || monster[property] > propVal) {
            monster[property] = propVal;
          }
          break;
        case (property.includes('Paren')):
          //need to pick a random parenthetical from the list contained in this property
          //and append it to the main property name
          monster.propName = monster.propName + ' (' + propVal[Math.floor(Math.random()*propVal.length)];
          break;
        case property === 'name':
        case property === 'frequency':
          break; //ignore these properties, tehy're not constraints
        case (typeof propVal === 'boolean'):
        case (typeof propVal === 'number'):
          monster[property] = propVal;
          break;
        case (typeof propVal === 'string'):
          monster[property] = fillInParen(property, propVal);
          break;
        case (typeof propVal === 'object'):
          //the value is an array of items to be pushed to the array in the property
          if (!(monster.hasOwnProperty(property))) {
            monster[property] = [];
          }
          for(val of propVal) {
            if (monster[property].indexOf(val) === -1) {
              monster[property].push(fillInParen(property, val));
            }
          }
          break;
      }
    }
  }

  //helper function to build a full monster name from descriptor, prefix and root
  const buildName = (descriptor, prefix, root) => {
    if (descriptor.length > 0) { descriptor += ' ';}
    return descriptor + prefix + root;
  }


  //okay, let's build a monster!

  //start with a few parameters and getters
  let monster = {
    get name() {return buildName(this.nameDescriptor, this.namePrefix, this.nameRoot);},
    hdMin: 1,
    hdMax: 12,
    get hd() {
      let hdMin = this.hdMin;
      let hdMax = this.hdMax;
      if (this.hasOwnProperty('specialAttacks')) {
        hdMin += this.specialAttacks.length;
      }
      if (this.hasOwnProperty('specialQualities')) {
        hdMin += this.specialQualities.length;
      }
      if (hdMin > hdMax) {hdMin = hdMax};
      return Math.floor(Math.random() * (hdMax - hdMin) + hdMin);
    },
    moveSpeed: function(moveMode) {
      if(!(this.hasOwnProperty(moveMode + 'SpeedMin'))) {this[moveMode + 'SpeedMin'] = 10};
      const moveMin = this[moveMode + 'SpeedMin'];
      const moveMax = this[moveMode + 'SpeedMax'];
      return Math.floor((Math.random() * (moveMax - moveMin + 10)+moveMin)/10) * 10;
    },
    attackNum: function(attackMode) {
      if(!(this.hasOwnProperty(attackMode + 'Min'))) {this[attackMode + 'Min'] = 1};
      if(!(this.hasOwnProperty(attackMode + 'Max'))) {this[attackMode + 'Max'] = 1};
      const attackMin = this[attackMode + 'Min'];
      const attackMax = this[attackMode + 'Max'];
      return Math.floor(Math.random() * (attackMax - attackMin + 1))+attackMin;
    }
  }

  //there are some properties we can automate calling using the monsterProperties object,
  //but (after the first one) we need to check compatibility with each call
  for (let i = 0; i < monsterProperties.length; i++) {
    const prop = monsterProperties[i]; /* this object contains a property name, the array associated with that property, 
    and the type of values the property can takeconst */
    const propName = prop.property; //this is the name of the property
    const propObjArray = prop.objArray; //this is the array associated with the property
    switch (prop.freqType) {
      case 'single': //property takes only one value, as soon as we get a compatible one, we fill it
        //if this property hasn't already been filled, we need to fill it
        while (!(monster.hasOwnProperty(propName))) {
          //generate a random test value (actually an object) and check if it's compatible with any prior constraints
          const testObj = randomObject(propObjArray);
          if (!(isExcluded(monster, propName, testObj))) {
            //okay, we can assign testValue to this property
            monster[propName] = fillInParen(propName,testObj.name);
            //now we have to apply any constraints associated with this value
            applyConstraints(monster, propName, testObj);
          }
        }
        break;          
      case 'checkeach': //property has multiple components, we check if each one is present and is compatible
        //first, add any specifically included properties
        monster[propName] = []; //for these kinds of properties, no direct assigment is made by prior constraints (just Included and Excluded)
        if (monster.hasOwnProperty(propName + 'Included')) {
          for (propIncluded of monster[propName + 'Included']) {
            monster[propName].push(fillInParen(propName,propIncluded));
            applyConstraints(monster, propName, getObj(propName, propIncluded));
          }
        }
        //next, loop through each property and decide whether to include it or not
        //we must include at least one; we'll loop until that's true
        do {
          let okayToAdd = false;
          for (testObj of propObjArray) {
            //first, do we want to add this property?
            okayToAdd = (Math.random() <= testObj.frequency);
            if (okayToAdd) { //now we have to do some checks regarding whether we can add this property
              //first, is it excluded?
              let testObjName = testObj.name;
              //there's a special case, of properties with the '(type)' modifier; we have to adjust for that
              let paren = testObjName.indexOf('(--type--)');
              switch (true) {
                case (!(monster.hasOwnProperty(propName))): //none of these properties have yet been assigned, so no conflict here
                  break;
                case (monster[propName].indexOf(testObjName) === -1 && paren === -1): //something's been assigned, but it doesn't match this one
                  if (paren !== -1) { //need to check the case where this one has a type in parentheses
                    const rootProp = testpObjName.slice(0,paren);
                    for (assignedProp of monster[propName]) {
                      const assignedParen = assignedProp.indexOf('(');
                      okayToAdd =  (assignedParen !== -1 && assignedProp.slice(0,assignedParen) === rootProp)
                    }
                  }
                  break;
                default: //this property is already present in the monster
                  okayToAdd = false;
                  break;
              }
              if (okayToAdd) { //okay, we want to add it, and it's not a duplicate, last check: is it excluded?
                okayToAdd = (!(isExcluded(monster, propName, testObj)))
              } 
              if (okayToAdd) { //cool, let's add it
                monster[propName].push(fillInParen(propName,testObjName));
                applyConstraints(monster, propName, testObj);
              }
            }
          }
        } while (monster[propName].length === 0)
        break;
      case 'recheck': //property can have zero or more values, we check until we repeat, or get "none", or find an incompatible value
        monster[propName]=[]; //for these kinds of properties, no direct assigment is made by prior constraints (just Included and Excluded)
        if (monster.hasOwnProperty(propName + 'Included')) {
          for (propIncluded of monster[propName + 'Included']) {
            monster[propName].push(fillInParen(propName,propIncluded));            
          }
        }
        let keepPicking = true;
        do {
          const randProp = randomObject(propObjArray);
          if (randProp.name === 'none' || foundIn(monster[propName],randProp.name)) {
            keepPicking = false;
          } else {
            monster[propName].push(fillInParen(propName, randProp.name));
            applyConstraints(monster, propName, randProp);
          }
      } while (keepPicking)
        break;
    }
  }

  //get the components of the monster's name
  /* const descriptor = randomObject(nameDescriptor, 'object');
  const prefix = randomObject(namePrefix, 'object');
  const root = randomObject(nameRoot, 'object');
  monster.name = buildName(descriptor.name, prefix.name, root.name); */

  //monster name pieces come with some properties and constraints -- apply them


  return monster;

}

//we have to output the monster information
const printMonster = (monster) => {
  console.log('');
  console.log(monster.name);
  let underlines = ''
  for (i = 0; i < monster.name.length; i++) {
    underlines = underlines + '-';
  }
  console.log(underlines)
  let size = monster.size;
  size = size.slice(0,1).toUpperCase() + size.slice(1,size.length);
  console.log(`${size} ${monster.type}`);
  console.log(`Hit Dice: ${monster.hd}`);
  let movement = '';
  for (moveMode of monster.movement) {
    if (movement === '') {
      movement = 'Movement: ';
    } else {
      movement = movement + ', ';
    }
    movement = movement + moveMode + " (" + monster.moveSpeed(moveMode) + "')";
  }
  console.log(movement);
  let attack = '';
  for (attackMode of monster.attackModes) {
    if (attack === '') {
      attack = 'Attacks: ';
    } else {
      attack = attack + ', ';
    }
    attack = attack + attackMode + " (" + monster.attackNum(attackMode) + ")";
  }
  console.log(attack);
  if (monster.specialAttacks.length > 0) {
    console.log(`Special Attacks: ${monster.specialAttacks.join(', ')}`);
  }
  if (monster.specialQualities.length > 0) {
    console.log(`Special Qualities: ${monster.specialQualities.join(', ')}`);
  }
}

printMonster(monsterFactory());
