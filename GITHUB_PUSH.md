# Jak wypchnąć zmiany na GitHub - Instrukcja krok po kroku

## ✅ Status
Twoje repozytorium jest już połączone z GitHubem:
- **Remote:** `https://github.com/Leoncio16/szkielka.git`
- **Branch:** `master`

## 📝 Krok 1: Dodaj wszystkie zmiany do staging

W terminalu (PowerShell) wykonaj:

```powershell
cd "c:\Users\leonk\OneDrive\Pulpit\urzad pracy\Nowy folder"
git add .
```

To doda wszystkie zmienione i nowe pliki do staging area.

## 💾 Krok 2: Zatwierdź zmiany (commit)

```powershell
git commit -m "Dodano Firebase Firestore i narzędzia do zarządzania telefonami"
```

Możesz zmienić wiadomość commit na coś bardziej opisowego, np.:
- `"Migracja z localStorage na Firebase Firestore"`
- `"Dodano edycję i usuwanie telefonów w zakładce Import"`

## 🚀 Krok 3: Wypchnij zmiany na GitHub

```powershell
git push origin master
```

Jeśli pojawi się błąd, że branch jest za daleko w tyle, użyj:
```powershell
git pull origin master
```
A następnie spróbuj ponownie:
```powershell
git push origin master
```

## ✅ Krok 4: Sprawdź czy się udało

1. Przejdź na https://github.com/Leoncio16/szkielka
2. Sprawdź czy widzisz swoje zmiany w plikach
3. Jeśli masz skonfigurowany GitHub Pages, aplikacja automatycznie się zaktualizuje

## 📋 Podsumowanie - Wszystkie komendy naraz

```powershell
cd "c:\Users\leonk\OneDrive\Pulpit\urzad pracy\Nowy folder"
git add .
git commit -m "Dodano Firebase Firestore i narzędzia do zarządzania telefonami"
git push origin master
```

## 🔄 Co zostało zmienione?

Pliki które zostaną wypchnięte:
- ✅ `App.tsx` - przekazywanie listy telefonów do DataImport
- ✅ `components/DataImport.tsx` - dodano tabelę z edycją/usuwaniem telefonów
- ✅ `services/db.ts` - dodano metody Firebase (addPhone, updatePhone, deletePhone)
- ✅ `services/firebaseConfig.ts` - nowy plik z konfiguracją Firebase
- ✅ `FIREBASE_SETUP.md` - nowy plik z instrukcjami Firebase
- ✅ `package.json` i `package-lock.json` - zależności (Firebase już był)

## ⚠️ Ważne uwagi

1. **Firebase Config:** Plik `services/firebaseConfig.ts` zawiera Twoje dane Firebase. Jeśli repozytorium jest publiczne, to jest OK (Firebase pozwala na publiczne klucze API dla web apps).

2. **GitHub Pages:** Jeśli masz skonfigurowany GitHub Pages, po wypchnięciu zmian aplikacja automatycznie się zaktualizuje (jeśli masz workflow w `.github/workflows/deploy.yml`).

3. **Branch:** Używasz brancha `master`. Jeśli GitHub wymaga `main`, możesz zmienić:
   ```powershell
   git branch -M main
   git push origin main
   ```

## 🆘 Rozwiązywanie problemów

**Problem: "Permission denied"**
- Sprawdź czy jesteś zalogowany w Git: `git config user.name`
- Jeśli nie, ustaw: `git config user.name "Twoja Nazwa"` i `git config user.email "twoj@email.com"`

**Problem: "Updates were rejected"**
- Najpierw pobierz zmiany: `git pull origin master`
- Rozwiąż konflikty jeśli są
- Następnie wypchnij: `git push origin master`

**Problem: "Authentication failed"**
- Możesz potrzebować tokenu dostępu zamiast hasła
- Przejdź do: GitHub → Settings → Developer settings → Personal access tokens
- Utwórz nowy token i użyj go jako hasła

