# create-testplane

Используйте `create-testplane`, чтобы быстро и удобно настроить [testplane](https://github.com/gemini-testing/testplane) как в новом, так и в уже существующем проекте.

## Использование

```bash
npm init testplane my-app
```

<img src="../assets/usage.gif"/>

Если не указать путь, проект будет развернут в текущей директории.

Если по указанному пути уже имеется проект, инструмент попробует определить используемый пакетный менеджер, и будет использовать его для установки пакетов.

### Режим «без вопросов»

Вы можете добавить аргумент `-y` или `--yes` чтобы запустить инструмент в режиме «без вопросов».

В этом режиме у вас не будут спрашивать о желаемых плагинах и пакетном менеджере, будут использоваться настройки по умолчанию.

Пакетный менеджер по умолчанию, используемый с аргументом `--yes`: `npm`

Плагины по умолчанию, устанавливаемые с аргументом `--yes`: 
- [html-reporter](https://github.com/gemini-testing/html-reporter)

### Язык

По умолчанию create-testplane настраивает проект с поддержкой typescript тестов.

Вы можете отказаться от использования typescript, добавив аргумент `--lang js`:

```bash
npm init testplane-app my-app -- --lang js
```

## Список предлагаемых плагинов

- [Global Hook](https://github.com/gemini-testing/testplane-global-hook) - Чтобы вынести общую логику из своих тестов в специальные обработчики для `beforeEach` и `afterEach` хуков
- [Plugins Profiler](https://github.com/gemini-testing/testplane-plugins-profiler) - Для профилирования плагинов
- [Retry Progressive](https://github.com/gemini-testing/testplane-retry-progressive) - Чтобы дополнительно прогонять тесты, если ошибки, с которыми они упали, соответствуют заданному набору шаблонов
- [Test Filter](https://github.com/gemini-testing/testplane-test-filter) - Чтобы запускать только указанные в `.json` файле тесты в указанных браузерах
- [Retry Limiter](https://github.com/gemini-testing/retry-limiter) - Чтобы ограничить количество попыток перезапуска и время выполнения тестов
- [Headless Chrome](https://github.com/gemini-testing/testplane-headless-chrome) - Чтобы добавить и установить браузер chrome в режиме `headless`
- [Profiler](https://github.com/gemini-testing/testplane-profiler) - Чтобы генерировать отчет о выполненных командах и их производительности
- [Safari Commands](https://github.com/gemini-testing/testplane-safari-commands) - Чтобы поддержать работу для браузера `safari` на мобильных устройствах
- [Test Repeater](https://github.com/gemini-testing/testplane-test-repeater) - Чтобы повторять тесты указанное количество раз вне зависимости от результата
- [Url Decorator](https://github.com/gemini-testing/url-decorator) - Чтобы добавить/заменить параметры запроса в `url` команде
- [Reassert View](https://github.com/gemini-testing/testplane-reassert-view) - Чтобы сделать скриншотное тестирование менее строгим
- [Storybook](https://github.com/gemini-testing/testplane-storybook) - Чтобы писать тесты на `storybook` компонентах и ускорить время их выполнения
- [Html Reporter](https://github.com/gemini-testing/html-reporter) - Чтобы генерировать отчеты для отображения прошедших/упавших тестах, разницы между скриншотами, ошибкок, мета информации
- [Oauth](https://github.com/gemini-testing/testplane-oauth) - Чтобы установить заголовок авторизации с OAuth токеном
- [Retry Command](https://github.com/gemini-testing/testplane-retry-command) - Чтобы повторить снятие скриншота, если сравнение изображений завершилось с ошибкой
- [Tabs Closer](https://github.com/gemini-testing/testplane-tabs-closer) - Чтобы закрывать открытые вкладки из прошлых тестов, чтобы браузер не деградировал

## Кастомизация инструмента

Вы можете создать свой node-js скрипт на основе `create-testplane` для разворачивания конфигурации.

Это может понадобиться, к примеру, если у вас есть внутренние плагины для testplane, распространяемые для проектов внутри компании.

```ts
import createTestplane from "create-testplane";

createTestplane.run({
    createOpts,
    createBaseConfig,
    generalPrompts,
    generalPromptsHandler,
    createPluginsConfig,
    getExtraPackagesToInstall,
    getTestExample,
    registry
});
```

*Примечание: в `testplaneConfig` можно класть только сериализуемые данные*.

### Параметры

#### createOpts (обязателен)

**Обязательный параметр.**

Консольный интерфейс по умолчанию обрабатывает данный путь и аргумент `--yes`.
В этом коллбэке вам необходимо указать как минимум значения `path` и `noQuestions`:

```ts
import type { DefaultOpts } from "create-testplane";

const argvOpts = {
    path: ".",
    noQuestions: true
};

const createOpts = (defaultOpts: DefaultOpts) => {
    const opts = Object.assign({}, argvOpts, defaultOpts);

    return opts;
};
```
Вы также можете изменить `defaultOpts` Сейчас этот объект имеет ключ `pluginGroups`, по которому `create-testplane` определяет, как плагины разбиваются на группы.

#### createBaseConfig

Инструмент создает базовый конфиг гермионы, который затем мутирует. Вы можете изменить этот базовый конфиг:

```ts
import type { testplaneConfig, CreateBaseConfigOpts } from "create-testplane";

const createBaseConfig = (baseConfig: TestplaneConfig, opts: CreateBaseConfigOpts) => {
    baseConfig.takeScreenshotOnFails = {
        testFail: true,
        assertViewFail: false
    };

    return baseConfig;
}
```

#### generalPrompts

Вы также можете убрать или добавить общие задаваемые вопросы, обработать пользовательские ответы для изменения `testplaneConfig`

```ts
import type { GeneralPrompt, HandleGeneralPromptsCallback, baseGeneralPrompts } from "create-testplane";

const promptRetries: GeneralPrompt = {
    type: "number",
    name: "retryCount",
    message: "How many times do you want to retry a failed test?",
    default: 0,
};

const promptIgnoreFiles: GeneralPrompt = {
    type: "input",
    name: "ignoreFiles",
    message: "Enter a pattern to ignore files",
    default: null,
};

const generalPrompts = [...baseGeneralPrompts, promptRetries, promptIgnoreFiles];

const generalPromptsHandler: HandleGeneralPromptsCallback = (testplaneConfig, answers) => {
    answers.retry = answers.retryCount;

    if (answers.ignoreFiles) {
        const sets = Object.values(testplaneConfig.sets || {});
        for (const testSet of sets) {
            testSet.ignoreFiles = testSet.ignoreFiles || [];
            testSet.ignoreFiles.push(answers.ignoreFiles);
        }
    }

    return testplaneConfig;
};
```

Если у `GeneralPrompt` не указать значение по умолчанию, вопрос будет задан даже при `noQuestions: true`

#### createPluginsConfig

Вы также можете изменить, как включение плагинов влияет на `.testplane.conf.js`

```ts
import type { CreatePluginsConfigCallback } from "create-testplane";

const createPluginsConfig: CreatePluginsConfigCallback = (pluginsConfig) => {
    pluginsConfig["testplane-retry-progressive"] = (testplaneConfig) => {
        testplaneConfig.plugins!["testplane-retry-progressive"] = {
            enabled: true,
            extraRetry: 7,
            errorPatterns: [
                "Parameter .* must be a string",
                {
                    name: "Cannot read property of undefined",
                    pattern: "Cannot read property .* of undefined",
                },
            ],
        };
    }

    return pluginsConfig;
}
```

#### registry

Вы также можете изменить реестр, который будет использован для установки пакетов

```ts
import createTestplane from "create-testplane";

createTestplane.run({
    registry: "https://registry.npmjs.org", // Значение по умолчанию
});
```

#### getExtraPackagesToInstall

Вы также можете указать дополнительные пакеты, которые будут установлены с `testplane` без всяких условий

```ts
import type { GetExtraPackagesToInstallCallback } from "create-testplane";

const getExtraPackagesToInstall: GetExtraPackagesToInstallCallback = () => ({
    names: ["chai"],
    notes: []
});
```

### Добавление кастомного плагина

Для начала вам необходимо включить свой плагин в существующую группу плагинов, или создать свою:

```ts
import type {
    DefaultOpts,
    GeneralPrompt,
    PluginPrompt
} from "create-testplane";

const createOpts = (defaultOpts: DefaultOpts) => {
    const customPluginPrompt: PluginPrompt = {
        // Имя плагина. Инструмент попытается загрузить его выбранным пакетным менеджером
        // Суффиксы "/plugin" и "/testplane" будут удалены при загрузке
        plugin: "my-custom-plugin-name",
        // Описание плагина
        description: "Adds some custom feature",
        // Должен ли плагин быть установлен в режиме «по умолчанию»
        default: false,
        // Если плагин требует дополнительной настройки. Опционально
        configNote: "Specify something in testplane config"
    };

    defaultOpts.pluginGroups.push({
        description: "Custom plugin group",
        plugins: [customPluginPrompt]
    });

    return {
        ...defaultOpts,
        path: ".",
        noQuestions: false
    };
};
```

Затем вам необходимо определить, как включение плагина влияет на `.testplane.conf.js`

```ts
import type { CreatePluginsConfigCallback } from "create-testplane";

const createPluginsConfig: CreatePluginsConfigCallback = (pluginsConfig) => {
    pluginsConfig["my-custom-plugin-name"] = (testplaneConfig) => {
        // В большинстве случаев вам понадобится описать настройки по умолчанию вашего плагина
        testplaneConfig.plugins!["my-custom-plugin-name"] = {
            enabled: true,
        };
        // Но вы также можете сделать с конфигом гермионы что-нибудь еще
        testplaneConfig.browsers["my-custom-browser"] = {
            desiredCapabilities: {
                browserName: "browserName"
            }
        }
    }

    return pluginsConfig;
}
```
