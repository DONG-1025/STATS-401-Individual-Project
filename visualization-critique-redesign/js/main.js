/* ============================================================
   CalCORVID Redesign — Map + Detail Panel
   Data: data/CAtest_combgiscol_fnl.csv
   Boundary: data/county_boundary/CA_county_boundary.geojson
   ============================================================ */

const CONFIG = {
    width: 900,
    height: 700,
    colorScheme: d3.interpolateYlOrRd,
    markerRadius: 3,
    highlightRadius: 5
};

const projection = d3.geoAlbers()
    .center([0, 37.5])
    .rotate([119.5, 0])
    .parallels([38.5, 39.5])
    .scale(1600)
    .translate([CONFIG.width / 2, CONFIG.height / 2 + 30]);

const path = d3.geoPath().projection(projection);

const svg = d3.select("#map")
    .append("svg")
    .attr("viewBox", `0 0 ${CONFIG.width} ${CONFIG.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%")
    .style("cursor", "grab");

const zoomGroup = svg.append("g").attr("class", "zoom-group");
const boundaryLayer = zoomGroup.append("g").attr("class", "boundary-layer");
const labelLayer = zoomGroup.append("g").attr("class", "label-layer");
const markerLayer = zoomGroup.append("g").attr("class", "marker-layer");

const zoom = d3.zoom()
    .scaleExtent([0.8, 8])
    .on("zoom", function(event) {
        zoomGroup.attr("transform", event.transform);
    });

svg.call(zoom);

let selectedId = null;

function seededOffset(id, magnitude) {
    const seed = Math.sin(id * 9999) * 10000;
    return (seed - Math.floor(seed) - 0.5) * magnitude;
}

d3.json("data/county_boundary/CA_county_boundary.geojson").then(function(geo) {

    boundaryLayer.selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#e8eef5")
        .attr("stroke", "#b0b8c4")
        .attr("stroke-width", 0.6);

    loadClusters();

}).catch(function(error) {
    console.error("Error loading GeoJSON:", error);
    d3.select("#map").append("p")
        .style("color", "red")
        .style("padding", "20px")
        .text("Failed to load CA_county_boundary.geojson.");
});

function loadClusters() {
    d3.csv("data/CAtest_combgiscol_fnl.csv").then(function(rawData) {

        const data = rawData.map(d => ({
            id: +d.CLUSTER,
            locId: d.LOC_ID_col,
            lat: +d.LATITUDE + seededOffset(+d.CLUSTER, 0.05),
            lon: +d.LONGITUDE + seededOffset(+d.CLUSTER + 1, 0.05),
            pValue: d.P_VALUE,
            recurrenceInterval: +d.RECURR_INT,
            observed: +d.OBSERVED,
            expected: +d.EXPECTED,
            ode: +d.ODE,
            sviTheme1: +d.MEAN_RPL_THEME1,
            sviTheme2: +d.MEAN_RPL_THEME2,
            sviTheme3: +d.MEAN_RPL_THEME3,
            sviTheme4: +d.MEAN_RPL_THEME4,
            sviOverall: +d.MEAN_RPL_THEMES,
            startDate: d.START_DATE,
            endDate: d.END_DATE
        }));

        const colorScale = d3.scaleSequential()
            .domain([d3.min(data, d => d.recurrenceInterval),
                     d3.max(data, d => d.recurrenceInterval)])
            .interpolator(CONFIG.colorScheme);

        const states = [
            { name: "CALIFORNIA", lon: -119.5, lat: 37.0 },
            { name: "NEVADA",     lon: -116.5, lat: 39.5 },
            { name: "ARIZONA",    lon: -111.7, lat: 34.5 },
            { name: "OREGON",     lon: -120.5, lat: 43.8 },
            { name: "MEXICO",     lon: -115.0, lat: 31.0 },
            { name: "PACIFIC OCEAN", lon: -124.5, lat: 35.0 }
        ];

        const cities = [
            { name: "San Francisco", lon: -122.4194, lat: 37.7749 },
            { name: "Los Angeles",   lon: -118.2437, lat: 34.0522 },
            { name: "San Diego",     lon: -117.1611, lat: 32.7157 },
            { name: "Sacramento",    lon: -121.4944, lat: 38.5816 },
            { name: "Fresno",        lon: -119.7871, lat: 36.7378 },
            { name: "Las Vegas",     lon: -115.1398, lat: 36.1699 },
            { name: "Phoenix",       lon: -112.0740, lat: 33.4484 },
            { name: "Reno",          lon: -119.8138, lat: 39.5296 }
        ];

        labelLayer.selectAll("text.state-label")
            .data(states)
            .enter()
            .append("text")
            .attr("class", "state-label")
            .attr("x", d => projection([d.lon, d.lat])[0])
            .attr("y", d => projection([d.lon, d.lat])[1])
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("font-style", "italic")
            .attr("letter-spacing", "1px")
            .attr("fill", "#888")
            .attr("pointer-events", "none")
            .text(d => d.name);

        labelLayer.selectAll("circle.city-dot")
            .data(cities)
            .enter()
            .append("circle")
            .attr("class", "city-dot")
            .attr("cx", d => projection([d.lon, d.lat])[0])
            .attr("cy", d => projection([d.lon, d.lat])[1])
            .attr("r", 2)
            .attr("fill", "#333")
            .attr("pointer-events", "none");

        labelLayer.selectAll("text.city-label")
            .data(cities)
            .enter()
            .append("text")
            .attr("class", "city-label")
            .attr("x", d => projection([d.lon, d.lat])[0] + 7)
            .attr("y", d => projection([d.lon, d.lat])[1] + 4)
            .attr("font-size", "11px")
            .attr("font-weight", "600")
            .attr("fill", "#333")
            .attr("paint-order", "stroke")
            .attr("stroke", "#fff")
            .attr("stroke-width", 3)
            .attr("pointer-events", "none")
            .text(d => d.name);

        const markers = markerLayer.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => projection([d.lon, d.lat])[0])
            .attr("cy", d => projection([d.lon, d.lat])[1])
            .attr("r", CONFIG.markerRadius)
            .attr("fill", d => colorScale(d.recurrenceInterval))
            .attr("fill-opacity", 0.75)
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.8)
            .style("cursor", "pointer")
            .on("click", function(event, d) {
                selectedId = d.id;
                updateMarkerStyles(markers);
                showDetail(d);
            })
            .on("mouseover", function(event, d) {
                if (d.id !== selectedId) {
                    d3.select(this).attr("stroke-width", 1.8).attr("stroke", "#000");
                }
            })
            .on("mouseout", function(event, d) {
                if (d.id !== selectedId) {
                    d3.select(this).attr("stroke-width", 0.8).attr("stroke", "#fff");
                }
            });

        buildLegend(colorScale, data);

    }).catch(function(error) {
        console.error("Error loading CSV:", error);
        d3.select("#map").append("p")
            .style("color", "red")
            .style("padding", "20px")
            .text("Failed to load data/CAtest_combgiscol_fnl.csv.");
    });
}

function updateMarkerStyles(markers) {
    markers
        .attr("r", d => d.id === selectedId ? CONFIG.highlightRadius : CONFIG.markerRadius)
        .attr("stroke", d => d.id === selectedId ? "#d62728" : "#fff")
        .attr("stroke-width", d => d.id === selectedId ? 1.8 : 0.8);
}

function showDetail(d) {
    d3.select("#detail-placeholder").style("display", "none");
    const panel = d3.select("#detail-content").style("display", "block");

    const sviThemes = [
        { label: "Socioeconomic", value: d.sviTheme1 },
        { label: "Household", value: d.sviTheme2 },
        { label: "Minority", value: d.sviTheme3 },
        { label: "Housing", value: d.sviTheme4 }
    ];

    panel.html(`
        <h3>Cluster ${d.id}</h3>

        <div class="detail-row"><span>Time span</span><span>${d.startDate} → ${d.endDate}</span></div>
        <div class="detail-row"><span>Observed cases</span><span>${d.observed}</span></div>
        <div class="detail-row"><span>Expected cases</span><span>${d.expected.toFixed(1)}</span></div>
        <div class="detail-row"><span>O/E ratio</span><span>${d.ode.toFixed(2)}</span></div>
        <div class="detail-row"><span>p-value</span><span>${d.pValue}</span></div>
        <div class="detail-row"><span>Recurrence interval</span><span>${d.recurrenceInterval}</span></div>

        <div class="detail-bar-section">
            <h4>O/E Ratio</h4>
            ${renderBar("O/E", d.ode, 4)}
        </div>

        <div class="detail-bar-section">
            <h4>SVI Themes (percentile, 0 – 1)</h4>
            ${sviThemes.map(t => renderBar(t.label, t.value, 1)).join("")}
            ${renderBar("Overall", d.sviOverall, 1)}
        </div>
    `);
}

function renderBar(label, value, maxValue) {
    const pct = Math.min((value / maxValue) * 100, 100);
    return `
        <div class="detail-bar">
            <div class="detail-bar-label">${label}</div>
            <div class="detail-bar-track">
                <div class="detail-bar-fill" style="width:${pct}%"></div>
            </div>
            <div class="detail-bar-value">${value.toFixed(2)}</div>
        </div>
    `;
}

function buildLegend(colorScale, data) {
    const legend = d3.select("#legend");
    legend.html("");

    legend.append("div")
        .attr("class", "legend-title")
        .text("Color = Recurrence Interval (statistical significance)");

    const cMin = d3.min(data, d => d.recurrenceInterval);
    const cMax = d3.max(data, d => d.recurrenceInterval);
    const colorItems = [cMin, (cMin + cMax) / 2, cMax];

    colorItems.forEach(val => {
        const item = legend.append("span").attr("class", "legend-item");
        item.append("span")
            .attr("class", "legend-swatch")
            .style("background-color", colorScale(val))
            .style("opacity", 0.9);
        item.append("span").text(val.toFixed(1));
    });

    legend.append("div")
        .attr("class", "legend-title")
        .style("margin-top", "8px")
        .text("Click a cluster on the map to see details.");
}

d3.select("#zoom-in").on("click", function() {
    svg.transition().duration(300).call(zoom.scaleBy, 1.4);
});

d3.select("#zoom-out").on("click", function() {
    svg.transition().duration(300).call(zoom.scaleBy, 0.7);
});

d3.select("#zoom-reset").on("click", function() {
    svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
});