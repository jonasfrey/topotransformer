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
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Offset factor: {{ n_factor.toFixed(2) }} ({{ (n_factor * 10).toFixed(1) }}mm height)' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_factor', min: '-1', max: '1', step: '0.01', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Max width (mm)' },
                                    { s_tag: 'input', type: 'number', 'v-model.number': 'n_mm__max_width', min: '1', step: '1', class: 'bw3d__input' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane'",
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Baseplate thickness (mm): {{ n_mm__baseplate.toFixed(1) }}' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_mm__baseplate', min: '0', max: '20', step: '0.5', class: 'bw3d__range' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                'v-if': "s_type__geometry === 'plane'",
                                a_o: [
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Chamfer angle: {{ n_deg__chamfer }}°' },
                                    { s_tag: 'input', type: 'range', 'v-model.number': 'n_deg__chamfer', min: '0', max: '45', step: '1', class: 'bw3d__range' },
                                    { s_tag: 'div', class: 'bw3d__info', innerText: 'Tilts bottom face for overhang-free vertical printing' },
                                ],
                            },
                            {
                                class: 'bw3d__section',
                                a_o: [
                                    {
                                        class: 'bw3d__row',
                                        a_o: [
                                            { s_tag: 'div', class: 'bw3d__btn interactable', 'v-on:click': 'f_generate_mesh', innerText: 'Generate 3D' },
                                            { s_tag: 'div', class: 'bw3d__btn interactable', 'v-on:click': 'f_download_stl', innerText: 'Download STL' },
                                        ],
                                    },
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
                                    { s_tag: 'label', class: 'bw3d__label', innerText: 'Height colormap (blue → green → red)' },
                                    { s_tag: 'input', type: 'checkbox', 'v-model': 'b_colormap__height' },
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
            n_factor: 0.5,
            n_mm__max_width: 170,
            n_mm__baseplate: 5,
            n_deg__chamfer: 60,
            // scene
            s_color__bg: '#0a0a12',
            s_color__mesh: '#8b74ea',
            b_wireframe: false,
            b_colormap__height: true,
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
            _o_group: null,
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

            // remove old group
            if (o_self._o_group) {
                o_scene.remove(o_self._o_group);
                o_self._o_group.traverse(function (o_child) {
                    if (o_child.geometry) o_child.geometry.dispose();
                    if (o_child.material) o_child.material.dispose();
                });
                o_self._o_group = null;
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
                let n_ratio = n_scl_x / n_scl_y;
                let n_plane_x = n_ratio >= 1 ? 2 : 2 * n_ratio;
                let n_plane_y = n_ratio >= 1 ? 2 / n_ratio : 2;
                o_geometry = new THREE.PlaneGeometry(n_plane_x, n_plane_y, n_scl_x - 1, n_scl_y - 1);
            }

            // scale so max dimension = n_mm__max_width mm (before displacement)
            o_geometry.computeBoundingBox();
            let o_box = o_geometry.boundingBox;
            let n_size_x = o_box.max.x - o_box.min.x;
            let n_size_y = o_box.max.y - o_box.min.y;
            let n_size_z = o_box.max.z - o_box.min.z;
            let n_max_dim = Math.max(n_size_x, n_size_y, n_size_z);
            let n_scl = o_self.n_mm__max_width / n_max_dim;
            o_geometry.scale(n_scl, n_scl, n_scl);

            // displacement in mm: factor 1.0 = 20mm max height
            let n_mm__displacement = n_factor * 10;
            o_self.f_apply_displacement(o_geometry, a_n__data, n_scl_x, n_scl_y, n_mm__displacement, s_type);

            // apply height colormap if enabled
            if (o_self.b_colormap__height) {
                o_self.f_apply_vertex_color(o_geometry, s_type);
            }

            o_geometry.computeVertexNormals();

            let o_material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(o_self.s_color__mesh),
                wireframe: o_self.b_wireframe,
                side: THREE.DoubleSide,
                flatShading: true,
                vertexColors: o_self.b_colormap__height,
            });

            let o_group = new THREE.Group();

            // for plane mode with baseplate: build a single watertight solid
            if (s_type === 'plane' && o_self.n_mm__baseplate > 0) {
                let o_geom__solid = o_self.f_o_geometry__solid_plane(o_geometry, o_self.n_mm__baseplate, o_self.n_deg__chamfer);

                if (o_self.b_colormap__height) {
                    o_self.f_apply_vertex_color(o_geom__solid, s_type);
                }
                o_geom__solid.computeVertexNormals();

                let o_mat__solid = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(o_self.s_color__mesh),
                    wireframe: o_self.b_wireframe,
                    side: THREE.DoubleSide,
                    flatShading: true,
                    vertexColors: o_self.b_colormap__height,
                });

                let o_mesh__solid = new THREE.Mesh(o_geom__solid, o_mat__solid);
                o_group.add(o_mesh__solid);
                o_self._o_mesh = o_mesh__solid;

                // dispose the original plane geometry
                o_geometry.dispose();
            } else {
                let o_mesh = new THREE.Mesh(o_geometry, o_material);
                o_group.add(o_mesh);
                o_self._o_mesh = o_mesh;
            }

            o_scene.add(o_group);
            o_self._o_group = o_group;
        },

        f_download_stl: function () {
            let o_self = this;
            if (!o_self._o_group || !o_self._THREE) return;

            let THREE = o_self._THREE;

            // merge all geometries in the group into one for export
            let a_o_geometry = [];
            o_self._o_group.traverse(function (o_child) {
                if (o_child.isMesh) {
                    let o_geom = o_child.geometry.clone();
                    o_geom.applyMatrix4(o_child.matrixWorld);
                    if (o_geom.index) {
                        o_geom = o_geom.toNonIndexed();
                    }
                    a_o_geometry.push(o_geom);
                }
            });

            // count total triangles
            let n_cnt__triangle = 0;
            for (let o_geom of a_o_geometry) {
                n_cnt__triangle += o_geom.attributes.position.count / 3;
            }

            // binary STL: 80 byte header + 4 byte triangle count + 50 bytes per triangle
            let n_len = 80 + 4 + n_cnt__triangle * 50;
            let o_buffer = new ArrayBuffer(n_len);
            let o_view = new DataView(o_buffer);

            // header (80 bytes, zeroed)
            let n_off = 80;
            o_view.setUint32(n_off, n_cnt__triangle, true);
            n_off += 4;

            let o_va = new THREE.Vector3();
            let o_vb = new THREE.Vector3();
            let o_vc = new THREE.Vector3();
            let o_cb = new THREE.Vector3();
            let o_ab = new THREE.Vector3();

            for (let o_geom of a_o_geometry) {
                let o_pos = o_geom.attributes.position;
                for (let n_idx = 0; n_idx < o_pos.count; n_idx += 3) {
                    o_va.fromBufferAttribute(o_pos, n_idx);
                    o_vb.fromBufferAttribute(o_pos, n_idx + 1);
                    o_vc.fromBufferAttribute(o_pos, n_idx + 2);

                    // compute face normal
                    o_cb.subVectors(o_vc, o_vb);
                    o_ab.subVectors(o_va, o_vb);
                    o_cb.cross(o_ab).normalize();

                    // normal
                    o_view.setFloat32(n_off, o_cb.x, true); n_off += 4;
                    o_view.setFloat32(n_off, o_cb.y, true); n_off += 4;
                    o_view.setFloat32(n_off, o_cb.z, true); n_off += 4;
                    // vertex 1
                    o_view.setFloat32(n_off, o_va.x, true); n_off += 4;
                    o_view.setFloat32(n_off, o_va.y, true); n_off += 4;
                    o_view.setFloat32(n_off, o_va.z, true); n_off += 4;
                    // vertex 2
                    o_view.setFloat32(n_off, o_vb.x, true); n_off += 4;
                    o_view.setFloat32(n_off, o_vb.y, true); n_off += 4;
                    o_view.setFloat32(n_off, o_vb.z, true); n_off += 4;
                    // vertex 3
                    o_view.setFloat32(n_off, o_vc.x, true); n_off += 4;
                    o_view.setFloat32(n_off, o_vc.y, true); n_off += 4;
                    o_view.setFloat32(n_off, o_vc.z, true); n_off += 4;
                    // attribute byte count
                    o_view.setUint16(n_off, 0, true); n_off += 2;
                }
                o_geom.dispose();
            }

            let o_blob = new Blob([o_buffer], { type: 'application/octet-stream' });
            let s_url = URL.createObjectURL(o_blob);
            let el_a = document.createElement('a');
            el_a.href = s_url;
            el_a.download = 'bw_to_3d_' + o_self.s_type__geometry + '.stl';
            el_a.click();
            URL.revokeObjectURL(s_url);
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

        // build a single watertight solid from a displaced plane:
        // top face (displaced surface) + bottom face (flat or chamfered) + 4 side walls
        f_o_geometry__solid_plane: function (o_geom__top, n_thickness, n_deg__chamfer) {
            let o_self = this;
            let THREE = o_self._THREE;
            let o_pos__top = o_geom__top.attributes.position;
            let o_idx__top = o_geom__top.index;
            let n_cnt__vertex = o_pos__top.count;

            // find grid dimensions from the geometry
            // PlaneGeometry with (w_seg, h_seg) has (w_seg+1) * (h_seg+1) vertices
            // arranged row by row. We need n_col (w_seg+1).
            // Detect n_col: first row shares same Y value
            let n_y_first = o_pos__top.getY(0);
            let n_col = 1;
            while (n_col < n_cnt__vertex && o_pos__top.getY(n_col) === n_y_first) {
                n_col++;
            }
            let n_row = n_cnt__vertex / n_col;

            // find z_min across all displaced vertices
            let n_z_min = Infinity;
            for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
                let n_z = o_pos__top.getZ(n_idx);
                if (n_z < n_z_min) n_z_min = n_z;
            }
            let n_z_bottom = n_z_min - n_thickness;

            // build arrays: top vertices + bottom vertices (same XY, flat Z)
            // then: top face triangles, bottom face triangles, 4 side wall strips
            let a_n__pos = [];
            let a_n__idx = [];

            // --- top vertices: 0 .. n_cnt__vertex-1 ---
            for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
                a_n__pos.push(o_pos__top.getX(n_idx), o_pos__top.getY(n_idx), o_pos__top.getZ(n_idx));
            }

            // --- bottom vertices: n_cnt__vertex .. 2*n_cnt__vertex-1 ---
            // chamfer: small angled strip at y_min edge for vertical printing
            let n_y_min = Infinity;
            let n_y_max = -Infinity;
            for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
                let n_y = o_pos__top.getY(n_idx);
                if (n_y < n_y_min) n_y_min = n_y;
                if (n_y > n_y_max) n_y_max = n_y;
            }
            let n_rad__chamfer = (n_deg__chamfer || 0) * Math.PI / 180;
            // chamfer height = baseplate thickness, depth derived from angle
            let n_chamfer_height = n_thickness;
            let n_chamfer_depth = (n_rad__chamfer > 0) ? n_chamfer_height / Math.tan(n_rad__chamfer) : 0;

            for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
                let n_y = o_pos__top.getY(n_idx);
                let n_z = n_z_bottom;
                if (n_chamfer_depth > 0) {
                    // distance from y_min edge
                    let n_dist = n_y - n_y_min;
                    if (n_dist < n_chamfer_depth) {
                        // linear ramp: full rise at y_min, zero at y_min + depth
                        n_z = n_z_bottom + n_chamfer_height * (1 - n_dist / n_chamfer_depth);
                    }
                }
                a_n__pos.push(o_pos__top.getX(n_idx), n_y, n_z);
            }

            // --- top face triangles (same winding as original) ---
            if (o_idx__top) {
                for (let n_idx = 0; n_idx < o_idx__top.count; n_idx++) {
                    a_n__idx.push(o_idx__top.getX(n_idx));
                }
            } else {
                for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
                    a_n__idx.push(n_idx);
                }
            }

            // --- bottom face triangles (reversed winding, offset by n_cnt__vertex) ---
            if (o_idx__top) {
                for (let n_idx = 0; n_idx < o_idx__top.count; n_idx += 3) {
                    a_n__idx.push(
                        o_idx__top.getX(n_idx) + n_cnt__vertex,
                        o_idx__top.getX(n_idx + 2) + n_cnt__vertex,
                        o_idx__top.getX(n_idx + 1) + n_cnt__vertex
                    );
                }
            }

            // --- side walls ---
            // each side wall connects a perimeter edge on top to the same edge on bottom
            // 4 edges: top row, bottom row, left column, right column

            // helper: add a quad as 2 triangles between top edge vertex and bottom edge vertex
            let f_add_wall_quad = function (n_a_top, n_b_top) {
                let n_a_bot = n_a_top + n_cnt__vertex;
                let n_b_bot = n_b_top + n_cnt__vertex;
                // two triangles forming the quad
                a_n__idx.push(n_a_top, n_b_top, n_b_bot);
                a_n__idx.push(n_a_top, n_b_bot, n_a_bot);
            };

            // top edge (row 0): vertices 0..n_col-1, normal faces -Y
            for (let n_idx = 0; n_idx < n_col - 1; n_idx++) {
                f_add_wall_quad(n_idx + 1, n_idx);
            }

            // bottom edge (last row): vertices (n_row-1)*n_col .. n_row*n_col-1, normal faces +Y
            let n_off__last_row = (n_row - 1) * n_col;
            for (let n_idx = 0; n_idx < n_col - 1; n_idx++) {
                f_add_wall_quad(n_off__last_row + n_idx, n_off__last_row + n_idx + 1);
            }

            // left edge (col 0): vertices 0, n_col, 2*n_col, ..., normal faces -X
            for (let n_idx = 0; n_idx < n_row - 1; n_idx++) {
                f_add_wall_quad(n_idx * n_col, (n_idx + 1) * n_col);
            }

            // right edge (last col): vertices n_col-1, 2*n_col-1, ..., normal faces +X
            for (let n_idx = 0; n_idx < n_row - 1; n_idx++) {
                f_add_wall_quad((n_idx + 1) * n_col + n_col - 1, n_idx * n_col + n_col - 1);
            }

            let o_geom = new THREE.BufferGeometry();
            o_geom.setAttribute('position', new THREE.Float32BufferAttribute(a_n__pos, 3));
            o_geom.setIndex(a_n__idx);

            return o_geom;
        },

        f_apply_vertex_color: function (o_geometry, s_type) {
            let o_self = this;
            let THREE = o_self._THREE;
            let o_pos = o_geometry.attributes.position;
            let n_cnt = o_pos.count;

            // determine height axis per geometry type
            // sphere/cylinder: radial distance from center
            // plane: z value
            let a_n__height = new Float32Array(n_cnt);
            let n_min = Infinity;
            let n_max = -Infinity;

            for (let n_idx = 0; n_idx < n_cnt; n_idx++) {
                let n_h;
                if (s_type === 'plane') {
                    n_h = o_pos.getZ(n_idx);
                } else if (s_type === 'sphere') {
                    let n_x = o_pos.getX(n_idx);
                    let n_y = o_pos.getY(n_idx);
                    let n_z = o_pos.getZ(n_idx);
                    n_h = Math.sqrt(n_x * n_x + n_y * n_y + n_z * n_z);
                } else if (s_type === 'cylinder') {
                    let n_x = o_pos.getX(n_idx);
                    let n_z = o_pos.getZ(n_idx);
                    n_h = Math.sqrt(n_x * n_x + n_z * n_z);
                }
                a_n__height[n_idx] = n_h;
                if (n_h < n_min) n_min = n_h;
                if (n_h > n_max) n_max = n_h;
            }

            let n_range = n_max - n_min;
            if (n_range === 0) n_range = 1;

            // blue (low) → green (mid) → red (high)
            let a_n__color = new Float32Array(n_cnt * 3);
            for (let n_idx = 0; n_idx < n_cnt; n_idx++) {
                let n_t = (a_n__height[n_idx] - n_min) / n_range;
                let n_r, n_g, n_b;
                if (n_t < 0.5) {
                    // blue to green
                    let n_t2 = n_t * 2;
                    n_r = 0;
                    n_g = n_t2;
                    n_b = 1 - n_t2;
                } else {
                    // green to red
                    let n_t2 = (n_t - 0.5) * 2;
                    n_r = n_t2;
                    n_g = 1 - n_t2;
                    n_b = 0;
                }
                a_n__color[n_idx * 3] = n_r;
                a_n__color[n_idx * 3 + 1] = n_g;
                a_n__color[n_idx * 3 + 2] = n_b;
            }

            o_geometry.setAttribute('color', new THREE.BufferAttribute(a_n__color, 3));
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
        if (this._o_group) {
            this._o_group.traverse(function (o_child) {
                if (o_child.geometry) o_child.geometry.dispose();
                if (o_child.material) o_child.material.dispose();
            });
        }
    },
};

export { o_component__bw_image_to_3d };
