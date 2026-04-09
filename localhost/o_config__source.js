// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

// WGS84 (lat/lon degrees) → CH1903+ / LV95 (EPSG:2056)
// Official swisstopo approximate formulas
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

// ===================== GLOBAL SOURCE =====================

let o_config__global = {
    s_id: 'global',
    s_label: 'Global',
    s_description: 'Earth terrain from SRTM elevation data (~30m resolution)',

    // map
    n_lat__center: 47.0,
    n_lon__center: 10.0,
    n_zoom__default: 7,
    n_zoom__min: 2,
    n_zoom__max: 15,
    s_url__tile: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    s_attribution: '&copy; OpenStreetMap contributors',
    o_bounds: null,
    b_tms: false,

    // elevation
    n_m__circumference: 40075016.686,
    n_m__native_resolution: 30,
    s_label__native: 'SRTM',

    // presets
    a_o_preset: [
        { s_label: '— Presets —', s_value: '', b_disabled: false },
        { s_label: '── Mountain Ranges ──', s_value: '', b_disabled: true },
        { s_label: 'Grand Canyon, AZ', s_value: '36.1,-112.1,10,Grand Canyon' },
        { s_label: 'Dolomites, Italy', s_value: '46.43,11.85,11,Dolomites' },
        { s_label: 'Yosemite Valley', s_value: '37.74,-119.57,11,Yosemite Valley' },
        { s_label: 'Zermatt / Matterhorn', s_value: '46.02,7.75,11,Zermatt' },
        { s_label: 'Mont Blanc massif', s_value: '45.83,6.86,11,Mont Blanc' },
        { s_label: 'Torres del Paine, Chile', s_value: '-51.0,-73.1,10,Torres del Paine' },
        { s_label: '── Volcanic ──', s_value: '', b_disabled: true },
        { s_label: 'Mount Fuji', s_value: '35.36,138.73,11,Mount Fuji' },
        { s_label: 'Mount Kilimanjaro', s_value: '-3.07,37.35,10,Kilimanjaro' },
        { s_label: 'Mount St. Helens', s_value: '46.2,-122.18,11,Mount St. Helens' },
        { s_label: 'Crater Lake, OR', s_value: '42.94,-122.1,11,Crater Lake' },
        { s_label: 'Teide, Tenerife', s_value: '28.27,-16.64,11,Teide' },
        { s_label: '── Fjord / Coastal ──', s_value: '', b_disabled: true },
        { s_label: 'Geirangerfjord, Norway', s_value: '62.1,7.09,10,Geirangerfjord' },
        { s_label: 'Milford Sound, NZ', s_value: '-44.67,167.93,11,Milford Sound' },
        { s_label: 'Lofoten Island, Norway', s_value: '68.2,14.5,9,Lofoten' },
        { s_label: '── Canyon ──', s_value: '', b_disabled: true },
        { s_label: 'Bryce Canyon, UT', s_value: '37.6,-112.17,11,Bryce Canyon' },
        { s_label: 'Fish River Canyon, Namibia', s_value: '-27.6,17.6,10,Fish River Canyon' },
        { s_label: 'Colca Canyon, Peru', s_value: '-15.6,-72.1,10,Colca Canyon' },
    ],

    // extra data fields
    b_has_resolution_input: false,
    b_has_export_png: false,
    b_has_search: true,

    f_update_zoom_info: function (o_comp) {
        if (!o_comp._o_map) return;
        let n_zoom = Math.round(o_comp._o_map.getZoom());
        let n_lat = o_comp._o_map.getCenter().lat;
        let n_m_per_pixel = 40075016.686 * Math.cos(n_lat * Math.PI / 180) / (256 * Math.pow(2, n_zoom));
        o_comp.n_zoom = n_zoom;
        o_comp.n_m_per_pixel = Math.round(n_m_per_pixel);

        let n_scale__map = Math.round(n_m_per_pixel / 0.0002646);
        o_comp.s_scale__map = o_comp.f_s__format_number(o_comp.f_n__nice_round(n_scale__map));

        if (n_m_per_pixel > 90) {
            o_comp.s_quality = 'native SRTM data (~30m)';
            o_comp.s_quality_class = 'quality_native';
        } else if (n_m_per_pixel > 20) {
            o_comp.s_quality = 'near native — slight interpolation';
            o_comp.s_quality_class = 'quality_good';
        } else {
            let n_factor = Math.round(30 / n_m_per_pixel);
            o_comp.s_quality = 'interpolated ~' + n_factor + 'x beyond native 30m';
            o_comp.s_quality_class = 'quality_interpolated';
        }
    },

    s_zoom_label: function (o_comp) {
        return 'Zoom ' + o_comp.n_zoom + ' — ~' + o_comp.n_m_per_pixel + 'm/px — 1:' + o_comp.s_scale__map;
    },

    f_search: async function (o_comp) {
        if (o_comp.b_searching || !o_comp.s_search.trim() || !o_comp._o_map) return;
        o_comp.b_searching = true;
        o_comp.s_status = 'Searching...';
        try {
            let s_query = encodeURIComponent(o_comp.s_search.trim());
            let o_resp = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + s_query, {
                headers: { 'Accept': 'application/json' },
            });
            let a_o_result = await o_resp.json();
            if (a_o_result.length === 0) {
                o_comp.s_status = 'No results found';
            } else {
                let o_result = a_o_result[0];
                let n_lat = parseFloat(o_result.lat);
                let n_lon = parseFloat(o_result.lon);
                if (o_result.boundingbox) {
                    let a_n = o_result.boundingbox;
                    o_comp._o_map.fitBounds([
                        [parseFloat(a_n[0]), parseFloat(a_n[2])],
                        [parseFloat(a_n[1]), parseFloat(a_n[3])],
                    ]);
                } else {
                    o_comp._o_map.setView([n_lat, n_lon], 12);
                }
                o_comp.s_status = o_result.display_name;
                o_comp.s_name__location = o_comp.s_search.trim();
            }
        } catch (o_err) {
            o_comp.s_status = 'Search failed: ' + o_err.message;
        }
        o_comp.b_searching = false;
    },

    f_toggle_elevation_overlay: function (o_comp) {
        o_comp.b_elevation_overlay = !o_comp.b_elevation_overlay;
        if (!o_comp._o_map) return;

        if (o_comp.b_elevation_overlay) {
            let o_layer = L.GridLayer.extend({
                createTile: function (o_coords, f_done) {
                    let el_canvas = document.createElement('canvas');
                    el_canvas.width = 256;
                    el_canvas.height = 256;
                    let n_x = o_coords.x;
                    let n_y = o_coords.y;
                    let n_z = o_coords.z;
                    let n_max_tile = 1 << n_z;
                    n_x = ((n_x % n_max_tile) + n_max_tile) % n_max_tile;
                    let s_url = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/' + n_z + '/' + n_x + '/' + n_y + '.png';
                    fetch(s_url).then(function (o_resp) {
                        if (!o_resp.ok) { f_done(null, el_canvas); return; }
                        return o_resp.blob();
                    }).then(function (o_blob) {
                        if (!o_blob) return;
                        let s_blob_url = URL.createObjectURL(o_blob);
                        let o_img = new Image();
                        o_img.onload = function () {
                            URL.revokeObjectURL(s_blob_url);
                            let o_ctx = el_canvas.getContext('2d');
                            o_ctx.drawImage(o_img, 0, 0);
                            let o_data = o_ctx.getImageData(0, 0, 256, 256);
                            let a_n = o_data.data;
                            let n_cnt = 256 * 256;
                            let a_n__elev = new Float32Array(n_cnt);
                            let n_min = Infinity;
                            let n_max = -Infinity;
                            for (let n_i = 0; n_i < n_cnt; n_i++) {
                                let n_off = n_i * 4;
                                let n_elev = (a_n[n_off] * 256 + a_n[n_off + 1] + a_n[n_off + 2] / 256) - 32768;
                                if (n_elev < 0) n_elev = 0;
                                a_n__elev[n_i] = n_elev;
                                if (n_elev < n_min) n_min = n_elev;
                                if (n_elev > n_max) n_max = n_elev;
                            }
                            let n_range = n_max - n_min;
                            if (n_range < 1) n_range = 1;
                            for (let n_i = 0; n_i < n_cnt; n_i++) {
                                let n_val = Math.round(((a_n__elev[n_i] - n_min) / n_range) * 255);
                                let n_off = n_i * 4;
                                a_n[n_off] = n_val;
                                a_n[n_off + 1] = n_val;
                                a_n[n_off + 2] = n_val;
                                a_n[n_off + 3] = 255;
                            }
                            o_ctx.putImageData(o_data, 0, 0);
                            f_done(null, el_canvas);
                        };
                        o_img.onerror = function () {
                            URL.revokeObjectURL(s_blob_url);
                            f_done(null, el_canvas);
                        };
                        o_img.src = s_blob_url;
                    }).catch(function () {
                        f_done(null, el_canvas);
                    });
                    return el_canvas;
                },
            });
            o_comp._o_layer__elevation = new o_layer({ maxZoom: 15 });
            o_comp._o_layer__elevation.addTo(o_comp._o_map);
        } else {
            if (o_comp._o_layer__elevation) {
                o_comp._o_map.removeLayer(o_comp._o_layer__elevation);
                o_comp._o_layer__elevation = null;
            }
        }
    },

    f_a_o_tile__visible: function (o_comp) {
        let o_map = o_comp._o_map;
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
            n_tile_x__min, n_tile_y__min, n_tile_x__max, n_tile_y__max,
            n_zoom, o_pixel__nw, o_pixel__se,
        };
    },

    f_o_fallback_tile: function () {
        let o_canvas = document.createElement('canvas');
        o_canvas.width = 256;
        o_canvas.height = 256;
        let o_ctx = o_canvas.getContext('2d');
        o_ctx.fillStyle = '#800000';
        o_ctx.fillRect(0, 0, 256, 256);
        return o_canvas;
    },

    f_image__from_tile: async function (n_x, n_y, n_zoom) {
        let s_url = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/' + n_zoom + '/' + n_x + '/' + n_y + '.png';
        try {
            let o_resp = await fetch(s_url);
            if (!o_resp.ok) return o_config__global.f_o_fallback_tile();
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
            return o_config__global.f_o_fallback_tile();
        }
    },

    f_n_elevation__from_rgb: function (n_r, n_g, n_b) {
        return (n_r * 256 + n_g + n_b / 256) - 32768;
    },

    f_s_data_url__from_elevation: async function (o_comp) {
        let o_visible = o_config__global.f_a_o_tile__visible(o_comp);
        let a_o_tile = o_visible.a_o_tile;
        let n_cnt__tile = a_o_tile.length;

        if (n_cnt__tile > 400) {
            throw new Error('Too many tiles (' + n_cnt__tile + '). Zoom in.');
        }

        o_comp.s_status = 'Fetching ' + n_cnt__tile + ' elevation tile(s)...';

        let n_sz__batch = 16;
        let a_o_result = [];
        for (let n_i = 0; n_i < a_o_tile.length; n_i += n_sz__batch) {
            let a_o_batch = a_o_tile.slice(n_i, n_i + n_sz__batch);
            let a_o_promise = a_o_batch.map(function (o_tile) {
                return o_config__global.f_image__from_tile(o_tile.n_x, o_tile.n_y, o_tile.n_zoom);
            });
            let a_o_img = await Promise.all(a_o_promise);
            for (let n_j = 0; n_j < a_o_batch.length; n_j++) {
                a_o_result.push({ o_tile: a_o_batch[n_j], o_img: a_o_img[n_j] });
            }
            o_comp.s_status = 'Fetched ' + a_o_result.length + '/' + n_cnt__tile + ' tiles...';
        }

        o_comp.s_status = 'Compositing elevation data...';

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

        let o_pixel__nw = o_visible.o_pixel__nw;
        let o_pixel__se = o_visible.o_pixel__se;
        let n_viewport_px_x = o_pixel__se.x - o_pixel__nw.x;
        let n_viewport_px_y = o_pixel__se.y - o_pixel__nw.y;

        let o_sel = o_comp.o_selection;
        let n_ratio_x = n_viewport_px_x / o_comp.n_scl_x__viewport;
        let n_ratio_y = n_viewport_px_y / o_comp.n_scl_y__viewport;
        let n_crop_x = (o_pixel__nw.x - n_tile_x__min * 256) + o_sel.n_x * n_ratio_x;
        let n_crop_y = (o_pixel__nw.y - n_tile_y__min * 256) + o_sel.n_y * n_ratio_y;
        let n_crop_scl_x = o_sel.n_scl_x * n_ratio_x;
        let n_crop_scl_y = o_sel.n_scl_y * n_ratio_y;

        let o_image_data__src = o_ctx__src.getImageData(
            Math.floor(n_crop_x), Math.floor(n_crop_y),
            Math.floor(n_crop_scl_x), Math.floor(n_crop_scl_y)
        );
        let a_n__pixel = o_image_data__src.data;

        let n_cnt__pixel = Math.floor(n_crop_scl_x) * Math.floor(n_crop_scl_y);
        let a_n__elevation = new Float32Array(n_cnt__pixel);
        let n_elevation__min = Infinity;
        let n_elevation__max = -Infinity;

        for (let n_i = 0; n_i < n_cnt__pixel; n_i++) {
            let n_off = n_i * 4;
            let n_elevation = o_config__global.f_n_elevation__from_rgb(
                a_n__pixel[n_off], a_n__pixel[n_off + 1], a_n__pixel[n_off + 2]
            );
            if (n_elevation < 0) n_elevation = 0;
            a_n__elevation[n_i] = n_elevation;
            if (n_elevation < n_elevation__min) n_elevation__min = n_elevation;
            if (n_elevation > n_elevation__max) n_elevation__max = n_elevation;
        }

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

        o_comp.s_status = 'Exported ' + n_scl_x__out + 'x' + n_scl_y__out + 'px (' + Math.round(n_elevation__min) + 'm – ' + Math.round(n_elevation__max) + 'm)';

        return {
            s_data_url: o_canvas__out.toDataURL('image/png'),
            n_m_per_pixel: o_comp.n_m_per_pixel,
            n_m__elevation_min: n_elevation__min,
            n_m__elevation_max: n_elevation__max,
            n_scl_x__selection: n_scl_x__out,
            a_n__elevation: a_n__elevation,
            n_scl_x__elevation: n_scl_x__out,
            n_scl_y__elevation: n_scl_y__out,
        };
    },
};

