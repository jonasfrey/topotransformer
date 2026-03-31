// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_o_html_from_o_js } from "./lib/handyhelpers.js";
import { f_generate_and_download_all } from "./stl_pipeline.js";

// WGS84 (lat/lon degrees) → CH1903+ / LV95 (EPSG:2056)
let f_o_lv95__from_wgs84 = function (n_lat, n_lon) {
    let n_phi = (n_lat * 3600 - 169028.66) / 10000;
    let n_lambda = (n_lon * 3600 - 26782.5) / 10000;

    let n_easting = 2600072.37
        + 211455.93 * n_lambda
        - 10938.51 * n_lambda * n_phi
        - 0.36 * n_lambda * n_phi * n_phi
        - 44.54 * n_lambda * n_lambda * n_lambda;

    let n_northing = 1200147.07
        + 308807.95 * n_phi
        + 3745.25 * n_lambda * n_lambda
        + 76.63 * n_phi * n_phi
        - 194.56 * n_lambda * n_lambda * n_phi
        + 119.79 * n_phi * n_phi * n_phi;

    return { n_easting, n_northing };
};

// landslide event data from swisstopo rapidmapping
let a_o_event = [
    {
        s_name: 'Bondo 2017 — Rock Avalanche',
        s_description: 'Piz Cengalo rock avalanche, 3M m³ rock fall, debris flows through Val Bondasca',
        s_date: '2017-08-23',
        n_lat: 46.297,
        n_lon: 9.603,
        n_zoom: 14,
        s_type: 'rock_avalanche',
        s_url: 'https://www.rapidmapping.admin.ch/files/en/pastevents.html',
    },
    {
        s_name: 'Bondo 2017 — Village Impact',
        s_description: 'Debris flow impact on Bondo village, 300k+ m³ debris through valley',
        s_date: '2017-08-23',
        n_lat: 46.333,
        n_lon: 9.571,
        n_zoom: 15,
        s_type: 'debris_flow',
        s_url: 'https://www.rapidmapping.admin.ch/files/en/pastevents.html',
    },
    {
        s_name: 'Flooding 2021 — Lake Biel',
        s_description: 'Heavy flooding of Aare catchment, Lakes Biel and Neuchâtel, July 2021',
        s_date: '2021-07-15',
        n_lat: 47.085,
        n_lon: 7.240,
        n_zoom: 13,
        s_type: 'flooding',
        s_url: 'https://www.rapidmapping.admin.ch/files/en/pastevents.html',
    },
    {
        s_name: 'Flooding 2021 — Aare / Wasserschloss',
        s_description: 'Aare discharge to Wasserschloss (Windisch), extreme high water levels',
        s_date: '2021-07-15',
        n_lat: 47.483,
        n_lon: 8.218,
        n_zoom: 13,
        s_type: 'flooding',
        s_url: 'https://www.rapidmapping.admin.ch/files/en/pastevents.html',
    },
    {
        s_name: 'Forest Fire 2022 — Monte Gambarogno',
        s_description: 'Forest fire at Alpe di Neggia above Lake Maggiore, 6 hectares burned',
        s_date: '2022-01-30',
        n_lat: 46.110,
        n_lon: 8.810,
        n_zoom: 14,
        s_type: 'forest_fire',
        s_url: 'https://www.rapidmapping.admin.ch/files/en/pastevents.html',
    },
    {
        s_name: 'Flooding 2024 — Misox (GR)',
        s_description: 'Flooding and mudslides from recurrent precipitation, Misox valley',
        s_date: '2024-06-21',
        n_lat: 46.430,
        n_lon: 9.180,
        n_zoom: 13,
        s_type: 'flooding',
        s_url: 'https://www.rapidmapping.admin.ch/files/en/pastevents.html',
    },
    {
        s_name: 'Flooding 2024 — Valais',
        s_description: 'Flooding across Valais from extreme precipitation June-July 2024',
        s_date: '2024-06-30',
        n_lat: 46.233,
        n_lon: 7.600,
        n_zoom: 12,
        s_type: 'flooding',
        s_url: 'https://www.rapidmapping.admin.ch/files/en/pastevents.html',
    },
    {
        s_name: 'Blatten 2025 — Rockfall Lötschental',
        s_description: 'Major rockfall from Kleines Nesthorn, ~3M m³ rock/debris/ice into Lötschental',
        s_date: '2025-05-28',
        n_lat: 46.420,
        n_lon: 7.820,
        n_zoom: 14,
        s_type: 'rockfall',
        s_url: 'https://www.rapidmapping.admin.ch/files/en/pastevents.html',
    },
];

