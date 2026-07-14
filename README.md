# О проекте
Серверное приложение «Sort» – это REST API и WebSocket сервер, предназначенный для управления системой сортировки.
Проект построен на Node.js с использованием Express, Sequelize (ORM) для работы с PostgreSQL, WebSocket для реального времени и Webpack для сборки production-версии.

Основные функции:

REST API endpoints (префикс /api)

WebSocket сервер (для взаимодействия со сканерами и камерами)

Загрузка файлов (express‑fileupload)

Работа с базой данных через Sequelize (автоматическая синхронизация моделей)

Гибкая настройка через переменные окружения (.env)

# Требования
Node.js (версия 18+)

npm или yarn (рекомендуется yarn, но можно использовать npm)

PostgreSQL (можно запустить через Docker, см. ниже)

Docker (опционально, для базы данных)

# Установка

Клонируйте репозиторий:

bash
```
git clone <repository-url>

cd sort
```
Установите зависимости:

bash

```npm install```

# или
```yarn install```

# Порт сервера
```
PORT=5000
```
# Настройки базы данных PostgreSQL
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sorting_db
```

Запуск базы данных (PostgreSQL)
Проект включает docker-compose.yml для быстрого поднятия PostgreSQL:

bash
````
docker-compose up -d
````
Это создаст контейнер sorting-system-db с образом postgres:18.3-alpine3.23 и смонтирует локальную папку ./data для хранения данных.

Убедитесь, что переменные окружения в .env соответствуют настройкам контейнера (по умолчанию: POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres, POSTGRES_DB=postgres – но вы можете переопределить их в Docker Compose или в .env).

Запуск в режиме разработки
Для разработки используется nodemon для автоматического перезапуска сервера при изменениях:

bash
```
npm run dev
```
# или
```
yarn dev
```
Сервер запустится на порту, указанном в .env (по умолчанию 5000).
При старте выполняется подключение к БД и синхронизация моделей (создание таблиц, если их нет).

Сборка и запуск в production
Сборка с Webpack
Webpack собирает приложение в один бандл для production:

bash
```
npm run build
```
# или
yarn build
Результат сборки сохраняется в dist/build.js (согласно webpack.config.js).
В процессе сборки используется dotenv-webpack для внедрения переменных окружения в бандл.

Запуск собранного приложения
По умолчанию в package.json скрипт start указан как node dist/bundle.js, однако Webpack генерирует build.js.
Чтобы запустить production‑версию, выполните:

bash
```
node dist/build.js
```
Либо измените скрипт start в package.json на:

json
```
"start": "node dist/build.js"
```
Запуск с помощью bat‑файлов (Windows)
В корне проекта есть два вспомогательных скрипта для Windows:

run-windows.bat – устанавливает зависимости и запускает сервер в режиме разработки (node index.js).

build-windows.bat – устанавливает dev‑зависимости, выполняет сборку Webpack и открывает папку dist в проводнике.

Используйте их, если работаете в среде Windows и предпочитаете bat‑файлы.

#Структура проекта (основные папки)
```
sort/
├── controllers/# Контроллеры (логика обработки запросов)
├── database/# Подключение к БД и модели Sequelize
├── middleware/ # Промежуточные обработчики (например, error‑handler)
├── modules/ # Вспомогательные модули (logger, config и т.д.)
├── routes/# Определение маршрутов REST API
├── services/ # Сервисы (сканер, камера, WebSocket клиенты)
├── .env# Переменные окружения (не в репозитории)
├── docker-compose.yml# Конфигурация Docker для PostgreSQL
├── index.js# Главный входной файл
├── package.json# Зависимости и скрипты
├── webpack.config.js# Конфигурация Webpack
├── run-windows.bat# Запуск в Windows
├── build-windows.bat# Сборка в Windows
└── README.md# Этот файл
```
WebSocket не работает – убедитесь, что сервер поднимается на том же порту, и клиенты подключаются к ws://<host>:<port>.

Сборка Webpack выдаёт ошибки – проверьте версии Node.js и пакетов; попробуйте удалить node_modules и установить заново.

Скрипт start не находит bundle.js – см. раздел "Запуск собранного приложения" – используйте node dist/build.js или исправьте package.json.

Используемые технологии

Express – веб‑фреймворк

Sequelize – ORM для PostgreSQL

WebSocket (ws) – двусторонняя связь в реальном времени

Webpack – сборка для production

bcrypt – хеширование паролей

cors – кросс‑доменные запросы

dotenv-webpack – переменные окружения при сборке
