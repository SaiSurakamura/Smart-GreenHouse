window.GH = window.GH || {};

// ==========================
// СИСТЕМА ПЕРЕВОДОВ (i18n)
// ==========================
GH.i18n = {
    current: localStorage.getItem('gh_lang') || 'ru',

    dict: {
        ru: {
            appName: "Умная Теплица",
            dashboard: "Мониторинг",
            zones: "Зоны",
            sensors: "Датчики",
            control: "Управление",
            alerts: "Оповещения",
            analytics: "Аналитика",
            settings: "Настройки",
            backHome: "Главная",

            simRunning: "▶ СИМУЛЯЦИЯ РАБОТАЕТ",
            simPaused: "⏸ НА ПАУЗЕ",
            clickPause: "Нажмите, чтобы поставить на паузу",
            clickResume: "Нажмите, чтобы продолжить",
            themeDark: "Тёмная тема",
            themeLight: "Светлая тема",
            language: "Язык",

            avgTemp: "Средняя температура",
            avgHumidity: "Средняя влажность",
            avgSoil: "Средняя почва",
            avgWater: "Запас воды",
            activeAlerts: "Активные аварии",
            onlineSensors: "Онлайн датчики",
            zoneStatus: "Статус зон",
            recentAlerts: "Последние аварии",
            recentEvents: "Журнал событий",
            noActiveAlerts: "Активных нет",
            noEvents: "Событий нет",
            updated: "Обновлено",
            riskLabel: "Риск",
            noDevices: "Нет активных устройств",

            manageZones: "Управление участками теплицы. Минимум 3 зоны.",
            addZonePlaceholder: "Название новой зоны...",
            addZoneBtn: "Добавить",
            renameBtn: "Переименовать",
            deleteBtn: "Удалить",
            confirmDelete: "Удалить зону \"{name}\"?",
            minThreeZones: "Минимум 3 зоны!",
            thresholdsInfo: "Пороги: T {min}-{max}°C, Почва {sMin}-{sMax}%, Вода crit {crit}%",

            telemetryDesc: "Текущие показания телеметрии.",
            filterAllTypes: "Все типы",
            filterAnyStatus: "Любой статус",
            filterOnline: "Онлайн",
            filterOffline: "Оффлайн",
            searchPlaceholder: "Поиск...",
            colSensor: "Датчик",
            colZone: "Зона",
            colValue: "Значение",
            colStatus: "Статус",
            colTime: "Время",
            colAction: "Действие",
            actionTurnOn: "Вкл",
            actionTurnOff: "Выкл",
            statusOnline: "ONLINE",
            statusOffline: "OFFLINE",
            noDataFound: "Нет данных",

            autoMode: "АВТО",
            manualMode: "РУЧНОЙ",
            waterLevelLabel: "Уровень воды",
            safetyBlockMsg: "БЕЗОПАСНОСТЬ: Насос заблокирован (мало воды)",
            refillTankBtn: "Пополнить вручную",
            emergencyStopBtn: "СТОП",
            deviceOn: "ВКЛ",
            deviceOff: "ВЫКЛ",

            alertSeverityWarning: "WARNING",
            alertSeverityCritical: "CRITICAL",
            alertTypeSoilLow: "Сухо в почве",
            alertTypeTempHigh: "Перегрев",
            alertTypeTempLow: "Холодно",
            alertTypeWaterLow: "Мало воды",
            alertTypePumpBlocked: "Насос заблокирован",
            alertTypeCo2High: "Высокий CO₂",
            alertTypeLightLow: "Мало света",
            alertTypeHumidityLow: "Сухой воздух",
            alertTypeHumidityHigh: "Влажный воздух",
            alertTypeSensorOffline: "Датчик оффлайн",
            ackBtn: "Ack",
            resolveBtn: "Resolve",
            eventLogTab: "Event Log",
            alertsTab: "Alerts",
            filterSevAll: "Все уровни",
            filterSevWarn: "Warning",
            filterSevCrit: "Critical",
            filterStatOpen: "Открытые",
            filterStatAck: "Подтверждённые",
            filterStatRes: "Решённые",
            filterStatAll: "Все",
            filterSrcAll: "Все источники",
            filterSrcAuto: "Automation",
            filterSrcMan: "Manual",
            filterSrcAlert: "Alert",
            filterSrcSafety: "Safety",
            filterSrcSim: "Simulator",
            filterSrcUi: "UI",
            filterSrcSet: "Settings",
            noAlertsFound: "Alerts не найдены",
            noEventsFound: "События не найдены",

            chartTemp: "Температура",
            chartHum: "Влажность возд.",
            chartSoil: "Влажность почвы",
            chartRisk: "Риск по зонам",
            riskByZone: "Риск по зоне",
            recommendations: "Рекомендации",
            anomalyDetection: "Детектор аномалий",
            stableState: "Состояние стабильно.",
            recDrySoil: "Почва сухая: проверьте необходимость полива.",
            recOverheat: "Температура выше нормы: проверьте вентиляцию.",
            recCold: "Температура ниже нормы: проверьте обогрев.",
            recLowLight: "Низкая освещённость: рассмотрите досветку.",
            recHighCo2: "Высокий CO₂: включите вентиляцию.",
            recLowHum: "Низкая влажность воздуха: увлажнитель.",
            recHighHum: "Высокая влажность воздуха: вентиляция.",
            recEmptyTank: "Критически низкий уровень воды: пополните бак.",
            recSensorDown: "Есть offline-датчики: проверьте связь.",
            anomalyDetected: "Резкое изменение обнаружено",
            was: "Было", became: "Стало", change: "Изменение",
            noAnomalies: "Резких изменений за последний интервал не обнаружено.",

            globalParams: "Глобальные параметры",
            themeSelect: "Тема оформления",
            themeOptDark: "Тёмная",
            themeOptLight: "Светлая",
            simSpeed: "Скорость симуляции",
            speed3s: "3 секунды",
            speed5s: "5 секунд",
            speed10s: "10 секунд",
            simActive: "Симуляция активна",
            randFailures: "Случайные сбои датчиков",
            autoRefill: "Авто-дозаправка баков",
            autoRefillHint: "При снижении уровня воды ниже критического — автоматическое пополнение до 100%",
            resetDataBtn: "Сбросить все данные",
            confirmReset: "Сбросить ВСЕ данные проекта?",
            threshConfig: "Конфигурация симуляции и пороговые значения для автоматики.",
            fieldTempMin: "Темп. мин (°C)",
            fieldTempMax: "Темп. макс (°C)",
            fieldHumMin: "Влажность мин (%)",
            fieldHumMax: "Влажность макс (%)",
            fieldSoilMin: "Почва мин (%)",
            fieldSoilMax: "Почва макс (%)",
            fieldLightMin: "Свет мин (lx)",
            fieldCo2Max: "CO₂ макс (ppm)",
            fieldWaterCrit: "Вода крит (%)",
            fieldHysteresis: "Гистерезис",

            msgRenamed: "Зона переименована в {name}",
            msgDeleted: "Зона удалена",
            msgAdded: "Добавлена зона {name}",
            msgSimStart: "Симуляция запущена оператором",
            msgSimPause: "Симуляция поставлена на паузу",
            msgRefill: "Бак пополнен до 100% (ручной режим)",
            msgAutoRefill: "Авто-дозаправка: бак {zone} пополнен до 100%",
            msgEmStop: "Все устройства остановлены, режим РУЧНОЙ",
            msgModeAuto: "{zone}: переключено в АВТО",
            msgModeMan: "{zone}: переключено в РУЧНОЙ",
            msgBlockedAuto: "Ручное управление недоступно в режиме АВТО",
            msgPumpBlocked: "Ручной запуск насоса заблокирован: мало воды",
            msgAlarmCreated: "Новое оповещение: {type}",
            msgAlarmResolved: "Оповещение решено автоматически",
            msgSensorOnline: "Датчик восстановлен",
            msgSensorOffline: "Датчик вышел из строя"
        },

        en: {
            appName: "Smart Greenhouse",
            dashboard: "Monitoring",
            zones: "Zones",
            sensors: "Sensors",
            control: "Control",
            alerts: "Alerts",
            analytics: "Analytics",
            settings: "Settings",
            backHome: "Home",

            simRunning: "▶ SIMULATION RUNNING",
            simPaused: "⏸ PAUSED",
            clickPause: "Click to pause simulation",
            clickResume: "Click to resume simulation",
            themeDark: "Dark theme",
            themeLight: "Light theme",
            language: "Language",

            avgTemp: "Average Temperature",
            avgHumidity: "Average Humidity",
            avgSoil: "Average Soil",
            avgWater: "Water Reserve",
            activeAlerts: "Active Alerts",
            onlineSensors: "Online Sensors",
            zoneStatus: "Zone Status",
            recentAlerts: "Recent Alerts",
            recentEvents: "Event Log",
            noActiveAlerts: "No active alerts",
            noEvents: "No events yet",
            updated: "Updated",
            riskLabel: "Risk",
            noDevices: "No active devices",

            manageZones: "Manage greenhouse zones. Minimum 3 zones required.",
            addZonePlaceholder: "New zone name...",
            addZoneBtn: "Add Zone",
            renameBtn: "Rename",
            deleteBtn: "Delete",
            confirmDelete: "Delete zone \"{name}\"?",
            minThreeZones: "Minimum 3 zones required!",
            thresholdsInfo: "Thresholds: T {min}-{max}°C, Soil {sMin}-{sMax}%, Water crit {crit}%",

            telemetryDesc: "Current telemetry readings.",
            filterAllTypes: "All types",
            filterAnyStatus: "Any status",
            filterOnline: "Online",
            filterOffline: "Offline",
            searchPlaceholder: "Search...",
            colSensor: "Sensor",
            colZone: "Zone",
            colValue: "Value",
            colStatus: "Status",
            colTime: "Time",
            colAction: "Action",
            actionTurnOn: "Enable",
            actionTurnOff: "Disable",
            statusOnline: "ONLINE",
            statusOffline: "OFFLINE",
            noDataFound: "No data found",

            autoMode: "AUTO",
            manualMode: "MANUAL",
            waterLevelLabel: "Water Level",
            safetyBlockMsg: "SAFETY: Pump blocked due to low water",
            refillTankBtn: "Refill Manually",
            emergencyStopBtn: "STOP",
            deviceOn: "ON",
            deviceOff: "OFF",

            alertSeverityWarning: "WARNING",
            alertSeverityCritical: "CRITICAL",
            alertTypeSoilLow: "Dry Soil",
            alertTypeTempHigh: "Overheating",
            alertTypeTempLow: "Too Cold",
            alertTypeWaterLow: "Low Water",
            alertTypePumpBlocked: "Pump Blocked",
            alertTypeCo2High: "High CO₂",
            alertTypeLightLow: "Low Light",
            alertTypeHumidityLow: "Dry Air",
            alertTypeHumidityHigh: "Humid Air",
            alertTypeSensorOffline: "Sensor Offline",
            ackBtn: "Ack",
            resolveBtn: "Resolve",
            eventLogTab: "Event Log",
            alertsTab: "Alerts",
            filterSevAll: "All severity",
            filterSevWarn: "Warning",
            filterSevCrit: "Critical",
            filterStatOpen: "Open",
            filterStatAck: "Acknowledged",
            filterStatRes: "Resolved",
            filterStatAll: "All",
            filterSrcAll: "All sources",
            filterSrcAuto: "Automation",
            filterSrcMan: "Manual",
            filterSrcAlert: "Alert",
            filterSrcSafety: "Safety",
            filterSrcSim: "Simulator",
            filterSrcUi: "UI",
            filterSrcSet: "Settings",
            noAlertsFound: "No alerts found",
            noEventsFound: "No events found",

            chartTemp: "Temperature",
            chartHum: "Air Humidity",
            chartSoil: "Soil Moisture",
            chartRisk: "Zone Risk Score",
            riskByZone: "Risk by Zone",
            recommendations: "Recommendations",
            anomalyDetection: "Anomaly Detection",
            stableState: "Zone state is stable.",
            recDrySoil: "Soil is dry: check irrigation necessity.",
            recOverheat: "Temperature above range: check ventilation.",
            recCold: "Temperature below range: check heating.",
            recLowLight: "Low light: consider supplemental lighting.",
            recHighCo2: "High CO₂: activate ventilation.",
            recLowHum: "Low air humidity: use humidifier.",
            recHighHum: "High air humidity: increase ventilation.",
            recEmptyTank: "Critically low water level: refill tank immediately.",
            recSensorDown: "Some sensors are offline: check connectivity.",
            anomalyDetected: "Sudden change detected",
            was: "Was", became: "Became", change: "Change",
            noAnomalies: "No sudden changes detected in last interval.",

            globalParams: "Global Parameters",
            themeSelect: "Theme",
            themeOptDark: "Dark",
            themeOptLight: "Light",
            simSpeed: "Simulation Speed",
            speed3s: "3 seconds",
            speed5s: "5 seconds",
            speed10s: "10 seconds",
            simActive: "Simulation Active",
            randFailures: "Random Sensor Failures",
            autoRefill: "Auto Tank Refill",
            autoRefillHint: "When water drops below critical threshold — automatically fill up to 100%",
            resetDataBtn: "Reset All Data",
            confirmReset: "Reset ALL project data?",
            threshConfig: "Simulation configuration and threshold values for automation.",
            fieldTempMin: "Temp Min (°C)",
            fieldTempMax: "Temp Max (°C)",
            fieldHumMin: "Humidity Min (%)",
            fieldHumMax: "Humidity Max (%)",
            fieldSoilMin: "Soil Min (%)",
            fieldSoilMax: "Soil Max (%)",
            fieldLightMin: "Light Min (lx)",
            fieldCo2Max: "CO₂ Max (ppm)",
            fieldWaterCrit: "Water Critical (%)",
            fieldHysteresis: "Hysteresis",

            msgRenamed: "Zone renamed to {name}",
            msgDeleted: "Zone deleted",
            msgAdded: "Zone {name} added",
            msgSimStart: "Simulation started by operator",
            msgSimPause: "Simulation paused by operator",
            msgRefill: "Tank refilled to 100% (manual mode)",
            msgAutoRefill: "Auto-refill: tank {zone} filled to 100%",
            msgEmStop: "All actuators stopped, mode set to MANUAL",
            msgModeAuto: "{zone}: switched to AUTO mode",
            msgModeMan: "{zone}: switched to MANUAL mode",
            msgBlockedAuto: "Manual control disabled in AUTO mode",
            msgPumpBlocked: "Manual pump start blocked: low water level",
            msgAlarmCreated: "New alert created: {type}",
            msgAlarmResolved: "Alert resolved automatically",
            msgSensorOnline: "Sensor restored online",
            msgSensorOffline: "Sensor went offline"
        }
    },

    t(key, params = {}) {
        const langDict = this.dict[this.current] || this.dict.ru;
        let str = langDict[key] || key;
        Object.entries(params).forEach(([k, v]) => {
            str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        });
        return str;
    },

    setLang(lang) {
        if (!['ru', 'en'].includes(lang)) return;
        this.current = lang;
        localStorage.setItem('gh_lang', lang);
        document.documentElement.lang = lang;
        if (GH.ui && typeof GH.ui.updateTopbar === 'function') GH.ui.updateTopbar();
        if (GH.ui && typeof GH.ui.onDataUpdated === 'function') GH.ui.onDataUpdated();
    },

    toggle() {
        this.setLang(this.current === 'ru' ? 'en' : 'ru');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        GH.i18n.setLang(localStorage.getItem('gh_lang') || 'ru');
    });
} else {
    GH.i18n.setLang(localStorage.getItem('gh_lang') || 'ru');
}

