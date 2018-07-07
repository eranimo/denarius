## Person

### Social Class
There are three social classes:
- Low class
- Middle class
- Upper class

Classes change the skills and attributes given to agents at the start of the simulation. Certain careers require certain classes.

### Attributes
Attributes are numbers between 1 and 10.

List of attributes and what they do:
- Health
- Strength
- Intelligence
- Charisma
- Stamina

Every Person has a base attribute value from 0 to 10.

### Skills
Skills Numbered values between 0 and 10
- Baking (makes Bread)
- Smelting (makes Iron, Gold)
- Smithing (makes Tools)
- Minting (makes Coins)
- Masonry (makes Stone)
- Trading (?)

Each skill has a SkillDifficulty rating, between 1.5 and 2.5
Each skill gains a level when the required XP accumulates.
Experience only increases after the required actions are taken.

Required XP to advance:
`RequiredXP = 50 + 8 * SkillDifficulty ^ CurrentSkillLevel`

XP gain rate:
`XPGain = ProductionYield / 2`
  - ProductionYield = the amount of goods produced

### Needs
One categories:
- Life Needs: required to live

Needs:
- low class: 1 bread per day
- middle class: 2 bread per day
- upper class: 3 bread per day
