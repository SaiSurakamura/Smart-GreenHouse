GH.storage = {
    load() {
        const saved = {};

        Object.entries(GH.keys).forEach(([stateKey, storageKey]) => {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            try {
                saved[stateKey] = JSON.parse(raw);
            } catch (error) {
                console.warn("Broken localStorage key:", storageKey, error);
            }
        });

        if (!Array.isArray(saved.zones) || saved.zones.length === 0) {
            GH.state = GH.emptyState();
        } else {
            GH.state = {
                ...GH.emptyState(),
                ...saved
            };
        }

        this.normalize();
        this.saveAll();
    },

    normalize() {
        if (!GH.state) GH.state = GH.emptyState();

        GH.state.config = {
            ...GH.defaults.config,
            ...(GH.state.config || {})
        };

        GH.state.config.historyLength = GH.utils.clamp(
            Number(GH.state.config.historyLength) || 40,
            10,
            200
        );

        GH.state.config.simIntervalMs = GH.utils.clamp(
            Number(GH.state.config.simIntervalMs) || 5000,
            1000,
            60000
        );

        GH.state.alerts = Array.isArray(GH.state.alerts) ? GH.state.alerts : [];
        GH.state.events = Array.isArray(GH.state.events) ? GH.state.events : [];
        GH.state.history = Array.isArray(GH.state.history) ? GH.state.history : [];

        GH.state.zones = (Array.isArray(GH.state.zones) ? GH.state.zones : [])
            .filter(Boolean)
            .map((zone, index) => {
                if (!zone.id) zone.id = `ZONE-${String(index + 1).padStart(2, "0")}`;
                if (!zone.name) zone.name = `Zone ${index + 1}`;

                zone.temperature = Number(zone.temperature) || 24;
                zone.humidity = Number(zone.humidity) || 60;
                zone.soil = Number(zone.soil) || 50;
                zone.light = Number(zone.light) || 15000;
                zone.co2 = Number(zone.co2) || 800;
                zone.waterLevel = GH.utils.clamp(Number(zone.waterLevel) || 100, 0, 100);

                zone.mode = zone.mode === "manual" ? "manual" : "auto";
                zone.lastUpdate = zone.lastUpdate || Date.now();

                zone.actuators = {
                    ...GH.defaultActuators(),
                    ...(zone.actuators || {})
                };

                zone.sensorsOnline = {
                    ...GH.defaultSensorsOnline(),
                    ...(zone.sensorsOnline || {})
                };

                return zone;
            });

        const validSettings = {};
        GH.state.zones.forEach((zone) => {
            validSettings[zone.id] =
                GH.state.settings?.[zone.id] || GH.defaultZoneSettings();
        });
        GH.state.settings = validSettings;

        this.capArrays();
    },

    capArrays() {
        if (GH.state.alerts.length > 200) {
            GH.state.alerts.length = 200;
        }

        if (GH.state.events.length > 300) {
            GH.state.events.length = 300;
        }

        const maxHistory = GH.state.config.historyLength;
        if (GH.state.history.length > maxHistory) {
            GH.state.history.splice(0, GH.state.history.length - maxHistory);
        }
    },

    saveAll() {
        if (!GH.state) return;

        this.capArrays();

        localStorage.setItem(GH.keys.zones, JSON.stringify(GH.state.zones));
        localStorage.setItem(GH.keys.settings, JSON.stringify(GH.state.settings));
        localStorage.setItem(GH.keys.config, JSON.stringify(GH.state.config));
        localStorage.setItem(GH.keys.alerts, JSON.stringify(GH.state.alerts));
        localStorage.setItem(GH.keys.events, JSON.stringify(GH.state.events));
        localStorage.setItem(GH.keys.history, JSON.stringify(GH.state.history));
    },

    reset() {
        Object.values(GH.keys).forEach((key) => localStorage.removeItem(key));
        GH.state = GH.emptyState();
        this.saveAll();
    }
};