// ==========================
// КОНСТАНТЫ И УТИЛИТЫ
// ==========================
GH.keys = {
    zones: "gh_zones",
    settings: "gh_settings",
    config: "gh_config",
    alerts: "gh_alerts",
    events: "gh_events",
    history: "gh_history"
};

GH.sensorMeta = {
    temperature: { labelKey: "chartTemp", unit: "°C", decimals: 1 },
    humidity: { labelKey: "chartHum", unit: "%", decimals: 0 },
    soil: { labelKey: "chartSoil", unit: "%", decimals: 0 },
    light: { label: "Light", unit: "lx", decimals: 0 },
    co2: { label: "CO₂", unit: "ppm", decimals: 0 },
    waterLevel: { label: "Water Level", unit: "%", decimals: 1 }
};

GH.actuatorMeta = {
    pump: { labelRu: "Насос полива", labelEn: "Irrigation Pump" },
    fan: { labelRu: "Вентилятор", labelEn: "Fan" },
    growLight: { labelRu: "Фитолампа", labelEn: "Grow Light" },
    humidifier: { labelRu: "Увлажнитель", labelEn: "Humidifier" },
    heater: { labelRu: "Обогреватель", labelEn: "Heater" },
    vent: { labelRu: "Форточка", labelEn: "Vent" }
};

