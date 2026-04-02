// Generate questions.json with 365 daily values per dataset
import { writeFileSync } from 'fs';

const MONTH_DAYS = { jan:31,feb:28,mar:31,apr:30,may:31,jun:30,jul:31,aug:31,sep:30,oct:31,nov:30,dec:31 };
const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function generateDataset(peakMonths, baseLine, peakValue, spread, seed, secondPeak) {
  const rng = seededRandom(seed);
  const dataset = {};
  let dayOfYear = 0;

  for (const m of MONTHS) {
    const days = MONTH_DAYS[m];
    const arr = [];
    for (let d = 0; d < days; d++) {
      dayOfYear++;
      let value = baseLine;

      for (const pm of peakMonths) {
        const peakDay = getMonthMidDay(pm);
        const dist = Math.min(Math.abs(dayOfYear - peakDay), 365 - Math.abs(dayOfYear - peakDay));
        const contribution = (peakValue - baseLine) * Math.exp(-(dist * dist) / (2 * spread * spread));
        value += contribution;
      }

      if (secondPeak) {
        const peakDay2 = getMonthMidDay(secondPeak.month);
        const dist2 = Math.min(Math.abs(dayOfYear - peakDay2), 365 - Math.abs(dayOfYear - peakDay2));
        const contribution2 = (secondPeak.value - baseLine) * Math.exp(-(dist2 * dist2) / (2 * secondPeak.spread * secondPeak.spread));
        value += contribution2;
      }

      value += (rng() - 0.5) * 6;
      value = Math.max(0, Math.min(100, Math.round(value)));
      arr.push(value);
    }
    dataset[m] = arr;
  }
  return dataset;
}

function generateFlatDataset(center, noise, seed) {
  const rng = seededRandom(seed);
  const dataset = {};
  for (const m of MONTHS) {
    const days = MONTH_DAYS[m];
    const arr = [];
    for (let d = 0; d < days; d++) {
      const value = Math.max(0, Math.min(100, Math.round(center + (rng() - 0.5) * noise)));
      arr.push(value);
    }
    dataset[m] = arr;
  }
  return dataset;
}

function getMonthMidDay(monthKey) {
  let day = 0;
  for (const m of MONTHS) {
    if (m === monthKey) return day + Math.floor(MONTH_DAYS[m] / 2);
    day += MONTH_DAYS[m];
  }
  return 180;
}