// ===================== SWITZERLAND SOURCE =====================

let o_config__switzerland = {
    s_id: 'switzerland',
    s_label: 'Switzerland',
    s_description: 'High-res Swiss terrain from swissALTI3D (0.5m resolution)',

    // map
    n_lat__center: 46.8,
    n_lon__center: 8.2,
    n_zoom__default: 8,
    n_zoom__min: 7,
    n_zoom__max: 18,
    s_url__tile: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
    s_attribution: '&copy; <a href="https://www.swisstopo.admin.ch">swisstopo</a>',
    o_bounds: { n_lat__south: 45.7, n_lon__west: 5.9, n_lat__north: 47.9, n_lon__east: 10.6 },
    b_tms: false,

    // elevation
    n_m__circumference: 40075016.686,
    n_m__native_resolution: 0.5,
    s_label__native: 'swissALTI3D',

    // presets
    a_o_preset: [
        { s_label: '— Swiss Presets —', s_value: '', b_disabled: false },
        { s_label: '── Alps ──', s_value: '', b_disabled: true },
        { s_label: 'Zermatt / Matterhorn', s_value: '46.02,7.75,13,Zermatt / Matterhorn' },
        { s_label: 'Jungfrau Region', s_value: '46.537,7.962,13,Jungfrau Region' },
        { s_label: 'Eiger Nordwand', s_value: '46.559,8.007,14,Eiger Nordwand' },
        { s_label: 'Monte Rosa', s_value: '45.937,7.867,14,Monte Rosa' },
        { s_label: 'Piz Bernina', s_value: '46.481,9.823,13,Bernina' },
        { s_label: 'Aletsch Glacier', s_value: '46.354,7.628,13,Aletsch Glacier' },
        { s_label: 'Dent Blanche', s_value: '46.094,7.215,14,Dent Blanche' },
        { s_label: '── Lakes & Valleys ──', s_value: '', b_disabled: true },
        { s_label: 'Lake Geneva', s_value: '46.45,6.55,12,Lake Geneva' },
        { s_label: 'Lake Lucerne', s_value: '46.99,8.45,12,Lake Lucerne' },
        { s_label: 'Lake Maggiore (Ticino)', s_value: '46.17,8.78,12,Lake Maggiore' },
        { s_label: 'Interlaken', s_value: '46.69,7.87,12,Interlaken' },
        { s_label: 'Grimsel Pass', s_value: '46.63,8.38,13,Grimsel Pass' },
        { s_label: '── Cities ──', s_value: '', b_disabled: true },
        { s_label: 'Bern', s_value: '46.948,7.447,13,Bern' },
        { s_label: 'Zurich', s_value: '47.375,8.54,13,Zurich' },
        { s_label: 'Geneva', s_value: '46.204,6.143,13,Geneva' },
        { s_label: 'Lugano', s_value: '46.003,8.952,13,Lugano' },
        { s_label: '── Wanderwege ──', s_value: '', b_disabled: true },
        { s_label: 'Höhenweg Hohbalm (Zermatt)', s_value: '46.035,7.72,14,Hoehenweg Hohbalm' },
        { s_label: 'Schynige Platte – Faulhorn – First', s_value: '46.655,7.92,13,Schynige Platte Faulhorn First' },
        { s_label: 'Cresta di Lema (Ticino)', s_value: '46.10,8.82,14,Cresta di Lema' },
    ],

    // extra data fields
    b_has_resolution_input: true,
    b_has_export_png: false,
    b_has_search: true,

    f_update_zoom_info: function (o_comp) {
        if (!o_comp._o_map) return;
        let n_zoom = Math.round(o_comp._o_map.getZoom());
        let n_lat = o_comp._o_map.getCenter().lat;
        let n_m_per_pixel = 40075016.686 * Math.cos(n_lat * Math.PI / 180) / (256 * Math.pow(2, n_zoom));
        o_comp.n_zoom = n_zoom;
        o_comp.n_m_per_pixel = Math.round(n_m_per_pixel);
        let n_scale__map = Math.round(n_m_per_pixel / 0.0002646);
        o_comp.s_scale__map = o_comp.f_s__format_number(o_comp.f_n__nice_round(n_scale__map));
        o_comp.s_quality = 'High-res Swiss elevation data (0.5m native)';
        o_comp.s_quality_class = 'quality_native';
    },

    s_zoom_label: function (o_comp) {
        return 'Zoom ' + o_comp.n_zoom + ' — ~' + o_comp.n_m_per_pixel + 'm/px — 1:' + o_comp.s_scale__map;
    },

    f_search: async function (o_comp) {
        if (o_comp.b_searching || !o_comp.s_search.trim() || !o_comp._o_map) return;
        o_comp.b_searching = true;
        o_comp.s_status = 'Searching...';
        try {
            let s_query = encodeURIComponent(o_comp.s_search.trim());
            let o_resp = await fetch('https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=' + s_query + '&type=locations&sr=4326&limit=1');
            let o_result = await o_resp.json();
            if (!o_result.results || o_result.results.length === 0) {
                let o_resp2 = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ch&q=' + s_query, {
                    headers: { 'Accept': 'application/json' },
                });
                let a_o_result = await o_resp2.json();
                if (a_o_result.length === 0) {
                    o_comp.s_status = 'No results found';
                } else {
                    let o_r = a_o_result[0];
                    let n_lat = parseFloat(o_r.lat);
                    let n_lon = parseFloat(o_r.lon);
                    o_comp._o_map.setView([n_lat, n_lon], 13);
                    o_comp.s_status = o_r.display_name;
                    o_comp.s_name__location = o_comp.s_search.trim();
                }
            } else {
                let o_r = o_result.results[0];
                if (o_r.attrs && o_r.attrs.geom_st_box2d) {
                    let s_box = o_r.attrs.geom_st_box2d;
                    let s_inner = s_box.replace('BOX(', '').replace(')', '');
                    let a_s_part = s_inner.split(',');
                    let a_n_min = a_s_part[0].trim().split(' ');
                    let a_n_max = a_s_part[1].trim().split(' ');
                    o_comp._o_map.fitBounds([
                        [parseFloat(a_n_min[1]), parseFloat(a_n_min[0])],
                        [parseFloat(a_n_max[1]), parseFloat(a_n_max[0])],
                    ]);
                } else if (o_r.attrs && o_r.attrs.lat && o_r.attrs.lon) {
                    o_comp._o_map.setView([o_r.attrs.lat, o_r.attrs.lon], 13);
                }
                o_comp.s_status = o_r.attrs ? o_r.attrs.label : o_comp.s_search.trim();
                o_comp.s_name__location = o_comp.s_search.trim();
            }
        } catch (o_err) {
            o_comp.s_status = 'Search failed: ' + o_err.message;
        }
        o_comp.b_searching = false;
    },

    f_toggle_elevation_overlay: function (o_comp) {
        o_comp.b_elevation_overlay = !o_comp.b_elevation_overlay;
        if (!o_comp._o_map) return;

        if (o_comp.b_elevation_overlay) {
            // B&W elevation from Terrarium tiles (same decoder as global)
            let o_bw_layer = L.GridLayer.extend({
                createTile: function (o_coords, f_done) {
                    let el_canvas = document.createElement('canvas');
                    el_canvas.width = 256;
                    el_canvas.height = 256;
                    let n_x = o_coords.x;
                    let n_y = o_coords.y;
                    let n_z = o_coords.z;
                    let n_max_tile = 1 << n_z;
                    n_x = ((n_x % n_max_tile) + n_max_tile) % n_max_tile;
                    let s_url = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/' + n_z + '/' + n_x + '/' + n_y + '.png';
                    fetch(s_url).then(function (o_resp) {
                        if (!o_resp.ok) { f_done(null, el_canvas); return; }
                        return o_resp.blob();
                    }).then(function (o_blob) {
                        if (!o_blob) return;
                        let s_blob_url = URL.createObjectURL(o_blob);
                        let o_img = new Image();
                        o_img.onload = function () {
                            URL.revokeObjectURL(s_blob_url);
                            let o_ctx = el_canvas.getContext('2d');
                            o_ctx.drawImage(o_img, 0, 0);
                            let o_data = o_ctx.getImageData(0, 0, 256, 256);
                            let a_n = o_data.data;
                            let n_cnt = 256 * 256;
                            let a_n__elev = new Float32Array(n_cnt);
                            let n_min = Infinity;
                            let n_max = -Infinity;
                            for (let n_i = 0; n_i < n_cnt; n_i++) {
                                let n_off = n_i * 4;
                                let n_elev = (a_n[n_off] * 256 + a_n[n_off + 1] + a_n[n_off + 2] / 256) - 32768;
                                if (n_elev < 0) n_elev = 0;
                                a_n__elev[n_i] = n_elev;
                                if (n_elev < n_min) n_min = n_elev;
                                if (n_elev > n_max) n_max = n_elev;
                            }
                            let n_range = n_max - n_min;
                            if (n_range < 1) n_range = 1;
                            for (let n_i = 0; n_i < n_cnt; n_i++) {
                                let n_val = Math.round(((a_n__elev[n_i] - n_min) / n_range) * 255);
                                let n_off = n_i * 4;
                                a_n[n_off] = n_val;
                                a_n[n_off + 1] = n_val;
                                a_n[n_off + 2] = n_val;
                                a_n[n_off + 3] = 255;
                            }
                            o_ctx.putImageData(o_data, 0, 0);
                            f_done(null, el_canvas);
                        };
                        o_img.onerror = function () {
                            URL.revokeObjectURL(s_blob_url);
                            f_done(null, el_canvas);
                        };
                        o_img.src = s_blob_url;
                    }).catch(function () {
                        f_done(null, el_canvas);
                    });
                    return el_canvas;
                },
            });
            o_comp._o_layer__elevation = new o_bw_layer({
                maxZoom: 18,
                bounds: L.latLngBounds(L.latLng(45.7, 5.9), L.latLng(47.9, 10.6)),
            });
            o_comp._o_layer__elevation.addTo(o_comp._o_map);

            // faint swisstopo labels on top of the B&W heightmap
            o_comp._o_layer__elevation_label = L.tileLayer(
                'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
                {
                    opacity: 0.15,
                    maxZoom: 18,
                    bounds: L.latLngBounds(L.latLng(45.7, 5.9), L.latLng(47.9, 10.6)),
                }
            );
            o_comp._o_layer__elevation_label.addTo(o_comp._o_map);
        } else {
            if (o_comp._o_layer__elevation) {
                o_comp._o_map.removeLayer(o_comp._o_layer__elevation);
                o_comp._o_layer__elevation = null;
            }
            if (o_comp._o_layer__elevation_label) {
                o_comp._o_map.removeLayer(o_comp._o_layer__elevation_label);
                o_comp._o_layer__elevation_label = null;
            }
        }
    },

    f_o_bounds__selection: function (o_comp) {
        let o_map = o_comp._o_map;
        let o_sel = o_comp.o_selection;
        let el = o_comp.$refs.map_container;
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

    f_s_data_url__from_elevation: async function (o_comp, n_resolution__override) {
        let o_bounds = o_config__switzerland.f_o_bounds__selection(o_comp);
        if (!o_bounds) throw new Error('Cannot determine selection bounds');

        let o_sel = o_comp.o_selection;
        let n_ratio = o_sel.n_scl_x / o_sel.n_scl_y;

        let n_tile_total = Math.max(o_comp.n_tile_col, o_comp.n_tile_row) || 1;
        let n_resolution = n_resolution__override || Math.round(o_comp.n_dp_per_mm * o_comp.n_mm__max_width * n_tile_total);
        let n_scl_x__out, n_scl_y__out;
        if (n_ratio >= 1) {
            n_scl_x__out = n_resolution;
            n_scl_y__out = Math.round(n_resolution / n_ratio);
        } else {
            n_scl_y__out = n_resolution;
            n_scl_x__out = Math.round(n_resolution * n_ratio);
        }
        n_scl_x__out = Math.max(1, n_scl_x__out);
        n_scl_y__out = Math.max(1, n_scl_y__out);

        o_comp.s_status = 'Fetching elevation for ' + n_scl_x__out + 'x' + n_scl_y__out + ' grid...';

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
                    o_config__switzerland.f_a_n_elevation__from_profile(
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

            o_comp.s_status = 'Fetched row ' + Math.min(n_row + n_cnt__batch, n_scl_y__out) + '/' + n_scl_y__out + '...';
        }

        o_comp.s_status = 'Processing elevation data...';

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

        o_comp.s_status = 'Exported ' + n_scl_x__out + 'x' + n_scl_y__out + 'px (' + Math.round(n_elevation__min) + 'm – ' + Math.round(n_elevation__max) + 'm)';

        return {
            s_data_url: o_canvas.toDataURL('image/png'),
            n_m_per_pixel: n_m_per_pixel,
            n_m__elevation_min: n_elevation__min,
            n_m__elevation_max: n_elevation__max,
            n_scl_x__selection: n_scl_x__out,
            a_n__elevation: a_n__flat,
            n_scl_x__elevation: n_scl_x__out,
            n_scl_y__elevation: n_scl_y__out,
        };
    },
};

