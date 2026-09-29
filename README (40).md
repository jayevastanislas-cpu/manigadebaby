# src/assets — ressources compilées avec l'app

- Images importées par le code (`import cover from "@/assets/cover.png"`)
- Icônes SVG que vous voulez transformer en composants React
- Polices locales (sinon Google Fonts via `src/app/layout.tsx`)

Les médias lourds (audio, vidéo, photos de catalogue) vont dans **public/assets/** :
ils sont alors servis tels quels, sans passer par le bundler.
