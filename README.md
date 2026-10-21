# FORM / 365

An offline-capable 365-day progressive training checklist, designed for a teen who is developing calisthenics, gym strength, legs, running, jump rope and mobility.

## Quick start

Open `index.html` to see the app locally. Install as a home-screen PWA on Android by **hosting the directory over HTTPS** (GitHub Pages, Netlify Drop or Cloudflare Pages), then in Chrome choose **⋮ → Install app / Add to Home screen**.

**Important:** Upload the *contents* of this directory (index.html at the root of the site). If using Netlify Drop, the supplied ZIP file is ready to deploy as-is.

## Features

- Personalised onboarding based on goals, gym access, cardio and joint discomfort
- A year-long 52-week schedule (13 four-week blocks + review day)
- Three full-body gym strength sessions per week (roughly 60–75 minutes with accessories), or a two-day gym variant with a home strength day
- Foundation drills for planche, muscle-up and one-arm push-up
- Manual readiness checkpoints that do *not* unlock advanced exercises just because time passes
- Two aerobic/rope days, one mobility/balance day and one full rest day each week
- Every fourth week is a lighter consolidation week; accessory circuits are omitted on these weeks and on low-energy days
- A **Body map** that explains coverage of major muscle groups and small stabilisers (without pretending each individual muscle needs separate training)
- Bench-press setup and controlled pressing practice (not maximal static holds)
- Optional low-volume accessories for side delts, scapular control, rotator cuff, arm and wrist muscles, adductors, abductors, soleus, calves and foot/ankle stability
- Per-exercise checklist, coaching cues, progress, daily notes and training feedback
- Low-energy and pain adaptation, light/dark theme, offline cache, JSON backup/restore
- No user account, subscription, analytics or external JavaScript needed

## Safety and limitations

This is a general training planner, not medical care or a substitute for qualified coaching. New lifts and advanced calisthenics need appropriate supervision. It does not guarantee planche, muscle-up, one-arm push-up, or height gains. Stretching and jumping cannot lengthen bones. Exercise should be adjusted for pain, fatigue, schedule and gradual growth. The programme deliberately builds recovery time in: daily training need not mean daily hard exercise. Completing accessories is optional and is not required to mark a session finished. New users should work up to the full plan gradually; more exercises are not always better. Do not chase a supposedly perfect body. Instead, aim for coordination, strength, fitness and reliable recovery.

## Updating

Edit `app.js` to update the daily training templates, skill stages or annual roadmap; edit `styles.css` for the UI. Change `CACHE` in `sw.js` (e.g. `form365-v4`) when deploying revised files so installed devices update the offline cache. Hosting a GitHub repo via GitHub Pages (or connecting it to Netlify) means future commits can publish updates.

## Data privacy

User data is stored in the same browser's `localStorage`; it is **not synced across devices or browser profiles**. Use Settings → Export backup before switching devices or clearing site data.

## Evidence

- AAP, *Resistance Training for Children and Adolescents*, reaffirmed 2024: https://publications.aap.org/pediatrics/article/145/6/e20201011/76942/
- 2014 youth resistance-training international consensus: https://pubmed.ncbi.nlm.nih.gov/24055781/
- NHS, *Physical activity guidelines for children and young people*: https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-children-and-young-people/
- AAP, *Overuse Injuries, Overtraining, and Burnout*, 2024: https://publications.aap.org/pediatrics/article/153/2/e2023065129/196435/
- CDC, *Sleep and Health*: https://www.cdc.gov/healthy-schools/sleep/index.html
- Cleveland Clinic, *Does Stretching Make You Taller?*: https://health.clevelandclinic.org/does-stretching-make-you-taller
- NSCA, *Strength and Conditioning Manual*: https://www.nsca.com/contentassets/116c55d64e1343d2b264e05aaf158a91/basics_of_strength_and_conditioning_manual.pdf

## Attribution

FORM / 365 is an independent editable static web application. Training recommendations are generalised from the sources above, not an individual medical or coaching assessment.