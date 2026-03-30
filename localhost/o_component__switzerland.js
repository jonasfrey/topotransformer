// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_o_html_from_o_js } from "./lib/handyhelpers.js";

// WGS84 (lat/lon degrees) → CH1903+ / LV95 (EPSG:2056)
// Official swisstopo approximate formulas
let f_o_lv95__from_wgs84 = function (n_lat, n_lon) {
    // auxiliary values: convert to arc seconds, then to offset units
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

let o_component__switzerland = {
    name: 'component-switzerland',
    template: (await f_o_html_from_o_js({
        s_tag: 'div',
        class: 'map',
        a_o: [
            // leaflet map container
            {
                s_tag: 'div',
                class: 'map__container',
                ref: 'map_container',
            },
            // toolbar
            {
                s_tag: 'div',
                class: 'map__toolbar',
                a_o: [
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_exporting ? ' disabled' : '')",
                        'v-on:click': 'f_export(false)',
                        innerText: "{{ b_exporting ? 'Exporting...' : 'Export' }}",
                    },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_exporting ? ' disabled' : '')",
                        'v-on:click': 'f_export(true)',
                        innerText: "{{ b_exporting ? 'Exporting...' : 'Export & Open in 3D' }}",
                    },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_elevation_overlay ? ' active' : '')",
                        'v-on:click': 'f_toggle_elevation_overlay',
                        innerText: 'Heightmap',
                    },
                    {
                        s_tag: 'div',
                        class: 'map__search',
                        a_o: [
                            {
                                s_tag: 'input',
                                type: 'text',
                                'v-model': 's_search',
                                placeholder: 'Search Swiss location...',
                                class: 'map__search_input',
                                'v-on:keydown.enter': 'f_search',
                            },
                            {
                                s_tag: 'div',
                                ':class': "'bw3d__toolbar_btn interactable' + (b_searching ? ' disabled' : '')",
                                'v-on:click': 'f_search',
                                innerText: '🔍',
                            },
                        ],
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
                        'v-model': 's_preset',
                        'v-on:change': 'f_go_preset',
                        class: 'map__select_ratio',
                        a_o: [
                            { s_tag: 'option', value: '', innerText: '— Swiss Presets —' },
                            { s_tag: 'option', disabled: true, innerText: '── Alps ──' },
                            { s_tag: 'option', value: '46.02,7.75,13,Zermatt / Matterhorn', innerText: 'Zermatt / Matterhorn' },
                            { s_tag: 'option', value: '46.537,7.962,13,Jungfrau Region', innerText: 'Jungfrau Region' },
                            { s_tag: 'option', value: '46.559,8.007,14,Eiger Nordwand', innerText: 'Eiger Nordwand' },
                            { s_tag: 'option', value: '45.937,7.867,14,Monte Rosa', innerText: 'Monte Rosa' },
                            { s_tag: 'option', value: '46.481,9.823,13,Bernina', innerText: 'Piz Bernina' },
                            { s_tag: 'option', value: '46.354,7.628,13,Aletsch Glacier', innerText: 'Aletsch Glacier' },
                            { s_tag: 'option', value: '46.094,7.215,14,Dent Blanche', innerText: 'Dent Blanche' },
                            { s_tag: 'option', disabled: true, innerText: '── Lakes & Valleys ──' },
                            { s_tag: 'option', value: '46.45,6.55,12,Lake Geneva', innerText: 'Lake Geneva' },
                            { s_tag: 'option', value: '46.99,8.45,12,Lake Lucerne', innerText: 'Lake Lucerne' },
                            { s_tag: 'option', value: '46.17,8.78,12,Lake Maggiore', innerText: 'Lake Maggiore (Ticino)' },
                            { s_tag: 'option', value: '46.69,7.87,12,Interlaken', innerText: 'Interlaken' },
                            { s_tag: 'option', value: '46.63,8.38,13,Grimsel Pass', innerText: 'Grimsel Pass' },
                            { s_tag: 'option', disabled: true, innerText: '── Cities ──' },
                            { s_tag: 'option', value: '46.948,7.447,13,Bern', innerText: 'Bern' },
                            { s_tag: 'option', value: '47.375,8.54,13,Zurich', innerText: 'Zurich' },
                            { s_tag: 'option', value: '46.204,6.143,13,Geneva', innerText: 'Geneva' },
                            { s_tag: 'option', value: '46.003,8.952,13,Lugano', innerText: 'Lugano' },
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
            s_search: '',
            b_searching: false,
            s_preset: '',
            s_name__location: '',
            b_elevation_overlay: false,
            _o_layer__elevation: null,
            n_resolution: 256,
        };
    },
    computed: {
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
            // Switzerland bounds
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

            // swisstopo national map color tiles (WMTS)
            L.tileLayer('https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
                attribution: '&copy; <a href="https://www.swisstopo.admin.ch">swisstopo</a>',
                maxZoom: 18,
                bounds: o_bounds__ch,
            }).addTo(o_map);

            self._o_map = o_map;

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
        f_toggle_elevation_overlay: function () {
            let o_self = this;
            o_self.b_elevation_overlay = !o_self.b_elevation_overlay;
            if (!o_self._o_map) return;

            if (o_self.b_elevation_overlay) {
                // swisstopo swissALTI3D relief shading overlay
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

        f_go_preset: function () {
            let o_self = this;
            if (!o_self.s_preset || !o_self._o_map) return;
            let a_s = o_self.s_preset.split(',');
            let n_lat = parseFloat(a_s[0]);
            let n_lon = parseFloat(a_s[1]);
            let n_zoom = parseInt(a_s[2]);
            o_self.s_name__location = a_s.length > 3 ? a_s.slice(3).join(',') : '';
            o_self._o_map.setView([n_lat, n_lon], n_zoom);
            o_self.s_preset = '';
        },

        f_search: async function () {
            let o_self = this;
            if (o_self.b_searching || !o_self.s_search.trim() || !o_self._o_map) return;
            o_self.b_searching = true;
            o_self.s_status = 'Searching...';
            try {
                // use swisstopo search API
                let s_query = encodeURIComponent(o_self.s_search.trim());
                let o_resp = await fetch('https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=' + s_query + '&type=locations&sr=4326&limit=1');
                let o_result = await o_resp.json();
                if (!o_result.results || o_result.results.length === 0) {
                    // fallback to nominatim with Switzerland bias
                    let o_resp2 = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ch&q=' + s_query, {
                        headers: { 'Accept': 'application/json' },
                    });
                    let a_o_result = await o_resp2.json();
                    if (a_o_result.length === 0) {
                        o_self.s_status = 'No results found';
                    } else {
                        let o_r = a_o_result[0];
                        let n_lat = parseFloat(o_r.lat);
                        let n_lon = parseFloat(o_r.lon);
                        o_self._o_map.setView([n_lat, n_lon], 13);
                        o_self.s_status = o_r.display_name;
                        o_self.s_name__location = o_self.s_search.trim();
                    }
                } else {
                    let o_r = o_result.results[0];
                    // swisstopo search returns bbox as [ymin, xmin, ymax, xmax] in attrs
                    if (o_r.attrs && o_r.attrs.geom_st_box2d) {
                        let s_box = o_r.attrs.geom_st_box2d;
                        // format: "BOX(lon_min lat_min,lon_max lat_max)"
                        let s_inner = s_box.replace('BOX(', '').replace(')', '');
                        let a_s_part = s_inner.split(',');
                        let a_n_min = a_s_part[0].trim().split(' ');
                        let a_n_max = a_s_part[1].trim().split(' ');
                        o_self._o_map.fitBounds([
                            [parseFloat(a_n_min[1]), parseFloat(a_n_min[0])],
                            [parseFloat(a_n_max[1]), parseFloat(a_n_max[0])],
                        ]);
                    } else if (o_r.attrs && o_r.attrs.lat && o_r.attrs.lon) {
                        o_self._o_map.setView([o_r.attrs.lat, o_r.attrs.lon], 13);
                    }
                    o_self.s_status = o_r.attrs ? o_r.attrs.label : o_self.s_search.trim();
                    o_self.s_name__location = o_self.s_search.trim();
                }
            } catch (o_err) {
                o_self.s_status = 'Search failed: ' + o_err.message;
            }
            o_self.b_searching = false;
        },

        f_update_viewport_size: function () {
            let el = this.$refs.map_container;
            if (!el) return;
            this.n_scl_x__viewport = el.clientWidth;
            this.n_scl_y__viewport = el.clientHeight;
        },

        f_o_bounds__selection: function () {
            // get the lat/lon bounds of the selection box on the map
            let o_map = this._o_map;
            let o_sel = this.o_selection;
            let el = this.$refs.map_container;
            if (!el || !o_map) return null;

            let o_rect = el.getBoundingClientRect();
            // selection box corners in container pixel coordinates
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
            // convert WGS84 endpoints to LV95 (swisstopo API requires sr=2056)
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

            // extract elevation values — use COMB (combined DTM) or fall back
            let a_n = [];
            for (let n_i = 0; n_i < a_o_point.length; n_i++) {
                let o_p = a_o_point[n_i];
                let n_elev = null;
                if (o_p.alts) {
                    // prefer DTM2 (2m resolution terrain), then COMB, then DTM25
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

            // if API returned fewer points than requested, interpolate to fill
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

            // determine output dimensions based on resolution setting
            let n_scl_x__out, n_scl_y__out;
            if (n_ratio >= 1) {
                n_scl_x__out = this.n_resolution;
                n_scl_y__out = Math.round(this.n_resolution / n_ratio);
            } else {
                n_scl_y__out = this.n_resolution;
                n_scl_x__out = Math.round(this.n_resolution * n_ratio);
            }
            // ensure at least 1px
            n_scl_x__out = Math.max(1, n_scl_x__out);
            n_scl_y__out = Math.max(1, n_scl_y__out);

            this.s_status = 'Fetching elevation for ' + n_scl_x__out + 'x' + n_scl_y__out + ' grid...';

            // build elevation grid row by row using profile API
            let a_a_n__elevation = [];
            let n_sz__batch = 5; // concurrent profile requests

            for (let n_row = 0; n_row < n_scl_y__out; n_row += n_sz__batch) {
                let n_cnt__batch = Math.min(n_sz__batch, n_scl_y__out - n_row);
                let a_o_promise = [];

                for (let n_i = 0; n_i < n_cnt__batch; n_i++) {
                    let n_row__cur = n_row + n_i;
                    // interpolate latitude for this row (north to south)
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

            // flatten and find min/max
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

            console.log('SwissALTI3D elevation min:', n_elevation__min, 'max:', n_elevation__max);

            // normalize to 0-255 grayscale
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

            // compute approximate m/pixel from bounds and output size
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

        f_export: async function (b_open_3d) {
            if (this.b_exporting || !this._o_map) return;
            this.b_exporting = true;
            this.s_status = 'Preparing export...';

            try {
                let o_result = await this.f_s_data_url__from_elevation();

                if (b_open_3d) {
                    globalThis.o_state.s_data_url__map_elevation = o_result.s_data_url;
                    globalThis.o_state.n_m_per_pixel = o_result.n_m_per_pixel;
                    globalThis.o_state.n_m__elevation_min = o_result.n_m__elevation_min;
                    globalThis.o_state.n_m__elevation_max = o_result.n_m__elevation_max;
                    globalThis.o_state.n_scl_x__selection = o_result.n_scl_x__selection;
                    globalThis.o_state.s_name__location = this.s_name__location;
                    this.$router.push('/bw-image-to-3d');
                } else {
                    let o_a = document.createElement('a');
                    o_a.download = 'elevation_ch.png';
                    o_a.href = o_result.s_data_url;
                    o_a.click();
                }
            } catch (o_error) {
                this.s_status = 'Error: ' + o_error.message;
                console.error(o_error);
            }

            this.b_exporting = false;
        },
    },
};

export { o_component__switzerland };
