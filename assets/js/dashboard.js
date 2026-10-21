GH.ui = {
    currentPage: document.body?.dataset?.page || "",
    pageUpdater: null,
    bound: false,

    filters: {
        sensors: { zone: "all", type: "all", status: "all", search: "" },
        alerts: { tab: "alerts", severity: "all", status: "open", zone: "all", search: "", eventZone: "all", eventSource: "all", eventSearch: "" },
        analytics: { zone: "all" }
    },

    init() {
        const content = document.getElementById("content");
        if (!content) return;

        GH.storage.load();
        this.applyTheme();
        this.renderShell();
        this.bindGlobal();

        if (!GH.state.history.length) {
            GH.simulator.pushHistory(Date.now());
        }

        GH.simulator.start();

        this.currentPage = document.body.dataset.page || "dashboard";
        const route = GH.router[this.currentPage];
        if (typeof route === "function") route();

        this.updateTopbar();
    },

    renderShell() {
        const sidebar = document.getElementById("sidebar");
        const topbar = document.getElementById("topbar");
        const backdrop = document.getElementById("menuBackdrop");

        const navItems = [
            ["dashboard", "📊", GH.i18n.t("dashboard")],
            ["zones", "🌍", GH.i18n.t("zones")],
            ["sensors", "🌡", GH.i18n.t("sensors")],
            ["control", "🎛", GH.i18n.t("control")],
            ["alerts", "🚨", GH.i18n.t("alerts")],
            ["analytics", "📈", GH.i18n.t("analytics")],
            ["settings", "⚙️", GH.i18n.t("settings")]
        ];

        // Сайдбар рендерится один раз при первом вызове
        if (!sidebar.innerHTML.trim()) {
            sidebar.innerHTML = `
        <div class="sidebar-brand">
          <a href="index.html">${GH.i18n.t("appName")}</a>
        </div>
        <nav class="nav">
          ${navItems.map(([page, icon, label]) => `
            <a href="${page}.html" data-nav="${page}" class="${this.currentPage === page ? "active" : ""}">
              <span>${icon}</span>
              <span>${label}</span>
            </a>
          `).join("")}
        </nav>
        <div class="sidebar-footer">
          <button class="btn" data-action="toggleTheme" style="width:100%; margin-bottom:8px;">🌓 ${GH.i18n.t("themeSelect")}</button>
          <button class="btn lang-btn-text" data-action="toggleLang" style="width:100%;">🌐 ${GH.i18n.current === 'ru' ? 'English' : 'Русский'}</button>
        </div>
      `;
        } else {
            // Обновляем активные пункты и тексты без полного перерисовывания
            sidebar.querySelectorAll(".nav a").forEach(link => {
                const page = link.dataset.nav;
                const item = navItems.find(n => n[0] === page);
                if (item) {
                    link.className = this.currentPage === page ? "active" : "";
                    link.innerHTML = `<span>${item[1]}</span><span>${item[2]}</span>`;
                }
            });

            const brandLink = sidebar.querySelector(".sidebar-brand a");
            if (brandLink) brandLink.textContent = GH.i18n.t("appName");

            const themeBtn = sidebar.querySelector('[data-action="toggleTheme"]');
            if (themeBtn) themeBtn.innerHTML = `🌓 ${GH.i18n.t("themeSelect")}`;

            const langBtn = sidebar.querySelector('[data-action="toggleLang"]');
            if (langBtn) langBtn.innerHTML = `🌐 ${GH.i18n.current === 'ru' ? 'English' : 'Русский'}`;
        }

        // Топбар всегда перерисовываем
        topbar.innerHTML = `
      <button class="icon-btn menu-btn" data-action="toggleMenu" aria-label="Меню">☰</button>
      <div>
        <div class="topbar-title" id="pageTitle">${GH.i18n.t("appName")}</div>
        <div class="topbar-sub" id="pageSub">IoT Panel</div>
      </div>
      <div class="topbar-actions">
        <span class="pill ok" id="simStatus" data-action="toggleSimulation" style="cursor:pointer">${GH.i18n.t("simRunning")}</span>
        <a class="icon-btn" href="alerts.html" title="${GH.i18n.t("alerts")}">
          🔔
          <span class="badge-dot hidden" id="alertBadge">0</span>
        </a>
        <button class="icon-btn" data-action="toggleTheme" title="${GH.i18n.t("themeSelect")}">🌓</button>
        <button class="icon-btn lang-btn" data-action="toggleLang" title="${GH.i18n.t("language")}">
          ${GH.i18n.current === 'ru' ? 'EN' : 'RU'}
        </button>
      </div>
    `;

        // Backdrop создаём динамически если его нет
        if (!backdrop) {
            const bd = document.createElement("button");
            bd.id = "menuBackdrop";
            bd.className = "menu-backdrop";
            bd.setAttribute("aria-label", "Закрыть меню");
            document.querySelector(".app").insertBefore(bd, document.querySelector(".main"));
        }
    },

    updateTopbar() {
        const titles = {
            dashboard: [GH.i18n.t("dashboard"), GH.i18n.t("telemetryDesc")],
            zones: [GH.i18n.t("zones"), GH.i18n.t("manageZones")],
            sensors: [GH.i18n.t("sensors"), GH.i18n.t("telemetryDesc")],
            control: [GH.i18n.t("control"), GH.i18n.t("threshConfig")],
            alerts: [GH.i18n.t("alerts"), GH.i18n.t("recentEvents")],
            analytics: [GH.i18n.t("analytics"), GH.i18n.t("recommendations")],
            settings: [GH.i18n.t("settings"), GH.i18n.t("globalParams")]
        };

        const title = titles[this.currentPage] || [GH.i18n.t("appName"), "IoT Panel"];
        const pageTitle = document.getElementById("pageTitle");
        const pageSub = document.getElementById("pageSub");
        const badge = document.getElementById("alertBadge");
        const sim = document.getElementById("simStatus");

        if (pageTitle) pageTitle.textContent = title[0];
        if (pageSub) pageSub.textContent = title[1];

        const activeAlerts = (GH.state.alerts || []).filter(a => a.status !== "resolved").length;
        if (badge) {
            badge.textContent = activeAlerts;
            badge.classList.toggle("hidden", activeAlerts === 0);
        }

        if (sim) {
            const running = !!GH.state.config.running;
            sim.textContent = running ? GH.i18n.t("simRunning") : GH.i18n.t("simPaused");
            sim.className = `pill ${running ? "ok" : "warn"}`;
            sim.title = running ? GH.i18n.t("clickPause") : GH.i18n.t("clickResume");
        }
    },

    applyTheme() {
        const theme = GH.state?.config?.theme || "dark";
        document.documentElement.setAttribute("data-theme", theme);
    },

    toggleTheme() {
        const current = GH.state.config.theme === "light" ? "light" : "dark";
        GH.state.config.theme = current === "dark" ? "light" : "dark";
        this.applyTheme();
        const select = document.querySelector('[data-config="theme"]');
        if (select) select.value = GH.state.config.theme;
        GH.storage.saveAll();
        this.updateTopbar();
    },

    toggleMenu(forceClose = false) {
        const sidebar = document.getElementById("sidebar");
        const backdrop = document.getElementById("menuBackdrop");
        if (!sidebar) return;

        const isOpen = sidebar.classList.contains("open");
        const shouldOpen = forceClose ? false : !isOpen;

        sidebar.classList.toggle("open", shouldOpen);
        backdrop?.classList.toggle("show", shouldOpen);
        document.body.style.overflow = shouldOpen ? "hidden" : "";
    },

    onDataUpdated() {
        this.updateTopbar();
        if (typeof this.pageUpdater === "function") this.pageUpdater();
    },

    bindGlobal() {
        if (this.bound) return;
        this.bound = true;
        document.addEventListener("click", e => this.onClick(e));
        document.addEventListener("change", e => this.onChange(e));
        document.addEventListener("input", e => this.onInput(e));
    },

    onClick(event) {
        const el = event.target.closest("[data-action]");

        // Клик по фону закрывает меню
        if (event.target.id === "menuBackdrop") {
            this.toggleMenu(true);
            return;
        }

        if (!el) return;
        const action = el.dataset.action;

        if (action === "toggleMenu") {
            this.toggleMenu();
            return;
        }

        if (action === "toggleSimulation") {
            GH.state.config.running = !GH.state.config.running;
            GH.storage.saveAll();

            if (GH.state.config.running) {
                GH.simulator.start();
                GH.events.add({
                    zoneId: "", source: "manual", action: "SIM_START",
                    message: GH.i18n.t("msgSimStart")
                });
            } else {
                GH.simulator.stop();
                GH.events.add({
                    zoneId: "", source: "manual", action: "SIM_PAUSE",
                    message: GH.i18n.t("msgSimPause")
                });
            }

            this.updateTopbar();
            return;
        }

        if (action === "toggleLang") {
            GH.i18n.toggle();
            this.renderShell();
            const route = GH.router[this.currentPage];
            if (typeof route === "function") route();
            this.updateTopbar();
            return;
        }

        if (action === "toggleTheme") { this.toggleTheme(); return; }
        if (action === "addZone") {
            const input = document.getElementById("newZoneName");
            const name = (input?.value || "").trim() || GH.i18n.t("addZonePlaceholder");
            this.addZone(name);
            if (input) input.value = "";
            return;
        }
        if (action === "renameZone") {
            const zone = GH.utils.byId(GH.state.zones, el.dataset.zone);
            if (!zone) return;
            const name = prompt(GH.i18n.t("renameBtn") + ":", zone.name);
            if (name !== null && name.trim()) {
                zone.name = name.trim();
                GH.events.add({ zoneId: zone.id, source: "manual", action: "RENAME", message: GH.i18n.t("msgRenamed", { name: zone.name }) });
                GH.storage.saveAll();
                this.onDataUpdated();
            }
            return;
        }
        if (action === "deleteZone") {
            if (GH.state.zones.length <= 3) { alert(GH.i18n.t("minThreeZones")); return; }
            const id = el.dataset.zone;
            const zone = GH.utils.byId(GH.state.zones, id);
            if (!zone || !confirm(GH.i18n.t("confirmDelete", { name: zone.name }))) return;
            GH.state.zones = GH.state.zones.filter(z => z.id !== id);
            delete GH.state.settings[id];
            GH.events.add({ zoneId: id, source: "manual", action: "DELETE_ZONE", message: GH.i18n.t("msgDeleted") });
            GH.storage.saveAll();
            this.onDataUpdated();
            return;
        }
        if (action === "setMode") { GH.automation.setMode(el.dataset.zone, el.dataset.mode); return; }
        if (action === "refillTank") { GH.automation.refill(el.dataset.zone); return; }
        if (action === "emergencyStop") { GH.automation.emergencyStop(el.dataset.zone); return; }
        if (action === "resetData") {
            if (!confirm(GH.i18n.t("confirmReset"))) return;
            GH.storage.reset();
            location.reload();
        }
    },

    onChange(event) {
        if (key === "autoRefill") { GH.state.config.autoRefill = el.checked; }
        const el = event.target;
        if (el.matches('[data-action="setActuator"]')) {
            GH.automation.setActuator(el.dataset.zone, el.dataset.actuator, el.checked, "manual");
            return;
        }
        if (el.matches("[data-config]")) {
            const key = el.dataset.config;
            if (key === "theme") { GH.state.config.theme = el.value; this.applyTheme(); }
            if (key === "running") { GH.state.config.running = el.checked; }
            if (key === "randomFailures") { GH.state.config.randomFailures = el.checked; }
            if (key === "simIntervalMs") { GH.state.config.simIntervalMs = Number(el.value) || 5000; }
            GH.storage.saveAll();
            GH.simulator.restart();
            this.updateTopbar();
            return;
        }
        if (el.matches("[data-setting-zone]")) {
            const zoneId = el.dataset.settingZone;
            const group = el.dataset.settingGroup;
            const field = el.dataset.settingField;
            const value = el.value === "" ? 0 : Number(el.value);
            if (!isFinite(value)) return;
            if (!GH.state.settings[zoneId]) GH.state.settings[zoneId] = GH.defaultZoneSettings();
            if (group === "base") {
                GH.state.settings[zoneId][field] = value;
            } else {
                GH.state.settings[zoneId][group][field] = value;
            }
            const zone = GH.utils.byId(GH.state.zones, zoneId);
            if (zone) GH.automation.runZone(zone, GH.state.settings[zoneId], "settings");
            GH.storage.saveAll();
            return;
        }
        if (el.matches("[data-sensor-filter]")) { this.filters.sensors[el.dataset.sensorFilter] = el.value; this.updateSensors(); return; }
        if (el.matches("[data-alert-filter]")) { this.filters.alerts[el.dataset.alertFilter] = el.value; GH.alerts.refresh(); return; }
        if (el.matches("[data-analytics-zone]")) { this.filters.analytics.zone = el.value; GH.analytics.refresh(); }
    },

    onInput(event) {
        const el = event.target;
        if (el.matches("[data-sensor-search]")) { this.filters.sensors.search = el.value; this.updateSensors(); }
        if (el.matches("[data-alert-search]")) { this.filters.alerts.search = el.value; GH.alerts.refresh(); }
        if (el.matches("[data-event-search]")) { this.filters.alerts.eventSearch = el.value; GH.alerts.refresh(); }
    },

    zoneOptions(selected = "all", includeAll = true) {
        const options = includeAll ? [`<option value="all">${GH.i18n.t("filterAllTypes")}</option>`] : [];
        options.push(...GH.state.zones.map(zone => `<option value="${zone.id}" ${selected === zone.id ? "selected" : ""}>${zone.name}</option>`));
        return options.join("");
    },

    addZone(name) {
        const id = `ZONE-${GH.utils.uid(4)}`;
        const last = GH.state.zones[GH.state.zones.length - 1];
        const zone = GH.createZone(id, name, {
            temperature: last?.temperature ?? 24, humidity: last?.humidity ?? 60, soil: last?.soil ?? 50,
            light: last?.light ?? 15000, co2: last?.co2 ?? 800, waterLevel: 100, mode: "auto"
        });
        GH.state.zones.push(zone);
        GH.state.settings[id] = GH.defaultZoneSettings();
        GH.events.add({ zoneId: id, source: "manual", action: "ADD_ZONE", message: GH.i18n.t("msgAdded", { name }) });
        GH.storage.saveAll();
        this.onDataUpdated();
    },

    // --- РЕНДЕР СТРАНИЦ ---

    renderDashboard() {
        const content = document.getElementById("content");
        content.innerHTML = `<div id="dashboardContent" class="stack"></div>`;
        this.pageUpdater = () => this.updateDashboard();
        this.updateDashboard();
    },

    updateDashboard() {
        const target = document.getElementById("dashboardContent");
        if (!target) return;
        const zones = GH.state.zones;
        const avg = (key) => {
            if (!zones.length) return 0;
            const sum = zones.reduce((acc, z) => acc + Number(z[key] || 0), 0);
            return GH.utils.round(sum / zones.length, GH.sensorMeta[key]?.decimals || 1);
        };
        const activeAlerts = GH.state.alerts.filter(a => a.status !== "resolved").length;
        const totalSensors = zones.length * Object.keys(GH.sensorMeta).length;
        const onlineSensors = zones.reduce((acc, z) => acc + Object.values(z.sensorsOnline || {}).filter(Boolean).length, 0);

        const kpis = `
      <div class="cards">
        ${this.kpiCard(GH.i18n.t("avgTemp"), `${avg("temperature")} °C`, "")}
        ${this.kpiCard(GH.i18n.t("avgHumidity"), `${avg("humidity")} %`, "")}
        ${this.kpiCard(GH.i18n.t("avgSoil"), `${avg("soil")} %`, "")}
        ${this.kpiCard(GH.i18n.t("avgWater"), `${avg("waterLevel")} %`, "")}
        ${this.kpiCard(GH.i18n.t("activeAlerts"), activeAlerts, "")}
        ${this.kpiCard(GH.i18n.t("onlineSensors"), `${onlineSensors}/${totalSensors}`, "")}
      </div>
    `;

        const zoneCards = zones.map(zone => {
            const settings = GH.state.settings[zone.id] || GH.defaultZoneSettings();
            const risk = GH.analytics?.calculateRisk?.(zone, settings) ?? 0;
            const riskClass = risk >= 60 ? "critical" : risk >= 30 ? "warning" : "ok";
            const activeActuators = Object.entries(zone.actuators).filter(([, v]) => v).map(([k]) => {
                const meta = GH.actuatorMeta[k];
                return GH.i18n.current === 'ru' ? meta.labelRu : meta.labelEn;
            });

            return `
        <div class="card">
          <div class="between">
            <div>
              <h3>${zone.name}</h3>
              <div class="small muted">${zone.id} · ${zone.mode.toUpperCase()}</div>
            </div>
            <span class="chip ${riskClass}">${GH.i18n.t("riskLabel")} ${risk}</span>
          </div>
          <div class="zone-sensors">
            <div class="zone-sensor">${GH.i18n.t("chartTemp")}<b>${zone.temperature}°C</b></div>
            <div class="zone-sensor">${GH.i18n.t("chartHum")}<b>${zone.humidity}%</b></div>
            <div class="zone-sensor">${GH.i18n.t("chartSoil")}<b>${zone.soil}%</b></div>
            <div class="zone-sensor">Light<b>${this.formatLight(zone.light)}</b></div>
            <div class="zone-sensor">CO₂<b>${zone.co2}</b></div>
            <div class="zone-sensor">Water<b>${zone.waterLevel}%</b></div>
          </div>
          <div class="meter"><div class="meter-fill" style="width:${risk}%; background:${risk >= 60 ? "var(--danger)" : risk >= 30 ? "var(--warning)" : "var(--success)"}"></div></div>
          <div class="actuator-chips">
            ${activeActuators.length ? activeActuators.map(n => `<span class="chip ok">${n}</span>`).join("") : `<span class="chip offline">${GH.i18n.t("noDevices")}</span>`}
          </div>
          <div class="small muted" style="margin-top:10px">${GH.i18n.t("updated")}: ${GH.utils.formatDateTime(zone.lastUpdate)}</div>
        </div>
      `;
        }).join("");

        const recentAlerts = GH.state.alerts.filter(a => a.status !== "resolved").slice(0, 5).map(alert => `
      <div class="alert-item ${alert.severity}">
        <div class="alert-title">${GH.i18n.t(`alertSeverity${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}`)} · ${GH.i18n.t(`alertType${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`)}</div>
        <div>${alert.message}</div>
        <div class="small muted">${GH.utils.formatDateTime(alert.createdAt)}</div>
      </div>
    `).join("");

        const recentEvents = GH.state.events.slice(0, 8).map(ev => `
      <div class="event-item">
        <div class="mono small">${GH.utils.formatDateTime(ev.timestamp)}</div>
        <div><b>${ev.action}</b> — ${ev.message}</div>
      </div>
    `).join("");

        target.innerHTML = `
      ${kpis}
      <div class="card"><h3>${GH.i18n.t("zoneStatus")}</h3><div class="cards">${zoneCards || '<div class="empty">' + GH.i18n.t("noDataFound") + '</div>'}</div></div>
      <div class="cards grid-2">
        <div class="card"><h3>${GH.i18n.t("recentAlerts")}</h3><div class="stack">${recentAlerts || '<div class="empty">' + GH.i18n.t("noActiveAlerts") + '</div>'}</div></div>
        <div class="card"><h3>${GH.i18n.t("recentEvents")}</h3><div class="stack">${recentEvents || '<div class="empty">' + GH.i18n.t("noEvents") + '</div>'}</div></div>
      </div>
    `;
    },

    kpiCard(iconTitle, value, sub) {
        return `<div class="card"><div class="small muted">${iconTitle}</div><div class="kpi-value">${value}</div><div class="small muted">${sub}</div></div>`;
    },

    formatLight(v) { const n = Number(v) || 0; return n >= 1000 ? `${GH.utils.round(n / 1000, 1)}k lx` : `${n} lx`; },

    renderZones() {
        const content = document.getElementById("content");
        content.innerHTML = `
      <div class="page-head">
        <div><h1>${GH.i18n.t("zones")}</h1><p>${GH.i18n.t("manageZones")}</p></div>
        <div class="inline-form">
          <input id="newZoneName" class="input" placeholder="${GH.i18n.t("addZonePlaceholder")}" />
          <button class="btn primary" data-action="addZone">${GH.i18n.t("addZoneBtn")}</button>
        </div>
      </div>
      <div id="zonesGrid" class="cards"></div>
    `;
        this.pageUpdater = () => this.updateZones();
        this.updateZones();
    },

    updateZones() {
        const grid = document.getElementById("zonesGrid");
        if (!grid) return;
        grid.innerHTML = GH.state.zones.map(zone => {
            const settings = GH.state.settings[zone.id] || GH.defaultZoneSettings();
            const risk = GH.analytics?.calculateRisk?.(zone, settings) ?? 0;
            return `
        <div class="card">
          <div class="between">
            <div><h3>${zone.name}</h3><div class="small muted">${zone.id}</div></div>
            <span class="chip ${zone.mode === "auto" ? "ok" : "warning"}">${zone.mode.toUpperCase()}</span>
          </div>
          <div class="zone-sensors">
            <div class="zone-sensor">${GH.i18n.t("chartTemp")}<b>${zone.temperature}°C</b></div>
            <div class="zone-sensor">${GH.i18n.t("chartSoil")}<b>${zone.soil}%</b></div>
            <div class="zone-sensor">Water<b>${zone.waterLevel}%</b></div>
            <div class="zone-sensor">${GH.i18n.t("riskLabel")}<b>${risk}</b></div>
          </div>
          <div class="small muted" style="margin:10px 0">
            ${GH.i18n.t("thresholdsInfo", { min: settings.temperature.min, max: settings.temperature.max, sMin: settings.soil.min, sMax: settings.soil.max, crit: settings.waterLevel.critical })}
          </div>
          <div class="row">
            <button class="btn small" data-action="renameZone" data-zone="${zone.id}">${GH.i18n.t("renameBtn")}</button>
            <button class="btn small danger" data-action="deleteZone" data-zone="${zone.id}">${GH.i18n.t("deleteBtn")}</button>
          </div>
        </div>
      `;
        }).join("");
    },

    renderSensors() {
        const content = document.getElementById("content");
        const f = this.filters.sensors;
        content.innerHTML = `
      <div class="page-head"><div><h1>${GH.i18n.t("sensors")}</h1><p>${GH.i18n.t("telemetryDesc")}</p></div></div>
      <div class="filters">
        <select data-sensor-filter="zone">${this.zoneOptions(f.zone)}</select>
        <select data-sensor-filter="type">
          <option value="all">${GH.i18n.t("filterAllTypes")}</option>
          ${Object.entries(GH.sensorMeta).map(([k, m]) => `<option value="${k}" ${f.type === k ? "selected" : ""}>${m.labelKey ? GH.i18n.t(m.labelKey) : m.label}</option>`).join("")}
        </select>
        <select data-sensor-filter="status">
          <option value="all" ${f.status === "all" ? "selected" : ""}>${GH.i18n.t("filterAnyStatus")}</option>
          <option value="online" ${f.status === "online" ? "selected" : ""}>${GH.i18n.t("filterOnline")}</option>
          <option value="offline" ${f.status === "offline" ? "selected" : ""}>${GH.i18n.t("filterOffline")}</option>
        </select>
        <input class="input" data-sensor-search value="${f.search}" placeholder="${GH.i18n.t("searchPlaceholder")}" />
      </div>
      <div id="sensorsTable" class="table-wrap"></div>
    `;
        this.pageUpdater = () => this.updateSensors();
        this.updateSensors();
    },

    updateSensors() {
        const target = document.getElementById("sensorsTable");
        if (!target) return;
        const f = this.filters.sensors;
        const rows = [];
        GH.state.zones.forEach(zone => {
            if (f.zone !== "all" && zone.id !== f.zone) return;
            Object.entries(GH.sensorMeta).forEach(([key, meta]) => {
                if (f.type !== "all" && f.type !== key) return;
                const online = !!zone.sensorsOnline[key];
                if (f.status === "online" && !online) return;
                if (f.status === "offline" && online) return;
                const text = `${zone.name} ${meta.labelKey ? GH.i18n.t(meta.labelKey) : meta.label}`.toLowerCase();
                if (f.search && !text.includes(f.search.toLowerCase())) return;
                rows.push(`
          <tr>
            <td>${meta.labelKey ? GH.i18n.t(meta.labelKey) : meta.label}</td>
            <td>${zone.name}</td>
            <td class="mono">${GH.utils.round(zone[key], meta.decimals)} ${meta.unit}</td>
            <td><span class="chip ${online ? "ok" : "offline"}">${online ? GH.i18n.t("statusOnline") : GH.i18n.t("statusOffline")}</span></td>
            <td class="small muted">${GH.utils.formatDateTime(zone.lastUpdate)}</td>
            <td><button class="btn small" onclick="GH.ui.toggleSensor('${zone.id}','${key}')">${online ? GH.i18n.t("actionTurnOff") : GH.i18n.t("actionTurnOn")}</button></td>
          </tr>
        `);
            });
        });
        target.innerHTML = `
      <table>
        <thead><tr><th>${GH.i18n.t("colSensor")}</th><th>${GH.i18n.t("colZone")}</th><th>${GH.i18n.t("colValue")}</th><th>${GH.i18n.t("colStatus")}</th><th>${GH.i18n.t("colTime")}</th><th>${GH.i18n.t("colAction")}</th></tr></thead>
        <tbody>${rows.join("") || `<tr><td colspan="6"><div class="empty">${GH.i18n.t("noDataFound")}</div></td></tr>`}</tbody>
      </table>
    `;
    },

    toggleSensor(zoneId, sensorKey) {
        const zone = GH.utils.byId(GH.state.zones, zoneId);
        if (!zone) return;
        zone.sensorsOnline[sensorKey] = !zone.sensorsOnline[sensorKey];
        GH.storage.saveAll();
        this.onDataUpdated();
    },

    renderControl() {
        const content = document.getElementById("content");
        content.innerHTML = `<div id="controlGrid" class="cards"></div>`;
        this.pageUpdater = () => this.updateControl();
        this.updateControl();
    },

    updateControl() {
        const grid = document.getElementById("controlGrid");
        if (!grid) return;
        grid.innerHTML = GH.state.zones.map(zone => {
            const settings = GH.state.settings[zone.id] || GH.defaultZoneSettings();
            const lowWater = zone.waterLevel <= settings.waterLevel.critical;
            const controls = Object.entries(GH.actuatorMeta).map(([key, meta]) => {
                const checked = !!zone.actuators[key];
                const disabled = zone.mode === "auto" || (key === "pump" && lowWater);
                const label = GH.i18n.current === 'ru' ? meta.labelRu : meta.labelEn;
                return `
          <div class="control-item">
            <div><b>${label}</b><div class="small muted">${checked ? GH.i18n.t("deviceOn") : GH.i18n.t("deviceOff")}</div></div>
            <label class="switch">
              <input type="checkbox" data-action="setActuator" data-zone="${zone.id}" data-actuator="${key}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}/>
              <span class="slider"></span>
            </label>
          </div>
        `;
            }).join("");

            return `
        <div class="card">
          <div class="between">
            <div><h3>${zone.name}</h3><div class="small muted">${zone.id}</div></div>
            <div class="row">
              <button class="btn small ${zone.mode === "auto" ? "primary" : ""}" data-action="setMode" data-zone="${zone.id}" data-mode="auto">${GH.i18n.t("autoMode")}</button>
              <button class="btn small ${zone.mode === "manual" ? "primary" : ""}" data-action="setMode" data-zone="${zone.id}" data-mode="manual">${GH.i18n.t("manualMode")}</button>
            </div>
          </div>
          <div style="margin:12px 0">
            <div class="between small"><span>${GH.i18n.t("waterLevelLabel")}</span><b>${zone.waterLevel}%</b></div>
            <div class="meter"><div class="meter-fill" style="width:${zone.waterLevel}%; background:${lowWater ? "var(--danger)" : "var(--info)"}"></div></div>
          </div>
          ${lowWater ? `<div class="safety-banner">${GH.i18n.t("safetyBlockMsg")}</div>` : ""}
          <div style="margin-top:12px">${controls}</div>
          <div class="row" style="margin-top:14px">
            <button class="btn small" data-action="refillTank" data-zone="${zone.id}">${GH.i18n.t("refillTankBtn")}</button>
            <button class="btn small danger" data-action="emergencyStop" data-zone="${zone.id}">${GH.i18n.t("emergencyStopBtn")}</button>
          </div>
        </div>
      `;
        }).join("");
    },

    renderSettings() {
        const content = document.getElementById("content");
        const config = GH.state.config;

        const zoneSettingsHtml = GH.state.zones.map(zone => {
            const s = GH.state.settings[zone.id] || GH.defaultZoneSettings();
            return `
        <fieldset class="card settings-fieldset">
          <legend>${zone.name} · ${zone.id}</legend>
          <div class="form-grid-large">
            
            <label class="field-big">
              <span>${GH.i18n.t("fieldTempMin")}</span>
              <input type="number" class="input-big" data-setting-zone="${zone.id}" data-setting-group="temperature" data-setting-field="min" value="${s.temperature.min}" />
            </label>
            <label class="field-big">
              <span>${GH.i18n.t("fieldTempMax")}</span>
              <input type="number" class="input-big" data-setting-zone="${zone.id}" data-setting-group="temperature" data-setting-field="max" value="${s.temperature.max}" />
            </label>
            
            <label class="field-big">
              <span>${GH.i18n.t("fieldHumMin")}</span>
              <input type="number" class="input-big" data-setting-zone="${zone.id}" data-setting-group="humidity" data-setting-field="min" value="${s.humidity.min}" />
            </label>
            <label class="field-big">
              <span>${GH.i18n.t("fieldHumMax")}</span>
              <input type="number" class="input-big" data-setting-zone="${zone.id}" data-setting-group="humidity" data-setting-field="max" value="${s.humidity.max}" />
            </label>

            <label class="field-big">
              <span>${GH.i18n.t("fieldSoilMin")}</span>
              <input type="number" class="input-big" data-setting-zone="${zone.id}" data-setting-group="soil" data-setting-field="min" value="${s.soil.min}" />
            </label>
            <label class="field-big">
              <span>${GH.i18n.t("fieldSoilMax")}</span>
              <input type="number" class="input-big" data-setting-zone="${zone.id}" data-setting-group="soil" data-setting-field="max" value="${s.soil.max}" />
            </label>

            <label class="field-big">
              <span>${GH.i18n.t("fieldLightMin")}</span>
              <input type="number" class="input-big" data-setting-zone="${zone.id}" data-setting-group="light" data-setting-field="min" value="${s.light.min}" />
            </label>
            <label class="field-big">
              <span>${GH.i18n.t("fieldCo2Max")}</span>
              <input type="number" class="input-big" data-setting-zone="${zone.id}" data-setting-group="co2" data-setting-field="max" value="${s.co2.max}" />
            </label>

            <label class="field-big">
              <span>${GH.i18n.t("fieldWaterCrit")}</span>
              <input type="number" class="input-big" data-setting-zone="${zone.id}" data-setting-group="waterLevel" data-setting-field="critical" value="${s.waterLevel.critical}" />
            </label>
            <label class="field-big">
              <span>${GH.i18n.t("fieldHysteresis")}</span>
              <input type="number" step="0.1" class="input-big" data-setting-zone="${zone.id}" data-setting-group="base" data-setting-field="hysteresis" value="${s.hysteresis}" />
            </label>

          </div>
        </fieldset>
      `;
        }).join("");

        content.innerHTML = `
      <div class="page-head">
        <div><h1>${GH.i18n.t("settings")}</h1><p>${GH.i18n.t("threshConfig")}</p></div>
      </div>

      <div class="card global-settings-card">
        <h3>${GH.i18n.t("globalParams")}</h3>
        <div class="form-grid-large">
          <label class="field-big">
            <span>${GH.i18n.t("themeSelect")}</span>
            <select class="input-big" data-config="theme">
              <option value="dark" ${config.theme === "dark" ? "selected" : ""}>${GH.i18n.t("themeOptDark")}</option>
              <option value="light" ${config.theme === "light" ? "selected" : ""}>${GH.i18n.t("themeOptLight")}</option>
            </select>
          </label>
          
          <label class="field-big">
            <span>${GH.i18n.t("simSpeed")}</span>
            <select class="input-big" data-config="simIntervalMs">
              <option value="3000" ${config.simIntervalMs == 3000 ? "selected" : ""}>${GH.i18n.t("speed3s")}</option>
              <option value="5000" ${config.simIntervalMs == 5000 ? "selected" : ""}>${GH.i18n.t("speed5s")}</option>
              <option value="10000" ${config.simIntervalMs == 10000 ? "selected" : ""}>${GH.i18n.t("speed10s")}</option>
            </select>
          </label>

          <label class="field-big checkbox-field">
            <input type="checkbox" data-config="running" ${config.running ? "checked" : ""} />
            <span>${GH.i18n.t("simActive")}</span>
          </label>

          <label class="field-big checkbox-field">
            <input type="checkbox" data-config="randomFailures" ${config.randomFailures ? "checked" : ""} />
            <span>${GH.i18n.t("randFailures")}</span>
          </label>

          <!-- НОВАЯ ОПЦИЯ: Авто-дозаправка -->
          <label class="field-big checkbox-field">
            <input type="checkbox" data-config="autoRefill" ${config.autoRefill ? "checked" : ""} />
            <span>${GH.i18n.t("autoRefill")}</span>
          </label>
          <div class="small muted" style="grid-column: 1/-1; margin-top:-10px;">
            💡 ${GH.i18n.t("autoRefillHint")}
          </div>
          <!-- --------------------------------->

        </div>
        <div class="row" style="margin-top:20px">
          <button class="btn danger" data-action="resetData">${GH.i18n.t("resetDataBtn")}</button>
        </div>
      </div>

      <div class="stack">
        ${zoneSettingsHtml}
      </div>
    `;
        this.pageUpdater = null;
    }
};

GH.router = {
    dashboard: () => GH.ui.renderDashboard(),
    zones: () => GH.ui.renderZones(),
    sensors: () => GH.ui.renderSensors(),
    control: () => GH.ui.renderControl(),
    settings: () => GH.ui.renderSettings(),
    alerts: () => GH.alerts?.renderPage?.(),
    analytics: () => GH.analytics?.renderPage?.(),
    index: () => { }
};

document.addEventListener("DOMContentLoaded", () => { GH.ui.init(); });