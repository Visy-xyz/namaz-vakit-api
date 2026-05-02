#!/usr/bin/env node
/**
 * fetch-yearly.mjs — ekzekutohet nga GitHub Actions çdo 1 Janar
 * Merr DIYANET_EMAIL dhe DIYANET_PASS nga environment secrets
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');

const EMAIL = process.env.DIYANET_EMAIL;
const PASS  = process.env.DIYANET_PASS;
const BASE  = "https://awqatsalah.diyanet.gov.tr";
const YEAR  = new Date().getFullYear();

// Të gjitha qytetet — 99 total
const CITIES = [
  // 🇦🇱 SHQIPËRI
  { country:"al", city:"tirana",        cityId:11203 },
  { country:"al", city:"durres",        cityId:11206 },
  { country:"al", city:"shkoder",       cityId:11204 },
  { country:"al", city:"elbasan",       cityId:11205 },
  { country:"al", city:"vlore",         cityId:11210 },
  { country:"al", city:"korce",         cityId:11219 },
  { country:"al", city:"berat",         cityId:11217 },
  { country:"al", city:"lushnje",       cityId:11209 },
  { country:"al", city:"pogradec",      cityId:11220 },
  { country:"al", city:"kruje",         cityId:11215 },
  { country:"al", city:"fier",          cityId:11216 },
  { country:"al", city:"gjirokaster",   cityId:11213 },
  { country:"al", city:"sarande",       cityId:11212 },
  { country:"al", city:"peshkopi",      cityId:11214 },
  { country:"al", city:"librazhd",      cityId:20102 },
  { country:"al", city:"burrel",        cityId:11221 },
  { country:"al", city:"rreshen",       cityId:11208 },
  { country:"al", city:"permet",        cityId:11218 },
  { country:"al", city:"erseke",        cityId:11211 },
  { country:"al", city:"bajramcurri",   cityId:11207 },
  // 🇽🇰 KOSOVË
  { country:"xk", city:"prishtine",     cityId:15126 },
  { country:"xk", city:"prizren",       cityId:15127 },
  { country:"xk", city:"peje",          cityId:15117 },
  { country:"xk", city:"gjakov",        cityId:15119 },
  { country:"xk", city:"ferizaj",       cityId:15123 },
  { country:"xk", city:"gjilan",        cityId:16728 },
  { country:"xk", city:"mitrovice",     cityId:15125 },
  { country:"xk", city:"lipjan",        cityId:15115 },
  { country:"xk", city:"obiliq",        cityId:15116 },
  { country:"xk", city:"rahovec",       cityId:15121 },
  { country:"xk", city:"suhareke",      cityId:17822 },
  { country:"xk", city:"kacanik",       cityId:15120 },
  { country:"xk", city:"istog",         cityId:15113 },
  { country:"xk", city:"janjeve",       cityId:15114 },
  { country:"xk", city:"zhur",          cityId:15124 },
  // 🇲🇰 MAQEDONI
  { country:"mk", city:"shkup",         cityId:15298 },
  { country:"mk", city:"tetove",        cityId:15301 },
  { country:"mk", city:"gostivar",      cityId:15302 },
  { country:"mk", city:"oher",          cityId:15305 },
  { country:"mk", city:"struge",        cityId:15304 },
  { country:"mk", city:"kumanov",       cityId:15300 },
  { country:"mk", city:"manastir",      cityId:15299 },
  { country:"mk", city:"prilep",        cityId:15307 },
  { country:"mk", city:"veles",         cityId:15309 },
  { country:"mk", city:"shtip",         cityId:15308 },
  { country:"mk", city:"strumice",      cityId:15285 },
  { country:"mk", city:"diber",         cityId:15306 },
  { country:"mk", city:"kercove",       cityId:15303 },
  { country:"mk", city:"resnje",        cityId:15283 },
  { country:"mk", city:"gjevgjeli",     cityId:15276 },
  { country:"mk", city:"kocan",         cityId:15293 },
  { country:"mk", city:"krivapallanke", cityId:15295 },
  { country:"mk", city:"dellceve",      cityId:15288 },
  { country:"mk", city:"berove",        cityId:15274 },
  { country:"mk", city:"radovish",      cityId:15282 },
  { country:"mk", city:"kavadar",       cityId:15281 },
  { country:"mk", city:"negotine",      cityId:15280 },
  { country:"mk", city:"kratove",       cityId:15294 },
  { country:"mk", city:"bogdanci",      cityId:15275 },
  { country:"mk", city:"valandove",     cityId:15286 },
  { country:"mk", city:"blatec",        cityId:15287 },
  { country:"mk", city:"dracevo",       cityId:15290 },
  { country:"mk", city:"tearce",        cityId:15289 },
  { country:"mk", city:"sopishte",      cityId:15297 },
  // 🇲🇪 MALI I ZI
  { country:"me", city:"podgorice",     cityId:14875 },
  { country:"me", city:"ulqin",         cityId:14873 },
  { country:"me", city:"bar",           cityId:14862 },
  { country:"me", city:"budva",         cityId:14863 },
  { country:"me", city:"cetinje",       cityId:14864 },
  { country:"me", city:"hercegnovi",    cityId:14866 },
  { country:"me", city:"kotor",         cityId:14867 },
  { country:"me", city:"niksiq",        cityId:14871 },
  { country:"me", city:"pljevlja",      cityId:14876 },
  { country:"me", city:"rozaj",         cityId:15118 },
  { country:"me", city:"bijelopolje",   cityId:14874 },
  { country:"me", city:"danilovgrad",   cityId:14865 },
  { country:"me", city:"gusinje",       cityId:14872 },
  { country:"me", city:"mojkovac",      cityId:14861 },
  { country:"me", city:"ivangrad",      cityId:14860 },
  // 🇧🇦 BOSNJE
  { country:"ba", city:"sarajevo",      cityId:12029 },
  { country:"ba", city:"banjaluka",     cityId:12027 },
  { country:"ba", city:"mostar",        cityId:12030 },
  { country:"ba", city:"tuzla",         cityId:12028 },
  { country:"ba", city:"zenica",        cityId:12031 },
  { country:"ba", city:"bihac",         cityId:11993 },
  { country:"ba", city:"bijeljina",     cityId:11985 },
  { country:"ba", city:"brcko",         cityId:11995 },
  { country:"ba", city:"bugojno",       cityId:11986 },
  { country:"ba", city:"doboj",         cityId:11997 },
  { country:"ba", city:"foca",          cityId:11998 },
  { country:"ba", city:"gorazde",       cityId:12024 },
  { country:"ba", city:"jajce",         cityId:11991 },
  { country:"ba", city:"konjic",        cityId:12001 },
  { country:"ba", city:"livno",         cityId:11989 },
  { country:"ba", city:"prijedor",      cityId:12002 },
  { country:"ba", city:"trebinje",      cityId:12004 },
  { country:"ba", city:"zvornik",       cityId:12005 },
  { country:"ba", city:"travnik",       cityId:12025 },
  { country:"ba", city:"visoko",        cityId:12026 },
];

async function getToken() {
  const res  = await fetch(`${BASE}/Auth/Login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ Email: EMAIL, Password: PASS })
  });
  const d = await res.json();
  const t = d?.data?.accessToken || d?.Data?.AccessToken;
  if (!t) throw new Error("Login deshtoi: " + JSON.stringify(d));
  return t;
}

async function fetchCity(token, cityId) {
  const res = await fetch(`${BASE}/api/PrayerTime/DateRange`, {
    method:  "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ CityId: cityId, StartDate: `${YEAR}-01-01`, EndDate: `${YEAR}-12-31` })
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 100)}`);
  const data = await res.json();
  return data?.data || data?.Data || data;
}

function save(country, city, days) {
  const dir  = path.join(ROOT, "data", country);
  const file = path.join(dir, `${city}.json`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify({
    _meta: { country, city, year: YEAR, fetchedAt: new Date().toISOString(), totalDays: days.length },
    data: days
  }, null, 2));
}

async function main() {
  if (!EMAIL || !PASS) {
    console.error("❌ DIYANET_EMAIL ose DIYANET_PASS mungojnë!");
    console.error("   Shto secrets në: GitHub repo → Settings → Secrets → Actions");
    process.exit(1);
  }

  console.log(`\nNAMAZ VAKIT — RIFRESKIM VJETOR ${YEAR}`);
  console.log(`📋 ${CITIES.length} qytete\n`);

  const token = await getToken();
  console.log("✅ Login OK\n");

  let ok = 0, fail = 0, lastCountry = "";

  for (const c of CITIES) {
    if (c.country !== lastCountry) {
      const flags = { al:"🇦🇱", xk:"🇽🇰", mk:"🇲🇰", me:"🇲🇪", ba:"🇧🇦" };
      console.log(`\n${flags[c.country]} ${c.country.toUpperCase()}`);
      lastCountry = c.country;
    }

    process.stdout.write(`  ${c.city.padEnd(16)}... `);
    try {
      const days = await fetchCity(token, c.cityId);
      if (!Array.isArray(days) || days.length === 0) throw new Error("bosh");
      save(c.country, c.city, days);
      console.log(`✅ ${days.length} ditë`);
      ok++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\n${"═".repeat(40)}`);
  console.log(`✅ Sukses: ${ok}  |  ❌ Deshtuan: ${fail}`);

  if (fail > 0) process.exit(1); // Actions e shënon si failed
}

main().catch(err => { console.error(err); process.exit(1); });
