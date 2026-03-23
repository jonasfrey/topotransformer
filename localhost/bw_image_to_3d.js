// Copyright (C) 2026 Jonas Immanuel Frey - Licensed under GPLv2. See LICENSE file for details

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── state ──
let o_state = {
    a_n__image_data: null,    // grayscale pixel data (flat Uint8Array)
    n_scl_x__image: 0,        // image width
    n_scl_y__image: 0,        // image height
    n_factor: 1,
    s_type__geometry: 'sphere',
    n_max_resolution: 256,
    o_mesh: null,
};

// ── three.js setup ──
let o_renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas__three'),
    antialias: true,
});
o_renderer.setPixelRatio(window.devicePixelRatio);
o_renderer.setSize(window.innerWidth, window.innerHeight);

let o_scene = new THREE.Scene();
o_scene.background = new THREE.Color(0x0a0a12);

let o_camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
o_camera.position.set(0, 0, 3);

let o_control = new OrbitControls(o_camera, o_renderer.domElement);
o_control.enableDamping = true;
o_control.dampingFactor = 0.08;
o_control.autoRotate = true;
o_control.autoRotateSpeed = 1;

let o_light__ambient = new THREE.AmbientLight(0xffffff, 0.4);
o_scene.add(o_light__ambient);

let o_light__directional = new THREE.DirectionalLight(0xffffff, 0.8);
o_light__directional.position.set(5, 5, 5);
o_scene.add(o_light__directional);