GH.utils = {
    clamp(value, min, max) { return Math.min(max, Math.max(min, value)); },
    round(value, decimals = 1) {
        const n = Number(value);
        if (!isFinite(n)) return 0;
        return Number(n.toFixed(decimals));
    },
    uid(len = 6) { return Math.random().toString(36).slice(2, 2 + len).toUpperCase(); },
    now() { return Date.now(); },
    formatDateTime(ts) {
        if (!ts) return "—";
        return new Date(ts).toLocaleString("ru-RU", {
            day: "2-digit", month: "2-digit", year: "2-digit",
            hour: "2-digit", minute: "2-digit", second: "2-digit"
        });
    },
    formatTime(ts) {
        if (!ts) return "—";
        return new Date(ts).toLocaleTimeString("ru-RU", {
            hour: "2-digit", minute: "2-digit", second: "2-digit"
        });
    },
    random(min, max, decimals = 1) {
        const value = Math.random() * (max - min) + min;
        return this.round(value, decimals);
    },
    randomWalk(prev, step, min, max) {
        const delta = (Math.random() * 2 - 1) * step;
        return this.clamp(Number(prev) + delta, min, max);
    },
    percentChange(previous, current) {
        const prev = Number(previous);
        const cur = Number(current);
        if (!isFinite(prev) || !isFinite(cur) || prev === 0) return 0;
        return Math.abs(((cur - prev) / prev) * 100);
    },
    deepClone(obj) { return JSON.parse(JSON.stringify(obj)); },
    byId(array, id) { return (array || []).find((item) => item.id === id); }
};

