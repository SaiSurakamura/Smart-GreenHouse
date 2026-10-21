GH.simulator = {
    timer: null,

    start() {
        this.stop();
        if (!GH.state?.config?.running) return;

        const interval = Number(GH.state.config.simIntervalMs) || 5000;
        this.timer = setInterval(() => this.tick(), interval);
    },

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },

    restart() {
        this.start();
    },

    tick() {
        if (!GH.state) return;

        const now = Date.now();

        GH.state.zones.forEach((zone) => {
            zone.lastUpdate = now;

            if (GH.state.config.randomFailures) {
                this.maybeFailSensors(zone);
            }

            this.simulateZone(zone);

            const settings = GH.state.settings[zone.id] || GH.defaultZoneSettings();

            // --- АВТО-ДОЗАПРАВКА ВОДЫ ---
            if (GH.state.config.autoRefill) {
                const critical = Number(settings.waterLevel.critical) || 15;

                if (zone.waterLevel <= critical) {
                    zone.waterLevel = 100;

                    GH.events.add({
                        zoneId: zone.id,
                        source: "automation",
                        action: "AUTO_REFILL",
                        message: GH.i18n.t("msgAutoRefill", { zone: zone.name })
                    });

                    // Разблокируем алерты о низкой воде
                    GH.alerts.resolveByType(zone.id, "waterLow");
                    GH.alerts.resolveByType(zone.id, "pumpBlocked");
                }
            }
            // ----------------------------

            if (zone.mode === "auto") {
                GH.automation.runZone(zone, settings, "automation");
            } else {
                GH.automation.enforceSafety(zone, settings, "safety");
            }
        });

        this.pushHistory(now);
        GH.storage.saveAll();

        if (GH.ui?.onDataUpdated) {
            GH.ui.onDataUpdated();
        }
    },

    simulateZone(zone) {
        const u = GH.utils;
        const a = zone.actuators;

        if (zone.sensorsOnline.temperature) {
            let value = u.randomWalk(zone.temperature, 0.35, 15, 38);
            if (a.fan || a.vent) value -= 0.35;
            if (a.heater) value += 0.45;
            zone.temperature = u.round(u.clamp(value, 15, 38), 1);
        }

        if (zone.sensorsOnline.humidity) {
            let value = u.randomWalk(zone.humidity, 0.9, 25, 98);
            if (a.humidifier) value += 1.2;
            if (a.fan || a.vent) value -= 0.55;
            zone.humidity = u.round(u.clamp(value, 25, 98), 0);
        }

        if (zone.sensorsOnline.soil) {
            let value = zone.soil;
            value += a.pump ? 1.7 : -0.28;
            value += (Math.random() - 0.5) * 0.8;
            zone.soil = u.round(u.clamp(value, 0, 100), 0);
        }

        if (zone.sensorsOnline.light) {
            let value = u.randomWalk(zone.light, 900, 2000, 45000);
            if (a.growLight) value += 2500;
            zone.light = u.round(u.clamp(value, 2000, 45000), 0);
        }

        if (zone.sensorsOnline.co2) {
            let value = u.randomWalk(zone.co2, 40, 350, 2200);
            if (a.fan || a.vent) value -= 85;
            zone.co2 = u.round(u.clamp(value, 350, 2200), 0);
        }

        let water = zone.waterLevel;
        water -= a.pump ? 0.65 : 0.03;
        water -= Math.random() * 0.02;
        zone.waterLevel = u.round(u.clamp(water, 0, 100), 1);
    },

    maybeFailSensors(zone) {
        const types = Object.keys(zone.sensorsOnline || {});
        if (!types.length) return;

        if (Math.random() < 0.025) {
            const sensor = types[Math.floor(Math.random() * types.length)];
            zone.sensorsOnline[sensor] = !zone.sensorsOnline[sensor];

            const message = zone.sensorsOnline[sensor]
                ? `${sensor} sensor restored`
                : `${sensor} sensor went offline`;

            GH.events?.add({
                zoneId: zone.id,
                source: "simulator",
                action: zone.sensorsOnline[sensor] ? "SENSOR_ONLINE" : "SENSOR_OFFLINE",
                message
            });

            if (!zone.sensorsOnline[sensor]) {
                GH.alerts?.create({
                    zoneId: zone.id,
                    type: `sensorOffline:${sensor}`,
                    severity: "warning",
                    message: `${sensor} sensor is offline`
                });
            } else {
                GH.alerts?.resolveByType(zone.id, `sensorOffline:${sensor}`);
            }
        }
    },

    pushHistory(timestamp = Date.now()) {
        if (!GH.state) return;

        const snapshot = {
            time: timestamp,
            zones: GH.state.zones.map((zone) => ({
                id: zone.id,
                temperature: zone.temperature,
                humidity: zone.humidity,
                soil: zone.soil,
                light: zone.light,
                co2: zone.co2,
                waterLevel: zone.waterLevel
            }))
        };

        GH.state.history.push(snapshot);

        const max = GH.state.config.historyLength || 40;
        if (GH.state.history.length > max) {
            GH.state.history.splice(0, GH.state.history.length - max);
        }
    }
};