const questions = [
  // Q1 — Entry
  {
    id: "q1_births",
    isEntry: true,
    text: "Which month has the most births globally?",
    narrative: "The world makes the most babies in one month.\nNot because of that month.\nBecause of what happened nine months before it.\n\nYou've lived through both. You just didn't know they were the same story.",
    correctMonth: "sep",
    revealCorrect: "September. Most of those babies were made on New Year's Eve. The calendar remembers what we forget by morning.",
    revealWrong: "September \u2014 not {guessedMonth}. Most of those babies were made on New Year's Eve. The calendar remembers what we forget by morning.",
    source: "WHO / CDC daily birth estimates",
    branches: { correct: "q2_conceptions", summer: "q2_heat", winter: "q2_illness", autumn: "q2_disasters", spring: "q2_bloom" },
    _gen: { peakMonths: ['sep'], baseLine: 38, peakValue: 72, spread: 28, seed: 101 }
  },
  // Q2-Correct
  {
    id: "q2_conceptions",
    text: "Which month has the most conceptions globally?",
    narrative: "You got it.\n\nSeptember babies. December nights.\nIt takes nine months to make a life \u2014 which means most of us began in the dark, in the last hours of a year people were already letting go of.\n\nStay with that.",
    correctMonth: "dec",
    revealCorrect: "December. Every year, without fail. The world goes cold. People draw close. Nine months later, September fills up again.",
    revealWrong: "December \u2014 not {guessedMonth}. Every year, without fail. The world goes cold. People draw close. Nine months later, September fills up again.",
    source: "Birth data offset 266 days",
    branches: { winter: "q3_deaths", summer: "q3_migration", autumn: "q3_sharks", spring: "q3_proposals" },
    _gen: { peakMonths: ['dec'], baseLine: 35, peakValue: 70, spread: 30, seed: 201 }
  },
  // Q2-Summer
  {
    id: "q2_heat",
    text: "Which month is the hottest on Earth, averaged globally?",
    narrative: "You reached for summer.\n\nThe body knows summer before the mind does \u2014 the length of the day, the weight of the air. There's a reason we say heat like it means more than temperature.",
    correctMonth: "jul",
    revealCorrect: "July. Most of the planet's land sits in the north. When the northern hemisphere tilts toward the sun \u2014 the whole world follows.",
    revealWrong: "July \u2014 not {guessedMonth}. Most of the planet's land sits in the north. When the northern hemisphere tilts toward the sun \u2014 the whole world follows.",
    source: "NOAA global surface temperature records",
    branches: { summer: "q3_migration", winter: "q3_deaths", autumn: "q3_sharks", spring: "q3_proposals" },
    _gen: { peakMonths: ['jul'], baseLine: 25, peakValue: 85, spread: 40, seed: 202 }
  },
  // Q2-Winter
  {
    id: "q2_illness",
    text: "Which month do the most people fall ill globally?",
    narrative: "You went for winter.\n\nThe months when we slow down. Stay inside. Share the same air in the same rooms for weeks on end.\nCloseness has a cost.",
    correctMonth: "jan",
    revealCorrect: "January. We come home from the holidays carrying something. We always do.",
    revealWrong: "January \u2014 not {guessedMonth}. We come home from the holidays carrying something. We always do.",
    source: "CDC FluView / WHO seasonal illness data",
    branches: { winter: "q3_deaths", summer: "q3_migration", autumn: "q3_sharks", spring: "q3_proposals" },
    _gen: { peakMonths: ['jan'], baseLine: 20, peakValue: 80, spread: 30, seed: 203 }
  },
  // Q2-Autumn
  {
    id: "q2_disasters",
    text: "Which month sees the most natural disasters globally?",
    narrative: "You chose autumn.\n\nThe year starting to let go. Light pulling back. A specific kind of restlessness that lives in those months \u2014 in us, and in the planet itself.",
    correctMonth: "sep",
    revealCorrect: "September. Hurricane season peaks. Monsoons surge. Wildfires crest. The same month that holds the most births holds the most destruction. The earth doesn't separate the two.",
    revealWrong: "September \u2014 not {guessedMonth}. Hurricane season peaks. Monsoons surge. Wildfires crest. The same month that holds the most births holds the most destruction. The earth doesn't separate the two.",
    source: "EM-DAT International Disaster Database",
    branches: { autumn: "q3_sharks", summer: "q3_migration", winter: "q3_deaths", spring: "q3_proposals" },
    _gen: { peakMonths: ['sep'], baseLine: 22, peakValue: 78, spread: 25, seed: 204 }
  },
  // Q2-Spring
  {
    id: "q2_bloom",
    text: "When do the most flower species reach peak bloom globally?",
    narrative: "You picked spring.\n\nSomething in you knew things were beginning again. That's not nothing \u2014 most people don't notice the calendar turning until it's already turned.",
    correctMonth: "may",
    revealCorrect: "May. The same species, roughly the same days, every year. A clock older than any we've built. It doesn't need winding.",
    revealWrong: "May \u2014 not {guessedMonth}. The same species, roughly the same days, every year. A clock older than any we've built. It doesn't need winding.",
    source: "USA National Phenology Network",
    branches: { spring: "q3_proposals", summer: "q3_migration", winter: "q3_deaths", autumn: "q3_sharks" },
    _gen: { peakMonths: ['may'], baseLine: 18, peakValue: 82, spread: 28, seed: 205 }
  },
  // Q3-Dark
  {
    id: "q3_deaths",
    text: "Which month do the most people die globally?",
    narrative: "Life arrives in a rhythm.\nSo does its end.\n\nWe rarely say it out loud. The data doesn't have that problem.",
    correctMonth: "jan",
    revealCorrect: "January. The same month that holds the most illness holds the most loss. The calendar doesn't flinch. Neither should we.",
    revealWrong: "January \u2014 not {guessedMonth}. The same month that holds the most illness holds the most loss. The calendar doesn't flinch. Neither should we.",
    source: "WHO Global Mortality Database",
    branches: { summer: "q4_shopping", autumn: "q4_shopping", winter: "q4_divorces", spring: "q4_divorces" },
    _gen: { peakMonths: ['jan'], baseLine: 30, peakValue: 76, spread: 32, seed: 301 }
  },
  // Q3-Heat
  {
    id: "q3_migration",
    text: "Which month sees the peak of bird migration globally?",
    narrative: "Heat doesn't just change how we feel.\nIt moves the entire living world.\n\nBillions of creatures \u2014 following signals they didn't choose, crossing continents on instinct, every year, on time.",
    correctMonth: "may",
    revealCorrect: "May. Billions of birds moving north as the hemisphere warms. September pulls them back. They've been doing this longer than we've been watching.",
    revealWrong: "May \u2014 not {guessedMonth}. Billions of birds moving north as the hemisphere warms. September pulls them back. They've been doing this longer than we've been watching.",
    source: "eBird / Cornell Lab of Ornithology",
    branches: { summer: "q4_shopping", autumn: "q4_shopping", winter: "q4_divorces", spring: "q4_divorces" },
    _gen: { peakMonths: ['may'], baseLine: 18, peakValue: 80, spread: 22, seed: 302, secondPeak: { month: 'sep', value: 65, spread: 20 } }
  },
  // Q3-Chaos
  {
    id: "q3_sharks",
    text: "Which month sees the most shark attacks globally?",
    narrative: "The ocean has its own calendar.\nOlder than ours. Indifferent to it.\n\nWe go to the sea when it's warmest. We're not the only ones who noticed.",
    correctMonth: "jul",
    revealCorrect: "July. Warmer water. More swimmers. More sharks near shore, following the fish that follow the heat. Guess we weren't the only ones keeping track of the weather.",
    revealWrong: "July \u2014 not {guessedMonth}. Warmer water. More swimmers. More sharks near shore, following the fish that follow the heat. Guess we weren't the only ones keeping track of the weather.",
    source: "Florida Museum of Natural History \u2014 International Shark Attack File",
    branches: { summer: "q4_shopping", autumn: "q4_shopping", winter: "q4_divorces", spring: "q4_divorces" },
    _gen: { peakMonths: ['jul'], baseLine: 12, peakValue: 85, spread: 30, seed: 303 }
  },
  // Q3-Life
  {
    id: "q3_proposals",
    text: "Which month sees the most marriage proposals globally?",
    narrative: "The same instinct that opens flowers moves through people too.\n\nWe dress it up differently. Give it candlelight, a ring, a knee on cold ground. But underneath \u2014 it's seasonal. It always has been.",
    correctMonth: "dec",
    revealCorrect: "December. Nearly one in five proposals happen in a single month. We choose to begin things when everything else feels like it's ending.",
    revealWrong: "December \u2014 not {guessedMonth}. Nearly one in five proposals happen in a single month. We choose to begin things when everything else feels like it's ending.",
    source: "The Knot Global Wedding Report",
    branches: { summer: "q4_shopping", autumn: "q4_shopping", winter: "q4_divorces", spring: "q4_divorces" },
    _gen: { peakMonths: ['dec'], baseLine: 20, peakValue: 82, spread: 25, seed: 304 }
  },
  // Q4-Commerce
  {
    id: "q4_shopping",
    text: "Which month sees the most online shopping globally?",
    narrative: "Biology. Weather. Migration. Love.\n\nAnd then there's this \u2014 billions of people, alone with their screens, adding things to baskets in the middle of the night.\n\nThe calendar shapes desire too. Maybe especially desire.",
    correctMonth: "nov",
    revealCorrect: "November. In the US: Cyber Monday. In China: Singles' Day \u2014 the largest shopping event in human history, every November 11th. Two cultures. One month. The same hunger.",
    revealWrong: "November \u2014 not {guessedMonth}. In the US: Cyber Monday. In China: Singles' Day \u2014 the largest shopping event in human history, every November 11th. Two cultures. One month. The same hunger.",
    source: "Adobe Digital Economy Index / Alibaba Singles' Day data",
    branches: { summer: "q5_daylight", autumn: "q5_daylight", winter: "q5_daylight", spring: "q5_daylight" },
    _gen: { peakMonths: ['nov'], baseLine: 28, peakValue: 88, spread: 20, seed: 401 }
  },
  // Q4-Human Cycles
  {
    id: "q4_divorces",
    text: "Which month sees the most divorces filed globally?",
    narrative: "We begin things in cycles.\nWe end them in cycles too.\n\nDivorce lawyers noticed it long before researchers did. They've been watching it repeat, quietly, without surprise.",
    correctMonth: "mar",
    revealCorrect: "March. People decide over the holidays. They survive January. Then March comes \u2014 and they act. August is the other peak. Summer is over. The kids are back at school. There's nothing left to wait for.",
    revealWrong: "March \u2014 not {guessedMonth}. People decide over the holidays. They survive January. Then March comes \u2014 and they act. August is the other peak. Summer is over. The kids are back at school. There's nothing left to wait for.",
    source: "University of Washington 14-year study / CDC",
    branches: { summer: "q5_daylight", autumn: "q5_daylight", winter: "q5_daylight", spring: "q5_daylight" },
    _gen: { peakMonths: ['mar'], baseLine: 25, peakValue: 75, spread: 22, seed: 402, secondPeak: { month: 'aug', value: 68, spread: 18 } }
  },
  // Q5 — Final
  {
    id: "q5_daylight",
    isFinal: true,
    text: "Which month has the most daylight hours \u2014 averaged across the entire planet?",
    narrative: "You've seen where babies come from.\nWhere the heat lives. Where the birds go.\nWhere love starts and marriages end.\n\nOne more.\nThis one is different.",
    correctMonth: "jun",
    revealCorrect: "There isn't one.\n\nAveraged across both hemispheres, every month receives almost exactly the same amount of sunlight. The planet doesn't have a brightest month.\n\nOnly we do \u2014 because of where we happen to be standing.\n\nEvery rhythm you just saw. Every spike, every cycle, every pattern \u2014 it exists because of your particular patch of ground and its particular relationship with the sun.\n\nThe calendar was never global.\nIt was always just yours.",
    revealWrong: "There isn't one.\n\nAveraged across both hemispheres, every month receives almost exactly the same amount of sunlight. The planet doesn't have a brightest month.\n\nOnly we do \u2014 because of where we happen to be standing.\n\nEvery rhythm you just saw. Every spike, every cycle, every pattern \u2014 it exists because of your particular patch of ground and its particular relationship with the sun.\n\nThe calendar was never global.\nIt was always just yours.",
    source: "Astronomical data",
    _gen: { flat: true, center: 50, noise: 5, seed: 501 }
  }
];

// Generate datasets
for (const q of questions) {
  const g = q._gen;
  if (g.flat) {
    q.dataset = generateFlatDataset(g.center, g.noise, g.seed);
  } else {
    q.dataset = generateDataset(g.peakMonths, g.baseLine, g.peakValue, g.spread, g.seed, g.secondPeak);
  }
  delete q._gen;
}

const output = { questions };
writeFileSync(
  new URL('../src/data/questions.json', import.meta.url),
  JSON.stringify(output, null, 2)
);
console.log(`Generated ${questions.length} questions with datasets.`);
