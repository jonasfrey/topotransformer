// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_o_html_from_o_js } from "./lib/handyhelpers.js";

let o_component__bw_image_to_3d = {
    name: 'component-bw-image-to-3d',
    template: (await f_o_html_from_o_js({
        s_tag: 'div',
        class: 'bw3d',
        a_o: [
            // three.js canvas
            {
                s_tag: 'canvas',
                class: 'bw3d__canvas',
                ref: 'canvas__three',
            },
            // overlay toggle toolbar
            {
                s_tag: 'div',
                class: 'bw3d__toolbar',
                a_o: [
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_overlay__image ? ' active' : '')",
                        'v-on:click': "b_overlay__image = !b_overlay__image",
                        innerText: 'Image',
                    },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_overlay__3d_config ? ' active' : '')",
                        'v-on:click': "b_overlay__3d_config = !b_overlay__3d_config",
                        innerText: '3D Config',
                    },
                    {
                        s_tag: 'div',
                        ':class': "'bw3d__toolbar_btn interactable' + (b_overlay__scene ? ' active' : '')",
                        'v-on:click': "b_overlay__scene = !b_overlay__scene",
                        innerText: 'Scene',
                    },
                ],
            },
            // overlay: image
            {
                s_tag: 'div',
                ':class': "'bw3d__overlay' + (b_overlay__image ? ' visible' : '')",
                ':style': "o_style__overlay__image",
                ref: 'overlay__image',
                a_o: [
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_header',
                        'v-on:pointerdown': "f_drag_start($event, 'image')",
                        a_o: [
                            { s_tag: 'span', class: 'bw3d__overlay_title', innerText: 'Image' },
                            { s_tag: 'span', class: 'bw3d__overlay_close interactable', 'v-on:click': 'b_overlay__image = false', innerHTML: '&times;' },
                        ],
                    },
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_body',
                        a_o: [
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'From file' },
                                    { s_tag: 'input', type: 'file', accept: 'image/*', 'v-on:change': 'f_load_file($event)', class: 'bw3d__input_file' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'From URL' },
                                    {
                                        class: 'bw3d__row',
                                        a_o: [
                                            { s_tag: 'input', type: 'text', 'v-model': 's_url', placeholder: 'https://example.com/image.jpg', class: 'bw3d__input' },
                                            { s_tag: 'div', class: 'bw3d__btn interactable', 'v-on:click': 'f_load_url', innerText: 'Load' },
                                        ],
                                    },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Max resolution' },
                                    { s_tag: 'input', type: 'number', ':value': 'n_max_resolution', 'v-on:change': 'f_set_max_resolution(Number($event.target.value))', min: '8', max: '5000', step: '8', class: 'bw3d__input' },
                                    { s_tag: 'div', class: 'bw3d__info', innerText: 'Image will be downsampled if larger' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Preview (scroll to zoom, drag to move selection)' },
                                    {
                                        s_tag: 'div',
                                        class: 'bw3d__preview_container',
                                        ref: 'preview_container',
                                        'v-on:wheel.prevent': 'f_selection_wheel($event)',
                                        'v-on:pointerdown': 'f_selection_drag_start($event)',
                                        a_o: [
                                            { s_tag: 'canvas', class: 'bw3d__preview', ref: 'canvas__preview', width: '256', height: '256' },
                                            { s_tag: 'canvas', class: 'bw3d__preview_overlay', ref: 'canvas__selection', width: '256', height: '256' },
                                        ],
                                    },
                                    {
                                        class: 'bw3d__row',
                                        a_o: [
                                            { s_tag: 'div', class: 'bw3d__info', style: 'flex:1', innerText: '{{ s_resolution }}' },
                                            { s_tag: 'div', class: 'bw3d__btn interactable', 'v-on:click': 'f_selection_reset', innerText: 'Reset size' },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // overlay: 3d config
            {
                s_tag: 'div',
                ':class': "'bw3d__overlay' + (b_overlay__3d_config ? ' visible' : '')",
                ':style': "o_style__overlay__3d_config",
                ref: 'overlay__3d_config',
                a_o: [
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_header',
                        'v-on:pointerdown': "f_drag_start($event, '3d_config')",
                        a_o: [
                            { s_tag: 'span', class: 'bw3d__overlay_title', innerText: '3D Config' },
                            { s_tag: 'span', class: 'bw3d__overlay_close interactable', 'v-on:click': 'b_overlay__3d_config = false', innerHTML: '&times;' },
                        ],
                    },
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_body',
                        a_o: [
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Geometry' },
                                    {
                                        s_tag: 'select',
                                        'v-model': 's_type__geometry',
                                        class: 'bw3d__select',
                                        a_o: [
                                            { s_tag: 'option', value: 'sphere', innerText: 'Sphere' },
                                            { s_tag: 'option', value: 'cylinder', innerText: 'Cylinder' },
                                            { s_tag: 'option', value: 'plane', innerText: 'Plane' },
                                        ],
                                    },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Offset factor: {{ n_factor.toFixed(2) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_factor', min: '0', max: '5', step: '0.01', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'div', class: 'bw3d__btn interactable', 'v-on:click': 'f_generate_mesh', innerText: 'Generate 3D' },
                                ],
                            },
                        ],
                    },
                ],
            },
            // overlay: scene
            {
                s_tag: 'div',
                ':class': "'bw3d__overlay' + (b_overlay__scene ? ' visible' : '')",
                ':style': "o_style__overlay__scene",
                ref: 'overlay__scene',
                a_o: [
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_header',
                        'v-on:pointerdown': "f_drag_start($event, 'scene')",
                        a_o: [
                            { s_tag: 'span', class: 'bw3d__overlay_title', innerText: 'Scene' },
                            { s_tag: 'span', class: 'bw3d__overlay_close interactable', 'v-on:click': 'b_overlay__scene = false', innerHTML: '&times;' },
                        ],
                    },
                    {
                        s_tag: 'div',
                        class: 'bw3d__overlay_body',
                        a_o: [
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Background color' },
                                    { s_tag: 'input', type: 'color', ':value': 's_color__bg', 'v-on:input': 'f_set_color_bg($event.target.value)', class: 'bw3d__input_color' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Mesh color' },
                                    { s_tag: 'input', type: 'color', ':value': 's_color__mesh', 'v-on:input': 'f_set_color_mesh($event.target.value)', class: 'bw3d__input_color' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Wireframe' },
                                    { s_tag: 'input', type: 'checkbox', 'v-model': 'b_wireframe', 'v-on:change': 'f_set_wireframe' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Ambient light: {{ n_intensity__ambient.toFixed(2) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_intensity__ambient', 'v-on:input': 'f_set_ambient', min: '0', max: '2', step: '0.01', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Directional light: {{ n_intensity__directional.toFixed(2) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_intensity__directional', 'v-on:input': 'f_set_directional', min: '0', max: '3', step: '0.01', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Auto-rotate' },
                                    { s_tag: 'input', type: 'checkbox', 'v-model': 'b_autorotate', 'v-on:change': 'f_set_autorotate' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Rotation speed: {{ n_speed__rotation.toFixed(2) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_speed__rotation', 'v-on:input': 'f_set_rotation_speed', min: '0', max: '5', step: '0.01', class: 'bw3d__range' },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    })).outerHTML,
    data: function () {
        return {
            // overlay visibility
            b_overlay__image: true,
            b_overlay__3d_config: true,
            b_overlay__scene: true,
            // overlay positions
            o_style__overlay__image: { left: '20px', top: '100px' },
            o_style__overlay__3d_config: { left: '340px', top: '100px' },
            o_style__overlay__scene: { left: '660px', top: '100px' },
            // image
            s_url: '',
            s_resolution: 'No image loaded',
            a_n__image_data: null,
            n_scl_x__image: 0,
            n_scl_y__image: 0,
            // selection rect (in original image pixel coordinates)
            n_sel_x: 0,
            n_sel_y: 0,
            n_sel_scl_x: 0,
            n_sel_scl_y: 0,
            // full image size (original pixels)
            n_scl_x__full: 0,
            n_scl_y__full: 0,
            // 3d config
            s_type__geometry: 'sphere',
            n_max_resolution: 5000,
            n_factor: 1,
            // scene
            s_color__bg: '#0a0a12',
            s_color__mesh: '#8b74ea',
            b_wireframe: false,
            n_intensity__ambient: 0.4,
            n_intensity__directional: 0.8,
            b_autorotate: true,
            n_speed__rotation: 1,
            // internal (non-reactive three.js refs)
            _o_renderer: null,
            _o_scene: null,
            _o_camera: null,
            _o_control: null,
            _o_light__ambient: null,
            _o_light__directional: null,
            _o_mesh: null,
            _o_image__original: null,
            _el_canvas__grayscale: null,
            _n_id__animation: null,
            // drag state
            _s_drag_overlay: null,
            _n_drag_off_x: 0,
            _n_drag_off_y: 0,
        };
    },
    methods: {
        f_init_three: async function () {
            let o_self = this;
            let THREE = await import('three');
            let { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

            let el_canvas = o_self.$refs.canvas__three;

            let o_renderer = new THREE.WebGLRenderer({ canvas: el_canvas, antialias: true });
            o_renderer.setPixelRatio(window.devicePixelRatio);
            o_renderer.setSize(el_canvas.parentElement.clientWidth, el_canvas.parentElement.clientHeight);

            let o_scene = new THREE.Scene();
            o_scene.background = new THREE.Color(o_self.s_color__bg);

            let o_camera = new THREE.PerspectiveCamera(
                60,
                el_canvas.parentElement.clientWidth / el_canvas.parentElement.clientHeight,
                0.1,
                1000
            );
            o_camera.position.set(0, 0, 3);

            let o_control = new OrbitControls(o_camera, o_renderer.domElement);
            o_control.enableDamping = true;
            o_control.dampingFactor = 0.08;
            o_control.autoRotate = o_self.b_autorotate;
            o_control.autoRotateSpeed = o_self.n_speed__rotation;

            let o_light__ambient = new THREE.AmbientLight(0xffffff, o_self.n_intensity__ambient);
            o_scene.add(o_light__ambient);

            let o_light__directional = new THREE.DirectionalLight(0xffffff, o_self.n_intensity__directional);
            o_light__directional.position.set(5, 5, 5);
            o_scene.add(o_light__directional);

            o_self._o_renderer = o_renderer;
            o_self._o_scene = o_scene;
            o_self._o_camera = o_camera;
            o_self._o_control = o_control;
            o_self._o_light__ambient = o_light__ambient;
            o_self._o_light__directional = o_light__directional;
            o_self._THREE = THREE;

            let f_on_resize = function () {
                let el = el_canvas.parentElement;
                o_camera.aspect = el.clientWidth / el.clientHeight;
                o_camera.updateProjectionMatrix();
                o_renderer.setSize(el.clientWidth, el.clientHeight);
            };
            window.addEventListener('resize', f_on_resize);
            o_self._f_on_resize = f_on_resize;

            let f_animate = function () {
                o_self._n_id__animation = requestAnimationFrame(f_animate);
                o_control.update();
                o_renderer.render(o_scene, o_camera);
            };
            f_animate();
        },

        f_load_file: function (o_evt) {
            let o_self = this;
            let o_file = o_evt.target.files[0];
            if (!o_file) return;
            let o_reader = new FileReader();
            o_reader.onload = function (o_evt_load) {
                let o_image = new Image();
                o_image.onload = function () { o_self.f_process_image(o_image); };
                o_image.src = o_evt_load.target.result;
            };
            o_reader.readAsDataURL(o_file);
        },

        f_load_url: function () {
            let o_self = this;
            let s_url = o_self.s_url.trim();
            if (!s_url) return;
            let o_image = new Image();
            o_image.crossOrigin = 'anonymous';
            o_image.onload = function () { o_self.f_process_image(o_image); };
            o_image.onerror = function () { o_self.s_resolution = 'Failed to load image from URL'; };
            o_image.src = s_url;
        },

        f_set_max_resolution: function (n_val) {
            let o_self = this;
            o_self.n_max_resolution = n_val;
            if (o_self._o_image__original) {
                o_self.f_extract_selection();
            }
        },

        f_process_image: function (o_image) {
            let o_self = this;
            o_self._o_image__original = o_image;
            let n_scl_x = o_image.width;
            let n_scl_y = o_image.height;

            o_self.n_scl_x__full = n_scl_x;
            o_self.n_scl_y__full = n_scl_y;

            // draw full image to offscreen canvas as grayscale
            let el_canvas__grayscale = document.createElement('canvas');
            el_canvas__grayscale.width = n_scl_x;
            el_canvas__grayscale.height = n_scl_y;
            let o_ctx = el_canvas__grayscale.getContext('2d');
            o_ctx.drawImage(o_image, 0, 0, n_scl_x, n_scl_y);

            let o_imagedata = o_ctx.getImageData(0, 0, n_scl_x, n_scl_y);
            let a_n__rgba = o_imagedata.data;

            // convert to grayscale in place
            for (let n_idx = 0; n_idx < n_scl_x * n_scl_y; n_idx++) {
                let n_off = n_idx * 4;
                let n_val = Math.round(
                    a_n__rgba[n_off] * 0.299 +
                    a_n__rgba[n_off + 1] * 0.587 +
                    a_n__rgba[n_off + 2] * 0.114
                );
                a_n__rgba[n_off] = n_val;
                a_n__rgba[n_off + 1] = n_val;
                a_n__rgba[n_off + 2] = n_val;
                a_n__rgba[n_off + 3] = 255;
            }
            o_ctx.putImageData(o_imagedata, 0, 0);
            o_self._el_canvas__grayscale = el_canvas__grayscale;

            // draw preview
            let el_preview = o_self.$refs.canvas__preview;
            el_preview.width = n_scl_x;
            el_preview.height = n_scl_y;
            el_preview.getContext('2d').drawImage(el_canvas__grayscale, 0, 0);

            // sync selection overlay canvas size
            let el_selection = o_self.$refs.canvas__selection;
            el_selection.width = n_scl_x;
            el_selection.height = n_scl_y;

            // reset selection to full image
            o_self.n_sel_x = 0;
            o_self.n_sel_y = 0;
            o_self.n_sel_scl_x = n_scl_x;
            o_self.n_sel_scl_y = n_scl_y;

            o_self.f_draw_selection();
            o_self.f_extract_selection();
        },

        f_draw_selection: function () {
            let o_self = this;
            let el_selection = o_self.$refs.canvas__selection;
            if (!el_selection) return;
            let o_ctx = el_selection.getContext('2d');
            o_ctx.clearRect(0, 0, el_selection.width, el_selection.height);

            // dim area outside selection
            o_ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            o_ctx.fillRect(0, 0, el_selection.width, el_selection.height);
            // clear the selection area
            o_ctx.clearRect(o_self.n_sel_x, o_self.n_sel_y, o_self.n_sel_scl_x, o_self.n_sel_scl_y);

            // draw red border
            o_ctx.strokeStyle = '#ff3333';
            o_ctx.lineWidth = Math.max(2, Math.round(o_self.n_scl_x__full / 200));
            o_ctx.strokeRect(o_self.n_sel_x, o_self.n_sel_y, o_self.n_sel_scl_x, o_self.n_sel_scl_y);
        },

        f_extract_selection: function () {
            let o_self = this;
            if (!o_self._el_canvas__grayscale) return;

            let n_x = Math.round(o_self.n_sel_x);
            let n_y = Math.round(o_self.n_sel_y);
            let n_scl_x = Math.round(o_self.n_sel_scl_x);
            let n_scl_y = Math.round(o_self.n_sel_scl_y);

            // clamp
            n_x = Math.max(0, n_x);
            n_y = Math.max(0, n_y);
            n_scl_x = Math.min(n_scl_x, o_self.n_scl_x__full - n_x);
            n_scl_y = Math.min(n_scl_y, o_self.n_scl_y__full - n_y);
            if (n_scl_x < 1 || n_scl_y < 1) return;

            // get selection pixels from the grayscale canvas
            let o_ctx = o_self._el_canvas__grayscale.getContext('2d');
            let o_imagedata = o_ctx.getImageData(n_x, n_y, n_scl_x, n_scl_y);
            let a_n__rgba = o_imagedata.data;

            // apply max resolution downsampling
            let n_out_x = n_scl_x;
            let n_out_y = n_scl_y;
            let n_max = o_self.n_max_resolution;

            if (n_out_x > n_max || n_out_y > n_max) {
                let n_ratio = Math.min(n_max / n_out_x, n_max / n_out_y);
                n_out_x = Math.floor(n_out_x * n_ratio);
                n_out_y = Math.floor(n_out_y * n_ratio);
            }

            // if downsampling needed, draw to a temp canvas
            let a_n__gray;
            if (n_out_x !== n_scl_x || n_out_y !== n_scl_y) {
                let el_tmp = document.createElement('canvas');
                el_tmp.width = n_scl_x;
                el_tmp.height = n_scl_y;
                let o_ctx_tmp = el_tmp.getContext('2d');
                o_ctx_tmp.putImageData(o_imagedata, 0, 0);

                let el_tmp2 = document.createElement('canvas');
                el_tmp2.width = n_out_x;
                el_tmp2.height = n_out_y;
                let o_ctx_tmp2 = el_tmp2.getContext('2d');
                o_ctx_tmp2.drawImage(el_tmp, 0, 0, n_out_x, n_out_y);

                let o_imagedata2 = o_ctx_tmp2.getImageData(0, 0, n_out_x, n_out_y);
                a_n__gray = new Uint8Array(n_out_x * n_out_y);
                for (let n_idx = 0; n_idx < a_n__gray.length; n_idx++) {
                    a_n__gray[n_idx] = o_imagedata2.data[n_idx * 4];
                }
            } else {
                a_n__gray = new Uint8Array(n_out_x * n_out_y);
                for (let n_idx = 0; n_idx < a_n__gray.length; n_idx++) {
                    a_n__gray[n_idx] = a_n__rgba[n_idx * 4];
                }
            }

            o_self.a_n__image_data = a_n__gray;
            o_self.n_scl_x__image = n_out_x;
            o_self.n_scl_y__image = n_out_y;
            o_self.s_resolution = n_scl_x + 'x' + n_scl_y + ' sel → ' + n_out_x + 'x' + n_out_y + ' (grayscale)';
        },

        f_selection_wheel: function (o_evt) {
            let o_self = this;
            if (!o_self._o_image__original) return;

            let n_scl_step = 0.05;
            let n_dir = o_evt.deltaY > 0 ? 1 : -1; // scroll down = zoom out (larger rect)

            let n_old_scl_x = o_self.n_sel_scl_x;
            let n_old_scl_y = o_self.n_sel_scl_y;

            // scale factor change
            let n_d_x = o_self.n_scl_x__full * n_scl_step * n_dir;
            let n_d_y = o_self.n_scl_y__full * n_scl_step * n_dir;

            let n_new_scl_x = Math.max(8, Math.min(o_self.n_scl_x__full, n_old_scl_x + n_d_x));
            let n_new_scl_y = Math.max(8, Math.min(o_self.n_scl_y__full, n_old_scl_y + n_d_y));

            // keep aspect ratio of full image
            let n_ratio = o_self.n_scl_x__full / o_self.n_scl_y__full;
            if (n_new_scl_x / n_new_scl_y > n_ratio) {
                n_new_scl_x = n_new_scl_y * n_ratio;
            } else {
                n_new_scl_y = n_new_scl_x / n_ratio;
            }

            // zoom centered on mouse position within canvas
            let el = o_self.$refs.preview_container;
            let o_rect = el.getBoundingClientRect();
            let n_mouse_nor_x = (o_evt.clientX - o_rect.left) / o_rect.width;
            let n_mouse_nor_y = (o_evt.clientY - o_rect.top) / o_rect.height;

            // mouse position in image coordinates
            let n_mouse_img_x = o_self.n_sel_x + n_mouse_nor_x * n_old_scl_x;
            let n_mouse_img_y = o_self.n_sel_y + n_mouse_nor_y * n_old_scl_y;

            // new position keeping mouse point stable
            let n_new_x = n_mouse_img_x - n_mouse_nor_x * n_new_scl_x;
            let n_new_y = n_mouse_img_y - n_mouse_nor_y * n_new_scl_y;

            // clamp position
            n_new_x = Math.max(0, Math.min(n_new_x, o_self.n_scl_x__full - n_new_scl_x));
            n_new_y = Math.max(0, Math.min(n_new_y, o_self.n_scl_y__full - n_new_scl_y));

            o_self.n_sel_x = n_new_x;
            o_self.n_sel_y = n_new_y;
            o_self.n_sel_scl_x = n_new_scl_x;
            o_self.n_sel_scl_y = n_new_scl_y;

            o_self.f_draw_selection();
            o_self.f_extract_selection();
        },

        f_selection_drag_start: function (o_evt) {
            let o_self = this;
            if (!o_self._o_image__original) return;

            let el = o_self.$refs.preview_container;
            let o_rect = el.getBoundingClientRect();
            let n_scl_ratio_x = o_self.n_scl_x__full / o_rect.width;
            let n_scl_ratio_y = o_self.n_scl_y__full / o_rect.height;

            let n_start_mouse_x = o_evt.clientX;
            let n_start_mouse_y = o_evt.clientY;
            let n_start_sel_x = o_self.n_sel_x;
            let n_start_sel_y = o_self.n_sel_y;

            o_evt.target.setPointerCapture(o_evt.pointerId);

            let f_move = function (o_evt2) {
                let n_dx = (o_evt2.clientX - n_start_mouse_x) * n_scl_ratio_x;
                let n_dy = (o_evt2.clientY - n_start_mouse_y) * n_scl_ratio_y;

                let n_new_x = n_start_sel_x + n_dx;
                let n_new_y = n_start_sel_y + n_dy;

                n_new_x = Math.max(0, Math.min(n_new_x, o_self.n_scl_x__full - o_self.n_sel_scl_x));
                n_new_y = Math.max(0, Math.min(n_new_y, o_self.n_scl_y__full - o_self.n_sel_scl_y));

                o_self.n_sel_x = n_new_x;
                o_self.n_sel_y = n_new_y;

                o_self.f_draw_selection();
            };

            let f_up = function () {
                document.removeEventListener('pointermove', f_move);
                document.removeEventListener('pointerup', f_up);
                o_self.f_extract_selection();
            };

            document.addEventListener('pointermove', f_move);
            document.addEventListener('pointerup', f_up);
        },

        f_selection_reset: function () {
            let o_self = this;
            if (!o_self._o_image__original) return;
            o_self.n_sel_x = 0;
            o_self.n_sel_y = 0;
            o_self.n_sel_scl_x = o_self.n_scl_x__full;
            o_self.n_sel_scl_y = o_self.n_scl_y__full;
            o_self.f_draw_selection();
            o_self.f_extract_selection();
        },

        f_generate_mesh: function () {
            let o_self = this;
            if (!o_self.a_n__image_data || !o_self._THREE) return;

            let THREE = o_self._THREE;
            let o_scene = o_self._o_scene;

            // remove old mesh
            if (o_self._o_mesh) {
                o_scene.remove(o_self._o_mesh);
                o_self._o_mesh.geometry.dispose();
                o_self._o_mesh.material.dispose();
                o_self._o_mesh = null;
            }

            let n_scl_x = o_self.n_scl_x__image;
            let n_scl_y = o_self.n_scl_y__image;
            let a_n__data = o_self.a_n__image_data;
            let n_factor = o_self.n_factor;
            let s_type = o_self.s_type__geometry;

            let o_geometry = null;
            if (s_type === 'sphere') {
                o_geometry = new THREE.SphereGeometry(1, n_scl_x - 1, n_scl_y - 1);
            } else if (s_type === 'cylinder') {
                o_geometry = new THREE.CylinderGeometry(1, 1, 2, n_scl_x - 1, n_scl_y - 1, true);
            } else if (s_type === 'plane') {
                o_geometry = new THREE.PlaneGeometry(2, 2, n_scl_x - 1, n_scl_y - 1);
            }

            o_self.f_apply_displacement(o_geometry, a_n__data, n_scl_x, n_scl_y, n_factor, s_type);
            o_geometry.computeVertexNormals();

            let o_material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(o_self.s_color__mesh),
                wireframe: o_self.b_wireframe,
                side: THREE.DoubleSide,
                flatShading: true,
            });

            let o_mesh = new THREE.Mesh(o_geometry, o_material);
            o_scene.add(o_mesh);
            o_self._o_mesh = o_mesh;
        },

        f_apply_displacement: function (o_geometry, a_n__data, n_scl_x, n_scl_y, n_factor, s_type) {
            let o_self = this;
            let THREE = o_self._THREE;
            let o_pos = o_geometry.attributes.position;
            let n_cnt__vertex = o_pos.count;
            let n_col = n_scl_x;
            let o_vec = new THREE.Vector3();

            for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
                let n_idx_row = Math.floor(n_idx / n_col);
                let n_idx_col = n_idx % n_col;
                n_idx_row = Math.min(n_idx_row, n_scl_y - 1);
                n_idx_col = Math.min(n_idx_col, n_scl_x - 1);

                let n_idx__pixel = n_idx_row * n_scl_x + n_idx_col;
                let n_val = (n_idx__pixel < a_n__data.length) ? a_n__data[n_idx__pixel] : 127;
                let n_offset = ((n_val - 127) / 128) * n_factor;

                o_vec.set(o_pos.getX(n_idx), o_pos.getY(n_idx), o_pos.getZ(n_idx));

                if (s_type === 'sphere') {
                    let n_len = o_vec.length();
                    if (n_len > 0) {
                        o_pos.setXYZ(n_idx,
                            o_vec.x + (o_vec.x / n_len) * n_offset,
                            o_vec.y + (o_vec.y / n_len) * n_offset,
                            o_vec.z + (o_vec.z / n_len) * n_offset
                        );
                    }
                } else if (s_type === 'cylinder') {
                    let n_len_xz = Math.sqrt(o_vec.x * o_vec.x + o_vec.z * o_vec.z);
                    if (n_len_xz > 0) {
                        o_pos.setXYZ(n_idx,
                            o_vec.x + (o_vec.x / n_len_xz) * n_offset,
                            o_vec.y,
                            o_vec.z + (o_vec.z / n_len_xz) * n_offset
                        );
                    }
                } else if (s_type === 'plane') {
                    o_pos.setZ(n_idx, o_vec.z + n_offset);
                }
            }
            o_pos.needsUpdate = true;
        },

        // scene controls
        f_set_color_bg: function (s_color) {
            let o_self = this;
            o_self.s_color__bg = s_color;
            if (o_self._o_scene && o_self._THREE) {
                o_self._o_scene.background = new o_self._THREE.Color(s_color);
            }
        },
        f_set_color_mesh: function (s_color) {
            let o_self = this;
            o_self.s_color__mesh = s_color;
            if (o_self._o_mesh) {
                o_self._o_mesh.material.color.set(s_color);
            }
        },
        f_set_wireframe: function () {
            let o_self = this;
            if (o_self._o_mesh) {
                o_self._o_mesh.material.wireframe = o_self.b_wireframe;
            }
        },
        f_set_ambient: function () {
            let o_self = this;
            if (o_self._o_light__ambient) {
                o_self._o_light__ambient.intensity = o_self.n_intensity__ambient;
            }
        },
        f_set_directional: function () {
            let o_self = this;
            if (o_self._o_light__directional) {
                o_self._o_light__directional.intensity = o_self.n_intensity__directional;
            }
        },
        f_set_autorotate: function () {
            let o_self = this;
            if (o_self._o_control) {
                o_self._o_control.autoRotate = o_self.b_autorotate;
            }
        },
        f_set_rotation_speed: function () {
            let o_self = this;
            if (o_self._o_control) {
                o_self._o_control.autoRotateSpeed = o_self.n_speed__rotation;
            }
        },

        // overlay drag
        f_drag_start: function (o_evt, s_overlay) {
            let o_self = this;
            o_self._s_drag_overlay = s_overlay;
            let s_key = 'overlay__' + s_overlay;
            let el = o_self.$refs[s_key];
            if (!el) return;
            o_self._n_drag_off_x = o_evt.clientX - el.offsetLeft;
            o_self._n_drag_off_y = o_evt.clientY - el.offsetTop;
            o_evt.target.setPointerCapture(o_evt.pointerId);

            let f_move = function (o_evt2) {
                let n_x = Math.max(0, Math.min(o_evt2.clientX - o_self._n_drag_off_x, window.innerWidth - 100));
                let n_y = Math.max(0, Math.min(o_evt2.clientY - o_self._n_drag_off_y, window.innerHeight - 40));
                let o_style_key = 'o_style__overlay__' + s_overlay;
                o_self[o_style_key] = { left: n_x + 'px', top: n_y + 'px' };
            };
            let f_up = function () {
                document.removeEventListener('pointermove', f_move);
                document.removeEventListener('pointerup', f_up);
            };
            document.addEventListener('pointermove', f_move);
            document.addEventListener('pointerup', f_up);
        },
    },
    mounted: function () {
        this.f_init_three();
    },
    beforeUnmount: function () {
        if (this._n_id__animation) cancelAnimationFrame(this._n_id__animation);
        if (this._f_on_resize) window.removeEventListener('resize', this._f_on_resize);
        if (this._o_renderer) this._o_renderer.dispose();
        if (this._o_control) this._o_control.dispose();
    },
};

export { o_component__bw_image_to_3d };
