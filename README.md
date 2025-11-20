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

### Krok 1: Przygotowanie repozytorium na GitHub

1. **Utwórz nowe repozytorium na GitHub** (jeśli jeszcze nie masz):
   - Przejdź na https://github.com/new
   - Wprowadź nazwę repozytorium (np. `screenguard-matcher`)
   - Wybierz publiczne lub prywatne
   - **NIE** zaznaczaj "Initialize with README" (jeśli już masz kod lokalnie)

2. **Połącz lokalne repozytorium z GitHub** (jeśli jeszcze nie połączone):
   ```bash
   git remote add origin https://github.com/[twoja-nazwa-uzytkownika]/[nazwa-repozytorium].git
   git branch -M main  # lub master, jeśli używasz master
   git push -u origin main
   ```

### Krok 2: Włącz GitHub Pages

1. **Przejdź do ustawień repozytorium:**
   - W repozytorium GitHub kliknij **Settings** (Ustawienia)
   - W menu po lewej stronie znajdź **Pages**

2. **Skonfiguruj źródło:**
   - W sekcji **Source** wybierz **"GitHub Actions"** (nie "Deploy from a branch")
   - Zostaw resztę ustawień domyślnych

### Krok 3: Dodaj sekret z kluczem API (opcjonalnie)

Jeśli aplikacja używa klucza API (np. GEMINI_API_KEY):

1. W repozytorium GitHub przejdź do **Settings → Secrets and variables → Actions**
2. Kliknij **New repository secret**
3. Wprowadź:
   - **Name:** `GEMINI_API_KEY`
   - **Secret:** Twój klucz API
4. Kliknij **Add secret**

### Krok 4: Wypchnij kod na GitHub

```bash
# Dodaj wszystkie zmiany
git add .

# Zatwierdź zmiany
git commit -m "Configure GitHub Pages deployment"

# Wypchnij na GitHub
git push origin main
# lub jeśli używasz brancha master:
# git push origin master
```

### Krok 5: Sprawdź wdrożenie

1. **Sprawdź status workflow:**
   - W repozytorium GitHub kliknij zakładkę **Actions**
   - Powinieneś zobaczyć workflow "Deploy to GitHub Pages" w trakcie wykonywania
   - Poczekaj, aż workflow się zakończy (zielony znaczek ✓)

2. **Znajdź adres aplikacji:**
   - Po zakończeniu workflow, przejdź do **Settings → Pages**
   - Adres aplikacji będzie widoczny na górze strony
   - Format: `https://[twoja-nazwa-uzytkownika].github.io/[nazwa-repozytorium]/`

### Automatyczne wdrażanie

Po skonfigurowaniu, każdy push do brancha `main` lub `master` automatycznie:
- Zbuduje aplikację
- Wdroży ją na GitHub Pages
- Aplikacja będzie dostępna w ciągu 1-2 minut

### Rozwiązywanie problemów

**Problem: Workflow się nie uruchamia**
- Sprawdź, czy plik `.github/workflows/deploy.yml` istnieje w repozytorium
- Upewnij się, że branch nazywa się `main` lub `master`

**Problem: Aplikacja nie działa po wdrożeniu**
- Sprawdź, czy base path w `vite.config.ts` jest poprawny (ustawiany automatycznie)
- Sprawdź konsolę przeglądarki pod kątem błędów 404
- Upewnij się, że wszystkie pliki zostały wypchnięte na GitHub

**Problem: Błędy podczas budowania**
- Sprawdź logi w zakładce **Actions**
- Upewnij się, że wszystkie zależności są w `package.json`
