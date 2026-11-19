# hello.world

**Один «Hello, World!» — и целый продукт.** Интерактивная витрина на чистом HTML, CSS и JavaScript: без фреймворков, без сборки и с нулём runtime-зависимостей.

[![CI & Deploy](https://github.com/kerpi4u/test/actions/workflows/pages.yml/badge.svg)](https://github.com/kerpi4u/test/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-22d3ee.svg)](./LICENSE)
[![Dependencies](https://img.shields.io/badge/runtime%20dependencies-0-a78bfa.svg)](#философия)
[![Tests](https://img.shields.io/badge/tests-32%20passing-34d399.svg)](./tests)

🔗 **Демо: https://kerpi4u.github.io/test/**

---

## Что внутри

| Раздел | Что делает |
| --- | --- |
| **Hero** | Анимированный constellation-фон на `<canvas>`, градиентная типографика, эффект печатной машинки на 8 языках |
| **Возможности** | Шесть карточек с reveal-анимациями и подсветкой границ |
| **Плейграунд** | Живой редактор темы: 4 цвета + радиус + свечение, превью в реальном времени, экспорт CSS-переменных, сохранение в `localStorage` |
| **Коллекция кода** | «Hello, World!» на 20 языках, собственная подсветка синтаксиса, roving-tabindex табы, копирование в клик |
| **Демо-компоненты** | Валидация формы, тосты (4 состояния), прогресс + skeleton, нативный `<dialog>` с фокус-трапом |
| **Метрики** | FPS со спарклайном, время загрузки, `transferSize`, число DOM-узлов — всё через Performance API |
| **Палитра команд** | ⌘K / Ctrl+K: нечёткий поиск, стрелки/Home/End/Enter, `aria-activedescendant`, возврат фокуса |
| **PWA** | Manifest, service worker (offline-first), установка на домашний экран |
| **i18n** | Русский и английский, 157 ключей, авто-определение языка, переключение на лету |
| **Темы** | Светлая и тёмная, `prefers-color-scheme`, запоминание выбора |

## Философия

```
runtime dependencies ........ 0
build step ................... нет
внешние шрифты и CDN ......... нет
JS-модули .................... 22 файла, ES modules
тесты ........................ 32, node:test
```

Сайт работает как есть: `index.html` открывается двойным кликом, а на GitHub Pages — без единого шага сборки. Всё, что обычно тянет за собой `node_modules`, здесь написано руками: подсветка синтаксиса (~60 строк), нечёткий поиск, тосты, focus trap, генератор палитр, статический сервер и линтер.

## Быстрый старт

```bash
# любой из вариантов
git clone https://github.com/kerpi4u/test.git
cd test
npm run dev          # http://localhost:8000, без установки зависимостей
```

Или просто откройте `index.html` в браузере.

### Скрипты

| Команда | Что делает |
| --- | --- |
| `npm run dev` / `npm start` | Статический сервер с корректными MIME и кастомной 404 |
| `npm run lint` | Синтаксис JS, валидность JSON, битые локальные ссылки, покрытие i18n, DOM-id, precache service worker |
| `npm test` | 32 unit-теста на `node:test` |
| `npm run check` | Линт + тесты (то же, что гоняет CI) |
| `python3 scripts/make-icons.py` | Перегенерировать PWA-иконки 192/512 без зависимостей |

## Структура

```
├── index.html                  # разметка, семантика, meta/OG/PWA
├── 404.html                    # кастомная страница ошибки
├── manifest.webmanifest        # PWA
├── sw.js                       # service worker: precache + offline fallback
├── robots.txt · sitemap.xml
├── src/
│   ├── css/
│   │   ├── tokens.css          # дизайн-токены и обе темы
│   │   ├── base.css            # reset, типографика, a11y
│   │   ├── layout.css          # каркас, hero, секции, футер
│   │   ├── components.css      # кнопки, карточки, палитра, тосты, диалог
│   │   ├── animations.css      # keyframes и reveal-переходы
│   │   └── utilities.css
│   └── js/
│       ├── main.js             # сборка приложения
│       ├── i18n.js · theme.js
│       ├── data/               # словари и 20 сниппетов
│       ├── lib/                # fuzzy, highlight, translate, utils
│       └── ui/                 # 10 независимых UI-модулей
├── tests/                      # node:test, без зависимостей
├── scripts/                    # serve.js, lint.js, make-icons.py
└── .github/workflows/pages.yml # lint → test → deploy
```

## Инженерные решения

- **Ноль блокирующих ресурсов.** CSS подключается шестью файлами, JS — ES-модулями с `type="module"` (deferred по умолчанию). Никаких веб-шрифтов и внешних CDN.
- **Безопасность.** Подсветчик экранирует HTML *до* вставки, `innerHTML` используется только для собственного сгенерированного кода; пользовательский ввод идёт через `textContent`.
- **Доступность.** Skip-link, `aria-live` для тостов, `role="tablist"` с roving tabindex, `aria-activedescendant` в палитре, focus trap в диалоге, видимый `:focus-visible`, поддержка `prefers-reduced-motion` (анимации и canvas отключаются).
- **Производительность.** `IntersectionObserver` для reveal и активной навигации, rAF-цикл останавливается при скрытой вкладке, canvas ограничен DPR ≤ 2, частицы масштабируются по площади экрана.
- **Прогрессивное улучшение.** Без JS контент виден полностью (класс `.js` включает анимации), навигация работает как обычные якоря.
- **Линтер вместо конфигов.** `scripts/lint.js` проверяет в том числе паритет ключей i18n и соответствие precache-списка service worker реальным файлам, чтобы «тихие» поломки не доезжали до продакшена.

## Деплой

Пуш в `main` запускает GitHub Actions:

1. `Lint & test` — `npm run lint` и `npm test`;
2. `Deploy` — публикация корня репозитория на GitHub Pages через `actions/deploy-pages`.

Pages включён с источником **GitHub Actions**; сайт доступен по адресу `https://kerpi4u.github.io/test/`.

## Добавить язык

```js
// src/js/data/snippets.js
{
  id: "crystal",
  name: "Crystal",
  file: "hello.cr",
  keywords: ["puts"],
  code: 'puts "Hello, World!"',
}
```

Язык автоматически появится в табах, палитре команд и счётчике — тесты проверят уникальность `id` и наличие приветствия.

## Лицензия

[MIT](./LICENSE) © 2026 kerpi4u
