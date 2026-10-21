GH.events = {
    add(event) {
        if (!GH.state) return;

        const item = {
            id: GH.utils.uid(8),
            zoneId: event.zoneId || "",
            source: event.source || "system",
            action: event.action || "EVENT",
            message: event.message || "",
            timestamp: event.timestamp || Date.now(),
            ...event
        };

        GH.state.events.unshift(item);

        if (GH.state.events.length > 300) {
            GH.state.events.length = 300;
        }
    }
};

GH.alerts = {
    create({ zoneId, type, severity = "warning", message = "" }) {
        if (!GH.state) return null;

        const active = GH.state.alerts.find(
            (alert) =>
                alert.zoneId === zoneId &&
                alert.type === type &&
                alert.status !== "resolved"
        );

        if (active) {
            active.lastSeen = Date.now();
            active.message = message || active.message;
            if (severity === "critical") active.severity = "critical";
            return active;
        }

        const alert = {
            id: `ALERT-${GH.utils.uid(6)}`,
            zoneId,
            type,
            severity,
            message,
            status: "open",
            createdAt: Date.now(),
            lastSeen: Date.now(),
            acknowledged: false
        };

        GH.state.alerts.unshift(alert);

        if (GH.state.alerts.length > 200) {
            GH.state.alerts.length = 200;
        }

        GH.events.add({
            zoneId,
            source: "alert",
            action: severity.toUpperCase(),
            message: `${type}: ${message}`
        });

        return alert;
    },

    resolveByType(zoneId, type) {
        if (!GH.state) return;

        const active = GH.state.alerts.filter(
            (alert) =>
                alert.zoneId === zoneId &&
                alert.type === type &&
                alert.status !== "resolved"
        );

        active.forEach((alert) => {
            alert.status = "resolved";
            alert.resolvedAt = Date.now();
        });

        if (active.length) {
            GH.events.add({
                zoneId,
                source: "automation",
                action: "ALERT_RESOLVED",
                message: `${type} resolved automatically`
            });
        }
    },

    acknowledge(id) {
        const alert = GH.state.alerts.find((a) => a.id === id);
        if (!alert || alert.status === "resolved") return;

        alert.status = "acknowledged";
        alert.acknowledged = true;
        alert.acknowledgedAt = Date.now();

        GH.events.add({
            zoneId: alert.zoneId,
            source: "manual",
            action: "ALERT_ACK",
            message: `Alert ${alert.id} acknowledged`
        });

        GH.storage.saveAll();
        this.refresh();
        GH.ui?.updateTopbar?.();
    },

    resolve(id) {
        const alert = GH.state.alerts.find((a) => a.id === id);
        if (!alert) return;

        alert.status = "resolved";
        alert.resolvedAt = Date.now();

        GH.events.add({
            zoneId: alert.zoneId,
            source: "manual",
            action: "ALERT_RESOLVED",
            message: `Alert ${alert.id} resolved manually`
        });

        GH.storage.saveAll();
        this.refresh();
        GH.ui?.updateTopbar?.();
    },

    renderPage() {
        const content = document.getElementById("content");
        if (!content) return;

        const f = GH.ui.filters.alerts;

        content.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Alerts & Event Log</h1>
          <p>Активные предупреждения, критические события и журнал действий.</p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab ${f.tab === "alerts" ? "active" : ""}" data-action="alertTab" data-tab="alerts" data-alert-tab="alerts">
          Alerts
        </button>
        <button class="tab ${f.tab === "events" ? "active" : ""}" data-action="alertTab" data-tab="events" data-alert-tab="events">
          Event Log
        </button>
      </div>

      <div id="alertsFilters" class="filters ${f.tab === "alerts" ? "" : "hidden"}">
        <select data-alert-filter="severity">
          <option value="all" ${f.severity === "all" ? "selected" : ""}>All severity</option>
          <option value="warning" ${f.severity === "warning" ? "selected" : ""}>Warning</option>
          <option value="critical" ${f.severity === "critical" ? "selected" : ""}>Critical</option>
        </select>

        <select data-alert-filter="status">
          <option value="open" ${f.status === "open" ? "selected" : ""}>Open</option>
          <option value="acknowledged" ${f.status === "acknowledged" ? "selected" : ""}>Acknowledged</option>
          <option value="resolved" ${f.status === "resolved" ? "selected" : ""}>Resolved</option>
          <option value="all" ${f.status === "all" ? "selected" : ""}>All</option>
        </select>

        <select data-alert-filter="zone">
          ${GH.ui.zoneOptions(f.zone)}
        </select>

        <input class="input" data-alert-search value="${f.search}" placeholder="Search alerts..." />
      </div>

      <div id="eventsFilters" class="filters ${f.tab === "events" ? "" : "hidden"}">
        <select data-alert-filter="eventZone">
          ${GH.ui.zoneOptions(f.eventZone)}
        </select>

        <select data-alert-filter="eventSource">
          <option value="all" ${f.eventSource === "all" ? "selected" : ""}>All sources</option>
          <option value="automation" ${f.eventSource === "automation" ? "selected" : ""}>Automation</option>
          <option value="manual" ${f.eventSource === "manual" ? "selected" : ""}>Manual</option>
          <option value="alert" ${f.eventSource === "alert" ? "selected" : ""}>Alert</option>
          <option value="safety" ${f.eventSource === "safety" ? "selected" : ""}>Safety</option>
          <option value="simulator" ${f.eventSource === "simulator" ? "selected" : ""}>Simulator</option>
          <option value="ui" ${f.eventSource === "ui" ? "selected" : ""}>UI</option>
          <option value="settings" ${f.eventSource === "settings" ? "selected" : ""}>Settings</option>
        </select>

        <input class="input" data-event-search value="${f.eventSearch}" placeholder="Search events..." />
      </div>

      <div id="alertsList" class="stack ${f.tab === "alerts" ? "" : "hidden"}"></div>
      <div id="eventsList" class="stack ${f.tab === "events" ? "" : "hidden"}"></div>
    `;

        GH.ui.pageUpdater = () => this.refresh();
        this.refresh();
    },

    refresh() {
        const f = GH.ui.filters.alerts;

        if (f.tab === "alerts") {
            this.renderAlertsList();
        } else {
            this.renderEventsList();
        }
    },

    renderAlertsList() {
        const target = document.getElementById("alertsList");
        if (!target) return;

        const f = GH.ui.filters.alerts;

        const items = GH.state.alerts
            .filter((alert) => {
                if (f.severity !== "all" && alert.severity !== f.severity) return false;
                if (f.status !== "all" && alert.status !== f.status) return false;
                if (f.zone !== "all" && alert.zoneId !== f.zone) return false;

                if (f.search) {
                    const zone = GH.utils.byId(GH.state.zones, alert.zoneId);
                    const text = `${alert.type} ${alert.message} ${zone?.name || ""} ${alert.zoneId}`.toLowerCase();
                    if (!text.includes(f.search.toLowerCase())) return false;
                }

                return true;
            })
            .map((alert) => {
                const zone = GH.utils.byId(GH.state.zones, alert.zoneId);
                return `
          <div class="alert-item ${alert.severity}">
            <div class="between">
              <div>
                <div class="alert-title">${alert.severity.toUpperCase()} · ${alert.type}</div>
                <div>${alert.message}</div>
                <div class="small muted">
                  Zone: ${zone?.name || alert.zoneId} · Created: ${GH.utils.formatDateTime(alert.createdAt)} · Status: ${alert.status}
                </div>
              </div>
              <div class="row">
                ${alert.status === "open"
                        ? `<button class="btn small" data-action="ackAlert" data-id="${alert.id}">Ack</button>`
                        : ""
                    }
                ${alert.status !== "resolved"
                        ? `<button class="btn small danger" data-action="resolveAlert" data-id="${alert.id}">Resolve</button>`
                        : ""
                    }
              </div>
            </div>
          </div>
        `;
            })
            .join("");

        target.innerHTML = items || `<div class="empty">Alerts не найдены</div>`;
    },

    renderEventsList() {
        const target = document.getElementById("eventsList");
        if (!target) return;

        const f = GH.ui.filters.alerts;

        const items = GH.state.events
            .filter((event) => {
                if (f.eventZone !== "all" && event.zoneId !== f.eventZone) return false;
                if (f.eventSource !== "all" && event.source !== f.eventSource) return false;

                if (f.eventSearch) {
                    const zone = GH.utils.byId(GH.state.zones, event.zoneId);
                    const text = `${event.action} ${event.message} ${zone?.name || ""} ${event.source}`.toLowerCase();
                    if (!text.includes(f.eventSearch.toLowerCase())) return false;
                }

                return true;
            })
            .slice(0, 120)
            .map((event) => {
                const zone = GH.utils.byId(GH.state.zones, event.zoneId);
                return `
          <div class="event-item">
            <div class="between">
              <div>
                <div><b>${event.action}</b> — ${event.message}</div>
                <div class="small muted">
                  ${GH.utils.formatDateTime(event.timestamp)} ·
                  zone: ${zone?.name || event.zoneId || "—"} ·
                  source: ${event.source}
                </div>
              </div>
            </div>
          </div>
        `;
            })
            .join("");

        target.innerHTML = items || `<div class="empty">События не найдены</div>`;
    }
};