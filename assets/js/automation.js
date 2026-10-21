GH.automation = {
    runZone(zone, settings, source = "automation") {
        if (!zone) return [];

        settings = settings || GH.defaultZoneSettings();
        const actions = [];

        actions.push(...this.enforceSafety(zone, settings, source));

        if (zone.mode === "auto") {
            actions.push(...this.irrigation(zone, settings, source));
            actions.push(...this.climate(zone, settings, source));
            actions.push(...this.lighting(zone, settings, source));
            actions.push(...this.airQuality(zone, settings, source));
            actions.push(...this.humidityControl(zone, settings, source));
        }

        this.checkAlerts(zone, settings);
        return actions;
    },

    enforceSafety(zone, settings, source = "safety") {
        const actions = [];
        const critical = Number(settings?.waterLevel?.critical ?? 15);

        if (zone.waterLevel <= critical) {
            if (zone.actuators.pump) {
                this._set(zone, "pump", false, source, "Pump blocked: low water level");
                actions.push("Pump blocked");
            }

            GH.alerts?.create({
                zoneId: zone.id,
                type: "waterLow",
                severity: "critical",
                message: `Water level ${zone.waterLevel}% <= critical ${critical}%`
            });

            GH.alerts?.create({
                zoneId: zone.id,
                type: "pumpBlocked",
                severity: "critical",
                message: "Irrigation pump is blocked due to low water level"
            });
        } else {
            GH.alerts?.resolveByType(zone.id, "waterLow");
            GH.alerts?.resolveByType(zone.id, "pumpBlocked");
        }

        return actions;
    },

    irrigation(zone, settings, source) {
        const actions = [];
        const min = Number(settings.soil.min);
        const max = Number(settings.soil.max);
        const hyst = Number(settings.hysteresis || 0);

        if (zone.actuators.pump) {
            if (zone.soil >= max || zone.soil >= min + hyst) {
                this._set(zone, "pump", false, source, `Pump OFF: soil ${zone.soil}%`);
                actions.push("Pump OFF");
            }
        } else {
            if (zone.soil < min && zone.waterLevel > settings.waterLevel.critical) {
                this._set(zone, "pump", true, source, `Pump ON: soil ${zone.soil}% < ${min}%`);
                actions.push("Pump ON");
            }
        }

        return actions;
    },

    climate(zone, settings, source) {
        const actions = [];
        const hyst = Number(settings.hysteresis || 0);
        const min = Number(settings.temperature.min);
        const max = Number(settings.temperature.max);

        if (zone.actuators.fan) {
            if (zone.temperature < max - hyst) {
                this._set(zone, "fan", false, source, `Fan OFF: temperature ${zone.temperature}°C`);
                actions.push("Fan OFF");
            }
        } else {
            if (zone.temperature > max) {
                this._set(zone, "fan", true, source, `Fan ON: temperature ${zone.temperature}°C > ${max}°C`);
                actions.push("Fan ON");
            }
        }

        if (zone.actuators.heater) {
            if (zone.temperature > min + hyst) {
                this._set(zone, "heater", false, source, `Heater OFF: temperature ${zone.temperature}°C`);
                actions.push("Heater OFF");
            }
        } else {
            if (zone.temperature < min) {
                this._set(zone, "heater", true, source, `Heater ON: temperature ${zone.temperature}°C < ${min}°C`);
                actions.push("Heater ON");
            }
        }

        if (zone.actuators.fan && zone.actuators.heater) {
            this._set(zone, "heater", false, source, "Heater OFF: fan is active");
            actions.push("Heater OFF");
        }

        return actions;
    },

    lighting(zone, settings, source) {
        const actions = [];
        const min = Number(settings.light.min);
        const lightHyst = 1500;

        if (zone.actuators.growLight) {
            if (zone.light >= min + lightHyst) {
                this._set(zone, "growLight", false, source, `Grow light OFF: ${zone.light} lx`);
                actions.push("Grow Light OFF");
            }
        } else {
            if (zone.light < min) {
                this._set(zone, "growLight", true, source, `Grow light ON: ${zone.light} lx < ${min} lx`);
                actions.push("Grow Light ON");
            }
        }

        return actions;
    },

    airQuality(zone, settings, source) {
        const actions = [];
        const max = Number(settings.co2.max);
        const co2Hyst = 150;

        if (zone.actuators.vent) {
            if (zone.co2 < max - co2Hyst) {
                this._set(zone, "vent", false, source, `Vent OFF: CO₂ ${zone.co2} ppm`);
                actions.push("Vent OFF");
            }
        } else {
            if (zone.co2 > max) {
                this._set(zone, "vent", true, source, `Vent ON: CO₂ ${zone.co2} ppm > ${max} ppm`);
                actions.push("Vent ON");
            }
        }

        return actions;
    },

    humidityControl(zone, settings, source) {
        const actions = [];
        const hyst = Number(settings.hysteresis || 0);
        const min = Number(settings.humidity.min);
        const max = Number(settings.humidity.max);

        if (zone.actuators.humidifier) {
            if (zone.humidity >= min + hyst || zone.humidity > max) {
                this._set(zone, "humidifier", false, source, `Humidifier OFF: humidity ${zone.humidity}%`);
                actions.push("Humidifier OFF");
            }
        } else {
            if (zone.humidity < min) {
                this._set(zone, "humidifier", true, source, `Humidifier ON: humidity ${zone.humidity}% < ${min}%`);
                actions.push("Humidifier ON");
            }
        }

        return actions;
    },

    checkAlerts(zone, settings) {
        settings = settings || GH.defaultZoneSettings();

        if (zone.soil < settings.soil.min) {
            GH.alerts?.create({
                zoneId: zone.id,
                type: "soilLow",
                severity: "warning",
                message: `Soil moisture ${zone.soil}% is below threshold ${settings.soil.min}%`
            });
        } else {
            GH.alerts?.resolveByType(zone.id, "soilLow");
        }

        if (zone.temperature > settings.temperature.max) {
            GH.alerts?.create({
                zoneId: zone.id,
                type: "tempHigh",
                severity: "warning",
                message: `Temperature ${zone.temperature}°C is above max ${settings.temperature.max}°C`
            });
        } else {
            GH.alerts?.resolveByType(zone.id, "tempHigh");
        }

        if (zone.temperature < settings.temperature.min) {
            GH.alerts?.create({
                zoneId: zone.id,
                type: "tempLow",
                severity: "warning",
                message: `Temperature ${zone.temperature}°C is below min ${settings.temperature.min}°C`
            });
        } else {
            GH.alerts?.resolveByType(zone.id, "tempLow");
        }

        if (zone.light < settings.light.min) {
            GH.alerts?.create({
                zoneId: zone.id,
                type: "lightLow",
                severity: "warning",
                message: `Light ${zone.light} lx is below min ${settings.light.min} lx`
            });
        } else {
            GH.alerts?.resolveByType(zone.id, "lightLow");
        }

        if (zone.co2 > settings.co2.max) {
            GH.alerts?.create({
                zoneId: zone.id,
                type: "co2High",
                severity: "warning",
                message: `CO₂ ${zone.co2} ppm is above max ${settings.co2.max} ppm`
            });
        } else {
            GH.alerts?.resolveByType(zone.id, "co2High");
        }

        if (zone.humidity < settings.humidity.min) {
            GH.alerts?.create({
                zoneId: zone.id,
                type: "humidityLow",
                severity: "warning",
                message: `Humidity ${zone.humidity}% is below min ${settings.humidity.min}%`
            });
        } else {
            GH.alerts?.resolveByType(zone.id, "humidityLow");
        }

        if (zone.humidity > settings.humidity.max) {
            GH.alerts?.create({
                zoneId: zone.id,
                type: "humidityHigh",
                severity: "warning",
                message: `Humidity ${zone.humidity}% is above max ${settings.humidity.max}%`
            });
        } else {
            GH.alerts?.resolveByType(zone.id, "humidityHigh");
        }

        Object.entries(zone.sensorsOnline || {}).forEach(([sensor, online]) => {
            const type = `sensorOffline:${sensor}`;
            if (!online) {
                GH.alerts?.create({
                    zoneId: zone.id,
                    type,
                    severity: "warning",
                    message: `${sensor} sensor is offline`
                });
            } else {
                GH.alerts?.resolveByType(zone.id, type);
            }
        });
    },

    setActuator(zoneId, name, value, source = "manual") {
        const zone = GH.utils.byId(GH.state.zones, zoneId);
        if (!zone) return false;

        const settings = GH.state.settings[zoneId] || GH.defaultZoneSettings();

        if (name === "pump" && value && zone.waterLevel <= settings.waterLevel.critical) {
            GH.alerts?.create({
                zoneId,
                type: "pumpBlocked",
                severity: "critical",
                message: "Manual pump start blocked: low water level"
            });

            GH.events?.add({
                zoneId,
                source: "safety",
                action: "PUMP_BLOCKED",
                message: "Manual pump start blocked due to low water level"
            });

            GH.storage.saveAll();
            GH.ui?.onDataUpdated?.();
            return false;
        }

        if (zone.mode === "auto" && source === "manual") {
            GH.events?.add({
                zoneId,
                source: "ui",
                action: "CONTROL_BLOCKED",
                message: "Manual control is disabled in AUTO mode"
            });

            GH.storage.saveAll();
            GH.ui?.onDataUpdated?.();
            return false;
        }

        const changed = this._set(zone, name, value, source);

        if (changed) {
            GH.storage.saveAll();
            GH.ui?.onDataUpdated?.();
        }

        return changed;
    },

    setMode(zoneId, mode) {
        const zone = GH.utils.byId(GH.state.zones, zoneId);
        if (!zone) return;

        zone.mode = mode === "manual" ? "manual" : "auto";

        GH.events?.add({
            zoneId,
            source: "ui",
            action: mode === "manual" ? "MODE_MANUAL" : "MODE_AUTO",
            message: `${zone.name} switched to ${zone.mode.toUpperCase()} mode`
        });

        if (zone.mode === "auto") {
            this.runZone(zone, GH.state.settings[zoneId], "automation");
        }

        GH.storage.saveAll();
        GH.ui?.onDataUpdated?.();
    },

    refill(zoneId) {
        const zone = GH.utils.byId(GH.state.zones, zoneId);
        if (!zone) return;

        zone.waterLevel = 100;

        GH.alerts?.resolveByType(zoneId, "waterLow");
        GH.alerts?.resolveByType(zoneId, "pumpBlocked");

        GH.events?.add({
            zoneId,
            source: "manual",
            action: "WATER_REFILL",
            message: `Water tank refilled to 100%`
        });

        GH.storage.saveAll();
        GH.ui?.onDataUpdated?.();
    },

    emergencyStop(zoneId) {
        const zone = GH.utils.byId(GH.state.zones, zoneId);
        if (!zone) return;

        zone.mode = "manual";

        Object.keys(zone.actuators).forEach((name) => {
            this._set(zone, name, false, "manual", `Emergency stop: ${GH.actuatorMeta[name]} OFF`);
        });

        GH.events?.add({
            zoneId,
            source: "manual",
            action: "EMERGENCY_STOP",
            message: `${zone.name}: all actuators stopped, mode set to MANUAL`
        });

        GH.storage.saveAll();
        GH.ui?.onDataUpdated?.();
    },

    _set(zone, name, value, source, message) {
        if (!zone || zone.actuators[name] === value) return false;

        zone.actuators[name] = value;

        GH.events?.add({
            zoneId: zone.id,
            source: source || "automation",
            action: `${name.toUpperCase()}_${value ? "ON" : "OFF"}`,
            message: message || `${GH.actuatorMeta[name]} ${value ? "ON" : "OFF"}`
        });

        return true;
    }
};