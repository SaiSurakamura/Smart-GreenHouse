GH.analytics = {
    charts: {},

    renderPage() {
        const content = document.getElementById("content");
        if (!content) return;

        Object.values(this.charts).forEach(chart => chart?.destroy?.());
        this.charts = {};

        const f = GH.ui.filters.analytics;

        content.innerHTML = `
      <div class="page-head">
        <div>
          <h1>${GH.i18n.t("analytics")}</h1>
          <p>${GH.i18n.t("recommendations")}</p>
        </div>
        <select data-analytics-zone style="min-width:220px">
          ${GH.ui.zoneOptions(f.zone)}
        </select>
      </div>

      <div class="cards grid-2">
        <div class="card">
          <h3>${GH.i18n.t("chartTemp")}</h3>
          <div class="chart-box"><canvas id="chartTemperature"></canvas></div>
        </div>
        <div class="card">
          <h3>${GH.i18n.t("chartHum")}</h3>
          <div class="chart-box"><canvas id="chartHumidity"></canvas></div>
        </div>
        <div class="card">
          <h3>${GH.i18n.t("chartSoil")}</h3>
          <div class="chart-box"><canvas id="chartSoil"></canvas></div>
        </div>
        <div class="card">
          <h3>${GH.i18n.t("chartRisk")}</h3>
          <div class="chart-box"><canvas id="chartRisk"></canvas></div>
        </div>
      </div>

      <div class="cards grid-2">
        <div class="card">
          <h3>${GH.i18n.t("riskByZone")}</h3>
          <div id="riskCards" class="stack"></div>
        </div>
        <div class="card">
          <h3>${GH.i18n.t("recommendations")}</h3>
          <div id="recommendations" class="stack"></div>
        </div>
      </div>

      <div class="card">
        <h3>${GH.i18n.t("anomalyDetection")}</h3>
        <div id="anomalies" class="stack"></div>
      </div>
    `;

        GH.ui.pageUpdater = () => this.refresh();
        this.refresh();
    },

    refresh() {
        if (!GH.state) return;
        if (!GH.state.history.length) {
            GH.simulator.pushHistory(Date.now());
        }

        this.renderRiskCards();
        this.renderRecommendations();
        this.renderAnomalies();
        this.updateCharts();
    },

    calculateRisk(zone, settings) {
        settings = settings || GH.defaultZoneSettings();
        let score = 0;

        if (zone.temperature > settings.temperature.max) score += 25;
        if (zone.temperature < settings.temperature.min) score += 20;
        if (zone.soil < settings.soil.min) score += 25;

        if (zone.waterLevel <= settings.waterLevel.critical) score += 30;
        else if (zone.waterLevel < settings.waterLevel.critical + 10) score += 10;

        if (zone.co2 > settings.co2.max) score += 15;
        if (zone.humidity < settings.humidity.min || zone.humidity > settings.humidity.max) score += 10;
        if (zone.light < settings.light.min) score += 10;

        if (Object.values(zone.sensorsOnline || {}).some(online => !online)) score += 10;

        return Math.min(100, score);
    },

    getRecommendations(zone, settings) {
        settings = settings || GH.defaultZoneSettings();
        const recs = [];

        if (zone.waterLevel <= settings.waterLevel.critical) {
            recs.push(GH.i18n.t("recEmptyTank"));
        }

        if (zone.soil < settings.soil.min) {
            recs.push(GH.i18n.t("recDrySoil"));
        }

        if (zone.temperature > settings.temperature.max) {
            recs.push(GH.i18n.t("recOverheat"));
        }

        if (zone.temperature < settings.temperature.min) {
            recs.push(GH.i18n.t("recCold"));
        }

        if (zone.light < settings.light.min) {
            recs.push(GH.i18n.t("recLowLight"));
        }

        if (zone.co2 > settings.co2.max) {
            recs.push(GH.i18n.t("recHighCo2"));
        }

        if (zone.humidity < settings.humidity.min) {
            recs.push(GH.i18n.t("recLowHum"));
        }

        if (zone.humidity > settings.humidity.max) {
            recs.push(GH.i18n.t("recHighHum"));
        }

        if (Object.values(zone.sensorsOnline || {}).some(online => !online)) {
            recs.push(GH.i18n.t("recSensorDown"));
        }

        if (!recs.length) {
            recs.push(GH.i18n.t("stableState"));
        }

        return recs;
    },

    detectAnomalies() {
        const history = GH.state.history;
        if (history.length < 2) return [];

        const previous = history[history.length - 2];
        const current = history[history.length - 1];
        const anomalies = [];

        current.zones.forEach(currentZone => {
            const previousZone = previous.zones.find(z => z.id === currentZone.id);
            if (!previousZone) return;

            Object.keys(GH.sensorMeta).forEach(key => {
                const change = GH.utils.percentChange(previousZone[key], currentZone[key]);

                if (change >= 30) {
                    const zone = GH.utils.byId(GH.state.zones, currentZone.id);
                    const meta = GH.sensorMeta[key];
                    anomalies.push({
                        zoneId: currentZone.id,
                        zoneName: zone?.name || currentZone.id,
                        metric: key,
                        label: meta.labelKey ? GH.i18n.t(meta.labelKey) : meta.label,
                        previous: previousZone[key],
                        current: currentZone[key],
                        change: GH.utils.round(change, 1)
                    });
                }
            });
        });

        return anomalies.slice(0, 20);
    },

    renderRiskCards() {
        const target = document.getElementById("riskCards");
        if (!target) return;

        target.innerHTML = GH.state.zones.map(zone => {
            const settings = GH.state.settings[zone.id] || GH.defaultZoneSettings();
            const risk = this.calculateRisk(zone, settings);
            const cls = risk >= 60 ? "critical" : risk >= 30 ? "warning" : "ok";

            return `
        <div class="card" style="padding:12px">
          <div class="between">
            <b>${zone.name}</b>
            <span class="chip ${cls}">${risk}/100</span>
          </div>
          <div class="meter" style="margin-top:10px">
            <div class="meter-fill" style="width:${risk}%; background:${risk >= 60 ? "var(--danger)" : risk >= 30 ? "var(--warning)" : "var(--success)"}"></div>
          </div>
        </div>
      `;
        }).join("");
    },

    renderRecommendations() {
        const target = document.getElementById("recommendations");
        if (!target) return;

        const blocks = GH.state.zones.map(zone => {
            const settings = GH.state.settings[zone.id] || GH.defaultZoneSettings();
            const recs = this.getRecommendations(zone, settings);

            return `
        <div class="card" style="padding:12px">
          <b>${zone.name}</b>
          <ul style="margin:8px 0 0 18px; padding:0; color:var(--text-muted)">
            ${recs.map(rec => `<li>${rec}</li>`).join("")}
          </ul>
        </div>
      `;
        });

        target.innerHTML = blocks.join("") || `<div class="empty">${GH.i18n.t("noDataFound")}</div>`;
    },

    renderAnomalies() {
        const target = document.getElementById("anomalies");
        if (!target) return;

        const anomalies = this.detectAnomalies();

        if (!anomalies.length) {
            target.innerHTML = `<div class="empty">${GH.i18n.t("noAnomalies")}</div>`;
            return;
        }

        target.innerHTML = anomalies.map(item => `
      <div class="event-item warning">
        <div><b>${item.label}</b> — ${GH.i18n.t("anomalyDetected")}</div>
        <div class="small muted">
          ${GH.i18n.t("was")}: ${item.previous} → ${GH.i18n.t("became")}: ${item.current} · ${GH.i18n.t("change")}: ${item.change}%
        </div>
      </div>
    `).join("");
    },

    buildSeries(metric) {
        const history = GH.state.history;
        const zoneId = GH.ui.filters.analytics.zone;
        const meta = GH.sensorMeta[metric];

        const labels = history.map(point => GH.utils.formatTime(point.time));

        const data = history.map(point => {
            if (zoneId === "all") {
                const values = point.zones
                    .map(zone => Number(zone[metric]))
                    .filter(value => isFinite(value));

                if (!values.length) return null;
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                return GH.utils.round(avg, meta.decimals);
            }

            const zone = point.zones.find(z => z.id === zoneId);
            return zone ? GH.utils.round(zone[metric], meta.decimals) : null;
        });

        return { labels, data };
    },

    updateCharts() {
        if (typeof Chart === "undefined") return;

        const colors = {
            temperature: "#f97316",
            humidity: "#38bdf8",
            soil: "#22c55e",
            risk: "#a855f7"
        };

        const lineOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    ticks: { maxTicksLimit: 6, color: "#94a3b8" },
                    grid: { color: "rgba(148,163,184,0.12)" }
                },
                y: {
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(148,163,184,0.12)" }
                }
            }
        };

        ["temperature", "humidity", "soil"].forEach(metric => {
            const canvasId = `chart${metric.charAt(0).toUpperCase()}${metric.slice(1)}`;
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;

            const series = this.buildSeries(metric);
            const color = colors[metric];
            const labelText = GH.sensorMeta[metric].labelKey ? GH.i18n.t(GH.sensorMeta[metric].labelKey) : GH.sensorMeta[metric].label;

            if (!this.charts[metric]) {
                this.charts[metric] = new Chart(canvas, {
                    type: "line",
                    data: {
                        labels: series.labels,
                        datasets: [{
                            label: labelText,
                            data: series.data,
                            borderColor: color,
                            backgroundColor: `${color}22`,
                            tension: 0.35,
                            fill: true,
                            pointRadius: 0
                        }]
                    },
                    options: lineOptions
                });
            } else {
                this.charts[metric].data.labels = series.labels;
                this.charts[metric].data.datasets[0].data = series.data;
                this.charts[metric].data.datasets[0].label = labelText;
                this.charts[metric].update("none");
            }
        });

        const riskCanvas = document.getElementById("chartRisk");
        if (riskCanvas) {
            const labels = GH.state.zones.map(zone => zone.name);
            const data = GH.state.zones.map(zone => {
                const settings = GH.state.settings[zone.id] || GH.defaultZoneSettings();
                return this.calculateRisk(zone, settings);
            });

            const backgroundColor = data.map(value =>
                value >= 60 ? "#ef4444" : value >= 30 ? "#f59e0b" : "#22c55e"
            );

            if (!this.charts.risk) {
                this.charts.risk = new Chart(riskCanvas, {
                    type: "bar",
                    data: {
                        labels,
                        datasets: [{
                            label: GH.i18n.t("riskLabel"),
                            data,
                            backgroundColor,
                            borderRadius: 10
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: {
                                ticks: { color: "#94a3b8" },
                                grid: { display: false }
                            },
                            y: {
                                min: 0,
                                max: 100,
                                ticks: { color: "#94a3b8" },
                                grid: { color: "rgba(148,163,184,0.12)" }
                            }
                        }
                    }
                });
            } else {
                this.charts.risk.data.labels = labels;
                this.charts.risk.data.datasets[0].data = data;
                this.charts.risk.data.datasets[0].backgroundColor = backgroundColor;
                this.charts.risk.data.datasets[0].label = GH.i18n.t("riskLabel");
                this.charts.risk.update("none");
            }
        }
    }
};