let o_component__landslide = {
    name: 'component-landslide',
    template: (await f_o_html_from_o_js({
        s_tag: 'div',
        class: 'map',
        a_o: [
            {
                s_tag: 'div',
                class: 'map__container',
                ref: 'map_container',
            },
            {
                s_tag: 'div',
                class: 'map__toolbar',
                a_o: [
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn bw3d__toolbar_btn--primary interactable' + (b_exporting ? ' disabled' : '')",
                        'v-on:click': 'f_generate_and_download',
                        innerText: "{{ b_exporting ? s_status || 'Generating...' : 'Generate & Download' }}",
                    },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_elevation_overlay ? ' active' : '')",
                        'v-on:click': 'f_toggle_elevation_overlay',
                        innerText: 'Heightmap',
                    },
                    {
                        s_tag: 'select',
                        'v-model': 's_ratio',
                        class: 'map__select_ratio',
                        a_o: [
                            { s_tag: 'option', value: 'free', innerText: 'Free' },
                            { s_tag: 'option', value: '1:1', innerText: '1:1' },
                            { s_tag: 'option', value: '4:3', innerText: '4:3' },
                            { s_tag: 'option', value: '3:2', innerText: '3:2' },
                            { s_tag: 'option', value: '16:9', innerText: '16:9' },
                            { s_tag: 'option', value: '21:9', innerText: '21:9' },
                            { s_tag: 'option', value: '3:4', innerText: '3:4 (portrait)' },
                            { s_tag: 'option', value: '2:3', innerText: '2:3 (portrait)' },
                            { s_tag: 'option', value: '9:16', innerText: '9:16 (portrait)' },
                        ],
                    },
                    {
                        s_tag: 'select',
                        'v-model': 'n_idx__event',
                        'v-on:change': 'f_go_event',
                        class: 'map__select_ratio',
                        a_o: [
                            { s_tag: 'option', value: '-1', innerText: '— Select Landslide —' },
                            { s_tag: 'option', disabled: true, innerText: '── Rock Avalanche ──' },
                            { s_tag: 'option', value: '0', innerText: 'Bondo 2017 — Rock Avalanche' },
                            { s_tag: 'option', value: '1', innerText: 'Bondo 2017 — Village Impact' },
                            { s_tag: 'option', disabled: true, innerText: '── Flooding ──' },
                            { s_tag: 'option', value: '2', innerText: 'Flooding 2021 — Lake Biel' },
                            { s_tag: 'option', value: '3', innerText: 'Flooding 2021 — Aare / Wasserschloss' },
                            { s_tag: 'option', value: '5', innerText: 'Flooding 2024 — Misox (GR)' },
                            { s_tag: 'option', value: '6', innerText: 'Flooding 2024 — Valais' },
                            { s_tag: 'option', disabled: true, innerText: '── Forest Fire ──' },
                            { s_tag: 'option', value: '4', innerText: 'Forest Fire 2022 — Monte Gambarogno' },
                            { s_tag: 'option', disabled: true, innerText: '── Rockfall ──' },
                            { s_tag: 'option', value: '7', innerText: 'Blatten 2025 — Rockfall Lötschental' },
                        ],
                    },
                    {
                        s_tag: 'label',
                        class: 'map__resolution_label',
                        innerText: 'Resolution: ',
                        a_o: [
                            {
                                s_tag: 'input',
                                type: 'number',
                                'v-model.number': 'n_resolution',
                                min: '32',
                                max: '1024',
                                step: '32',
                                class: 'map__resolution_input',
                            },
                            {
                                s_tag: 'span',
                                innerText: 'px',
                            },
                        ],
                    },
                    {
                        s_tag: 'div',
                        class: 'map__info',
                        'v-if': 's_status',
                        innerText: '{{ s_status }}',
                    },
                ],
            },
            // event info panel
            {
                s_tag: 'div',
                class: 'landslide__info_panel',
                'v-if': 'o_event__selected',
                a_o: [
                    {
                        s_tag: 'div',
                        class: 'landslide__info_title',
                        innerText: '{{ o_event__selected.s_name }}',
                    },
                    {
                        s_tag: 'div',
                        class: 'landslide__info_description',
                        innerText: '{{ o_event__selected.s_description }}',
                    },
                    {
                        s_tag: 'div',
                        class: 'landslide__info_date',
                        innerText: 'Date: {{ o_event__selected.s_date }}',
                    },
                    {
                        s_tag: 'a',
                        ':href': 'o_event__selected.s_url',
                        target: '_blank',
                        class: 'landslide__info_link interactable',
                        innerText: 'swisstopo rapid mapping data →',
                    },
                ],
            },
            // zoom info bar
            {
                s_tag: 'div',
                class: 'map__zoom_info',
                a_o: [
                    {
                        s_tag: 'span',
                        innerText: 'Zoom {{ n_zoom }} — swisstopo swissALTI3D (0.5m native)',
                    },
                    {
                        s_tag: 'span',
                        class: 'map__zoom_quality quality_native',
                        innerText: 'High-res Swiss elevation data',
                    },
                ],
            },
            // aspect ratio selection overlay
            {
                s_tag: 'div',
                class: 'map__selection_overlay',
                a_o: [
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--top', ':style': 'o_style__dim_top' },
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--bottom', ':style': 'o_style__dim_bottom' },
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--left', ':style': 'o_style__dim_left' },
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--right', ':style': 'o_style__dim_right' },
                    { s_tag: 'div', class: 'map__selection_box', ':style': 'o_style__selection_box', a_o: [
                        { s_tag: 'div', class: 'map__selection_corner map__selection_corner--tl' },
                        { s_tag: 'div', class: 'map__selection_corner map__selection_corner--tr' },
                        { s_tag: 'div', class: 'map__selection_corner map__selection_corner--bl' },
                        { s_tag: 'div', class: 'map__selection_corner map__selection_corner--br' },
                    ]},
                ],
            },
        ],
    })).outerHTML,
    data: function () {
        return {
            _o_map: null,
            b_exporting: false,
            s_status: '',
            n_zoom: 8,
            s_ratio: '1:1',
            n_scl_x__viewport: 0,
            n_scl_y__viewport: 0,
            s_name__location: '',
            b_elevation_overlay: false,
            _o_layer__elevation: null,
            n_resolution: 256,
            n_idx__event: -1,
            _a_o_marker: [],
        };
    },
    computed: {
        o_event__selected: function () {
            let n_idx = parseInt(this.n_idx__event);
            if (n_idx < 0 || n_idx >= a_o_event.length) return null;
            return a_o_event[n_idx];
        },
        n_ratio__aspect: function () {
            if (this.s_ratio === 'free') return 0;
            let a_s = this.s_ratio.split(':');
            return parseFloat(a_s[0]) / parseFloat(a_s[1]);
        },
        o_selection: function () {
            let n_vw = this.n_scl_x__viewport;
            let n_vh = this.n_scl_y__viewport;
            if (n_vw === 0 || n_vh === 0) return { n_x: 0, n_y: 0, n_scl_x: n_vw, n_scl_y: n_vh };
            let n_ratio = this.n_ratio__aspect;
            if (n_ratio === 0) {
                return { n_x: 0, n_y: 0, n_scl_x: n_vw, n_scl_y: n_vh };
            }
            let n_box_w, n_box_h;
            if (n_vw / n_vh > n_ratio) {
                n_box_h = n_vh * 0.85;
                n_box_w = n_box_h * n_ratio;
            } else {
                n_box_w = n_vw * 0.85;
                n_box_h = n_box_w / n_ratio;
            }
            return {
                n_x: Math.round((n_vw - n_box_w) / 2),
                n_y: Math.round((n_vh - n_box_h) / 2),
                n_scl_x: Math.round(n_box_w),
                n_scl_y: Math.round(n_box_h),
            };
        },
        o_style__selection_box: function () {
            let o = this.o_selection;
            return { left: o.n_x + 'px', top: o.n_y + 'px', width: o.n_scl_x + 'px', height: o.n_scl_y + 'px' };
        },
        o_style__dim_top: function () {
            let o = this.o_selection;
            return { left: '0', top: '0', right: '0', height: o.n_y + 'px' };
        },
        o_style__dim_bottom: function () {
            let o = this.o_selection;
            return { left: '0', top: (o.n_y + o.n_scl_y) + 'px', right: '0', bottom: '0' };
        },
        o_style__dim_left: function () {
            let o = this.o_selection;
            return { left: '0', top: o.n_y + 'px', width: o.n_x + 'px', height: o.n_scl_y + 'px' };
        },
        o_style__dim_right: function () {
            let o = this.o_selection;
            return { left: (o.n_x + o.n_scl_x) + 'px', top: o.n_y + 'px', right: '0', height: o.n_scl_y + 'px' };
        },
    },
    mounted: function () {
        let self = this;
        let f_load_leaflet = function () {
            return new Promise(function (resolve, reject) {
                if (!document.querySelector('link[href*="leaflet"]')) {
                    let o_link = document.createElement('link');
                    o_link.rel = 'stylesheet';
                    o_link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(o_link);
                }
                if (window.L) return resolve();
                let o_script = document.createElement('script');
                o_script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                o_script.onload = function () { resolve(); };
                o_script.onerror = function () { reject(new Error('Failed to load Leaflet')); };
                document.head.appendChild(o_script);
            });
        };

        f_load_leaflet().then(function () {
            let o_bounds__ch = L.latLngBounds(
                L.latLng(45.7, 5.9),
                L.latLng(47.9, 10.6)
            );

            let o_map = L.map(self.$refs.map_container, {
                center: [46.8, 8.2],
                zoom: 8,
                zoomControl: true,
                zoomSnap: 0.25,
                zoomDelta: 0.25,
                wheelPxPerZoomLevel: 120,
                maxBounds: o_bounds__ch.pad(0.1),
                minZoom: 7,
                maxZoom: 18,
            });

            // swisstopo national map color tiles
            L.tileLayer('https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch">swisstopo</a>',
                maxZoom: 18,
                bounds: o_bounds__ch,
            }).addTo(o_map);

            self._o_map = o_map;

            // add markers for all landslide events
            let o_icon__red = L.divIcon({
                className: 'landslide__marker',
                html: '<div class="landslide__marker_dot"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            });

            for (let n_i = 0; n_i < a_o_event.length; n_i++) {
                let o_event = a_o_event[n_i];
                let o_marker = L.marker([o_event.n_lat, o_event.n_lon], { icon: o_icon__red })
                    .addTo(o_map)
                    .bindPopup('<b>' + o_event.s_name + '</b><br>' + o_event.s_date + '<br><small>' + o_event.s_description + '</small>');
                self._a_o_marker.push(o_marker);
            }

            o_map.on('zoomend moveend', function () {
                self.n_zoom = Math.round(o_map.getZoom());
            });
            self.n_zoom = Math.round(o_map.getZoom());

            self.f_update_viewport_size();
            self._f_on_resize = function () { self.f_update_viewport_size(); };
            window.addEventListener('resize', self._f_on_resize);

            setTimeout(function () { o_map.invalidateSize(); self.f_update_viewport_size(); }, 100);
        });
    },
    beforeUnmount: function () {
        if (this._f_on_resize) window.removeEventListener('resize', this._f_on_resize);
        if (this._o_layer__elevation && this._o_map) {
            this._o_map.removeLayer(this._o_layer__elevation);
            this._o_layer__elevation = null;
        }
        if (this._o_map) {
            this._o_map.remove();
            this._o_map = null;
        }
    },
    methods: {
        f_go_event: function () {
            let o_self = this;
            let n_idx = parseInt(o_self.n_idx__event);
            if (n_idx < 0 || n_idx >= a_o_event.length || !o_self._o_map) return;
            let o_event = a_o_event[n_idx];
            o_self.s_name__location = o_event.s_name;
            o_self._o_map.setView([o_event.n_lat, o_event.n_lon], o_event.n_zoom);
            // open the marker popup
            if (o_self._a_o_marker[n_idx]) {
                o_self._a_o_marker[n_idx].openPopup();
            }
        },

        f_toggle_elevation_overlay: function () {
            let o_self = this;
            o_self.b_elevation_overlay = !o_self.b_elevation_overlay;
            if (!o_self._o_map) return;

            if (o_self.b_elevation_overlay) {
                o_self._o_layer__elevation = L.tileLayer(
                    'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissalti3d-reliefschattierung/default/current/3857/{z}/{x}/{y}.png',
                    {
                        opacity: 0.6,
                        maxZoom: 18,
                        bounds: L.latLngBounds(L.latLng(45.7, 5.9), L.latLng(47.9, 10.6)),
                    }
                );
                o_self._o_layer__elevation.addTo(o_self._o_map);
            } else {
                if (o_self._o_layer__elevation) {
                    o_self._o_map.removeLayer(o_self._o_layer__elevation);
                    o_self._o_layer__elevation = null;
                }
            }
        },

        f_update_viewport_size: function () {
            let el = this.$refs.map_container;
            if (!el) return;
            this.n_scl_x__viewport = el.clientWidth;
            this.n_scl_y__viewport = el.clientHeight;
        },

        f_o_bounds__selection: function () {
            let o_map = this._o_map;
            let o_sel = this.o_selection;
            let el = this.$refs.map_container;
            if (!el || !o_map) return null;

            let o_point__nw = L.point(o_sel.n_x, o_sel.n_y);
            let o_point__se = L.point(o_sel.n_x + o_sel.n_scl_x, o_sel.n_y + o_sel.n_scl_y);

            let o_latlng__nw = o_map.containerPointToLatLng(o_point__nw);
            let o_latlng__se = o_map.containerPointToLatLng(o_point__se);

            return {
                n_lat__north: o_latlng__nw.lat,
                n_lon__west: o_latlng__nw.lng,
                n_lat__south: o_latlng__se.lat,
                n_lon__east: o_latlng__se.lng,
            };
        },

        f_a_n_elevation__from_profile: async function (n_lon__start, n_lat, n_lon__end, n_cnt__point) {
            let o_lv95__start = f_o_lv95__from_wgs84(n_lat, n_lon__start);
            let o_lv95__end = f_o_lv95__from_wgs84(n_lat, n_lon__end);

            let o_geom = {
                type: 'LineString',
                coordinates: [
                    [o_lv95__start.n_easting, o_lv95__start.n_northing],
                    [o_lv95__end.n_easting, o_lv95__end.n_northing],
                ],
            };
            let s_url = 'https://api3.geo.admin.ch/rest/services/profile.json'
                + '?geom=' + encodeURIComponent(JSON.stringify(o_geom))
                + '&sr=2056'
                + '&nb_points=' + n_cnt__point
                + '&distinct_points=true';

            let o_resp = await fetch(s_url);
            if (!o_resp.ok) {
                throw new Error('Profile API returned ' + o_resp.status);
            }
            let a_o_point = await o_resp.json();

            let a_n = [];
            for (let n_i = 0; n_i < a_o_point.length; n_i++) {
                let o_p = a_o_point[n_i];
                let n_elev = null;
                if (o_p.alts) {
                    if (o_p.alts.DTM2 !== undefined && o_p.alts.DTM2 !== null) {
                        n_elev = o_p.alts.DTM2;
                    } else if (o_p.alts.COMB !== undefined && o_p.alts.COMB !== null) {
                        n_elev = o_p.alts.COMB;
                    } else if (o_p.alts.DTM25 !== undefined && o_p.alts.DTM25 !== null) {
                        n_elev = o_p.alts.DTM25;
                    }
                }
                a_n.push(n_elev !== null ? n_elev : 0);
            }

            if (a_n.length < n_cnt__point) {
                let a_n__padded = new Array(n_cnt__point).fill(0);
                for (let n_i = 0; n_i < a_n.length; n_i++) {
                    a_n__padded[n_i] = a_n[n_i];
                }
                return a_n__padded;
            }
            return a_n.slice(0, n_cnt__point);
        },

        f_s_data_url__from_elevation: async function () {
            let o_bounds = this.f_o_bounds__selection();
            if (!o_bounds) throw new Error('Cannot determine selection bounds');

            let o_sel = this.o_selection;
            let n_ratio = o_sel.n_scl_x / o_sel.n_scl_y;

            let n_scl_x__out, n_scl_y__out;
            if (n_ratio >= 1) {
                n_scl_x__out = this.n_resolution;
                n_scl_y__out = Math.round(this.n_resolution / n_ratio);
            } else {
                n_scl_y__out = this.n_resolution;
                n_scl_x__out = Math.round(this.n_resolution * n_ratio);
            }
            n_scl_x__out = Math.max(1, n_scl_x__out);
            n_scl_y__out = Math.max(1, n_scl_y__out);

            this.s_status = 'Fetching elevation for ' + n_scl_x__out + 'x' + n_scl_y__out + ' grid...';

            let a_a_n__elevation = [];
            let n_sz__batch = 5;

            for (let n_row = 0; n_row < n_scl_y__out; n_row += n_sz__batch) {
                let n_cnt__batch = Math.min(n_sz__batch, n_scl_y__out - n_row);
                let a_o_promise = [];

                for (let n_i = 0; n_i < n_cnt__batch; n_i++) {
                    let n_row__cur = n_row + n_i;
                    let n_t = n_row__cur / (n_scl_y__out - 1 || 1);
                    let n_lat = o_bounds.n_lat__north + n_t * (o_bounds.n_lat__south - o_bounds.n_lat__north);

                    a_o_promise.push(
                        this.f_a_n_elevation__from_profile(
                            o_bounds.n_lon__west,
                            n_lat,
                            o_bounds.n_lon__east,
                            n_scl_x__out
                        )
                    );
                }

                let a_a_n__result = await Promise.all(a_o_promise);
                for (let n_i = 0; n_i < a_a_n__result.length; n_i++) {
                    a_a_n__elevation.push(a_a_n__result[n_i]);
                }

                this.s_status = 'Fetched row ' + Math.min(n_row + n_cnt__batch, n_scl_y__out) + '/' + n_scl_y__out + '...';
            }

            this.s_status = 'Processing elevation data...';

            let n_elevation__min = Infinity;
            let n_elevation__max = -Infinity;
            let a_n__flat = new Float32Array(n_scl_x__out * n_scl_y__out);

            for (let n_row = 0; n_row < n_scl_y__out; n_row++) {
                let a_n = a_a_n__elevation[n_row];
                for (let n_col = 0; n_col < n_scl_x__out; n_col++) {
                    let n_elev = a_n[n_col];
                    if (n_elev < 0) n_elev = 0;
                    let n_idx = n_row * n_scl_x__out + n_col;
                    a_n__flat[n_idx] = n_elev;
                    if (n_elev < n_elevation__min) n_elevation__min = n_elev;
                    if (n_elev > n_elevation__max) n_elevation__max = n_elev;
                }
            }

            let n_range = n_elevation__max - n_elevation__min;
            if (n_range === 0) n_range = 1;

            let o_canvas = document.createElement('canvas');
            o_canvas.width = n_scl_x__out;
            o_canvas.height = n_scl_y__out;
            let o_ctx = o_canvas.getContext('2d');
            let o_image_data = o_ctx.createImageData(n_scl_x__out, n_scl_y__out);
            let a_n__out = o_image_data.data;

            let n_cnt__pixel = n_scl_x__out * n_scl_y__out;
            for (let n_i = 0; n_i < n_cnt__pixel; n_i++) {
                let n_val = Math.round(((a_n__flat[n_i] - n_elevation__min) / n_range) * 255);
                let n_off = n_i * 4;
                a_n__out[n_off] = n_val;
                a_n__out[n_off + 1] = n_val;
                a_n__out[n_off + 2] = n_val;
                a_n__out[n_off + 3] = 255;
            }

            o_ctx.putImageData(o_image_data, 0, 0);

            let n_lat__center = (o_bounds.n_lat__north + o_bounds.n_lat__south) / 2;
            let n_m__lon = (o_bounds.n_lon__east - o_bounds.n_lon__west) * 111320 * Math.cos(n_lat__center * Math.PI / 180);
            let n_m_per_pixel = n_m__lon / n_scl_x__out;

            this.s_status = 'Exported ' + n_scl_x__out + 'x' + n_scl_y__out + 'px (' + Math.round(n_elevation__min) + 'm – ' + Math.round(n_elevation__max) + 'm)';

            return {
                s_data_url: o_canvas.toDataURL('image/png'),
                n_m_per_pixel: n_m_per_pixel,
                n_m__elevation_min: n_elevation__min,
                n_m__elevation_max: n_elevation__max,
                n_scl_x__selection: n_scl_x__out,
            };
        },

        f_generate_and_download: async function () {
            let o_self = this;
            if (o_self.b_exporting || !o_self._o_map) return;
            o_self.b_exporting = true;
            o_self.s_status = 'Fetching elevation data...';

            try {
                let o_result = await o_self.f_s_data_url__from_elevation();

                o_self.s_status = 'Processing heightmap...';
                let o_image = new Image();
                let a_n__gray = await new Promise(function (f_resolve) {
                    o_image.onload = function () {
                        let n_w = o_image.width;
                        let n_h = o_image.height;
                        let el_canvas = document.createElement('canvas');
                        el_canvas.width = n_w;
                        el_canvas.height = n_h;
                        let o_ctx = el_canvas.getContext('2d');
                        o_ctx.drawImage(o_image, 0, 0);
                        let o_data = o_ctx.getImageData(0, 0, n_w, n_h);
                        let a_n = new Uint8Array(n_w * n_h);
                        for (let n_i = 0; n_i < a_n.length; n_i++) {
                            a_n[n_i] = o_data.data[n_i * 4];
                        }
                        f_resolve(a_n);
                    };
                    o_image.src = o_result.s_data_url;
                });

                o_self.s_status = 'Loading 3D engine...';
                let THREE = await import('three');

                let o_config = {
                    n_m_per_pixel: o_result.n_m_per_pixel,
                    n_scl_x__map_selection: o_result.n_scl_x__selection,
                    n_m__elevation_min: o_result.n_m__elevation_min,
                    n_m__elevation_max: o_result.n_m__elevation_max,
                    n_mm__max_width: 240,
                    n_mm__baseplate: 5,
                    b_text__enabled: true,
                    n_mm__text_depth: 0.2,
                    n_mm__hole_diameter: 5,
                    n_mm__hole_margin: 2,
                    s_corner__hole: 'tl',
                    s_name__location: o_self.s_name__location || 'Landslide',
                };

                await f_generate_and_download_all(
                    THREE, o_config,
                    a_n__gray, o_image.width, o_image.height,
                    o_result.s_data_url,
                    function (s_msg) { o_self.s_status = s_msg; }
                );
            } catch (o_error) {
                o_self.s_status = 'Error: ' + o_error.message;
                console.error(o_error);
            }

            o_self.b_exporting = false;
        },
    },
};

export { o_component__landslide };
