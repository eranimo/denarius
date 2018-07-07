# Production

## RGOs
- Are Buildings
- Properties:
  - Number level
  - Array workers
  - Enum type

Types:
- Workshop
  10 Stone, 15 Wood
- Mine
  5 Wood
- Farm
  5 Wood

## Levels
- Numbers between 1 and 10
- Decide number of workers that can work at this RGO

## Building
- New RGOs start at level 1
- Cost depends on type

## Upgrading
- Resource multiplier = `Base * NextLevel * 0.8`
  e.g. Workshop to level 2:
       10 * 2 * 0.8 = 16 stone
       15 * 2 * 0.8 = 24 wood

## Production

### Requirements
- Workers must be able to work
- Workers must each have at least 1 Tool
- Required goods must be present

### Yield
`SkillModifider = (AvgStrength / MaxStrength) + (AvgStamina / MaxStamina)`
  - AvgStrength = average strength skill of workers
  - AvgStamina = average strength skill of workers
  - MaxStrength = 10
  - MaxStamina = 10

`Yield = NumWorkers * (BaseYield + 1 * SkillModifier)`
  - BaseYield = base yield for this good


Example:
5 workers
2 BaseYield
5 avg strength
6 avg stamina

skill modifier = 1.1

yield = 15.5