// ── resize ──
window.addEventListener('resize', function () {
    o_camera.aspect = window.innerWidth / window.innerHeight;
    o_camera.updateProjectionMatrix();
    o_renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── render loop ──
let f_animate = function () {
    requestAnimationFrame(f_animate);
    o_control.update();
    o_renderer.render(o_scene, o_camera);
};
f_animate();

// ── overlay system ──
let a_el__overlay = document.querySelectorAll('.overlay');
let a_el__toolbar_btn = document.querySelectorAll('.toolbar__btn');

// toggle overlays via toolbar
for (let el_btn of a_el__toolbar_btn) {
    el_btn.addEventListener('click', function () {
        let s_id = el_btn.dataset.overlay;
        let el_overlay = document.getElementById(s_id);
        let b_visible = el_overlay.classList.toggle('visible');
        el_btn.classList.toggle('active', b_visible);
    });
}

// close button
for (let el_overlay of a_el__overlay) {
    let el_close = el_overlay.querySelector('.overlay__close');
    if (el_close) {
        el_close.addEventListener('click', function () {
            el_overlay.classList.remove('visible');
            let el_btn = document.querySelector(`.toolbar__btn[data-overlay="${el_overlay.id}"]`);
            if (el_btn) el_btn.classList.remove('active');
        });
    }
}

// drag overlays
let f_make_draggable = function (el_overlay) {
    let el_header = el_overlay.querySelector('.overlay__header');
    let n_off_x = 0;
    let n_off_y = 0;
    let b_dragging = false;

    el_header.addEventListener('pointerdown', function (o_evt) {
        b_dragging = true;
        n_off_x = o_evt.clientX - el_overlay.offsetLeft;
        n_off_y = o_evt.clientY - el_overlay.offsetTop;
        el_header.setPointerCapture(o_evt.pointerId);
    });

    el_header.addEventListener('pointermove', function (o_evt) {
        if (!b_dragging) return;
        let n_x = o_evt.clientX - n_off_x;
        let n_y = o_evt.clientY - n_off_y;
        // clamp to viewport
        n_x = Math.max(0, Math.min(n_x, window.innerWidth - 100));
        n_y = Math.max(0, Math.min(n_y, window.innerHeight - 40));
        el_overlay.style.left = n_x + 'px';
        el_overlay.style.top = n_y + 'px';
    });

    el_header.addEventListener('pointerup', function () {
        b_dragging = false;
    });
};

for (let el_overlay of a_el__overlay) {
    f_make_draggable(el_overlay);
}

// open all overlays by default
for (let el_overlay of a_el__overlay) {
    el_overlay.classList.add('visible');
}
for (let el_btn of a_el__toolbar_btn) {
    el_btn.classList.add('active');
}

// ── image loading ──
let el_canvas__preview = document.getElementById('canvas__preview');
let o_ctx__preview = el_canvas__preview.getContext('2d');

let f_load_image = function (o_image) {
    let n_scl_x = o_image.width;
    let n_scl_y = o_image.height;

    // downsample if exceeds max resolution
    let n_max = o_state.n_max_resolution;
    if (n_scl_x > n_max || n_scl_y > n_max) {
        let n_ratio = Math.min(n_max / n_scl_x, n_max / n_scl_y);
        n_scl_x = Math.floor(n_scl_x * n_ratio);
        n_scl_y = Math.floor(n_scl_y * n_ratio);
    }

    // draw to offscreen canvas at target resolution
    let el_canvas__offscreen = document.createElement('canvas');
    el_canvas__offscreen.width = n_scl_x;
    el_canvas__offscreen.height = n_scl_y;
    let o_ctx = el_canvas__offscreen.getContext('2d');
    o_ctx.drawImage(o_image, 0, 0, n_scl_x, n_scl_y);

    let o_imagedata = o_ctx.getImageData(0, 0, n_scl_x, n_scl_y);
    let a_n__rgba = o_imagedata.data;

    // convert to grayscale
    let a_n__gray = new Uint8Array(n_scl_x * n_scl_y);
    for (let n_idx = 0; n_idx < a_n__gray.length; n_idx++) {
        let n_off = n_idx * 4;
        // luminance formula
        a_n__gray[n_idx] = Math.round(
            a_n__rgba[n_off] * 0.299 +
            a_n__rgba[n_off + 1] * 0.587 +
            a_n__rgba[n_off + 2] * 0.114
        );
    }

    // write grayscale back for preview
    for (let n_idx = 0; n_idx < a_n__gray.length; n_idx++) {
        let n_off = n_idx * 4;
        let n_val = a_n__gray[n_idx];
        a_n__rgba[n_off] = n_val;
        a_n__rgba[n_off + 1] = n_val;
        a_n__rgba[n_off + 2] = n_val;
        a_n__rgba[n_off + 3] = 255;
    }
    o_ctx.putImageData(o_imagedata, 0, 0);

    // show preview
    el_canvas__preview.width = n_scl_x;
    el_canvas__preview.height = n_scl_y;
    o_ctx__preview.drawImage(el_canvas__offscreen, 0, 0);

    o_state.a_n__image_data = a_n__gray;
    o_state.n_scl_x__image = n_scl_x;
    o_state.n_scl_y__image = n_scl_y;

    document.getElementById('text__resolution').textContent =
        `${o_image.width}x${o_image.height} → ${n_scl_x}x${n_scl_y} (grayscale)`;
};

// file input
document.getElementById('input__file').addEventListener('change', function (o_evt) {
    let o_file = o_evt.target.files[0];
    if (!o_file) return;
    let o_reader = new FileReader();
    o_reader.onload = function (o_evt_load) {
        let o_image = new Image();
        o_image.onload = function () { f_load_image(o_image); };
        o_image.src = o_evt_load.target.result;
    };
    o_reader.readAsDataURL(o_file);
});

// url input
document.getElementById('btn__load_url').addEventListener('click', function () {
    let s_url = document.getElementById('input__url').value.trim();
    if (!s_url) return;
    let o_image = new Image();
    o_image.crossOrigin = 'anonymous';
    o_image.onload = function () { f_load_image(o_image); };
    o_image.onerror = function () {
        document.getElementById('text__resolution').textContent = 'Failed to load image from URL';
    };
    o_image.src = s_url;
});

// ── 3D generation ──
let f_generate_mesh = function () {
    if (!o_state.a_n__image_data) return;

    // remove old mesh
    if (o_state.o_mesh) {
        o_scene.remove(o_state.o_mesh);
        o_state.o_mesh.geometry.dispose();
        o_state.o_mesh.material.dispose();
        o_state.o_mesh = null;
    }

    let n_scl_x = o_state.n_scl_x__image;
    let n_scl_y = o_state.n_scl_y__image;
    let a_n__data = o_state.a_n__image_data;
    let n_factor = o_state.n_factor;
    let s_type = o_state.s_type__geometry;

    let o_geometry = null;

    if (s_type === 'sphere') {
        o_geometry = new THREE.SphereGeometry(1, n_scl_x - 1, n_scl_y - 1);
    } else if (s_type === 'cylinder') {
        o_geometry = new THREE.CylinderGeometry(1, 1, 2, n_scl_x - 1, n_scl_y - 1, true);
    } else if (s_type === 'plane') {
        o_geometry = new THREE.PlaneGeometry(2, 2, n_scl_x - 1, n_scl_y - 1);
    }

    f_apply_displacement(o_geometry, a_n__data, n_scl_x, n_scl_y, n_factor, s_type);

    o_geometry.computeVertexNormals();

    let el_color = document.getElementById('input__color_mesh');
    let b_wireframe = document.getElementById('checkbox__wireframe').checked;

    let o_material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(el_color.value),
        wireframe: b_wireframe,
        side: THREE.DoubleSide,
        flatShading: true,
    });

    let o_mesh = new THREE.Mesh(o_geometry, o_material);
    o_scene.add(o_mesh);
    o_state.o_mesh = o_mesh;
};

