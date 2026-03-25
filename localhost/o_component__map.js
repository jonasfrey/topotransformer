// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_o_html_from_o_js } from "./lib/handyhelpers.js";

let o_component__map = {
    name: 'component-map',
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
                        class: 'map__search',
                        a_o: [
                            {
                                s_tag: 'input',
                                type: 'text',
                                'v-model': 's_search',
                                placeholder: 'Search location...',
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
                        innerText: 'Zoom {{ n_zoom }} — ~{{ n_m_per_pixel }}m/px',
                    },
                    {
                        s_tag: 'span',
                        ':class': "'map__zoom_quality ' + s_quality_class",
                        innerText: '{{ s_quality }}',
                    },
                ],
            },
            // aspect ratio selection overlay
            {
                s_tag: 'div',
                class: 'map__selection_overlay',
                a_o: [
                    // dark regions outside the box
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--top', ':style': 'o_style__dim_top' },
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--bottom', ':style': 'o_style__dim_bottom' },
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--left', ':style': 'o_style__dim_left' },
                    { s_tag: 'div', class: 'map__selection_dim map__selection_dim--right', ':style': 'o_style__dim_right' },
                    // selection box border
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
            n_zoom: 7,
            n_m_per_pixel: 1200,
            s_quality: '',
            s_quality_class: '',
            s_ratio: '1:1',
            n_scl_x__viewport: 0,
            n_scl_y__viewport: 0,
            s_search: '',
            b_searching: false,
        };
    },
    computed: {
        // parse aspect ratio into numeric value (width / height), 0 = free
        n_ratio__aspect: function () {
            if (this.s_ratio === 'free') return 0;
            let a_s = this.s_ratio.split(':');
            return parseFloat(a_s[0]) / parseFloat(a_s[1]);
        },
        // selection box pixel dimensions and position (centered in viewport)
        o_selection: function () {
            let n_vw = this.n_scl_x__viewport;
            let n_vh = this.n_scl_y__viewport;
            if (n_vw === 0 || n_vh === 0) return { n_x: 0, n_y: 0, n_scl_x: n_vw, n_scl_y: n_vh };
            let n_ratio = this.n_ratio__aspect;
            if (n_ratio === 0) {
                // free: full viewport
                return { n_x: 0, n_y: 0, n_scl_x: n_vw, n_scl_y: n_vh };
            }
            let n_box_w, n_box_h;
            if (n_vw / n_vh > n_ratio) {
                // viewport is wider than ratio: fit by height
                n_box_h = n_vh * 0.85;
                n_box_w = n_box_h * n_ratio;
            } else {
                // viewport is taller than ratio: fit by width
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
                // css
                if (!document.querySelector('link[href*="leaflet"]')) {
                    let o_link = document.createElement('link');
                    o_link.rel = 'stylesheet';
                    o_link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(o_link);
                }
                // js
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
                center: [47.0, 10.0],
                zoom: 7,
                zoomControl: true,
                zoomSnap: 0.25,
                zoomDelta: 0.25,
                wheelPxPerZoomLevel: 120,
            });

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 15,
            }).addTo(o_map);

            self._o_map = o_map;

            o_map.on('zoomend moveend', function () { self.f_update_zoom_info(); });
            self.f_update_zoom_info();

            // track viewport size for selection box
            self.f_update_viewport_size();
            self._f_on_resize = function () { self.f_update_viewport_size(); };
            window.addEventListener('resize', self._f_on_resize);

            // fix leaflet sizing after vue mount
            setTimeout(function () { o_map.invalidateSize(); self.f_update_viewport_size(); }, 100);
        });
    },
    beforeUnmount: function () {
        if (this._f_on_resize) window.removeEventListener('resize', this._f_on_resize);
        if (this._o_map) {
            this._o_map.remove();
            this._o_map = null;
        }
    },
    methods: {
        f_search: async function () {
            let o_self = this;
            if (o_self.b_searching || !o_self.s_search.trim() || !o_self._o_map) return;
            o_self.b_searching = true;
            o_self.s_status = 'Searching...';
            try {
                let s_query = encodeURIComponent(o_self.s_search.trim());
                let o_resp = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + s_query, {
                    headers: { 'Accept': 'application/json' },
                });
                let a_o_result = await o_resp.json();
                if (a_o_result.length === 0) {
                    o_self.s_status = 'No results found';
                } else {
                    let o_result = a_o_result[0];
                    let n_lat = parseFloat(o_result.lat);
                    let n_lon = parseFloat(o_result.lon);
                    if (o_result.boundingbox) {
                        let a_n = o_result.boundingbox;
                        o_self._o_map.fitBounds([
                            [parseFloat(a_n[0]), parseFloat(a_n[2])],
                            [parseFloat(a_n[1]), parseFloat(a_n[3])],
                        ]);
                    } else {
                        o_self._o_map.setView([n_lat, n_lon], 12);
                    }
                    o_self.s_status = o_result.display_name;
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

        f_update_zoom_info: function () {
            if (!this._o_map) return;
            let n_zoom = Math.round(this._o_map.getZoom());
            // meters per pixel at equator: 40075016.686 / (256 * 2^zoom)
            // approximate for mid-latitudes by using center lat
            let n_lat = this._o_map.getCenter().lat;
            let n_m_per_pixel = 40075016.686 * Math.cos(n_lat * Math.PI / 180) / (256 * Math.pow(2, n_zoom));
            this.n_zoom = n_zoom;
            this.n_m_per_pixel = Math.round(n_m_per_pixel);

            // SRTM native resolution is ~30m, so beyond zoom 12 (~38m/px) data is interpolated
            if (n_m_per_pixel > 90) {
                this.s_quality = 'native SRTM data (~30m)';
                this.s_quality_class = 'quality_native';
            } else if (n_m_per_pixel > 20) {
                this.s_quality = 'near native — slight interpolation';
                this.s_quality_class = 'quality_good';
            } else {
                let n_factor = Math.round(30 / n_m_per_pixel);
                this.s_quality = 'interpolated ~' + n_factor + 'x beyond native 30m';
                this.s_quality_class = 'quality_interpolated';
            }
        },

        f_a_o_tile__visible: function () {
            let o_map = this._o_map;
            // round to integer zoom — tiles only exist at whole zoom levels
            let n_zoom = Math.round(o_map.getZoom());
            let o_bounds = o_map.getBounds();
            let o_pixel__nw = o_map.project(o_bounds.getNorthWest(), n_zoom);
            let o_pixel__se = o_map.project(o_bounds.getSouthEast(), n_zoom);

            let n_tile_x__min = Math.floor(o_pixel__nw.x / 256);
            let n_tile_y__min = Math.floor(o_pixel__nw.y / 256);
            let n_tile_x__max = Math.floor(o_pixel__se.x / 256);
            let n_tile_y__max = Math.floor(o_pixel__se.y / 256);

            // clamp tile coords to valid range for this zoom level
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
            // sea level tile: R=128,G=0,B=0 → 0m in terrarium encoding
            let o_canvas = document.createElement('canvas');
            o_canvas.width = 256;
            o_canvas.height = 256;
            let o_ctx = o_canvas.getContext('2d');
            o_ctx.fillStyle = '#800000';
            o_ctx.fillRect(0, 0, 256, 256);
            return o_canvas;
        },

        f_image__from_tile: async function (n_x, n_y, n_zoom) {
            let self = this;
            let s_url = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/' + n_zoom + '/' + n_x + '/' + n_y + '.png';
            try {
                let o_resp = await fetch(s_url);
                if (!o_resp.ok) return self.f_o_fallback_tile();
                let o_blob = await o_resp.blob();
                // use blob URL + Image to avoid createImageBitmap color space conversion
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

        f_n_elevation__from_rgb: function (n_r, n_g, n_b) {
            // terrarium encoding: height = (R * 256 + G + B / 256) - 32768
            return (n_r * 256 + n_g + n_b / 256) - 32768;
        },

        f_s_data_url__from_elevation: async function () {
            let o_visible = this.f_a_o_tile__visible();
            let a_o_tile = o_visible.a_o_tile;
            let n_cnt__tile = a_o_tile.length;

            if (n_cnt__tile > 400) {
                throw new Error('Too many tiles (' + n_cnt__tile + '). Zoom in.');
            }

            this.s_status = 'Fetching ' + n_cnt__tile + ' elevation tile(s)...';

            // fetch all tiles in parallel (batched to avoid hammering)
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

            this.s_status = 'Compositing elevation data...';

            // composite tiles into a single canvas
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

            // crop to selection box bounds within viewport
            let o_pixel__nw = o_visible.o_pixel__nw;
            let o_pixel__se = o_visible.o_pixel__se;
            let n_viewport_px_x = o_pixel__se.x - o_pixel__nw.x;
            let n_viewport_px_y = o_pixel__se.y - o_pixel__nw.y;

            // map selection box (CSS pixels) to tile pixel coordinates
            let o_sel = this.o_selection;
            let n_ratio_x = n_viewport_px_x / this.n_scl_x__viewport;
            let n_ratio_y = n_viewport_px_y / this.n_scl_y__viewport;
            let n_crop_x = (o_pixel__nw.x - n_tile_x__min * 256) + o_sel.n_x * n_ratio_x;
            let n_crop_y = (o_pixel__nw.y - n_tile_y__min * 256) + o_sel.n_y * n_ratio_y;
            let n_crop_scl_x = o_sel.n_scl_x * n_ratio_x;
            let n_crop_scl_y = o_sel.n_scl_y * n_ratio_y;

            // read RGB data from cropped region
            let o_image_data__src = o_ctx__src.getImageData(
                Math.floor(n_crop_x), Math.floor(n_crop_y),
                Math.floor(n_crop_scl_x), Math.floor(n_crop_scl_y)
            );
            let a_n__pixel = o_image_data__src.data;

            // decode elevations and find min/max
            let n_cnt__pixel = Math.floor(n_crop_scl_x) * Math.floor(n_crop_scl_y);
            let a_n__elevation = new Float32Array(n_cnt__pixel);
            let n_elevation__min = Infinity;
            let n_elevation__max = -Infinity;

            for (let n_i = 0; n_i < n_cnt__pixel; n_i++) {
                let n_off = n_i * 4;
                let n_elevation = this.f_n_elevation__from_rgb(
                    a_n__pixel[n_off],
                    a_n__pixel[n_off + 1],
                    a_n__pixel[n_off + 2]
                );
                // clamp to 0m — discard ocean bathymetry
                if (n_elevation < 0) n_elevation = 0;
                a_n__elevation[n_i] = n_elevation;
                if (n_elevation < n_elevation__min) n_elevation__min = n_elevation;
                if (n_elevation > n_elevation__max) n_elevation__max = n_elevation;
            }

            console.log('Elevation min:', n_elevation__min, 'max:', n_elevation__max, 'pixels:', n_cnt__pixel);

            // normalize to 0-255 grayscale
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

            this.s_status = 'Exported ' + n_scl_x__out + 'x' + n_scl_y__out + 'px (' + Math.round(n_elevation__min) + 'm – ' + Math.round(n_elevation__max) + 'm)';

            return o_canvas__out.toDataURL('image/png');
        },

        f_export: async function (b_open_3d) {
            if (this.b_exporting || !this._o_map) return;
            this.b_exporting = true;
            this.s_status = 'Calculating visible tiles...';

            try {
                let s_data_url = await this.f_s_data_url__from_elevation();

                if (b_open_3d) {
                    // store data URL on global state and navigate to 3d page
                    globalThis.o_state.s_data_url__map_elevation = s_data_url;
                    this.$router.push('/bw-image-to-3d');
                } else {
                    // trigger download
                    let o_a = document.createElement('a');
                    o_a.download = 'elevation.png';
                    o_a.href = s_data_url;
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

export { o_component__map };
