# Kanban Board

Канбан-доска на React, TypeScript и Webpack.

Начальные данные берутся из [tasks.json](tasks.json).
- Дополнительно добавлена возможность переставлять карточки по вертикали для контроля над приоритетностью.
- Дополнительно была добавлена поддержка оффлайн режима с помощью service-worker.

## Запуск

Требуются Node.js 18.18.0 и npm.

```sh
nvm use
npm ci
npm run start
```

Dev-сервер слушает [localhost:8080](http://localhost:8080/).
Для статической публикации `npm run build` собирает приложение в `dist/`.

## Проверки

| Команда                | Проверка                                                      |
| ---------------------- | ------------------------------------------------------------- |
| `npm run test`         | Модульные и интеграционные тесты                              |
| `npm run lint`         | ESLint с Boundaries, Stylelint для SCSS, Steiger и TypeScript |
| `npm run lint:fsd`     | Границы слоёв и публичные API срезов                          |
| `npm run format:check` | Форматирование Prettier                                       |
| `npm run format`       | Применение форматирования                                     |
| `npm run check`        | Форматирование, линтеры, типы и тесты                         |

Тест правила просрочки находится в [is-task-overdue.test.ts](src/entities/task/model/is-task-overdue.test.ts).

## Публикация

[Открыть на GitHub Pages](https://stepushkin33.github.io/kanban-board/).