GH.defaultActuators = () => ({
    pump: false, fan: false, growLight: false,
    humidifier: false, heater: false, vent: false
});

GH.defaultSensorsOnline = () => ({
    temperature: true, humidity: true, soil: true,
    light: true, co2: true, waterLevel: true
});

GH.defaultZoneSettings = (overrides = {}) => {
    const base = {
        temperature: { min: 20, max: 28 },
        humidity: { min: 50, max: 80 },
        soil: { min: 35, max: 75 },
        light: { min: 12000 },
        co2: { max: 1500 },
        waterLevel: { critical: 15 },
        hysteresis: 1.5
    };

    return {
        ...base,
        ...overrides,
        temperature: { ...base.temperature, ...(overrides.temperature || {}) },
        humidity: { ...base.humidity, ...(overrides.humidity || {}) },
        soil: { ...base.soil, ...(overrides.soil || {}) },
        light: { ...base.light, ...(overrides.light || {}) },
        co2: { ...base.co2, ...(overrides.co2 || {}) },
        waterLevel: { ...base.waterLevel, ...(overrides.waterLevel || {}) },
        hysteresis: overrides.hysteresis ?? base.hysteresis
    };
};

GH.createZone = (id, name, values = {}) => ({
    id, name,
    temperature: values.temperature ?? 24.5,
    humidity: values.humidity ?? 65,
    soil: values.soil ?? 50,
    light: values.light ?? 16000,
    co2: values.co2 ?? 850,
    waterLevel: values.waterLevel ?? 100,
    mode: values.mode === "manual" ? "manual" : "auto",
    actuators: { ...GH.defaultActuators(), ...(values.actuators || {}) },
    sensorsOnline: { ...GH.defaultSensorsOnline(), ...(values.sensorsOnline || {}) },
    lastUpdate: values.lastUpdate || Date.now()
});

