# Przewodnik wdrożenia na GitHub Pages

## Szybki start

### 1. Utwórz repozytorium na GitHub
- Przejdź na https://github.com/new
- Wprowadź nazwę (np. `screenguard-matcher`)
- **NIE** zaznaczaj "Initialize with README"

### 2. Połącz lokalne repozytorium z GitHub

```bash
# Przejdź do katalogu projektu
cd "c:\Users\leonk\OneDrive\Pulpit\urzad pracy\Nowy folder"

# Sprawdź czy masz już remote
git remote -v

# Jeśli nie masz, dodaj remote (zamień na swoje dane)
git remote add origin https://github.com/[TWOJA-NAZWA]/[NAZWA-REPOZYTORIUM].git

# Wypchnij kod
git add .
git commit -m "Initial commit with GitHub Pages setup"
git push -u origin main
```

### 3. Włącz GitHub Pages

1. W repozytorium GitHub: **Settings → Pages**
2. W sekcji **Source** wybierz **"GitHub Actions"**
3. Zapisz zmiany

### 4. Dodaj sekret API (jeśli potrzebny)

1. **Settings → Secrets and variables → Actions**
2. **New repository secret**
3. Name: `GEMINI_API_KEY`, Value: [twój klucz]
4. **Add secret**

### 5. Wypchnij zmiany

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 6. Sprawdź wdrożenie

1. **Actions** → sprawdź status workflow
2. Po zakończeniu: **Settings → Pages** → zobacz adres aplikacji
3. Adres będzie w formacie: `https://[nazwa-uzytkownika].github.io/[nazwa-repo]/`

## Co dalej?

- Każdy push do `main`/`master` automatycznie wdraża aplikację
- Sprawdź logi w zakładce **Actions** jeśli coś nie działa
- Aplikacja jest dostępna publicznie (jeśli repo jest publiczne)

## Ważne informacje

- Workflow automatycznie ustawia base path na nazwę repozytorium
- Nie musisz ręcznie konfigurować `vite.config.ts` - wszystko działa automatycznie
- Wdrożenie trwa zwykle 1-2 minuty

