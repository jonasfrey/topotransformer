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
            // crosshair overlay to show export bounds
            {
                s_tag: 'div',
                class: 'map__crosshair',
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
        };
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

            // fix leaflet sizing after vue mount
            setTimeout(function () { o_map.invalidateSize(); }, 100);
        });
    },
    beforeUnmount: function () {
        if (this._o_map) {
            this._o_map.remove();
            this._o_map = null;
        }
    },
    methods: {
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

        f_image__from_tile: function (n_x, n_y, n_zoom) {
            return new Promise(function (resolve) {
                let o_img = new Image();
                o_img.crossOrigin = 'anonymous';
                o_img.onload = function () { resolve(o_img); };
                o_img.onerror = function () {
                    // return a blank 256x256 canvas (sea level: R=128,G=0,B=0 → 0m)
                    let o_canvas = document.createElement('canvas');
                    o_canvas.width = 256;
                    o_canvas.height = 256;
                    let o_ctx = o_canvas.getContext('2d');
                    o_ctx.fillStyle = '#800000';
                    o_ctx.fillRect(0, 0, 256, 256);
                    resolve(o_canvas);
                };
                o_img.src = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/' + n_zoom + '/' + n_x + '/' + n_y + '.png';
            });
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

            // crop to actual viewport pixel bounds
            let o_pixel__nw = o_visible.o_pixel__nw;
            let o_pixel__se = o_visible.o_pixel__se;
            let n_crop_x = o_pixel__nw.x - n_tile_x__min * 256;
            let n_crop_y = o_pixel__nw.y - n_tile_y__min * 256;
            let n_crop_scl_x = o_pixel__se.x - o_pixel__nw.x;
            let n_crop_scl_y = o_pixel__se.y - o_pixel__nw.y;

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
                a_n__elevation[n_i] = n_elevation;
                if (n_elevation < n_elevation__min) n_elevation__min = n_elevation;
                if (n_elevation > n_elevation__max) n_elevation__max = n_elevation;
            }

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
