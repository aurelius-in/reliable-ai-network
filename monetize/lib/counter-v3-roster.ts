/** 62 accounts, ~2 signups/day from public launch 2026-07-22 through 2026-08-22. */

export type RosterRow = {
  name: string;
  email: string;
  status: "trialing" | "reviewer" | "active" | "canceled" | null;
  tier: "starter" | "growth" | "pro" | null;
  /** Calendar day the account was created. Never before 2026-07-22. */
  on: string;
  hour: number;
  min: number;
};

export const V3_ROSTER: RosterRow[] = [
  // Past week
  { name: "Elena Voss", email: "elena@grayline.app", status: null, tier: null, on: "2026-08-22", hour: 10, min: 42 },
  { name: "Marcus Hale", email: "marcus.hale@gmail.com", status: "trialing", tier: "starter", on: "2026-08-22", hour: 9, min: 18 },
  { name: "Priya Raman", email: "priya@stacklane.io", status: "trialing", tier: "starter", on: "2026-08-21", hour: 21, min: 5 },
  { name: "Riya Kapoor", email: "riya@kapoor.studio", status: "trialing", tier: "starter", on: "2026-08-21", hour: 14, min: 27 },
  { name: "Jonah Ellis", email: "jonah@ellismail.co", status: "trialing", tier: "starter", on: "2026-08-20", hour: 23, min: 11 },
  { name: "Chris Adelman", email: "chris@adelman.io", status: "reviewer", tier: "pro", on: "2026-08-20", hour: 17, min: 40 },
  { name: "Dana Ruiz", email: "dana@ruizmade.com", status: null, tier: null, on: "2026-08-19", hour: 19, min: 2 },
  { name: "Devon Burke", email: "devon@burkehq.com", status: "trialing", tier: "starter", on: "2026-08-19", hour: 13, min: 16 },
  { name: "Hannah Cho", email: "hannah.cho@outlook.com", status: "trialing", tier: "starter", on: "2026-08-18", hour: 20, min: 48 },
  { name: "Luis Ortega", email: "luis@ortega.dev", status: "trialing", tier: "starter", on: "2026-08-17", hour: 16, min: 11 },
  { name: "Amira Haddad", email: "amira@haddad.co", status: "trialing", tier: "growth", on: "2026-08-17", hour: 11, min: 9 },
  { name: "Noah Pell", email: "noah.pell@gmail.com", status: "trialing", tier: "starter", on: "2026-08-16", hour: 8, min: 33 },
  { name: "Pavel Novak", email: "pavel@novak.codes", status: "trialing", tier: "starter", on: "2026-08-14", hour: 8, min: 16 },
  { name: "Min Park", email: "min@parkline.dev", status: "reviewer", tier: "pro", on: "2026-08-14", hour: 10, min: 12 },
  { name: "Blair Nguyen", email: "blair@nguyencode.com", status: "trialing", tier: "starter", on: "2026-08-13", hour: 13, min: 18 },
  { name: "Mei Huang", email: "mei@huanglabs.com", status: "trialing", tier: "starter", on: "2026-08-13", hour: 19, min: 2 },
  { name: "Brett Lang", email: "brett@langworks.io", status: null, tier: null, on: "2026-08-12", hour: 11, min: 18 },
  { name: "Tara Singh", email: "tara.singh@gmail.com", status: "trialing", tier: "starter", on: "2026-08-12", hour: 10, min: 5 },
  { name: "Jules Abram", email: "jules@abram.co", status: "canceled", tier: "growth", on: "2026-08-11", hour: 9, min: 14 },
  { name: "Wes Parker", email: "wes@parkerlabs.io", status: "trialing", tier: "growth", on: "2026-08-11", hour: 17, min: 21 },
  { name: "Peter Holm", email: "peter.holm@hey.com", status: "trialing", tier: "starter", on: "2026-08-10", hour: 14, min: 7 },
  { name: "Casey Nguyen", email: "casey@nguyenworks.com", status: "trialing", tier: "starter", on: "2026-08-10", hour: 15, min: 2 },
  { name: "Sofia Marin", email: "sofia@marincode.com", status: "trialing", tier: "starter", on: "2026-08-09", hour: 16, min: 21 },
  { name: "Asha Patel", email: "asha.patel@gmail.com", status: "trialing", tier: "growth", on: "2026-08-09", hour: 16, min: 37 },
  { name: "Jordan Lee", email: "jordan@hey.com", status: "trialing", tier: "starter", on: "2026-08-08", hour: 22, min: 19 },
  { name: "Imani Brooks", email: "imani@brooksware.com", status: "trialing", tier: "starter", on: "2026-08-08", hour: 7, min: 28 },
  { name: "Nia Cole", email: "nia@colehouse.app", status: null, tier: null, on: "2026-08-07", hour: 8, min: 41 },
  { name: "Grace Whitaker", email: "grace.whitaker@gmail.com", status: "trialing", tier: "starter", on: "2026-08-07", hour: 14, min: 55 },
  { name: "Rafael Costa", email: "rafael@costa.build", status: "reviewer", tier: "pro", on: "2026-08-06", hour: 18, min: 4 },
  { name: "Cole Winters", email: "cole.winters@gmail.com", status: "trialing", tier: "growth", on: "2026-08-06", hour: 19, min: 12 },
  { name: "Nadia Rahman", email: "nadia@rahman.app", status: "trialing", tier: "starter", on: "2026-08-05", hour: 9, min: 58 },
  { name: "Tom Hale", email: "tom@northfold.io", status: "trialing", tier: "starter", on: "2026-08-05", hour: 11, min: 40 },
  { name: "Ingrid Foss", email: "ingrid@fosslabs.no", status: "trialing", tier: "starter", on: "2026-08-04", hour: 19, min: 33 },
  { name: "Felix Grant", email: "felix@grantworks.io", status: "trialing", tier: "growth", on: "2026-08-04", hour: 13, min: 22 },
  { name: "Sam Okonkwo", email: "sam@okonkwo.co", status: "trialing", tier: "pro", on: "2026-08-03", hour: 17, min: 26 },
  { name: "Hana Kim", email: "hana@kimstack.com", status: "trialing", tier: "growth", on: "2026-08-03", hour: 10, min: 51 },
  { name: "Yuki Tanaka", email: "yuki@tanaka.systems", status: "trialing", tier: "starter", on: "2026-08-02", hour: 20, min: 14 },
  { name: "Rosa Diaz", email: "rosa@diazform.com", status: "trialing", tier: "starter", on: "2026-08-02", hour: 8, min: 41 },
  // Trial ends in 9 days (Aug 31)
  { name: "Omar Klein", email: "omar@kleinworks.com", status: "trialing", tier: "pro", on: "2026-08-01", hour: 7, min: 51 },
  { name: "Pia Solis", email: "pia@solis.co", status: "trialing", tier: "starter", on: "2026-08-01", hour: 12, min: 6 },
  // Trial ends in 8 days (Aug 30)
  { name: "Omar Farouk", email: "omar@farouk.tech", status: "trialing", tier: "starter", on: "2026-07-31", hour: 14, min: 7 },
  { name: "Ivy Chen", email: "ivy@chenbyte.com", status: "reviewer", tier: "pro", on: "2026-07-31", hour: 12, min: 30 },
  // Trial ends in 7 days (Aug 29)
  { name: "Tyler Brooks", email: "tyler.brooks@gmail.com", status: "trialing", tier: "pro", on: "2026-07-30", hour: 8, min: 12 },
  { name: "Helen Ward", email: "helen@wardnote.com", status: "reviewer", tier: "pro", on: "2026-07-30", hour: 11, min: 19 },
  // Trial ends in 6 days (Aug 28)
  { name: "Nina Alvarez", email: "nina@alvarez.codes", status: "trialing", tier: "starter", on: "2026-07-29", hour: 11, min: 8 },
  { name: "Shift Nook", email: "hello@shiftnook.app", status: "trialing", tier: "starter", on: "2026-07-29", hour: 10, min: 14 },
  { name: "Gia Romano", email: "gia@romanoware.com", status: "trialing", tier: "growth", on: "2026-07-29", hour: 9, min: 44 },
  { name: "Quentin Marsh", email: "quentin@marshlab.io", status: "reviewer", tier: "pro", on: "2026-07-28", hour: 16, min: 55 },
  { name: "Lila Jensen", email: "lila.jensen@outlook.com", status: "trialing", tier: "starter", on: "2026-07-28", hour: 8, min: 6 },
  // Trial ends in 4 days (Aug 26)
  { name: "Leon Hart", email: "leon@hartline.io", status: "trialing", tier: "growth", on: "2026-07-27", hour: 19, min: 40 },
  { name: "Owen Drake", email: "owen.drake@icloud.com", status: "canceled", tier: "starter", on: "2026-07-27", hour: 12, min: 37 },
  { name: "Adebola Okafor", email: "adebola@okafor.studio", status: "reviewer", tier: "pro", on: "2026-07-26", hour: 14, min: 22 },
  { name: "Benito Cruz", email: "benito@cruz.build", status: "trialing", tier: "starter", on: "2026-07-26", hour: 11, min: 3 },
  // Trial ends in 2 days (Aug 24)
  { name: "Andre Silva", email: "andre@silva.cc", status: "trialing", tier: "starter", on: "2026-07-25", hour: 16, min: 29 },
  { name: "Ava Moreau", email: "ava@moreau.studio", status: "trialing", tier: "pro", on: "2026-07-25", hour: 8, min: 11 },
  // Trial ends tomorrow / in 1 day (Aug 23)
  { name: "Ruth Okada", email: "ruth@okada.studio", status: "trialing", tier: "starter", on: "2026-07-24", hour: 13, min: 12 },
  { name: "Sam Ellis", email: "sam@orchardlane.co", status: "trialing", tier: "growth", on: "2026-07-24", hour: 15, min: 2 },
  { name: "Leila Nasser", email: "leila@nasser.digital", status: "active", tier: "starter", on: "2026-07-23", hour: 15, min: 49 },
  { name: "Maya Chen", email: "maya.chen@proton.me", status: "canceled", tier: "starter", on: "2026-07-23", hour: 18, min: 53 },
  { name: "Kenji Mori", email: "kenji@morilabs.jp", status: "active", tier: "starter", on: "2026-07-22", hour: 10, min: 4 },
  { name: "Sara Lind", email: "sara@lindmail.se", status: "reviewer", tier: "pro", on: "2026-07-22", hour: 9, min: 8 },
  { name: "Hugo Stein", email: "hugo@steincraft.co", status: null, tier: null, on: "2026-07-22", hour: 15, min: 3 },
];
