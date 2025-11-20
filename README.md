<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1jQ6yDf0xBtzHEI0QKmzvQLAQ2iRMPEq3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

### Automatyczne wdrażanie (Zalecane)

1. **Włącz GitHub Pages w ustawieniach repozytorium:**
   - Przejdź do Settings → Pages w swoim repozytorium GitHub
   - W sekcji "Source" wybierz "GitHub Actions"

2. **Dodaj sekret z kluczem API (jeśli potrzebny):**
   - Przejdź do Settings → Secrets and variables → Actions
   - Dodaj nowy secret o nazwie `GEMINI_API_KEY` z wartością Twojego klucza API

3. **Wypchnij kod na GitHub:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

4. **Workflow automatycznie wdroży aplikację:**
   - Po każdym pushu do brancha `main` lub `master`, aplikacja zostanie automatycznie zbudowana i wdrożona
   - Sprawdź status w zakładce "Actions" w repozytorium
   - Po zakończeniu, aplikacja będzie dostępna pod adresem: `https://[twoja-nazwa-uzytkownika].github.io/[nazwa-repozytorium]/`

### Ręczne wdrażanie

1. Zainstaluj `gh-pages` globalnie:
   ```bash
   npm install -g gh-pages
   ```

2. Zbuduj i wdróż:
   ```bash
   npm run deploy
   ```

**Uwaga:** Przed wdrożeniem upewnij się, że w `vite.config.ts` base path jest ustawiony na nazwę Twojego repozytorium (zostanie automatycznie ustawiony przez GitHub Actions).
