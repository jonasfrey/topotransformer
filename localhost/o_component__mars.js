// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_o_html_from_o_js } from "./lib/handyhelpers.js";
import { f_generate_and_download_all } from "./stl_pipeline.js";

// Mars CRS: simple equirectangular projection for Leaflet
// Mars tiles use standard web mercator {z}/{x}/{y} scheme
let o_component__mars = {
    name: 'component-mars',
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
                        ':class': "'bw3d__toolbar_btn interactable' + (b_exporting ? ' disabled' : '')",
                        'v-on:click': 'f_export_png',
                        innerText: 'Export PNG',
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
                        'v-model': 's_preset',
                        'v-on:change': 'f_go_preset',
                        class: 'map__select_ratio',
                        a_o: [
                            { s_tag: 'option', value: '', innerText: '— Mars Presets —' },
                            { s_tag: 'option', disabled: true, innerText: '── Volcanoes ──' },
                            { s_tag: 'option', value: '18.65,-133.8,6,Olympus Mons', innerText: 'Olympus Mons' },
                            { s_tag: 'option', value: '1.6,-112.8,6,Arsia Mons', innerText: 'Arsia Mons' },
                            { s_tag: 'option', value: '9.0,-109.5,6,Pavonis Mons', innerText: 'Pavonis Mons' },
                            { s_tag: 'option', value: '18.3,-104.8,6,Ascraeus Mons', innerText: 'Ascraeus Mons' },
                            { s_tag: 'option', value: '25.0,147.2,6,Elysium Mons', innerText: 'Elysium Mons' },
                            { s_tag: 'option', disabled: true, innerText: '── Canyons ──' },
                            { s_tag: 'option', value: '-14.0,-59.2,5,Valles Marineris', innerText: 'Valles Marineris' },
                            { s_tag: 'option', value: '-8.5,-77.5,7,Noctis Labyrinthus', innerText: 'Noctis Labyrinthus' },
                            { s_tag: 'option', value: '-14.5,-45.0,7,Coprates Chasma', innerText: 'Coprates Chasma' },
                            { s_tag: 'option', disabled: true, innerText: '── Craters ──' },
                            { s_tag: 'option', value: '-5.4,137.8,6,Gale Crater (Curiosity)', innerText: 'Gale Crater (Curiosity)' },
                            { s_tag: 'option', value: '18.4,77.5,6,Jezero Crater (Perseverance)', innerText: 'Jezero Crater (Perseverance)' },
                            { s_tag: 'option', value: '-45.9,70.0,5,Hellas Basin', innerText: 'Hellas Basin' },
                            { s_tag: 'option', value: '22.0,-49.0,7,Schiaparelli Crater', innerText: 'Schiaparelli Crater' },
                            { s_tag: 'option', disabled: true, innerText: '── Polar ──' },
                            { s_tag: 'option', value: '85.0,0.0,4,North Polar Cap', innerText: 'North Polar Cap' },
                            { s_tag: 'option', value: '-85.0,0.0,4,South Polar Cap', innerText: 'South Polar Cap' },
                            { s_tag: 'option', disabled: true, innerText: '── Other ──' },
                            { s_tag: 'option', value: '0.0,-30.0,3,Full Hemisphere', innerText: 'Full Hemisphere' },
                            { s_tag: 'option', value: '24.0,33.5,6,Arabia Terra', innerText: 'Arabia Terra' },
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
            {
                s_tag: 'div',
                class: 'map__zoom_info',
                a_o: [
                    {
                        s_tag: 'span',
                        innerText: 'Zoom {{ n_zoom }} — ~{{ n_m_per_pixel }}m/px — MOLA 463m native',
                    },
                    {
                        s_tag: 'span',
                        ':class': "'map__zoom_quality ' + s_quality_class",
                        innerText: '{{ s_quality }}',
                    },
                ],
            },
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
            n_sz__tile: 256,
            n_zoom: 4,
            n_m_per_pixel: 0,
            s_quality: '',
            s_quality_class: '',
            s_ratio: '1:1',
            n_scl_x__viewport: 0,
            n_scl_y__viewport: 0,
            s_preset: '',
            s_name__location: '',
            b_elevation_overlay: false,
            _o_layer__elevation: null,
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
            let o_map = L.map(self.$refs.map_container, {
                center: [0, 0],
                zoom: 3,
                zoomControl: true,
                zoomSnap: 0.25,
                zoomDelta: 0.25,
                wheelPxPerZoomLevel: 120,
                maxZoom: 9,
                minZoom: 2,
            });

            // Mars visual base map: celestia shaded texture
            L.tileLayer('https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/celestia_mars-shaded-16k_global/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openplanetary.org">OpenPlanetary</a> / NASA',
                maxZoom: 9,
                noWrap: true,
            }).addTo(o_map);

            self._o_map = o_map;

            o_map.on('zoomend moveend', function () { self.f_update_zoom_info(); });
            self.f_update_zoom_info();

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
                // MOLA grayscale elevation shaded tiles
                o_self._o_layer__elevation = L.tileLayer(
                    'https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/mola-gray/{z}/{x}/{y}.png',
                    {
                        opacity: 0.7,
                        maxZoom: 9,
                        noWrap: true,
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

        f_update_viewport_size: function () {
            let el = this.$refs.map_container;
            if (!el) return;
            this.n_scl_x__viewport = el.clientWidth;
            this.n_scl_y__viewport = el.clientHeight;
        },

        f_update_zoom_info: function () {
            if (!this._o_map) return;
            let n_zoom = Math.round(this._o_map.getZoom());
            // Mars radius: 3389.5 km, circumference ~21,344 km
            let n_lat = this._o_map.getCenter().lat;
            let n_m_per_pixel = 21344000 * Math.cos(n_lat * Math.PI / 180) / (256 * Math.pow(2, n_zoom));
            this.n_zoom = n_zoom;
            this.n_m_per_pixel = Math.round(n_m_per_pixel);

            // MOLA native resolution is ~463m/pixel
            if (n_m_per_pixel > 500) {
                this.s_quality = 'native MOLA data (~463m)';
                this.s_quality_class = 'quality_native';
            } else if (n_m_per_pixel > 200) {
                this.s_quality = 'near native — slight interpolation';
                this.s_quality_class = 'quality_good';
            } else {
                let n_factor = Math.round(463 / n_m_per_pixel);
                this.s_quality = 'interpolated ~' + n_factor + 'x beyond native 463m';
                this.s_quality_class = 'quality_interpolated';
            }
        },

        f_a_o_tile__visible: function () {
            let o_map = this._o_map;
            let n_zoom = Math.round(o_map.getZoom());
            let o_bounds = o_map.getBounds();
            let o_pixel__nw = o_map.project(o_bounds.getNorthWest(), n_zoom);
            let o_pixel__se = o_map.project(o_bounds.getSouthEast(), n_zoom);

            let n_tile_x__min = Math.floor(o_pixel__nw.x / 256);
            let n_tile_y__min = Math.floor(o_pixel__nw.y / 256);
            let n_tile_x__max = Math.floor(o_pixel__se.x / 256);
            let n_tile_y__max = Math.floor(o_pixel__se.y / 256);

            let n_tile__max = (1 << n_zoom) - 1;
            n_tile_x__min = Math.max(0, n_tile_x__min);
            n_tile_y__min = Math.max(0, n_tile_y__min);
            n_tile_x__max = Math.min(n_tile__max, n_tile_x__max);
            n_tile_y__max = Math.min(n_tile__max, n_tile_y__max);

            let a_o_tile = [];
            for (let n_y = n_tile_y__min; n_y <= n_tile_y__max; n_y++) {
                for (let n_x = n_tile_x__min; n_x <= n_tile_x__max; n_x++) {
                    a_o_tile.push({ n_x, n_y, n_zoom });
                }
            }
            return {
                a_o_tile,
                n_tile_x__min,
                n_tile_y__min,
                n_tile_x__max,
                n_tile_y__max,
                n_zoom,
                o_pixel__nw,
                o_pixel__se,
            };
        },

        f_o_fallback_tile: function () {
            // mid-gray fallback (mean Mars elevation)
            let o_canvas = document.createElement('canvas');
            o_canvas.width = 256;
            o_canvas.height = 256;
            let o_ctx = o_canvas.getContext('2d');
            o_ctx.fillStyle = '#808080';
            o_ctx.fillRect(0, 0, 256, 256);
            return o_canvas;
        },

        f_image__from_tile: async function (n_x, n_y, n_zoom) {
            let self = this;
            // MOLA grayscale elevation tiles (proxied through server to bypass CORS)
            let s_tile_url = 'https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/mola-gray/' + n_zoom + '/' + n_x + '/' + n_y + '.png';
            let s_url = '/api/tile?url=' + encodeURIComponent(s_tile_url);
            try {
                let o_resp = await fetch(s_url);
                if (!o_resp.ok) return self.f_o_fallback_tile();
                let o_blob = await o_resp.blob();
                let s_blob_url = URL.createObjectURL(o_blob);
                let o_img = await new Promise(function (resolve, reject) {
                    let o = new Image();
                    o.onload = function () { resolve(o); };
                    o.onerror = function () { reject(); };
                    o.src = s_blob_url;
                });
                URL.revokeObjectURL(s_blob_url);
                let o_canvas = document.createElement('canvas');
                o_canvas.width = 256;
                o_canvas.height = 256;
                let o_ctx = o_canvas.getContext('2d');
                o_ctx.drawImage(o_img, 0, 0);
                return o_canvas;
            } catch (o_err) {
                return self.f_o_fallback_tile();
            }
        },

        f_s_data_url__from_elevation: async function () {
            let o_visible = this.f_a_o_tile__visible();
            let a_o_tile = o_visible.a_o_tile;
            let n_cnt__tile = a_o_tile.length;

            if (n_cnt__tile > 400) {
                throw new Error('Too many tiles (' + n_cnt__tile + '). Zoom in.');
            }

            this.s_status = 'Fetching ' + n_cnt__tile + ' MOLA tile(s)...';

            let n_sz__batch = 16;
            let a_o_result = [];
            for (let n_i = 0; n_i < a_o_tile.length; n_i += n_sz__batch) {
                let a_o_batch = a_o_tile.slice(n_i, n_i + n_sz__batch);
                let a_o_promise = a_o_batch.map(function (o_tile) {
                    return this.f_image__from_tile(o_tile.n_x, o_tile.n_y, o_tile.n_zoom);
                }.bind(this));
                let a_o_img = await Promise.all(a_o_promise);
                for (let n_j = 0; n_j < a_o_batch.length; n_j++) {
                    a_o_result.push({ o_tile: a_o_batch[n_j], o_img: a_o_img[n_j] });
                }
                this.s_status = 'Fetched ' + a_o_result.length + '/' + n_cnt__tile + ' tiles...';
            }

            this.s_status = 'Compositing MOLA elevation data...';

            let n_tile_x__min = o_visible.n_tile_x__min;
            let n_tile_y__min = o_visible.n_tile_y__min;
            let n_tile_x__max = o_visible.n_tile_x__max;
            let n_tile_y__max = o_visible.n_tile_y__max;
            let n_cnt__col = n_tile_x__max - n_tile_x__min + 1;
            let n_cnt__row = n_tile_y__max - n_tile_y__min + 1;
            let n_scl_x__full = n_cnt__col * 256;
            let n_scl_y__full = n_cnt__row * 256;

            let o_canvas__src = document.createElement('canvas');
            o_canvas__src.width = n_scl_x__full;
            o_canvas__src.height = n_scl_y__full;
            let o_ctx__src = o_canvas__src.getContext('2d');

            for (let n_i = 0; n_i < a_o_result.length; n_i++) {
                let o_tile = a_o_result[n_i].o_tile;
                let o_img = a_o_result[n_i].o_img;
                let n_off_x = (o_tile.n_x - n_tile_x__min) * 256;
                let n_off_y = (o_tile.n_y - n_tile_y__min) * 256;
                o_ctx__src.drawImage(o_img, n_off_x, n_off_y);
            }

            // crop to selection box
            let o_pixel__nw = o_visible.o_pixel__nw;
            let o_pixel__se = o_visible.o_pixel__se;
            let n_viewport_px_x = o_pixel__se.x - o_pixel__nw.x;
            let n_viewport_px_y = o_pixel__se.y - o_pixel__nw.y;

            let o_sel = this.o_selection;
            let n_ratio_x = n_viewport_px_x / this.n_scl_x__viewport;
            let n_ratio_y = n_viewport_px_y / this.n_scl_y__viewport;
            let n_crop_x = (o_pixel__nw.x - n_tile_x__min * 256) + o_sel.n_x * n_ratio_x;
            let n_crop_y = (o_pixel__nw.y - n_tile_y__min * 256) + o_sel.n_y * n_ratio_y;
            let n_crop_scl_x = o_sel.n_scl_x * n_ratio_x;
            let n_crop_scl_y = o_sel.n_scl_y * n_ratio_y;

            let o_image_data__src = o_ctx__src.getImageData(
                Math.floor(n_crop_x), Math.floor(n_crop_y),
                Math.floor(n_crop_scl_x), Math.floor(n_crop_scl_y)
            );
            let a_n__pixel = o_image_data__src.data;

            // MOLA grayscale tiles: use the red channel as relative elevation
            // These tiles include hillshading so values are approximate,
            // but they produce recognizable Mars terrain for 3D printing
            let n_cnt__pixel = Math.floor(n_crop_scl_x) * Math.floor(n_crop_scl_y);
            let a_n__elevation = new Float32Array(n_cnt__pixel);
            let n_elevation__min = Infinity;
            let n_elevation__max = -Infinity;

            for (let n_i = 0; n_i < n_cnt__pixel; n_i++) {
                let n_off = n_i * 4;
                // use luminance from RGB to get elevation-like value
                let n_val = a_n__pixel[n_off] * 0.299 + a_n__pixel[n_off + 1] * 0.587 + a_n__pixel[n_off + 2] * 0.114;
                a_n__elevation[n_i] = n_val;
                if (n_val < n_elevation__min) n_elevation__min = n_val;
                if (n_val > n_elevation__max) n_elevation__max = n_val;
            }

            // Mars elevation range: ~-8200m to ~21229m (~29.4km total)
            // Scale grayscale 0-255 to approximate real elevation
            let n_m__mars_range = 29400;
            let n_m__mars_min = -8200;

            // normalize to 0-255 grayscale output
            let n_range = n_elevation__max - n_elevation__min;
            if (n_range === 0) n_range = 1;

            let n_scl_x__out = Math.floor(n_crop_scl_x);
            let n_scl_y__out = Math.floor(n_crop_scl_y);
            let o_canvas__out = document.createElement('canvas');
            o_canvas__out.width = n_scl_x__out;
            o_canvas__out.height = n_scl_y__out;
            let o_ctx__out = o_canvas__out.getContext('2d');
            let o_image_data__out = o_ctx__out.createImageData(n_scl_x__out, n_scl_y__out);
            let a_n__out = o_image_data__out.data;

            for (let n_i = 0; n_i < n_cnt__pixel; n_i++) {
                let n_val = Math.round(((a_n__elevation[n_i] - n_elevation__min) / n_range) * 255);
                let n_off = n_i * 4;
                a_n__out[n_off] = n_val;
                a_n__out[n_off + 1] = n_val;
                a_n__out[n_off + 2] = n_val;
                a_n__out[n_off + 3] = 255;
            }

            o_ctx__out.putImageData(o_image_data__out, 0, 0);

            // approximate elevation in meters from the grayscale range
            let n_elevation__min_m = n_m__mars_min + (n_elevation__min / 255) * n_m__mars_range;
            let n_elevation__max_m = n_m__mars_min + (n_elevation__max / 255) * n_m__mars_range;

            this.s_status = 'Exported ' + n_scl_x__out + 'x' + n_scl_y__out + 'px (~' + Math.round(n_elevation__min_m) + 'm – ~' + Math.round(n_elevation__max_m) + 'm)';

            return {
                s_data_url: o_canvas__out.toDataURL('image/png'),
                n_m_per_pixel: this.n_m_per_pixel,
                n_m__elevation_min: n_elevation__min_m,
                n_m__elevation_max: n_elevation__max_m,
                n_scl_x__selection: n_scl_x__out,
            };
        },

        f_export_png: async function () {
            if (this.b_exporting || !this._o_map) return;
            this.b_exporting = true;
            this.s_status = 'Calculating visible tiles...';
            try {
                let o_result = await this.f_s_data_url__from_elevation();
                let o_a = document.createElement('a');
                o_a.download = 'mars_elevation.png';
                o_a.href = o_result.s_data_url;
                o_a.click();
            } catch (o_error) {
                this.s_status = 'Error: ' + o_error.message;
                console.error(o_error);
            }
            this.b_exporting = false;
        },

        f_generate_and_download: async function () {
            let o_self = this;
            if (o_self.b_exporting || !o_self._o_map) return;
            o_self.b_exporting = true;
            o_self.s_status = 'Fetching MOLA elevation data...';

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
                    s_name__location: o_self.s_name__location || 'Mars',
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

export { o_component__mars };