let f_apply_displacement = function (o_geometry, a_n__data, n_scl_x, n_scl_y, n_factor, s_type) {
    let o_pos = o_geometry.attributes.position;
    let n_cnt__vertex = o_pos.count;

    // geometry vertex grid dimensions
    let n_col = n_scl_x; // widthSegments + 1
    let n_row = n_scl_y; // heightSegments + 1

    let o_vec = new THREE.Vector3();

    for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
        // map vertex index to pixel
        let n_idx_row = Math.floor(n_idx / n_col);
        let n_idx_col = n_idx % n_col;

        // clamp in case vertex count doesn't match exactly
        n_idx_row = Math.min(n_idx_row, n_scl_y - 1);
        n_idx_col = Math.min(n_idx_col, n_scl_x - 1);

        let n_idx__pixel = n_idx_row * n_scl_x + n_idx_col;
        let n_val = (n_idx__pixel < a_n__data.length) ? a_n__data[n_idx__pixel] : 127;

        // normalized offset: 0 at 127, -1 at 0, +1 at 255 (approximately)
        let n_offset = ((n_val - 127) / 128) * n_factor;

        o_vec.set(
            o_pos.getX(n_idx),
            o_pos.getY(n_idx),
            o_pos.getZ(n_idx)
        );

        if (s_type === 'sphere') {
            // radial displacement from center
            let n_len = o_vec.length();
            if (n_len > 0) {
                let n_dir_x = o_vec.x / n_len;
                let n_dir_y = o_vec.y / n_len;
                let n_dir_z = o_vec.z / n_len;
                o_pos.setXYZ(n_idx,
                    o_vec.x + n_dir_x * n_offset,
                    o_vec.y + n_dir_y * n_offset,
                    o_vec.z + n_dir_z * n_offset
                );
            }
        } else if (s_type === 'cylinder') {
            // radial displacement in XZ plane
            let n_len_xz = Math.sqrt(o_vec.x * o_vec.x + o_vec.z * o_vec.z);
            if (n_len_xz > 0) {
                let n_dir_x = o_vec.x / n_len_xz;
                let n_dir_z = o_vec.z / n_len_xz;
                o_pos.setXYZ(n_idx,
                    o_vec.x + n_dir_x * n_offset,
                    o_vec.y,
                    o_vec.z + n_dir_z * n_offset
                );
            }
        } else if (s_type === 'plane') {
            // displacement along Z (normal)
            o_pos.setZ(n_idx, o_vec.z + n_offset);
        }
    }

    o_pos.needsUpdate = true;
};

// ── controls binding ──
let el_slider__factor = document.getElementById('slider__factor');
let el_text__factor = document.getElementById('text__factor');
el_slider__factor.addEventListener('input', function () {
    o_state.n_factor = parseFloat(el_slider__factor.value);
    el_text__factor.textContent = o_state.n_factor.toFixed(2);
});

document.getElementById('select__geometry').addEventListener('change', function (o_evt) {
    o_state.s_type__geometry = o_evt.target.value;
});

document.getElementById('input__max_resolution').addEventListener('change', function (o_evt) {
    o_state.n_max_resolution = parseInt(o_evt.target.value, 10);
});

document.getElementById('btn__generate').addEventListener('click', function () {
    f_generate_mesh();
});

// ── scene controls ──
document.getElementById('input__color_bg').addEventListener('input', function (o_evt) {
    o_scene.background = new THREE.Color(o_evt.target.value);
});

document.getElementById('input__color_mesh').addEventListener('input', function (o_evt) {
    if (o_state.o_mesh) {
        o_state.o_mesh.material.color.set(o_evt.target.value);
    }
});

document.getElementById('checkbox__wireframe').addEventListener('change', function (o_evt) {
    if (o_state.o_mesh) {
        o_state.o_mesh.material.wireframe = o_evt.target.checked;
    }
});

let el_slider__ambient = document.getElementById('slider__ambient');
let el_text__ambient = document.getElementById('text__ambient');
el_slider__ambient.addEventListener('input', function () {
    let n_val = parseFloat(el_slider__ambient.value);
    o_light__ambient.intensity = n_val;
    el_text__ambient.textContent = n_val.toFixed(2);
});

let el_slider__directional = document.getElementById('slider__directional');
let el_text__directional = document.getElementById('text__directional');
el_slider__directional.addEventListener('input', function () {
    let n_val = parseFloat(el_slider__directional.value);
    o_light__directional.intensity = n_val;
    el_text__directional.textContent = n_val.toFixed(2);
});

document.getElementById('checkbox__autorotate').addEventListener('change', function (o_evt) {
    o_control.autoRotate = o_evt.target.checked;
});

let el_slider__rotation_speed = document.getElementById('slider__rotation_speed');
let el_text__rotation_speed = document.getElementById('text__rotation_speed');
el_slider__rotation_speed.addEventListener('input', function () {
    let n_val = parseFloat(el_slider__rotation_speed.value);
    o_control.autoRotateSpeed = n_val;
    el_text__rotation_speed.textContent = n_val.toFixed(2);
});