// ===================== MARS SOURCE =====================

let o_config__mars = {
    s_id: 'mars',
    s_label: 'Mars',
    s_description: 'Mars terrain from MOLA elevation data (~463m resolution)',

    // map
    n_lat__center: 0,
    n_lon__center: 0,
    n_zoom__default: 3,
    n_zoom__min: 2,
    n_zoom__max: 9,
    s_url__tile: 'https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/celestia_mars-shaded-16k_global/{z}/{x}/{y}.png',
    s_attribution: '&copy; <a href="https://www.openplanetary.org">OpenPlanetary</a> / NASA',
    o_bounds: null,
    b_tms: true,

    // elevation
    n_m__circumference: 21344000,
    n_m__native_resolution: 463,
    s_label__native: 'MOLA',

    // presets
    a_o_preset: [
        { s_label: '— Mars Presets —', s_value: '', b_disabled: false },
        { s_label: '── Volcanoes ──', s_value: '', b_disabled: true },
        { s_label: 'Olympus Mons', s_value: '18.65,-133.8,6,Olympus Mons' },
        { s_label: 'Arsia Mons', s_value: '1.6,-112.8,6,Arsia Mons' },
        { s_label: 'Pavonis Mons', s_value: '9.0,-109.5,6,Pavonis Mons' },
        { s_label: 'Ascraeus Mons', s_value: '18.3,-104.8,6,Ascraeus Mons' },
        { s_label: 'Elysium Mons', s_value: '25.0,147.2,6,Elysium Mons' },
        { s_label: '── Canyons ──', s_value: '', b_disabled: true },
        { s_label: 'Valles Marineris', s_value: '-14.0,-59.2,5,Valles Marineris' },
        { s_label: 'Noctis Labyrinthus', s_value: '-8.5,-77.5,7,Noctis Labyrinthus' },
        { s_label: 'Coprates Chasma', s_value: '-14.5,-45.0,7,Coprates Chasma' },
        { s_label: '── Craters ──', s_value: '', b_disabled: true },
        { s_label: 'Gale Crater (Curiosity)', s_value: '-5.4,137.8,6,Gale Crater' },
        { s_label: 'Jezero Crater (Perseverance)', s_value: '18.4,77.5,6,Jezero Crater' },
        { s_label: 'Hellas Basin', s_value: '-45.9,70.0,5,Hellas Basin' },
        { s_label: 'Schiaparelli Crater', s_value: '22.0,-49.0,7,Schiaparelli Crater' },
        { s_label: '── Polar ──', s_value: '', b_disabled: true },
        { s_label: 'North Polar Cap', s_value: '85.0,0.0,4,North Polar Cap' },
        { s_label: 'South Polar Cap', s_value: '-85.0,0.0,4,South Polar Cap' },
        { s_label: '── Other ──', s_value: '', b_disabled: true },
        { s_label: 'Full Hemisphere', s_value: '0.0,-30.0,3,Full Hemisphere' },
        { s_label: 'Arabia Terra', s_value: '24.0,33.5,6,Arabia Terra' },
    ],

    // extra data fields
    b_has_resolution_input: false,
    b_has_export_png: true,
    b_has_search: false,

    f_update_zoom_info: function (o_comp) {
        if (!o_comp._o_map) return;
        let n_zoom = Math.round(o_comp._o_map.getZoom());
        let n_lat = o_comp._o_map.getCenter().lat;
        let n_m_per_pixel = 21344000 * Math.cos(n_lat * Math.PI / 180) / (256 * Math.pow(2, n_zoom));
        o_comp.n_zoom = n_zoom;
        o_comp.n_m_per_pixel = Math.round(n_m_per_pixel);
        let n_scale__map = Math.round(n_m_per_pixel / 0.0002646);
        o_comp.s_scale__map = o_comp.f_s__format_number(o_comp.f_n__nice_round(n_scale__map));

        if (n_m_per_pixel > 500) {
            o_comp.s_quality = 'native MOLA data (~463m)';
            o_comp.s_quality_class = 'quality_native';
        } else if (n_m_per_pixel > 200) {
            o_comp.s_quality = 'near native — slight interpolation';
            o_comp.s_quality_class = 'quality_good';
        } else {
            let n_factor = Math.round(463 / n_m_per_pixel);
            o_comp.s_quality = 'interpolated ~' + n_factor + 'x beyond native 463m';
            o_comp.s_quality_class = 'quality_interpolated';
        }
    },

    s_zoom_label: function (o_comp) {
        return 'Zoom ' + o_comp.n_zoom + ' — ~' + o_comp.n_m_per_pixel + 'm/px — 1:' + o_comp.s_scale__map;
    },

    f_search: null,

    f_toggle_elevation_overlay: function (o_comp) {
        o_comp.b_elevation_overlay = !o_comp.b_elevation_overlay;
        if (!o_comp._o_map) return;

        if (o_comp.b_elevation_overlay) {
            o_comp._o_layer__elevation = L.tileLayer(
                'https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/mola-gray/{z}/{x}/{y}.png',
                {
                    opacity: 0.7,
                    maxZoom: 9,
                    noWrap: true,
                    tms: true,
                }
            );
            o_comp._o_layer__elevation.addTo(o_comp._o_map);
        } else {
            if (o_comp._o_layer__elevation) {
                o_comp._o_map.removeLayer(o_comp._o_layer__elevation);
                o_comp._o_layer__elevation = null;
            }
        }
    },

    f_a_o_tile__visible: function (o_comp) {
        let o_map = o_comp._o_map;
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
            n_tile_x__min, n_tile_y__min, n_tile_x__max, n_tile_y__max,
            n_zoom, o_pixel__nw, o_pixel__se,
        };
    },

    f_o_fallback_tile: function () {
        let o_canvas = document.createElement('canvas');
        o_canvas.width = 256;
        o_canvas.height = 256;
        let o_ctx = o_canvas.getContext('2d');
        o_ctx.fillStyle = '#808080';
        o_ctx.fillRect(0, 0, 256, 256);
        return o_canvas;
    },

    f_image__from_tile: async function (n_x, n_y, n_zoom) {
        let n_y_tms = (1 << n_zoom) - 1 - n_y;
        let s_tile_url = 'https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/mola-gray/' + n_zoom + '/' + n_x + '/' + n_y_tms + '.png';
        let s_url = '/api/tile?url=' + encodeURIComponent(s_tile_url);
        try {
            let o_resp = await fetch(s_url);
            if (!o_resp.ok) return o_config__mars.f_o_fallback_tile();
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
            return o_config__mars.f_o_fallback_tile();
        }
    },

    f_s_data_url__from_elevation: async function (o_comp) {
        let o_visible = o_config__mars.f_a_o_tile__visible(o_comp);
        let a_o_tile = o_visible.a_o_tile;
        let n_cnt__tile = a_o_tile.length;

        if (n_cnt__tile > 400) {
            throw new Error('Too many tiles (' + n_cnt__tile + '). Zoom in.');
        }

        o_comp.s_status = 'Fetching ' + n_cnt__tile + ' MOLA tile(s)...';

        let n_sz__batch = 16;
        let a_o_result = [];
        for (let n_i = 0; n_i < a_o_tile.length; n_i += n_sz__batch) {
            let a_o_batch = a_o_tile.slice(n_i, n_i + n_sz__batch);
            let a_o_promise = a_o_batch.map(function (o_tile) {
                return o_config__mars.f_image__from_tile(o_tile.n_x, o_tile.n_y, o_tile.n_zoom);
            });
            let a_o_img = await Promise.all(a_o_promise);
            for (let n_j = 0; n_j < a_o_batch.length; n_j++) {
                a_o_result.push({ o_tile: a_o_batch[n_j], o_img: a_o_img[n_j] });
            }
            o_comp.s_status = 'Fetched ' + a_o_result.length + '/' + n_cnt__tile + ' tiles...';
        }

        o_comp.s_status = 'Compositing MOLA elevation data...';

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

        let o_pixel__nw = o_visible.o_pixel__nw;
        let o_pixel__se = o_visible.o_pixel__se;
        let n_viewport_px_x = o_pixel__se.x - o_pixel__nw.x;
        let n_viewport_px_y = o_pixel__se.y - o_pixel__nw.y;

        let o_sel = o_comp.o_selection;
        let n_ratio_x = n_viewport_px_x / o_comp.n_scl_x__viewport;
        let n_ratio_y = n_viewport_px_y / o_comp.n_scl_y__viewport;
        let n_crop_x = (o_pixel__nw.x - n_tile_x__min * 256) + o_sel.n_x * n_ratio_x;
        let n_crop_y = (o_pixel__nw.y - n_tile_y__min * 256) + o_sel.n_y * n_ratio_y;
        let n_crop_scl_x = o_sel.n_scl_x * n_ratio_x;
        let n_crop_scl_y = o_sel.n_scl_y * n_ratio_y;

        let o_image_data__src = o_ctx__src.getImageData(
            Math.floor(n_crop_x), Math.floor(n_crop_y),
            Math.floor(n_crop_scl_x), Math.floor(n_crop_scl_y)
        );
        let a_n__pixel = o_image_data__src.data;

        let n_cnt__pixel = Math.floor(n_crop_scl_x) * Math.floor(n_crop_scl_y);
        let a_n__elevation = new Float32Array(n_cnt__pixel);
        let n_elevation__min = Infinity;
        let n_elevation__max = -Infinity;

        for (let n_i = 0; n_i < n_cnt__pixel; n_i++) {
            let n_off = n_i * 4;
            let n_val = a_n__pixel[n_off] * 0.299 + a_n__pixel[n_off + 1] * 0.587 + a_n__pixel[n_off + 2] * 0.114;
            a_n__elevation[n_i] = n_val;
            if (n_val < n_elevation__min) n_elevation__min = n_val;
            if (n_val > n_elevation__max) n_elevation__max = n_val;
        }

        let n_m__mars_range = 29400;
        let n_m__mars_min = -8200;

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

        let n_elevation__min_m = n_m__mars_min + (n_elevation__min / 255) * n_m__mars_range;
        let n_elevation__max_m = n_m__mars_min + (n_elevation__max / 255) * n_m__mars_range;

        // convert luminance values to meters for float elevation array
        let a_n__elevation_m = new Float32Array(n_cnt__pixel);
        for (let n_i = 0; n_i < n_cnt__pixel; n_i++) {
            a_n__elevation_m[n_i] = n_m__mars_min + (a_n__elevation[n_i] / 255) * n_m__mars_range;
        }

        o_comp.s_status = 'Exported ' + n_scl_x__out + 'x' + n_scl_y__out + 'px (~' + Math.round(n_elevation__min_m) + 'm – ~' + Math.round(n_elevation__max_m) + 'm)';

        return {
            s_data_url: o_canvas__out.toDataURL('image/png'),
            n_m_per_pixel: o_comp.n_m_per_pixel,
            n_m__elevation_min: n_elevation__min_m,
            n_m__elevation_max: n_elevation__max_m,
            n_scl_x__selection: n_scl_x__out,
            a_n__elevation: a_n__elevation_m,
            n_scl_x__elevation: n_scl_x__out,
            n_scl_y__elevation: n_scl_y__out,
        };
    },
};

// ===================== SOURCE REGISTRY =====================

let o_source__by_id = {
    global: o_config__global,
    switzerland: o_config__switzerland,
    mars: o_config__mars,
};

let a_o_source = [o_config__global, o_config__switzerland, o_config__mars];

export {
    o_config__global,
    o_config__switzerland,
    o_config__mars,
    o_source__by_id,
    a_o_source,
};
