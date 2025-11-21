# Konfiguracja Firebase - Przewodnik krok po kroku

## ✅ Krok 1: Konfiguracja została już wykonana

Twoje dane Firebase zostały już dodane do pliku `services/firebaseConfig.ts`. Aplikacja jest gotowa do użycia z Firebase!

## 🔒 Krok 2: Konfiguracja reguł bezpieczeństwa Firestore

**To jest bardzo ważne!** Musisz skonfigurować reguły dostępu do bazy danych Firestore.

### Jak to zrobić:

1. **Przejdź do konsoli Firebase:**
   - Otwórz https://console.firebase.google.com/
   - Wybierz swój projekt: `glasses-2be29`

2. **Przejdź do Firestore Database:**
   - W menu po lewej stronie kliknij **Firestore Database**
   - Kliknij zakładkę **Rules** (Reguły)

3. **Ustaw reguły dostępu:**
   
   Dla aplikacji, która ma być dostępna publicznie (bez autoryzacji), użyj następujących reguł:
   
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Zezwól na odczyt i zapis dla kolekcji phones
       match /phones/{document=**} {
         allow read, write: if true;
       }
       
       // Zezwól na odczyt i zapis dla kolekcji glasses
       match /glasses/{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

   ⚠️ **Uwaga:** Te reguły pozwalają każdemu na odczyt i zapis danych. Jeśli chcesz zabezpieczyć aplikację, powinieneś dodać autoryzację (np. Firebase Authentication).

4. **Zapisz reguły:**
   - Kliknij **Publish** (Opublikuj)

## 📊 Krok 3: Struktura danych w Firestore

Aplikacja automatycznie utworzy dwie kolekcje w Firestore:

- **`phones`** - przechowuje dane telefonów
- **`glasses`** - przechowuje dane folii ochronnych

Każdy dokument zawiera:
- `id` (number) - unikalny identyfikator
- Pozostałe pola zgodne z interfejsami `Phone` i `Glass`

## 🚀 Krok 4: Testowanie

1. **Uruchom aplikację lokalnie:**
   ```bash
   npm run dev
   ```

2. **Sprawdź czy dane są zapisywane:**
   - Dodaj nową folię w aplikacji
   - Sprawdź w konsoli Firebase (Firestore Database → Data) czy dokument został dodany

3. **Sprawdź czy dane są odczytywane:**
   - Odśwież stronę aplikacji
   - Dane powinny zostać załadowane z Firestore

## 🔐 Opcjonalnie: Zabezpieczenie aplikacji

Jeśli chcesz zabezpieczyć aplikację przed nieautoryzowanym dostępem:

1. **Włącz Firebase Authentication** w konsoli Firebase
2. **Zaktualizuj reguły Firestore** aby wymagały autoryzacji:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /phones/{document=**} {
         allow read, write: if request.auth != null;
       }
       match /glasses/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## ❓ Rozwiązywanie problemów

**Problem: Błąd "Missing or insufficient permissions"**
- Sprawdź czy reguły Firestore zostały opublikowane
- Upewnij się, że reguły pozwalają na odczyt/zapis

**Problem: Dane nie są zapisywane**
- Sprawdź konsolę przeglądarki (F12) pod kątem błędów
- Sprawdź czy projekt Firebase jest aktywny
- Upewnij się, że Firestore Database jest włączony w konsoli Firebase

**Problem: Aplikacja nie łączy się z Firebase**
- Sprawdź czy dane w `firebaseConfig.ts` są poprawne
- Sprawdź czy masz połączenie z internetem
- Sprawdź czy projekt Firebase nie został usunięty lub zawieszony

## 📝 Co zostało zmienione?

- ✅ `services/firebaseConfig.ts` - dodana konfiguracja Firebase
- ✅ `services/db.ts` - przepisany na Firestore zamiast localStorage
- ✅ Dane są teraz przechowywane w chmurze Firebase zamiast w przeglądarce

## 🎉 Gotowe!

Twoja aplikacja jest teraz skonfigurowana do używania Firebase Firestore. Wszystkie dane będą przechowywane w chmurze i dostępne z każdego urządzenia!