GH.defaults = {
    config: {
        theme: "dark",
        simIntervalMs: 5000,
        historyLength: 40,
        running: true,
        randomFailures: false,
        autoRefill: true   // <-- НОВЫЙ ПАРАМЕТР
    },

    zones: [
        GH.createZone("ZONE-01", "Томаты", {
            temperature: 24.8, humidity: 67, soil: 42, light: 18400, co2: 820, waterLevel: 72, mode: "auto"
        }),
        GH.createZone("ZONE-02", "Огурцы", {
            temperature: 26.2, humidity: 74, soil: 55, light: 15200, co2: 950, waterLevel: 64, mode: "auto"
        }),
        GH.createZone("ZONE-03", "Зелень", {
            temperature: 22.1, humidity: 61, soil: 38, light: 11200, co2: 720, waterLevel: 81, mode: "manual"
        })
    ],

    settings: {
        "ZONE-01": GH.defaultZoneSettings(),
        "ZONE-02": GH.defaultZoneSettings({
            temperature: { max: 30 }, humidity: { min: 60, max: 85 }, soil: { min: 45, max: 80 }
        }),
        "ZONE-03": GH.defaultZoneSettings({
            temperature: { min: 18, max: 26 }, light: { min: 10000 }, soil: { min: 40, max: 75 }
        })
    }
};

GH.emptyState = () => ({
    zones: GH.utils.deepClone(GH.defaults.zones),
    settings: GH.utils.deepClone(GH.defaults.settings),
    config: GH.utils.deepClone(GH.defaults.config),
    alerts: [], events: [], history: []
});