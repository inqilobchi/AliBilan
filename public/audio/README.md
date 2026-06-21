# Ovozli fayllar (ixtiyoriy)

Ushbu papkaga o'z mp3 fayllaringizni quyidagi nomlar bilan qo'shing.
Fayl topilmasa, ilova avtomatik tarzda Web Audio API yordamida
sintezlangan ovoz chiqaradi (offline ishlaydi).

Tavsiya etilgan fayllar:

- `click.mp3` — tugma bosilganda
- `tick.mp3` — kichik click
- `correct.mp3` — to'g'ri javob
- `wrong.mp3` — noto'g'ri javob
- `win.mp3` — o'yin yutilganda
- `star.mp3` — yulduz olinganda
- `hello.mp3` — Ali salomi ("Salom, do'stim!")
- `bye.mp3` — Ali xayri
- `note-c.mp3` ... `note-b.mp3` — ohang o'yini uchun notalar

Aliga ovoz berish uchun (masalan, har bir darsda):
- `ali-ranglar.mp3`, `ali-raqamlar.mp3`, `ali-ofarin.mp3` va h.k.

Keyin `src/lib/audio.ts`'da `playSound("ali-ofarin")` chaqirsangiz bo'ldi.
